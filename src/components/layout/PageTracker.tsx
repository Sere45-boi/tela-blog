"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export function PageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    // Avoid tracking admin paths to prevent feedback loops in intelligence logs
    if (pathname.startsWith("/admin") || pathname.startsWith("/login")) return;

    const trackImpression = async () => {
      const currentPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
      
      // Prevent redundant tracking of the same path in the same session mount
      if (lastTrackedPath.current === currentPath) return;
      lastTrackedPath.current = currentPath;

      try {
        let type = "other";
        if (pathname === "/") type = "visit";
        else if (pathname.startsWith("/blog/")) type = "read";

        await supabase.from("page_impressions").insert({
          path: pathname,
          type,
          // Extract source from UTM if available, else direct
          source: searchParams.get("utm_source") || "direct",
          referrer: typeof document !== 'undefined' ? document.referrer : null,
        });
      } catch (error) {
        console.error("Intelligence tracking failed:", error);
      }
    };

    trackImpression();
  }, [pathname, searchParams, supabase]);

  return null;
}
