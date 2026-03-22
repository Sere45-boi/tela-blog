"use client";

import React, { useEffect, useRef } from "react";
import { GsapReveal } from "@/components/GsapReveal";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const GRID_ITEMS = [
  // ROW 1
  { type: "image", src: "/images/girltela.jpg", alt: "Tela Girl" },
  { type: "metric", title: "Total Invoices Sent", value: 8000, suffix: "k", bg: "bg-[#f8f9fa]", textColor: "text-[#1d1d1f]" },
  { type: "image", src: "/images/security.jpg", alt: "Security" },
  { type: "metric", title: "Fast & Reliable Transactions", value: 1600, suffix: "+", bg: "bg-[#a3e635]", textColor: "text-[#093C15]" },
  // ROW 2
  { type: "metric", title: "Smarter Decisions with Tela AI", value: 98, suffix: "%", bg: "bg-[#a3e635]", textColor: "text-[#093C15]" },
  { type: "image", src: "/images/money.jpg", alt: "Money" },
  { type: "metric", title: "Your Money, Your Security", value: 99, suffix: "%", bg: "bg-[#f8f9fa]", textColor: "text-[#1d1d1f]" },
  { type: "image", src: "/images/box.jpg", alt: "Phone Mockup" },
];

export function MobileAppShowcase() {
  return (
    <section className="px-6 md:px-8 max-w-7xl mx-auto mb-32 relative">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {GRID_ITEMS.map((item, idx) => (
          <GsapReveal key={idx} direction="up" delay={idx * 0.05} className="h-full">
            {item.type === "image" ? (
              <div className="relative aspect-square rounded-[2rem] overflow-hidden group">
                <img
                  src={item.src}
                  alt={item.alt}
                  className="w-full h-full object-cover transform transition-transform duration-1000 group-hover:scale-105"
                />
              </div>
            ) : (
              <MetricCard item={item} />
            )}
          </GsapReveal>
        ))}
      </div>
    </section>
  );
}

function MetricCard({ item }: { item: any }) {
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!countRef.current) return;

      const targetValue = item.value >= 1000 && item.suffix === "k" ? item.value / 1000 : item.value;

      gsap.fromTo(
        countRef.current,
        { textContent: "0" },
        {
          textContent: targetValue.toString(),
          duration: 2.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: countRef.current,
            start: "top 90%",
          },
          snap: { textContent: 1 },
          onUpdate: function () {
            if (countRef.current && item.value >= 1000 && item.suffix !== "k") {
              const val = parseInt(countRef.current.textContent || "0");
              countRef.current.textContent = val.toLocaleString();
            }
          },
        }
      );
    });

    return () => ctx.revert();
  }, [item.value, item.suffix]);

  const displayTarget = item.value >= 1000 && item.suffix === "k" ? item.value / 1000 : item.value;

  return (
    <div className={`aspect-square rounded-[2rem] p-8 md:p-10 flex flex-col justify-between ${item.bg}`}>
      <h3 className={`text-[18px] md:text-[22px] font-bold leading-tight font-bricolage tracking-tight ${item.textColor}`}>
        {item.title}
      </h3>
      <div className={`text-[48px] md:text-[64px] font-bold font-bricolage tracking-tighter tabular-nums flex items-baseline ${item.textColor}`}>
        <span ref={countRef}>{displayTarget}</span>
        <span>{item.suffix}</span>
      </div>
    </div>
  );
}
