"use client";

import React, { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GlassCard } from "@/components/ui/Card";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { GsapReveal } from "@/components/GsapReveal";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; message?: string }>({ type: "idle" });
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: "idle" });
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login/reset-password`,
    });

    if (error) {
      setStatus({ type: "error", message: error.message });
    } else {
      setStatus({ 
        type: "success", 
        message: "Check your email for the password reset link." 
      });
      setEmail(""); // clear input
    }
    
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <GsapReveal direction="up" className="w-full max-w-md">
        <GlassCard className="relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent to-muted-foreground opacity-50"></div>
          
          <div className="mb-8 mt-2">
            <Link href="/login" className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <ArrowLeft className="mr-1 h-3 w-3" /> Back to login
            </Link>
            <h1 className="mb-2 text-2xl font-medium tracking-tight text-foreground">
              Reset Password
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Enter your email address and we'll send you a link to reset your password securely.
            </p>
          </div>

          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground ml-1" htmlFor="email">Email Address</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@tela.ng"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading || status.type === "success"}
                />
              </div>
            </div>

            {status.type === "error" && (
              <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">
                {status.message}
              </div>
            )}
            
            {status.type === "success" && (
              <div className="rounded-lg bg-green-500/10 p-3 text-sm text-green-600 border border-green-500/20">
                {status.message}
              </div>
            )}

            <Button 
              type="submit" 
              className="mt-6 w-full" 
              isLoading={loading}
              disabled={status.type === "success"}
            >
              Send Reset Link
              {!loading && <Send className="ml-2 h-4 w-4" />}
            </Button>
          </form>
        </GlassCard>
      </GsapReveal>
    </div>
  );
}
