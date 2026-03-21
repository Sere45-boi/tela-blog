"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GlassCard } from "@/components/ui/Card";
import { User, Camera, Loader2, Save, Mail, Linkedin, Info, Lock, Shield, RefreshCw, ArrowLeft } from "lucide-react";
import { updateProfile } from "@/app/actions/user";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { GsapReveal } from "@/components/GsapReveal";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function UserProfileAuditPage({ params }: PageProps) {
  const { id: userId } = use(params);
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    avatar_url: "",
    linkedin_url: "",
    is_public: true,
    role: "author",
  });

  useEffect(() => {
    async function fetchData() {
      // 1. Check if current user is admin
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        window.location.href = "/login";
        return;
      }
      setCurrentUser(authUser);

      const { data: adminProfile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authUser.id)
        .single();

      if (adminProfile?.role !== "admin") {
        window.location.href = "/admin";
        return;
      }

      // 2. Fetch target user profile
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (data) {
        setProfile(data);
        setFormData({
          full_name: data.full_name || "",
          bio: data.bio || "",
          avatar_url: data.avatar_url || "",
          linkedin_url: data.linkedin_url || "",
          is_public: data.is_public !== false,
          role: data.role || "author",
        });
      }
      setLoading(false);
    }
    fetchData();
  }, [userId, supabase]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Admins can potentially update other users' profiles
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          bio: formData.bio,
          avatar_url: formData.avatar_url,
          linkedin_url: formData.linkedin_url,
          is_public: formData.is_public,
          role: formData.role,
        })
        .eq("id", userId);

      if (error) throw error;
      toast.success("Author profile updated successfully");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (url: string) => {
    setFormData(prev => ({ ...prev, avatar_url: url }));
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#41cc00]" />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-12">
      <GsapReveal direction="up" className="flex items-center justify-between">
        <div>
           <Link href="/admin/users" className="inline-flex items-center text-[#41cc00] hover:text-[#093C15] font-bold text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Team
          </Link>
          <h1 className="text-3xl font-bold text-[#1d1d1f] font-bricolage">Audit Author Profile</h1>
          <p className="text-[#1d1d1f]/40 font-medium mt-2">Review and manage contributor representation.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-[#41cc00]/10 border border-[#41cc00]/20">
          <Shield className="w-4 h-4 text-[#093C15]" />
          <span className="text-[11px] font-bold text-[#093C15] uppercase tracking-wider">Admin Audit Mode</span>
        </div>
      </GsapReveal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <GsapReveal direction="up" delay={0.1}>
            <GlassCard className="p-8 text-center border-black/5 bg-white/80">
              <div className="mb-8">
                <ImageUpload
                  value={formData.avatar_url}
                  onChange={handleAvatarChange}
                  bucket="content"
                  folder={`avatars/${userId}`}
                  aspectRatio="square"
                  label="Author Image"
                />
              </div>
              <h2 className="text-xl font-bold text-[#1d1d1f] font-bricolage">{formData.full_name || "Author Name"}</h2>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-black/5 text-[11px] font-bold uppercase tracking-wider mt-2">
                {formData.role}
              </div>

              <div className="mt-6 pt-6 border-t border-black/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] font-bold text-[#1d1d1f]/40 uppercase tracking-wider">Public Profile</span>
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, is_public: !prev.is_public }))}
                    className={`w-12 h-6 rounded-full transition-colors relative ${formData.is_public ? 'bg-[#41cc00]' : 'bg-black/10'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.is_public ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
                <p className="text-[11px] text-[#1d1d1f]/40 text-left leading-relaxed">
                   Changes made here will affect how the author is represented on individual articles and the team page.
                </p>
              </div>
            </GlassCard>
          </GsapReveal>
        </div>

        {/* Audit Form */}
        <div className="lg:col-span-2 space-y-8">
          <GsapReveal direction="up" delay={0.2}>
            <GlassCard className="p-8 border-black/5 bg-white/80">
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider ml-1">Full Name</label>
                    <Input
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="bg-black/[0.02] border-black/5"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider ml-1">Permissions Role</label>
                    <select 
                      value={formData.role}
                      onChange={(e: any) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full h-12 px-5 rounded-xl bg-black/[0.02] border border-black/5 text-sm font-bold text-[#1d1d1f] focus:outline-none appearance-none cursor-pointer hover:bg-black/[0.04] transition-colors"
                    >
                      <option value="author">Contributor (Author)</option>
                      <option value="admin">Administrator (Full Access)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider ml-1">Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="w-full min-h-[120px] p-4 rounded-xl bg-black/[0.02] border border-black/5 text-sm text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#41cc00]/20 focus:border-[#41cc00] transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider ml-1">LinkedIn Profile</label>
                    <Input
                      value={formData.linkedin_url}
                      onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                      className="bg-black/[0.02] border-black/5"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-black/5">
                  <Button disabled={saving} className="h-12 px-8 rounded-xl bg-[#093C15] text-white">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Commit Author Changes
                  </Button>
                </div>
              </form>
            </GlassCard>
          </GsapReveal>

          <GsapReveal direction="up" delay={0.3} className="p-6 rounded-3xl bg-black/[0.02] border border-black/5">
              <div className="flex items-start gap-4">
                  <div className="p-3 bg-white rounded-2xl shadow-sm border border-black/5 text-[#41cc00]">
                      <Info className="w-6 h-6" />
                  </div>
                  <div>
                      <h3 className="text-[16px] font-bold text-[#1d1d1f]">Administrative Control</h3>
                      <p className="text-[13px] text-[#1d1d1f]/60 mt-1">
                          You are currently editing a team member's profile. These changes will be reflected across the platform immediately. 
                          Security settings (Password/Email) remain managed specifically by the user.
                      </p>
                  </div>
              </div>
          </GsapReveal>
        </div>
      </div>
    </div>
  );
}
