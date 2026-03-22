import { Navbar } from "@/components/layout/Navbar";
import { GsapReveal } from "@/components/GsapReveal";
import { getPublishedArticles, getFeaturedArticle } from "@/app/queries/content";
import Link from "next/link";
import { Search, ChevronRight } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { FloatingIconsHero } from "@/components/ui/floating-icons-hero-section";
import { SearchBar } from "@/components/blog/SearchBar";
import { getAuthorAttribution } from "@/utils/author";
import { getCleanExcerpt } from "@/utils/excerpt";

// --- Business & Fintech Icons (Vibrant Multi-color Palette) ---
const HERO_ICONS = [
  { id: 1, icon: 'stripe', className: 'top-[20%] left-[8%]', iconColor: 'text-[#635BFF]', bgColor: 'bg-indigo-50/80 shadow-[0_8px_30px_rgb(99,91,255,0.15)]' },
  { id: 2, icon: 'vercel', className: 'top-[32%] right-[12%]', iconColor: 'text-slate-900', bgColor: 'bg-slate-50/80 shadow-[0_8px_30px_rgb(0,0,0,0.1)]' },
  { id: 4, icon: 'briefcase', className: 'top-[48%] right-[6%]', iconColor: 'text-[#093C15]', bgColor: 'bg-green-50/80 shadow-[0_8px_30px_rgb(9,60,21,0.1)]' },
  { id: 5, icon: 'trending', className: 'bottom-[12%] right-[25%]', iconColor: 'text-[#41cc00]', bgColor: 'bg-emerald-50/80 shadow-[0_8px_30px_rgb(65,204,0,0.15)]' },
  { id: 6, icon: 'chart', className: 'top-[12%] left-[15%]', iconColor: 'text-blue-600', bgColor: 'bg-blue-50/80 shadow-[0_8px_30px_rgb(37,99,235,0.15)]' },
  { id: 8, icon: 'globe', className: 'top-[62%] left-[12%]', iconColor: 'text-sky-600', bgColor: 'bg-sky-50/80 shadow-[0_8px_30px_rgb(2,132,199,0.15)]' },
  { id: 9, icon: 'wallet', className: 'bottom-[15%] left-[20%]', iconColor: 'text-emerald-600', bgColor: 'bg-emerald-50/80 shadow-[0_8px_30px_rgb(16,185,129,0.15)]' },
  { id: 10, icon: 'shield', className: 'bottom-[30%] right-[10%]', iconColor: 'text-violet-600', bgColor: 'bg-violet-50/80 shadow-[0_8_30px_rgb(124,58,237,0.15)]' },
  { id: 11, icon: 'zap', className: 'top-[10%] right-[18%]', iconColor: 'text-yellow-600', bgColor: 'bg-yellow-50/80 shadow-[0_8px_30px_rgb(202,138,4,0.15)]' },
];

import { AdSpace } from "@/components/blog/AdSpace";
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("site_settings")
    .select("site_title, site_description")
    .eq("id", 1)
    .single();

  return {
    title: settings?.site_title || "Tela Blog",
    description: settings?.site_description || "Insights on borderless business and global payments.",
  };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;
  const supabase = await createClient();
  const [featuredArticleResult, articlesResult, settingsResult, categoriesResult] = await Promise.all([
    getFeaturedArticle().catch(() => null),
    getPublishedArticles(1, 9, undefined, search).catch(() => ({ data: [] })),
    supabase.from("site_settings").select("*").eq("id", 1).single(),
    supabase.from("categories").select("name, slug").order("name")
  ]);

  const featuredArticle = featuredArticleResult || null;
  const articles = articlesResult?.data || [];
  const categories = categoriesResult?.data || [];
  const siteSettings = settingsResult?.data || {
    hero_title: "The Tela Blog.",
    hero_subtitle: "Ideas that grow.",
    hero_description: "Insights on borderless business, global payments, and financial tools for modern companies.",
    newsletter_title: "Insights that drive growth.",
    newsletter_description: "Join thousands of founders getting weekly updates on finance, startups, and product building.",
    footer_description: "Tela is the borderless financial OS for ambitious businesses in emerging markets. Built for global scale.",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#f3fbf3] to-[#e4fce4] font-sans selection:bg-[#41cc00]/30 selection:text-[#093C15]">
      <Navbar />

      <main className="pt-12 md:pt-16">
        {/* INTERACTIVE FLOATING HERO */}
        <FloatingIconsHero
          title={siteSettings.hero_title || "The Tela Blog"}
          subtitle={siteSettings.hero_accent_text || "FINANCIAL OS FOR MODERN BUSINESS"}
          description={siteSettings.hero_description || "Insights on borderless business, global payments, and financial tools for modern companies."}
          ctaHref="#articles"
          icons={HERO_ICONS}
        >
          <SearchBar />
        </FloatingIconsHero>

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
        {/* CATEGORY TABS SCROLLABLE */}
        <section className="mb-12 pt-2">
          <div className="container mx-auto px-6 md:px-8 max-w-7xl flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="whitespace-nowrap px-6 py-2.5 text-[15px] font-bold rounded-full transition-all duration-300 bg-[#093C15] text-white shadow-lg border border-[#093C15]"
            >
              All Stories
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

        {/* Ad Space after Featured */}
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <AdSpace position="home_middle" />
        </div>

        {/* ALL ARTICLES GRID */}
        <section className="container mx-auto px-6 md:px-8 max-w-7xl mb-16">
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
        <section className="px-6 md:px-8 max-w-7xl mx-auto mb-32 relative">
          <GsapReveal direction="up" className="relative group">
            {/* The subtle glow under the card */}
            <div className="absolute inset-x-12 -bottom-2 h-16 bg-[#41cc00] rounded-full blur-[40px] opacity-10 transform translate-y-2"></div>

            {/* The main light gradient card */}
            <div className="bg-gradient-to-br from-white via-[#f3fbf3] to-[#e4fce4] rounded-[2rem] p-8 md:p-14 relative z-10 border border-[#41cc00]/20 shadow-[0_10px_40px_rgba(0,0,0,0.04)] flex flex-col md:flex-row items-center gap-12 lg:gap-20">

              {/* Left Side: Text Details */}
              <div className="w-full md:w-1/2">
                <h2 className="text-[40px] md:text-[48px] lg:text-[46px] font-bold leading-[1.1] mb-5 tracking-tight text-[#093C15] font-bricolage">
                  {siteSettings.newsletter_title}
                </h2>
                <p className="text-[#093C15]/70 text-[18px] leading-relaxed max-w-[360px] font-medium font-poppins">
                  {siteSettings.newsletter_description}
                </p>
              </div>

              {/* Right Side: Inner Form Box */}
              <div className="w-full md:w-1/2">
                <div className="bg-white/60 backdrop-blur-md p-6 md:p-8 rounded-[1.25rem] border border-white shadow-sm">
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5 border-none">
                        <label className="text-[12px] font-bold text-[#093C15]/60 uppercase tracking-wider">First name</label>
                        <input type="text" className="w-full h-[46px] bg-white border border-black/5 rounded-lg px-4 text-[#1d1d1f] text-[14px] focus:border-[#41cc00] focus:ring-2 focus:ring-[#41cc00]/20 outline-none transition-all placeholder:text-black/20 shadow-sm" placeholder="Dami" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[12px] font-bold text-[#093C15]/60 uppercase tracking-wider">Last name</label>
                        <input type="text" className="w-full h-[46px] bg-white border border-black/5 rounded-lg px-4 text-[#1d1d1f] text-[14px] focus:border-[#41cc00] focus:ring-2 focus:ring-[#41cc00]/20 outline-none transition-all placeholder:text-black/20 shadow-sm" placeholder="Sere" />
                      </div>
                    </div>

                    <div className="space-y-1.5 pb-2">
                      <label className="text-[12px] font-bold text-[#093C15]/60 uppercase tracking-wider">Email address</label>
                      <input type="email" className="w-full h-[46px] bg-white border border-black/5 rounded-lg px-4 text-[#1d1d1f] text-[14px] focus:border-[#41cc00] focus:ring-2 focus:ring-[#41cc00]/20 outline-none transition-all placeholder:text-black/20 shadow-sm" placeholder="dami@example.com" />
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

      {/* FOOTER with matching gradient */}
      <footer className="bg-gradient-to-br from-white via-[#f3fbf3] to-[#e4fce4] border-t border-[#41cc00]/10 text-[#1d1d1f]/80 py-20 pb-10">
        <div className="container mx-auto px-6 md:px-8 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-20">
            <div className="lg:col-span-2">
              <div className="flex flex-col items-start gap-6">
                <div className="mb-2">
                  <img src="/images/logo.PNG" className="h-[28px] w-auto mix-blend-multiply opacity-90" alt="Tela Footer Logo" />
                </div>
                <p className="text-[15px] text-[#1d1d1f]/60 max-w-[300px] leading-relaxed font-medium">
                  {siteSettings.footer_description || "Tela is the borderless financial OS for ambitious businesses in emerging markets."}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-[#1d1d1f] font-bold text-[13px] uppercase tracking-wider mb-6">Products</h4>
              <ul className="space-y-4 text-[15px] font-medium text-[#1d1d1f]/60">
                {(siteSettings.footer_products || []).length > 0 ? (
                  (siteSettings.footer_products as any[]).map((link, i) => (
                    <li key={i}><Link href={link.url} className="hover:text-[#1d1d1f] transition-colors">{link.label}</Link></li>
                  ))
                ) : (
                  <>
                    <li><Link href="/" className="hover:text-[#1d1d1f] transition-colors">Payments</Link></li>
                    <li><Link href="/" className="hover:text-[#1d1d1f] transition-colors">Invoices</Link></li>
                  </>
                )}
              </ul>
            </div>

            <div>
              <h4 className="text-[#1d1d1f] font-bold text-[13px] uppercase tracking-wider mb-6">Company</h4>
              <ul className="space-y-4 text-[15px] font-medium text-[#1d1d1f]/60">
                {(siteSettings.footer_company || []).length > 0 ? (
                  (siteSettings.footer_company as any[]).map((link, i) => (
                    <li key={i}><Link href={link.url} className="hover:text-[#1d1d1f] transition-colors">{link.label}</Link></li>
                  ))
                ) : (
                  <>
                    <li><Link href="/" className="hover:text-[#1d1d1f] transition-colors">About</Link></li>
                    <li><Link href="/blog" className="hover:text-[#1d1d1f] transition-colors text-[#093C15]">Blog</Link></li>
                  </>
                )}
              </ul>
            </div>

            <div className="col-span-2 md:col-span-4 lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-10">
              <div>
                <h4 className="text-[#1d1d1f] font-bold text-[13px] uppercase tracking-wider mb-6">Resources</h4>
                <ul className="space-y-4 text-[15px] font-medium text-[#1d1d1f]/60">
                  {(siteSettings.footer_resources || []).length > 0 ? (
                    (siteSettings.footer_resources as any[]).map((link, i) => (
                      <li key={i}><Link href={link.url} className="hover:text-[#1d1d1f] transition-colors">{link.label}</Link></li>
                    ))
                  ) : (
                    <li><Link href="/" className="hover:text-[#1d1d1f] transition-colors">Help center</Link></li>
                  )}
                </ul>
              </div>
              <div>
                <h4 className="text-[#1d1d1f] font-bold text-[13px] uppercase tracking-wider mb-6">Legal</h4>
                <ul className="space-y-4 text-[15px] font-medium text-[#1d1d1f]/60">
                  {(siteSettings.footer_legal || []).length > 0 ? (
                    (siteSettings.footer_legal as any[]).map((link, i) => (
                      <li key={i}><Link href={link.url} className="hover:text-[#1d1d1f] transition-colors">{link.label}</Link></li>
                    ))
                  ) : (
                    <li><Link href="/" className="hover:text-[#1d1d1f] transition-colors">Privacy Policy</Link></li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-[#1d1d1f]/10 flex flex-col md:flex-row items-center justify-between gap-4 text-[13px] text-[#1d1d1f]/50 font-medium">
            <p>© {new Date().getFullYear()} {siteSettings.site_title || 'Tela'}. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href={siteSettings.twitter_handle ? `https://twitter.com/${siteSettings.twitter_handle.replace('@', '')}` : "#"} className="hover:text-[#1d1d1f] transition-colors" target="_blank">Twitter</Link>
              <Link href={siteSettings.linkedin_url || "#"} className="hover:text-[#1d1d1f] transition-colors" target="_blank">LinkedIn</Link>
              <Link href={siteSettings.instagram_url || "#"} className="hover:text-[#1d1d1f] transition-colors" target="_blank">Instagram</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
