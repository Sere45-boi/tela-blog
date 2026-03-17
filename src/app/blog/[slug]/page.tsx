import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug || '';
  
  // Clean up slug for display pseudo-title
  const displayTitle = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#f3fbf3] to-[#e4fce4] font-sans selection:bg-[#41cc00]/30 selection:text-[#093C15]">
      <Navbar />
      
      <main className="pt-32 pb-24 md:pt-40">
        <article className="max-w-[800px] mx-auto px-4 md:px-8">
            
            <Link href="/" className="inline-flex items-center gap-2 text-[#093C15]/70 hover:text-[#093C15] font-semibold text-[14px] mb-10 transition-colors">
              <ChevronLeft className="w-4 h-4" />
              Back to all articles
            </Link>

            <header className="mb-12 text-left">
              <div className="flex items-center gap-3 mb-6">
                 <span className="text-[#41cc00] font-bold tracking-[0.15em] text-[12px] uppercase">
                   Latest Blog
                 </span>
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
                 <div>
                   <div className="text-[16px] font-bold text-[#1d1d1f]">Tela Team</div>
                   <div className="text-[14px] text-[#1d1d1f]/60 font-medium font-poppins" suppressHydrationWarning>
                     4 min read • {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric'})}
                   </div>
                 </div>
              </div>
            </header>
            
            <div className="w-full aspect-[16/9] md:aspect-[21/9] bg-white rounded-[2rem] overflow-hidden mb-16 relative shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5">
               <img 
                 src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=2000&q=80" 
                 alt="Cover" 
                 className="w-full h-full object-cover" 
               />
            </div>

            <div className="max-w-none font-poppins leading-relaxed">
               <p className="text-xl md:text-2xl leading-relaxed text-[#1d1d1f] font-medium mb-8">
                 This is a beautifully generated placeholder page for the article slug <strong>{slug}</strong>.
               </p>
               
               <p className="text-[17px] text-[#1d1d1f]/80 mb-6 leading-[1.8]">
                 Manage global payments, business operations, and local collections in one place. Open a USD, EUR, and GBP account for your business in minutes. The modern tech stack relies on seamless integrations.
               </p>
               
               <h2 className="text-3xl font-bold mt-12 mb-6 tracking-tight text-[#1d1d1f] font-bricolage">The Future of Global Finance</h2>
               
               <p className="text-[17px] text-[#1d1d1f]/80 mb-6 leading-[1.8]">
                 As markets expand beyond borders, companies need robust infrastructure to handle complex, multi-currency operations without friction. 
                 With Tela, you can automate invoices, track vendor payouts, and ensure your team is always aligned with local compliance regulations everywhere you do business.
               </p>

               <div className="bg-[#f0fbf0] border border-[#41cc00]/20 rounded-2xl p-8 my-10">
                 <h3 className="text-[#093C15] font-bricolage font-bold text-2xl mb-4">Why this matters</h3>
                 <ul className="space-y-3">
                   <li className="flex items-start gap-2 text-[#1d1d1f]/80"><span className="text-[#41cc00] mt-1">•</span> Global collections are instantly verified</li>
                   <li className="flex items-start gap-2 text-[#1d1d1f]/80"><span className="text-[#41cc00] mt-1">•</span> Automated routing mitigates exchange risks</li>
                   <li className="flex items-start gap-2 text-[#1d1d1f]/80"><span className="text-[#41cc00] mt-1">•</span> Deep integrations with your existing ERP seamlessly</li>
                 </ul>
               </div>

               <p className="text-[17px] text-[#1d1d1f]/80 mb-6 leading-[1.8]">
                 Building an international company inherently requires trust. That&apos;s why every transaction processed through our architecture prioritizes end-to-end security and real-time visibility for all stakeholders.
               </p>
            </div>
        </article>
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
