"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, Trash2, Edit2, Tag, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

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
    setLoading(true);
    const { data, error } = await supabase
      .from("categories")
      .select("*, articles(count)")
      .order("name", { ascending: true });
    
    if (!error && data) {
      // Map counts from nested query
      const formatted = data.map(cat => ({
        ...cat,
        article_count: cat.articles?.[0]?.count || 0
      }));
      setCategories(formatted);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1d1d1f] font-bricolage mb-2">Categories</h1>
          <p className="text-[#1d1d1f]/50 font-medium">Organize your blog into topics and sections.</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => isAdding && !editingId ? closeForm() : setIsAdding(true)}
          className="gap-2"
        >
          {isAdding && !editingId ? "Cancel" : <><Plus className="h-4 w-4" /> New Category</>}
        </Button>
      </div>

      {isAdding && (
        <div className="bg-white rounded-2xl border border-[#41cc00]/30 shadow-[0_8px_30px_rgb(65,204,0,0.06)] p-6 md:p-8 mb-10 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 pb-4 border-b border-black/5 mb-6">
            <div className={`p-2 rounded-xl ${editingId ? 'bg-blue-500/10' : 'bg-[#41cc00]/10'}`}>
              <Tag className={`w-4 h-4 ${editingId ? 'text-blue-600' : 'text-[#093C15]'}`} />
            </div>
            <h2 className="text-[16px] font-bold text-[#1d1d1f]">
              {editingId ? "Edit Category" : "Create New Category"}
            </h2>
          </div>

          <form onSubmit={handleCreateOrUpdate} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider mb-2 block">Name</label>
                <Input 
                  value={formData.name} 
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                    setFormData(!editingId ? { ...formData, name, slug } : { ...formData, name });
                  }} 
                  placeholder="e.g. Technology"
                  required
                />
              </div>
              <div>
                <label className="text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider mb-2 block">Slug</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-[#1d1d1f]/40 text-sm font-medium">/</span>
                  <Input 
                    className="pl-6 font-mono text-sm"
                    value={formData.slug} 
                    onChange={(e) => setFormData({...formData, slug: e.target.value})} 
                    placeholder="technology"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider mb-2 block">Description (Optional)</label>
              <textarea 
                className="w-full h-20 rounded-xl border border-black/10 bg-white p-4 text-[#1d1d1f] text-[14px] focus:border-[#41cc00] focus:ring-2 focus:ring-[#41cc00]/20 outline-none transition-all resize-none"
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                placeholder="Brief topic overview..."
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/5">
              <Button type="button" variant="secondary" onClick={closeForm}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (editingId ? "Save Changes" : "Create Category")}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-black/5 bg-black/[0.02] text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider">
          <div className="col-span-5 md:col-span-4 ml-2">Name</div>
          <div className="hidden md:block col-span-3">Slug</div>
          <div className="col-span-3 md:col-span-2 text-center">Articles</div>
          <div className="col-span-4 md:col-span-3 text-right mr-2">Actions</div>
        </div>
        
        <div className="divide-y divide-black/5">
          {loading && categories.length === 0 ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#41cc00]" />
            </div>
          ) : categories.map((category) => (
            <div key={category.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-black/[0.01] transition-colors">
              <div className="col-span-5 md:col-span-4 ml-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#41cc00]/10 flex items-center justify-center shrink-0">
                    <Tag className="w-3.5 h-3.5 text-[#093C15]" />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-[#1d1d1f]">{category.name}</h3>
                  </div>
                </div>
              </div>

              <div className="hidden md:block col-span-3">
                <span className="text-[12px] font-mono text-[#1d1d1f]/40">/{category.slug}</span>
              </div>

              <div className="col-span-3 md:col-span-2 text-center">
                <span className="inline-flex items-center justify-center h-6 px-2 rounded-full bg-[#f3fbf3] text-[#093C15] font-bold text-[11px] border border-[#41cc00]/20">
                  {category.article_count}
                </span>
              </div>

              <div className="col-span-4 md:col-span-3 flex items-center justify-end gap-2 mr-2">
                <Link 
                  href={`/categories/${category.slug}`} 
                  target="_blank"
                  className="p-2 rounded-xl text-[#093C15]/50 hover:text-[#093C15] hover:bg-[#093C15]/5 transition-colors hidden sm:flex"
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
                <button 
                  onClick={() => handleEdit(category)}
                  className="p-2 rounded-xl text-[#1d1d1f]/40 hover:text-[#1d1d1f] hover:bg-black/5 transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleDelete(category.id)}
                  className="p-2 rounded-xl text-red-500/60 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {!loading && categories.length === 0 && (
            <div className="p-12 text-center text-[#1d1d1f]/50">
              No categories found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
