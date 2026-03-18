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
    <div className="min-h-screen bg-[#fbfbfd] pb-20">
      <form onSubmit={(e) => handleSubmit(e, false)} className="max-w-7xl mx-auto px-6">
        {/* Superior Header - Following user sketch */}
        <GsapReveal direction="up" className="flex items-center justify-between h-24 mb-6">
          <div className="flex items-center gap-4">
            <button 
              type="button"
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-lg hover:bg-black/5 text-black/40 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold text-[#1d1d1f] font-bricolage tracking-tight">
              {id ? "Edit Article" : "Draft New Article"}
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <Button 
              type="button"
              variant="ghost" 
              onClick={() => setIsPreviewing(true)} 
              className="h-10 px-6 rounded-xl text-[13px] font-bold border-black/5 bg-white shadow-sm flex items-center gap-2"
            >
              <Eye className="w-4 h-4 text-[#41cc00]" /> Preview
            </Button>
            <Button 
              type="submit"
              variant="secondary" 
              isLoading={loading} 
              className="h-10 px-6 rounded-xl text-[13px] font-bold border-black/5 bg-white shadow-sm flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Draft
            </Button>
            <Button 
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              variant="primary" 
              isLoading={loading} 
              className="h-10 px-7 rounded-xl text-[13px] font-bold bg-[#093C15] text-white flex items-center gap-2 shadow-lg"
            >
              <Send className="w-4 h-4" /> Publish
            </Button>
          </div>
        </GsapReveal>

        {/* Global Page Layout - Unified Scrolling as per sketch */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT: Editor & Title (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-8">
            <GsapReveal direction="up" delay={0.1} className="flex-1">
              <div className="bg-white rounded-3xl border border-black/5 p-8 shadow-sm space-y-8 h-full flex flex-col">
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
                    className="w-full text-4xl font-bold font-bricolage text-[#1d1d1f] placeholder-black/10 focus:outline-none resize-none leading-[1.2] overflow-hidden bg-black/[0.02] p-6 rounded-2xl border border-black/5"
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
                    <AlignLeft className="w-3 h-3 text-[#41cc00]" /> Content
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
          </div>

          {/* RIGHT: Metadata Cards (lg:col-span-1) */}
          <div className="lg:col-span-1 space-y-8">
            {/* Card 1: Configuration */}
            <GsapReveal direction="up" delay={0.2}>
              <div className="bg-white rounded-3xl border border-black/5 p-6 shadow-sm space-y-6">
                <h3 className="text-sm font-bold text-[#1d1d1f] uppercase tracking-wider border-b border-black/5 pb-4 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-[#41cc00]" /> Configuration
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-black/30 uppercase ml-1">Visibility</label>
                    <select 
                      className="w-full h-11 rounded-xl border border-black/5 bg-black/[0.02] px-4 text-sm font-bold text-[#1d1d1f] focus:outline-none"
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value as any})}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-black/30 uppercase ml-1">Author</label>
                    <select 
                      className="w-full h-11 rounded-xl border border-black/5 bg-black/[0.02] px-4 text-sm font-bold text-[#1d1d1f] focus:outline-none"
                      value={formData.author_id}
                      onChange={e => setFormData({...formData, author_id: e.target.value})}
                    >
                      <option value="">Select Author</option>
                      {authors.map(a => <option key={a.id} value={a.id}>{a.full_name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-black/30 uppercase ml-1">Category</label>
                    <select 
                      className="w-full h-11 rounded-xl border border-black/5 bg-black/[0.02] px-4 text-sm font-bold text-[#1d1d1f] focus:outline-none"
                      value={formData.category_id}
                      onChange={e => setFormData({...formData, category_id: e.target.value})}
                    >
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm font-bold text-[#1d1d1f]/60">Homepage Feature</span>
                    <div 
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer border border-black/5 ${formData.is_featured ? 'bg-[#41cc00]' : 'bg-black/[0.05]'}`}
                      onClick={() => setFormData({...formData, is_featured: !formData.is_featured})}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${formData.is_featured ? 'translate-x-6' : 'translate-x-1'} shadow-sm`} />
                    </div>
                  </div>
                </div>
              </div>
            </GsapReveal>

            {/* Card 2: Media & Labels */}
            <GsapReveal direction="up" delay={0.3}>
              <div className="bg-white rounded-3xl border border-black/5 p-6 shadow-sm space-y-6">
                <h3 className="text-sm font-bold text-[#1d1d1f] uppercase tracking-wider border-b border-black/5 pb-4 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#41cc00]" /> Visuals & Tags
                </h3>
                
                <div className="space-y-6">
                  <div className="p-1 rounded-2xl bg-black/[0.02] border border-black/5">
                    <ImageUpload 
                      value={formData.featured_image}
                      onChange={(url) => setFormData({...formData, featured_image: url})}
                      bucket="content"
                      folder="articles"
                      aspectRatio="video"
                      className="bg-transparent"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[11px] font-bold text-black/30 uppercase ml-1">Tags</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.tags.map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#41cc00]/10 text-[#093C15] text-[12px] font-bold transition-all hover:bg-black/5 hover:text-black/60 group cursor-pointer">
                          {tag}
                          <button type="button" onClick={() => removeTag(tag)} className="opacity-40 group-hover:opacity-100">
                            <Plus className="w-3 h-3 rotate-45" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="relative">
                      <Input 
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        placeholder="Add tag..."
                        className="h-10 text-[13px] bg-black/[0.02] border border-black/5 pr-10"
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
                  
                  <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/5 break-all">
                    <label className="text-[11px] font-bold text-black/20 uppercase block h-4 mb-1">Article Permalink</label>
                    <input 
                      value={formData.slug} 
                      onChange={e => setFormData({...formData, slug: e.target.value})} 
                      className="bg-transparent border-none text-[13px] font-bold text-[#093C15] w-full focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </GsapReveal>
          </div>

          {/* BOTTOM: Full Width SEO Optimization (lg:col-span-3) */}
          <div className="lg:col-span-3">
            <GsapReveal direction="up" delay={0.4}>
              <div className="bg-white rounded-[2rem] border border-black/5 p-8 shadow-sm space-y-8">
                <div className="flex items-center justify-between border-b border-black/5 pb-6">
                  <h3 className="text-xl font-bold text-[#1d1d1f] font-bricolage flex items-center gap-3">
                    <Globe className="w-6 h-6 text-[#41cc00]" /> SEO Optimization & Search Integrity
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#41cc00] bg-[#41cc00]/10 px-3 py-1 rounded-full uppercase tracking-widest">Live Preview Enabled</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[12px] font-bold text-black/30 uppercase tracking-[0.1em]">Meta Title Tag</label>
                      <Input 
                        value={formData.meta_title} 
                        onChange={e => setFormData({...formData, meta_title: e.target.value})} 
                        placeholder="Page title displayed in search results..." 
                        className="h-14 text-base font-bold bg-black/[0.02] border-black/5 px-6"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[12px] font-bold text-black/30 uppercase tracking-[0.1em]">Meta Description</label>
                      <textarea 
                        value={formData.meta_description} 
                        onChange={e => setFormData({...formData, meta_description: e.target.value})} 
                        placeholder="Brief summary used by search engines..." 
                        className="w-full h-32 rounded-2xl border border-black/5 bg-black/[0.02] p-6 text-base font-medium text-[#1d1d1f] focus:outline-none resize-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                     <label className="text-[12px] font-bold text-black/30 uppercase tracking-[0.1em]">Google Snippet Preview</label>
                     <div className="p-8 rounded-[2rem] bg-white border border-[#dadce0] font-sans shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-[#202124] text-sm mb-2 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#f1f3f4] flex items-center justify-center font-bold text-[#5f6368] text-[10px]">T</div>
                          <div>
                            <span className="block font-bold text-sm">Tela Insights</span>
                            <span className="text-[#5f6368] text-xs">https://tela.ng/blog/{formData.slug || 'slug'}</span>
                          </div>
                        </div>
                        <h4 className="text-[#1a0dab] text-xl font-medium hover:underline cursor-pointer truncate mb-1">
                          {formData.meta_title || formData.title || 'Your Compelling Page Title'}
                        </h4>
                        <p className="text-[#4d5156] text-[14px] line-clamp-3 leading-relaxed">
                          {formData.meta_description || formData.excerpt || 'This description is what users will see when your article appears in search results. Make it compelling to drive more clicks to your insightful content.'}
                        </p>
                     </div>
                     
                     <div className="flex items-center gap-6 pt-2">
                        <div className="flex-1 space-y-2">
                           <div className="flex justify-between text-[11px] font-bold text-black/30 uppercase">
                              <span>Title Length</span>
                              <span>{formData.meta_title.length}/60</span>
                           </div>
                           <div className="h-1.5 w-full bg-black/[0.03] rounded-full overflow-hidden">
                              <div className={`h-full transition-all duration-500 rounded-full ${formData.meta_title.length > 60 ? 'bg-red-500' : 'bg-[#41cc00]'}`} style={{ width: `${Math.min(100, (formData.meta_title.length / 60) * 100)}%` }} />
                           </div>
                        </div>
                        <div className="flex-1 space-y-2">
                           <div className="flex justify-between text-[11px] font-bold text-black/30 uppercase">
                              <span>Description Length</span>
                              <span>{formData.meta_description.length}/160</span>
                           </div>
                           <div className="h-1.5 w-full bg-black/[0.03] rounded-full overflow-hidden">
                              <div className={`h-full transition-all duration-500 rounded-full ${formData.meta_description.length > 160 ? 'bg-red-500' : 'bg-[#41cc00]'}`} style={{ width: `${Math.min(100, (formData.meta_description.length / 160) * 100)}%` }} />
                           </div>
                        </div>
                     </div>
                  </div>
                </div>

                <div className="border-t border-black/5 pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <label className="text-[12px] font-bold text-black/30 uppercase tracking-[0.1em] ml-1 flex items-center gap-2">
                        <Share2 className="w-3 h-3 text-[#41cc00]" /> Social Graph Preview [OG Image]
                      </label>
                      <div className="p-1 rounded-2xl bg-black/[0.02] border border-black/5">
                        <ImageUpload 
                          value={formData.og_image_url}
                          onChange={(url) => setFormData({...formData, og_image_url: url})}
                          bucket="content"
                          folder="seo"
                          aspectRatio="video"
                          className="bg-transparent"
                        />
                      </div>
                   </div>
                   <div className="space-y-4">
                      <label className="text-[12px] font-bold text-black/30 uppercase tracking-[0.1em] ml-1 flex items-center gap-2">
                        <Timer className="w-3 h-3 text-[#41cc00]" /> Distribution Info
                      </label>
                      <div className="p-6 rounded-2xl bg-[#093C15]/[0.02] border border-[#093C15]/5 space-y-4">
                         <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-[#1d1d1f]/60">Estimated Read Time</span>
                            <span className="text-sm font-bold text-[#093C15]">{calculateReadTime(formData.content)} min</span>
                         </div>
                         <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-[#1d1d1f]/60">Slug Preview</span>
                            <span className="text-sm font-bold text-[#093C15]">/{formData.slug}</span>
                         </div>
                         <div className="pt-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#41cc00]/10 flex items-center justify-center">
                               <CheckCircle2 className="w-5 h-5 text-[#41cc00]" />
                            </div>
                            <p className="text-[11px] font-bold text-[#1d1d1f]/40 uppercase leading-normal">Your content is being optimized for accessibility and search fidelity.</p>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </GsapReveal>
          </div>
        </div>
      </form>

      {/* Preview Overlay */}
      {isPreviewing && (
        <div className="fixed inset-0 z-[100] bg-white overflow-y-auto animate-in slide-in-from-bottom-8 duration-500">
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-black/5 px-8 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-[#41cc00]/10 text-[#093C15] text-[11px] font-bold rounded-lg uppercase tracking-widest">Live Preview</span>
              <h2 className="text-sm font-bold text-[#1d1d1f] max-w-sm truncate">{formData.title || "Untitled Post"}</h2>
            </div>
            <Button onClick={() => setIsPreviewing(false)} className="h-10 px-6 rounded-xl border-black/5 hover:bg-black/5 text-[#1d1d1f] font-bold">Exit Preview</Button>
          </div>

          <div className="max-w-[800px] mx-auto px-8 py-24">
            {formData.featured_image && (
              <div className="w-full aspect-video rounded-3xl overflow-hidden mb-16 shadow-2xl relative">
                <img src={formData.featured_image} className="w-full h-full object-cover" alt="Preview" />
              </div>
            )}
            <h1 className="text-6xl font-bold text-[#1d1d1f] font-bricolage mb-10 leading-[1.1] tracking-tight">{formData.title || "Your Story Starts Here"}</h1>
            
            <div className="flex items-center gap-8 mb-16 py-8 border-y border-black/5">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-black/[0.03] border border-black/5 flex items-center justify-center text-black/20">
                    <User className="w-6 h-6" />
                 </div>
                 <div>
                    <span className="block text-[15px] font-bold text-[#1d1d1f]">Assigned Author</span>
                    <span className="block text-[13px] text-black/30 font-medium">{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                 </div>
              </div>
              <div className="h-10 w-px bg-black/5" />
              <div className="flex items-center gap-2.5 text-black/30 text-[12px] font-bold uppercase tracking-[0.2em]">
                 <Timer className="w-4 h-4" />
                 <span>{calculateReadTime(formData.content)} MIN READ</span>
              </div>
            </div>

            <div 
              className="prose prose-xl max-w-none text-[#1d1d1f]/90 leading-[1.8] font-medium"
              dangerouslySetInnerHTML={{ __html: formData.content || "<p className='text-black/10 italic text-2xl text-center py-20'>Content will appear here...</p>" }}
            />

            <div className="mt-24 pt-12 border-t border-black/5 flex flex-wrap gap-4">
              {formData.tags.map(tag => (
                <span key={tag} className="px-5 py-2.5 rounded-2xl bg-[#fbfbfd] border border-black/5 text-[#1d1d1f] text-sm font-bold shadow-sm">#{tag}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
