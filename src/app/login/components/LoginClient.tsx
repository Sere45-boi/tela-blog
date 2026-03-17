"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GlassCard } from "@/components/ui/Card";
import { Lock, Mail, ArrowRight } from "lucide-react";
import { GsapReveal } from "@/components/GsapReveal";
import Link from "next/link";

export function LoginClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Let the protected server layout at /admin handle the strict RLS checks
    router.push("/admin");
    router.refresh();
  };

  return (
    <>
      {/* Decorative background elements coming up from bottom */}
      <GsapReveal direction="up" delay={0.1} className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#41cc00]/20 rounded-full blur-[100px] pointer-events-none" />
      <GsapReveal direction="up" delay={0.2} className="absolute -bottom-40 -right-20 w-[500px] h-[500px] bg-[#093C15]/10 rounded-full blur-[120px] pointer-events-none" />
      <GsapReveal direction="up" delay={0.3} className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#f3fbf3] rounded-full blur-[80px] pointer-events-none mix-blend-overlay" />

      <GsapReveal direction="up" className="w-full max-w-md relative z-10">
        <GlassCard className="relative overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.1)] border border-black/5 bg-white/90 backdrop-blur-3xl rounded-3xl p-8 md:p-10">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#41cc00] to-[#093C15] opacity-80"></div>
          
          <div className="mb-10 text-center">
            <h1 className="mb-2 text-3xl tracking-tight text-[#1d1d1f] font-bricolage">
              Tela <span className="font-bold text-[#093C15]">Insights</span>
            </h1>
            <p className="text-[15px] text-[#1d1d1f]/60 font-medium font-poppins">
              Sign in to access your administration dashboard.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
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
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider" htmlFor="password">Password</label>
                <Link href="/login/forgot-password" className="text-[12px] font-bold text-[#093C15]/70 hover:text-[#093C15] transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#1d1d1f]/40">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-11 h-12 rounded-xl bg-black/[0.02] border-black/5 text-[#1d1d1f] focus:border-[#41cc00] focus:ring-2 focus:ring-[#41cc00]/20 transition-all font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-500/10 p-4 text-[13px] font-medium text-red-600 border border-red-500/20">
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" className="mt-8 w-full group h-12 text-[15px] rounded-xl shadow-[0_4px_14px_0_rgb(65,204,0,0.39)] hover:shadow-[0_6px_20px_rgba(65,204,0,0.23)] border-none" isLoading={loading}>
              Sign In
              {!loading && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
            </Button>
          </form>
        </GlassCard>
      </GsapReveal>
    </>
  );
}
