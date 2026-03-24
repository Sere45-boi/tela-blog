import { getPublishedArticles, getFeaturedArticle } from "@/app/queries/content";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { GsapReveal } from "@/components/GsapReveal";
import { getAuthorAttribution } from "@/utils/author";
import { getCleanExcerpt } from "@/utils/excerpt";

export async function BlogContent({ search, siteSettings, categories, page = 1 }: { search?: string, siteSettings: any, categories: any[], page?: number }) {
  const limit = 8;
  const [featuredArticleResult, articlesResult] = await Promise.all([
    getFeaturedArticle().catch(() => null),
    getPublishedArticles(page, limit, undefined, search).catch(() => ({ data: [], count: 0 })),
  ]);

  const featuredArticle = featuredArticleResult || null;
  let articles = articlesResult?.data || [];
  const totalArticles = articlesResult?.count || 0;
  const totalPages = Math.ceil(totalArticles / limit);

  // Filter out featured article from the grid to prevent duplication
  if (featuredArticle && articles.length > 0) {
    articles = articles.filter(a => a.id !== featuredArticle.id);
  }

  return (
    <>
      {featuredArticle && (
        <section className="px-6 md:px-8 max-w-7xl mx-auto mb-16 relative">
          <GsapReveal direction="up">
            <Link href={`/blog/${featuredArticle.slug}`} className="group block relative rounded-[2.5rem] overflow-hidden bg-white shadow-[0_10px_40px_rgb(0,0,0,0.06)] hover:shadow-[0_20px_60px_rgb(0,0,0,0.12)] transition-shadow duration-500 border border-black/5">
              <div className="w-full aspect-[16/9] md:aspect-[2.2/1] shrink-0 relative bg-[#1a1a1a] overflow-hidden">
                <img
                  src={featuredArticle.featured_image || "https://images.unsplash.com/photo-1551288049-bebda4e38f71"}
                  alt={featuredArticle.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90"
                  loading="eager"
                />
              </div>
              <div className="p-8 md:p-10 w-full bg-white">
                <h2 className="text-2xl md:text-3xl lg:text-[30px] font-bold leading-[1.15] mb-4 tracking-tight text-[#1d1d1f] font-bricolage">
                  {featuredArticle.title}
                </h2>
                <p className="text-[#1d1d1f]/60 text-[17px] md:text-[18px] leading-relaxed font-medium line-clamp-3 mb-6 font-poppins">
                  {getCleanExcerpt(featuredArticle.content || featuredArticle.excerpt, 260)}
                </p>
                <div className="flex items-center gap-3">
                  {(() => {
                    const author = getAuthorAttribution(featuredArticle.profiles);
                    return (
                      <>
                        <img
                          src={author.avatar_url}
                          alt={author.name}
                          className="w-10 h-10 rounded-full object-cover border border-black/5"
                        />
                        <span className="text-[14px] font-bold text-[#1d1d1f] uppercase tracking-wide">{author.name}</span>
                      </>
                    );
                  })()}
                </div>
              </div>
            </Link>
          </GsapReveal>
        </section>
      )}

      {/* CATEGORY TABS SCROLLABLE - Now positioned under featured */}
      <section className="mb-12 pt-2">
        <div className="container mx-auto px-6 md:px-8 max-w-7xl flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="whitespace-nowrap px-6 py-2.5 text-[15px] font-bold rounded-full transition-all duration-300 bg-[#093C15] text-white shadow-lg border border-[#093C15]"
          >
            All Categories
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/blog/category/${cat.slug}`}
              className="whitespace-nowrap px-6 py-2.5 text-[15px] font-bold rounded-full transition-all duration-300 text-[#1d1d1f]/60 bg-white hover:text-[#093C15] hover:bg-[#41cc00]/10 border border-black/5 hover:border-[#41cc00]/20"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      {/* ALL ARTICLES GRID */}
      <section id="articles" className="container mx-auto px-6 md:px-8 max-w-7xl mb-16">
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 gap-y-12">
            {articles.map((article: any, i: number) => (
              <GsapReveal key={article.id} direction="up" delay={0.05 * i}>
                <Link href={`/blog/${article.slug}`} className="group relative flex flex-col aspect-square w-full rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.2)] transition-all duration-700">
                  {/* Full Background Image */}
                  <div className="absolute inset-0 z-0">
                    <img
                      src={article.featured_image || "https://images.unsplash.com/photo-1551288049-bebda4e38f71"}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    {/* Dark gradient overlay for readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                  </div>

                  {/* Content Overlay */}
                  <div className="relative z-10 mt-auto p-4 flex flex-col items-center w-full">
                    <div className="w-full max-w-[95%] bg-white/10 backdrop-blur-xl border border-white/20 p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl transform transition-transform duration-500 group-hover:-translate-y-2">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-[11px] md:text-[12px] font-bold text-white/90 uppercase tracking-widest">
                          <Calendar className="w-3.5 h-3.5" />
                          <span suppressHydrationWarning>
                            {new Date(article.published_at || article.created_at).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </span>
                        </div>

                        {/* Author Avatar */}
                        {(() => {
                          const author = getAuthorAttribution(article.profiles);
                          return (
                            <div className="flex items-center">
                              <img
                                src={author.avatar_url}
                                alt={author.name}
                                className="w-7 h-7 rounded-full object-cover border-2 border-white/30 shadow-lg"
                                title={author.name}
                              />
                            </div>
                          );
                        })()}
                      </div>
                      <h4 className="text-[17px] md:text-[19px] font-bold text-white leading-[1.3] tracking-tight line-clamp-2 mt-2 font-bricolage">
                        {article.title}
                      </h4>
                    </div>
                  </div>
                </Link>
              </GsapReveal>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <h3 className="text-2xl font-bold text-[#1d1d1f]/30">No stories found matching your search.</h3>
          </div>
        )}

        {/* Minimalist Pagination */}
        {totalPages > 1 && (
          <div className="mt-24 flex items-center justify-center gap-4">
            {page > 1 && (
              <Link 
                href={`/?page=${page - 1}${search ? `&q=${search}` : ''}`}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-[#1d1d1f] hover:bg-black/5 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
            )}

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Link
                key={pageNum}
                href={`/?page=${pageNum}${search ? `&q=${search}` : ''}`}
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-[15px] transition-all ${
                  pageNum === page 
                    ? "bg-[#41cc00] text-white shadow-lg shadow-[#41cc00]/20" 
                    : "text-[#1d1d1f] hover:bg-black/5"
                }`}
              >
                {pageNum}
              </Link>
            ))}

            {page < totalPages && (
              <Link 
                href={`/?page=${page + 1}${search ? `&q=${search}` : ''}`}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-[#1d1d1f] hover:bg-black/5 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </Link>
            )}
          </div>
        )}
      </section>
    </>
  );
}

export function BlogGridSkeleton() {
  return (
    <div className="space-y-16">
      {/* Featured Skeleton */}
      <section className="px-6 md:px-8 max-w-7xl mx-auto">
        <div className="w-full h-[400px] bg-black/5 animate-pulse rounded-[2.5rem]" />
      </section>
      {/* Grid Skeleton */}
      <section className="container mx-auto px-6 md:px-8 max-w-7xl mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 gap-y-12">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="aspect-square relative flex flex-col rounded-[2.5rem] bg-black/5 animate-pulse overflow-hidden">
               <div className="mt-auto p-4 flex flex-col items-center w-full">
                 <div className="w-full max-w-[95%] h-32 bg-white/20 rounded-[2rem]" />
               </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
