"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { ExternalLink } from "lucide-react";
import { createNotification } from "@/app/actions/notifications";

interface Ad {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  target_url: string;
  shape?: "rectangle" | "square";
}

export function AdSpace({ position }: { position: string }) {
  const [ad, setAd] = useState<Ad | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function loadAd() {
      const { data } = await supabase
        .from("ads")
        .select("*")
        .eq("position", position)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

      if (data) {
        setAd(data);
        supabase.rpc("increment_ad_impression", { ad_uuid: data.id }).then();
        supabase.from("ad_events").insert({ ad_id: data.id, event_type: "impression" }).then();
      }
    }
    loadAd();
  }, [position, supabase]);

  const handleClick = async () => {
    if (!ad) return;
    await supabase.rpc("increment_ad_click", { ad_uuid: ad.id });
    await supabase.from("ad_events").insert({ ad_id: ad.id, event_type: "click" });
    
    // Trigger admin notification
    await createNotification({
      type: "click",
      message: `Ad clicked: ${ad.title}`,
      link: ad.target_url
    });
  };

  if (!ad) return null;

  const isSidebar = position === "sidebar";

  // ── SIDEBAR: vertical card — square image on top, text below ──────────────
  if (isSidebar) {
    return (
      <div className="w-full group">
        <a
          href={ad.target_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="block relative overflow-hidden rounded-2xl border border-[#41cc00]/20 bg-gradient-to-b from-[#f0fbf0] to-white transition-all duration-500"
        >
          {/* Square image with padding for premium look */}
          <div className="w-full p-3">
            <div className="w-full aspect-square overflow-hidden rounded-xl border border-black/5 bg-white">
              <img
                src={ad.image_url}
                alt={ad.title}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>

          {/* Text section below image */}
          <div className="p-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#41cc00]/10 text-[#093C15] text-[9px] font-bold uppercase tracking-widest mb-3">
              Sponsored
            </div>
            <h3 className="text-[15px] font-bold font-bricolage text-[#1d1d1f] leading-snug mb-2">
              {ad.title}
            </h3>
            {ad.description && (
              <p className="text-[12px] text-[#1d1d1f]/50 font-medium leading-relaxed line-clamp-3 mb-3">
                {ad.description}
              </p>
            )}
            <div className="flex items-center gap-1.5 text-[#093C15] text-[12px] font-bold group-hover:gap-2.5 transition-all">
              Learn More <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="absolute inset-x-0 inset-y-0 opacity-[0.04] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
        </a>
      </div>
    );
  }

  // ── DEFAULT: horizontal premium banner — Text Left, Square Image Right ────────
  return (
    <div className="w-full my-16 group relative">
      <a
        href={ad.target_url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="block relative overflow-hidden rounded-[2.5rem] bg-[#E6E0F8] border border-black/5"
      >
        {/* Curved Text Graphic (Inspired by reference) */}
        <div className="absolute top-[-20%] right-[-5%] w-[60%] h-[140%] opacity-[0.4] pointer-events-none z-0">
          <svg viewBox="0 0 400 400" className="w-full h-full rotate-[-15deg]">
            <path
              id="curvePath"
              d="M 100,200 A 100,100 0 0,1 300,200"
              fill="transparent"
            />
            <text className="text-[14px] font-bold uppercase tracking-[0.2em] fill-[#635BFF]">
              <textPath href="#curvePath" startOffset="0%">
                {`${ad.title} • Premium Exclusive • ${ad.title} •`}
              </textPath>
            </text>
          </svg>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 p-8 md:p-14 relative z-10">
          {/* Left Side: Content */}
          <div className="flex-1 text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#1d1d1f]/10 bg-white/40 text-[#1d1d1f] text-[11px] font-bold uppercase tracking-widest mb-6 backdrop-blur-sm">
              Sponsored Content
            </div>
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold font-bricolage text-[#1d1d1f] mb-6 leading-[1.1] tracking-tighter">
              {ad.title}
            </h3>
            {ad.description && (
              <p className="text-[#1d1d1f]/60 text-[16px] md:text-[18px] font-medium mb-10 leading-relaxed max-w-xl">
                {ad.description}
              </p>
            )}
            <div className="flex items-center gap-4">
              <div className="px-8 py-3.5 bg-[#1d1d1f] text-white rounded-full font-bold text-[15px] hover:scale-105 transition-all duration-300 flex items-center gap-2">
                Learn More <ExternalLink className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Right Side: Square Image Container */}
          <div className="w-full md:w-[40%] shrink-0">
            <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-white/50 backdrop-blur-md border border-white/20">
              <img
                src={ad.image_url}
                alt={ad.title}
                className="w-full h-full object-cover transform transition-transform duration-1000 group-hover:scale-105"
              />
            </div>
          </div>
        </div>

        {/* Subtle texture/noise */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
      </a>
    </div>
  );
}
