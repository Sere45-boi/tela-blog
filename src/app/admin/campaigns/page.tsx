import { createClient } from "@/utils/supabase/server";
import { GsapReveal } from "@/components/GsapReveal";
import { Button } from "@/components/ui/Button";
import { Plus, Megaphone, Trash2, ExternalLink, BarChart3, Edit2, TrendingUp, MoreVertical } from "lucide-react";
import Link from "next/link";
import { deleteAd } from "@/app/actions/ads";
import { GlassCard } from "@/components/ui/Card";

export const metadata = {
  title: "Campaign Intelligence | Tela CMS",
};

export default async function AdminAdsPage() {
  const supabase = await createClient();
  const { data: ads } = await supabase
    .from("ads")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-[1400px]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <GsapReveal direction="up">
          <h1 className="text-3xl font-bold text-[#1d1d1f] font-bricolage mb-2">Campaign Intelligence</h1>
          <p className="text-[#1d1d1f]/40 font-medium tracking-tight">Orchestrate advertisement campaigns and optimize commercial performance.</p>
        </GsapReveal>
        <GsapReveal direction="up" delay={0.1}>
            <Link href="/admin/campaigns/editor">
            <Button className="h-12 px-8 bg-[#093C15] group shadow-lg shadow-[#093C15]/10 hover:bg-[#0a5a1f] transition-all">
                <Plus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" /> Initialize Campaign
            </Button>
            </Link>
        </GsapReveal>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <GsapReveal direction="up" delay={0.2}>
            <GlassCard className="p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-2xl bg-[#41cc00]/10 text-[#093C15]">
                        <Megaphone className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-[11px] font-bold text-black/20 uppercase tracking-widest leading-none mb-1">Commercial Footprint</h3>
                        <p className="text-[15px] font-bold text-[#1d1d1f]">Active Campaigns</p>
                    </div>
                </div>
                <div className="text-5xl font-bold text-[#1d1d1f] font-bricolage tracking-tighter tabular-nums mb-2">
                    {ads?.filter(a => a.status === 'active').length || 0}
                </div>
                <div className="flex items-center gap-1.5 text-[#41cc00] font-bold text-[12px]">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Real-time delivery</span>
                </div>
            </GlassCard>
        </GsapReveal>

        <GsapReveal direction="up" delay={0.3}>
            <GlassCard className="p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-2xl bg-[#41cc00]/10 text-[#093C15]">
                        <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-[11px] font-bold text-black/20 uppercase tracking-widest leading-none mb-1">Global Reach</h3>
                        <p className="text-[15px] font-bold text-[#1d1d1f]">Total Impressions</p>
                    </div>
                </div>
                <div className="text-5xl font-bold text-[#1d1d1f] font-bricolage tracking-tighter tabular-nums mb-2">
                    {ads?.reduce((acc, curr) => acc + (curr.impression_count || 0), 0).toLocaleString() || 0}
                </div>
                <div className="text-[12px] font-bold text-black/20 uppercase tracking-wider">Across platform</div>
            </GlassCard>
        </GsapReveal>

        <GsapReveal direction="up" delay={0.4}>
            <GlassCard className="p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-2xl bg-[#41cc00]/10 text-[#093C15]">
                        <ExternalLink className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-[11px] font-bold text-black/20 uppercase tracking-widest leading-none mb-1">Engagement Conversion</h3>
                        <p className="text-[15px] font-bold text-[#1d1d1f]">Total Clicks</p>
                    </div>
                </div>
                <div className="text-5xl font-bold text-[#1d1d1f] font-bricolage tracking-tighter tabular-nums mb-2">
                    {ads?.reduce((acc, curr) => acc + (curr.click_count || 0), 0).toLocaleString() || 0}
                </div>
                <div className="text-[12px] font-bold text-black/20 uppercase tracking-wider">Verified interactions</div>
            </GlassCard>
        </GsapReveal>
      </div>

      <GsapReveal direction="up" delay={0.5}>
        <GlassCard className="overflow-hidden shadow-sm lg:p-0">
          <div className="overflow-x-auto pb-20">
            <table className="w-full text-left border-collapse">
              <thead className="text-[11px] font-bold text-[#1d1d1f]/30 uppercase tracking-[0.15em] bg-black/[0.01] border-b border-black/5">
                <tr>
                  <th className="px-8 py-5">Campaign Identity</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5">Architecture</th>
                  <th className="px-8 py-5 text-right">Impressions</th>
                  <th className="px-8 py-5 text-right">Clicks</th>
                  <th className="px-8 py-5 text-right">Efficiency (CTR)</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {ads?.map((ad) => {
                  const ctr = ad.impression_count ? ((ad.click_count / ad.impression_count) * 100).toFixed(2) : "0.00";
                  return (
                    <tr key={ad.id} className="hover:bg-[#f3fbf3]/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                            <div className="relative shrink-0">
                                <img src={ad.image_url} className="w-12 h-12 rounded-xl object-cover border border-black/5 shadow-sm group-hover:scale-110 transition-transform" alt="" />
                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${ad.status === 'active' ? 'bg-[#41cc00]' : 'bg-black/10'}`} />
                            </div>
                            <div className="min-w-0">
                                <span className="text-[15px] font-bold text-[#1d1d1f] block truncate group-hover:text-[#41cc00] transition-colors">{ad.title}</span>
                                <span className="text-[12px] text-black/30 font-medium truncate block">{ad.target_url}</span>
                            </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold tracking-[0.1em] uppercase border ${
                          ad.status === 'active' ? 'bg-[#41cc00]/10 text-[#093C15] border-[#41cc00]/20' : 'bg-black/[0.03] text-[#1d1d1f]/40 border-black/5'
                        }`}>
                          {ad.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-[14px] text-black/40 font-bold tracking-tight">
                        {ad.position.replace('_', ' ')}
                      </td>
                      <td className="px-8 py-5 text-right tabular-nums text-[#1d1d1f] font-bold">
                        {ad.impression_count?.toLocaleString()}
                      </td>
                      <td className="px-8 py-5 text-right tabular-nums text-[#1d1d1f] font-bold">
                        {ad.click_count?.toLocaleString()}
                      </td>
                      <td className="px-8 py-5 text-right tabular-nums">
                        <div className="flex flex-col items-end">
                            <span className="text-[15px] font-bold text-[#093C15]">{ctr}%</span>
                            <div className="w-16 h-1 bg-black/5 rounded-full mt-1 overflow-hidden">
                                <div className="h-full bg-[#41cc00] transition-all duration-1000" style={{ width: `${Math.min(parseFloat(ctr) * 10, 100)}%` }} />
                            </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                         <div className="relative group/actions inline-block">
                             <button className="p-2.5 rounded-xl text-black/20 hover:text-[#093C15] hover:bg-black/5 transition-all">
                                <MoreVertical className="w-4 h-4" />
                             </button>
                             <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-xl border border-black/5 shadow-2xl opacity-0 group-hover/actions:opacity-100 pointer-events-none group-hover/actions:pointer-events-auto transition-all translate-y-2 group-hover/actions:translate-y-0 z-20 p-1.5">
                                <Link href={`/admin/campaigns/editor?id=${ad.id}`} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-bold text-[#1d1d1f] hover:bg-[#41cc00]/10 transition-colors text-left">
                                   <Edit2 className="w-3.5 h-3.5" /> Edit
                                </Link>
                                <form action={deleteAd.bind(null, ad.id)} className="w-full">
                                    <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-bold text-red-500 hover:bg-red-500/10 transition-colors text-left font-bold">
                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                    </button>
                                </form>
                             </div>
                         </div>
                      </td>
                    </tr>
                  );
                })}

                {(!ads || ads.length === 0) && (
                  <tr>
                    <td colSpan={7} className="px-8 py-32 text-center">
                       <Megaphone className="w-12 h-12 text-black/5 mx-auto mb-4" />
                       <div className="text-[14px] font-bold text-black/20 uppercase tracking-widest">No commercial campaigns detected.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </GsapReveal>
    </div>
  );
}
