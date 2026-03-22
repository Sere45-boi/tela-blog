"use server";

import { createClient } from "@/utils/supabase/server";

export async function createNotification(payload: {
  type: 'visit' | 'read' | 'share' | 'click' | 'like' | 'comment';
  message: string;
  link?: string;
}) {
  const supabase = await createClient();

  // For System/Public notifications, we don't necessarily need a user_id
  // unless we want to attribute it to a logged-in user.
  // The 'notifications' table schema allows user_id to be null.
  
  const { error } = await supabase
    .from("notifications")
    .insert([{
      type: payload.type,
      message: payload.message,
      link: payload.link,
      is_read: false
    }]);

  if (error) {
    console.error("Error creating notification:", error);
    return { success: false, error };
  }

  return { success: true };
}
