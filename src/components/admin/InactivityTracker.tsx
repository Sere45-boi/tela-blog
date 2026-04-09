"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { GsapReveal } from "@/components/GsapReveal";
import { Button } from "@/components/ui/Button";
import { ShieldAlert, Clock, LogOut } from "lucide-react";

const INACTIVITY_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours
const WARNING_THRESHOLD = 5 * 60 * 1000; // 5 minutes

export function InactivityTracker() {
  const [showWarning, setShowWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(WARNING_THRESHOLD / 1000);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    window.location.href = "/login?reason=expired";
  }, [supabase]);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    
    setShowWarning(false);
    
    // Set the main logout timeout
    timeoutRef.current = setTimeout(handleLogout, INACTIVITY_TIMEOUT);

    // Set the warning timeout
    const warningDelay = INACTIVITY_TIMEOUT - WARNING_THRESHOLD;
    setTimeout(() => {
      setShowWarning(true);
      setRemainingSeconds(WARNING_THRESHOLD / 1000);
      
      // Start countdown
      countdownRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(countdownRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, warningDelay);
  }, [handleLogout]);

  useEffect(() => {
    // Events to track user activity
    const events = ["mousedown", "keydown", "scroll", "touchstart", "mousemove"];
    
    const handleActivity = () => {
      if (!showWarning) {
        resetTimer();
      }
    };

    events.forEach((event) => window.addEventListener(event, handleActivity));
    resetTimer();

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [resetTimer, showWarning]);

  if (!showWarning) return null;

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
      <GsapReveal direction="up" className="w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-2xl border border-black/10 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
          {/* Decorative background flare */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#41cc00]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 text-center">
            <div className="w-16 h-16 bg-[#093C15]/5 text-[#093C15] rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>
            
            <h2 className="text-2xl font-bold text-[#1d1d1f] font-bricolage mb-2">Session Expiring</h2>
            <p className="text-[#1d1d1f]/60 font-medium mb-6">
              You've been inactive for a while. For your security, you will be logged out in <span className="text-[#093C15] font-bold">{formatTime(remainingSeconds)}</span>.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="rounded-xl h-12 border-black/5 hover:bg-black/5 text-[#1d1d1f]/60"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
              <Button 
                variant="primary" 
                className="rounded-xl h-12 bg-[#093C15] hover:bg-[#093C15]/90 text-white shadow-lg"
                onClick={resetTimer}
              >
                Stay Logged In
              </Button>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 h-1 bg-[#41cc00]/20 w-full">
            <div 
              className="h-full bg-[#41cc00] transition-all duration-1000 ease-linear"
              style={{ width: `${(remainingSeconds / (WARNING_THRESHOLD / 1000)) * 100}%` }}
            />
          </div>
        </div>
      </GsapReveal>
    </div>
  );
}
