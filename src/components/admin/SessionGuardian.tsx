"use client";

import { useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { signOut } from "@/app/actions/user";

// Configuration for session security
const IDLE_TIMEOUT = 1000 * 60 * 60; // 1 hour of inactivity
const SESSION_CHECK_KEY = "tela_session_breath";

export function SessionGuardian() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const lastActiveRef = useRef<number>(Date.now());
  const isProtectedRef = useRef<boolean>(false);

  // Check if we are in admin area
  useEffect(() => {
    isProtectedRef.current = pathname.startsWith("/admin");
  }, [pathname]);

  const handleLogout = useCallback(async (reason: string) => {
    try {
      await signOut();
      sessionStorage.removeItem(SESSION_CHECK_KEY);
      router.push("/login");
      router.refresh();
      toast.info(`Session expired: ${reason}`);
    } catch (error) {
      console.error("Logout failed", error);
    }
  }, [router]);

  // Activity tracking
  useEffect(() => {
    if (!isProtectedRef.current) return;

    const updateActivity = () => {
      lastActiveRef.current = Date.now();
    };

    const activityEvents = ["mousedown", "keydown", "scroll", "touchstart"];
    activityEvents.forEach((event) => 
      window.addEventListener(event, updateActivity, { passive: true })
    );

    // Periodic inactivity check
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = now - lastActiveRef.current;

      if (diff > IDLE_TIMEOUT && isProtectedRef.current) {
        handleLogout("Inactive for over 1 hour");
      }
    }, 1000 * 60); // Check every minute

    return () => {
      activityEvents.forEach((event) => 
        window.removeEventListener(event, updateActivity)
      );
      clearInterval(interval);
    };
  }, [handleLogout]);

  // Session Breath Check: Detects if the browser has been closed and reopened
  // sessionStorage is cleared when the tab is closed. 
  // If the user returns after a full browser close (even with "start where you left off"),
  // we can detect if the session needs re-validation.
  useEffect(() => {
    if (!isProtectedRef.current) return;

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const hasBreath = sessionStorage.getItem(SESSION_CHECK_KEY);
        
        if (!hasBreath) {
          // This is a new browser "breath" (reopened tab/window)
          // We can choose to force a fresh login for maximum security
          console.log("New session breath detected. Logged out for security.");
          handleLogout("Browser session restarted");
        } else {
          // Mark as active
          sessionStorage.setItem(SESSION_CHECK_KEY, "active");
        }
      }
    };

    checkSession();
  }, [handleLogout, supabase.auth]);

  // Ensure the breath token is set when the user logs in
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        sessionStorage.setItem(SESSION_CHECK_KEY, "active");
      }
      if (event === "SIGNED_OUT") {
        sessionStorage.removeItem(SESSION_CHECK_KEY);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  return null;
}
