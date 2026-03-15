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

      const yOffset = direction === "up" ? 40 : direction === "down" ? -40 : 0;
      const xOffset = direction === "left" ? 40 : direction === "right" ? -40 : 0;

      gsap.fromTo(
        containerRef.current,
        {
          opacity: 0,
          y: yOffset,
          x: xOffset,
        },
        {
          opacity: 1,
          y: 0,
          x: 0,
          duration: 1.2,
          delay: delay,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [direction, delay]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};
