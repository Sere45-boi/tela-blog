import { createClient } from "@/utils/supabase/server";
import { GlassCard } from "@/components/ui/Card";
import { Users, Eye, FileText, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { GsapReveal } from "@/components/GsapReveal";

export const metadata = {
  title: "Dashboard | Tela Insights",
};

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch basic counts for dashboard stats
  const [articlesRes, viewsRes] = await Promise.all([
    supabase.from("articles").select("*", { count: "exact", head: true }),
    supabase.from("analytics").select("*", { count: "exact", head: true }),
  ]);

  const articleCount = articlesRes.count || 0;
  const viewCount = viewsRes.count || 0;

  // Recent content
  const { data: recentArticles } = await supabase
    .from("articles")
    .select("id, title, status, published_at, view_count")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="max-w-5xl">
      <GsapReveal direction="up" className="mb-10">
        <h1 className="text-3xl font-medium tracking-tight mb-2">Overview</h1>
        <p className="text-muted-foreground">Monitor your blog's performance and recent activity.</p>
      </GsapReveal>

      {/* Stats row */}
      <GsapReveal direction="up" delay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-background rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-muted rounded-xl">
              <FileText className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Articles</p>
              <h3 className="text-2xl font-semibold tracking-tight">{articleCount}</h3>
            </div>
          </div>
          <div className="text-xs text-muted-foreground flex items-center mt-2">
            <span className="text-green-500 font-medium flex items-center mr-1">
              <ArrowUpRight className="h-3 w-3 mr-0.5" /> 12%
            </span>
            <span>from last month</span>
          </div>
        </div>

        <div className="bg-background rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-muted rounded-xl">
              <Eye className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Views</p>
              <h3 className="text-2xl font-semibold tracking-tight">{viewCount.toLocaleString()}</h3>
            </div>
          </div>
          <div className="text-xs text-muted-foreground flex items-center mt-2">
            <span className="text-green-500 font-medium flex items-center mr-1">
              <ArrowUpRight className="h-3 w-3 mr-0.5" /> 24%
            </span>
            <span>from last month</span>
          </div>
        </div>

        <div className="bg-background rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-muted rounded-xl">
              <Users className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Unique Readers</p>
              <h3 className="text-2xl font-semibold tracking-tight">{Math.floor(viewCount * 0.75).toLocaleString()}</h3>
            </div>
          </div>
          <div className="text-xs text-muted-foreground flex items-center mt-2">
            <span className="text-green-500 font-medium flex items-center mr-1">
              <ArrowUpRight className="h-3 w-3 mr-0.5" /> 18%
            </span>
            <span>from last month</span>
          </div>
        </div>
      </GsapReveal>

      {/* Recent Activity */}
      <GsapReveal direction="up" delay={0.2}>
        <div className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-medium">Recent Articles</h2>
            <Link href="/admin/articles" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              View All
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentArticles?.map((article) => (
              <div key={article.id} className="p-6 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div>
                  <h3 className="font-medium mb-1">{article.title}</h3>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className={`capitalize inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                      article.status === 'published' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {article.status}
                    </span>
                    {article.published_at && (
                      <span>{new Date(article.published_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block text-muted-foreground">
                    <div className="text-sm font-medium text-foreground">{article.view_count.toLocaleString()}</div>
                    <div className="text-xs">Views</div>
                  </div>
                  <Link href={`/admin/articles/${article.id}/edit`} className="text-sm font-medium text-accent hover:underline">
                    Edit
                  </Link>
                </div>
              </div>
            ))}
            
            {(!recentArticles || recentArticles.length === 0) && (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No articles found. Start writing!
              </div>
            )}
          </div>
        </div>
      </GsapReveal>
    </div>
  );
}
