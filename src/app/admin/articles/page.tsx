import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Plus, Edit2, Trash2, Eye } from "lucide-react";
import { GsapReveal } from "@/components/GsapReveal";
import { deleteArticle } from "@/app/actions/content";

export const metadata = {
  title: "Post Management | Pulse by Tela",
};

export default async function AdminArticlesList({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("articles")
    .select("id, title, slug, status, published_at, view_count, is_featured, category_id, categories(name), profiles(full_name)")
    .order("created_at", { ascending: false });

  if (category) {
    query = query.eq("category_id", category);
  }

  const [articlesResult, categoriesResult] = await Promise.all([
    query,
    supabase.from("categories").select("id, name, slug").order("name")
  ]);

  const articles = articlesResult.data;
  const categories = categoriesResult.data || [];

  return (
    <div className="max-w-6xl">
      <GsapReveal direction="up" className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-[#1d1d1f] font-bricolage mb-2">Post Management</h1>
          <p className="text-[#1d1d1f]/60">Manage your blog posts, drafts, and scheduled content.</p>
        </div>
        <Link href="/admin/articles/editor">
          <Button variant="primary" className="gap-2 rounded-xl bg-[#093C15] text-white h-11 px-6 shadow-sm">
            <Plus className="h-4 w-4" /> New Post
          </Button>
        </Link>
      </GsapReveal>

      <GsapReveal direction="up" delay={0.1} className="mb-10 flex flex-wrap gap-2">
        <Link
          href="/admin/articles"
          className={`px-4 py-2 text-[13px] font-bold rounded-xl border transition-all ${!category
              ? "border-[#093C15] bg-[#093C15] text-white shadow-sm"
              : "border-black/5 bg-white/80 text-[#1d1d1f]/60 hover:text-[#093C15] hover:border-[#41cc00]/20"
            }`}
        >
          All Posts
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/admin/articles?category=${cat.id}`}
            className={`px-4 py-2 text-[13px] font-bold rounded-xl border transition-all ${category === cat.id
                ? "border-[#093C15] bg-[#093C15] text-white shadow-sm"
                : "border-black/5 bg-white/80 text-[#1d1d1f]/60 hover:text-[#093C15] hover:border-[#41cc00]/20"
              }`}
          >
            {cat.name}
          </Link>
        ))}
      </GsapReveal>

      <GsapReveal direction="up" delay={0.1}>
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-black/5 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] font-bold text-[#1d1d1f]/40 uppercase tracking-wider bg-black/[0.02] border-b border-black/5">
                <tr>
                  <th className="px-6 py-4">Post Title</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Author</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-right">Views</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {articles?.map((article) => (
                  <tr key={article.id} className="hover:bg-[#41cc00]/5 transition-colors group">
                    <td className="px-6 py-4 font-bold text-[#1d1d1f] max-w-xs truncate">
                      {article.title}
                      {article.is_featured && <span className="ml-2 text-[9px] bg-[#41cc00]/10 font-bold text-[#093C15] px-2 py-0.5 rounded-full uppercase tracking-widest">Featured</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`capitalize inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase ${article.status === 'published' ? 'bg-[#41cc00]/10 text-[#093C15]' : 'bg-yellow-500/10 text-yellow-600'
                        }`}>
                        {article.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#1d1d1f]/60 font-medium">
                      {(article.profiles as any)?.full_name || "—"}
                    </td>
                    <td className="px-6 py-4 text-[#1d1d1f]/60 font-medium whitespace-nowrap">
                      {(article.categories as any)?.name || "—"}
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums text-[#1d1d1f]/60 font-medium">
                      {article.view_count.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        href={`/blog/${article.slug}?preview=true`}
                        target="_blank"
                        className="p-2 inline-block text-[#1d1d1f]/40 hover:text-[#41cc00] transition-colors"
                        title="Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/articles/editor?id=${article.id}`}
                        className="p-2 inline-block text-[#1d1d1f]/40 hover:text-[#093C15] transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Link>
                      <form action={deleteArticle.bind(null, article.id)} className="inline-block">
                        <button className="p-2 text-[#1d1d1f]/40 hover:text-red-500 transition-colors" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}

                {(!articles || articles.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[#1d1d1f]/40 font-medium">
                      No posts found. Ready to write your first story?
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </GsapReveal>
    </div>
  );
}
