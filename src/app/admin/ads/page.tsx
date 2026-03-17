import { createClient } from "@/utils/supabase/server";
import { GsapReveal } from "@/components/GsapReveal";
import { Button } from "@/components/ui/Button";
import { Plus, Megaphone, Trash2, ExternalLink, BarChart3, Edit2 } from "lucide-react";
import Link from "next/link";
import { deleteAd } from "@/app/actions/ads";

export const metadata = {
  title: "Ad Management | Tela CMS",
};

export default async function AdminAdsPage() {
  const supabase = await createClient();
  const { data: ads } = await supabase
    .from("ads")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-6xl">
      <GsapReveal direction="up" className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-[#1d1d1f] font-bricolage mb-2">Campaign Management</h1>
          <p className="text-[#1d1d1f]/60">Manage your advertisement campaigns and track performance metrics.</p>
        </div>
        <Link href="/admin/ads/editor">
          <Button variant="primary" className="gap-2 rounded-xl bg-[#093C15] text-white h-11 px-6 shadow-sm">
            <Plus className="h-4 w-4" /> New Campaign
          </Button>
        </Link>
      </GsapReveal>

      {/* Metrics Summary Grid */}
      <GsapReveal direction="up" delay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl border border-black/5 shadow-sm">
            <div className="flex items-center gap-3 mb-4 text-[#1d1d1f]/40">
                <Megaphone className="w-5 h-5 text-[#41cc00]" />
                <span className="text-[12px] font-bold uppercase tracking-wider">Active Campaigns</span>
            </div>
            <div className="text-4xl font-bold text-[#1d1d1f] font-bricolage">
                {ads?.filter(a => a.status === 'active').length || 0}
            </div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl border border-black/5 shadow-sm">
            <div className="flex items-center gap-3 mb-4 text-[#1d1d1f]/40">
                <BarChart3 className="w-5 h-5 text-[#093C15]" />
                <span className="text-[12px] font-bold uppercase tracking-wider">Total Impressions</span>
            </div>
            <div className="text-4xl font-bold text-[#1d1d1f] font-bricolage tabular-nums">
                {ads?.reduce((acc, curr) => acc + (curr.impression_count || 0), 0).toLocaleString() || 0}
            </div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl border border-black/5 shadow-sm">
            <div className="flex items-center gap-3 mb-4 text-[#1d1d1f]/40">
                <ExternalLink className="w-5 h-5 text-[#41cc00]" />
                <span className="text-[12px] font-bold uppercase tracking-wider">Total Clicks</span>
            </div>
            <div className="text-4xl font-bold text-[#1d1d1f] font-bricolage tabular-nums">
                {ads?.reduce((acc, curr) => acc + (curr.click_count || 0), 0).toLocaleString() || 0}
            </div>
        </div>
      </GsapReveal>

      <GsapReveal direction="up" delay={0.2}>
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-black/5 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] font-bold text-[#1d1d1f]/40 uppercase tracking-wider bg-black/[0.02] border-b border-black/5">
                <tr>
                  <th className="px-6 py-4">Campaign Name</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Position</th>
                  <th className="px-6 py-4 text-right">Impressions</th>
                  <th className="px-6 py-4 text-right">Clicks</th>
                  <th className="px-6 py-4 text-right">CTR</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {ads?.map((ad) => {
                  const ctr = ad.impression_count ? ((ad.click_count / ad.impression_count) * 100).toFixed(2) : "0.00";
                  return (
                    <tr key={ad.id} className="hover:bg-[#41cc00]/5 transition-colors group">
                      <td className="px-6 py-4 font-bold text-[#1d1d1f]">
                        <div className="flex items-center gap-3">
                            <img src={ad.image_url} className="w-10 h-10 rounded-lg object-cover border border-black/5" alt="" />
                            <span className="max-w-[180px] truncate">{ad.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`capitalize inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase ${
                          ad.status === 'active' ? 'bg-[#41cc00]/10 text-[#093C15]' : 'bg-black/5 text-[#1d1d1f]/40'
                        }`}>
                          {ad.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#1d1d1f]/60 font-medium">
                        {ad.position.replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4 text-right tabular-nums text-[#1d1d1f]/60 font-medium">
                        {ad.impression_count?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right tabular-nums text-[#1d1d1f]/60 font-medium">
                        {ad.click_count?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right tabular-nums font-bold text-[#093C15]">
                        {ctr}%
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Link 
                            href={`/admin/ads/editor?id=${ad.id}`} 
                            className="p-2 inline-block text-[#1d1d1f]/40 hover:text-[#093C15] transition-colors"
                        >
                            <Edit2 className="h-4 w-4" />
                        </Link>
                        <form action={deleteAd.bind(null, ad.id)} className="inline-block">
                          <button className="p-2 text-[#1d1d1f]/40 hover:text-red-500 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}

                {(!ads || ads.length === 0) && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-[#1d1d1f]/40 font-medium">
                      No active campaigns. Start driving growth today.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </GsapReveal>
    </div>
  );
}
