"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/Card";
import { GsapReveal } from "@/components/GsapReveal";
import { getUsers } from "@/app/actions/user";
import { toast } from "sonner";
import { createInvitation } from "@/app/actions/invitations";
import { User, Mail, Shield, ShieldAlert, Loader2, MoreVertical, Search, ExternalLink, Copy, Check, X, Trash2 } from "lucide-react";
import Link from "next/link";

export default function UsersPage() {
  const supabase = createClient();
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Invitation Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<'author' | 'admin'>('author');
  const [inviting, setInviting] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ token: string; inviteUrl: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function fetchUsersAndSelf() {
    try {
      const { data: { user: self } } = await supabase.auth.getUser();
      if (self) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', self.id).single();
        
        // RBAC Guard: If not admin, redirect to dashboard
        if (profile?.role !== 'admin') {
          window.location.href = "/admin";
          return;
        }
        
        setCurrentUser({ ...self, ...profile });
      } else {
        window.location.href = "/login";
        return;
      }
      const data = await getUsers();
      setUsers(data);
    } catch (error: any) {
      toast.error("Failed to fetch authors");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsersAndSelf();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    try {
      const result = await createInvitation(inviteEmail, inviteRole);
      setInviteResult(result);
      toast.success("Invitation generated");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setInviting(false);
    }
  };


  const handleDeactivate = async (userId: string) => {
    if (!confirm("Are you sure you want to deactivate this author? Their articles will remain but they will lose dashboard access.")) return;
    setProcessingId(userId);
    try {
      const { deactivateUser } = await import("@/app/actions/user");
      await deactivateUser(userId);
      toast.success("Author deactivated");
      await fetchUsersAndSelf();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleHardDelete = async (userId: string) => {
    if (!confirm("PERMANENT ACTION: Are you sure you want to completely delete this author profile? This cannot be undone.")) return;
    setProcessingId(userId);
    try {
      const { hardDeleteUser } = await import("@/app/actions/user");
      await hardDeleteUser(userId);
      toast.success("Author permanently deleted");
      await fetchUsersAndSelf();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredUsers = users.filter((user: any) =>
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#41cc00]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 relative">
      <GsapReveal direction="up" className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1d1d1f] font-bricolage">Authors</h1>
          <p className="text-[#1d1d1f]/60 mt-2">Manage your editorial team and their platform permissions.</p>
        </div>
        {currentUser?.role === 'admin' && (
          <Button
            onClick={() => setShowInviteModal(true)}
            className="h-11 px-6 rounded-xl bg-[#093C15] text-white hover:bg-[#0a5a1f] transition-all shadow-lg shadow-[#093C15]/10"
          >
            Invite Author
          </Button>
        )}
      </GsapReveal>

      {/* Invitation Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <GsapReveal direction="none" className="w-full max-w-md bg-white rounded-[2rem] p-8 shadow-2xl border border-black/5 relative">
            <button
              onClick={() => { setShowInviteModal(false); setInviteResult(null); }}
              className="absolute top-6 right-6 p-2 hover:bg-black/5 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-[#1d1d1f]/40" />
            </button>

            {!inviteResult ? (
              <>
                <h2 className="text-2xl font-bold text-[#1d1d1f] font-bricolage mb-2">Invite New Author</h2>
                <p className="text-[#1d1d1f]/60 text-sm mb-8">Generated links expire in <span className="text-[#093C15] font-bold">2 hours</span>.</p>

                <form onSubmit={handleInvite} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider ml-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="author@example.com"
                      className="w-full h-12 px-5 rounded-xl bg-black/[0.02] border border-black/5 text-sm focus:outline-none focus:ring-2 focus:ring-[#41cc00]/20 focus:border-[#41cc00] transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[12px] font-bold text-[#1d1d1f]/50 uppercase tracking-wider ml-1">Permissions Role</label>
                    <select
                      value={inviteRole}
                      onChange={(e: any) => setInviteRole(e.target.value)}
                      className="w-full h-12 px-5 rounded-xl bg-black/[0.02] border border-black/5 text-sm font-bold text-[#1d1d1f] focus:outline-none appearance-none cursor-pointer hover:bg-black/[0.04] transition-colors"
                    >
                      <option value="author">Contributor (Author)</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>

                  <Button
                    type="submit"
                    isLoading={inviting}
                    className="w-full h-12 bg-[#093C15] text-white rounded-xl shadow-lg shadow-[#093C15]/10 active:scale-[0.98]"
                  >
                    Generate Invite Link
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-[#41cc00]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-8 h-8 text-[#41cc00]" />
                </div>
                <h2 className="text-2xl font-bold text-[#1d1d1f] font-bricolage mb-2">Invitation Ready</h2>
                <p className="text-[#1d1d1f]/60 text-sm mb-8">Send this link to the new user. They will be automatically assigned the <b>{inviteRole}</b> role upon signup.</p>

                <div className="bg-black/[0.02] border border-black/5 rounded-2xl p-4 flex items-center justify-between gap-4 mb-6">
                  <code className="text-[13px] text-[#093C15] font-mono truncate">{inviteResult.inviteUrl}</code>
                  <button
                    onClick={() => copyToClipboard(inviteResult.inviteUrl)}
                    className="shrink-0 p-2.5 bg-white border border-black/5 rounded-xl hover:bg-[#41cc00]/5 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-[#41cc00]" /> : <Copy className="w-4 h-4 text-[#1d1d1f]/40" />}
                  </button>
                </div>

                <Button
                  onClick={() => { setShowInviteModal(false); setInviteResult(null); }}
                  className="w-full h-12 bg-black/[0.05] text-[#1d1d1f] hover:bg-black/10 rounded-xl"
                >
                  Close
                </Button>
              </div>
            )}
          </GsapReveal>
        </div>
      )}

      <GsapReveal direction="up" delay={0.1}>
        <GlassCard className="border-black/5 bg-white/80 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-black/5 flex items-center gap-4 bg-black/[0.01]">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1d1d1f]/30" />
              <input
                type="text"
                placeholder="Search authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-12 pr-4 rounded-xl bg-white border border-black/5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#41cc00]/20 focus:border-[#41cc00]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left border-collapse">
              <thead>
                <tr className="bg-black/[0.02]">
                  <th className="px-6 py-4 text-[12px] font-bold text-[#1d1d1f]/40 uppercase tracking-wider">Author</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-[#1d1d1f]/40 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-[#1d1d1f]/40 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-[#1d1d1f]/40 uppercase tracking-wider">Articles</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-[#1d1d1f]/40 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filteredUsers.map((user: any) => (
                  <tr key={user.id} className="group hover:bg-[#41cc00]/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-black/5 bg-black/[0.02]">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#41cc00]/10 text-[#41cc00]">
                              <User className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-[15px] font-bold text-[#1d1d1f] flex items-center gap-1.5">
                            {user.full_name || "Unknown Author"}
                            {user.role === 'admin' && <Shield className="w-3 h-3 text-[#41cc00]" />}
                          </div>
                          <div className="text-[13px] text-[#1d1d1f]/50 font-medium lowercase">@{user.full_name?.replace(/\s/g, '').toLowerCase() || 'author'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-[#41cc00]/10 text-[#093C15]' : 'bg-blue-500/10 text-blue-600'
                        }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-[12px] font-bold ${user.is_active !== false ? 'text-[#41cc00]' : 'text-red-500'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${user.is_active !== false ? 'bg-[#41cc00]' : 'bg-red-500'}`} />
                        {user.is_active !== false ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[14px] font-bold text-[#1d1d1f] bg-black/5 w-fit px-2.5 py-0.5 rounded-lg border border-black/5">
                        {user.articles?.[0]?.count || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {currentUser?.role === 'admin' && user.id !== currentUser.id && (
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="p-2 hover:bg-[#41cc00]/10 rounded-lg transition-colors text-[#093C15]"
                            title="View Profile Audit"
                          >
                            <Shield className="w-4 h-4" />
                          </Link>
                          <button
                            disabled={processingId === user.id || user.is_active === false}
                            onClick={() => handleDeactivate(user.id)}
                            className="p-2 hover:bg-yellow-50 rounded-lg transition-colors text-yellow-600 disabled:opacity-30"
                            title="Deactivate Author"
                          >
                            {processingId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                          </button>
                          <button
                            disabled={processingId === user.id}
                            onClick={() => handleHardDelete(user.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600 disabled:opacity-30"
                            title="Delete Permanently"
                          >
                            {processingId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </GsapReveal>

      {currentUser?.role === 'admin' && (
        <GsapReveal direction="up" delay={0.2} className="p-6 rounded-3xl bg-black/[0.02] border border-black/5">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-black/5">
              <Shield className="w-6 h-6 text-[#41cc00]" />
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-[#1d1d1f]">Team Governance</h3>
              <p className="text-[13px] text-[#1d1d1f]/60 mt-1 max-w-xl">
                Only administrators can invite new authors or change permissions.
                "Private" authors are hidden from the public Team page but can still publish articles.
              </p>
            </div>
          </div>
        </GsapReveal>
      )}
    </div>
  );
}
