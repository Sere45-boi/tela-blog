import { getPublishedArticles, getFeaturedArticle } from "@/app/queries/content";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { GsapReveal } from "@/components/GsapReveal";
import { getAuthorAttribution } from "@/utils/author";
import { getCleanExcerpt } from "@/utils/excerpt";

export async function BlogContent({ search, siteSettings }: { search?: string, siteSettings: any }) {
  const [featuredArticleResult, articlesResult] = await Promise.all([
    getFeaturedArticle().catch(() => null),
    getPublishedArticles(1, 9, undefined, search).catch(() => ({ data: [] })),
  ]);

  const featuredArticle = featuredArticleResult || null;
  const articles = articlesResult?.data || [];

  return (
    <>
      {/* CENTRAL FEATURED */}
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

      {/* ALL ARTICLES GRID */}
      <section id="articles" className="container mx-auto px-6 md:px-8 max-w-7xl mb-16">
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 gap-y-12">
            {articles.map((article: any, i: number) => (
              <GsapReveal key={article.id} direction="up" delay={0.05 * i}>
                <Link href={`/blog/${article.slug}`} className="group flex flex-col h-full bg-white rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] transition-shadow duration-500 border-none">
                  <div className="aspect-[4/3] w-full bg-[#f5f5f7] overflow-hidden relative">
                    <img
                      src={article.featured_image || "https://images.unsplash.com/photo-1551288049-bebda4e38f71"}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex-1 flex flex-col p-8 bg-white z-10 relative">
                    <div className="flex items-center gap-2 text-[12px] font-bold text-[#41cc00] uppercase tracking-widest mb-4">
                      <span>{article.categories?.name || 'Insights'}</span>
                    </div>
                    <h4 className="text-[21px] font-bold mb-3 text-[#1d1d1f] line-clamp-2 leading-[1.2] tracking-tight group-hover:text-[#093C15] transition-colors">
                      {article.title}
                    </h4>
                    <p className="text-[#1d1d1f]/60 line-clamp-3 mb-8 flex-1 text-[15px] leading-relaxed font-medium">
                      {getCleanExcerpt(article.content || article.excerpt, 180)}
                    </p>
                    <div className="flex items-center gap-3 mt-auto text-[14px] font-semibold text-[#1d1d1f]/50">
                      {(() => {
                        const author = getAuthorAttribution(article.profiles);
                        return (
                          <>
                            <img
                              src={author.avatar_url}
                              alt={author.name}
                              className="w-8 h-8 rounded-full object-cover border border-black/5"
                            />
                            <span className="text-[#1d1d1f]">{author.name}</span>
                          </>
                        );
                      })()}
                      <span className="px-1">•</span>
                      <span suppressHydrationWarning>{new Date(article.published_at || article.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
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
        {articles.length > 0 && (
          <div className="mt-24 flex items-center justify-center gap-2">
            <button className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-[16px] bg-[#093C15] text-white shadow-md">1</button>
            <button className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-[16px] text-[#1d1d1f] hover:bg-black/5 transition-colors">2</button>
            <button className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-[16px] text-[#1d1d1f] hover:bg-black/5 transition-colors">3</button>
            <span className="text-[#1d1d1f]/30 mx-3 font-bold">...</span>
            <button className="pl-6 pr-5 h-12 rounded-full flex items-center justify-center font-bold text-[16px] text-[#1d1d1f] hover:bg-black/5 transition-colors ml-2 bg-white shadow-sm">Next <ChevronRight className="w-5 h-5 ml-1" /></button>
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
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col h-full rounded-[2rem] border border-black/5 overflow-hidden">
               <div className="aspect-[4/3] bg-black/5 animate-pulse" />
               <div className="p-8">
                 <div className="w-20 h-4 bg-black/5 animate-pulse rounded-md mb-4" />
                 <div className="w-full h-12 bg-black/5 animate-pulse rounded-md mb-4" />
                 <div className="w-full h-16 bg-black/5 animate-pulse rounded-md" />
               </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
