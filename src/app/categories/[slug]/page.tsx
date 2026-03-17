import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";

export default async function CategoryArchivePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug || '';
  
  // Clean up slug to look like a category name
  const displayCategory = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  // Placeholder category articles
  const categoryArticles = [
    {
      id: 1,
      slug: "essential-tools",
      title: `The essential tools for ${displayCategory} in 2026`,
      excerpt: `Discover how the latest advancements in ${displayCategory} are shifting the paradigm for businesses globally. Learn the secrets of top-tier professionals.`,
      featured_image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80",
      published_at: new Date().toISOString(),
      author: "Tela Team",
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
    },
    {
      id: 2,
      slug: "structuring-company",
      title: `Structuring your company for efficient ${displayCategory.toLowerCase()}`,
      excerpt: `When your business footprint crosses borders, organizing operations becomes critical. Here is how modern startups adapt.`,
      featured_image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1000&q=80",
      published_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      author: "Nneka Okoye",
      avatar_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80"
    },
    {
      id: 3,
      slug: "global-compliance",
      title: `Global compliance frameworks and ${displayCategory.toLowerCase()} management`,
      excerpt: `Avoid catastrophic regulatory issues by staying ahead of the compliance curve with automated tools.`,
      featured_image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=80",
      published_at: new Date(Date.now() - 86400000 * 12).toISOString(),
      author: "Chukwudi from Tela",
      avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#f3fbf3] to-[#e4fce4] font-sans selection:bg-[#41cc00]/30 selection:text-[#093C15]">
      <Navbar />
      
      <main className="pt-32 pb-24 md:pt-40">
        <section className="px-4 md:px-8 max-w-[1200px] mx-auto text-center mb-16 md:mb-24">
           <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-black/5 text-[13px] font-bold text-[#093C15] uppercase tracking-wider mb-6">
              Category
           </div>
           <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-[#1d1d1f] font-bricolage mb-6">
             {displayCategory}
           </h1>
           <p className="text-[#1d1d1f]/60 text-[18px] md:text-[22px] max-w-2xl mx-auto font-medium font-poppins">
             Explore the latest insights, strategies, and updates meticulously curated for the {displayCategory} category.
           </p>
        </section>

        <section className="px-4 md:px-8 max-w-[1200px] mx-auto">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
             {categoryArticles.map((article) => (
                <Link key={article.id} href={`/blog/${article.slug}`} className="group flex flex-col h-full bg-white rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] transition-shadow duration-500 border-none">
                  <div className="aspect-[4/3] w-full bg-[#eaecee] overflow-hidden relative">
                    <img 
                        src={article.featured_image} 
                        alt={article.title} 
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                    />
                  </div>
                  <div className="flex-1 flex flex-col p-8 bg-white z-10 relative">
                    <div className="flex items-center gap-2 text-[12px] font-bold text-[#41cc00] uppercase tracking-widest mb-4">
                      {displayCategory}
                    </div>
                    <h3 className="text-[22px] md:text-[24px] font-bold text-[#1d1d1f] mb-3 leading-[1.3] group-hover:text-[#093C15] transition-colors font-bricolage">
                      {article.title}
                    </h3>
                    <p className="text-[#1d1d1f]/60 text-[15px] leading-relaxed mb-6 font-medium line-clamp-3 flex-1 font-poppins">
                      {article.excerpt}
                    </p>
                    
                    {/* Author with avatar */}
                    <div className="flex items-center gap-3 mt-auto text-[14px] font-semibold text-[#1d1d1f]/50">
                      <img 
                        src={article.avatar_url}
                        alt={article.author}
                        className="w-8 h-8 rounded-full object-cover border border-black/5"
                      />
                      <span className="text-[#1d1d1f]">{article.author}</span>
                      <span className="px-1">•</span>
                      <span suppressHydrationWarning>{new Date(article.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                </Link>
             ))}
           </div>
        </section>
      </main>

      {/* FOOTER with matching gradient */}
      <footer className="bg-gradient-to-br from-white via-[#f3fbf3] to-[#e4fce4] border-t border-[#41cc00]/10 text-[#1d1d1f]/80 py-20 pb-10">
        <div className="container mx-auto px-4 md:px-8 max-w-[1280px]">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-20">
              <div className="col-span-2">
                <div className="flex flex-col items-start gap-6">
                  <div className="mb-2">
                    <img src="/images/logo.PNG" className="h-[28px] w-auto mix-blend-multiply opacity-90" alt="Tela Footer Logo"/>
                  </div>
                  <p className="text-[15px] text-[#1d1d1f]/60 max-w-[300px] leading-relaxed font-medium">
                    Tela is the borderless financial OS for ambitious businesses in emerging markets. Built for global scale.
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="text-[#1d1d1f] font-bold text-[13px] uppercase tracking-wider mb-6">Products</h4>
                <ul className="space-y-4 text-[15px] font-medium text-[#1d1d1f]/60">
                  <li><Link href="/" className="hover:text-[#1d1d1f] transition-colors">Payments</Link></li>
                  <li><Link href="/" className="hover:text-[#1d1d1f] transition-colors">Invoices</Link></li>
                  <li><Link href="/" className="hover:text-[#1d1d1f] transition-colors">Escrow</Link></li>
                  <li><Link href="/" className="hover:text-[#1d1d1f] transition-colors">Storefront</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-[#1d1d1f] font-bold text-[13px] uppercase tracking-wider mb-6">Company</h4>
                <ul className="space-y-4 text-[15px] font-medium text-[#1d1d1f]/60">
                  <li><Link href="/" className="hover:text-[#1d1d1f] transition-colors">About</Link></li>
                  <li><Link href="/" className="hover:text-[#1d1d1f] transition-colors text-[#093C15]">Blog</Link></li>
                  <li><Link href="/" className="hover:text-[#1d1d1f] transition-colors">Careers</Link></li>
                  <li><Link href="/" className="hover:text-[#1d1d1f] transition-colors">Contact</Link></li>
                </ul>
              </div>
           </div>
           
           <div className="pt-8 border-t border-[#1d1d1f]/10 flex flex-col md:flex-row items-center justify-between gap-4 text-[13px] text-[#1d1d1f]/50 font-medium">
             <p>© {new Date().getFullYear()} Tela Technologies. All rights reserved.</p>
             <div className="flex items-center gap-6">
               <Link href="/" className="hover:text-[#1d1d1f] transition-colors">Twitter</Link>
               <Link href="/" className="hover:text-[#1d1d1f] transition-colors">LinkedIn</Link>
               <Link href="/" className="hover:text-[#1d1d1f] transition-colors">Instagram</Link>
             </div>
           </div>
        </div>
      </footer>
    </div>
  );
}
