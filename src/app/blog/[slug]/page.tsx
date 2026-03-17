import { Navbar } from "@/components/layout/Navbar";
import { GsapReveal } from "@/components/GsapReveal";
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
         <GsapReveal direction="up">
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
                   <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center font-bold text-[#1d1d1f] text-[16px]">
                     T
                   </div>
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
                   src="https://images.unsplash.com/photo-1664575602276-acd073f104c1?auto=format&fit=crop&w=2000&q=80" 
                   alt="Cover" 
                   className="w-full h-full object-cover mix-blend-multiply" 
                 />
              </div>

              <div className="prose prose-lg prose-p:text-[#1d1d1f]/80 prose-headings:text-[#1d1d1f] prose-headings:font-bricolage mx-auto font-poppins leading-relaxed max-w-none">
                 <p className="text-xl md:text-2xl leading-relaxed text-[#1d1d1f] font-medium mb-8">
                   This is a beautifully generated placeholder page for the article slug <strong>{slug}</strong>.
                 </p>
                 
                 <p>
                   Manage global payments, business operations, and local collections in one place. Open a USD, EUR, and GBP account for your business in minutes. The modern tech stack relies on seamless integrations.
                 </p>
                 
                 <h2 className="text-3xl mt-12 mb-6 tracking-tight">The Future of Global Finance</h2>
                 
                 <p>
                   As markets expand beyond borders, companies need robust infrastructure to handle complex, multi-currency operations without friction. 
                   With Tela, you can automate invoices, track vendor payouts, and ensure your team is always aligned with local compliance regulations everywhere you do business.
                 </p>

                 <div className="bg-[#f0fbf0] border border-[#41cc00]/20 rounded-2xl p-8 my-10">
                   <h3 className="text-[#093C15] font-bricolage font-bold text-2xl mb-4 mt-0">Why this matters</h3>
                   <ul className="space-y-3 mb-0">
                     <li className="flex items-start gap-2"><span className="text-[#41cc00] mt-1">•</span> Global collections are instantly verified</li>
                     <li className="flex items-start gap-2"><span className="text-[#41cc00] mt-1">•</span> Automated routing mitigates exchange risks</li>
                     <li className="flex items-start gap-2"><span className="text-[#41cc00] mt-1">•</span> Deep integrations with your existing ERP seamlessly</li>
                   </ul>
                 </div>

                 <p>
                   Building an international company inherently requires trust. That's why every transaction processed through our architecture prioritizes end-to-end security and real-time visibility for all stakeholders.
                 </p>
              </div>
           </article>
         </GsapReveal>
      </main>
    </div>
  );
}
