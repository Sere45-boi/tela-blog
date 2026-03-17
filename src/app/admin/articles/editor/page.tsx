"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { upsertArticle } from "@/app/actions/content";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Eye, Save, Send, Plus, Loader2, ChevronLeft, Layout, Globe, Image as ImageIcon, BarChart, Settings, Share2, Info } from "lucide-react";
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
        // Set default author to current user for new articles
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
    const words = noHtml.trim().split(/\s+/).length;
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
      router.push("/admin/articles");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Error saving article");
      setLoading(false);
    }
  };

  return (
    <form className="max-w-6xl pb-20" onSubmit={(e) => handleSubmit(e, false)}>
      <GsapReveal direction="up" className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1d1d1f] font-bricolage">{id ? "Edit Post" : "Draft New Post"}</h1>
          <p className="text-[#1d1d1f]/60 mt-1">Refine your ideas and prepare for publication.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.back()} type="button" className="rounded-xl border-black/5">Cancel</Button>
          <Button variant="secondary" type="submit" isLoading={loading} className="gap-2 rounded-xl border-black/5 bg-white shadow-sm">
            <Save className="h-4 w-4" /> Save Draft
          </Button>
          <Button variant="primary" type="button" onClick={(e) => handleSubmit(e, true)} isLoading={loading} className="gap-2 rounded-xl bg-[#093C15] text-white">
            <Send className="h-4 w-4" /> Publish Post
          </Button>
        </div>
      </GsapReveal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <GsapReveal direction="up" delay={0.1}>
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-black/5 p-8 shadow-sm space-y-8">
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider ml-1">Post Title</label>
                <Input 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value, slug: id ? formData.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')})} 
                  placeholder="The Future of Digital Growth..." 
                  required
                  className="text-xl font-bold h-14 rounded-xl bg-black/[0.02] border-black/5 px-6"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider ml-1">Content Editor</label>
                <div className="rounded-2xl border border-black/5 overflow-hidden bg-black/[0.01]">
                  <RichTextEditor
                    value={formData.content}
                    onChange={(content) => setFormData({...formData, content})}
                    placeholder="Tell your story..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider ml-1">Excerpt & Summary</label>
                <textarea 
                  className="w-full h-32 rounded-xl border border-black/5 bg-black/[0.02] p-4 text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#41cc00]/20 focus:border-[#41cc00] transition-all resize-none text-sm font-medium"
                  value={formData.excerpt}
                  onChange={e => setFormData({...formData, excerpt: e.target.value})}
                  placeholder="A compelling summary for the catalog..."
                />
              </div>

              <div className="space-y-4">
                <label className="text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider ml-1">Tags</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#41cc00]/10 text-[#093C15] text-[13px] font-bold">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
                        <Plus className="w-3.5 h-3.5 rotate-45" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input 
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add a tag..."
                    className="bg-black/[0.02] border-black/5 h-11"
                  />
                  <Button type="button" onClick={addTag} variant="secondary" className="h-11 px-6 rounded-xl border-black/5 bg-white">Add</Button>
                </div>
              </div>
            </div>
          </GsapReveal>
        </div>

        <div className="space-y-8">
          <GsapReveal direction="up" delay={0.2}>
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-black/5 p-6 shadow-sm space-y-6">
              <h3 className="text-sm font-bold text-[#1d1d1f] uppercase tracking-wider border-b border-black/5 pb-4">Configuration</h3>
              
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider ml-1">Primary Author</label>
                <select 
                  className="w-full h-11 rounded-xl border border-black/5 bg-black/[0.02] px-4 text-sm font-medium text-[#1d1d1f] focus:outline-none"
                  value={formData.author_id}
                  onChange={e => setFormData({...formData, author_id: e.target.value})}
                >
                  <option value="">Assign Author</option>
                  {authors.map(a => (
                    <option key={a.id} value={a.id}>{a.full_name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider ml-1">Category</label>
                <select 
                  className="w-full h-11 rounded-xl border border-black/5 bg-black/[0.02] px-4 text-sm font-medium text-[#1d1d1f] focus:outline-none"
                  value={formData.category_id}
                  onChange={e => setFormData({...formData, category_id: e.target.value})}
                >
                  <option value="">Select a category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider ml-1">URL Semantic Slug</label>
                <Input 
                  value={formData.slug} 
                  onChange={e => setFormData({...formData, slug: e.target.value})} 
                  placeholder="post-url-slug" 
                  required
                  className="bg-black/[0.02] border-black/5 h-11"
                />
              </div>

              <div className="space-y-6">
                <ImageUpload 
                  value={formData.featured_image}
                  onChange={(url: string) => setFormData({...formData, featured_image: url})}
                  label="Featured Image"
                  bucket="content"
                  folder="articles"
                  aspectRatio="video"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-black/[0.05] transition-colors cursor-pointer border border-black/5">
                  <input 
                    type="checkbox" 
                    id="featured" 
                    checked={formData.is_featured}
                    onChange={e => setFormData({...formData, is_featured: e.target.checked})}
                    className="absolute h-full w-full opacity-0 cursor-pointer z-10"
                  />
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${formData.is_featured ? 'translate-x-6' : 'translate-x-1'}`} />
                </div>
                <label htmlFor="featured" className="text-sm font-bold text-[#1d1d1f]/60 cursor-pointer">Feature on Landing Page</label>
              </div>
            </div>
          </GsapReveal>

          <GsapReveal direction="up" delay={0.3}>
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-black/5 p-6 shadow-sm space-y-6">
              <h3 className="text-sm font-bold text-[#1d1d1f] uppercase tracking-wider border-b border-black/5 pb-4 flex items-center justify-between">
                <span>SEO Optimization</span>
                <Eye className="h-4 w-4 text-[#1d1d1f]/30" />
              </h3>
              
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider ml-1">Meta Title</label>
                <Input 
                  value={formData.meta_title} 
                  onChange={e => setFormData({...formData, meta_title: e.target.value})} 
                  placeholder="Optimal SEO Title" 
                  className="bg-black/[0.02] border-black/5 h-11"
                />
                <p className="text-[10px] font-bold text-[#1d1d1f]/30 uppercase text-right">{formData.meta_title.length}/60</p>
              </div>

              <div className="space-y-6">
                <ImageUpload 
                  value={formData.og_image_url}
                  onChange={(url: string) => setFormData({...formData, og_image_url: url})}
                  label="OG Share Image"
                  bucket="content"
                  folder="seo"
                  aspectRatio="video"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider ml-1">Description</label>
                <textarea 
                  className="w-full h-24 rounded-xl border border-black/5 bg-black/[0.02] p-3 text-sm text-[#1d1d1f] focus:outline-none transition-all resize-none font-medium"
                  value={formData.meta_description}
                  onChange={e => setFormData({...formData, meta_description: e.target.value})}
                  placeholder="Compelling snippet for Google..."
                />
                <p className="text-[10px] font-bold text-[#1d1d1f]/30 uppercase text-right">{formData.meta_description.length}/160</p>
              </div>

              {/* Google Snippet preview */}
              <div className="mt-4 p-5 rounded-2xl bg-white border border-[#dadce0] font-sans shadow-sm">
                <div className="text-[#202124] text-xs mb-2 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-sm bg-[#f1f3f4] flex items-center justify-center font-bold text-[#5f6368] text-[10px]">T</div>
                  <div>
                    <span className="block font-bold">Tela Insights</span>
                    <span className="text-[#5f6368]">https://tela.ng/blog/{formData.slug || 'slug'}</span>
                  </div>
                </div>
                <p className="text-[#4d5156] text-[14px] line-clamp-2 leading-normal">
                  {formData.meta_description || formData.excerpt || 'Compelling meta description for Google snippet preview...'}
                </p>
              </div>
            </div>
          </GsapReveal>
        </div>
      </div>
    </form>
  );
}
