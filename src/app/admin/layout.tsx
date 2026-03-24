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
  Lock,
  Menu,
  X
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      if (!prof || (prof.role !== "admin" && prof.role !== "author") || prof.is_active === false) {
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
              : "You do not have the required permissions to view the dashboard."}
          </p>
          <button 
            onClick={async () => {
              await signOut();
              window.location.href = '/login';
            }}
            className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-lg"
          >
            Log Out
          </button>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: "/admin", Icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/articles", Icon: FileText, label: "Articles" },
    { href: "/admin/categories", Icon: Tags, label: "Categories" },
    { href: "/admin/campaigns", Icon: ImageIcon, label: "Campaigns" },
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-white via-[#f3fbf3] to-[#e4fce4] font-poppins selection:bg-[#41cc00]/30 selection:text-[#093C15]">
      {/* Sidebar Navigation */}
      <aside 
        className={`fixed inset-y-0 left-0 bg-white/80 backdrop-blur-xl border-r border-[#41cc00]/10 flex flex-col z-50 overflow-hidden shadow-sm transition-all duration-300 
        ${isSidebarOpen || isMobileMenuOpen ? 'w-[280px]' : 'w-[80px]'} 
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="p-6 flex items-center justify-between min-h-[64px]">
          {(isSidebarOpen || isMobileMenuOpen) ? (
            <Link href="/admin" className="block transition-opacity hover:opacity-80">
              <img src="/images/IMG_2366.png" alt="Logo" className="h-10 w-auto" />
            </Link>
          ) : (
            <Link href="/admin" className="flex items-center justify-center w-10 h-10 rounded-xl hover:opacity-80">
              <img src="/images/logo.png" alt="Logo" className="w-8 h-8" />
            </Link>
          )}
          <button
            onClick={() => isMobileMenuOpen ? setIsMobileMenuOpen(false) : setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-lg border border-black/5 text-black/40 hover:text-black/60 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <ChevronRight className={`w-4 h-4 transition-transform ${isSidebarOpen ? 'rotate-180' : ''}`} />}
          </button>
        </div>

        <div className="flex-1 px-4 overflow-y-auto space-y-6 pb-8">
          <nav className="space-y-1">
            {navItems.map(({ href, Icon, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-[#093C15]/5 text-[#1d1d1f] transition-all group ${(!isSidebarOpen && !isMobileMenuOpen) ? 'justify-center' : ''}`}
              >
                <Icon className="h-4 w-4 text-[#41cc00] group-hover:scale-110 shrink-0" />
                {(isSidebarOpen || isMobileMenuOpen) && <span className="text-[14px] font-semibold">{label}</span>}
              </Link>
            ))}
            {profile?.role === 'admin' && (
              <>
                <Link href="/admin/users" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-[#093C15]/5 text-[#1d1d1f] group ${(!isSidebarOpen && !isMobileMenuOpen) ? 'justify-center' : ''}`}>
                  <Users className="h-4 w-4 text-[#41cc00] shrink-0" />
                  {(isSidebarOpen || isMobileMenuOpen) && <span className="text-[14px] font-semibold">Authors</span>}
                </Link>
                <Link href="/admin/site-settings" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-[#093C15]/5 text-[#1d1d1f] group ${(!isSidebarOpen && !isMobileMenuOpen) ? 'justify-center' : ''}`}>
                  <Globe className="h-4 w-4 text-[#41cc00] shrink-0" />
                  {(isSidebarOpen || isMobileMenuOpen) && <span className="text-[14px] font-semibold">Blog Content</span>}
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="mt-auto border-t border-black/5 bg-black/[0.02]">
          <Link href="/admin/profile" className={`p-4 block hover:bg-black/[0.04] ${(!isSidebarOpen && !isMobileMenuOpen) && 'flex justify-center'}`}>
             <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl overflow-hidden border border-black/5 bg-black/5 flex items-center justify-center shrink-0">
                  {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <span className="text-xs">U</span>}
                </div>
                {(isSidebarOpen || isMobileMenuOpen) && <span className="text-[14px] font-bold truncate">{profile?.full_name || 'Admin'}</span>}
             </div>
          </Link>
          <button onClick={async () => { await signOut(); window.location.href = "/login"; }} className="w-full flex items-center gap-3 px-8 py-4 text-red-500 hover:bg-red-50 border-t border-black/5">
            <LogOut className="w-4 h-4" />
            {(isSidebarOpen || isMobileMenuOpen) && <span className="text-[13px] font-bold uppercase tracking-widest">Logout</span>}
          </button>
        </div>
      </aside>

      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />}

      <main className={`flex-1 min-h-screen flex flex-col transition-all duration-300 ${isSidebarOpen ? 'lg:ml-[280px]' : 'lg:ml-[80px]'} ml-0`}>
        <header className="h-16 px-6 md:px-12 flex items-center justify-between sticky top-0 bg-white/60 backdrop-blur-xl z-40 border-b border-[#41cc00]/5">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 rounded-xl bg-black/5 text-[#093C15]"><Menu size={20} /></button>
            <h2 className="text-[20px] md:text-[25px] font-bold text-[#1d1d1f] font-bricolage">Pulse <span className="hidden sm:inline text-[#41cc00]/40 font-medium">by Tela</span></h2>
          </div>
          <div className="flex items-center gap-4 md:gap-8">
            <div className="hidden sm:flex -space-x-3">
               {team.slice(0, 3).map((member: any, i: number) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden shadow-sm">
                    <img src={member.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.full_name || 'U')}`} className="w-full h-full object-cover" />
                  </div>
               ))}
            </div>
            <NotificationCenter />
          </div>
        </header>
        <div className="px-4 md:px-12 py-6 w-full max-w-[1600px] mx-auto overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
