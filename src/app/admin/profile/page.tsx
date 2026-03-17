"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GlassCard } from "@/components/ui/Card";
import { User, Camera, Loader2, Save, Mail, Twitter, Info } from "lucide-react";
import { updateProfile, updateEmail, verifyEmailChange } from "@/app/actions/user";
import { toast } from "sonner";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { GsapReveal } from "@/components/GsapReveal";

export default function ProfilePage() {
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [otpToken, setOtpToken] = useState("");

  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    avatar_url: "",
    twitter_handle: "",
    is_public: true,
  });

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        
        if (data) {
          setProfile(data);
          setFormData({
            full_name: data.full_name || "",
            bio: data.bio || "",
            avatar_url: data.avatar_url || "",
            twitter_handle: data.twitter_handle || "",
            is_public: data.is_public !== false,
          });
        }
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(formData);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (url: string) => {
    setFormData(prev => ({ ...prev, avatar_url: url }));
    try {
      await updateProfile({ ...formData, avatar_url: url });
      // toast.success("Avatar updated"); // toast is already in ImageUpload
    } catch (error: any) {
      toast.error("Failed to sync avatar profile: " + error.message);
    }
  };

  const onRequestEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;
    setSaving(true);
    try {
      await updateEmail(newEmail);
      toast.success("Verification codes sent to both emails");
      setVerifyingEmail(true);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const onConfirmEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpToken) return;
    setSaving(true);
    try {
      await verifyEmailChange(newEmail, otpToken);
      toast.success("Email updated successfully");
      setChangingEmail(false);
      setVerifyingEmail(false);
      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      setUser(updatedUser);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#41cc00]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <GsapReveal direction="up">
        <h1 className="text-3xl font-bold text-[#1d1d1f] font-bricolage">Profile Settings</h1>
        <p className="text-[#1d1d1f]/60 mt-2">Manage your personal information and how you appear as an author.</p>
      </GsapReveal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <GsapReveal direction="up" delay={0.1}>
            <GlassCard className="p-6 text-center border-black/5 bg-white/80">
              <div className="mb-6">
                <ImageUpload 
                  value={formData.avatar_url}
                  onChange={handleAvatarChange}
                  bucket="avatars"
                  folder={user?.id}
                  aspectRatio="square"
                  label="Author Avatar"
                />
              </div>
              <h2 className="text-xl font-bold text-[#1d1d1f] font-bricolage">{formData.full_name || "Author Name"}</h2>
              <p className="text-[13px] text-[#1d1d1f]/40 font-medium uppercase tracking-wider mt-1">{profile?.role || "Author"}</p>
              
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
                  When enabled, your profile, bio, and articles will be visible on the public team page.
                </p>
              </div>
            </GlassCard>
          </GsapReveal>
        </div>

        {/* Edit Form */}
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
                      placeholder="e.g. John Doe"
                      className="bg-black/[0.02] border-black/5"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider ml-1">Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="A brief bio about yourself..."
                      className="w-full min-h-[120px] p-4 rounded-xl bg-black/[0.02] border border-black/5 text-sm text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#41cc00]/20 focus:border-[#41cc00] transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider ml-1">Twitter Handle</label>
                      <div className="relative">
                        <Twitter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1d1d1f]/40" />
                        <Input
                          value={formData.twitter_handle}
                          onChange={(e) => setFormData({ ...formData, twitter_handle: e.target.value })}
                          placeholder="@username"
                          className="pl-12 bg-black/[0.02] border-black/5"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider ml-1">Avatar Source</label>
                      <Input
                        value={formData.avatar_url}
                        readOnly
                        placeholder="Uploaded image path..."
                        className="bg-black/[0.1] border-black/5 cursor-not-allowed italic"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-black/5">
                  <Button disabled={saving} className="h-12 px-8 rounded-xl bg-[#093C15] text-white">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </GlassCard>
          </GsapReveal>

          {/* Account Security */}
          <GsapReveal direction="up" delay={0.3}>
            <GlassCard className="p-8 border-black/5 bg-white/80">
              <h3 className="text-lg font-bold text-[#1d1d1f] font-bricolage mb-6">Account Security</h3>
              
              <div className="space-y-6">
                <div className="flex flex-col gap-4 p-5 rounded-2xl bg-[#41cc00]/5 border border-[#41cc00]/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Mail className="w-4 h-4 text-[#093C15]" />
                        <span className="text-sm font-bold text-[#093C15]">Email Address</span>
                      </div>
                      <p className="text-[14px] text-[#1d1d1f]/60">{user?.email}</p>
                    </div>
                    {!changingEmail && (
                      <Button 
                        variant="secondary" 
                        onClick={() => setChangingEmail(true)}
                        className="h-10 text-[13px] bg-white border-black/5"
                      >
                        Change Email
                      </Button>
                    )}
                  </div>

                  {changingEmail && (
                    <div className="pt-4 border-t border-[#41cc00]/10">
                      {!verifyingEmail ? (
                        <form onSubmit={onRequestEmailChange} className="space-y-4">
                          <div>
                            <label className="text-[11px] font-bold text-[#093C15] uppercase tracking-wider mb-2 block">New Email Address</label>
                            <div className="flex gap-2">
                              <Input 
                                type="email" 
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="new@example.com"
                                className="h-11 bg-white border-black/5"
                              />
                              <Button 
                                type="submit" 
                                disabled={saving}
                                className="h-11 px-6 bg-[#093C15] text-white rounded-xl"
                              >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Request OTP"}
                              </Button>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                onClick={() => setChangingEmail(false)}
                                className="h-11"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </form>
                      ) : (
                        <form onSubmit={onConfirmEmailChange} className="space-y-4">
                          <div>
                            <label className="text-[11px] font-bold text-[#093C15] uppercase tracking-wider mb-2 block">Enter verification token</label>
                            <p className="text-[12px] text-[#093C15]/60 mb-4">A code has been sent to your new email. Enter it below to finalize the change.</p>
                            <div className="flex gap-2">
                              <Input 
                                type="text" 
                                value={otpToken}
                                onChange={(e) => setOtpToken(e.target.value)}
                                placeholder="6-digit token"
                                className="h-11 bg-white border-black/5 tracking-[0.5em] font-mono text-center"
                                maxLength={6}
                              />
                              <Button 
                                type="submit" 
                                disabled={saving}
                                className="h-11 px-6 bg-[#41cc00] text-[#093C15] font-bold rounded-xl"
                              >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Update"}
                              </Button>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                onClick={() => setVerifyingEmail(false)}
                                className="h-11"
                              >
                                Back
                              </Button>
                            </div>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl border border-black/5 bg-black/[0.02]">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-[#1d1d1f]/40 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-[#1d1d1f]">Email Change Security</h4>
                      <p className="text-[13px] text-[#1d1d1f]/60 mt-1">
                        For security reasons, changing your account email requires code verification on the new address.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </GsapReveal>
        </div>
      </div>
    </div>
  );
}
