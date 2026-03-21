"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GlassCard } from "@/components/ui/Card";
import { Mail, ArrowLeft, Send, Lock, KeyRound } from "lucide-react";
import { GsapReveal } from "@/components/GsapReveal";
import Link from "next/link";

type Step = "email" | "otp" | "password";


export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; message?: string }>({ type: "idle" });
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setStatus({ type: "idle" });
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) {
        let message = error.message;
        if (message.includes("rate limit")) {
          message = "Email rate limit exceeded. Please wait a few minutes before trying again or check your Supabase dashboard settings.";
        }
        setStatus({ type: "error", message: message || "Could not send code. Is this email registered?" });
      } else {
        setStatus({ type: "success", message: "A 6-digit recovery code has been sent to your email." });
        setStep("otp");
      }
    } catch (err: any) {
      setStatus({ type: "error", message: "An unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setStatus({ type: "idle" });
    setLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'recovery' // Recovery type for password resets
      });

      if (error) {
        setStatus({ type: "error", message: "Invalid or expired recovery code." });
      } else {
        setStatus({ type: "success", message: "Code verified! You can now set a new password." });
        setStep("password");
      }
    } catch (err: any) {
      setStatus({ type: "error", message: "Verification failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    if (newPassword.length < 6) {
      setStatus({ type: "error", message: "Password must be at least 6 characters." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }
    
    setStatus({ type: "idle" });
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        setStatus({ type: "error", message: error.message });
      } else {
        setStatus({ type: "success", message: "Password updated successfully! Redirecting..." });
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (err: any) {
      setStatus({ type: "error", message: "Failed to update password." });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) {
        setStatus({ type: "error", message: error.message });
      } else {
        setStatus({ type: "success", message: "A new recovery code has been sent." });
      }
    } catch (err: any) {
      setStatus({ type: "error", message: "Resend failed." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-white via-[#f3fbf3] to-[#e4fce4] selection:bg-[#41cc00]/30 selection:text-[#093C15] relative overflow-hidden">
      {/* Decorative background elements coming up from bottom */}
      <GsapReveal direction="up" delay={0.1} className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#41cc00]/20 rounded-full blur-[100px] pointer-events-none">
        <div />
      </GsapReveal>
      <GsapReveal direction="up" delay={0.2} className="absolute -bottom-40 -right-20 w-[500px] h-[500px] bg-[#093C15]/10 rounded-full blur-[120px] pointer-events-none">
        <div />
      </GsapReveal>

      <GsapReveal direction="up" className="w-full max-w-md relative z-10">
        <GlassCard className="relative overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.1)] border border-black/5 bg-white/90 backdrop-blur-3xl rounded-3xl p-8 md:p-10">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#41cc00] to-[#093C15] opacity-80"></div>
          
          <div className="mb-8 mt-2">
            {step === "email" ? (
              <Link href="/login" className="inline-flex items-center text-[12px] font-bold text-[#1d1d1f]/50 hover:text-[#093C15] mb-6 transition-colors">
                <ArrowLeft className="mr-1 h-3 w-3" /> Back to login
              </Link>
            ) : (
              <button 
                type="button" 
                onClick={() => {
                  setStep(step === "password" ? "otp" : "email");
                  setStatus({ type: "idle" });
                }} 
                className="inline-flex items-center text-[12px] font-bold text-[#1d1d1f]/50 hover:text-[#093C15] mb-6 transition-colors"
                disabled={loading}
              >
                <ArrowLeft className="mr-1 h-3 w-3" /> Back
              </button>
            )}
            
            <h1 className="mb-2 text-2xl font-bold tracking-tight text-[#1d1d1f] font-bricolage">
              {step === "email" && "Reset Password"}
              {step === "otp" && "Enter OTP"}
              {step === "password" && "New Password"}
            </h1>
            <p className="text-[14px] text-[#1d1d1f]/60 font-medium font-poppins">
              {step === "email" && "Enter your email address and we'll send you an 8-digit recovery code to reset your password."}
              {step === "otp" && `We've sent an 8-digit code to ${email}. Please enter it below.`}
              {step === "password" && "Enter your new password below."}
            </p>
          </div>

          <form onSubmit={step === "email" ? handleSendEmail : step === "otp" ? handleVerifyOtp : handleUpdatePassword} className="space-y-5">
            
            {step === "email" && (
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider ml-1" htmlFor="email">Email Address</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#1d1d1f]/40">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@tela.ng"
                    className="pl-11 h-12 rounded-xl bg-black/[0.02] border-black/5 text-[#1d1d1f] focus:border-[#41cc00] focus:ring-2 focus:ring-[#41cc00]/20 transition-all font-medium"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {step === "otp" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider ml-1" htmlFor="otp">Recovery Code</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#1d1d1f]/40">
                      <KeyRound className="h-4 w-4" />
                    </div>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="12345678"
                      className="pl-11 h-12 rounded-xl bg-black/[0.02] border-black/5 text-[#1d1d1f] focus:border-[#41cc00] focus:ring-2 focus:ring-[#41cc00]/20 transition-all font-medium tracking-widest"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      maxLength={8}
                      disabled={loading}
                    />
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <button 
                    type="button" 
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-[12px] font-bold text-[#093C15] hover:text-[#41cc00] transition-colors disabled:opacity-50"
                  >
                    Didn&apos;t receive a code? Resend
                  </button>
                </div>
              </div>
            )}

            {step === "password" && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider ml-1" htmlFor="newPassword">New Password</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#1d1d1f]/40">
                      <Lock className="h-4 w-4" />
                    </div>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="••••••••"
                      className="pl-11 h-12 rounded-xl bg-black/[0.02] border-black/5 text-[#1d1d1f] focus:border-[#41cc00] focus:ring-2 focus:ring-[#41cc00]/20 transition-all font-medium"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider ml-1" htmlFor="confirmPassword">Retype New Password</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#1d1d1f]/40">
                      <Lock className="h-4 w-4" />
                    </div>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className="pl-11 h-12 rounded-xl bg-black/[0.02] border-black/5 text-[#1d1d1f] focus:border-[#41cc00] focus:ring-2 focus:ring-[#41cc00]/20 transition-all font-medium"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            )}

            {status.type === "error" && (
              <div className="rounded-xl bg-red-500/10 p-4 text-[13px] font-medium text-red-600 border border-red-500/20">
                {status.message}
              </div>
            )}
            
            {status.type === "success" && (
              <div className="rounded-xl bg-green-500/10 p-4 text-[13px] font-medium text-green-700 border border-green-500/20">
                {status.message}
              </div>
            )}

            <Button 
              type="submit" 
              variant="primary" 
              className="mt-8 w-full group h-12 text-[15px] rounded-xl shadow-[0_4px_14px_0_rgb(65,204,0,0.39)] hover:shadow-[0_6px_20px_rgba(65,204,0,0.23)] border-none" 
              isLoading={loading}
            >
              {step === "email" && "Send OTP"}
              {step === "otp" && "Verify OTP"}
              {step === "password" && "Update Password"}
              {!loading && step === "email" && <Send className="ml-2 h-4 w-4" />}
            </Button>
          </form>
        </GlassCard>
      </GsapReveal>
    </div>
  );
}
