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
          className="block relative overflow-hidden rounded-2xl border border-[#41cc00]/20 bg-gradient-to-b from-[#f0fbf0] to-white shadow-sm hover:shadow-lg transition-all duration-500"
        >
          {/* Square image with padding for premium look */}
          <div className="w-full p-3">
            <div className="w-full aspect-video overflow-hidden rounded-xl shadow-sm border border-black/5 bg-white">
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

  // ── DEFAULT: horizontal card — Image Right, Text Left ─────────────────────
  return (
    <div className="w-full my-16 group relative">
      <a
        href={ad.target_url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="block relative overflow-hidden rounded-[2.5rem] border border-[#a294f9]/20 bg-[#f0e8ff]"
      >
        {/* Wavy Text Background Layer - Exact S-Curve inspired by reference */}
        <div className="absolute inset-0 z-0 opacity-[0.12] pointer-events-none overflow-hidden">
          <svg viewBox="0 0 800 250" className="w-full h-full preserve-3d" preserveAspectRatio="none">
            <path
              id="adWavePathExact"
              d="M-100,200 C100,300 300,-100 500,200 C700,500 900,0 1100,200"
              fill="transparent"
              stroke="transparent"
            />
            <text className="text-[18px] font-bold uppercase tracking-[0.3em] fill-[#635BFF]">
              <textPath href="#adWavePathExact" startOffset="0%">
                {`${ad.title} • ${ad.title} • ${ad.title} • ${ad.title} • ${ad.title}`}
                <animate
                  attributeName="startOffset"
                  from="0%"
                  to="-25%"
                  dur="25s"
                  repeatCount="indefinite"
                />
              </textPath>
            </text>
          </svg>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-10 p-10 md:p-16 relative z-10">
          {/* Left Side: Content */}
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#635BFF]/30 text-[#635BFF] text-[11px] font-bold uppercase tracking-widest mb-6">
              Sponsored
            </div>
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold font-bricolage text-[#1d1d1f] mb-6 leading-[1.05] tracking-tighter">
              {ad.title}
            </h3>
            {ad.description && (
              <p className="text-[#1d1d1f]/70 text-[18px] md:text-[20px] font-medium mb-8 leading-relaxed max-w-xl font-poppins">
                {ad.description}
              </p>
            )}
            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="px-8 py-4 bg-[#635BFF] text-white rounded-full font-bold text-[16px] hover:scale-105 transition-transform duration-300 shadow-xl shadow-[#635BFF]/20 flex items-center gap-2">
                Learn More <ExternalLink className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Right Side: Horizontal Image Frame */}
          <div className="w-full md:w-[48%] shrink-0">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-[6px] border-white/50 aspect-video bg-white">
              <img
                src={ad.image_url}
                alt={ad.title}
                className="w-full h-full object-contain transform transition-transform duration-1000 group-hover:scale-105"
              />
            </div>
          </div>
        </div>

        {/* Subtle Noise for texture */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
      </a>
    </div>
  );
}
