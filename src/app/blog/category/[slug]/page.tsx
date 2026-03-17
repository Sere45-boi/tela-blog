import { Navbar } from "@/components/layout/Navbar";
import { GsapReveal } from "@/components/GsapReveal";
import { getPublishedArticles } from "@/app/queries/content";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!category) {
    notFound();
  }

  const { data: articles } = await getPublishedArticles(1, 20, slug);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#f3fbf3] to-[#e4fce4] font-sans selection:bg-[#41cc00]/30 selection:text-[#093C15]">
      <Navbar />

      <main className="pt-32 pb-24 md:pt-40">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-[#093C15]/70 hover:text-[#093C15] font-semibold text-[14px] mb-10 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Back to all stories
          </Link>

          <GsapReveal direction="up" className="mb-16">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[#1d1d1f] font-bricolage mb-6">
              {category.name}
            </h1>
            <p className="text-xl text-[#1d1d1f]/60 max-w-2xl font-medium">
              Explore our latest insights, guides, and stories about {category.name.toLowerCase()}.
            </p>
          </GsapReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 gap-y-12">
            {articles?.map((article: any, i: number) => (
              <GsapReveal key={article.id} direction="up" delay={0.05 * i}>
                <Link href={`/blog/${article.slug}`} className="group flex flex-col h-full bg-white rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] transition-shadow duration-500 border-none">
                  <div className="aspect-[4/3] w-full bg-[#f5f5f7] overflow-hidden relative">
                    <img 
                      src={article.featured_image || "https://images.unsplash.com/photo-1551288049-bebda4e38f71"} 
                      alt={article.title} 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                    />
                  </div>
                  <div className="flex-1 flex flex-col p-8">
                    <h4 className="text-[24px] font-bold mb-3 text-[#1d1d1f] line-clamp-2 leading-[1.2] tracking-tight group-hover:text-[#093C15] transition-colors">
                      {article.title}
                    </h4>
                    <p className="text-[#1d1d1f]/60 line-clamp-2 mb-8 text-[17px] leading-relaxed font-medium">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center gap-3 mt-auto text-[14px] font-semibold text-[#1d1d1f]/50">
                      <img 
                        src={article.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(article.profiles?.full_name || 'T')}&background=e8f5e8&color=093C15&size=96&bold=true`}
                        alt={article.profiles?.full_name || 'Author'}
                        className="w-8 h-8 rounded-full object-cover border border-black/5"
                      />
                      <span className="text-[#1d1d1f]">{article.profiles?.full_name || 'Tela'}</span>
                    </div>
                  </div>
                </Link>
              </GsapReveal>
            ))}

            {(!articles || articles.length === 0) && (
              <div className="col-span-full py-20 text-center">
                 <p className="text-[#1d1d1f]/40 font-bold text-xl">No articles found in this category yet.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="py-10 border-t border-black/5 mt-20">
        <div className="container mx-auto px-4 text-center text-[13px] text-[#1d1d1f]/40 font-medium">
          © {new Date().getFullYear()} Tela Technologies. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
