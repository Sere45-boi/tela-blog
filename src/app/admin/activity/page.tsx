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
  const supabase = createClient();

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from("admin_activity_logs")
      .select(`
        *,
        profiles:user_id (full_name, avatar_url)
      `)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching logs:", error);
    } else {
      setLogs(data as any);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();

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
            Platform <span className="text-[#093C15]">Pulse</span>
          </h1>
          <p className="text-[#1d1d1f]/50 font-medium mt-1">Real-time audit logs of administrative activities.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-md rounded-2xl border border-black/5">
          <div className="w-2 h-2 bg-[#41cc00] rounded-full animate-pulse" />
          <span className="text-xs font-bold text-[#093C15] uppercase tracking-wider">Live Monitoring Active</span>
        </div>
      </GsapReveal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
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
              logs.map((log) => (
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
                            {log.profiles?.full_name || "Unknown Admin"}
                          </span>
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
              ))
            ) : (
              <div className="text-center py-20 bg-white/40 rounded-3xl border border-dashed border-black/10">
                <p className="text-[#1d1d1f]/40 font-medium font-poppins">No activity recorded yet.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
           <h2 className="text-lg font-bold text-[#1d1d1f] flex items-center gap-2 ml-1">
            <Zap className="w-5 h-5 text-[#41cc00]" />
            Insights
          </h2>
          
          <GlassCard className="p-6 bg-gradient-to-br from-[#093C15] to-[#1d1d1f] text-white border-none shadow-xl shadow-[#093C15]/20">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#41cc00]" />
              Security Status
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/60">Session Policy</span>
                <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-bold">2H AUTO-EXPIRE</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/60">Auth Protocol</span>
                <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-bold">6-DIGIT OTP</span>
              </div>
              <div className="pt-4 border-t border-white/10 mt-4">
                <p className="text-[11px] text-white/40 leading-relaxed italic">
                  "Security is not a product, but a process." - The Pulse monitoring system ensures total visibility into platform state.
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 bg-white/80 border border-black/5 shadow-sm">
            <h3 className="font-bold text-[#1d1d1f] mb-4 text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-[#41cc00]" />
              Active Admin Hierarchy
            </h3>
            <div className="space-y-4">
              {/* This could be expanded with a real users list if needed, or stick to showing the team */}
              <p className="text-xs text-[#1d1d1f]/40 leading-relaxed">
                Platform users with administrative access are logged during every interaction to prevent unauthorized changes and ensure accountability.
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
