"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { upsertArticle } from "@/app/actions/content";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  Eye, Save, Send, Plus, Loader2, ChevronLeft,
  Settings, Share2, Info, Timer, Type, AlignLeft,
  Calendar, User, FolderTree, Tag, Globe, Image as ImageIcon,
  Activity, ArrowUpRight, CheckCircle2, AlertCircle, Layout
} from "lucide-react";
import { GsapReveal } from "@/components/GsapReveal";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

export default function ArticleEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isPreviewing, setIsPreviewing] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featured_image: "",
    og_image_url: "",
    category_id: "",
    author_id: "",
    status: "draft" as "draft" | "published" | "scheduled",
    is_featured: false,
    meta_title: "",
    meta_description: "",
    tags: [] as string[],
    read_time_minutes: 5,
  });

  useEffect(() => {
    async function load() {
      const { data: catData } = await supabase.from("categories").select("id, name");
      if (catData) setCategories(catData);

      const { data: profData } = await supabase.from("profiles").select("id, full_name");
      if (profData) setAuthors(profData);

      if (id) {
        const { data: article } = await supabase.from("articles").select("*").eq("id", id).single();
        if (article) {
          setFormData({
            title: article.title,
            slug: article.slug,
            excerpt: article.excerpt || "",
            content: article.content,
            featured_image: article.featured_image || "",
            og_image_url: article.og_image_url || "",
            category_id: article.category_id || "",
            author_id: article.author_id || "",
            status: article.status,
            is_featured: article.is_featured,
            meta_title: article.meta_title || "",
            meta_description: article.meta_description || "",
            tags: article.tags || [],
            read_time_minutes: article.read_time_minutes || 5,
          });
        }
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setFormData(prev => ({ ...prev, author_id: user.id }));
        }
      }
    }
    load();
  }, [id, supabase]);

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const noHtml = content.replace(/<[^>]*>/g, '');
    const words = noHtml.trim().split(/\s+/).filter(w => w.length > 0).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  };

  const addTag = () => {
    if (tagInput && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const handleSubmit = async (e: React.FormEvent, isPublishing = false) => {
    if (e) e.preventDefault();
    setLoading(true);

    const read_time = calculateReadTime(formData.content);

    try {
      const statusToSave = isPublishing ? "published" : formData.status;
      await upsertArticle({
        ...(id ? { id } : {}),
        ...formData,
        read_time_minutes: read_time,
        status: statusToSave,
      });
      toast.success(isPublishing ? "Article published!" : "Draft saved!");
      router.push("/admin/articles");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Error saving article");
      setLoading(false);
    }
  };

  return (
    <div className="pb-0">
      <form onSubmit={(e) => handleSubmit(e, false)} className="max-w-6xl mx-auto px-6">
        {/* Superior Header - Following second user sketch */}
        <GsapReveal direction="up" className="flex items-center justify-between h-24 mb-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-lg hover:bg-black/5 text-black/40 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold text-[#1d1d1f] font-bricolage tracking-tight">
              {id ? "Edit Article" : "Write New Article"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsPreviewing(true)}
              className="h-10 px-5 rounded-xl text-[13px] font-bold border-black/5 bg-white shadow-sm flex items-center gap-2"
            >
              <Eye className="w-4 h-4 text-[#41cc00]" /> Preview
            </Button>
            <Button
              type="submit"
              variant="secondary"
              isLoading={loading}
              className="h-10 px-5 rounded-xl text-[13px] font-bold border-black/5 bg-white shadow-sm flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Draft
            </Button>
            <Button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              variant="primary"
              isLoading={loading}
              className="h-10 px-6 rounded-xl text-[13px] font-bold bg-[#093C15] text-white flex items-center gap-2 shadow-lg"
            >
              <Send className="w-4 h-4" /> Publish
            </Button>
          </div>
        </GsapReveal>

        <div className="space-y-8">
          {/* SECTION 1: Full-width Editor Card */}
          <GsapReveal direction="up" delay={0.1}>
            <div className="bg-white rounded-3xl border border-black/5 p-8 shadow-sm space-y-8">
              <div className="space-y-4">
                <label className="text-[12px] font-bold text-black/30 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <Type className="w-3 h-3 text-[#41cc00]" /> Post Title
                </label>
                <textarea
                  value={formData.title}
                  onChange={e => setFormData({
                    ...formData,
                    title: e.target.value,
                    slug: id ? formData.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
                  })}
                  placeholder="Enter your compelling title..."
                  className="w-full text-3xl font-bold font-bricolage text-[#1d1d1f] placeholder-black/10 focus:outline-none resize-none leading-tight overflow-hidden bg-black/[0.02] px-6 py-4 rounded-2xl border border-black/5"
                  rows={1}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "auto";
                    target.style.height = target.scrollHeight + "px";
                  }}
                />
              </div>

              <div className="space-y-4">
                <label className="text-[12px] font-bold text-black/30 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <AlignLeft className="w-3 h-3 text-[#41cc00]" /> Content Editor
                </label>
                <div className="relative min-h-[600px]">
                  <RichTextEditor
                    value={formData.content}
                    onChange={(content) => setFormData({ ...formData, content })}
                    placeholder="Start your story here..."
                  />
                </div>
              </div>
            </div>
          </GsapReveal>

          {/* SECTION 2: Split columns for Metadata */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Metadata A: Configuration */}
            <GsapReveal direction="up" delay={0.2}>
              <div className="bg-white rounded-3xl border border-black/5 p-8 shadow-sm h-full flex flex-col space-y-8">
                <h3 className="text-sm font-bold text-[#1d1d1f] uppercase tracking-wider border-b border-black/5 pb-4 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-[#41cc00]" /> Configuration
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-black/30 uppercase ml-1">Visibility</label>
                    <select
                      className="w-full h-12 rounded-xl border border-black/5 bg-black/[0.02] px-4 text-sm font-bold text-[#1d1d1f] focus:outline-none"
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-black/30 uppercase ml-1">Author</label>
                    <select
                      className="w-full h-12 rounded-xl border border-black/5 bg-black/[0.02] px-4 text-sm font-bold text-[#1d1d1f] focus:outline-none"
                      value={formData.author_id}
                      onChange={e => setFormData({ ...formData, author_id: e.target.value })}
                    >
                      <option value="">Select Author</option>
                      {authors.map(a => <option key={a.id} value={a.id}>{a.full_name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-black/30 uppercase ml-1">Category</label>
                    <select
                      className="w-full h-12 rounded-xl border border-black/5 bg-black/[0.02] px-4 text-sm font-bold text-[#1d1d1f] focus:outline-none"
                      value={formData.category_id}
                      onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                    >
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col justify-end">
                    <div
                      className={`flex items-center justify-between p-3.5 rounded-xl border border-black/5 transition-all ${formData.is_featured ? 'bg-[#41cc00]/5 border-[#41cc00]/20' : 'bg-black/[0.02]'}`}
                      onClick={() => setFormData({ ...formData, is_featured: !formData.is_featured })}
                    >
                      <span className="text-sm font-bold text-[#1d1d1f]/60 cursor-pointer">Post Feature</span>
                      <div
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all cursor-pointer ${formData.is_featured ? 'bg-[#41cc00]' : 'bg-black/[0.2]'}`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${formData.is_featured ? 'translate-x-[1.3rem]' : 'translate-x-1'} shadow-sm`} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </GsapReveal>

            {/* Metadata B: Visuals & Labels */}
            <GsapReveal direction="up" delay={0.3}>
              <div className="bg-white rounded-3xl border border-black/5 p-8 shadow-sm h-full flex flex-col space-y-8">
                <h3 className="text-sm font-bold text-[#1d1d1f] uppercase tracking-wider border-b border-black/5 pb-4 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#41cc00]" /> Visuals & Tags
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-1 rounded-2xl bg-black/[0.02] border border-black/5 relative">
                    <style jsx>{`
                    .clean-upload :global(svg) {
                      display: none !important;
                    }

                    /* Remove inner background */
                    .clean-upload :global(div) {
                      background: transparent !important;
                    }

                    /* Remove dashed borders or extra styling if present */
                    .clean-upload :global(*) {
                      border: none !important;
                      box-shadow: none !important;
                    }
                  `}</style>

                    <div className="clean-upload">
                      <ImageUpload
                        value={formData.featured_image}
                        onChange={(url) => setFormData({ ...formData, featured_image: url })}
                        bucket="content"
                        folder="articles"
                        aspectRatio="video"
                        className="bg-transparent"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-3">
                      <label className="text-[11px] font-bold text-black/30 uppercase ml-1">Tags</label>
                      <div className="flex flex-wrap gap-2 min-h-[40px]">
                        {formData.tags.map(tag => (
                          <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#41cc00]/10 text-[#093C15] text-[11px] font-bold transition-all hover:bg-black/5 hover:text-black/60 group cursor-pointer">
                            {tag}
                            <button type="button" onClick={() => removeTag(tag)} className="opacity-40 group-hover:opacity-100">
                              <Plus className="w-2.5 h-2.5 rotate-45" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="relative">
                        <Input
                          value={tagInput}
                          onChange={e => setTagInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                          placeholder="Add Tags..."
                          className="h-10 text-[13px] bg-black/[0.02] border-black/5 pr-10"
                        />
                        <button
                          type="button"
                          onClick={addTag}
                          className="absolute right-2 top-2 p-1 rounded-lg bg-white border border-black/5 text-[#093C15] hover:bg-[#41cc00] hover:text-white transition-all shadow-sm"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </GsapReveal>
          </div>

          {/* SECTION 3: Full-width SEO Analysis */}
          <GsapReveal direction="up" delay={0.4}>
            <div className="bg-white rounded-[2rem] border border-black/5 p-10 shadow-sm space-y-10">
              <div className="flex items-center justify-between border-b border-black/5 pb-8">
                <div>
                  <h3 className="text-2xl font-bold text-[#1d1d1f] font-bricolage flex items-center gap-3">
                    <Globe className="w-7 h-7 text-[#41cc00]" /> SEO and Search Integrity
                  </h3>
                  <p className="text-[13px] text-black/30 font-bold uppercase tracking-widest mt-2 ml-10">Real-time Search Fidelity Analysis</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-[#f5f5f7] flex items-center justify-center text-black/10">
                  <ArrowUpRight className="w-6 h-6" />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-stretch">
                <div className="space-y-8 h-full flex flex-col">
                  <div className="space-y-3">
                    <label className="text-[11px] font-bold text-black/30 uppercase tracking-[0.1em]">Target SEO Title</label>
                    <Input
                      value={formData.meta_title}
                      onChange={e => setFormData({ ...formData, meta_title: e.target.value })}
                      placeholder="Enter a title optimized for search engine results..."
                      className="h-14 text-base font-bold bg-black/[0.02] border-black/5 px-6 rounded-2xl"
                    />
                  </div>
                  <div className="space-y-3 flex-1 flex flex-col">
                    <label className="text-[11px] font-bold text-black/30 uppercase tracking-[0.1em]">Search Meta Description</label>
                    <textarea
                      value={formData.meta_description}
                      onChange={e => setFormData({ ...formData, meta_description: e.target.value })}
                      placeholder="Brief summary that will appear in search results. Make it compelling to drive more clicks."
                      className="w-full flex-1 rounded-2xl border border-black/5 bg-black/[0.02] px-6 py-4 text-base font-medium text-[#1d1d1f] focus:outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-8">
                  <label className="text-[11px] font-bold text-black/30 uppercase tracking-[0.1em]">Google Snippet Analysis</label>
                  <div className="p-10 rounded-[2.5rem] bg-white border border-[#dadce0] font-sans shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full flex flex-col justify-between">
                    <div className="text-[#202124] text-sm mb-3 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-white border border-black/5 overflow-hidden flex items-center justify-center">
                        <img src="/images/logo.png" className="w-5 h-5 object-contain" alt="Tela" />
                      </div>
                      <div>
                        <span className="block font-bold text-sm">Tela Insights</span>
                        <span className="text-[#5f6368] text-xs">https://tela.ng/blog/{formData.slug || 'permalink'}</span>
                      </div>
                    </div>
                    <h4 className="text-[#1a0dab] text-xl font-medium hover:underline cursor-pointer truncate mb-1">
                      {formData.meta_title || formData.title || 'Your Search Optimized Title'}
                    </h4>
                    <p className="text-[#4d5156] text-[14px] line-clamp-3 leading-relaxed">
                      {formData.meta_description || formData.excerpt || 'This snippet is a simulation of how your article will be displayed to users in Google search results. Ensure your most important keywords are near the beginning.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-black/5 pt-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-stretch">
                {/* Open Graph Social Image */}
                <div className="space-y-4 h-full flex flex-col">
                  <label className="text-[11px] font-bold text-black/30 uppercase ml-1 flex items-center gap-2">
                    <Share2 className="w-3.5 h-3.5 text-[#41cc00]" /> Open Graph Social Image
                  </label>

                  <div className="p-8 rounded-[2rem] bg-black/[0.02] border border-black/5 flex-1 flex flex-col justify-center">
                    <style jsx>{`
                  /* Clean up ImageUpload inner styles */
                  .og-clean :global(div) { background: transparent !important; }
                  .og-clean :global(*) { border: none !important; box-shadow: none !important; }
                `}</style>
                    <div className="og-clean flex-1">
                      <ImageUpload
                        value={formData.og_image_url}
                        onChange={(url) => setFormData({ ...formData, og_image_url: url })}
                        bucket="content"
                        folder="seo"
                        aspectRatio="video"
                        className="bg-transparent h-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Distribution & Read Time */}
                <div className="space-y-4 h-full flex flex-col">
                  <label className="text-[11px] font-bold text-black/30 uppercase ml-1 flex items-center gap-2">
                    <Timer className="w-3.5 h-3.5 text-[#41cc00]" /> Distribution & Read Time
                  </label>

                  <div className="p-8 rounded-[2rem] bg-black/[0.015] border border-black/5 flex-1 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#1d1d1f]/40 uppercase">Read Time Intelligence</span>
                      <span className="text-sm font-bold text-[#093C15] bg-[#41cc00]/10 px-4 py-1.5 rounded-lg">{calculateReadTime(formData.content)} MINUTES</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#1d1d1f]/40 uppercase">Content Permalink</span>
                      <span className="text-sm font-bold text-[#093C15]">/{formData.slug}</span>
                    </div>

                    <div className="pt-6 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#41cc00] flex items-center justify-center shadow-[0_4px_20px_rgba(65,204,0,0.3)]">
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#1d1d1f]">Integrity Verification Passed</p>
                        <p className="text-[11px] font-bold text-[#1d1d1f]/30 uppercase tracking-widest mt-0.5">Content ready for global indexing</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </GsapReveal>
        </div>
      </form>

      {/* Preview Overlay */}
      {isPreviewing && (
        <div className="fixed inset-0 z-[100] bg-white overflow-y-auto animate-in slide-in-from-bottom-8 duration-500">
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-black/5 px-8 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="px-5 py-1.5 bg-[#41cc00]/10 text-[#093C15] text-[12px] font-bold rounded-xl uppercase tracking-widest border border-[#41cc00]/10">Preview Console</span>
              <h2 className="text-base font-bold text-[#1d1d1f] max-w-sm truncate">{formData.title || "Untitled Post"}</h2>
            </div>
            <Button onClick={() => setIsPreviewing(false)} className="h-10 px-8 rounded-2xl border-black/5 hover:bg-black/5 text-[#1d1d1f] font-bold shadow-sm">Exit Preview</Button>
          </div>

          <div className="max-w-[850px] mx-auto px-8 py-24">
            {formData.featured_image && (
              <div className="w-full aspect-video rounded-[2.5rem] overflow-hidden mb-16 shadow-[0_30px_100px_rgba(0,0,0,0.06)] relative ring-1 ring-black/5">
                <img src={formData.featured_image} className="w-full h-full object-cover" alt="Preview" />
              </div>
            )}
            <h1 className="text-6xl font-bold text-[#1d1d1f] font-bricolage mb-10 leading-[1.1] tracking-tighter">{formData.title || "Your New Insight"}</h1>

            <div className="flex items-center gap-10 mb-20 py-10 border-y border-black/5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-black/[0.03] border border-black/5 flex items-center justify-center text-black/10">
                  <User className="w-7 h-7" />
                </div>
                <div>
                  <span className="block text-base font-bold text-[#1d1d1f]">Editorial Board</span>
                  <span className="block text-[13px] text-black/30 font-bold uppercase tracking-widest mt-0.5">{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
              <div className="h-12 w-px bg-black/5" />
              <div className="flex items-center gap-3 text-black/30 text-[13px] font-bold uppercase tracking-[0.25em]">
                <Timer className="w-5 h-5" />
                <span>{calculateReadTime(formData.content)} MIN READ</span>
              </div>
            </div>

            <div
              className="prose prose-xl max-w-none text-[#1d1d1f]/90 leading-[1.9] font-medium"
              dangerouslySetInnerHTML={{ __html: formData.content || "<p className='text-black/10 italic text-2xl text-center py-20'>Content stream will emerge here...</p>" }}
            />

            <div className="mt-32 pt-16 border-t border-black/5 flex flex-wrap gap-5">
              {formData.tags.map(tag => (
                <span key={tag} className="px-6 py-3 rounded-2xl bg-[#f5f5f7] border border-black/5 text-[#1d1d1f] text-sm font-bold shadow-sm transition-all hover:bg-[#41cc00] hover:text-white cursor-pointer">#{tag}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
