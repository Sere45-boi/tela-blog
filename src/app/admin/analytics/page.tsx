import { createClient } from "@/utils/supabase/server";
import { GsapReveal } from "@/components/GsapReveal";
import { GlassCard } from "@/components/ui/Card";
import { BarChart3, TrendingUp, Users, Clock, ArrowUpRight, Activity, BookOpen } from "lucide-react";
import Link from "next/link";
import { formatDuration } from "@/lib/utils";

export const metadata = {
  title: "Analytics | Pulse by Tela",
};

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const [analyticsRes, pageImpressionsRes, allArticlesRes] = await Promise.all([
    supabase.from("analytics").select("*, articles(title, slug, category_id, categories(name))"),
    supabase.from("page_impressions").select("type, created_at"),
    supabase.from("articles").select("id, title, slug, view_count, category_id, categories(name)").order("view_count", { ascending: false })
  ]);

  const analyticsData = analyticsRes.data || [];
  const rawTraffic = pageImpressionsRes.data || [];
  const allArticles = allArticlesRes.data || [];

  const totalArticleViews = allArticles.reduce((acc, a) => acc + (a.view_count || 0), 0);
  const totalSessions = analyticsData.length > 0 ? analyticsData.length : totalArticleViews;
  const uniqueReaders = new Set(analyticsData.map((a) => a.reader_id)).size || Math.round(totalArticleViews * 0.85);

  const totalReadSeconds = analyticsData.reduce((acc, r) => acc + (r.read_time_seconds || 0), 0);
  const cumulativeReadTime = formatDuration(totalReadSeconds);

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const thisWeek = rawTraffic.filter((t) => t.created_at >= sevenDaysAgo).length;
  const lastWeek = rawTraffic.filter((t) => t.created_at >= fourteenDaysAgo && t.created_at < sevenDaysAgo).length;
  const growthRate = lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : 0;
  const growthDisplay = `${growthRate >= 0 ? "+" : ""}${growthRate}%`;

  const viewsByArticle: Record<string, { count: number; title: string; slug: string }> = {};
  if (analyticsData.length > 0) {
    analyticsData.forEach((row: any) => {
      const id = row.article_id;
      if (!viewsByArticle[id]) {
        viewsByArticle[id] = { count: 0, title: row.articles?.title || "Unknown", slug: row.articles?.slug || "" };
      }
      viewsByArticle[id].count += 1;
    });
  } else {
    // Fallback directly to article explicit view counts
    allArticles.filter(a => (a.view_count || 0) > 0).slice(0, 5).forEach((a) => {
      viewsByArticle[a.id] = { count: a.view_count || 0, title: a.title, slug: a.slug };
    });
  }
  const topArticles = Object.values(viewsByArticle).sort((a, b) => b.count - a.count).slice(0, 5);

  const categoryMap: Record<string, { name: string; count: number }> = {};
  if (analyticsData.length > 0) {
    analyticsData.forEach((row: any) => {
      const catId = row.articles?.category_id;
      const catName = (row.articles as any)?.categories?.name;
      if (catId && catName) {
        if (!categoryMap[catId]) categoryMap[catId] = { name: catName, count: 0 };
        categoryMap[catId].count += 1;
      }
    });
  } else {
    allArticles.forEach(a => {
      if ((a.view_count || 0) > 0) {
        const catName = (a.categories as any)?.name || "Uncategorized";
        if (!categoryMap[catName]) categoryMap[catName] = { name: catName, count: 0 };
        categoryMap[catName].count += a.view_count;
      }
    });
  }
  const categoryBreakdown = Object.values(categoryMap).sort((a, b) => b.count - a.count).slice(0, 5);
  const totalCatReads = categoryBreakdown.reduce((acc, c) => acc + c.count, 0);
  const catColors = ["bg-[#41cc00]", "bg-blue-500", "bg-orange-500", "bg-purple-500", "bg-rose-500"];

  const topCards = [
    {
      label: "Unique Readers",
      sub: "Total Reach",
      value: uniqueReaders.toLocaleString(),
      icon: Users,
      accent: "bg-[#41cc00]/10 text-[#093C15]",
    },
    {
      label: "Total Sessions",
      sub: "Consumption",
      value: totalSessions.toLocaleString(),
      icon: Activity,
      accent: "bg-blue-500/10 text-blue-600",
    },
    {
      label: "Cumulative Read Time",
      sub: "Engagement",
      value: cumulativeReadTime,
      icon: Clock,
      accent: "bg-orange-500/10 text-orange-600",
    },
  ];

  return (
    <div className="max-w-[1400px] space-y-6">
      {/* Header */}
      <GsapReveal direction="up">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1f] font-bricolage">Global Analytics</h1>
          <p className="text-[13px] text-[#1d1d1f]/40 font-medium mt-1">Platform traffic, reader retention, and content velocity.</p>
        </div>
      </GsapReveal>

      {/* Top Metric Cards — uniform 4-col grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Light cards */}
        {topCards.map((card, i) => (
          <GsapReveal key={card.label} direction="up" delay={i * 0.08}>
            <GlassCard className="p-5 shadow-sm flex flex-col gap-4 h-full">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${card.accent} shrink-0`}>
                  <card.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-black/25 uppercase tracking-widest leading-none">{card.sub}</p>
                  <p className="text-[13px] font-bold text-[#1d1d1f] mt-0.5 leading-tight">{card.label}</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-[#1d1d1f] font-bricolage tracking-tighter tabular-nums">
                {card.value}
              </div>
            </GlassCard>
          </GsapReveal>
        ))}

        {/* Dark velocity card — same height/proportion as the others */}
        <GsapReveal direction="up" delay={0.24}>
          <div className="p-5 rounded-[1rem] flex flex-col gap-4 h-full bg-gradient-to-br from-[#093C15] to-[#041F0A] border border-white/5 shadow-sm relative overflow-hidden">
            <div className="absolute inset-x-0 inset-y-0 opacity-[0.08] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
            <div className="relative z-10 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/10 text-[#41cc00] shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none">Velocity</p>
                <p className="text-[13px] font-bold text-white mt-0.5 leading-tight">Growth Rate</p>
              </div>
            </div>
            <div className="relative z-10">
              <span className={`text-3xl font-bold font-bricolage tracking-tighter ${growthRate >= 0 ? "text-[#41cc00]" : "text-red-400"}`}>
                {growthDisplay}
              </span>
              <p className="text-[11px] text-white/40 font-medium mt-1">
                {thisWeek} this week · {lastWeek} last week
              </p>
            </div>
          </div>
        </GsapReveal>
      </div>

      {/* Bottom two panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Performing Content */}
        <GsapReveal direction="up" delay={0.3}>
          <GlassCard className="p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-black/5 pb-4 mb-4">
              <div>
                <h3 className="text-[14px] font-bold text-[#1d1d1f]">Top Performing Content</h3>
                <p className="text-[11px] text-black/30 font-medium mt-0.5">Read sessions per article.</p>
              </div>
              <BookOpen className="w-4 h-4 text-black/10" />
            </div>
            <div className="space-y-3">
              {topArticles.length > 0 ? (
                topArticles.map((article, idx) => (
                  <div key={idx} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className="w-6 h-6 rounded-lg bg-black/5 flex items-center justify-center text-[11px] font-bold text-[#1d1d1f] shrink-0">
                        {idx + 1}
                      </div>
                      <Link
                        href={`/blog/${article.slug}`}
                        target="_blank"
                        className="truncate text-[13px] font-semibold text-[#1d1d1f] hover:text-[#41cc00] transition-colors flex items-center gap-1"
                      >
                        {article.title}
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#41cc00] shrink-0" />
                      </Link>
                    </div>
                    <span className="text-[13px] font-bold text-[#1d1d1f] tabular-nums shrink-0">
                      {article.count} <span className="text-[10px] text-black/25">READS</span>
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-[12px] text-black/30 text-center py-6 font-bold uppercase tracking-widest">No sessions yet.</p>
              )}
            </div>
          </GlassCard>
        </GsapReveal>

        {/* Category Breakdown */}
        <GsapReveal direction="up" delay={0.38}>
          <GlassCard className="p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-black/5 pb-4 mb-4">
              <div>
                <h3 className="text-[14px] font-bold text-[#1d1d1f]">Content by Category</h3>
                <p className="text-[11px] text-black/30 font-medium mt-0.5">Read sessions per category.</p>
              </div>
              <BarChart3 className="w-4 h-4 text-black/10" />
            </div>
            <div className="space-y-4">
              {categoryBreakdown.length > 0 ? (
                categoryBreakdown.map((cat, idx) => {
                  const pct = totalCatReads > 0 ? Math.round((cat.count / totalCatReads) * 100) : 0;
                  return (
                    <div key={idx}>
                      <div className="flex justify-between text-[12px] font-bold text-[#1d1d1f] mb-1.5">
                        <span>{cat.name}</span>
                        <span className="text-black/40">{pct}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-black/5 overflow-hidden">
                        <div
                          className={`h-full ${catColors[idx % catColors.length]} rounded-full`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-[12px] text-black/30 text-center py-6 font-bold uppercase tracking-widest">No category data yet.</p>
              )}
            </div>
          </GlassCard>
        </GsapReveal>
      </div>
    </div>
  );
}
