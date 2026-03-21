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
    value: "rectangle",
    label: "Rectangle",
    icon: LayoutTemplate,
    aspectRatio: "video" as const,
    desc: "Wide horizontal banner",
    dims: "1200 × 628 px",
    hint: "Best for article bottom ads and homepage ads. Recommended 16:9 ratio.",
  },
  {
    value: "square",
    label: "Square",
    icon: Square,
    aspectRatio: "square" as const,
    desc: "Equal-side ad unit",
    dims: "600 × 600 px",
    hint: "Best for sidebar and social-style ads. Recommended 1:1 ratio.",
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
  const [shape, setShape] = useState<"rectangle" | "square">(ad?.shape || "rectangle");

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

            {/* Shape Selector */}
            <div>
              <label className="block text-[12px] font-bold text-[#1d1d1f]/40 uppercase tracking-widest mb-4">
                Select Image Size
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SHAPE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const active = shape === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setShape(opt.value as "rectangle" | "square")}
                      className={`relative flex flex-col items-start gap-3 p-5 rounded-2xl border-2 text-left transition-all group ${active
                        ? "border-[#41cc00] bg-[#f3fbf3] shadow-sm"
                        : "border-black/5 bg-black/[0.01] hover:border-black/10 hover:bg-white"
                        }`}
                    >
                      {/* Shape Visual Preview */}
                      <div className="w-full flex items-center justify-center py-4 rounded-xl bg-black/[0.03]">
                        {opt.value === "rectangle" ? (
                          <div className="w-28 h-16 rounded-lg border-2 border-dashed border-[#41cc00]/40 bg-[#41cc00]/5 flex items-center justify-center">
                            <Maximize2 className="w-5 h-5 text-[#41cc00]/60" />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-lg border-2 border-dashed border-[#093C15]/40 bg-[#093C15]/5 flex items-center justify-center">
                            <Square className="w-5 h-5 text-[#093C15]/60" />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between w-full">
                        <div>
                          <p className="font-bold text-[15px] text-[#1d1d1f]">{opt.label}</p>
                          <p className="text-[12px] text-black/40 font-medium">{opt.desc}</p>
                        </div>
                        {active && (
                          <div className="w-5 h-5 rounded-full bg-[#41cc00] flex items-center justify-center shrink-0">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Dimension Badge */}
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/[0.04] border border-black/5">
                        <Info className="w-3 h-3 text-black/30 shrink-0" />
                        <span className="text-[11px] font-bold text-black/40 tracking-wide">{opt.dims}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Hint for selected shape */}
              <div className="mt-4 flex items-start gap-2 p-4 rounded-xl bg-[#f3fbf3] border border-[#41cc00]/10">
                <Info className="w-4 h-4 text-[#41cc00] mt-0.5 shrink-0" />
                <p className="text-[12px] font-medium text-[#093C15]/70 leading-relaxed">
                  {selectedShape.hint}
                </p>
              </div>
            </div>

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

            {/* Article Image Dimension Guide */}
            <div className="p-6 rounded-2xl bg-[#093C15]/[0.03] border border-[#093C15]/10">
              <h4 className="text-[13px] font-bold text-[#093C15] mb-4 uppercase tracking-widest">
                Image Dimension Guide
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: "Rectangle Ad", dims: "1200 × 628 px", ratio: "16:9", note: "Article bottom / Homepage" },
                  { label: "Square Ad", dims: "600 × 600 px", ratio: "1:1", note: "Sidebar / Social feed" },
                  { label: "Article Cover", dims: "1200 × 630 px", ratio: "1.91:1", note: "Blog post featured image" },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col gap-1 p-4 rounded-xl bg-white border border-black/5 shadow-sm">
                    <span className="text-[11px] font-bold text-black/30 uppercase tracking-widest">{item.label}</span>
                    <span className="text-[15px] font-bold text-[#1d1d1f] tabular-nums">{item.dims}</span>
                    <span className="text-[11px] font-medium text-[#093C15]/60">{item.ratio} — {item.note}</span>
                  </div>
                ))}
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
