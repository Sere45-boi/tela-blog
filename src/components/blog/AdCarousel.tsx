"use client";

import { useEffect, useState } from "react";

const MOCK_ADS = [
  {
    id: 1,
    image_url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=600&q=80",
    destination_url: "https://tela.ng",
    title: "Open a Tela Business Account"
  },
  {
    id: 2,
    image_url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=600&q=80",
    destination_url: "https://tela.ng",
    title: "Send money globally with Tela"
  },
  {
    id: 3,
    image_url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80",
    destination_url: "https://tela.ng",
    title: "Virtual USD Cards for Africans"
  }
];

export function AdCarousel() {
  const [currentAd, setCurrentAd] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAd((prev) => (prev + 1) % MOCK_ADS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const ad = MOCK_ADS[currentAd];

  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-black/5 shadow-sm">
      <a href={ad.destination_url} target="_blank" rel="noopener noreferrer" className="block group">
        <div className="aspect-[3/2] w-full overflow-hidden relative">
          <img
            src={ad.image_url}
            alt={ad.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <p className="text-white text-[13px] font-bold">{ad.title}</p>
          </div>
        </div>
      </a>
      {/* Indicator dots */}
      <div className="flex items-center justify-center gap-1.5 py-3 bg-white">
        {MOCK_ADS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentAd(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              i === currentAd ? 'bg-[#093C15] w-4' : 'bg-black/15'
            }`}
          />
        ))}
      </div>
      <div className="px-3 pb-2 text-center">
        <span className="text-[10px] uppercase tracking-wider text-[#1d1d1f]/30 font-bold">Sponsored</span>
      </div>
    </div>
  );
}
