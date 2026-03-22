"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    let requestRef: number;

    function raf(time: number) {
      lenis.raf(time);
      requestRef = requestAnimationFrame(raf);
    }

    requestRef = requestAnimationFrame(raf);

    return () => {
      if (requestRef) cancelAnimationFrame(requestRef);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
