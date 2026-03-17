"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { upsertArticle } from "@/app/actions/content";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Eye, Save, Send } from "lucide-react";
import { GsapReveal } from "@/components/GsapReveal";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

export default function ArticleEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featured_image: "",
    category_id: "",
    status: "draft" as "draft" | "published" | "scheduled",
    is_featured: false,
    meta_title: "",
    meta_description: "",
  });

  useEffect(() => {
    async function load() {
      const { data: catData } = await supabase.from("categories").select("id, name");
      if (catData) setCategories(catData);

      if (id) {
        const { data: article } = await supabase.from("articles").select("*").eq("id", id).single();
        if (article) {
          setFormData({
            title: article.title,
            slug: article.slug,
            excerpt: article.excerpt || "",
            content: article.content,
            featured_image: article.featured_image || "",
            category_id: article.category_id || "",
            status: article.status,
            is_featured: article.is_featured,
            meta_title: article.meta_title || "",
            meta_description: article.meta_description || "",
          });
        }
      }
    }
    load();
  }, [id, supabase]);

  const handleSubmit = async (e: React.FormEvent, isPublishing = false) => {
    e.preventDefault();
    setLoading(true);
    try {
      const statusToSave = isPublishing ? "published" : formData.status;
      await upsertArticle({
        ...(id ? { id } : {}),
        ...formData,
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
    <form className="max-w-5xl" onSubmit={(e) => handleSubmit(e, false)}>
      <GsapReveal direction="up" className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-medium tracking-tight">{id ? "Edit Article" : "New Article"}</h1>
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()} type="button">Cancel</Button>
          <Button variant="secondary" type="submit" isLoading={loading} className="gap-2">
            <Save className="h-4 w-4" /> Save Draft
          </Button>
          <Button variant="primary" type="button" onClick={(e) => handleSubmit(e, true)} isLoading={loading} className="gap-2">
            <Send className="h-4 w-4" /> Publish Now
          </Button>
        </div>
      </GsapReveal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <GsapReveal direction="up" delay={0.1}>
            <div className="bg-background rounded-2xl border border-border p-6 shadow-sm space-y-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground ml-1 mb-2 block">Article Title</label>
                <Input 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value, slug: id ? formData.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')})} 
                  placeholder="Enter a compelling title..." 
                  required
                  className="text-lg font-medium"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground ml-1 mb-2 block">Article Content</label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(content) => setFormData({...formData, content})}
                  placeholder="Start writing your article here... Use the toolbar above to format text, add images, links, and more."
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground ml-1 mb-2 block">Excerpt</label>
                <textarea 
                  className="w-full h-24 rounded-xl border border-border bg-background p-4 text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground resize-none"
                  value={formData.excerpt}
                  onChange={e => setFormData({...formData, excerpt: e.target.value})}
                  placeholder="A short summary of the article..."
                />
              </div>
            </div>
          </GsapReveal>
        </div>

        <div className="space-y-6">
          <GsapReveal direction="up" delay={0.2}>
            <div className="bg-background rounded-2xl border border-border p-6 shadow-sm space-y-6">
              <h3 className="font-medium border-b border-border pb-2">Publishing & SEO</h3>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground ml-1 mb-2 block">URL Slug</label>
                <Input 
                  value={formData.slug} 
                  onChange={e => setFormData({...formData, slug: e.target.value})} 
                  placeholder="article-url-slug" 
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground ml-1 mb-2 block">Category</label>
                <select 
                  className="w-full h-12 rounded-xl border border-border bg-background px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground"
                  value={formData.category_id}
                  onChange={e => setFormData({...formData, category_id: e.target.value})}
                >
                  <option value="">Select a category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground ml-1 mb-2 block">Featured Image URL</label>
                <Input 
                  value={formData.featured_image} 
                  onChange={e => setFormData({...formData, featured_image: e.target.value})} 
                  placeholder="https://images.unsplash.com/..." 
                />
                {formData.featured_image && (
                   <div className="mt-3 aspect-video w-full rounded-lg border border-border overflow-hidden">
                     <img src={formData.featured_image} alt="Preview" className="w-full h-full object-cover" />
                   </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input 
                  type="checkbox" 
                  id="featured" 
                  checked={formData.is_featured}
                  onChange={e => setFormData({...formData, is_featured: e.target.checked})}
                  className="w-5 h-5 rounded border-border accent-accent"
                />
                <label htmlFor="featured" className="text-sm font-medium cursor-pointer">Feature on Landing Page</label>
              </div>
            </div>
          </GsapReveal>

          <GsapReveal direction="up" delay={0.3}>
            <div className="bg-background rounded-2xl border border-border p-6 shadow-sm space-y-6">
              <h3 className="font-medium border-b border-border pb-2 flex items-center justify-between">
                <span>Meta Data</span>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </h3>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground ml-1 mb-2 block">Meta Title</label>
                <Input 
                  value={formData.meta_title} 
                  onChange={e => setFormData({...formData, meta_title: e.target.value})} 
                  placeholder="Optimal SEO Title" 
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">{formData.meta_title.length}/60</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground ml-1 mb-2 block">Meta Description</label>
                <textarea 
                  className="w-full h-24 rounded-xl border border-border bg-background p-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground resize-none"
                  value={formData.meta_description}
                  onChange={e => setFormData({...formData, meta_description: e.target.value})}
                  placeholder="Compelling meta description for Google snippets..."
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">{formData.meta_description.length}/160</p>
              </div>

              {/* Google Snippet preview */}
              <div className="mt-4 p-4 rounded-xl bg-white border border-[#dadce0] font-sans">
                <div className="text-[#202124] text-xs mb-1 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center font-bold text-xs text-foreground">T</span>
                  <div>
                    <span className="block">Tela Blog</span>
                    <span className="text-muted-foreground">https://tela.ng/blog/{formData.slug || 'slug'}</span>
                  </div>
                </div>
                <h4 className="text-[#1a0dab] text-lg hover:underline cursor-pointer truncate">{formData.meta_title || formData.title || 'Optimal SEO Title'}</h4>
                <p className="text-[#4d5156] text-sm line-clamp-2 leading-snug mt-1">
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
