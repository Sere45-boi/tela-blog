import { Navbar } from "@/components/layout/Navbar";
import { GsapReveal } from "@/components/GsapReveal";
import { getPublishedArticles, getFeaturedArticle } from "@/app/queries/content";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function Home() {
  const featuredArticleResult = await getFeaturedArticle().catch(() => null);
  const articlesResult = await getPublishedArticles().catch(() => ({ data: [] }));
  
  const featuredArticle = featuredArticleResult;
  const articles = articlesResult?.data || [];

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container mx-auto px-4 md:px-8 py-12 md:py-24">
        {/* Hero Section */}
        <section className="mb-24">
          <GsapReveal direction="up" className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-medium tracking-tight text-foreground mb-6">
              Design, engineering, and product at Tela.
            </h1>
            <p className="text-xl text-muted-foreground font-light mb-10 max-w-2xl">
              We share insights on how we build seamless financial infrastructure and design experiences people love.
            </p>
          </GsapReveal>

          {featuredArticle ? (
            <GsapReveal direction="up" delay={0.2} className="relative group overflow-hidden rounded-3xl border border-border/50 bg-muted/20 mt-12 block">
              <Link href={`/blog/${featuredArticle.slug}`} className="block">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="p-8 md:p-12 order-2 md:order-1">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                      <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium">
                        {(featuredArticle.categories as any)?.name || "Featured"}
                      </span>
                      <span>{new Date(featuredArticle.published_at!).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <h2 className="text-3xl font-medium mb-4 group-hover:text-accent transition-colors">
                      {featuredArticle.title}
                    </h2>
                    <p className="text-muted-foreground mb-6 line-clamp-3">
                      {featuredArticle.excerpt}
                    </p>
                    <div className="flex items-center font-medium text-sm">
                      Read article <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                  <div className="h-64 md:h-full bg-muted order-1 md:order-2">
                    {featuredArticle.featured_image ? (
                      <img src={featuredArticle.featured_image} alt={featuredArticle.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-muted to-border/50"></div>
                    )}
                  </div>
                </div>
              </Link>
            </GsapReveal>
          ) : (
            <GsapReveal direction="up" delay={0.2}>
               <div className="w-full h-64 md:h-96 rounded-3xl border border-dashed border-border flex items-center justify-center text-muted-foreground">
                  No featured articles found. Configure Supabase to publish content.
               </div>
            </GsapReveal>
          )}
        </section>

        {/* Latest Articles Grid */}
        <section>
          <GsapReveal direction="up" className="flex items-center justify-between mb-8 border-b border-border/50 pb-4">
            <h3 className="text-2xl font-medium tracking-tight">Latest Insights</h3>
            <Link href="/blog" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center">
              View all <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </GsapReveal>

          {articles && articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article: any, i: number) => (
                <GsapReveal key={article.id} direction="up" delay={0.1 * i} className="group flex flex-col h-full">
                  <Link href={`/blog/${article.slug}`} className="flex-1 flex flex-col">
                    <div className="h-48 w-full bg-muted rounded-2xl mb-4 overflow-hidden border border-border/50 relative">
                      {article.featured_image ? (
                         <img src={article.featured_image} alt={article.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                         <div className="w-full h-full bg-gradient-to-br from-muted to-border/30 transition-transform duration-700 group-hover:scale-105"></div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <span className="font-medium text-foreground">{(article.categories as any)?.name}</span>
                      <span>•</span>
                      <span>{new Date(article.published_at!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <h4 className="text-lg font-medium mb-2 group-hover:text-accent transition-colors line-clamp-2">
                      {article.title}
                    </h4>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                      {article.excerpt}
                    </p>
                  </Link>
                </GsapReveal>
              ))}
            </div>
          ) : (
            <GsapReveal direction="up">
              <div className="py-12 text-center text-muted-foreground">
                No articles published yet.
              </div>
            </GsapReveal>
          )}
        </section>
      </main>
    </div>
  );
}
