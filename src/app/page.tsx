import { Navbar } from "@/components/layout/Navbar";
import { GsapReveal } from "@/components/GsapReveal";
import { getPublishedArticles, getFeaturedArticle } from "@/app/queries/content";
import Link from "next/link";
import { Search, ChevronRight } from "lucide-react";

// Pre-defined categories
const CATEGORIES = [
  "All", "Business", "Payments", "Finance", "Freelancers", "Startups", 
  "Escrow", "Invoices", "Vendor management", "International payments"
];

const MOCK_FEATURED = {
  id: "mock-1",
  slug: "meet-tela-business",
  title: "Meet Tela Business: the growth engine for global finances",
  excerpt: "Manage global payments, business operations, and local collections in one place. Open a USD, EUR, and GBP account for your business in minutes.",
  // Nigerian/African imagery context
  featured_image: "https://images.unsplash.com/photo-1531123897727-8f129e1fa376?auto=format&fit=crop&w=2000&q=80",
  published_at: new Date().toISOString(),
  categories: { name: "Product Update" },
  profiles: { full_name: "Chukwudi from Tela" },
  read_time: 4
};

const MOCK_ARTICLES = [
  {
    id: "mock-2",
    slug: "receive-ach",
    title: "Receive ACH payments in Nigeria with a US bank",
    excerpt: "You can open a virtual US bank account with Tela and start receiving ACH payments directly from anywhere.",
    featured_image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1000&q=80",
    published_at: "2026-03-10T00:00:00.000Z",
    categories: { name: "Payments" },
    profiles: { full_name: "Bolanle from Tela" }
  },
  {
    id: "mock-3",
    slug: "tela-remittance",
    title: "How to receive global payments in Nigeria securely",
    excerpt: "The best way to get paid by global clients, directly to your local bank account at the best exchange rates.",
    featured_image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80",
    published_at: "2026-03-08T00:00:00.000Z",
    categories: { name: "International payments" },
    profiles: { full_name: "James Obi" }
  },
  {
    id: "mock-4",
    slug: "no-paypal",
    title: "How Nigerian freelancers get paid without PayPal",
    excerpt: "PayPal restrictions in Nigeria don't have to stop you from working globally. Here's exactly how to get around it securely.",
    featured_image: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=1000&q=80",
    published_at: "2026-03-01T00:00:00.000Z",
    categories: { name: "Freelancers" },
    profiles: { full_name: "Adeola Somolu" }
  },
  {
    id: "mock-5",
    slug: "dollar-card",
    title: "What is a virtual dollar card and how does it work?",
    excerpt: "Everything you need to know about virtual dollar cards and how they can help you pay for SaaS tools globally.",
    featured_image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=1000&q=80",
    published_at: "2026-02-24T00:00:00.000Z",
    categories: { name: "Finance" },
    profiles: { full_name: "Emeka Tela" }
  },
  {
    id: "mock-6",
    slug: "remote-jobs",
    title: "Top 10 remote job boards for African developers",
    excerpt: "Looking for remote work? Here are the best platforms to find high-paying tech roles across the globe.",
    featured_image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1000&q=80",
    published_at: "2026-02-18T00:00:00.000Z",
    categories: { name: "Business" },
    profiles: { full_name: "Nneka Okoye" }
  },
  {
    id: "mock-7",
    slug: "usd-account",
    title: "Automating your invoices for global clients",
    excerpt: "A step-by-step guide to setting up automated invoice tracking using Tela's built-in business suite.",
    featured_image: "https://images.unsplash.com/photo-1589156229687-496a31ad1d1f?auto=format&fit=crop&w=1000&q=80",
    published_at: "2026-02-10T00:00:00.000Z",
    categories: { name: "Invoices" },
    profiles: { full_name: "Tela Product Team" }
  }
];

export default async function Home() {
  const [featuredArticleResult, articlesResult] = await Promise.all([
    getFeaturedArticle().catch(() => null),
    getPublishedArticles().catch(() => ({ data: [] }))
  ]);
  
  const featuredArticle = featuredArticleResult || MOCK_FEATURED;
  const articles = (articlesResult?.data && articlesResult.data.length > 0) ? articlesResult.data : MOCK_ARTICLES;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#f3fbf3] to-[#e4fce4] font-sans selection:bg-[#41cc00]/30 selection:text-[#093C15]">
      {/* Search overlay placeholder / hidden by default but structural */}
      <Navbar />

      <main className="pt-24 md:pt-[140px]">
        {/* APPLE-STYLE HERO: Centered, Massive, Blending Background */}
        <section className="relative px-4 md:px-8 mb-24 lg:mb-32 max-w-[1400px] mx-auto">
          <GsapReveal direction="up" className="text-center max-w-4xl mx-auto mb-16 relative z-10">
            <h1 className="text-5xl md:text-7xl lg:text-[88px] font-bold tracking-[-0.03em] mb-6 leading-[1.05] text-[#1d1d1f]">
              The Tela Blog.
              <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#093C15] to-[#41cc00]">
                Ideas that grow.
              </span>
            </h1>
            <p className="text-xl md:text-[26px] text-[#1d1d1f]/60 leading-[1.4] max-w-2xl mx-auto font-medium">
              Insights on borderless business, global payments, and financial tools for modern companies.
            </p>
            
            {/* Search Input elegantly styled */}
            <div className="w-full max-w-[600px] mx-auto mt-12 relative group">
               <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none transition-colors group-focus-within:text-[#093C15]">
                 <Search className="h-5 w-5 text-[#1d1d1f]/40" />
               </div>
               <input 
                 type="text" 
                 placeholder="Search articles..." 
                 className="w-full h-[64px] pl-16 pr-6 bg-white shadow-[0_4px_24px_rgb(0,0,0,0.04)] rounded-[2rem] text-[17px] font-medium text-[#1d1d1f] placeholder:text-[#1d1d1f]/40 focus:outline-none focus:ring-4 focus:ring-[#41cc00]/20 transition-all border-none"
               />
            </div>
          </GsapReveal>
        </section>

        {/* CENTRAL FEATURED - Clean layout with image underneath */}
        <section className="px-4 md:px-8 max-w-[1200px] mx-auto mb-20 relative">
          <GsapReveal direction="up">
            <Link href={`/blog/${featuredArticle.slug}`} className="group block relative rounded-[2.5rem] overflow-hidden bg-white shadow-[0_10px_40px_rgb(0,0,0,0.06)] hover:shadow-[0_20px_60px_rgb(0,0,0,0.12)] transition-shadow duration-500 border border-black/5 flex flex-col">
                 
                 {/* Featured Content block at the top */}
                 <div className="p-8 md:p-14 md:pb-10 w-full flex flex-col justify-end bg-white z-10 relative">
                    <div className="flex items-center gap-3 mb-5">
                       <span className="text-[#41cc00] font-bold tracking-[0.15em] text-[12px] uppercase">
                         {(featuredArticle.categories as any)?.name === 'Product Update' ? 'Latest Blog' : ((featuredArticle.categories as any)?.name || 'Latest Blog')}
                       </span>
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-[56px] font-bold leading-[1.1] mb-6 max-w-4xl tracking-tight text-[#1d1d1f]">
                      {featuredArticle.title}
                    </h2>
                    <p className="text-[#1d1d1f]/60 text-[19px] md:text-[22px] leading-relaxed max-w-3xl font-medium line-clamp-2 mb-8">
                      {featuredArticle.excerpt}
                    </p>
                    <div className="flex items-center gap-3">
                       <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center font-bold text-[#1d1d1f] text-[16px]">
                         {(featuredArticle.profiles?.full_name || 'T')[0]}
                       </div>
                       <div>
                         <div className="text-[16px] font-bold text-[#1d1d1f]">{featuredArticle.profiles?.full_name || "Tela Team"}</div>
                         <div className="text-[14px] text-[#1d1d1f]/50 font-medium">4 min read • <span suppressHydrationWarning>{new Date(featuredArticle.published_at!).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric'})}</span></div>
                       </div>
                    </div>
                 </div>

                 {/* Image sitting underneath the text explicitly sized with fallback logic */}
                 <div className="w-full h-[400px] md:h-[500px] shrink-0 relative bg-[#eaecee] rounded-b-[2.5rem] overflow-hidden">
                   <img 
                     src={(typeof featuredArticle.featured_image === 'string' && featuredArticle.featured_image.trim() !== '') ? featuredArticle.featured_image : 'https://images.unsplash.com/photo-1664575602276-acd073f104c1?auto=format&fit=crop&w=2000&q=80'} 
                     alt={featuredArticle.title} 
                     decoding="async"
                     className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                   />
                 </div>
            </Link>
          </GsapReveal>
        </section>

        {/* CATEGORY TABS SCROLLABLE */}
        <section className="mb-8 pt-2 pb-6 md:pb-12">
          <div className="container mx-auto px-2 md:px-8 max-w-[1280px] flex md:justify-center justify-start overflow-hidden">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-3 px-4 bg-white rounded-full shadow-sm border border-black/5 max-w-full">
              {CATEGORIES.map((cat, i) => (
                <Link key={cat} href={`/categories/${cat.toLowerCase().replace(' ', '-')}`} className={`whitespace-nowrap px-5 py-2.5 text-[15px] font-semibold rounded-full transition-all duration-300 ${i === 0 ? 'bg-[#093C15] text-white shadow-md' : 'text-[#1d1d1f]/70 hover:text-[#093C15] hover:bg-black/5'}`}>
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ALL ARTICLES GRID - No borders, soft shadows, rounded 3xl */}
        <section className="container mx-auto px-4 md:px-8 max-w-[1400px] mb-32">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 gap-y-12">
            {articles.map((article: any, i: number) => (
              <GsapReveal key={article.id} direction="up" delay={0.05 * i}>
                <Link href={`/blog/${article.slug}`} className="group flex flex-col h-full bg-white rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] transition-shadow duration-500 border-none">
                  {/* Aspect ratio container for images */}
                  <div className="aspect-[4/3] w-full bg-[#f5f5f7] overflow-hidden relative">
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
                      <span>{(article.categories as any)?.name || 'Guide'}</span>
                    </div>
                    <h4 className="text-[24px] font-bold mb-3 text-[#1d1d1f] line-clamp-2 leading-[1.2] tracking-tight group-hover:text-[#093C15] transition-colors">
                      {article.title}
                    </h4>
                    <p className="text-[#1d1d1f]/60 line-clamp-2 mb-8 flex-1 text-[17px] leading-relaxed font-medium">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center gap-2 mt-auto text-[14px] font-semibold text-[#1d1d1f]/50">
                      <span className="text-[#1d1d1f]">{article.profiles?.full_name || 'Tela'}</span>
                      <span className="px-1">•</span>
                      <span suppressHydrationWarning>{new Date(article.published_at!).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                </Link>
              </GsapReveal>
            ))}
          </div>

          {/* Minimalist Pagination */}
          <div className="mt-24 flex items-center justify-center gap-2">
            <button className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-[16px] bg-[#093C15] text-white shadow-md">1</button>
            <button className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-[16px] text-[#1d1d1f] hover:bg-black/5 transition-colors">2</button>
            <button className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-[16px] text-[#1d1d1f] hover:bg-black/5 transition-colors">3</button>
            <span className="text-[#1d1d1f]/30 mx-3 font-bold">...</span>
            <button className="pl-6 pr-5 h-12 rounded-full flex items-center justify-center font-bold text-[16px] text-[#1d1d1f] hover:bg-black/5 transition-colors ml-2 bg-white shadow-sm">Next <ChevronRight className="w-5 h-5 ml-1" /></button>
          </div>
        </section>

        {/* LIGHT NEWSLETTER SIGNUP SECTION */}
        <section className="px-4 md:px-8 max-w-[1100px] mx-auto mb-32 relative">
          <GsapReveal direction="up" className="relative group">
            {/* The subtle glow under the card */}
            <div className="absolute inset-x-12 -bottom-2 h-16 bg-[#41cc00] rounded-full blur-[40px] opacity-10 transform translate-y-2"></div>

            {/* The main light gradient card */}
            <div className="bg-gradient-to-br from-white via-[#f3fbf3] to-[#e4fce4] rounded-[2rem] p-8 md:p-14 relative z-10 border border-[#41cc00]/20 shadow-[0_10px_40px_rgba(0,0,0,0.04)] flex flex-col md:flex-row items-center gap-12 lg:gap-20">
              
              {/* Left Side: Text Details */}
              <div className="w-full md:w-1/2">
                <h2 className="text-[40px] md:text-[48px] lg:text-[56px] font-bold leading-[1.1] mb-5 tracking-tight text-[#093C15] font-bricolage">
                  Insights that<br/>drive growth.
                </h2>
                <p className="text-[#093C15]/70 text-[18px] leading-relaxed max-w-[360px] font-medium font-poppins">
                  Join thousands of founders getting weekly updates on finance, startups, and product building.
                </p>
              </div>

              {/* Right Side: Inner Form Box */}
              <div className="w-full md:w-1/2">
                <div className="bg-white/60 backdrop-blur-md p-6 md:p-8 rounded-[1.25rem] border border-white shadow-sm">
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5 border-none">
                        <label className="text-[12px] font-bold text-[#093C15]/60 uppercase tracking-wider">First name</label>
                        <input type="text" className="w-full h-[46px] bg-white border border-black/5 rounded-lg px-4 text-[#1d1d1f] text-[14px] focus:border-[#41cc00] focus:ring-2 focus:ring-[#41cc00]/20 outline-none transition-all placeholder:text-black/20 shadow-sm" placeholder="Jane" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[12px] font-bold text-[#093C15]/60 uppercase tracking-wider">Last name</label>
                        <input type="text" className="w-full h-[46px] bg-white border border-black/5 rounded-lg px-4 text-[#1d1d1f] text-[14px] focus:border-[#41cc00] focus:ring-2 focus:ring-[#41cc00]/20 outline-none transition-all placeholder:text-black/20 shadow-sm" placeholder="Doe" />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5 pb-2">
                      <label className="text-[12px] font-bold text-[#093C15]/60 uppercase tracking-wider">Email address</label>
                      <input type="email" className="w-full h-[46px] bg-white border border-black/5 rounded-lg px-4 text-[#1d1d1f] text-[14px] focus:border-[#41cc00] focus:ring-2 focus:ring-[#41cc00]/20 outline-none transition-all placeholder:text-black/20 shadow-sm" placeholder="jane@company.com" />
                    </div>
                    
                    <button type="button" className="w-full h-[52px] bg-[#093C15] text-white font-bold text-[15px] rounded-lg hover:bg-[#06290e] transition-colors shadow-md flex items-center justify-center">
                      Subscribe
                    </button>
                  </form>
                </div>
              </div>

            </div>
          </GsapReveal>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#f5f5f7] border-t border-[#1d1d1f]/10 text-[#1d1d1f]/80 py-20 pb-10">
        <div className="container mx-auto px-4 md:px-8 max-w-[1280px]">
           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-20">
              <div className="lg:col-span-2">
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
                  <li><Link href="/blog" className="hover:text-[#1d1d1f] transition-colors text-[#093C15]">Blog</Link></li>
                  <li><Link href="/" className="hover:text-[#1d1d1f] transition-colors">Careers</Link></li>
                  <li><Link href="/" className="hover:text-[#1d1d1f] transition-colors">Contact</Link></li>
                </ul>
              </div>
              
              <div className="col-span-2 md:col-span-4 lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-10">
                <div>
                  <h4 className="text-[#1d1d1f] font-bold text-[13px] uppercase tracking-wider mb-6">Resources</h4>
                  <ul className="space-y-4 text-[15px] font-medium text-[#1d1d1f]/60">
                    <li><Link href="/" className="hover:text-[#1d1d1f] transition-colors">Help center</Link></li>
                    <li><Link href="/" className="hover:text-[#1d1d1f] transition-colors">Documentation</Link></li>
                    <li><Link href="/" className="hover:text-[#1d1d1f] transition-colors">Guides</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-[#1d1d1f] font-bold text-[13px] uppercase tracking-wider mb-6">Legal</h4>
                  <ul className="space-y-4 text-[15px] font-medium text-[#1d1d1f]/60">
                    <li><Link href="/" className="hover:text-[#1d1d1f] transition-colors">Privacy Policy</Link></li>
                    <li><Link href="/" className="hover:text-[#1d1d1f] transition-colors">Terms of Service</Link></li>
                  </ul>
                </div>
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
