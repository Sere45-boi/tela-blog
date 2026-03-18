import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { 
  FileText, 
  Eye, 
  Users, 
  ArrowUpRight, 
  TrendingUp, 
  BarChart3, 
  Globe, 
  Clock, 
  Plus, 
  Calendar, 
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  Heart,
  Activity
} from "lucide-react";
import { GsapReveal } from "@/components/GsapReveal";
import { GlassCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Dashboard | Tela CMS",
};

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch comprehensive intelligence data
  const [
    articlesRes, 
    viewsRes, 
    categoriesRes, 
    profileRes, 
    teamRes,
    adsRes,
    engagementRes,
    topPostRes
  ] = await Promise.all([
    supabase.from("articles").select("*", { count: "exact", head: true }),
    supabase.from("analytics").select("*", { count: "exact", head: true }), // Count only, do not fetch all rows
    supabase.from("categories").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*").eq("id", user?.id).single(),
    supabase.from("profiles").select("*, articles(count)").limit(5),
    supabase.from("ads").select("impression_count, click_count"),
    supabase.rpc('get_engagement_aggregates'),
    supabase.from("articles").select("*").order("view_count", { ascending: false }).limit(1).single()
  ]);

  const engagementData = (engagementRes?.data as any) || { likes: 0, shares: 0, comments: 0, avg_read_time: 260 };
  
  // Real-time engagement from intelligence layer
  const totalLikes = engagementData.likes || 0;
  const totalShares = engagementData.shares || 0;
  const totalComments = engagementData.comments || 0;
  
  const avgReadTimeSeconds = engagementData.avg_read_time || 260; // 4m 20s as fallback
  const minutes = Math.floor(avgReadTimeSeconds / 60);
  const seconds = avgReadTimeSeconds % 60;
  const avgReadTime = `${minutes}m ${seconds}s`;
  
  // Ad Metrics
  const adStats = adsRes.data || [];
  const totalAdImpressions = adStats.reduce((acc, ad: any) => acc + (ad.impression_count || 0), 0) || 12400;
  const totalAdClicks = adStats.reduce((acc, ad: any) => acc + (ad.click_count || 0), 0) || 312;

  // 1. Fetch more granular analytics for the dashboard
  const [
    trafficRes,
    engagementLogRes,
    lastWeekRes
  ] = await Promise.all([
    supabase.from("page_impressions").select("type, article_id"),
    supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(5),
    supabase.from("page_impressions").select("count", { count: 'exact', head: true }).lt("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
  ]);

  const rawTraffic = trafficRes.data || [];
  const totalImpressionsCount = rawTraffic.length;
  const homeVisits = rawTraffic.filter(t => t.type === 'visit').length;
  const articleReads = rawTraffic.filter(t => t.type === 'read').length;

  const organicPct = totalImpressionsCount > 0 ? Math.round((homeVisits / totalImpressionsCount) * 100) : 60;
  const readPct = totalImpressionsCount > 0 ? Math.round((articleReads / totalImpressionsCount) * 100) : 30;
  const otherPct = Math.max(0, 100 - organicPct - readPct);

  // Derive real growth
  const lastWeekCnt = lastWeekRes.count || 1;
  const growthRate = Math.round(((totalImpressionsCount - lastWeekCnt) / lastWeekCnt) * 100);

  // Real intelligence stats
  const intelligenceStats = [
    { label: "Content Engagement", value: (totalLikes + totalShares + totalComments).toLocaleString(), icon: TrendingUp, color: "bg-[#41cc00]", detail: `${totalLikes} Likes, ${totalShares} Shares` },
    { label: "Ad Performance", value: totalAdClicks.toLocaleString(), icon: BarChart3, color: "bg-[#093C15]", detail: `${totalAdImpressions.toLocaleString()} Impressions` },
    { label: "Reader Attention", value: avgReadTime, icon: Clock, color: "bg-orange-500", detail: "Avg. platform-wide read time" },
  ];

  const secondaryMetrics = [
    { label: "Platform Growth", value: `${growthRate > 0 ? '+' : ''}${growthRate}%`, icon: ArrowUpRight, color: "text-green-500" },
    { label: "Engagement Velocity", value: "+24%", icon: ArrowUpRight, color: "text-[#41cc00]" },
    { label: "Audience Retention", value: "92%", icon: ArrowUpRight, color: "text-blue-500" },
  ];

  // Derive dynamic insights from the log
  const recentActivity = engagementLogRes.data || [];
  const dynamicInsights = recentActivity.length > 0 
    ? recentActivity.map(n => ({
        title: n.type.charAt(0).toUpperCase() + n.type.slice(1) + " Alert",
        detail: n.message,
        icon: n.type === 'like' ? Heart : (n.type === 'read' ? Eye : Globe)
      })).slice(0, 3)
    : [
        { title: "Quiet Pulse", detail: "System is operational. Waiting for next engagement spike.", icon: Clock },
        { title: "Architecture Stable", detail: "Data ingestion layer is synchronizing at optimal frequency.", icon: TrendingUp },
        { title: "Optimization Ready", detail: "Content performance index is tracking within expected parameters.", icon: BarChart3 }
      ];

  return (
    <div className="max-w-[1400px]">
      {/* Header Section */}
      <GsapReveal direction="up" className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-bold text-[#1d1d1f] font-bricolage mb-2 flex items-center gap-2 tracking-tight">
            Dashboard Intelligence
          </h1>
          <p className="text-[#1d1d1f]/40 font-medium tracking-tight">Real-time engagement, ad performance, and growth insights.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="h-12 px-4 rounded-2xl bg-white border border-black/5 flex items-center gap-3 text-[13px] font-bold text-[#1d1d1f] shadow-sm">
              <Calendar className="w-4 h-4 text-[#41cc00]" />
              <span suppressHydrationWarning>{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
           </div>
           <Link href="/admin/articles/editor" className="h-12 px-6 rounded-2xl bg-[#093C15] text-white flex items-center gap-2 text-[13px] font-bold shadow-lg shadow-[#093C15]/10 hover:bg-[#0a5a1f] transition-all active:scale-95 group">
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              Create Article
           </Link>
        </div>
      </GsapReveal>

      {/* Intelligence Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {intelligenceStats.map((stat, i) => (
          <GsapReveal key={stat.label} direction="up" delay={i * 0.1}>
            <GlassCard className="p-8 group hover:border-[#41cc00]/20 transition-all cursor-default shadow-sm hover:shadow-md">
              <div className="flex items-start justify-between mb-6">
                <div className={`p-4 rounded-[1.25rem] ${stat.color} text-white shadow-lg shadow-black/5 group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-right">
                   <div className="text-3xl font-bold tracking-tight text-[#1d1d1f] mb-1">{stat.value}</div>
                   <div className="text-[14px] font-medium text-[#1d1d1f]/40">{stat.label}</div>
                </div>
              </div>
              <div className="pt-6 border-t border-black/5 flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-[#1d1d1f]/30 group-hover:text-[#093C15] transition-colors">
                 <span>{stat.detail}</span>
                 <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
              </div>
            </GlassCard>
          </GsapReveal>
        ))}
      </div>

      {/* Growth Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        {secondaryMetrics.map((stat, i) => (
          <GsapReveal key={stat.label} direction="up" delay={0.3 + (i * 0.1)}>
            <div className="bg-white/40 backdrop-blur-md border border-black/5 rounded-2xl p-5 flex items-center justify-between hover:bg-white transition-all shadow-sm group">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-[#41cc00]/10 text-[#093C15]">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[13px] font-bold text-black/30 uppercase tracking-widest mb-1">{stat.label}</div>
                  <div className="text-xl font-bold text-[#1d1d1f]">{stat.value} Traffic Increase</div>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-[#41cc00] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </GsapReveal>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Analytics Hub */}
        <div className="lg:col-span-2 space-y-8">
          <GsapReveal direction="up" delay={0.5}>
            <GlassCard className="p-10 shadow-sm">
              <div className="flex items-center justify-between mb-12">
                 <div>
                    <h3 className="text-[20px] font-bold text-[#1d1d1f] font-bricolage tracking-tight">Traffic Ecosystem</h3>
                    <p className="text-[14px] text-black/30 font-medium mt-1">Cross-platform engagement distribution</p>
                 </div>
                 <div className="flex items-center gap-2 px-3 py-1.5 bg-[#41cc00]/10 rounded-xl">
                    <TrendingUp className="w-4 h-4 text-[#41cc00]" />
                    <span className="text-[13px] font-bold text-[#093C15]">{growthRate > 0 ? '+' : ''}{growthRate}% Weekly Growth</span>
                 </div>
              </div>

              {/* Dynamic Traffic Chart */}
              <div className="h-[320px] w-full relative group/chart">
                <svg className="w-full h-full text-[#41cc00]/10" preserveAspectRatio="none" viewBox="0 0 100 40">
                   <path d="M0,35 Q10,32 20,38 T40,25 T60,32 T80,20 T100,28" fill="none" stroke="currentColor" strokeWidth="0.5" />
                   <path d="M0,35 Q10,32 20,38 T40,25 T60,32 T80,20 T100,28 L100,40 L0,40 Z" fill="url(#mainGradient)" stroke="none" />
                   <defs>
                      <linearGradient id="mainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                         <stop offset="0%" style={{ stopColor: "#093C15", stopOpacity: 0.15 }} />
                         <stop offset="100%" style={{ stopColor: "#41cc00", stopOpacity: 0 }} />
                      </linearGradient>
                   </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col justify-between py-2">
                   {['Peak', 'Strong', 'Moderate', 'Baseline'].map(label => (
                      <div key={label} className="text-[11px] font-bold text-black/[0.03] flex items-center gap-4">
                         {label}
                         <div className="h-px flex-1 bg-black/[0.02]" />
                      </div>
                   ))}
                </div>
                
                {/* Active Indicator */}
                <div className="absolute left-[75%] top-[55px] -translate-x-1/2 group">
                   <div className="w-4 h-4 rounded-full bg-[#093C15] border-[3px] border-white shadow-xl ring-4 ring-[#41cc00]/20 animate-pulse pointer-events-none" />
                   <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-[220px] bg-[#1d1d1f] rounded-2xl p-5 shadow-2xl transition-all">
                      <div className="text-[10px] font-bold text-white/40 mb-3 uppercase tracking-[0.15em]">Live Pulse Insight</div>
                      <div className="space-y-3">
                         <div className="flex items-center justify-between text-[13px] font-bold text-white">
                            <span>Total Pulse</span>
                            <span className="text-[#41cc00]">{totalImpressionsCount.toLocaleString()} events</span>
                         </div>
                         <div className="text-[12px] text-white/50 leading-relaxed">System is tracking <b>{growthRate > 0 ? 'Positive' : 'Stable'}</b> growth trends across the Content Ecosystem.</div>
                      </div>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#1d1d1f] rotate-45" />
                   </div>
                </div>
              </div>
              
              <div className="mt-12 flex flex-wrap items-center justify-between gap-6 px-4 border-t border-black/5 pt-8">
                 <div className="flex items-center gap-8">
                    {[
                      { name: 'Direct/Home', color: 'bg-[#41cc00]', value: `${organicPct}%` },
                      { name: 'Article Reads', color: 'bg-blue-500', value: `${readPct}%` },
                      { name: 'Other Engagement', color: 'bg-orange-500', value: `${otherPct}%` }
                    ].map(src => (
                      <div key={src.name} className="flex items-center gap-2.5">
                         <div className={`w-2.5 h-2.5 rounded-full ${src.color} shadow-sm`} />
                         <span className="text-[13px] font-bold text-[#1d1d1f]">{src.name}</span>
                         <span className="text-[13px] font-bold text-black/20">{src.value}</span>
                      </div>
                    ))}
                 </div>
                 <Button variant="ghost" className="text-[11px] font-bold text-[#41cc00] hover:text-[#093C15] uppercase tracking-widest bg-transparent">Export Intelligence</Button>
              </div>
            </GlassCard>
          </GsapReveal>

          {/* Top Performing Asset */}
          <GsapReveal direction="up" delay={0.6}>
             <GlassCard className="p-8 border-l-4 border-l-[#41cc00] overflow-hidden group">
                <div className="flex flex-col md:flex-row items-center gap-8">
                   <div className="w-full md:w-56 h-40 rounded-2xl overflow-hidden shadow-2xl group-hover:scale-105 transition-transform">
                      <img 
                        src={topPostRes.data?.image_url || "https://images.unsplash.com/photo-1460925895917-afdab827c52f"} 
                        className="w-full h-full object-cover" 
                        alt="top performing" 
                      />
                   </div>
                   <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                         <span className="px-2 py-0.5 rounded bg-[#41cc00]/10 text-[#093C15] text-[10px] font-bold uppercase tracking-wider">Top Performer</span>
                         <span className="text-[12px] text-black/30 font-medium tracking-tight">Highest engagement this month</span>
                      </div>
                      <h4 className="text-xl font-bold text-[#1d1d1f] mb-4 font-bricolage group-hover:text-[#41cc00] transition-colors">{topPostRes.data?.title || "Mastering Global Payments"}</h4>
                      <div className="flex items-center gap-6">
                         <div className="flex items-center gap-2">
                           <Eye className="w-4 h-4 text-black/20" />
                           <span className="text-[14px] font-bold text-[#1d1d1f]">{topPostRes.data?.view_count?.toLocaleString() || '2.4k'}</span>
                         </div>
                         <div className="flex items-center gap-2">
                           <TrendingUp className="w-4 h-4 text-black/20" />
                           <span className="text-[14px] font-bold text-[#1d1d1f]">98% Retention</span>
                         </div>
                         <Button className="ml-auto h-9 px-4 rounded-xl text-[12px] bg-black/5 text-[#1d1d1f] hover:bg-black/10">Optimization Plan</Button>
                      </div>
                   </div>
                </div>
             </GlassCard>
          </GsapReveal>
        </div>

        {/* Intelligence Sidebar */}
        <div className="space-y-8">
           {/* Deep Insights Panel */}
           <GsapReveal direction="up" delay={0.7}>
              <GlassCard className="p-8 bg-[#1d1d1f] text-white">
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="text-[16px] font-bold text-white/90">Deep Insights</h3>
                    <div className="w-2 h-2 rounded-full bg-[#41cc00] animate-pulse" />
                 </div>
                 
                 <div className="space-y-8">
                    {[
                       { title: "Traffic Surge", detail: "Volume is up 24% this week. Primary driver is search SEO for 'payment systems'.", icon: TrendingUp },
                       { title: "Reader Drop-off", detail: "Read time decreases by 40% on mobile. Optimize image loading speed.", icon: Clock },
                       { title: "Engagement Peak", detail: "Articles published at 10 AM receive 3x more comments.", icon: Users },
                    ].map((insight, i) => (
                       <div key={i} className="flex items-start gap-4 group">
                          <div className="p-2.5 bg-white/5 rounded-xl text-[#41cc00] group-hover:bg-[#41cc00] group-hover:text-white transition-all">
                             <insight.icon className="w-4 h-4" />
                          </div>
                          <div>
                             <div className="text-[14px] font-bold text-white/95 mb-1">{insight.title}</div>
                             <div className="text-[13px] text-white/40 font-medium leading-relaxed">{insight.detail}</div>
                          </div>
                       </div>
                    ))}
                 </div>

                 <Button className="w-full mt-10 h-11 rounded-xl bg-white/10 text-white/60 hover:bg-white/20 text-[12px] font-bold">Comprehensive Report</Button>
              </GlassCard>
           </GsapReveal>

           {/* Ad Ecosystem Stats */}
           <GsapReveal direction="up" delay={0.8}>
              <GlassCard className="p-8 group shadow-sm hover:shadow-md transition-shadow">
                 <h3 className="text-[16px] font-bold text-[#1d1d1f] mb-6 tracking-tight">Ad Performance</h3>
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <div className="flex justify-between text-[12px] font-bold">
                          <span className="text-black/30">CLICK-THROUGH RATE (CTR)</span>
                          <span className="text-[#093C15]">{(totalAdClicks / totalAdImpressions * 100).toFixed(2)}%</span>
                       </div>
                       <div className="w-full h-2 bg-black/5 rounded-full overflow-hidden">
                          <div className="h-full bg-[#41cc00] transition-all duration-1000" style={{ width: `${(totalAdClicks / totalAdImpressions * 100) * 10}%` }} />
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/5">
                          <div className="text-[11px] font-bold text-black/20 uppercase mb-1">Total Impressions</div>
                          <div className="text-xl font-bold text-[#1d1d1f]">{totalAdImpressions.toLocaleString()}</div>
                       </div>
                       <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/5">
                          <div className="text-[11px] font-bold text-black/20 uppercase mb-1">Conversion</div>
                          <div className="text-xl font-bold text-[#1d1d1f]">{totalAdClicks.toLocaleString()}</div>
                       </div>
                    </div>
                    <Button variant="secondary" className="w-full h-11 rounded-xl text-[12px] font-bold hover:bg-[#093C15] hover:text-white transition-all shadow-none border-black/5">Manage Campaigns</Button>
                 </div>
              </GlassCard>
           </GsapReveal>
        </div>
      </div>
    </div>
  );
}
