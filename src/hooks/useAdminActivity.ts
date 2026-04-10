"use client";

import { useCallback } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export function useAdminActivity() {
  const pathname = usePathname();
  const supabase = createClient();

  const logActivity = useCallback(async (action: string, metadata: any = {}) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      await supabase.from("admin_activity_logs").insert({
        user_id: user.id,
        action,
        path: pathname,
        metadata
      });
    } catch (error) {
      console.error("Failed to log activity:", error);
    }
  }, [pathname, supabase]);

  return { logActivity };
}
