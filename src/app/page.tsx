import { Navbar } from "@/components/layout/Navbar";
import { GsapReveal } from "@/components/GsapReveal";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { FloatingIconsHero } from "@/components/ui/floating-icons-hero-section";
import { SearchBar } from "@/components/blog/SearchBar";
import { Suspense } from "react";
import { BlogContent, BlogGridSkeleton } from "@/components/blog/HomeStreaming";

export const revalidate = 3600; // Revalidate every hour


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
import { NewsletterForm } from "@/components/blog/NewsletterForm";
import { MobileAppShowcase } from "@/components/blog/MobileAppShowcase";
import { EventLogger } from "@/components/blog/EventLogger";
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
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const { search, page: pageParam } = await searchParams;
  const page = typeof pageParam === 'string' ? parseInt(pageParam) : 1;
  const supabase = await createClient();
  const [settingsResult, categoriesResult] = await Promise.all([
    supabase.from("site_settings").select("*").eq("id", 1).single(),
    supabase.from("categories").select("name, slug").order("name")
  ]);

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
      <EventLogger type="visit" />

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

        {/* CENTRAL FEATURED & ARTICLE GRID */}
        <Suspense fallback={<BlogGridSkeleton />}>
          <BlogContent search={search} page={page} siteSettings={siteSettings} categories={categories} />
        </Suspense>

        {/* Ad Space after Featured */}
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <AdSpace position="home_middle" />
        </div>

        {/* MOBILE APP / AI SHOWCASE SECTION */}
        <MobileAppShowcase />



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
                <NewsletterForm />
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

// --- Sub-components for Streaming ---
// Now imported from "@/components/blog/HomeStreaming"
