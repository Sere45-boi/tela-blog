"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const GsapReveal = ({
  children,
  className = "",
  direction = "up",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "none";
  delay?: number;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!containerRef.current) return;

      const yOffset = direction === "up" ? 20 : direction === "down" ? -20 : 0;
      const xOffset = direction === "left" ? 20 : direction === "right" ? -20 : 0;

      // Content is already visible (opacity:1 in CSS).
      // Animation is a subtle enhancement only — never hides content.
      gsap.from(containerRef.current, {
        y: yOffset,
        x: xOffset,
        duration: 0.8,
        delay: delay,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 90%",
          toggleActions: "play none none none", // play once, never reverse
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [direction, delay]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};
