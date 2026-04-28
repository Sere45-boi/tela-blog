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
import { Footer } from "@/components/layout/Footer";
import Image from "next/image";
import { Suspense } from "react";

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
    openGraph: { title, description, type: "article", siteName: "Tela Blog", images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#f3fbf3] to-[#e4fce4] font-sans selection:bg-[#41cc00]/30 selection:text-[#093C15]" suppressHydrationWarning>
      <Navbar />
      
      <main className="pt-32 pb-24 md:pt-40">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-[#093C15]/70 hover:text-[#093C15] font-semibold text-[14px] mb-10 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Back to feed
          </Link>

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
            <Suspense fallback={<ArticleSkeleton />}>
              <ArticleContent slug={slug} preview={preview} />
            </Suspense>

            <aside className="w-full lg:w-[380px] space-y-10">
              <Suspense fallback={<SidebarSkeleton />}>
                <SidebarContent slug={slug} />
              </Suspense>
            </aside>
          </div>
        </div>
      </main>

      <Suspense fallback={null}>
        <RelatedArticles slug={slug} />
      </Suspense>

      <Suspense fallback={<div className="h-40" />}>
        <Footer />
      </Suspense>
    </div>
  );
}

async function ArticleContent({ slug, preview }: { slug: string, preview?: string }) {
  const supabase = await createClient();
  let query = supabase
    .from("articles")
    .select("*, profiles(full_name, avatar_url, bio, is_public), categories(name)")
    .eq("slug", slug);

  if (preview !== "true") {
    query = query.or("status.eq.published,status.eq.scheduled").lte("published_at", new Date().toISOString());
  }

  const { data: article } = await query.single();
  if (!article) notFound();

  const author = getAuthorAttribution(article.profiles);

  return (
    <article className="flex-1 min-w-0">
      <EventLogger type="read" targetName={article.title} link={`/blog/${slug}`} articleId={article.id} />
      
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-6">
          <span className="px-4 py-1.5 rounded-full bg-[#41cc00]/10 text-[#093C15] text-[13px] font-bold tracking-wide uppercase">
            {article.categories?.name || "Insights"}
          </span>
          <div className="flex items-center gap-2 text-[#093C15]/50 text-[14px] font-semibold">
            <Clock className="w-4 h-4" />
            <span>{Math.ceil((article.content?.length || 0) / 1500)} min read</span>
          </div>
        </div>

        <h1 className="text-[32px] md:text-[56px] font-bold leading-[1.1] mb-8 tracking-tight text-[#1d1d1f] font-bricolage">
          {article.title}
        </h1>

        <div className="flex items-center gap-4 p-1 pr-6 bg-white/50 border border-black/5 rounded-full w-fit">
          <Image src={author.avatar_url} alt={author.name} width={44} height={44} className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm" />
          <div>
            <div className="text-[15px] font-bold text-[#1d1d1f]">{author.name}</div>
            <div className="text-[13px] font-medium text-[#1d1d1f]/50">
              {new Date(article.published_at || article.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      <div className="aspect-[21/9] w-full bg-[#f5f5f7] rounded-[2.5rem] overflow-hidden mb-12 relative shadow-2xl">
        <Image src={article.featured_image || "https://images.unsplash.com/photo-1551288049-bebda4e38f71"} alt={article.title} fill className="object-cover" priority />
      </div>

      <div className="prose prose-lg prose-slate max-w-none 
        prose-headings:font-bricolage prose-headings:tracking-tight prose-headings:text-[#1d1d1f]
        prose-p:text-[#1d1d1f]/80 prose-p:leading-[1.8] prose-p:font-medium
        prose-strong:text-[#1d1d1f] prose-strong:font-bold
        prose-img:rounded-[2rem] prose-img:shadow-xl
        prose-a:text-[#41cc00] prose-a:no-underline hover:prose-a:underline"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </article>
  );
}

async function SidebarContent({ slug }: { slug: string }) {
  const supabase = await createClient();
  const { data: topArticles } = await supabase
    .from("articles")
    .select("slug, title, view_count")
    .eq("status", "published")
    .neq("slug", slug)
    .order("view_count", { ascending: false })
    .limit(3);

  return (
    <>
      <div className="bg-white/60 border border-black/5 rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#41cc00]/10 flex items-center justify-center text-[#093C15]">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-[18px] text-[#1d1d1f] font-bricolage">Top Stories</h3>
        </div>
        <div className="space-y-8">
          {topArticles?.map((item, idx) => (
            <Link key={item.slug} href={`/blog/${item.slug}`} className="group block">
              <div className="flex gap-4">
                <span className="text-[24px] font-bold text-[#41cc00]/20 font-bricolage group-hover:text-[#41cc00]/40 transition-colors">0{idx + 1}</span>
                <div>
                  <h4 className="font-bold text-[16px] leading-tight text-[#1d1d1f] group-hover:text-[#093C15] transition-colors line-clamp-2 mb-2">
                    {item.title}
                  </h4>
                  <div className="text-[13px] font-bold text-[#1d1d1f]/30 uppercase tracking-wider">
                    {((item.view_count || 0) / 1000).toFixed(1)}k reads
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <AdSpace position="article_sidebar" />
    </>
  );
}

async function RelatedArticles({ slug }: { slug: string }) {
  const supabase = await createClient();
  const { data: article } = await supabase.from("articles").select("category_id").eq("slug", slug).single();
  if (!article) return null;

  const { data: related } = await supabase
    .from("articles")
    .select("slug, title, featured_image, created_at")
    .eq("category_id", article.category_id)
    .eq("status", "published")
    .neq("slug", slug)
    .order("created_at", { ascending: false })
    .limit(3);

  if (!related || related.length === 0) return null;

  return (
    <section className="bg-white/30 py-24 border-t border-black/5">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-[#41cc00]" />
            <h2 className="text-2xl md:text-3xl font-bold font-bricolage text-[#1d1d1f]">Related Stories</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {related.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group block h-full">
              <div className="aspect-[16/10] bg-[#f5f5f7] rounded-[2rem] overflow-hidden mb-6 shadow-sm border border-black/5">
                <Image src={post.featured_image || "https://images.unsplash.com/photo-1551288049-bebda4e38f71"} alt={post.title} width={400} height={250} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <h3 className="text-[19px] font-bold text-[#1d1d1f] group-hover:text-[#093C15] transition-colors leading-snug line-clamp-2">
                {post.title}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ArticleSkeleton() {
  return (
    <div className="flex-1 animate-pulse">
      <div className="h-6 w-32 bg-black/5 rounded-full mb-8" />
      <div className="h-16 w-full bg-black/5 rounded-xl mb-12" />
      <div className="aspect-[21/9] bg-black/5 rounded-[2.5rem] mb-12" />
      <div className="space-y-4">
        <div className="h-4 w-full bg-black/5 rounded" />
        <div className="h-4 w-[90%] bg-black/5 rounded" />
        <div className="h-4 w-[95%] bg-black/5 rounded" />
      </div>
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="w-full animate-pulse space-y-8">
      <div className="h-[400px] bg-black/5 rounded-[2.5rem]" />
      <div className="h-[200px] bg-black/5 rounded-[2.5rem]" />
    </div>
  );
}
