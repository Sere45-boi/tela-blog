"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GlassCard } from "@/components/ui/Card";
import { Mail, ArrowRight, ShieldCheck, ArrowLeft, RefreshCcw } from "lucide-react";
import { GsapReveal } from "@/components/GsapReveal";
import { toast } from "sonner";
import gsap from "gsap";

export function LoginClient() {
  const [step, setStep] = useState<"identification" | "verification">("identification");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const router = useRouter();
  const supabase = createClient();
  const containerRef = useRef<HTMLDivElement>(null);
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer for resend OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        }
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      // Smooth transition to verification step
      const ctx = gsap.context(() => {
        gsap.to(".login-content", {
          opacity: 0,
          y: -20,
          duration: 0.3,
          onComplete: () => {
            setStep("verification");
            gsap.fromTo(".login-content", 
              { opacity: 0, y: 20 },
              { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
            );
          }
        });
      }, containerRef);

      setCountdown(60);
      toast.success("Verification code sent to your email.");
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setResending(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      setCountdown(60);
      toast.success("A new code has been sent.");
    } catch (err: any) {
      toast.error(err.message || "Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 7) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = otp.join("");
    if (token.length < 8) {
      toast.error("Please enter the full 8-digit code.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email",
      });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      toast.success("Logged in successfully.");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      toast.error("Verification failed.");
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="w-full max-w-md relative z-10">
      <GsapReveal direction="up" delay={0.1} className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#41cc00]/10 rounded-full blur-[100px] pointer-events-none" />
      <GsapReveal direction="up" delay={0.2} className="absolute -top-32 -right-32 w-96 h-96 bg-[#093C15]/5 rounded-full blur-[100px] pointer-events-none" />

      <GsapReveal direction="up">
        <GlassCard className={`relative overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.1)] border border-black/5 bg-white/80 backdrop-blur-3xl rounded-[2.5rem] transition-all duration-300 ${step === "verification" ? "p-6 md:p-12" : "p-10 md:p-12"}`}>
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#41cc00] to-[#1a5d28] opacity-80"></div>

          <div className="login-content">
            <div className="mb-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f3fbf3] to-[#e4fce4] border border-[#41cc00]/10 mb-6 shadow-sm">
                {step === "identification" ? (
                  <Mail className="w-7 h-7 text-[#093C15]" />
                ) : (
                  <ShieldCheck className="w-7 h-7 text-[#093C15]" />
                )}
              </div>
              <h1 className="text-[32px] font-bold tracking-tight text-[#1d1d1f] font-bricolage leading-tight mb-3">
                {step === "identification" ? "Welcome back" : "Security Check"}
              </h1>
              <p className="text-[16px] text-[#1d1d1f]/50 font-medium font-poppins px-4">
                {step === "identification" 
                  ? "Enter your email address to receive a secure login code." 
                  : `Enter the 8-digit code sent to ${email}`}
              </p>
            </div>

            {step === "identification" ? (
              <form onSubmit={handleSendOtp} className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[13px] font-semibold text-[#1d1d1f]/40 uppercase tracking-widest ml-1" htmlFor="email">Work Email</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#1d1d1f]/30 transition-colors group-focus-within:text-[#093C15]">
                      <Mail className="h-5 w-5" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@tela.ng"
                      className="pl-12 h-14 rounded-2xl bg-black/[0.03] border-transparent focus:bg-white focus:border-[#41cc00]/20 focus:ring-4 focus:ring-[#41cc00]/5 text-[#1d1d1f] transition-all font-medium text-lg selection:bg-[#41cc00]/20"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-full group h-14 text-[16px] font-bold rounded-2xl shadow-[0_10px_30px_-5px_rgba(65,204,0,0.3)] hover:shadow-[0_15px_40px_-5px_rgba(65,204,0,0.4)] transition-all duration-300 border-none bg-gradient-to-r from-[#41cc00] to-[#1a5d28]" 
                  isLoading={loading}
                >
                  Send Login Code
                  {!loading && <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />}
                </Button>

                <div className="pt-4 text-center">
                  <p className="text-[14px] text-[#1d1d1f]/40 font-medium">
                    New to Tela? <Link href="/signup" className="text-[#093C15] font-bold hover:underline underline-offset-4 decoration-2">Contact Admin</Link>
                  </p>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between gap-1.5 md:gap-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (otpInputs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-full aspect-square text-center text-2xl font-bold bg-black/[0.03] border-2 border-transparent focus:border-[#41cc00]/30 focus:bg-white focus:ring-4 focus:ring-[#41cc00]/5 transition-all outline-none rounded-xl md:rounded-2xl text-[#093C15]"
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    className="w-full group h-14 text-[16px] font-bold rounded-2xl shadow-[0_10px_30px_-5px_rgba(65,204,0,0.3)] hover:shadow-[0_15px_40px_-5px_rgba(65,204,0,0.4)] transition-all duration-300 border-none bg-gradient-to-r from-[#41cc00] to-[#1a5d28]" 
                    isLoading={loading}
                  >
                    Verify & Login
                  </Button>
                  
                  <div className="flex flex-col items-center gap-4">
                    <button 
                      type="button" 
                      onClick={handleResendOtp}
                      disabled={countdown > 0 || resending}
                      className="text-[14px] font-bold text-[#093C15] disabled:text-[#1d1d1f]/30 transition-colors flex items-center gap-2"
                    >
                      {resending ? (
                        <RefreshCcw className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCcw className="w-4 h-4" />
                      )}
                      {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
                    </button>
                    
                    <button 
                      type="button" 
                      onClick={() => {
                        const ctx = gsap.context(() => {
                          gsap.to(".login-content", {
                            opacity: 0,
                            y: 20,
                            duration: 0.3,
                            onComplete: () => {
                              setStep("identification");
                              gsap.fromTo(".login-content", 
                                { opacity: 0, y: -20 },
                                { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
                              );
                            }
                          });
                        }, containerRef);
                      }}
                      className="text-[14px] font-bold text-[#1d1d1f]/30 hover:text-[#1d1d1f]/50 transition-colors flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Change Email
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </GlassCard>
      </GsapReveal>
    </div>
  );
}
