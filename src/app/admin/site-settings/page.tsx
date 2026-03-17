"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Save, Globe, Type, FileText, Share2, Loader2 } from "lucide-react";
import { updateSiteSettings } from "@/app/actions/settings";
import { createClient } from "@/utils/supabase/client";

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

  const Section = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
    <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6 md:p-8 space-y-5">
      <div className="flex items-center gap-3 pb-4 border-b border-black/5">
        <div className="p-2 rounded-xl bg-[#41cc00]/10">
          <Icon className="w-4 h-4 text-[#093C15]" />
        </div>
        <h2 className="text-[16px] font-bold text-[#1d1d1f]">{title}</h2>
      </div>
      {children}
    </div>
  );

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1d1d1f] font-bricolage mb-2">Site Settings</h1>
          <p className="text-[#1d1d1f]/50 font-medium">Manage your blog&apos;s content, branding, and SEO configuration.</p>
        </div>
        <Button 
          variant="primary" 
          onClick={handleSave} 
          isLoading={saving}
          className="gap-2"
          disabled={loading}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saved ? "Saved ✓" : "Save Changes"}
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#41cc00]" />
        </div>
      ) : (
        <div className="space-y-6">
          <Section title="General" icon={Globe}>
            <div>
              <label className="text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider mb-2 block">Site Title</label>
              <Input value={settings.site_title} onChange={(e) => updateField("site_title", e.target.value)} />
            </div>
            <div>
              <label className="text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider mb-2 block">Tagline</label>
              <Input value={settings.site_tagline} onChange={(e) => updateField("site_tagline", e.target.value)} />
            </div>
            <div>
              <label className="text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider mb-2 block">Site Meta Description (SEO)</label>
              <textarea 
                className="w-full h-24 rounded-xl border border-black/10 bg-white p-4 text-[#1d1d1f] text-[14px] focus:border-[#41cc00] focus:ring-2 focus:ring-[#41cc00]/20 outline-none transition-all resize-none"
                value={settings.site_description || ""}
                onChange={(e) => updateField("site_description", e.target.value)}
              />
              <p className="text-[11px] text-[#1d1d1f]/40 mt-1 text-right">{(settings.site_description || "").length}/160 recommended</p>
            </div>
            <div>
              <label className="text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider mb-2 block">Meta Keywords (comma-separated)</label>
              <Input value={settings.meta_keywords || ""} onChange={(e) => updateField("meta_keywords", e.target.value)} />
            </div>
          </Section>

          <Section title="Homepage Content" icon={Type}>
            <div>
              <label className="text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider mb-2 block">Hero Title</label>
              <Input value={settings.hero_title || ""} onChange={(e) => updateField("hero_title", e.target.value)} />
            </div>
            <div>
              <label className="text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider mb-2 block">Hero Gradient Text</label>
              <Input value={settings.hero_subtitle || ""} onChange={(e) => updateField("hero_subtitle", e.target.value)} />
            </div>
            <div>
              <label className="text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider mb-2 block">Hero Description</label>
              <textarea 
                className="w-full h-20 rounded-xl border border-black/10 bg-white p-4 text-[#1d1d1f] text-[14px] focus:border-[#41cc00] focus:ring-2 focus:ring-[#41cc00]/20 outline-none transition-all resize-none"
                value={settings.hero_description || ""}
                onChange={(e) => updateField("hero_description", e.target.value)}
              />
            </div>
          </Section>

          <Section title="Newsletter Section" icon={FileText}>
            <div>
              <label className="text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider mb-2 block">Newsletter Heading</label>
              <Input value={settings.newsletter_title || ""} onChange={(e) => updateField("newsletter_title", e.target.value)} />
            </div>
            <div>
              <label className="text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider mb-2 block">Newsletter Description</label>
              <textarea 
                className="w-full h-20 rounded-xl border border-black/10 bg-white p-4 text-[#1d1d1f] text-[14px] focus:border-[#41cc00] focus:ring-2 focus:ring-[#41cc00]/20 outline-none transition-all resize-none"
                value={settings.newsletter_description || ""}
                onChange={(e) => updateField("newsletter_description", e.target.value)}
              />
            </div>
          </Section>

          <Section title="Social Media" icon={Share2}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider mb-2 block">Twitter Handle</label>
                <Input value={settings.twitter_handle || ""} onChange={(e) => updateField("twitter_handle", e.target.value)} placeholder="@handle" />
              </div>
              <div>
                <label className="text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider mb-2 block">LinkedIn URL</label>
                <Input value={settings.linkedin_url || ""} onChange={(e) => updateField("linkedin_url", e.target.value)} placeholder="https://linkedin.com/..." />
              </div>
              <div>
                <label className="text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider mb-2 block">Instagram URL</label>
                <Input value={settings.instagram_url || ""} onChange={(e) => updateField("instagram_url", e.target.value)} placeholder="https://instagram.com/..." />
              </div>
              <div>
                <label className="text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider mb-2 block">Facebook URL</label>
                <Input value={settings.facebook_url || ""} onChange={(e) => updateField("facebook_url", e.target.value)} placeholder="https://facebook.com/..." />
              </div>
            </div>
          </Section>

          <Section title="Footer" icon={Globe}>
            <div>
              <label className="text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider mb-2 block">Footer Description</label>
              <textarea 
                className="w-full h-24 rounded-xl border border-black/10 bg-white p-4 text-[#1d1d1f] text-[14px] focus:border-[#41cc00] focus:ring-2 focus:ring-[#41cc00]/20 outline-none transition-all resize-none"
                value={settings.footer_description || ""}
                onChange={(e) => updateField("footer_description", e.target.value)}
              />
            </div>
          </Section>
        </div>
      )}

    </div>
  );
}
