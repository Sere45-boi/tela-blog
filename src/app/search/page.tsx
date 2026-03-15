"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { GsapReveal } from "@/components/GsapReveal";
import { Input } from "@/components/ui/Input";
import { SearchIcon, ArrowRight } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

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
    <div className="min-h-screen">
      <Navbar />

      <main className="container mx-auto px-4 md:px-8 py-12 md:py-24 max-w-4xl">
        <GsapReveal direction="up" className="mb-12">
          <div className="relative w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground">
              <SearchIcon className="h-6 w-6" />
            </div>
            <Input
              type="search"
              placeholder="Search articles, insights, and stories..."
              className="pl-14 h-16 text-lg rounded-2xl"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
        </GsapReveal>

        <div className="space-y-6">
          {loading && (
            <p className="text-muted-foreground animate-pulse text-sm">Searching...</p>
          )}

          {!loading && query && results.length === 0 && (
            <p className="text-muted-foreground">No results found for "{query}"</p>
          )}

          {!loading && results.map((article: any, i: number) => (
            <GsapReveal key={article.id} direction="up" delay={i * 0.05}>
              <Link 
                href={`/blog/${article.slug}`} 
                className="group block p-6 rounded-2xl border border-border/40 hover:border-border transition-colors bg-muted/20"
              >
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                  <span className="font-medium text-foreground">{(article.categories as any)?.name}</span>
                  <span>•</span>
                  <span>{new Date(article.published_at!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <h3 className="text-xl font-medium mb-2 group-hover:text-accent transition-colors">
                  {article.title}
                </h3>
                <p className="text-muted-foreground line-clamp-2 text-sm max-w-3xl flex-1 mb-4">
                  {article.excerpt}
                </p>
                <div className="flex items-center font-medium text-xs">
                  Read article <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </GsapReveal>
          ))}
        </div>
      </main>
    </div>
  );
}
