import { Navbar } from "@/components/layout/Navbar";
import { GsapReveal } from "@/components/GsapReveal";
import { getPublishedArticles } from "@/app/queries/content";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return {
    title: `${slug.charAt(0).toUpperCase() + slug.slice(1)} Articles | Tela Blog`,
    description: `Read the latest insights and stories about ${slug} from the Tela team.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const { data: articles } = await getPublishedArticles(1, 100, slug);

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container mx-auto px-4 md:px-8 py-12 md:py-24">
        <GsapReveal direction="up" className="mb-16">
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight capitalize mb-4">
            {slug}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Explore our thoughts, tutorials, and insights focused on {slug}.
          </p>
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
            <div className="py-24 text-center rounded-3xl border border-dashed border-border text-muted-foreground">
              No articles found in this category.
            </div>
          </GsapReveal>
        )}
      </main>
    </div>
  );
}
