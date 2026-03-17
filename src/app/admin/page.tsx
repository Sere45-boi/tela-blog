import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { FileText, Eye, Users, ArrowUpRight, TrendingUp, BarChart3, Globe, Clock } from "lucide-react";

export const metadata = {
  title: "Dashboard | Tela CMS",
};

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [articlesRes, viewsRes, categoriesRes, publishedRes, draftRes] = await Promise.all([
    supabase.from("articles").select("*", { count: "exact", head: true }),
    supabase.from("analytics").select("*", { count: "exact", head: true }),
    supabase.from("categories").select("*", { count: "exact", head: true }),
    supabase.from("articles").select("*", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("articles").select("*", { count: "exact", head: true }).eq("status", "draft"),
  ]);

  const articleCount = articlesRes.count || 0;
  const viewCount = viewsRes.count || 0;
  const categoryCount = categoriesRes.count || 0;
  const publishedCount = publishedRes.count || 0;
  const draftCount = draftRes.count || 0;

  // Recent + Top articles
  const { data: recentArticles } = await supabase
    .from("articles")
    .select("id, title, slug, status, published_at, view_count")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: topArticles } = await supabase
    .from("articles")
    .select("id, title, slug, view_count")
    .eq("status", "published")
    .order("view_count", { ascending: false })
    .limit(5);

  const stats = [
    { label: "Total Articles", value: articleCount, icon: FileText, change: "+12%", color: "text-[#093C15]" },
    { label: "Total Views", value: viewCount.toLocaleString(), icon: Eye, change: "+24%", color: "text-[#41cc00]" },
    { label: "Unique Readers", value: Math.floor(viewCount * 0.75).toLocaleString(), icon: Users, change: "+18%", color: "text-blue-500" },
    { label: "Published", value: publishedCount, icon: Globe, change: "", color: "text-green-500" },
    { label: "Drafts", value: draftCount, icon: Clock, change: "", color: "text-yellow-500" },
    { label: "Categories", value: categoryCount, icon: BarChart3, change: "", color: "text-purple-500" },
  ];

  return (
    <div className="max-w-6xl">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-[#1d1d1f] font-bricolage mb-2">Dashboard</h1>
        <p className="text-[#1d1d1f]/50 font-medium">Monitor your blog&apos;s performance, content, and engagement metrics.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-black/5 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-3">
              <div className={`p-2 rounded-xl bg-black/5`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-[#1d1d1f]">{stat.value}</h3>
            <p className="text-[12px] font-medium text-[#1d1d1f]/50 mt-1">{stat.label}</p>
            {stat.change && (
              <span className="text-[11px] text-green-500 font-bold flex items-center mt-2">
                <ArrowUpRight className="h-3 w-3 mr-0.5" /> {stat.change}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Two Column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Articles */}
        <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-black/5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#1d1d1f] font-bricolage">Recent Articles</h2>
            <Link href="/admin/articles" className="text-[13px] font-bold text-[#41cc00] hover:text-[#093C15] transition-colors">
              View All →
            </Link>
          </div>
          <div className="divide-y divide-black/5">
            {recentArticles?.map((article) => (
              <div key={article.id} className="p-5 flex items-center justify-between hover:bg-black/[0.02] transition-colors">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-[#1d1d1f] text-[15px] truncate">{article.title}</h3>
                  <div className="flex items-center gap-3 text-[12px] text-[#1d1d1f]/50 mt-1">
                    <span className={`capitalize inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      article.status === 'published' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'
                    }`}>
                      {article.status}
                    </span>
                    {article.published_at && (
                      <span suppressHydrationWarning>{new Date(article.published_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 ml-4">
                  <div className="text-right hidden sm:block">
                    <div className="text-[14px] font-bold text-[#1d1d1f]">{(article.view_count || 0).toLocaleString()}</div>
                    <div className="text-[11px] text-[#1d1d1f]/40">views</div>
                  </div>
                  <Link href={`/admin/articles/editor?id=${article.id}`} className="text-[13px] font-bold text-[#41cc00] hover:text-[#093C15]">
                    Edit
                  </Link>
                </div>
              </div>
            ))}
            
            {(!recentArticles || recentArticles.length === 0) && (
              <div className="p-10 text-center text-[#1d1d1f]/40 text-sm">
                No articles yet. <Link href="/admin/articles/editor" className="text-[#41cc00] font-bold">Create your first!</Link>
              </div>
            )}
          </div>
        </div>

        {/* Top Performing Articles */}
        <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-black/5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#1d1d1f] font-bricolage flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#41cc00]" /> Top Performing
            </h2>
          </div>
          <div className="divide-y divide-black/5">
            {topArticles?.map((article, i) => (
              <div key={article.id} className="p-5 flex items-center gap-4 hover:bg-black/[0.02] transition-colors">
                <span className="text-[28px] font-bold text-[#41cc00]/25 leading-none w-8">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-[#1d1d1f] text-[15px] truncate">{article.title}</h3>
                  <span className="text-[12px] text-[#1d1d1f]/50 font-medium">{(article.view_count || 0).toLocaleString()} views</span>
                </div>
                <Link href={`/blog/${article.slug}`} className="text-[13px] font-bold text-[#093C15]/50 hover:text-[#093C15]">
                  View →
                </Link>
              </div>
            ))}
            
            {(!topArticles || topArticles.length === 0) && (
              <div className="p-10 text-center text-[#1d1d1f]/40 text-sm">
                No published articles yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/articles/editor" className="bg-[#093C15] text-white rounded-2xl p-6 hover:bg-[#0a5a1f] transition-colors shadow-sm group">
          <FileText className="w-6 h-6 text-[#41cc00] mb-3" />
          <h3 className="font-bold text-[16px] mb-1">New Article</h3>
          <p className="text-white/60 text-[13px]">Create and publish a new blog post</p>
        </Link>
        <Link href="/admin/categories" className="bg-white rounded-2xl p-6 border border-black/5 hover:shadow-md transition-shadow group">
          <BarChart3 className="w-6 h-6 text-[#41cc00] mb-3" />
          <h3 className="font-bold text-[16px] text-[#1d1d1f] mb-1">Manage Categories</h3>
          <p className="text-[#1d1d1f]/50 text-[13px]">Organize your content taxonomy</p>
        </Link>
        <Link href="/admin/site-settings" className="bg-white rounded-2xl p-6 border border-black/5 hover:shadow-md transition-shadow group">
          <Globe className="w-6 h-6 text-[#41cc00] mb-3" />
          <h3 className="font-bold text-[16px] text-[#1d1d1f] mb-1">Site Settings</h3>
          <p className="text-[#1d1d1f]/50 text-[13px]">Edit site meta, text, and branding</p>
        </Link>
      </div>
    </div>
  );
}
