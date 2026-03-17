"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Image as ImageIcon, Plus, Trash2, Edit2, Link as LinkIcon, Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { upsertAd, deleteAd } from "@/app/actions/settings";

export default function AdsManagementPage() {
  const supabase = createClient();
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  const [newAd, setNewAd] = useState({
    title: "",
    image_url: "",
    destination_url: "",
    is_active: true
  });

  const fetchAds = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("ads")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (!error && data) setAds(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleToggleActive = async (ad: any) => {
    const updated = { ...ad, is_active: !ad.is_active };
    try {
      await upsertAd(updated);
      setAds(ads.map(a => a.id === ad.id ? updated : a));
    } catch (err: any) {
      alert("Error updating ad: " + err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this ad? It will be removed from the blog sidebar immediately.")) {
      try {
        await deleteAd(id);
        setAds(ads.filter(ad => ad.id !== id));
      } catch (err: any) {
        alert("Error deleting ad: " + err.message);
      }
    }
  };

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await upsertAd(newAd);
      await fetchAds();
      setIsAdding(false);
      setNewAd({ title: "", image_url: "", destination_url: "", is_active: true });
    } catch (err: any) {
      alert("Error creating ad: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1d1d1f] font-bricolage mb-2">Ads Manager</h1>
          <p className="text-[#1d1d1f]/50 font-medium">Manage the promotional cards displayed in the blog article sidebar.</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setIsAdding(!isAdding)}
          className="gap-2"
        >
          {isAdding ? "Cancel" : <><Plus className="h-4 w-4" /> New Ad</>}
        </Button>
      </div>

      {isAdding && (
        <div className="bg-white rounded-2xl border border-[#41cc00]/30 shadow-[0_8px_30px_rgb(65,204,0,0.06)] p-6 md:p-8 mb-10 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 pb-4 border-b border-black/5 mb-6">
            <div className="p-2 rounded-xl bg-[#41cc00]/10">
              <Plus className="w-4 h-4 text-[#093C15]" />
            </div>
            <h2 className="text-[16px] font-bold text-[#1d1d1f]">Create New Ad</h2>
          </div>

          <form onSubmit={handleCreateAd} className="space-y-5">
            <div>
              <label className="text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider mb-2 block">Ad Title (Internal Reference & Screen Readers)</label>
              <Input 
                value={newAd.title} 
                onChange={(e) => setNewAd({...newAd, title: e.target.value})} 
                placeholder="e.g. Tela USD Cards Spring Promo"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider mb-2 block">Image URL</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#1d1d1f]/40">
                    <ImageIcon className="h-4 w-4" />
                  </div>
                  <Input 
                    className="pl-10"
                    placeholder="https://..."
                    value={newAd.image_url} 
                    onChange={(e) => setNewAd({...newAd, image_url: e.target.value})} 
                    required
                  />
                </div>
                <p className="text-[11px] text-[#1d1d1f]/40 mt-1">Recommended aspect ratio: 3:2 (e.g., 600x400px)</p>
              </div>
              <div>
                <label className="text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider mb-2 block">Destination Link</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#1d1d1f]/40">
                    <LinkIcon className="h-4 w-4" />
                  </div>
                  <Input 
                    className="pl-10"
                    placeholder="https://tela.ng/..."
                    value={newAd.destination_url} 
                    onChange={(e) => setNewAd({...newAd, destination_url: e.target.value})} 
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Save Ad</Button>
            </div>
          </form>

          {/* Realtime Ad Preview */}
          {newAd.image_url && (
            <div className="mt-8 pt-8 border-t border-black/5">
              <h3 className="text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider mb-4">Live Preview</h3>
              <div className="w-[340px] rounded-2xl overflow-hidden bg-white border border-black/5 shadow-sm">
                <div className="aspect-[3/2] w-full overflow-hidden relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={newAd.image_url} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <p className="text-white text-[13px] font-bold">{newAd.title || 'Ad Title Preview'}</p>
                  </div>
                </div>
                <div className="px-3 pb-2 pt-3 text-center">
                  <span className="text-[10px] uppercase tracking-wider text-[#1d1d1f]/30 font-bold">Sponsored</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Existing Ads List */}
      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-black/5 bg-black/[0.02]">
          <h2 className="text-[15px] font-bold text-[#1d1d1f]">Active Campaigns ({ads.filter(a => a.is_active).length})</h2>
        </div>
        
        <div className="divide-y divide-black/5">
          {ads.map((ad) => (
            <div key={ad.id} className={`p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center transition-colors ${!ad.is_active ? 'opacity-60 bg-black/[0.02]' : 'hover:bg-black/[0.01]'}`}>
              {/* Ad Image Thumb */}
              <div className="w-40 aspect-[3/2] rounded-xl overflow-hidden shrink-0 border border-black/10 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover" />
                {!ad.is_active && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="bg-black/80 text-white text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-full">Inactive</span>
                  </div>
                )}
              </div>

              {/* Ad Details */}
              <div className="flex-1 min-w-0">
                <h3 className="text-[16px] font-bold text-[#1d1d1f] mb-1">{ad.title}</h3>
                <a href={ad.destination_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[13px] text-blue-500 hover:text-blue-600 truncate mb-3 group">
                  <LinkIcon className="h-3 w-3" />
                  <span className="group-hover:underline">{ad.destination_url}</span>
                </a>
                
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                    ad.is_active ? 'bg-green-500/10 text-green-600' : 'bg-[#1d1d1f]/10 text-[#1d1d1f]/60'
                  }`}>
                    {ad.is_active ? 'Running' : 'Paused'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button 
                  onClick={() => handleToggleActive(ad.id)}
                  className={`p-2.5 rounded-xl border transition-colors flex items-center justify-center ${
                    ad.is_active 
                      ? 'border-yellow-500/20 text-yellow-600 hover:bg-yellow-500/10' 
                      : 'border-green-500/20 text-green-600 hover:bg-green-500/10'
                  }`}
                  title={ad.is_active ? "Pause Ad" : "Activate Ad"}
                >
                  {ad.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button className="p-2.5 rounded-xl border border-black/5 text-[#1d1d1f]/40 hover:text-[#1d1d1f] hover:bg-black/5 transition-colors">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleDelete(ad.id)}
                  className="p-2.5 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {ads.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="h-5 w-5 text-[#1d1d1f]/40" />
              </div>
              <h3 className="text-[15px] font-bold text-[#1d1d1f] mb-1">No ads found</h3>
              <p className="text-[14px] text-[#1d1d1f]/50">Create an ad to display promotional content in the blog sidebar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
