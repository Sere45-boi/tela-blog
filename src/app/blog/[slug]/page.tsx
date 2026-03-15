import { Metadata, ResolvingMetadata } from "next";
import { getArticleBySlug } from "@/app/queries/content";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { GsapReveal } from "@/components/GsapReveal";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) return { title: "Article Not Found" };

  const previousImages = (await parent).openGraph?.images || [];
  const imageUrl = article.featured_image || previousImages[0];

  return {
    title: article.meta_title || `${article.title} | Tela Blog`,
    description: article.meta_description || article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: imageUrl ? [imageUrl] : [],
      type: "article",
      publishedTime: article.published_at,
      authors: [article.profiles?.full_name || "Tela Team"],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: imageUrl ? [imageUrl] : [],
    },
    alternates: {
      canonical: `https://tela.ng/blog/${slug}`,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  // JSON-LD schema for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    image: article.featured_image ? [article.featured_image] : [],
    datePublished: article.published_at,
    dateModified: article.updated_at,
    author: [{
      "@type": "Person",
      name: article.profiles?.full_name || "Tela Team"
    }],
    abstract: article.excerpt,
  };

  // Estimate read time (rough estimate: 200 words per minute)
  const wordCount = article.content ? article.content.split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Article Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="container mx-auto px-4 md:px-8 py-12 md:py-24 max-w-4xl">
        <GsapReveal direction="up">
          <header className="mb-12 text-center">
            <div className="flex items-center justify-center gap-4 text-sm font-medium text-muted-foreground mb-6">
              <span className="text-accent bg-accent/10 px-3 py-1 rounded-full">
                {(article.categories as any)?.name}
              </span>
              <span>{new Date(article.published_at!).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span>{readingTime} min read</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-foreground mb-6">
              {article.title}
            </h1>
            {article.excerpt && (
              <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
                {article.excerpt}
              </p>
            )}
          </header>
        </GsapReveal>

        <GsapReveal direction="up" delay={0.2}>
          {article.featured_image && (
            <div className="w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden mb-16 border border-border/50">
              <img src={article.featured_image} alt={article.title} className="w-full h-full object-cover" />
            </div>
          )}
        </GsapReveal>

        <GsapReveal direction="up" delay={0.3}>
          <div 
            className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-medium prose-a:text-accent hover:prose-a:text-accent/80"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </GsapReveal>
      </article>
    </div>
  );
}
