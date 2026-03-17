"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateSiteSettings(settings: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Site settings is usually a single row or key-value table
  // We'll use a single row with ID 1 for simplicity
  const { data, error } = await supabase
    .from("site_settings")
    .upsert({ id: 1, ...settings }, { onConflict: "id" })
    .select()
    .single();

  if (error) throw new Error(error.message);
  
  revalidatePath("/");
  revalidatePath("/admin/site-settings");
  return data;
}

export async function upsertAd(adData: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("ads")
    .upsert(adData, { onConflict: "id" })
    .select()
    .single();

  if (error) throw new Error(error.message);
  
  revalidatePath("/");
  revalidatePath("/admin/ads");
  return data;
}

export async function deleteAd(id: string | number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.from("ads").delete().eq("id", id);
  if (error) throw new Error(error.message);
  
  revalidatePath("/");
  revalidatePath("/admin/ads");
}
