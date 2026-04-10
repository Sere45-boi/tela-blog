"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { formatDistanceToNow } from "date-fns";
import {
  Zap,
  Activity,
  User,
  Eye,
  PlusCircle,
  Edit3,
  Trash2,
  ShieldCheck,
  Globe
} from "lucide-react";
import { GsapReveal } from "@/components/GsapReveal";
import { GlassCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  path: string;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

export default function ActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 15;
  const supabase = createClient();

  const fetchLogs = async (isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const profileRes = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (profileRes.data?.role !== 'admin') {
        window.location.href = "/admin";
        return;
      }

      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // Fetch logs, joining with profiles and filtering for authors only
      const { data, error } = await supabase
        .from("admin_activity_logs")
        .select(`
          id,
          action,
          path,
          created_at,
          profiles:user_id!inner (
            full_name,
            avatar_url,
            role
          )
        `)
        .eq("profiles.role", "author") // EXCLUDE ADMINS (inner join + filter)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      if (isLoadMore) {
        setLogs(prev => [...prev, ...data as any]);
      } else {
        setLogs(data as any);
      }

      setHasMore(data.length === PAGE_SIZE);
    } catch (err: any) {
      console.error("Activity Fetch Error:", err.message);
      toast.error("Could not load activity feed.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  useEffect(() => {
    // Subscribe to real-time changes
    const channel = supabase
      .channel("activity_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "admin_activity_logs" },
        () => {
          fetchLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getIcon = (action: string) => {
    const a = action.toLowerCase();
    if (a.includes("viewed")) return <Eye className="w-4 h-4 text-blue-500" />;
    if (a.includes("create") || a.includes("added")) return <PlusCircle className="w-4 h-4 text-green-500" />;
    if (a.includes("edit") || a.includes("update") || a.includes("save")) return <Edit3 className="w-4 h-4 text-amber-500" />;
    if (a.includes("delete") || a.includes("remove")) return <Trash2 className="w-4 h-4 text-red-500" />;
    if (a.includes("login") || a.includes("verify")) return <ShieldCheck className="w-4 h-4 text-purple-500" />;
    return <Activity className="w-4 h-4 text-[#41cc00]" />;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <GsapReveal direction="up" className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black font-bricolage tracking-tight text-[#1d1d1f]">
            Activity <span className="text-[#093C15]">Logs</span>
          </h1>
          <p className="text-[#1d1d1f]/50 font-medium mt-1">Real-time user activities.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-md rounded-2xl border border-black/5">
          <div className="w-2 h-2 bg-[#41cc00] rounded-full animate-pulse" />
          <span className="text-xs font-bold text-[#093C15] uppercase tracking-wider">Live Monitoring</span>
        </div>
      </GsapReveal>

      <div className="space-y-4 max-w-5xl mx-auto">
        <h2 className="text-lg font-bold text-[#1d1d1f] flex items-center gap-2 ml-1">
          <Activity className="w-5 h-5 text-[#41cc00]" />
          Activity Feed
        </h2>

        <div className="space-y-3">
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-20 bg-black/5 animate-pulse rounded-2xl" />
            ))
          ) : logs.length > 0 ? (
            <>
              {logs.map((log) => (
                <GsapReveal key={log.id} direction="up" className="group">
                  <GlassCard className="p-4 border border-black/5 hover:border-[#41cc00]/20 transition-all duration-300 bg-white/60">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl overflow-hidden border border-black/5 bg-black/5 shrink-0">
                        {log.profiles?.avatar_url ? (
                          <img src={log.profiles.avatar_url} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#093C15]/5 text-[#093C15]">
                            <User className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-[#1d1d1f] text-sm truncate">
                            {log.profiles?.full_name || "Unknown Author"}
                          </span>
                          <div className="px-1.5 py-0.5 rounded-md bg-[#41cc00]/10 text-[#41cc00] text-[10px] font-bold uppercase tracking-wider">
                            Author
                          </div>
                          <span className="text-[10px] text-[#1d1d1f]/30">•</span>
                          <span className="text-[11px] font-medium text-[#1d1d1f]/40">
                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[13px] text-[#1d1d1f]/70 font-medium">
                          <span className="shrink-0">{getIcon(log.action)}</span>
                          <span className="truncate">{log.action}</span>
                        </div>
                      </div>

                      <div className="hidden md:flex flex-col items-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/5 rounded-lg">
                          <Globe className="w-3 h-3 text-[#1d1d1f]/40" />
                          <span className="text-[10px] font-bold text-[#1d1d1f]/50 truncate max-w-[120px]">
                            {log.path || "/"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </GsapReveal>
              ))}

              {hasMore && (
                <GsapReveal direction="up" className="pt-6">
                  <Button
                    variant="secondary"
                    onClick={handleLoadMore}
                    isLoading={loadingMore}
                    className="w-full h-14 rounded-2xl border-none bg-white font-bold text-[#093C15] shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                  >
                    View older activities
                  </Button>
                </GsapReveal>
              )}

              {!hasMore && logs.length > 5 && (
                <div className="py-12 text-center">
                  <p className="text-[#1d1d1f]/20 text-[13px] font-bold uppercase tracking-[0.2em]">End of Archive</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-white/40 rounded-3xl border border-dashed border-black/10">
              <p className="text-[#1d1d1f]/40 font-medium font-poppins">No author activity recorded yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
