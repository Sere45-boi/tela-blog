"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { ExternalLink } from "lucide-react";

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
            <div className="w-full aspect-square overflow-hidden rounded-xl shadow-sm border border-black/5">
              <img
                src={ad.image_url}
                alt={ad.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
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

          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('/noise.png')]" />
        </a>
      </div>
    );
  }

  // ── DEFAULT: horizontal card — image left, text right ─────────────────────
  return (
    <div className="w-full my-12 group">
      <a
        href={ad.target_url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="block relative overflow-hidden rounded-[2rem] border border-[#41cc00]/20 bg-gradient-to-br from-[#f0fbf0] to-white shadow-sm hover:shadow-xl transition-all duration-500"
      >
        <div className="flex flex-col md:flex-row items-center gap-8 p-8 md:p-10">
          <div className={`w-full ${ad.shape === "square" ? "md:w-48 aspect-square" : "md:w-[300px] aspect-video"} rounded-2xl overflow-hidden shadow-lg border border-black/5 shrink-0`}>
            <img
              src={ad.image_url}
              alt={ad.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#41cc00]/10 text-[#093C15] text-[10px] font-bold uppercase tracking-widest mb-4">
              Sponsored Highlight
            </div>
            <h3 className="text-2xl md:text-3xl font-bold font-bricolage text-[#1d1d1f] mb-4 leading-tight">
              {ad.title}
            </h3>
            {ad.description && (
              <p className="text-[#1d1d1f]/60 text-[16px] font-medium mb-6 line-clamp-2 md:line-clamp-none">
                {ad.description}
              </p>
            )}
            <div className="flex items-center justify-center md:justify-start gap-2 text-[#093C15] font-bold group-hover:gap-3 transition-all underline decoration-[#41cc00]/30 underline-offset-8">
              Learn More <ExternalLink className="w-4 h-4" />
            </div>
          </div>
        </div>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('/noise.png')]" />
      </a>
    </div>
  );
}
