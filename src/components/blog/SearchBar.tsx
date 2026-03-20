"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (query) {
      params.set("search", query);
    } else {
      params.delete("search");
    }
    router.push(`/?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="max-w-[600px] mx-auto mt-4 relative group">
      <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none transition-colors group-focus-within:text-[#41cc00]">
        <Search className="h-5 w-5 text-[#1d1d1f]/30" />
      </div>
      <input 
        type="text" 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search insights..." 
        className="w-full h-[64px] pl-16 pr-24 bg-white/60 backdrop-blur-2xl shadow-[0_8px_32px_rgb(0,0,0,0.04)] rounded-[2rem] text-[17px] font-medium text-[#1d1d1f] placeholder:text-[#1d1d1f]/30 focus:outline-none focus:ring-4 focus:ring-[#41cc00]/10 transition-all border border-white/40 group-hover:bg-white/80"
      />
      <button 
        type="submit"
        className="absolute right-2.5 top-2.5 bottom-2.5 px-6 bg-[#093C15] hover:bg-[#06290e] text-white rounded-full transition-all flex items-center gap-2 font-bold text-sm shadow-lg shadow-[#093C15]/10 active:scale-95"
      >
        <Search className="h-4 w-4" />
        <span>Search</span>
      </button>
    </form>
  );
}
