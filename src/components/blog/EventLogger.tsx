"use client";

import { useEffect, useRef } from "react";
import { createNotification } from "@/app/actions/notifications";
import { recordReadTime } from "@/app/actions/analytics";

interface EventLoggerProps {
  type: 'visit' | 'read';
  targetName?: string;
  link?: string;
  articleId?: string;
}

export function EventLogger({ type, targetName, link, articleId }: EventLoggerProps) {
  const hasLoggedEvent = useRef(false);
  const startTime = useRef<number>(Date.now());
  const accumulatedTime = useRef<number>(0);

  useEffect(() => {
    // 1. Initial Event Logging (Visit/Read starts)
    if (!hasLoggedEvent.current) {
        const logEvent = async () => {
          let message = "";
          if (type === 'visit') {
            message = "New visitor arrived on the landing page";
          } else if (type === 'read') {
            message = `Someone is reading: ${targetName || 'an article'}`;
          }
    
          await createNotification({
            type,
            message,
            link
          });
          
          hasLoggedEvent.current = true;
        };
    
        // Small delay to ensure it's a real visit, not just a flicker
        const timer = setTimeout(logEvent, 2000);
        return () => clearTimeout(timer);
    }
  }, [type, targetName, link]);

  useEffect(() => {
    // 2. Read Time Accumulation (only for 'read' type)
    if (type !== 'read' || !articleId) return;

    // Reset start time on mount
    startTime.current = Date.now();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        accumulatedTime.current += Math.floor((Date.now() - startTime.current) / 1000);
      } else {
        startTime.current = Date.now();
      }
    };

    const flushAnalytics = async () => {
      const finalTime = accumulatedTime.current + Math.floor((Date.now() - startTime.current) / 1000);
      if (finalTime > 3) { // Only log if they spent more than 3 seconds
        await recordReadTime({
          articleId,
          readTimeSeconds: finalTime
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Heartbeat to ensure some data is captured even if page is closed
    const heartbeat = setInterval(async () => {
        const currentTime = accumulatedTime.current + Math.floor((Date.now() - startTime.current) / 1000);
        if (currentTime > 30) { // Every 30s of engagement
            await recordReadTime({
                articleId,
                readTimeSeconds: 30
            });
            // Reset counters for next interval
            accumulatedTime.current = 0;
            startTime.current = Date.now();
        }
    }, 30000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(heartbeat);
      flushAnalytics();
    };
  }, [type, articleId]);

  return null;
}
