"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { GsapReveal } from "@/components/GsapReveal";
import { Input } from "@/components/ui/Input";
import { SearchIcon, ArrowRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { getCleanExcerpt } from "@/utils/excerpt";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      
      setLoading(true);
      // Simple ilike text search. Can be replaced with pg_search or full text vectors
      const { data } = await supabase
        .from("articles")
        .select("*, categories(name)")
        .eq("status", "published")
        .ilike("title", `%${query}%`)
        .order("published_at", { ascending: false })
        .limit(20);

      setResults(data || []);
      setLoading(false);
    };

    const debounceId = setTimeout(fetchResults, 400);
    return () => clearTimeout(debounceId);
  }, [query, supabase]);

  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      <Navbar />

      <main className="container mx-auto px-4 md:px-8 py-16 md:py-24 pb-32">
        <div className="max-w-3xl mx-auto mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-[#093C15]/70 hover:text-[#093C15] font-semibold text-[14px] transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Back to all stories
          </Link>
        </div>

        <GsapReveal direction="up" className="mb-16 max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-8 text-[#093C15]">
            Search articles
          </h1>
          <div className="relative w-full max-w-2xl mx-auto">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5 text-muted-foreground">
              <SearchIcon className="h-6 w-6 text-[#093C15]/50" />
            </div>
            <Input
              type="search"
              placeholder="Search articles, insights, and stories..."
              className="pl-14 h-16 text-lg rounded-2xl w-full border-border/80 text-[#093C15] focus:border-[#41cc00] focus:ring-[#41cc00] shadow-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
        </GsapReveal>

        <div className="max-w-4xl mx-auto space-y-6">
          {loading && (
            <div className="py-12 text-center text-[#093C15]/50 animate-pulse text-lg font-medium">Searching...</div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="py-24 text-center text-[#093C15]/50 bg-white rounded-3xl border border-dashed border-border">
              No results found for <span className="font-bold">"{query}"</span>
            </div>
          )}

          {!loading && results.length > 0 && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {results.map((article: any, i: number) => (
                 <GsapReveal key={article.id} direction="up" delay={i * 0.05} className="group flex flex-col h-full bg-white rounded-3xl p-4 border border-border shadow-sm hover:shadow-md transition-shadow">
                   <Link href={`/blog/${article.slug}`} className="flex-1 flex flex-col">
                     <div className="px-2 pt-2 flex-1 flex flex-col">
                       <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                         <span className="text-[#093C15]">{(article.categories as any)?.name}</span>
                         <span>•</span>
                         <span>{new Date(article.published_at!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                       </div>
                       <h4 className="text-[18px] font-bold mb-3 group-hover:text-[#41cc00] transition-colors text-[#093C15] line-clamp-2 leading-snug">
                         {article.title}
                       </h4>
                       <p className="text-muted-foreground line-clamp-3 mb-4 flex-1">
                         {getCleanExcerpt(article.content || article.excerpt, 180)}
                       </p>
                       <div className="flex items-center font-bold text-sm text-[#093C15] group-hover:text-[#41cc00] transition-colors mt-2">
                         Read article <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                       </div>
                     </div>
                   </Link>
                 </GsapReveal>
               ))}
             </div>
          )}
        </div>
      </main>

      {/* Subscription Footer Section */}
      <section className="bg-[#093C15] text-white py-24 mt-auto">
        <div className="container mx-auto px-4 md:px-8">
          <GsapReveal direction="up" className="max-w-2xl mx-auto flex flex-col items-center text-center">
             <h2 className="text-3xl md:text-4xl font-semibold mb-6">
               Never miss an update
             </h2>
             <div className="w-full max-w-md space-y-4 flex flex-col items-center mt-8">
               <input 
                 type="email" 
                 placeholder="Enter your email address" 
                 className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/50 h-14 rounded-xl px-5 focus:outline-none focus:ring-2 focus:ring-[#41cc00] transition-all text-sm"
               />
               <button className="w-full h-14 bg-[#41cc00] text-[#093C15] font-bold rounded-xl hover:bg-[#41cc00]/90 transition-colors text-sm">
                 Subscribe Now
               </button>
             </div>
          </GsapReveal>
        </div>
      </section>
    </div>
  );
}
