"use client";

import { useEffect, useRef } from "react";
import { createNotification } from "@/app/actions/notifications";

interface EventLoggerProps {
  type: 'visit' | 'read';
  targetName?: string;
  link?: string;
}

export function EventLogger({ type, targetName, link }: EventLoggerProps) {
  const hasLogged = useRef(false);

  useEffect(() => {
    if (hasLogged.current) return;
    
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
      
      hasLogged.current = true;
    };

    // Small delay to ensure it's a real visit, not just a flicker
    const timer = setTimeout(logEvent, 2000);
    
    return () => clearTimeout(timer);
  }, [type, targetName, link]);

  return null;
}
