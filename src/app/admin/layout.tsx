"use client";

import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Settings,
  Tags,
  LogOut,
  ImageIcon,
  Globe,
  Users,
  UserCircle,
  Search,
  Bell,
  Share2,
  MoreHorizontal,
  Plus,
  ChevronRight,
  ChevronDown,
  Lock
} from "lucide-react";
import { NotificationCenter } from "@/components/admin/NotificationCenter";
import { signOut } from "@/app/actions/user";
import { toast } from "sonner";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);
  const [team, setTeam] = useState<any[]>([]);
  const [authUser, setAuthUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }
      setAuthUser(user);

      const [profileRes, teamRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("profiles").select("avatar_url, full_name").eq('is_active', true).order('created_at', { ascending: false }).limit(6)
      ]);

      const prof = profileRes.data;
      const profError = profileRes.error;
      console.log("Admin Check - Profile Data:", prof);
      console.log("Admin Check - Profile Error:", profError);
      console.log("Admin Check - User:", user);

      // If missing profile, inactive, or not an admin/author, mark as unauthorized
      if (!prof || (prof.role !== "admin" && prof.role !== "author") || prof.is_active === false) {
        console.error("Access Denied - Reason:", !prof ? `Profile Missing (Error: ${profError?.message})` : prof.is_active === false ? "Inactive" : `Invalid Role: ${prof.role}`);
        setProfile({ unauthorized: true, reason: !prof ? "Missing Profile" : prof.is_active === false ? "Account Deactivated" : "Insufficient Permissions" });
        setLoading(false); 
        return;
      }

      setProfile(prof);
      setTeam(teamRes.data || []);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-white via-[#f3fbf3] to-[#e4fce4] flex items-center justify-center">Loading...</div>;
  }

  if (profile?.unauthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#f3fbf3] to-[#e4fce4] p-4 text-center">
        <div className="bg-white/80 backdrop-blur-xl border border-red-500/20 rounded-3xl p-10 max-w-md w-full shadow-2xl">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold font-bricolage text-[#1d1d1f] mb-3">Access Denied</h1>
          <p className="text-[#1d1d1f]/60 mb-8 font-poppins">
            {profile.reason === "Account Deactivated"
              ? "Your account has been deactivated by an administrator."
              : "You do not have the required permissions to view the dashboard. Please log in with an Administrator or Author account."}
          </p>
          <button 
            onClick={async () => {
              try {
                await signOut();
                window.location.href = '/login';
              } catch (e: any) {
                toast.error(e.message);
              }
            }}
            className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-[0_4px_14px_0_rgba(220,38,38,0.39)]"
          >
            Log Out & Switch Accounts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-white via-[#f3fbf3] to-[#e4fce4] font-poppins selection:bg-[#41cc00]/30 selection:text-[#093C15]">
      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 bg-white/80 backdrop-blur-xl border-r border-[#41cc00]/10 flex flex-col z-50 overflow-hidden shadow-sm transition-all duration-300 ${isSidebarOpen ? 'w-[280px]' : 'w-[80px]'}`}>
        {/* Logo Section */}
        <div className="p-6 flex items-center justify-between min-h-[64px]">
          {isSidebarOpen ? (
            <Link href="/admin" className="block transition-opacity hover:opacity-80">
              <img
                src="/images/IMG_2366.png"
                alt="Tela Logo"
                className="h-10 w-auto object-contain"
              />
            </Link>
          ) : (
            <Link href="/admin" className="flex items-center justify-center w-10 h-10 rounded-xl hover:opacity-80 transition-opacity">
              <img
                src="/images/logo.png"
                alt="Tela"
                className="w-8 h-8 object-contain"
              />
            </Link>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-lg border border-black/5 text-black/40 hover:text-black/60 transition-colors"
          >
            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isSidebarOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Search Input - only shown when expanded */}
        {isSidebarOpen && (
          <div className="px-6 mb-8">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20 group-focus-within:text-[#093C15] transition-colors" />
              <input
                type="text"
                placeholder="Search components..."
                className="w-full h-11 bg-black/[0.02] border border-transparent focus:border-[#41cc00]/20 rounded-xl pl-11 pr-4 text-[13px] font-medium outline-none transition-colors duration-200 placeholder:text-black/20"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <span className="text-[10px] font-bold text-black/20 bg-white border border-black/5 px-1.5 py-0.5 rounded-md">⌘ K</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Groups */}
        <div className="flex-1 px-4 overflow-y-auto space-y-6 custom-scrollbar pb-8">
          <div>
            <nav className="space-y-1">
              {([
                { href: "/admin", Icon: LayoutDashboard, label: "Dashboard" },
                { href: "/admin/articles", Icon: FileText, label: "Articles" },
                { href: "/admin/categories", Icon: Tags, label: "Categories" },
                { href: "/admin/campaigns", Icon: ImageIcon, label: "Campaigns" },
              ] as const).map(({ href, Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  title={label}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-[#093C15]/5 text-[#1d1d1f] transition-colors duration-200 group ${!isSidebarOpen ? 'justify-center' : ''}`}
                >
                  <Icon className="h-4 w-4 text-[#41cc00] group-hover:scale-110 transition-transform duration-200 shrink-0" />
                  {isSidebarOpen && <span className="text-[14px] font-semibold">{label}</span>}
                </Link>
              ))}

              {profile?.role === 'admin' && (
                <Link
                  href="/admin/users"
                  title="Authors & Team"
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-[#093C15]/5 text-[#1d1d1f] transition-colors duration-200 group ${!isSidebarOpen ? 'justify-center' : ''}`}
                >
                  <Users className="h-4 w-4 text-[#41cc00] group-hover:scale-110 transition-transform duration-200 shrink-0" />
                  {isSidebarOpen && <span className="text-[14px] font-semibold">Authors</span>}
                </Link>
              )}
            </nav>
          </div>
          <div>
            <nav className="space-y-1">
              {profile?.role === 'admin' && (
                <Link
                  href="/admin/site-settings"
                  title="Site Branding"
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-[#093C15]/5 text-[#1d1d1f] transition-colors duration-200 group ${!isSidebarOpen ? 'justify-center' : ''}`}
                >
                  <Globe className="h-4 w-4 text-[#41cc00] group-hover:scale-110 transition-transform duration-200" />
                  {isSidebarOpen && <span className="text-[14px] font-semibold">Blog Content</span>}
                </Link>
              )}
            </nav>
          </div>
        </div>

        {/* User Footer & Logout */}
        <div className="mt-auto border-t border-black/5 bg-black/[0.02] flex flex-col">
          <Link href="/admin/profile" className={`p-4 hover:bg-black/[0.04] transition-colors group ${!isSidebarOpen && 'pb-4 pt-6 flex justify-center'}`}>
            <div className={`bg-white rounded-2xl border border-black/5 shadow-sm flex items-center justify-between group-hover:shadow-md transition-shadow ${isSidebarOpen ? 'p-3' : 'p-2'}`}>
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`rounded-xl overflow-hidden grayscale-[0.5] group-hover:grayscale-0 transition-all border border-black/5 shrink-0 bg-black/5 flex items-center justify-center text-[#1d1d1f] font-bold ${isSidebarOpen ? 'w-9 h-9' : 'w-10 h-10'}`}>
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs uppercase">{(profile?.full_name || authUser?.email || "U").slice(0, 2)}</span>
                  )}
                </div>
                {isSidebarOpen && (
                  <div className="min-w-0">
                    <div className="text-[14px] font-bold text-[#1d1d1f] truncate leading-tight group-hover:text-[#41cc00] transition-colors">{profile?.full_name || authUser?.email?.split('@')[0]}</div>
                    <div className="text-[10px] text-black/30 font-bold uppercase tracking-wider">{profile?.role || "User Account"}</div>
                  </div>
                )}
              </div>
              {isSidebarOpen && <ChevronRight className="w-4 h-4 text-black/20 group-hover:text-[#41cc00] transition-colors" />}
            </div>
          </Link>

          <button
            onClick={async () => {
              const { signOut } = await import("@/app/actions/user");
              await signOut();
              window.location.href = "/login";
            }}
            className={`flex items-center gap-3 px-8 py-4 text-red-500 hover:bg-red-50 transition-colors border-t border-black/5 ${!isSidebarOpen ? 'justify-center' : ''}`}
            title="Logout"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {isSidebarOpen && <span className="text-[13px] font-bold uppercase tracking-widest">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 min-h-screen flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-[280px]' : 'ml-[80px]'}`}>
        {/* Global Top Bar */}
        <header className="h-16 px-8 md:px-12 flex items-center justify-between sticky top-0 bg-white/60 backdrop-blur-xl z-40 border-b border-[#41cc00]/5">
          <div className="flex items-center gap-4">
            <h2 className="text-[25px] font-bold text-[#1d1d1f] font-bricolage tracking-tight flex items-center gap-2">
              Pulse <span className="text-[#41cc00]/40 font-medium text-[20px]">by Tela</span>
            </h2>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex -space-x-3">
              {team.map((member, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full border-[2.5px] border-white object-cover shadow-sm bg-white overflow-hidden"
                  title={member.full_name}
                >
                  <img
                    src={member.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.full_name || 'U')}&background=e8f5e8&color=093C15&size=96&bold=true`}
                    className="w-full h-full object-cover"
                    alt={member.full_name}
                  />
                </div>
              ))}
              {team.length >= 6 && (
                <Link href="/admin/users" className="w-9 h-9 rounded-full bg-white border border-black/5 flex items-center justify-center text-[10px] font-bold text-[#41cc00] hover:bg-[#41cc00]/10 transition-all border-[2.5px] border-white shadow-sm z-10">
                  +{team.length - 6 || 12}
                </Link>
              )}
              <Link href="/admin/users" className="w-9 h-9 rounded-full bg-[#093C15] flex items-center justify-center text-white scale-90 -ml-1 shadow-lg shadow-[#093C15]/20 hover:scale-100 transition-transform z-10">
                <Plus className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <NotificationCenter />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="px-8 md:px-12 py-4 md:py-6 w-full max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
