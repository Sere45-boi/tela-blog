"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Save, Globe, Type, FileText, Share2, Loader2, Image as ImageIcon } from "lucide-react";
import { updateSiteSettings } from "@/app/actions/settings";
import { createClient } from "@/utils/supabase/client";
import { GsapReveal } from "@/components/GsapReveal";
import { GlassCard } from "@/components/ui/Card";

const Section = ({ title, icon: Icon, children, description }: { title: string; icon: any; children: React.ReactNode; description?: string }) => (
  <GsapReveal direction="up" delay={0.1}>
    <GlassCard className="p-8 md:p-10 space-y-8 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-5 pb-6 border-b border-black/5">
        <div className="p-3 rounded-2xl bg-[#41cc00]/10 text-[#093C15]">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#1d1d1f] tracking-tight">{title}</h2>
          {description && <p className="text-[13px] text-black/30 font-medium">{description}</p>}
        </div>
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </GlassCard>
  </GsapReveal>
);

export default function SiteSettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    site_title: "Tela Blog",
    site_tagline: "Ideas that grow.",
    site_description: "Discover expert insights on borderless business, global payments, and financial tools for modern companies operating across Africa and the world.",
    hero_title: "The Tela Blog.",
    hero_subtitle: "Ideas that grow.",
    hero_description: "Insights on borderless business, global payments, and financial tools for modern companies.",
    newsletter_title: "Insights that drive growth.",
    newsletter_description: "Join thousands of founders getting weekly updates on finance, startups, and product building.",
    footer_description: "Tela is the borderless financial OS for ambitious businesses in emerging markets. Built for global scale.",
    header_governance_text: "Governance",
    footer_copyright_text: "© 2026 Tela Blog. All rights reserved.",
    footer_link_1_label: "Privacy Policy",
    footer_link_1_url: "/privacy",
    footer_link_2_label: "Terms of Service",
    footer_link_2_url: "/terms",
    meta_keywords: "global payments, fintech Africa, business blog, cross-border payments, virtual dollar card, Nigeria fintech",
    twitter_handle: "@taborahq",
    linkedin_url: "https://linkedin.com/company/tela",
    instagram_url: "https://instagram.com/tela",
    facebook_url: "",
  });

  useEffect(() => {
    async function loadSettings() {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", 1)
        .single();
      
      if (data && !error) {
        setSettings(data);
      }
      setLoading(false);
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSiteSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert("Error saving: " + err.message);
    }
    setSaving(false);
  };

  const updateField = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-[1400px]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <GsapReveal direction="up">
          <h1 className="text-3xl font-bold tracking-tight text-[#1d1d1f] font-bricolage mb-2">Site Environment</h1>
          <p className="text-[#1d1d1f]/40 font-medium tracking-tight">Configure global branding, content systems, and SEO architecture.</p>
        </GsapReveal>
        
        <GsapReveal direction="up" delay={0.1}>
          <Button 
            onClick={handleSave} 
            isLoading={saving}
            className="h-12 px-8 bg-[#093C15] group shadow-lg shadow-[#093C15]/10 hover:bg-[#0a5a1f] transition-all"
            disabled={loading}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 group-hover:scale-110 transition-transform mr-2" />}
            {saved ? "Configuration Saved ✓" : "Save Changes"}
          </Button>
        </GsapReveal>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-32">
          <Loader2 className="h-10 w-10 animate-spin text-[#41cc00]" />
        </div>
      ) : (
        <div className="space-y-12 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left Column */}
            <div className="space-y-8">
              <Section 
                title="Identity & SEO" 
                icon={Globe}
                description="Manage the absolute core markers of your platform identity."
              >
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[12px] font-bold text-[#1d1d1f]/60 ml-1">Site Title</label>
                    <Input 
                      value={settings.site_title} 
                      onChange={(e) => updateField("site_title", e.target.value)}
                      className="h-12 bg-white/50 border-black/5 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-bold text-[#1d1d1f]/60 ml-1">Universal Tagline</label>
                    <Input 
                      value={settings.site_tagline} 
                      onChange={(e) => updateField("site_tagline", e.target.value)}
                      className="h-12 bg-white/50 border-black/5 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-bold text-[#1d1d1f]/60 ml-1">Global SEO Description</label>
                    <textarea 
                      className="w-full h-32 rounded-2xl border border-black/5 bg-white/50 p-4 text-[#1d1d1f] text-[14px] font-medium focus:border-[#41cc00]/40 outline-none transition-all resize-none shadow-sm"
                      value={settings.site_description || ""}
                      onChange={(e) => updateField("site_description", e.target.value)}
                    />
                    <div className="flex justify-end pr-1">
                      <span className={`text-[10px] font-bold ${(settings.site_description || "").length > 160 ? "text-orange-500" : "text-black/20"}`}>
                        {(settings.site_description || "").length}/160 chars
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-bold text-[#1d1d1f]/60 ml-1">Meta Keywords</label>
                    <Input 
                      value={settings.meta_keywords || ""} 
                      onChange={(e) => updateField("meta_keywords", e.target.value)}
                      className="h-12 bg-white/50 border-black/5 rounded-xl"
                    />
                  </div>
                </div>
              </Section>

              <Section 
                title="Engagement & Social" 
                icon={Share2}
                description="Connect community distribution channels."
              >
                <div className="space-y-4">
                  {[
                    { label: "X (Twitter)", key: "twitter_handle", placeholder: "@handle" },
                    { label: "LinkedIn", key: "linkedin_url", placeholder: "URL" },
                    { label: "Instagram", key: "instagram_url", placeholder: "URL" },
                    { label: "Facebook", key: "facebook_url", placeholder: "URL" }
                  ].map(social => (
                    <div key={social.key} className="space-y-1.5">
                      <label className="text-[11px] font-bold text-black/30 uppercase tracking-wider ml-1">{social.label}</label>
                      <Input 
                        value={(settings as any)[social.key] || ""} 
                        onChange={(e) => updateField(social.key, e.target.value)} 
                        placeholder={social.placeholder}
                        className="h-11 bg-white/50 border-black/5 rounded-xl"
                      />
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 border-t border-black/5 pt-6 space-y-6">
                  <h3 className="text-[12px] font-bold flex items-center gap-2 text-[#093C15] uppercase tracking-wider">
                    <FileText className="w-4 h-4" /> Newsletter Strategy
                  </h3>
                  <div className="space-y-2">
                    <label className="text-[12px] font-bold text-[#1d1d1f]/60 ml-1">Campaign Heading</label>
                    <Input 
                      value={settings.newsletter_title || ""} 
                      onChange={(e) => updateField("newsletter_title", e.target.value)}
                      className="h-12 bg-white/50 border-black/5 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-bold text-[#1d1d1f]/60 ml-1">Value Proposition Description</label>
                    <textarea 
                      className="w-full h-24 rounded-2xl border border-black/5 bg-white/50 p-6 text-[#1d1d1f] text-[14px] font-medium focus:border-[#41cc00]/40 outline-none transition-all resize-none shadow-sm"
                      value={settings.newsletter_description || ""}
                      onChange={(e) => updateField("newsletter_description", e.target.value)}
                    />
                  </div>
                </div>
              </Section>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              <Section 
                title="Narrative Content" 
                icon={Type}
                description="Configure the high-impact storytelling elements for the home interface."
              >
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[12px] font-bold text-[#1d1d1f]/60 ml-1">Hero Primary Heading</label>
                    <Input 
                      value={settings.hero_title || ""} 
                      onChange={(e) => updateField("hero_title", e.target.value)}
                      className="h-12 bg-white/50 border-black/5 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-bold text-[#1d1d1f]/60 ml-1">Gradient Accent Text</label>
                    <Input 
                      value={settings.hero_subtitle || ""} 
                      onChange={(e) => updateField("hero_subtitle", e.target.value)}
                      className="h-12 bg-white/50 border-black/5 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-bold text-[#1d1d1f]/60 ml-1">Hero Narrative</label>
                    <textarea 
                      className="w-full h-24 rounded-2xl border border-black/5 bg-white/50 p-6 text-[#1d1d1f] text-[14px] font-medium focus:border-[#41cc00]/40 outline-none transition-all resize-none shadow-sm"
                      value={settings.hero_description || ""}
                      onChange={(e) => updateField("hero_description", e.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-8 border-t border-black/5 pt-6 space-y-6">
                  <h3 className="text-[12px] font-bold flex items-center gap-2 text-[#093C15] uppercase tracking-wider">
                    <FileText className="w-4 h-4" /> STRUCTURAL GOVERNANCE
                  </h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-[#1d1d1f]/60 ml-1">Header Governance Title</label>
                      <Input 
                        value={settings.header_governance_text || ""} 
                        onChange={(e) => updateField("header_governance_text", e.target.value)}
                        placeholder="Governance"
                        className="h-12 bg-white/50 border-black/5 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-[#1d1d1f]/60 ml-1">Footer Narrative Copy</label>
                      <textarea 
                        className="w-full h-24 rounded-2xl border border-black/5 bg-white/50 p-6 text-[#1d1d1f] text-[14px] font-medium focus:border-[#41cc00]/40 outline-none transition-all resize-none shadow-sm"
                        value={settings.footer_description || ""}
                        onChange={(e) => updateField("footer_description", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-[#1d1d1f]/60 ml-1">Footer Copyright Marker</label>
                      <Input 
                        value={settings.footer_copyright_text || ""} 
                        onChange={(e) => updateField("footer_copyright_text", e.target.value)}
                        className="h-12 bg-white/50 border-black/5 rounded-xl"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-black/20 uppercase tracking-widest ml-1">Link 1 Label</label>
                        <Input 
                          value={settings.footer_link_1_label || ""} 
                          onChange={(e) => updateField("footer_link_1_label", e.target.value)}
                          className="h-12 bg-white/50 border-black/5 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-black/20 uppercase tracking-widest ml-1">Link 1 URL</label>
                        <Input 
                          value={settings.footer_link_1_url || ""} 
                          onChange={(e) => updateField("footer_link_1_url", e.target.value)}
                          className="h-12 bg-white/50 border-black/5 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-black/20 uppercase tracking-widest ml-1">Link 2 Label</label>
                        <Input 
                          value={settings.footer_link_2_label || ""} 
                          onChange={(e) => updateField("footer_link_2_label", e.target.value)}
                          className="h-12 bg-white/50 border-black/5 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-black/20 uppercase tracking-widest ml-1">Link 2 URL</label>
                        <Input 
                          value={settings.footer_link_2_url || ""} 
                          onChange={(e) => updateField("footer_link_2_url", e.target.value)}
                          className="h-12 bg-white/50 border-black/5 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Section>

              <GsapReveal direction="up" delay={0.4}>
                <div className="p-8 bg-[#093C15] overflow-hidden relative shadow-2xl rounded-[2.5rem]">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-[#41cc00]/10 rounded-full blur-[80px] -mr-32 -mt-32" />
                   <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                         <span className="px-2 py-0.5 rounded bg-[#41cc00] text-[#093C15] text-[10px] font-bold uppercase tracking-widest">Enterprise Protocol</span>
                      </div>
                      <h3 className="text-[18px] font-bold font-bricolage text-white mb-4 tracking-tight">Configuration Integrity</h3>
                      <p className="text-white/70 text-[13px] font-medium leading-relaxed mb-8">
                        Updates to site settings propagate immediately. Ensure descriptors maintain SEO length requirements.
                      </p>
                      <Button variant="ghost" className="w-full h-11 border-white/20 text-white hover:bg-white hover:text-[#093C15] rounded-xl font-bold px-8 bg-white/5 transition-all text-[12px]">Refresh Global Cache</Button>
                   </div>
                </div>
              </GsapReveal>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
