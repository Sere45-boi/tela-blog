"use client";

import { useState, useEffect } from "react";
import { Bell, MessageSquare, Heart, Share2, Eye, Clock, ChevronRight, Globe } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export function NotificationCenter() {
  const supabase = createClient();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();

    // Subscribe to real-time changes
    const channel = supabase
      .channel("realtime-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload: { new: any }) => {
          setNotifications((prev) => [payload.new, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error && data) {
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.is_read).length);
    }
  };

  const markAsRead = async (id: string) => {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);
    
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="w-4 h-4 text-red-500" />;
      case 'comment': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'share': return <Share2 className="w-4 h-4 text-green-500" />;
      case 'read': return <Eye className="w-4 h-4 text-[#41cc00]" />;
      case 'visit': return <Globe className="w-4 h-4 text-[#093C15]" />;
      default: return <Bell className="w-4 h-4 text-black/20" />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-3 rounded-2xl bg-white border border-black/5 transition-all shadow-sm hover:shadow-md ${isOpen ? 'text-[#41cc00] border-[#41cc00]/20' : 'text-black/40 hover:text-[#41cc00]'}`}
      >
        <Bell className="w-4 h-4" />
      </button>
      
      {unreadCount > 0 && (
        <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm" />
      )}

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl border border-black/5 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="p-4 border-b border-black/5 bg-black/[0.01] flex items-center justify-between">
              <h3 className="text-[13px] font-bold text-[#1d1d1f] uppercase tracking-wider">Live Interactions</h3>
              <span className="text-[10px] font-bold text-[#41cc00] bg-[#41cc00]/10 px-2 py-0.5 rounded-full uppercase">{unreadCount} New</span>
            </div>
            
            <div className="max-h-[350px] overflow-y-auto divide-y divide-black/5 custom-scrollbar">
              {notifications.length > 0 ? notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`p-4 hover:bg-[#f3fbf3]/50 transition-colors cursor-pointer group ${!n.is_read ? 'bg-[#41cc00]/[0.02]' : ''}`}
                  onClick={() => {
                    markAsRead(n.id);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-white border border-black/5 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                      {getIcon(n.type)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-[#1d1d1f] leading-snug">
                        {n.message}
                      </p>
                      <p className="text-[11px] text-black/30 font-bold mt-1 uppercase tracking-tight">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-10 text-center">
                  <Bell className="w-8 h-8 text-black/5 mx-auto mb-2" />
                  <p className="text-[12px] font-bold text-black/20 uppercase tracking-widest">No activity yet</p>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-black/5 bg-black/[0.01]">
                <Link 
                  href="/admin/notifications" 
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2 text-[12px] font-bold text-black/40 hover:text-[#093C15] transition-colors flex items-center justify-center gap-2"
                >
                    View Intelligence Log <ChevronRight className="w-3 h-3" />
                </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
