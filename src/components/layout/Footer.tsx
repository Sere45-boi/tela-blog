import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/server";

export async function Footer() {
  const supabase = await createClient();
  const { data: siteSettings } = await supabase.from("site_settings").select("*").eq("id", 1).single();
  
  const settings = siteSettings || {};

  return (
    <footer className="bg-gradient-to-br from-white via-[#f3fbf3] to-[#e4fce4] border-t border-[#41cc00]/10 text-[#1d1d1f]/80 py-20 pb-10 mt-20">
      <div className="container mx-auto px-6 md:px-8 max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-20">
          <div className="lg:col-span-2">
            <div className="flex flex-col items-start gap-6">
              <div className="mb-2">
                <Image 
                  src="/images/logo.PNG" 
                  width={160} 
                  height={40} 
                  className="h-[40px] w-auto mix-blend-multiply opacity-90" 
                  alt="Tela Footer Logo" 
                />
              </div>
              <p className="text-[15px] text-[#1d1d1f]/60 max-w-[300px] leading-relaxed font-medium">
                {settings.footer_description || "TELA a sub of Difi Financial Services LTD. TELA offers its financial services in partnership with licensed financial institutions in their respective jurisdictions."}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-[#1d1d1f] font-bold text-[13px] uppercase tracking-wider mb-6">Products</h4>
            <ul className="space-y-4 text-[15px] font-medium text-[#1d1d1f]/60">
              <li><Link href="https://tela.ng/ai" className="hover:text-[#1d1d1f] transition-colors">AI</Link></li>
              <li><Link href="https://quiz.tela.ng" className="hover:text-[#1d1d1f] transition-colors">Quiz</Link></li>
              <li><Link href="https://tela.ng/Payment" className="hover:text-[#1d1d1f] transition-colors">Payments</Link></li>
              <li><Link href="https://tela.ng/Business" className="hover:text-[#1d1d1f] transition-colors">Business</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#1d1d1f] font-bold text-[13px] uppercase tracking-wider mb-6">Resources</h4>
            <ul className="space-y-4 text-[15px] font-medium text-[#1d1d1f]/60">
              <li><Link href="https://intercom.help/tela-ng/en" className="hover:text-[#1d1d1f] transition-colors">Help center</Link></li>
              <li><Link href="https://tela.ng/contact-us" className="hover:text-[#1d1d1f] transition-colors"> Contact</Link></li>
              <li><Link href="https://tela.ng/careers" className="hover:text-[#1d1d1f] transition-colors">Careers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#1d1d1f] font-bold text-[13px] uppercase tracking-wider mb-6">Legals</h4>
            <ul className="space-y-4 text-[15px] font-medium text-[#1d1d1f]/60">
              <li><Link href="https://tela.ng/cookies" className="hover:text-[#1d1d1f] transition-colors">Cookie Policy</Link></li>
              <li><Link href="https://tela.ng/privacy" className="hover:text-[#1d1d1f] transition-colors">Privacy Policy</Link></li>
              <li><Link href="https://tela.ng/Terms&conditions" className="hover:text-[#1d1d1f] transition-colors">Terms &amp; Conditions</Link></li>
              <li><Link href="https://tela.ng/merchant" className="hover:text-[#1d1d1f] transition-colors">Merchant Agreement</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#1d1d1f]/10 flex flex-col md:flex-row items-center justify-between gap-4 text-[13px] text-[#1d1d1f]/50 font-medium">
          <p>© {new Date().getFullYear()} {settings.footer_copyright_text || 'Tela'}</p>
          <div className="flex items-center gap-6">
            <Link href={settings.twitter_handle || "#"} className="hover:text-[#1d1d1f] transition-colors" target="_blank">X</Link>
            <Link href={settings.linkedin_url || "#"} className="hover:text-[#1d1d1f] transition-colors" target="_blank">LinkedIn</Link>
            <Link href={settings.instagram_url || "#"} className="hover:text-[#1d1d1f] transition-colors" target="_blank">Instagram</Link>
            <Link href={settings.facebook_url || "#"} className="hover:text-[#1d1d1f] transition-colors" target="_blank">TikTok</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
