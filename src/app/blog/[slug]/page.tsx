import { Navbar } from "@/components/layout/Navbar";
import { SocialShareButtons } from "@/components/blog/SocialShareButtons";
import { AdCarousel } from "@/components/blog/AdCarousel";
import Link from "next/link";
import { ChevronLeft, Clock, TrendingUp, Sparkles } from "lucide-react";
import type { Metadata } from "next";

// Mock recent & top posts for sidebar
const RECENT_POSTS = [
  { slug: "receive-ach", title: "Receive ACH payments in Nigeria with a US bank", date: "Mar 10, 2026" },
  { slug: "tela-remittance", title: "How to receive global payments in Nigeria securely", date: "Mar 8, 2026" },
  { slug: "no-paypal", title: "How Nigerian freelancers get paid without PayPal", date: "Mar 1, 2026" },
];

const TOP_READ = [
  { slug: "dollar-card", title: "What is a virtual dollar card and how does it work?", views: "2.4k" },
  { slug: "remote-jobs", title: "Top 10 remote job boards for African developers", views: "1.8k" },
  { slug: "usd-account", title: "Automating your invoices for global clients", views: "1.2k" },
];

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const displayTitle = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  return {
    title: `${displayTitle} | Tela Blog`,
    description: `Read "${displayTitle}" on the Tela Blog — insights on borderless business, global payments, and financial tools for modern companies.`,
    openGraph: {
      title: `${displayTitle} | Tela Blog`,
      description: `Read "${displayTitle}" on the Tela Blog — insights on borderless business, global payments, and financial tools.`,
      type: "article",
      siteName: "Tela Blog",
      images: ["https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80"],
    },
    twitter: {
      card: "summary_large_image",
      title: `${displayTitle} | Tela Blog`,
      description: `Read "${displayTitle}" on the Tela Blog.`,
      images: ["https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80"],
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug || '';
  const displayTitle = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  // JSON-LD structured data for Google
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: displayTitle,
    description: `Read "${displayTitle}" on the Tela Blog — insights on borderless business and global payments.`,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    author: { "@type": "Person", name: "Tela Team" },
    publisher: { "@type": "Organization", name: "Tela", logo: { "@type": "ImageObject", url: "/images/logo.PNG" } },
    datePublished: new Date().toISOString(),
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://tela.ng/blog/${slug}` },
  };

  return (
    <>
      {/* JSON-LD for SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="min-h-screen bg-gradient-to-br from-white via-[#f3fbf3] to-[#e4fce4] font-sans selection:bg-[#41cc00]/30 selection:text-[#093C15]" suppressHydrationWarning>
        <Navbar />
        
        <main className="pt-32 pb-24 md:pt-40">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex gap-12 lg:gap-16">
            
            {/* MAIN ARTICLE COLUMN */}
            <article className="flex-1 min-w-0 max-w-[800px]">
              
              <Link href="/" className="inline-flex items-center gap-2 text-[#093C15]/70 hover:text-[#093C15] font-semibold text-[14px] mb-10 transition-colors">
                <ChevronLeft className="w-4 h-4" />
                Back to all articles
              </Link>

              <header className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-[#41cc00] font-bold tracking-[0.15em] text-[12px] uppercase">Latest Blog</span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#1d1d1f] font-bricolage mb-8 leading-[1.1]">
                  {displayTitle}
                </h1>
                
                <div className="flex items-center gap-4 border-y border-black/5 py-6">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
                    alt="Author"
                    className="w-12 h-12 rounded-full object-cover border border-black/5"
                  />
                  <div className="flex-1">
                    <div className="text-[16px] font-bold text-[#1d1d1f]">Tela Team</div>
                    <div className="text-[14px] text-[#1d1d1f]/60 font-medium font-poppins">
                      4 min read • March 17, 2026
                    </div>
                  </div>
                  {/* Social share inline on desktop */}
                  <div className="hidden md:block">
                    <SocialShareButtons title={displayTitle} slug={slug} />
                  </div>
                </div>
              </header>
              
              {/* Cover image */}
              <div className="w-full aspect-[16/9] md:aspect-[21/9] bg-white rounded-[2rem] overflow-hidden mb-12 relative shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5">
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=2000&q=80" 
                  alt="Cover" 
                  className="w-full h-full object-cover" 
                />
              </div>

              {/* Mobile social share */}
              <div className="md:hidden mb-8">
                <SocialShareButtons title={displayTitle} slug={slug} />
              </div>

              {/* Article Content */}
              <div className="max-w-none font-poppins leading-relaxed">
                <p className="text-xl md:text-2xl leading-relaxed text-[#1d1d1f] font-medium mb-8">
                  This is a beautifully generated placeholder page for the article slug <strong>{slug}</strong>.
                </p>
                
                <p className="text-[17px] text-[#1d1d1f]/80 mb-6 leading-[1.8]">
                  Manage global payments, business operations, and local collections in one place. Open a USD, EUR, and GBP account for your business in minutes. The modern tech stack relies on seamless integrations that allow companies to scale without friction.
                </p>

                <img 
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80" 
                  alt="Dashboard analytics view" 
                  className="w-full rounded-2xl shadow-md my-10 border border-black/5"
                />
                
                <h2 className="text-3xl font-bold mt-12 mb-6 tracking-tight text-[#1d1d1f] font-bricolage">The Future of Global Finance</h2>
                
                <p className="text-[17px] text-[#1d1d1f]/80 mb-6 leading-[1.8]">
                  As markets expand beyond borders, companies need robust infrastructure to handle complex, multi-currency operations without friction. 
                  With <a href="https://tela.ng" className="text-[#093C15] underline decoration-[#41cc00]/40 underline-offset-4 hover:decoration-[#41cc00]">Tela</a>, you can automate invoices, track vendor payouts, and ensure your team is always aligned with local compliance regulations everywhere you do business.
                </p>

                <div className="bg-[#f0fbf0] border border-[#41cc00]/20 rounded-2xl p-8 my-10">
                  <h3 className="text-[#093C15] font-bricolage font-bold text-2xl mb-4">Why this matters</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 text-[#1d1d1f]/80"><span className="text-[#41cc00] mt-1">•</span> Global collections are instantly verified</li>
                    <li className="flex items-start gap-2 text-[#1d1d1f]/80"><span className="text-[#41cc00] mt-1">•</span> Automated routing mitigates exchange risks</li>
                    <li className="flex items-start gap-2 text-[#1d1d1f]/80"><span className="text-[#41cc00] mt-1">•</span> Deep integrations with your existing ERP seamlessly</li>
                  </ul>
                </div>

                <h2 className="text-3xl font-bold mt-12 mb-6 tracking-tight text-[#1d1d1f] font-bricolage">Building Trust at Scale</h2>

                <p className="text-[17px] text-[#1d1d1f]/80 mb-6 leading-[1.8]">
                  Building an international company inherently requires trust. That&apos;s why every transaction processed through our architecture prioritizes end-to-end security and real-time visibility for all stakeholders.
                </p>

                <p className="text-[17px] text-[#1d1d1f]/80 mb-6 leading-[1.8]">
                  Our platform supports multiple currencies, automated compliance checks, and real-time reporting dashboards that give CFOs and finance teams the confidence to operate globally without compromise.
                </p>
              </div>

              {/* Bottom share bar */}
              <div className="mt-16 pt-8 border-t border-black/5">
                <div className="flex items-center justify-between">
                  <p className="text-[15px] text-[#1d1d1f]/60 font-medium">Enjoyed this article? Share it with your network.</p>
                  <SocialShareButtons title={displayTitle} slug={slug} />
                </div>
              </div>
            </article>

            {/* RIGHT SIDEBAR */}
            <aside className="hidden lg:block w-[340px] shrink-0 space-y-8 sticky top-32 self-start">
              
              {/* Recent Posts */}
              <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Clock className="w-4 h-4 text-[#41cc00]" />
                  <h3 className="text-[14px] font-bold text-[#1d1d1f] uppercase tracking-wider">Recent Posts</h3>
                </div>
                <div className="space-y-4">
                  {RECENT_POSTS.map((post) => (
                    <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                      <h4 className="text-[15px] font-semibold text-[#1d1d1f] leading-snug group-hover:text-[#093C15] transition-colors line-clamp-2">
                        {post.title}
                      </h4>
                      <span className="text-[12px] text-[#1d1d1f]/40 font-medium mt-1 block">{post.date}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Top Read */}
              <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-5">
                  <TrendingUp className="w-4 h-4 text-[#41cc00]" />
                  <h3 className="text-[14px] font-bold text-[#1d1d1f] uppercase tracking-wider">Top Read</h3>
                </div>
                <div className="space-y-4">
                  {TOP_READ.map((post, i) => (
                    <Link key={post.slug} href={`/blog/${post.slug}`} className="group flex items-start gap-3">
                      <span className="text-[24px] font-bold text-[#41cc00]/30 leading-none mt-0.5">{i + 1}</span>
                      <div>
                        <h4 className="text-[15px] font-semibold text-[#1d1d1f] leading-snug group-hover:text-[#093C15] transition-colors line-clamp-2">
                          {post.title}
                        </h4>
                        <span className="text-[12px] text-[#1d1d1f]/40 font-medium mt-1 block">{post.views} views</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Fun / Highlights */}
              <div className="bg-gradient-to-br from-[#093C15] to-[#0a5a1f] rounded-2xl p-6 text-white">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-[#41cc00]" />
                  <h3 className="text-[14px] font-bold uppercase tracking-wider">Did You Know?</h3>
                </div>
                <p className="text-[14px] text-white/80 leading-relaxed">
                  Tela processes over <span className="text-[#41cc00] font-bold">$2M+</span> in cross-border payments monthly. Open your free business account today.
                </p>
                <Link href="/" className="mt-4 inline-flex items-center gap-2 text-[13px] font-bold text-[#41cc00] hover:text-white transition-colors">
                  Learn more →
                </Link>
              </div>

              {/* Ad Carousel */}
              <AdCarousel />
            </aside>
          </div>
        </main>

        {/* FOOTER */}
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
              <p suppressHydrationWarning>© {new Date().getFullYear()} Tela Technologies. All rights reserved.</p>
              <div className="flex items-center gap-6">
                <Link href="/" className="hover:text-[#1d1d1f] transition-colors">Twitter</Link>
                <Link href="/" className="hover:text-[#1d1d1f] transition-colors">LinkedIn</Link>
                <Link href="/" className="hover:text-[#1d1d1f] transition-colors">Instagram</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
