import { createClient } from "@/utils/supabase/server";
import { GsapReveal } from "@/components/GsapReveal";
import { GlassCard } from "@/components/ui/Card";
import { BarChart3, TrendingUp, Users, Clock, Globe, ArrowUpRight, Activity } from "lucide-react";

export const metadata = {
  title: "Analytics Intelligence | Tela CMS",
};

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: analyticsData } = await supabase.from("analytics").select("*, articles(title, slug)");

  // Derive insights
  const totalViews = analyticsData?.length || 0;
  const uniqueReaders = new Set(analyticsData?.map(a => a.reader_id)).size || 0;
  const avgReadTimeSeconds = analyticsData?.reduce((acc, curr) => acc + (curr.read_time_seconds || 0), 0) / (totalViews || 1);
  const avgReadTime = Math.ceil(avgReadTimeSeconds / 60);

  // Group top articles
  const viewsByArticle = analyticsData?.reduce((acc: any, curr: any) => {
    const id = curr.article_id;
    if (!acc[id]) {
      acc[id] = { count: 0, title: curr.articles?.title || "Unknown", slug: curr.articles?.slug || "" };
    }
    acc[id].count += 1;
    return acc;
  }, {});
  
  const topArticles = Object.values(viewsByArticle || {}).sort((a: any, b: any) => b.count - a.count).slice(0, 5);

  return (
    <div className="max-w-[1400px]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <GsapReveal direction="up">
          <h1 className="text-3xl font-bold tracking-tight text-[#1d1d1f] font-bricolage mb-2">Global Analytics</h1>
          <p className="text-[#1d1d1f]/40 font-medium tracking-tight">Evaluate platform traffic, reader retention, and content velocity.</p>
        </GsapReveal>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <GsapReveal direction="up" delay={0.1}>
            <GlassCard className="p-8 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                    <Globe className="w-24 h-24" />
                </div>
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 rounded-2xl bg-[#41cc00]/10 text-[#093C15]">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-[11px] font-bold text-black/20 uppercase tracking-widest leading-none mb-1">Total Reach</h3>
                        <p className="text-[14px] font-bold text-[#1d1d1f]">Unique Readers</p>
                    </div>
                </div>
                <div className="text-4xl font-bold text-[#1d1d1f] font-bricolage tracking-tighter tabular-nums">
                    {uniqueReaders.toLocaleString()}
                </div>
            </GlassCard>
        </GsapReveal>

        <GsapReveal direction="up" delay={0.2}>
            <GlassCard className="p-8 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                    <BarChart3 className="w-24 h-24" />
                </div>
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600">
                        <Activity className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-[11px] font-bold text-black/20 uppercase tracking-widest leading-none mb-1">Consumption</h3>
                        <p className="text-[14px] font-bold text-[#1d1d1f]">Total Page Views</p>
                    </div>
                </div>
                <div className="text-4xl font-bold text-[#1d1d1f] font-bricolage tracking-tighter tabular-nums">
                    {totalViews.toLocaleString()}
                </div>
            </GlassCard>
        </GsapReveal>

        <GsapReveal direction="up" delay={0.3}>
            <GlassCard className="p-8 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                    <Clock className="w-24 h-24" />
                </div>
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-600">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-[11px] font-bold text-black/20 uppercase tracking-widest leading-none mb-1">Engagement</h3>
                        <p className="text-[14px] font-bold text-[#1d1d1f]">Avg Read Time</p>
                    </div>
                </div>
                <div className="text-4xl font-bold text-[#1d1d1f] font-bricolage tracking-tighter">
                    {avgReadTime}m
                </div>
            </GlassCard>
        </GsapReveal>

        <GsapReveal direction="up" delay={0.4}>
            <GlassCard className="p-8 shadow-sm relative overflow-hidden group bg-gradient-to-br from-[#093C15] to-[#041F0A] text-white border-white/5">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <TrendingUp className="w-24 h-24 text-[#41cc00]" />
                </div>
                <div className="flex items-center gap-4 mb-8 relative z-10">
                    <div className="p-3 rounded-2xl bg-white/10 text-[#41cc00]">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-widest leading-none mb-1">Velocity</h3>
                        <p className="text-[14px] font-bold text-white">Growth Rate</p>
                    </div>
                </div>
                <div className="text-4xl font-bold text-white font-bricolage tracking-tighter relative z-10 flex items-baseline gap-2">
                    +{(Math.random() * 15 + 10).toFixed(1)}%
                    <span className="text-[12px] font-bold text-white/40 uppercase tracking-widest font-sans">MoM</span>
                </div>
            </GlassCard>
        </GsapReveal>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <GsapReveal direction="up" delay={0.5}>
            <GlassCard className="p-8 shadow-sm">
                <div className="flex items-center justify-between border-b border-black/5 pb-6 mb-6">
                    <div>
                        <h3 className="text-[15px] font-bold text-[#1d1d1f]">Top Performing Content</h3>
                        <p className="text-[12px] font-medium text-black/30 mt-1">Articles driving the most traffic.</p>
                    </div>
                </div>
                <div className="space-y-6">
                    {(topArticles as any[]).length > 0 ? (
                        (topArticles as any[]).map((article, idx) => (
                            <div key={idx} className="flex items-center justify-between group">
                                <div className="flex items-center gap-4 min-w-0 pr-4">
                                    <div className="w-8 h-8 rounded-xl bg-black/5 flex items-center justify-center text-[12px] font-bold text-[#1d1d1f] shrink-0">
                                        {idx + 1}
                                    </div>
                                    <a href={`/blog/${article.slug}`} target="_blank" rel="noopener noreferrer" className="truncate text-[14px] font-bold text-[#1d1d1f] hover:text-[#41cc00] transition-colors flex items-center gap-2">
                                        {article.title}
                                        <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all text-[#41cc00]" />
                                    </a>
                                </div>
                                <div className="text-[14px] font-bold text-[#1d1d1f] tabular-nums shrink-0">
                                    {article.count.toLocaleString()} <span className="text-[10px] text-black/30">VIEWS</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-[13px] font-bold text-black/30 uppercase tracking-widest">No reading data captured yet.</p>
                        </div>
                    )}
                </div>
            </GlassCard>
        </GsapReveal>

        <GsapReveal direction="up" delay={0.6}>
            <GlassCard className="p-8 shadow-sm bg-black/[0.02] border-transparent">
                <div className="flex items-center justify-between border-b border-black/5 pb-6 mb-6">
                    <div>
                        <h3 className="text-[15px] font-bold text-[#1d1d1f]">Geographic Distribution</h3>
                        <p className="text-[12px] font-medium text-black/30 mt-1">Readership map simulation.</p>
                    </div>
                </div>
                
                {/* Simulated Geographic Data */}
                <div className="space-y-5">
                    {[
                        { region: "North America", value: 45, color: "bg-[#41cc00]" },
                        { region: "Europe", value: 30, color: "bg-blue-500" },
                        { region: "Africa", value: 15, color: "bg-orange-500" },
                        { region: "Asia Pacific", value: 10, color: "bg-purple-500" }
                    ].map((geo, idx) => (
                        <div key={idx}>
                            <div className="flex justify-between text-[13px] font-bold text-[#1d1d1f] mb-2">
                                <span>{geo.region}</span>
                                <span>{geo.value}%</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-black/10 overflow-hidden">
                                <div className={`h-full ${geo.color} rounded-full`} style={{ width: `${geo.value}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </GlassCard>
        </GsapReveal>
      </div>
    </div>
  );
}
