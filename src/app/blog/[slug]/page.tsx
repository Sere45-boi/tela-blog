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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  
  const { data: article } = await supabase
    .from("articles")
    .select("title, meta_title, meta_description, featured_image, og_image_url")
    .eq("slug", slug)
    .single();

  if (!article) return { title: "Article Not Found | Tela Blog" };

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
  const query = supabase
    .from("articles")
    .select("*, profiles(full_name, avatar_url, bio, is_public), categories(name)")
    .eq("slug", slug);

  // If not preview mode, only show published articles
  if (preview !== "true") {
    query.eq("status", "published");
  }

  const { data: article, error } = await query.single();

  if (error || !article) {
    notFound();
  }

  // Increment view count if not in preview
  if (preview !== "true") {
    supabase.rpc('increment_article_view', { article_slug: slug }).then();
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
                Back to all articles
              </Link>

              <header className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-[#41cc00] font-bold tracking-[0.15em] text-[12px] uppercase">
                    {(article.categories as any)?.name || "Insights"}
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#1d1d1f] font-bricolage mb-8 leading-[1.1]">
                  {article.title}
                </h1>
                
                <div className="flex items-center gap-4 border-y border-black/5 py-6">
                  <img 
                    src={author.avatar_url}
                    alt={author.name}
                    className="w-12 h-12 rounded-full object-cover border border-black/5"
                  />
                  <div className="flex-1">
                    <div className="text-[16px] font-bold text-[#1d1d1f]">{author.name}</div>
                    <div className="text-[14px] text-[#1d1d1f]/60 font-medium font-poppins">
                      {article.read_time_minutes || 4} min read • {new Date(article.published_at || article.created_at).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  {/* Social share inline on desktop */}
                  <div className="hidden md:block">
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

              {/* Article Content */}
              <div 
                className="max-w-none font-poppins leading-relaxed prose prose-lg prose-headings:font-bricolage prose-a:text-[#093C15] prose-img:rounded-2xl"
                dangerouslySetInnerHTML={{ __html: article.content }}
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
                <div className="flex items-center justify-between">
                  <p className="text-[15px] text-[#1d1d1f]/60 font-medium">Enjoyed this article? Share it with your network.</p>
                  <SocialShareButtons title={article.title} slug={slug} />
                </div>
              </div>
            </article>

            {/* RIGHT SIDEBAR */}
            <aside className="hidden lg:block w-[340px] shrink-0 space-y-8 sticky top-32 self-start">
              
              {/* Author Bio */}
              <div className="bg-[#093C15] rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#41cc00]/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                <div className="relative z-10">
                  <img 
                    src={author.avatar_url}
                    alt={author.name}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-white/10 mb-6"
                  />
                  <h3 className="text-xl font-bold font-bricolage mb-2">{author.name}</h3>
                  <p className="text-white/70 text-sm leading-relaxed mb-6 font-medium">
                    {author.bio}
                  </p>
                  <Link href="/about" className="inline-flex items-center gap-2 text-[#41cc00] font-bold text-[13px] hover:text-white transition-colors">
                    View profile →
                  </Link>
                </div>
              </div>

              {/* Ad Space */}
              <AdSpace position="sidebar" />
              
              {/* Top Read Placeholder */}
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
             © {new Date().getFullYear()} Tela Technologies. All rights reserved.
           </div>
        </footer>
      </div>
    </>
  );
}
