import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { GsapReveal } from "@/components/GsapReveal";
import { deleteArticle } from "@/app/actions/content";

export const metadata = {
  title: "Articles | Tela CMS",
};

export default async function AdminArticlesList() {
  const supabase = await createClient();
  const { data: articles } = await supabase
    .from("articles")
    .select("id, title, slug, status, published_at, view_count, is_featured, categories(name)")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-6xl">
      <GsapReveal direction="up" className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-medium tracking-tight mb-2">Articles</h1>
          <p className="text-muted-foreground">Manage your blog posts, drafts, and scheduled content.</p>
        </div>
        <Link href="/admin/articles/editor">
          <Button variant="primary" className="gap-2">
            <Plus className="h-4 w-4" /> New Article
          </Button>
        </Link>
      </GsapReveal>

      <GsapReveal direction="up" delay={0.1}>
        <div className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Title</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium text-right">Views</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {articles?.map((article) => (
                  <tr key={article.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground max-w-xs truncate">
                      {article.title}
                      {article.is_featured && <span className="ml-2 text-[10px] bg-accent/10 font-bold text-accent px-2 py-0.5 rounded-full uppercase tracking-widest">Featured</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`capitalize inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        article.status === 'published' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {article.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {(article.categories as any)?.name || "—"}
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums text-muted-foreground">
                      {article.view_count.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <Link href={`/admin/articles/editor?id=${article.id}`} className="text-muted-foreground hover:text-accent transition-colors inline-block">
                        <Edit2 className="h-4 w-4" />
                      </Link>
                      <form action={deleteArticle.bind(null, article.id)} className="inline-block">
                        <button className="text-muted-foreground hover:text-red-500 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
                
                {(!articles || articles.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      No articles found. Ready to write your first post?
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
