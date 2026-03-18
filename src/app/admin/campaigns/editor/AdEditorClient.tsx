"use client";

import React, { useState } from "react";
import { GsapReveal } from "@/components/GsapReveal";
import { Button } from "@/components/ui/Button";
import { upsertAd } from "@/app/actions/ads";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AdFormProps {
  ad?: any;
}

export function AdEditorClient({ ad }: AdFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(ad?.image_url || "");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("image_url", imageUrl);

    try {
      const result = await upsertAd(formData);
      toast.success(ad?.id ? "Campaign updated" : "Campaign launched");
      router.push("/admin/campaigns");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1400px]">
      <GsapReveal direction="up" className="mb-10">
        <Link href="/admin/campaigns" className="inline-flex items-center gap-2 text-[#1d1d1f]/40 hover:text-[#093C15] font-bold text-[13px] mb-6 uppercase tracking-wider transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to campaigns
        </Link>
        <h1 className="text-3xl font-bold text-[#1d1d1f] font-bricolage mb-2">
            {ad?.id ? 'Edit Campaign' : 'Create New Campaign'}
        </h1>
        <p className="text-[#1d1d1f]/60">Define your campaign objective, creative, and destination.</p>
      </GsapReveal>

      <GsapReveal direction="up" delay={0.1}>
        <div className="bg-white/80 backdrop-blur-xl p-8 md:p-10 rounded-[2rem] border border-black/5 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            <input type="hidden" name="id" value={ad?.id || ''} />
            
            <div className="space-y-6">
                <div>
                    <label className="block text-[12px] font-bold text-[#1d1d1f]/40 uppercase tracking-widest mb-3">Campaign Title</label>
                    <input 
                        type="text" 
                        name="title"
                        defaultValue={ad?.title || ''}
                        required
                        placeholder="e.g. Summer Growth Sale"
                        className="w-full h-14 bg-black/[0.02] border border-black/5 rounded-xl px-6 font-medium text-[#1d1d1f] focus:ring-4 focus:ring-[#41cc00]/10 outline-none transition-all placeholder:text-black/10"
                    />
                </div>

                <div>
                    <label className="block text-[12px] font-bold text-[#1d1d1f]/40 uppercase tracking-widest mb-3">Short Description</label>
                    <textarea 
                        name="description"
                        defaultValue={ad?.description || ''}
                        rows={3}
                        placeholder="A brief message or call to action..."
                        className="w-full bg-black/[0.02] border border-black/5 rounded-xl p-6 font-medium text-[#1d1d1f] focus:ring-4 focus:ring-[#41cc00]/10 outline-none transition-all placeholder:text-black/10"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ImageUpload 
                        value={imageUrl}
                        onChange={(url: string) => setImageUrl(url)}
                        label="Creative Creative (Image)"
                        bucket="content"
                        folder="ads"
                        aspectRatio="video"
                    />
                    
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[12px] font-bold text-[#1d1d1f]/40 uppercase tracking-widest mb-3">Destination URL (Link)</label>
                            <input 
                                type="url" 
                                name="link_url"
                                defaultValue={ad?.link_url || ''}
                                required
                                placeholder="https://..."
                                className="w-full h-14 bg-black/[0.02] border border-black/5 rounded-xl px-6 font-medium text-[#1d1d1f] focus:ring-4 focus:ring-[#41cc00]/10 outline-none transition-all placeholder:text-black/10"
                            />
                        </div>

                        <div>
                            <label className="block text-[12px] font-bold text-[#1d1d1f]/40 uppercase tracking-widest mb-3">Placement Position</label>
                            <select 
                                name="position"
                                defaultValue={ad?.position || 'article_bottom'}
                                className="w-full h-14 bg-black/[0.02] border border-black/5 rounded-xl px-6 font-bold text-[#1d1d1f] focus:ring-4 focus:ring-[#41cc00]/10 outline-none transition-all appearance-none cursor-pointer"
                            >
                                <option value="article_bottom">Article Bottom</option>
                                <option value="home_middle">Home Middle</option>
                                <option value="sidebar">Sidebar</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[12px] font-bold text-[#1d1d1f]/40 uppercase tracking-widest mb-3">Status</label>
                        <select 
                            name="status"
                            defaultValue={ad?.status || 'active'}
                            className="w-full h-14 bg-black/[0.02] border border-black/5 rounded-xl px-6 font-bold text-[#1d1d1f] focus:ring-4 focus:ring-[#41cc00]/10 outline-none transition-all appearance-none cursor-pointer"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-black/5 flex justify-end gap-4">
                <Link href="/admin/campaigns">
                    <Button type="button" variant="ghost" className="h-12 px-8 rounded-xl font-bold text-[#1d1d1f]/40">
                        Cancel
                    </Button>
                </Link>
                <Button type="submit" variant="primary" className="bg-[#093C15] text-white h-12 px-10 rounded-xl font-bold shadow-lg shadow-[#093C15]/10" isLoading={loading}>
                    {ad?.id ? 'Update Campaign' : 'Launch Campaign'}
                </Button>
            </div>
          </form>
        </div>
      </GsapReveal>
    </div>
  );
}
