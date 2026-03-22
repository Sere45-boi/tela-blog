export const revalidate = 3600; // Revalidate every hour
import { Navbar } from "@/components/layout/Navbar";
import { GsapReveal } from "@/components/GsapReveal";
import { createClient } from "@/utils/supabase/server";
import { Linkedin, Instagram, Facebook, Globe, Mail, ChevronLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "About Us | Pulse by Tela",
  description: "Meet the team behind Pulse by Tela – your source for global business insights.",
};

export default async function AboutPage() {
  const supabase = await createClient();

  // Fetch active public profiles (the editorial team)
  const { data: team } = await supabase
    .from("profiles")
    .select("*")
    .eq("is_active", true)
    .eq("is_public", true)
    .order("full_name");

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#f3fbf3] to-[#e4fce4] font-sans selection:bg-[#41cc00]/30 selection:text-[#093C15]">
      <Navbar />

      <main className="pt-32 pb-24 md:pt-40 px-6 md:px-12 xl:px-24">
        <div className="max-w-7xl mx-auto mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-[#093C15]/70 hover:text-[#093C15] font-semibold text-[14px] transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Back
          </Link>
        </div>

        <div className="max-w-[1200px] mx-auto">
          {/* Mission Hero Section */}
          <section className="mb-24 text-center md:text-left">
            <GsapReveal direction="up">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#41cc00]/10 text-[#093C15] text-[12px] font-bold uppercase tracking-[0.2em] mb-8">
                The Mission
              </div>
              <h1 className="text-5xl md:text-7xl font-bold font-bricolage text-[#1d1d1f] mb-8 leading-[1.05] tracking-tight">
                Insights for <span className="text-[#41cc00]">Smarter</span> Business.
              </h1>
              <p className="text-xl md:text-2xl text-[#1d1d1f]/60 font-medium leading-relaxed max-w-3xl mb-12">
                Pulse by Tela is more than just a blog. It&apos;s a digital instrument for modern founders, business teams, and global operating startups navigating the complexities of business.
              </p>
            </GsapReveal>
          </section>

          {/* Core Values / Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
            {[
              { label: "Articles", val: "20+", sub: "Published" },
              { label: "Insights", val: "Weekly", sub: "Expert Analysis" },
              { label: "Growth", val: "24/7", sub: "Always Learning" }
            ].map((stat, i) => (
              <GsapReveal key={i} direction="up" delay={i * 0.1}>
                <div className="p-8 rounded-[2.5rem] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5 hover:shadow-[0_20px_60px_rgb(0,0,0,0.08)] transition-all duration-500">
                  <span className="text-[11px] font-bold text-black/30 uppercase tracking-[0.2em]">{stat.label}</span>
                  <div className="text-4xl font-bold font-bricolage text-[#093C15] mt-4 mb-2">{stat.val}</div>
                  <p className="text-[#1d1d1f]/50 font-medium">{stat.sub}</p>
                </div>
              </GsapReveal>
            ))}
          </div>

          {/* Team Section */}
          <section id="team">
            <GsapReveal direction="up" className="mb-16">
              <h2 className="text-3xl md:text-4xl font-bold font-bricolage text-[#1d1d1f] mb-4">Editorial Team</h2>
              <p className="text-[#1d1d1f]/50 font-medium text-[16px]">The minds behind the stories.</p>
            </GsapReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {team?.map((member, i) => (
                <GsapReveal key={member.id} direction="up" delay={i * 0.1}>
                  <div className="group relative bg-white rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5 hover:border-[#41cc00]/20 transition-all duration-500">
                    <div className="w-24 h-24 rounded-3xl overflow-hidden mb-8 relative">
                      <img
                        src={member.avatar_url || "/images/placeholder.png"}
                        alt={member.full_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-3xl" />
                    </div>
                    <h3 className="text-2xl font-bold font-bricolage text-[#1d1d1f] mb-3">{member.full_name}</h3>
                    <p className="text-[#1d1d1f]/60 text-sm leading-relaxed mb-8 font-medium line-clamp-4 min-h-[5rem]">
                      {member.bio || "Contributing insights to the global financial ecosystem."}
                    </p>

                    <div className="flex items-center gap-3">
                      {member.linkedin_url && (
                        <Link href={member.linkedin_url} target="_blank" className="flex-1 inline-flex items-center justify-center gap-2 h-[46px] rounded-xl bg-[#093C15] text-white text-[14px] font-bold hover:bg-[#06290e] transition-all shadow-sm">
                          <Linkedin className="w-4 h-4" />
                          LinkedIn Profile
                        </Link>
                      )}
                      {member.instagram_url && (
                        <Link href={member.instagram_url} target="_blank" className="p-2.5 rounded-xl bg-black/[0.03] text-black/40 hover:bg-[#e4405f]/10 hover:text-[#e4405f] transition-all">
                          <Instagram className="w-4 h-4" />
                        </Link>
                      )}
                      {member.facebook_url && (
                        <Link href={member.facebook_url} target="_blank" className="p-2.5 rounded-xl bg-black/[0.03] text-black/40 hover:bg-[#1877f2]/10 hover:text-[#1877f2] transition-all">
                          <Facebook className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </GsapReveal>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
