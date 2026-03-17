import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, FileText, Settings, Tags, LogOut, Image, Globe } from "lucide-react";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check roles (admin | author)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "admin" && profile.role !== "author")) {
    redirect("/"); // Unauthorized
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-white via-[#f3fbf3] to-[#e4fce4]">
      {/* Sidebar Navigation */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white/80 backdrop-blur-xl border-r border-[#41cc00]/10 p-6 flex flex-col z-50 shadow-sm">
        <div className="mb-10 mt-2">
          <Link href="/admin" className="text-xl font-medium tracking-tight text-[#093C15]">
            Tela <span className="font-semibold">Insights</span>
          </Link>
          <span className="ml-2 text-xs uppercase tracking-widest text-[#41cc00] border border-[#41cc00]/20 px-2 py-0.5 rounded-full font-bold">CMS</span>
        </div>

        <nav className="flex-1 space-y-1">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#093C15]/5 text-[#1d1d1f] transition-colors">
            <LayoutDashboard className="h-4 w-4 text-[#41cc00]" />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
          <Link href="/admin/articles" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#093C15]/5 text-[#1d1d1f] transition-colors">
            <FileText className="h-4 w-4 text-[#41cc00]" />
            <span className="text-sm font-medium">Articles</span>
          </Link>
          <Link href="/admin/categories" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#093C15]/5 text-[#1d1d1f] transition-colors">
            <Tags className="h-4 w-4 text-[#41cc00]" />
            <span className="text-sm font-medium">Categories</span>
          </Link>
          <Link href="/admin/ads" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#093C15]/5 text-[#1d1d1f] transition-colors">
            <Image className="h-4 w-4 text-[#41cc00]" />
            <span className="text-sm font-medium">Ads Manager</span>
          </Link>
          <Link href="/admin/site-settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#093C15]/5 text-[#1d1d1f] transition-colors">
            <Globe className="h-4 w-4 text-[#41cc00]" />
            <span className="text-sm font-medium">Site Settings</span>
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#093C15]/5 text-[#1d1d1f] transition-colors">
            <Settings className="h-4 w-4 text-[#41cc00]" />
            <span className="text-sm font-medium">Account</span>
          </Link>
        </nav>

        <div className="mt-auto border-t border-[#41cc00]/10 pt-4">
          <form action="/auth/signout" method="post">
            <button className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors">
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8 md:p-12">
        {children}
      </main>
    </div>
  );
}
