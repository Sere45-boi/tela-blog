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
import DOMPurify from "dompurify";

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

      {/* Premium Cinematic Preview Overlay */}
      {isPreviewing && (
        <div data-lenis-prevent className="fixed inset-0 z-[100] bg-[#f8fcf8] overflow-y-auto overflow-x-hidden overscroll-contain animate-in fade-in zoom-in-95 duration-500 font-poppins selection:bg-[#41cc00]/30 selection:text-[#093C15]">
          
          {/* Subtle Background Elements */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#41cc00]/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#093C15]/5 rounded-full blur-[150px] translate-y-1/2 -translate-x-1/4" />
          </div>

          {/* Floating Glass Toolbar */}
          <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl px-2">
            <div className="bg-white/70 backdrop-blur-3xl border border-black/5 shadow-[0_8px_32px_rgba(0,0,0,0.06)] rounded-full h-16 px-4 flex items-center justify-between">
              <div className="flex items-center gap-3 pl-2">
                <div className="w-8 h-8 rounded-full bg-[#41cc00]/10 flex items-center justify-center -ml-1">
                  <Eye className="w-4 h-4 text-[#093C15]" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-black/40 uppercase tracking-widest leading-none mb-1">Preview Mode</div>
                  <div className="text-[14px] font-bold text-[#1d1d1f] leading-none max-w-[200px] truncate">{formData.title || "Untitled Draft"}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-black/[0.03] border border-black/5 mr-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  <span className="text-[11px] font-bold text-black/50 uppercase tracking-widest">{formData.status}</span>
                </div>
                <Button 
                  onClick={() => setIsPreviewing(false)} 
                  variant="secondary"
                  className="h-10 rounded-full px-6 bg-black/[0.03] border-none hover:bg-black/10 text-[#1d1d1f] font-bold shadow-none transition-all group"
                >
                  <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                  Return to Editor
                </Button>
              </div>
            </div>
          </div>

          {/* Main Editorial Content */}
          <div className="relative z-10 w-full max-w-[900px] mx-auto pt-40 pb-32 px-6 sm:px-12">
            
            {/* Hero Image */}
            {formData.featured_image ? (
              <GsapReveal direction="up" delay={0.1} className="w-full aspect-[21/9] rounded-[2.5rem] overflow-hidden mb-16 shadow-[0_30px_100px_rgba(0,0,0,0.12)] relative ring-1 ring-black/5 bg-black/5 group">
                <img 
                  src={formData.featured_image} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                  alt="Featured Hero" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </GsapReveal>
            ) : (
              <div className="w-full aspect-[21/9] rounded-[2.5rem] bg-black/[0.02] border border-black/5 mb-16 flex items-center justify-center flex-col gap-4 text-black/20">
                <ImageIcon className="w-12 h-12" />
                <span className="text-sm font-bold uppercase tracking-widest">No Featured Image</span>
              </div>
            )}

            {/* Header Content */}
            <GsapReveal direction="up" delay={0.2} className="text-center max-w-[800px] mx-auto mb-16">
              <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
                {categories.find(c => c.id === formData.category_id) && (
                  <span className="px-4 py-1.5 rounded-full bg-[#093C15] text-white text-[11px] font-bold uppercase tracking-widest shadow-md hover:bg-[#0a5a1f] transition-colors cursor-default">
                    {categories.find(c => c.id === formData.category_id)?.name}
                  </span>
                )}
                {formData.is_featured && (
                  <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-400 to-rose-400 text-white text-[11px] font-bold uppercase tracking-widest shadow-md">
                    Featured
                  </span>
                )}
              </div>
              
              <h1 className="text-5xl sm:text-7xl font-bold text-[#1d1d1f] font-bricolage mb-8 leading-[1.1] tracking-tighter text-balance">
                {formData.title || "Your New Masterpiece Begins Here"}
              </h1>

              {formData.excerpt && (
                <p className="text-xl sm:text-2xl text-[#1d1d1f]/60 font-medium leading-[1.6] text-balance mb-12">
                  {formData.excerpt}
                </p>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 py-8 border-y border-black/5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-white shadow-md border border-black/5 flex items-center justify-center text-black/10 relative overflow-hidden">
                    {authors.find(a => a.id === formData.author_id) ? (
                      <span className="text-lg font-bold text-[#093C15]">
                        {authors.find(a => a.id === formData.author_id)?.full_name?.slice(0, 2).toUpperCase()}
                      </span>
                    ) : (
                      <img src="/images/logo.png" className="w-6 h-6 object-contain grayscale opacity-50" alt="Author" />
                    )}
                  </div>
                  <div className="text-left">
                    <span className="block text-base font-bold text-[#1d1d1f]">
                      {authors.find(a => a.id === formData.author_id)?.full_name || "The Tela Board"}
                    </span>
                    <span className="block text-[12px] text-black/40 font-bold uppercase tracking-widest mt-0.5">
                      {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                
                <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-black/10" />
                
                <div className="flex items-center gap-3 text-black/40 text-[12px] font-bold uppercase tracking-widest bg-black/[0.02] px-5 py-2.5 rounded-2xl border border-black/5">
                  <Timer className="w-4 h-4 text-[#41cc00]" />
                  <span>{calculateReadTime(formData.content)} Minute Read</span>
                </div>
              </div>
            </GsapReveal>

            {/* Rich Text Output */}
            <GsapReveal direction="up" delay={0.3} className="max-w-[750px] mx-auto">
              <div
                className="prose prose-lg sm:prose-xl max-w-none 
                  prose-headings:font-bricolage prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-[#1d1d1f]
                  prose-p:font-poppins prose-p:text-[#1d1d1f]/80 prose-p:leading-[1.8] prose-p:font-medium
                  prose-a:text-[#41cc00] prose-a:font-bold prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-[#093C15] prose-strong:font-bold
                  prose-blockquote:border-l-[#41cc00] prose-blockquote:bg-[#41cc00]/5 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-2xl prose-blockquote:text-[#093C15]/80 prose-blockquote:font-medium prose-blockquote:italic
                  prose-img:rounded-3xl prose-img:shadow-2xl prose-img:border prose-img:border-black/5
                  marker:text-[#41cc00]"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formData.content || "<p className='text-black/20 italic text-2xl text-center py-20 font-light'>Your story will unfold here...</p>") }}
              />

              {/* Tags */}
              {formData.tags.length > 0 && (
                <div className="mt-24 pt-12 border-t border-black/5 flex flex-wrap justify-center gap-3">
                  {formData.tags.map(tag => (
                    <span key={tag} className="px-5 py-2 rounded-xl bg-white border border-black/5 text-[#1d1d1f]/60 text-sm font-bold shadow-sm transition-all hover:bg-[#093C15] hover:text-white hover:border-[#093C15] hover:shadow-md cursor-pointer hover:-translate-y-0.5">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </GsapReveal>

          </div>
        </div>
      )}
    </div>
  );
}
