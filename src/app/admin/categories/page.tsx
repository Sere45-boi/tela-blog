"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Trash2, Edit2, Tag, Loader2, BarChart3, MoreVertical } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { GsapReveal } from "@/components/GsapReveal";
import { GlassCard } from "@/components/ui/Card";

export default function CategoryManagementPage() {
  const supabase = createClient();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: ""
  });

  const fetchCategories = async () => {
    // Only fetch if not already loading
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*, articles(count)")
        .order("name", { ascending: true });

      if (!error && data) {
        const formatted = data.map((cat: any) => ({
          ...cat,
          article_count: cat.articles?.[0]?.count || 0
        }));
        setCategories(formatted);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []); // Only fetch once on mount

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this category? Articles assigned to it will remain but won't have a category.")) {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (!error) {
        setCategories(categories.filter(c => c.id !== id));
      } else {
        alert("Error deleting category: " + error.message);
      }
    }
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description
    };

    let error;
    if (editingId) {
      const { error: err } = await supabase.from("categories").update(payload).eq("id", editingId);
      error = err;
    } else {
      const { error: err } = await supabase.from("categories").insert(payload);
      error = err;
    }

    if (!error) {
      await fetchCategories();
      closeForm();
    } else {
      alert("Error saving category: " + error.message);
      setLoading(false);
    }
  };

  const handleEdit = (category: any) => {
    setFormData({ name: category.name, slug: category.slug, description: category.description || "" });
    setEditingId(category.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: "", slug: "", description: "" });
  };

  return (
    <div className="max-w-[1400px]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <GsapReveal direction="up">
          <h1 className="text-3xl font-bold tracking-tight text-[#1d1d1f] font-bricolage mb-2">Categories</h1>
          <p className="text-[#1d1d1f]/40 font-medium tracking-tight">Organize your content into sections.</p>
        </GsapReveal>

        <GsapReveal direction="up" delay={0.1}>
          {isAdding && !editingId && (
            <Button
              onClick={() => closeForm()}
              className="h-12 px-6 rounded-2xl font-bold flex items-center gap-2 shadow-sm bg-white border border-black/5 text-[#1d1d1f] hover:bg-black/5 transition-all active:scale-95"
            >
              Cancel Creation
            </Button>
          )}
        </GsapReveal>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pb-10">
        {/* Category Form - Sticky on Desktop */}
        <div className={`lg:col-span-4 ${isAdding ? 'block' : 'hidden lg:block'}`}>
          <GsapReveal direction="up" delay={0.2} className="h-full">
            <GlassCard className={`h-full p-8 shadow-md border-t-4 transition-all ${editingId ? 'border-t-blue-500' : 'border-t-[#41cc00]'}`}>
              <div className="flex items-center gap-4 mb-8">
                <div className={`p-3 rounded-2xl ${editingId ? 'bg-blue-500/10 text-blue-600' : 'bg-[#41cc00]/10 text-[#093C15]'}`}>
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1d1d1f] tracking-tight">
                    {editingId ? "Update Metadata" : "Create category"}
                  </h3>
                  <p className="text-[13px] text-black/30 font-medium">Define category parameters.</p>
                </div>
              </div>

              <form onSubmit={handleCreateOrUpdate} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-[#1d1d1f]/60 ml-1">Category Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                      setFormData(!editingId ? { ...formData, name, slug } : { ...formData, name });
                    }}
                    className="h-12 bg-white/50 border-black/5 rounded-xl hover:border-[#41cc00]/20 focus:border-[#41cc00]/40 transition-all font-medium"
                    placeholder="e.g. Technology"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-[#1d1d1f]/60 ml-1">URL Semantic Slug</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20 text-sm font-bold">/</span>
                    <Input
                      className="h-12 pl-8 bg-white/50 border-black/5 rounded-xl font-mono text-sm"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="technology"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-[#1d1d1f]/60 ml-1">Description</label>
                  <textarea
                    className="w-full h-32 rounded-xl border border-black/5 bg-white/50 p-4 text-[#1d1d1f] text-[14px] font-medium focus:border-[#41cc00]/40 outline-none transition-all resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide context for this category..."
                  />
                </div>

                <div className="pt-4 flex flex-col gap-3">
                  <Button type="submit" className="w-full h-12 bg-[#093C15] hover:bg-[#0a5a1f] text-white font-bold rounded-xl shadow-lg shadow-[#093C15]/10 transition-all" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : (editingId ? "Commit Changes" : "Deploy Category")}
                  </Button>
                  {editingId && (
                    <Button type="button" variant="ghost" onClick={closeForm} className="text-black/30 hover:text-black/60">Cancel Update</Button>
                  )}
                </div>
              </form>
            </GlassCard>
          </GsapReveal>
        </div>

        {/* Categories List */}
        <div className="lg:col-span-8 h-full">
          <GsapReveal direction="up" delay={0.3} className="h-full">
            <GlassCard className="h-full overflow-hidden shadow-sm flex flex-col">
              <div className="grid grid-cols-12 gap-4 p-5 md:px-8 border-b border-black/5 bg-black/[0.01] text-[11px] font-bold text-[#1d1d1f]/30 uppercase tracking-[0.15em]">
                <div className="col-span-6 md:col-span-5">Category Name</div>
                <div className="hidden md:block col-span-4">Slug</div>
                <div className="col-span-2 text-center">Articles</div>
                <div className="col-span-4 md:col-span-1 text-right">Actions</div>
              </div>

              <div className="divide-y divide-black/5">
                {loading && categories.length === 0 ? (
                  <div className="p-20 flex justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-[#41cc00]" />
                  </div>
                ) : categories.map((category) => (
                  <div key={category.id} className="grid grid-cols-12 gap-4 p-5 md:px-8 items-center hover:bg-[#f3fbf3]/50 transition-colors group">
                    <div className="col-span-6 md:col-span-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-white border border-black/5 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                          <Tag className="w-4 h-4 text-[#41cc00]" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-[15px] font-bold text-[#1d1d1f] truncate group-hover:text-[#41cc00] transition-colors">{category.name}</h3>
                          <p className="text-[12px] text-black/30 font-medium truncate mt-0.5">{category.description || "No description provided."}</p>
                        </div>
                      </div>
                    </div>

                    <div className="hidden md:block col-span-4">
                      <span className="text-[12px] font-mono text-black/20 bg-black/[0.02] px-2 py-1 rounded-lg">/{category.slug}</span>
                    </div>

                    <div className="col-span-2 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-[16px] font-bold text-[#1d1d1f] leading-none">{category.article_count}</span>
                        <span className="text-[10px] font-bold text-black/20 uppercase mt-1">Posts</span>
                      </div>
                    </div>

                    <div className="col-span-4 md:col-span-1 flex items-center justify-end gap-1">
                      <div className="relative group/actions">
                        <button className="p-2.5 rounded-xl text-black/20 hover:text-[#093C15] hover:bg-black/5 transition-all">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-xl border border-black/5 shadow-2xl opacity-0 group-hover/actions:opacity-100 pointer-events-none group-hover/actions:pointer-events-auto transition-all translate-y-2 group-hover/actions:translate-y-0 z-20 p-1.5">
                          <button onClick={() => handleEdit(category)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-bold text-[#1d1d1f] hover:bg-[#41cc00]/10 transition-colors text-left">
                            <Edit2 className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button onClick={() => handleDelete(category.id)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-bold text-red-500 hover:bg-red-500/10 transition-colors text-left">
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {!loading && categories.length === 0 && (
                  <div className="p-20 text-center">
                    <BarChart3 className="w-12 h-12 text-black/5 mx-auto mb-4" />
                    <div className="text-[14px] font-bold text-black/20">No Category defined yet.</div>
                  </div>
                )}
              </div>
            </GlassCard>
          </GsapReveal>
        </div>
      </div>
    </div>
  );
}
