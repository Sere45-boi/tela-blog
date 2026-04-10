"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GlassCard } from "@/components/ui/Card";
import { Mail, User, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { GsapReveal } from "@/components/GsapReveal";
import { validateInvitation, claimInvitation } from "@/app/actions/invitations";
import { toast } from "sonner";
import Link from "next/link";

export function SignupClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite");
  const supabase = createClient();

  const [invitation, setInvitation] = useState<any>(null);
  const [checkingInvite, setCheckingInvite] = useState(true);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);

  useEffect(() => {
    async function checkToken() {
      if (!inviteToken) {
        setCheckingInvite(false);
        return;
      }

      try {
        const data = await validateInvitation(inviteToken);
        if (data) {
          setInvitation(data);
          setFormData(prev => ({ ...prev, email: data.email }));
        }
      } catch (err) {
        console.error("Invite validation error:", err);
      } finally {
        setCheckingInvite(false);
      }
    }
    checkToken();
  }, [inviteToken]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Generate a secure random password for the background auth record
      // Since login is OTP-only, the user will never know or need this.
      const secureRandomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);

      // 1. Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: secureRandomPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            full_name: formData.fullName,
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create account");

      // 2. Claim invitation and set role
      if (inviteToken) {
        await claimInvitation(inviteToken, authData.user.id);
      }

      setSuccess(true);

      // 3. Check if email confirmation is required (session will be null)
      if (!authData.session) {
        setNeedsEmailConfirmation(true);
        toast.success("Account created! Please check your email.");
      } else {
        toast.success("Welcome to the team!");
        setTimeout(() => {
          router.push("/admin");
          router.refresh();
        }, 2000);
      }

    } catch (err: any) {
      if (err.message?.includes("already registered") || err.message?.includes("User already exists")) {
        setError("This email is already registered. You can proceed directly to Login to receive a secure code.");
      } else {
        setError(err.message);
      }
      setLoading(false);
    }
  };

  if (checkingInvite) {
    return (
      <div className="text-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#41cc00] mx-auto" />
        <p className="text-[#1d1d1f]/60 font-medium">Validating invitation...</p>
      </div>
    );
  }

  if (!inviteToken || !invitation) {
    return (
      <GsapReveal direction="up" className="w-full max-w-md">
        <GlassCard className="text-center p-12 border-red-500/10">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-[#1d1d1f] font-bricolage mb-4">Invalid Invitation</h1>
          <p className="text-[#1d1d1f]/60 mb-8 font-medium">
            This invitation link is either invalid, expired, or has already been used. Please contact an administrator for a new invite.
          </p>
          <Link href="/login">
            <Button variant="secondary" className="w-full h-12 rounded-xl">Back to Login</Button>
          </Link>
        </GlassCard>
      </GsapReveal>
    );
  }

  if (success) {
    return (
      <GsapReveal direction="up" className="w-full max-w-md">
        <GlassCard className="text-center p-12 border-[#41cc00]/10">
          <div className="w-20 h-20 bg-[#41cc00]/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
            <CheckCircle2 className="w-10 h-10 text-[#41cc00]" />
          </div>
          <h1 className="text-3xl font-bold text-[#1d1d1f] font-bricolage mb-4">
            {needsEmailConfirmation ? "Verify Identity" : "Welcome aboard!"}
          </h1>
          <p className="text-[#1d1d1f]/60 mb-8 font-medium">
            {needsEmailConfirmation
              ? "Account created. Please check your email for a confirmation link to activate your author profile."
              : `Your workspace identity is confirmed. We're setting up your dashboard permissions now...`}
          </p>
          {!needsEmailConfirmation && <Loader2 className="w-6 h-6 animate-spin text-[#41cc00] mx-auto" />}
          {needsEmailConfirmation && (
            <div className="space-y-4">
              <Link href="/login" className="block">
                <Button variant="primary" className="w-full h-12 rounded-xl">Login</Button>
              </Link>
            </div>
          )}
        </GlassCard>
      </GsapReveal>
    );
  }

  return (
    <>
      <GsapReveal direction="up" delay={0.1} className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#41cc00]/20 rounded-full blur-[100px] pointer-events-none">
        <div />
      </GsapReveal>
      <GsapReveal direction="up" delay={0.2} className="absolute -bottom-40 -right-20 w-[500px] h-[500px] bg-[#093C15]/10 rounded-full blur-[120px] pointer-events-none">
        <div />
      </GsapReveal>

      <GsapReveal direction="up" className="w-full max-w-md relative z-10">
        <GlassCard className="relative overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.1)] border border-black/5 bg-white/90 backdrop-blur-3xl rounded-3xl p-8 md:p-10">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#41cc00] to-[#093C15] opacity-80"></div>

          <div className="mb-10 text-center">
            <div className="inline-block px-3 py-1 rounded-full bg-[#41cc00]/10 text-[#093C15] text-[10px] font-bold uppercase tracking-widest mb-4">
              Invited by Admin
            </div>
            <h1 className="mb-2 text-3xl tracking-tight text-[#1d1d1f] font-bricolage">
              Join <span className="font-bold text-[#41cc00]">Pulse Team</span>
            </h1>
            <p className="text-[15px] text-[#1d1d1f]/60 font-medium font-poppins">
              Register to start contributing.
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider ml-1">Full Name</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#1d1d1f]/40">
                  <User className="h-4 w-4" />
                </div>
                <Input
                  type="text"
                  placeholder="Full Name"
                  className="pl-11 h-14 rounded-xl bg-black/[0.02] border-black/5 text-[#1d1d1f] font-bold text-lg"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider ml-1">Email</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#1d1d1f]/40">
                  <Mail className="h-4 w-4" />
                </div>
                <Input
                  type="email"
                  readOnly
                  placeholder="name@example.com"
                  className="pl-11 h-14 rounded-xl bg-black/[0.05] border-black/5 text-[#1d1d1f]/40 cursor-not-allowed font-medium"
                  value={formData.email}
                />
              </div>
            </div>

            {error && (
              <div className="space-y-4">
                <div className="rounded-xl bg-red-500/10 p-4 text-[13px] font-medium text-red-600 border border-red-500/20">
                  {error}
                </div>
                {error.includes("already registered") && (
                  <Link href="/login" className="block">
                    <Button variant="secondary" className="w-full h-12 rounded-xl text-[#093C15] font-bold">
                      Continue to Login
                    </Button>
                  </Link>
                )}
              </div>
            )}

            <Button type="submit" variant="primary" className="mt-8 w-full group h-14 text-[16px] rounded-xl shadow-lg border-none font-bold" isLoading={loading}>
              Accept Invitation
              {!loading && <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />}
            </Button>
          </form>
        </GlassCard>
      </GsapReveal>
    </>
  );
}
