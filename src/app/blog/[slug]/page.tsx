export const revalidate = 3600; // Revalidate every hour
import { Navbar } from "@/components/layout/Navbar";
import { SocialShareButtons } from "@/components/blog/SocialShareButtons";
import { AdCarousel } from "@/components/blog/AdCarousel";
import Link from "next/link";
import { ChevronLeft, Clock, TrendingUp, Sparkles, AlertCircle } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdSpace } from "@/components/blog/AdSpace";
import { createClient } from "@/utils/supabase/server";
import { getAuthorAttribution } from "@/utils/author";
import { EventLogger } from "@/components/blog/EventLogger";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: article } = await supabase
    .from("articles")
    .select("title, meta_title, meta_description, featured_image, og_image_url")
    .eq("slug", slug)
    .single();

  if (!article) return { title: "Article Not Found | Pulse by Tela" };

  const title = article.meta_title || article.title;
  const description = article.meta_description || `Read "${article.title}" on the Tela Blog.`;
  const image = article.og_image_url || article.featured_image || "https://images.unsplash.com/photo-1551288049-bebda4e38f71";

  return {
    title: `${title} | Tela Blog`,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      siteName: "Tela Blog",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function ArticlePage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const supabase = await createClient();

  // Fetch article with author and category
  let query = supabase
    .from("articles")
    .select("*, profiles(full_name, avatar_url, bio, is_public), categories(name)")
    .eq("slug", slug);

  // If not preview mode, only show articles that are live (published/scheduled and past date)
  if (preview !== "true") {
    query = query
      .or("status.eq.published,status.eq.scheduled")
      .lte("published_at", new Date().toISOString());
  }

  const { data: article, error } = await query.single();

  if (error || !article) {
    if (error) {
      console.error(`[Blog Engine] Error fetching article "${slug}":`, error.message, error.details);
    }
    notFound();
  }

  // Increment view count if not in preview - safely handled
  if (preview !== "true") {
    try {
      supabase.rpc('increment_article_view', { article_slug: slug }).then();
    } catch (e) {
      console.error("[Blog Engine] Failed to increment view count:", e);
    }
  }

  const author = getAuthorAttribution(article.profiles);

  // Fetch top read articles (excluding current)
  const { data: topArticlesData } = await supabase
    .from("articles")
    .select("slug, title, view_count")
    .eq("status", "published")
    .neq("slug", slug)
    .order("view_count", { ascending: false })
    .limit(3);

  const topArticles = topArticlesData || [];

  // Fetch related articles (same category, excluding current)
  const { data: relatedArticlesData } = await supabase
    .from("articles")
    .select("slug, title, featured_image, created_at")
    .eq("category_id", article.category_id)
    .eq("status", "published")
    .neq("slug", slug)
    .order("created_at", { ascending: false })
    .limit(3);

  const relatedArticles = relatedArticlesData || [];

  const formatViews = (views?: number) => {
    if (!views) return "0";
    if (views >= 1000) return (views / 1000).toFixed(1) + "k";
    return views.toString();
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.meta_description || article.excerpt,
    image: article.featured_image || article.og_image_url,
    author: { "@type": "Person", name: author.name },
    publisher: { "@type": "Organization", name: "Tela", logo: { "@type": "ImageObject", url: "/images/logo.PNG" } },
    datePublished: article.published_at || article.created_at,
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://tela.ng/blog/${slug}` },
  };

  return (
    <>
      {/* JSON-LD for SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="min-h-screen bg-gradient-to-br from-white via-[#f3fbf3] to-[#e4fce4] font-sans selection:bg-[#41cc00]/30 selection:text-[#093C15]" suppressHydrationWarning>
        <Navbar />
        <EventLogger
          type="read"
          targetName={article.title}
          link={`/blog/${slug}`}
          articleId={article.id}
        />

        {preview === "true" && (
          <div className="fixed top-20 left-0 right-0 z-[60] bg-[#093C15] text-[#41cc00] py-2 px-4 text-center font-bold text-sm flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            PREVIEW MODE — This post is currently {article.status.toUpperCase()}
          </div>
        )}

        <main className="pt-32 pb-24 md:pt-40">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 xl:px-24 flex flex-col lg:flex-row gap-12 lg:gap-20">

            {/* MAIN ARTICLE COLUMN */}
            <article className="flex-1 min-w-0 max-w-[800px]">

              <Link href="/" className="inline-flex items-center gap-2 text-[#093C15]/70 hover:text-[#093C15] font-semibold text-[14px] mb-10 transition-colors">
                <ChevronLeft className="w-4 h-4" />
                Back
              </Link>

              <header className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-[#41cc00] font-bold tracking-[0.15em] text-[12px] uppercase">
                    {(article.categories as any)?.name || "Insights"}
                  </span>
                </div>
                <h1 className="text-3xl md:text-[40px] lg:text-[48px] font-bold tracking-tight text-[#1d1d1f] font-bricolage mb-8 leading-[1.1]">
                  {article.title}
                </h1>

                <div className="flex items-center gap-4 border-y border-black/5 py-6">
                  <Link href="/about" className="flex items-center gap-4 group">
                    <img
                      src={author.avatar_url}
                      alt={author.name}
                      className="w-12 h-12 rounded-full object-cover border border-black/5 group-hover:ring-4 group-hover:ring-[#41cc00]/10 transition-all"
                    />
                    <div className="flex-1">
                      <div className="text-[16px] font-bold text-[#1d1d1f] group-hover:text-[#41cc00] transition-colors">{author.name}</div>
                      <div className="text-[14px] text-[#1d1d1f]/60 font-medium font-poppins">
                        {article.read_time_minutes || 4} min read • {new Date(article.published_at || article.created_at).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  </Link>
                  {/* Social share inline on desktop */}
                  <div className="hidden md:block ml-auto">
                    <SocialShareButtons title={article.title} slug={slug} />
                  </div>
                </div>
              </header>

              {/* Cover image */}
              {article.featured_image && (
                <div className="w-full aspect-[16/9] md:aspect-[21/9] bg-white rounded-[2rem] overflow-hidden mb-12 relative shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5">
                  <img
                    src={article.featured_image}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Mobile social share */}
              <div className="md:hidden mb-8">
                <SocialShareButtons title={article.title} slug={slug} />
              </div>

              <div
                className="max-w-none font-poppins leading-relaxed prose prose-lg prose-headings:font-bricolage prose-a:text-[#093C15] prose-img:rounded-2xl"
                dangerouslySetInnerHTML={{ __html: article.content || "" }}
              />

              {/* Dynamic Ads from Backend */}
              <AdSpace position="article_bottom" />

              {/* Tags Section */}
              {article.tags && article.tags.length > 0 && (
                <div className="mt-12 flex flex-wrap gap-2">
                  {article.tags.map((tag: string) => (
                    <span key={tag} className="px-4 py-2 rounded-xl bg-black/[0.03] text-[13px] font-bold text-[#1d1d1f]/60 hover:bg-[#41cc00]/10 hover:text-[#093C15] transition-colors cursor-default">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Bottom share bar */}
              <div className="mt-16 pt-8 border-t border-black/5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-4">
                  <p className="text-[15px] text-[#1d1d1f]/60 font-medium">Enjoyed this article? Share it with your network.</p>
                  <div className="w-full sm:w-auto">
                    <SocialShareButtons title={article.title} slug={slug} />
                  </div>
                </div>
              </div>
            </article>

            {/* RIGHT SIDEBAR */}
            <aside className="hidden lg:block w-[340px] shrink-0 space-y-8 sticky top-32 self-start">

              {/* Ad Space */}
              <AdSpace position="sidebar" />

              {/* Related Articles */}
              <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Sparkles className="w-4 h-4 text-[#41cc00]" />
                  <h3 className="text-[14px] font-bold text-[#1d1d1f] uppercase tracking-wider">Related Articles</h3>
                </div>
                <div className="space-y-6">
                  {relatedArticles.length > 0 ? relatedArticles.map((post) => (
                    <Link key={post.slug} href={`/blog/${post.slug}`} className="group flex gap-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-black/5 bg-black/[0.02]">
                        <img
                          src={post.featured_image || "https://images.unsplash.com/photo-1551288049-bebda4e38f71"}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[14px] font-bold text-[#1d1d1f] leading-snug group-hover:text-[#093C15] transition-colors line-clamp-2">
                          {post.title}
                        </h4>
                        <span className="text-[11px] text-[#1d1d1f]/40 font-bold mt-1 block uppercase tracking-wider">
                          {new Date(post.created_at).toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </Link>
                  )) : (
                    <div className="text-[13px] text-black/40 font-medium">No related articles found.</div>
                  )}
                </div>
              </div>

              {/* Top Read */}
              <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-5">
                  <TrendingUp className="w-4 h-4 text-[#41cc00]" />
                  <h3 className="text-[14px] font-bold text-[#1d1d1f] uppercase tracking-wider">Top Read</h3>
                </div>
                <div className="space-y-4">
                  {topArticles.length > 0 ? topArticles.map((post, i) => (
                    <Link key={post.slug} href={`/blog/${post.slug}`} className="group flex items-start gap-3">
                      <span className="text-[24px] font-bold text-[#41cc00]/30 leading-none mt-0.5">{i + 1}</span>
                      <div>
                        <h4 className="text-[15px] font-semibold text-[#1d1d1f] leading-snug group-hover:text-[#093C15] transition-colors line-clamp-2">
                          {post.title}
                        </h4>
                        <span className="text-[12px] text-[#1d1d1f]/40 font-medium mt-1 block">{formatViews(post.view_count)} views</span>
                      </div>
                    </Link>
                  )) : (
                    <div className="text-[13px] text-black/40 font-medium">No trending articles yet.</div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </main>

        <footer className="py-10 border-t border-black/5">
          <div className="container mx-auto px-4 text-center text-[13px] text-[#1d1d1f]/40 font-medium">
            © {new Date().getFullYear()} Tela. All rights reserved.
          </div>
        </footer>
      </div>
    </>
  );
}
