"use client";

import { useState, useEffect } from "react";
import {
   Bell,
   Heart,
   MessageSquare,
   Share2,
   Eye,
   Globe,
   Clock,
   Search,
   CheckCircle2,
   Trash2,
   ChevronRight,
   Filter
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { GsapReveal } from "@/components/GsapReveal";
import { GlassCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function NotificationsPage() {
   const supabase = createClient();
   const [notifications, setNotifications] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [filter, setFilter] = useState("all");

   const fetchNotifications = async () => {
      setLoading(true);
      let query = supabase
         .from("notifications")
         .select("*")
         .order("created_at", { ascending: false });

      if (filter !== "all") {
         query = query.eq("type", filter);
      }

      const { data, error } = await query;
      if (!error && data) {
         setNotifications(data);
      }
      setLoading(false);
   };

   useEffect(() => {
      fetchNotifications();
   }, [filter]);

   const markAllAsRead = async () => {
      const { error } = await supabase
         .from("notifications")
         .update({ is_read: true })
         .eq("is_read", false);

      if (!error) {
         setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      }
   };

   const getIcon = (type: string) => {
      switch (type) {
         case 'like': return <Heart className="w-5 h-5 text-red-500" />;
         case 'comment': return <MessageSquare className="w-5 h-5 text-blue-500" />;
         case 'share': return <Share2 className="w-5 h-5 text-green-500" />;
         case 'read': return <Eye className="w-5 h-5 text-[#41cc00]" />;
         case 'visit': return <Globe className="w-5 h-5 text-[#093C15]" />;
         default: return <Bell className="w-5 h-5 text-black/20" />;
      }
   };

   return (
      <div className="max-w-[1200px] mx-auto">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <GsapReveal direction="up">
               <h1 className="text-3xl font-bold tracking-tight text-[#1d1d1f] font-bricolage mb-2">Live Activities</h1>
               <p className="text-[#1d1d1f]/40 font-medium tracking-tight">Real-time audit log of all visitor interactions and engagement events.</p>
            </GsapReveal>

            <GsapReveal direction="up" delay={0.1} className="flex items-center gap-3">
               <Button
                  variant="ghost"
                  onClick={markAllAsRead}
                  className="text-[13px] font-bold text-[#41cc00] uppercase tracking-wider h-12 px-6 hover:bg-[#41cc00]/5"
               >
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Mark all as read
               </Button>
            </GsapReveal>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
            {/* Filters Sidebar */}
            <div className="lg:col-span-3 space-y-4">
               <GsapReveal direction="up" delay={0.2}>
                  <div className="bg-white/50 backdrop-blur-xl border border-black/5 rounded-2xl p-6 shadow-sm">
                     <h3 className="text-[11px] font-bold text-black/30 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <Filter className="w-3 h-3" /> Notification Filters
                     </h3>
                     <div className="space-y-1">
                        {[
                           { id: 'all', label: 'All Activities', icon: Bell },
                           { id: 'visit', label: 'Site Visits', icon: Globe },
                           { id: 'read', label: 'Article Reads', icon: Eye },
                           { id: 'like', label: 'Engagements', icon: Heart },
                           { id: 'share', label: 'Social Shares', icon: Share2 },
                        ].map((item) => (
                           <button
                              key={item.id}
                              onClick={() => setFilter(item.id)}
                              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${filter === item.id ? 'bg-[#093C15] text-white shadow-lg' : 'text-black/40 hover:bg-black/5 hover:text-black/60'}`}
                           >
                              <div className="flex items-center gap-3">
                                 <item.icon className={`w-4 h-4 ${filter === item.id ? 'text-[#41cc00]' : ''}`} />
                                 <span className="text-[14px] font-bold">{item.label}</span>
                              </div>
                              {filter === item.id && <ChevronRight className="w-3 h-3 opacity-50" />}
                           </button>
                        ))}
                     </div>
                  </div>
               </GsapReveal>
            </div>

            {/* Intelligence Log */}
            <div className="lg:col-span-9">
               <GsapReveal direction="up" delay={0.3}>
                  <GlassCard className="overflow-hidden shadow-sm flex flex-col min-h-[600px]">
                     {loading ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-20">
                           <div className="w-10 h-10 border-4 border-[#41cc00]/20 border-t-[#41cc00] rounded-full animate-spin mb-4" />
                           <span className="text-[13px] font-bold text-black/20 uppercase tracking-widest">Loading Notifications...</span>
                        </div>
                     ) : notifications.length > 0 ? (
                        <div className="divide-y divide-black/[0.03]">
                           {notifications.map((n, i) => (
                              <div
                                 key={n.id}
                                 className={`p-6 flex flex-col md:flex-row md:items-center gap-6 group hover:bg-[#f3fbf3]/30 transition-colors ${!n.is_read ? 'bg-[#41cc00]/[0.02] border-l-4 border-l-[#41cc00]' : 'border-l-4 border-l-transparent'}`}
                              >
                                 <div className="w-12 h-12 rounded-2xl bg-white border border-black/5 flex items-center justify-center shrink-0 shadow-sm group-hover:rotate-12 transition-transform">
                                    {getIcon(n.type)}
                                 </div>

                                 <div className="flex-1">
                                    <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                                       <span className="text-[15px] font-bold text-[#1d1d1f] tracking-tight">{n.message}</span>
                                       {!n.is_read && (
                                          <span className="w-2 h-2 rounded-full bg-[#41cc00] animate-pulse" />
                                       )}
                                    </div>
                                    <div className="flex items-center gap-4 text-[12px] font-bold text-black/20 uppercase tracking-tight">
                                       <div className="flex items-center gap-1.5">
                                          <Clock className="w-3.5 h-3.5" />
                                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                                       </div>
                                       <div className="w-1 h-1 rounded-full bg-black/10" />
                                       <div>Live Activity</div>
                                    </div>
                                 </div>

                                 <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-3 text-black/20 hover:text-red-500 rounded-xl hover:bg-red-500/5 transition-all">
                                       <Trash2 className="w-4 h-4" />
                                    </button>
                                 </div>
                              </div>
                           ))}
                        </div>
                     ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
                           <div className="w-20 h-20 bg-black/[0.02] rounded-3xl flex items-center justify-center mb-6">
                              <Bell className="w-8 h-8 text-black/5" />
                           </div>
                           <h3 className="text-xl font-bold text-black/20 mb-2 font-bricolage">No Interactions</h3>
                           <p className="text-[14px] text-black/20 max-w-[280px] mx-auto leading-relaxed">No interaction logs found for the selected filter criteria.</p>
                           <Button
                              variant="secondary"
                              onClick={() => setFilter('all')}
                              className="mt-8 shadow-none border-black/5"
                           >
                              Reset Filters
                           </Button>
                        </div>
                     )}
                  </GlassCard>
               </GsapReveal>
            </div>
         </div>
      </div>
   );
}
