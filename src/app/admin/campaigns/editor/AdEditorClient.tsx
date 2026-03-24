"use client";

import React, { useState } from "react";
import { GsapReveal } from "@/components/GsapReveal";
import { Button } from "@/components/ui/Button";
import { upsertAd } from "@/app/actions/ads";
import { ChevronLeft, LayoutTemplate, Square, Maximize2, Info } from "lucide-react";
import Link from "next/link";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AdFormProps {
  ad?: any;
}

const SHAPE_OPTIONS = [
  {
    value: "square",
    label: "Square",
    icon: Square,
    aspectRatio: "square" as const,
    desc: "Equal-side ad unit",
    dims: "600 × 600 px",
    hint: "Optimized for all placements. Horizontal banners will now use square images with a refined layout.",
  },
];

const POSITION_OPTIONS = [
  { value: "article_bottom", label: "Article Bottom", note: "Appears after article content" },
  { value: "home_middle", label: "Home Middle", note: "Displayed in the homepage feed" },
  { value: "sidebar", label: "Sidebar", note: "Right-rail beside article content" },
];

export function AdEditorClient({ ad }: AdFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(ad?.image_url || "");
  const [shape, setShape] = useState<"square">(ad?.shape || "square");

  const selectedShape = SHAPE_OPTIONS.find((s) => s.value === shape)!;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("image_url", imageUrl);
    formData.set("shape", shape);

    try {
      await upsertAd(formData);
      toast.success(ad?.id ? "Campaign updated!" : "Campaign launched! 🚀");
      router.push("/admin/campaigns");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1400px]">
      <GsapReveal direction="up" className="mb-10">
        <Link
          href="/admin/campaigns"
          className="inline-flex items-center gap-2 text-[#1d1d1f]/40 hover:text-[#093C15] font-bold text-[13px] mb-6 uppercase tracking-wider transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to campaigns
        </Link>
        <h1 className="text-3xl font-bold text-[#1d1d1f] font-bricolage mb-2">
          {ad?.id ? "Edit Campaign" : "Create New Campaign"}
        </h1>
        <p className="text-[#1d1d1f]/60">
          Define your campaign objective, creative, and destination.
        </p>
      </GsapReveal>

      <GsapReveal direction="up" delay={0.1}>
        <div className="bg-white/80 backdrop-blur-xl p-8 md:p-10 rounded-[2rem] border border-black/5 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-10">
            <input type="hidden" name="id" value={ad?.id || ""} />

            {/* Campaign Identity */}
            <div className="space-y-6">
              <div>
                <label className="block text-[12px] font-bold text-[#1d1d1f]/40 uppercase tracking-widest mb-3">
                  Campaign Title
                </label>
                <input
                  type="text"
                  name="title"
                  defaultValue={ad?.title || ""}
                  required
                  placeholder="e.g. Summer Growth Sale"
                  className="w-full h-14 bg-black/[0.02] border border-black/5 rounded-xl px-6 font-medium text-[#1d1d1f] focus:ring-4 focus:ring-[#41cc00]/10 outline-none transition-all placeholder:text-black/10"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#1d1d1f]/40 uppercase tracking-widest mb-3">
                  Short Description
                </label>
                <textarea
                  name="description"
                  defaultValue={ad?.description || ""}
                  rows={3}
                  placeholder="A brief message or call to action for this campaign..."
                  className="w-full bg-black/[0.02] border border-black/5 rounded-xl p-6 font-medium text-[#1d1d1f] focus:ring-4 focus:ring-[#41cc00]/10 outline-none transition-all placeholder:text-black/10 resize-none"
                />
              </div>
            </div>

            {/* Shape Info (Simplified since only Square is supported) */}

            {/* Image Upload + Fields — side by side, compact */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Left: Upload zone */}
              <div className="w-full md:w-[30%] shrink-0">
                <label className="block text-[12px] font-bold text-[#1d1d1f]/40 uppercase tracking-widest mb-3">
                  Ad Image — <span className="text-[#41cc00]">{selectedShape.dims}</span>
                </label>
                <ImageUpload
                  value={imageUrl}
                  onChange={(url: string) => setImageUrl(url)}
                  label=""
                  bucket="content"
                  folder="ads"
                  aspectRatio={selectedShape.aspectRatio}
                />
              </div>

              {/* Right: URL, Position, Status stacked */}
              <div className="flex-1 flex flex-col gap-5">
                <div>
                  <label className="block text-[12px] font-bold text-[#1d1d1f]/40 uppercase tracking-widest mb-3">
                    Destination URL
                  </label>
                  <input
                    type="url"
                    name="target_url"
                    defaultValue={ad?.target_url || ad?.link_url || ""}
                    required
                    placeholder="https://example.com/"
                    className="w-full h-12 bg-black/[0.02] border border-black/5 rounded-xl px-5 font-medium text-[#1d1d1f] focus:ring-4 focus:ring-[#41cc00]/10 outline-none transition-all placeholder:text-black/10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-bold text-[#1d1d1f]/40 uppercase tracking-widest mb-3">
                      Placement
                    </label>
                    <select
                      name="position"
                      defaultValue={ad?.position || "article_bottom"}
                      className="w-full h-12 bg-black/[0.02] border border-black/5 rounded-xl px-5 font-bold text-[#1d1d1f] focus:ring-4 focus:ring-[#41cc00]/10 outline-none transition-all appearance-none cursor-pointer"
                    >
                      {POSITION_OPTIONS.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-black/30 font-medium mt-1.5">
                      {POSITION_OPTIONS.find((p) => p.value === ad?.position)?.note || "Appears after article content"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-[#1d1d1f]/40 uppercase tracking-widest mb-3">
                      Status
                    </label>
                    <select
                      name="status"
                      defaultValue={ad?.status || "active"}
                      className="w-full h-12 bg-black/[0.02] border border-black/5 rounded-xl px-5 font-bold text-[#1d1d1f] focus:ring-4 focus:ring-[#41cc00]/10 outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>


            {/* Actions */}
            <div className="pt-6 border-t border-black/5 flex justify-end gap-4">
              <Link href="/admin/campaigns">
                <Button type="button" variant="ghost" className="h-12 px-8 rounded-xl font-bold text-[#1d1d1f]/40">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                variant="primary"
                className="bg-[#093C15] text-white h-12 px-10 rounded-xl font-bold shadow-lg shadow-[#093C15]/10"
                isLoading={loading}
              >
                {ad?.id ? "Update Campaign" : "Launch Campaign"}
              </Button>
            </div>
          </form>
        </div>
      </GsapReveal>
    </div>
  );
}
