"use server";

import { createClient } from "@/utils/supabase/server";

export async function recordReadTime(payload: {
  articleId: string;
  readTimeSeconds: number;
  readerId?: string;
}) {
  const supabase = await createClient();

  // Basic validation
  if (!payload.articleId || payload.readTimeSeconds < 1) {
    return { success: false, error: "Invalid payload" };
  }

  const { error } = await supabase
    .from("analytics")
    .insert([{
      article_id: payload.articleId,
      read_time_seconds: payload.readTimeSeconds,
      reader_id: payload.readerId || null,
    }]);

  if (error) {
    console.error("Error recording read time:", error);
    return { success: false, error };
  }

  return { success: true };
}
