"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { ExternalLink } from "lucide-react";

interface Ad {
  id: string;
  title: string;
  description: string;
  image_url: string;
  link_url: string;
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
        .single();
      
      if (data) {
        setAd(data);
        // Track impression
        supabase.rpc('increment_ad_impression', { ad_uuid: data.id }).then();
        // Log event
        supabase.from('ad_events').insert({ ad_id: data.id, event_type: 'impression' }).then();
      }
    }
    loadAd();
  }, [position, supabase]);

  const handleClick = async () => {
    if (!ad) return;
    // Track click
    await supabase.rpc('increment_ad_click', { ad_uuid: ad.id });
    await supabase.from('ad_events').insert({ ad_id: ad.id, event_type: 'click' });
  };

  if (!ad) return null;

  return (
    <div className="w-full my-12 group">
      <a 
        href={ad.link_url} 
        target="_blank" 
        rel="noopener noreferrer" 
        onClick={handleClick}
        className="block relative overflow-hidden rounded-[2rem] border border-[#41cc00]/20 bg-gradient-to-br from-[#f0fbf0] to-white shadow-sm hover:shadow-xl transition-all duration-500"
      >
        <div className="flex flex-col md:flex-row items-center gap-8 p-8 md:p-10">
          <div className="w-full md:w-[300px] aspect-video md:aspect-square rounded-2xl overflow-hidden shadow-lg border border-black/5">
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
            <p className="text-[#1d1d1f]/60 text-[16px] font-medium mb-6 line-clamp-2 md:line-clamp-none">
              {ad.description}
            </p>
            <div className="flex items-center justify-center md:justify-start gap-2 text-[#093C15] font-bold group-hover:gap-3 transition-all underline decoration-[#41cc00]/30 underline-offset-8">
              Learn More <ExternalLink className="w-4 h-4" />
            </div>
          </div>
        </div>
        {/* Subtle noise overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('/noise.png')]" />
      </a>
    </div>
  );
}
