"use client";

import { useEffect } from "react";
import Intercom from "@intercom/messenger-js-sdk";

export function IntercomClient() {
  useEffect(() => {
    const initIntercom = () => {
      Intercom({
        app_id: "dgbmvjoz",
      });
    };

    // Load after 5s or on first interaction to improve TBT
    const timeoutId = setTimeout(initIntercom, 5000);
    
    const handleInteraction = () => {
      clearTimeout(timeoutId);
      initIntercom();
      window.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };

    window.addEventListener('scroll', handleInteraction, { once: true });
    window.addEventListener('mousemove', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  return null;
}
