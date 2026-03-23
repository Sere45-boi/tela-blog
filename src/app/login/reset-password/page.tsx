"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GlassCard } from "@/components/ui/Card";
import { Lock, ArrowRight } from "lucide-react";
import { GsapReveal } from "@/components/GsapReveal";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; message?: string }>({ type: "idle" });
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Check if the user is actually in a recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setStatus({
          type: "error",
          message: "Invalid or expired token. Please try resetting your password again."
        });
      }
    };
    checkSession();
  }, [supabase]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: "idle" });

    if (password !== confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }

    if (password.length < 6) {
      setStatus({ type: "error", message: "Password must be at least 6 characters long." });
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      setStatus({ type: "error", message: error.message });
      setLoading(false);
    } else {
      setStatus({
        type: "success",
        message: "Your password has been successfully updated."
      });
      setLoading(false);

      // Redirect to admin dashboard after short delay
      setTimeout(() => {
        router.push("/admin");
        router.refresh();
      }, 2000);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <GsapReveal direction="up" className="w-full max-w-md">
        <GlassCard className="relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent to-muted-foreground opacity-50"></div>

          <div className="mb-8 mt-2 text-center">
            <h1 className="mb-2 text-2xl font-medium tracking-tight text-foreground">
              Create New Password
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Please enter your new password below.
            </p>
          </div>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground ml-1" htmlFor="password">New Password</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading || status.type === "success" || status.message?.includes("expired")}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground ml-1" htmlFor="confirmPassword">Confirm New Password</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading || status.type === "success" || status.message?.includes("expired")}
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
                {status.message} Redirecting to dashboard...
              </div>
            )}

            <Button
              type="submit"
              className="mt-6 w-full"
              isLoading={loading}
              disabled={status.type === "success" || status.message?.includes("expired")}
            >
              Update Password
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>
        </GlassCard>
      </GsapReveal>
    </div>
  );
}
