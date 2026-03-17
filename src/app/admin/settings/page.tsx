"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { GsapReveal } from "@/components/GsapReveal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Mail, Lock, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminSettings() {
  const supabase = createClient();
  const [userEmail, setUserEmail] = useState("");
  
  // Email Form State
  const [newEmail, setNewEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<{ type: "idle" | "success" | "error"; msg?: string }>({ type: "idle" });
  const [emailLoading, setEmailLoading] = useState(false);

  // Password Form State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdStatus, setPwdStatus] = useState<{ type: "idle" | "success" | "error"; msg?: string }>({ type: "idle" });
  const [pwdLoading, setPwdLoading] = useState(false);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    }
    getUser();
  }, [supabase]);

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailStatus({ type: "idle" });
    setEmailLoading(true);

    // Supabase updateUser will automatically send a confirmation to both emails
    const { error } = await supabase.auth.updateUser({ email: newEmail });

    if (error) {
      setEmailStatus({ type: "error", msg: error.message });
    } else {
      setEmailStatus({ type: "success", msg: "Confirmation links have been sent to both your old and new email addresses." });
      setNewEmail("");
    }
    setEmailLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdStatus({ type: "idle" });
    
    if (newPassword !== confirmPassword) {
      setPwdStatus({ type: "error", msg: "Passwords do not match." });
      return;
    }

    if (newPassword.length < 6) {
      setPwdStatus({ type: "error", msg: "Password must be at least 6 characters." });
      return;
    }

    setPwdLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setPwdStatus({ type: "error", msg: error.message });
    } else {
      setPwdStatus({ type: "success", msg: "Your password has been updated securely." });
      setNewPassword("");
      setConfirmPassword("");
    }
    setPwdLoading(false);
  };

  return (
    <div className="max-w-4xl">
      <GsapReveal direction="up" className="mb-10">
        <h1 className="text-3xl font-medium tracking-tight mb-2">Security Settings</h1>
        <p className="text-muted-foreground">Manage your credentials, update your email, or change your password.</p>
      </GsapReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Email Settings */}
        <GsapReveal direction="up" delay={0.1}>
          <div className="bg-background rounded-2xl border border-border p-6 shadow-sm">
            <h2 className="text-xl font-medium mb-1">Update Email</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Current email: <span className="text-foreground font-medium">{userEmail || "Loading..."}</span>
            </p>

            <form onSubmit={handleUpdateEmail} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground ml-1" htmlFor="newEmail">New Email Address</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input
                    id="newEmail"
                    type="email"
                    placeholder="new@tela.ng"
                    className="pl-10"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {emailStatus.type === "error" && (
                <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{emailStatus.msg}</span>
                </div>
              )}
              
              {emailStatus.type === "success" && (
                <div className="rounded-lg bg-green-500/10 p-3 text-sm text-green-600 border border-green-500/20 flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{emailStatus.msg}</span>
                </div>
              )}

              <Button type="submit" isLoading={emailLoading} variant="secondary" className="w-full">
                Change Email Address
              </Button>
            </form>
          </div>
        </GsapReveal>

        {/* Password Settings */}
        <GsapReveal direction="up" delay={0.2}>
          <div className="bg-background rounded-2xl border border-border p-6 shadow-sm">
            <h2 className="text-xl font-medium mb-1">Change Password</h2>
            <p className="text-sm text-muted-foreground mb-6">Make sure to choose a strong, secure password.</p>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground ml-1" htmlFor="newPwd">New Password</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    id="newPwd"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground ml-1" htmlFor="confirmPwd">Confirm New Password</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    id="confirmPwd"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {pwdStatus.type === "error" && (
                <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{pwdStatus.msg}</span>
                </div>
              )}
              
              {pwdStatus.type === "success" && (
                <div className="rounded-lg bg-green-500/10 p-3 text-sm text-green-600 border border-green-500/20 flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{pwdStatus.msg}</span>
                </div>
              )}

              <Button type="submit" isLoading={pwdLoading} variant="secondary" className="w-full">
                Update Password
              </Button>
            </form>
          </div>
        </GsapReveal>

      </div>
    </div>
  );
}
