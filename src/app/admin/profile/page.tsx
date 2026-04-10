"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GlassCard } from "@/components/ui/Card";
import { User, Camera, Loader2, Save, Mail, Linkedin, Info, Shield, RefreshCw } from "lucide-react";
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
  const [oldEmailToken, setOldEmailToken] = useState("");
  const [newEmailToken, setNewEmailToken] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    avatar_url: "",
    linkedin_url: "",
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
            linkedin_url: data.linkedin_url || "",
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
      toast.error("Failed to upload profile picture: " + error.message);
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

  const handleResendCode = async () => {
    if (resendTimer > 0 || !newEmail) return;
    setSaving(true);
    try {
      // Re-trigger the default dual-email verification
      await updateEmail(newEmail);
      toast.success("Token sent again to both emails");
      setResendTimer(60);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublic = async () => {
    const newValue = !formData.is_public;
    setFormData(prev => ({ ...prev, is_public: newValue }));
    try {
      await updateProfile({ ...formData, is_public: newValue });
      toast.success(newValue ? "Profile is now public" : "Profile is now private");
    } catch (error: any) {
      toast.error("Failed to update visibility: " + error.message);
      // Revert on error
      setFormData(prev => ({ ...prev, is_public: !newValue }));
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
    <div className="max-w-[1400px] mx-auto space-y-8 pb-12">
      <GsapReveal direction="up">
        <h1 className="text-3xl font-bold text-[#1d1d1f] font-bricolage">Profile</h1>
        <p className="text-[#1d1d1f]/40 font-medium mt-2">Manage your personal governance and professional representation.</p>
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
                  folder={`avatars/${user?.id}`}
                  aspectRatio="square"
                  label="Author Image"
                />
              </div>
              <h2 className="text-xl font-bold text-[#1d1d1f] font-bricolage">{formData.full_name || "Author Name"}</h2>
              <p className="text-[13px] text-[#1d1d1f]/40 font-medium uppercase tracking-wider mt-1">{profile?.role || "Author"}</p>

              <div className="mt-6 pt-6 border-t border-black/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] font-bold text-[#1d1d1f]/40 uppercase tracking-wider">Public Profile</span>
                  <button
                    onClick={handleTogglePublic}
                    className={`w-12 h-6 rounded-full transition-colors relative ${formData.is_public ? 'bg-[#41cc00]' : 'bg-black/10'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.is_public ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
                <p className="text-[11px] text-[#1d1d1f]/40 text-left leading-relaxed">
                  When enabled, your profile image, bio and linkedin url will be visible on the public team page and below each article you write, if this is disable, then your articles are posted anonymously and it has the tela tag and tela logo.
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

                  <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <label className="text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider ml-1">LinkedIn Professional URL</label>
                      <div className="relative group">
                        <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1d1d1f]/40 group-focus-within:text-[#0a66c2] transition-colors" />
                        <Input
                          value={formData.linkedin_url}
                          onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                          placeholder="https://linkedin.com/in/username"
                          className="pl-12 bg-black/[0.02] border-black/5 rounded-xl hover:border-[#0a66c2]/20 focus:border-[#0a66c2]/40 transition-all font-medium"
                        />
                      </div>
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
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-2xl bg-[#41cc00]/10 text-[#093C15]">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1d1d1f] font-bricolage">Security</h3>
                  <p className="text-[13px] text-black/30 font-medium">Manage your credentials.</p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex flex-col gap-4 p-6 rounded-3xl bg-[#41cc00]/5 border border-[#41cc00]/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Mail className="w-4 h-4 text-[#093C15]" />
                        <span className="text-[11px] font-bold text-[#093C15] uppercase tracking-wider">Email</span>
                      </div>
                      <p className="text-[15px] font-bold text-[#1d1d1f]">{user?.email}</p>
                    </div>
                    {!changingEmail && (
                      <Button
                        variant="secondary"
                        onClick={() => setChangingEmail(true)}
                        className="h-11 px-6 text-[13px] bg-white border-black/5 shadow-sm rounded-xl font-bold"
                      >
                        Change Email
                      </Button>
                    )}
                  </div>

                  {changingEmail && (
                    <div className="pt-6 border-t border-[#41cc00]/10">
                      {!verifyingEmail ? (
                        <form onSubmit={onRequestEmailChange} className="space-y-4">
                          <div className="space-y-3">
                            <label className="text-[11px] font-bold text-[#093C15] uppercase tracking-wider block ml-1">New Email</label>
                            <div className="flex gap-3">
                              <Input
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="new@example.com"
                                className="h-12 bg-white border-black/5 rounded-xl"
                              />
                              <Button
                                type="submit"
                                disabled={saving}
                                className="h-12 px-8 bg-[#093C15] text-white rounded-xl font-bold whitespace-nowrap"
                              >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Identity"}
                              </Button>
                            </div>
                          </div>
                        </form>
                      ) : (
                        <form onSubmit={async (e) => {
                          e.preventDefault();
                          if (!oldEmailToken || !newEmailToken) {
                            toast.error("Please enter both verification codes");
                            return;
                          }
                          setSaving(true);
                          try {
                            await verifyEmailChange(newEmail, newEmailToken, user.email, oldEmailToken);
                            toast.success("Identity marker updated");
                            setChangingEmail(false);
                            setVerifyingEmail(false);
                            const { data: { user: updatedUser } } = await supabase.auth.getUser();
                            setUser(updatedUser);
                          } catch (error: any) {
                            toast.error(error.message);
                          } finally {
                            setSaving(false);
                          }
                        }} className="space-y-6">
                          <div className="space-y-6">
                            <div className="space-y-3">
                              <label className="text-[11px] font-bold text-[#093C15] uppercase tracking-wider block ml-1">Current Email Token ({user?.email})</label>
                              <Input
                                type="text"
                                value={oldEmailToken}
                                onChange={(e) => setOldEmailToken(e.target.value)}
                                placeholder="000 000"
                                className="h-12 bg-white border-black/5 rounded-xl tracking-[0.5em] font-mono text-center"
                                maxLength={6}
                              />
                            </div>

                            <div className="space-y-3">
                              <label className="text-[11px] font-bold text-[#093C15] uppercase tracking-wider block ml-1">New Email Token ({newEmail})</label>
                              <Input
                                type="text"
                                value={newEmailToken}
                                onChange={(e) => setNewEmailToken(e.target.value)}
                                placeholder="000 000"
                                className="h-12 bg-white border-black/5 rounded-xl tracking-[0.5em] font-mono text-center"
                                maxLength={6}
                              />
                            </div>

                            <div className="flex flex-col gap-4">
                              <Button
                                type="submit"
                                disabled={saving}
                                className="h-12 px-8 bg-[#41cc00] text-[#093C15] font-bold rounded-xl whitespace-nowrap w-full"
                              >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Commit Change"}
                              </Button>

                              <div className="flex justify-center">
                                <button
                                  type="button"
                                  disabled={saving || resendTimer > 0}
                                  onClick={handleResendCode}
                                  className={`flex items-center gap-2 text-[12px] font-bold transition-all ${resendTimer > 0 ? "text-black/20 cursor-not-allowed" : "text-[#093C15] hover:text-[#41cc00]"
                                    }`}
                                >
                                  {saving && resendTimer === 0 ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <RefreshCw className={`w-3 h-3 ${resendTimer > 0 ? "" : "animate-hover-spin"}`} />
                                  )}
                                  {resendTimer > 0 ? `Resend Codes in ${resendTimer}s` : "Didn't get a code? Resend to both"}
                                </button>
                              </div>
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
