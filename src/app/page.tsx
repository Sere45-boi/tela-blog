import { Navbar } from "@/components/layout/Navbar";
import { GsapReveal } from "@/components/GsapReveal";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { FloatingIconsHero } from "@/components/ui/floating-icons-hero-section";
import { SearchBar } from "@/components/blog/SearchBar";
import { Suspense } from "react";
import { BlogContent, BlogGridSkeleton } from "@/components/blog/HomeStreaming";
import { IntercomClient } from "@/components/blog/IntercomClient";
import Image from "next/image";

export const revalidate = 3600; // Revalidate every hour

// --- Business & Fintech Icons (Vibrant Multi-color Palette) ---
const HERO_ICONS = [
  { id: 1, icon: 'stripe', className: 'top-[20%] left-[8%]', iconColor: 'text-[#635BFF]', bgColor: 'bg-indigo-50/80 shadow-[0_8px_30px_rgb(99,91,255,0.15)]' },
  { id: 2, icon: 'vercel', className: 'hidden md:flex top-[32%] right-[12%]', iconColor: 'text-slate-900', bgColor: 'bg-slate-50/80 shadow-[0_8px_30px_rgb(0,0,0,0.1)]' },
  { id: 4, icon: 'briefcase', className: 'hidden md:flex top-[48%] right-[6%]', iconColor: 'text-[#093C15]', bgColor: 'bg-green-50/80 shadow-[0_8px_30px_rgb(9,60,21,0.1)]' },
  { id: 5, icon: 'trending', className: 'bottom-[12%] right-[25%]', iconColor: 'text-[#41cc00]', bgColor: 'bg-emerald-50/80 shadow-[0_8px_30px_rgb(65,204,0,0.15)]' },
  { id: 6, icon: 'chart', className: 'hidden md:flex top-[12%] left-[15%]', iconColor: 'text-blue-600', bgColor: 'bg-blue-50/80 shadow-[0_8px_30px_rgb(37,99,235,0.15)]' },
  { id: 8, icon: 'globe', className: 'top-[62%] left-[12%]', iconColor: 'text-sky-600', bgColor: 'bg-sky-50/80 shadow-[0_8px_30px_rgb(2,132,199,0.15)]' },
  { id: 9, icon: 'wallet', className: 'bottom-[15%] left-[20%]', iconColor: 'text-emerald-600', bgColor: 'bg-emerald-50/80 shadow-[0_8px_30px_rgb(16,185,129,0.15)]' },
  { id: 10, icon: 'shield', className: 'hidden md:flex bottom-[30%] right-[10%]', iconColor: 'text-violet-600', bgColor: 'bg-violet-50/80 shadow-[0_8_30px_rgb(124,58,237,0.15)]' },
  { id: 11, icon: 'zap', className: 'hidden md:flex top-[10%] right-[18%]', iconColor: 'text-yellow-600', bgColor: 'bg-yellow-50/80 shadow-[0_8px_30px_rgb(202,138,4,0.15)]' },
];

import { AdSpace } from "@/components/blog/AdSpace";
import { NewsletterForm } from "@/components/blog/NewsletterForm";
import { MobileAppShowcase } from "@/components/blog/MobileAppShowcase";
import { EventLogger } from "@/components/blog/EventLogger";
import { Footer } from "@/components/layout/Footer";
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("site_settings")
    .select("site_title, site_description")
    .eq("id", 1)
    .single();

  const title = settings?.site_title || "Pulse by Tela";
  const description =
    settings?.site_description ||
    "Stay up-to-date with the latest financial news. Discover helpful financial strategies, business tips, and trends for financial management";

  return {
    title,
    description,
    keywords: ["Tela blog", "Pulse by Tela", "AI-powered solutions", "financial management", "African SMEs", "invoicing", "international payments"],
    authors: [{ name: "Pulse by TELA" }],
    openGraph: {
      title: "Insights for SMEs | Pulse by TELA",
      description,
      url: "https://blog.tela.ng",
      siteName: "Pulse by Tela",
      images: [{ url: "https://tela.ng/images/poster.jpg", width: 1200, height: 630 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://tela.ng/images/poster.jpg"],
    },
  };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const { search, page: pageParam } = await searchParams;
  const page = typeof pageParam === 'string' ? parseInt(pageParam) : 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#f3fbf3] to-[#e4fce4] font-sans selection:bg-[#41cc00]/30 selection:text-[#093C15]">
      <Navbar />
      <IntercomClient />
      <EventLogger type="visit" />

      <main className="pt-12 md:pt-16">
        <Suspense fallback={<div className="min-h-[60vh]" />}>
          <HeroSection />
        </Suspense>

        <Suspense fallback={<BlogGridSkeleton />}>
          <BlogContentWrapper search={search} page={page} />
        </Suspense>

        <NewsletterSection />
        
        <div className="py-24 bg-white/30">
          <MobileAppShowcase />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mb-32">
          <AdSpace position="home_middle" />
        </div>
      </main>

      <Suspense fallback={<div className="h-40" />}>
        <Footer />
      </Suspense>
    </div>
  );
}

async function HeroSection() {
  const supabase = await createClient();
  const { data: siteSettings } = await supabase.from("site_settings").select("*").eq("id", 1).single();
  
  const settings = siteSettings || {
    hero_title: "Pulse by Tela",
    hero_description: "Stay up-to-date with the latest financial news. Discover helpful financial strategies, business tips, and trends for financial management",
  };

  return (
    <FloatingIconsHero
      title={settings.hero_title}
      description={settings.hero_description}
      ctaHref="#articles"
      icons={HERO_ICONS}
    >
      <SearchBar />
    </FloatingIconsHero>
  );
}

async function BlogContentWrapper({ search, page }: { search?: string, page: number }) {
  const supabase = await createClient();
  const [settingsResult, categoriesResult] = await Promise.all([
    supabase.from("site_settings").select("*").eq("id", 1).single(),
    supabase.from("categories").select("name, slug").order("name")
  ]);

  const categories = categoriesResult?.data || [];
  const siteSettings = settingsResult?.data || {
    newsletter_title: "Insights that drive growth.",
    newsletter_description: "Join thousands of business owners getting weekly updates on finance, startups, and product building.",
  };

  return <BlogContent search={search} page={page} siteSettings={siteSettings} categories={categories} />;
}

async function NewsletterSection() {
  const supabase = await createClient();
  const { data: siteSettings } = await supabase.from("site_settings").select("*").eq("id", 1).single();
  
  const settings = siteSettings || {
    newsletter_title: "Insights that drive growth.",
    newsletter_description: "Join thousands of business owners getting weekly updates on finance, startups, and product building.",
  };

  return (
    <section className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto mb-20 md:mb-32 relative">
      <GsapReveal direction="up" className="relative group">
        <div className="absolute inset-x-12 -bottom-2 h-16 bg-[#41cc00] rounded-full blur-[40px] opacity-10 transform translate-y-2"></div>
        <div className="bg-gradient-to-br from-white via-[#f3fbf3] to-[#e4fce4] rounded-[2rem] p-6 sm:p-8 md:p-14 relative z-10 border border-[#41cc00]/20 shadow-[0_10px_40px_rgba(0,0,0,0.04)] flex flex-col md:flex-row items-center gap-8 md:gap-12 lg:gap-20">
          <div className="w-full md:w-1/2 text-center md:text-left">
            <h2 className="text-[32px] sm:text-[40px] md:text-[48px] lg:text-[46px] font-bold leading-[1.1] mb-5 tracking-tight text-[#093C15] font-bricolage">
              {settings.newsletter_title}
            </h2>
            <p className="text-[#093C15]/70 text-[16px] sm:text-[18px] leading-relaxed max-w-[360px] mx-auto md:mx-0 font-medium font-poppins">
              {settings.newsletter_description}
            </p>
          </div>
          <div className="w-full md:w-1/2">
            <NewsletterForm />
          </div>
        </div>
      </GsapReveal>
    </section>
  );
}

