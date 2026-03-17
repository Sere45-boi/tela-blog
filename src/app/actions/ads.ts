"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function upsertAd(formData: FormData) {
  const supabase = await createClient();
  
  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const image_url = formData.get("image_url") as string;
  const link_url = formData.get("link_url") as string;
  const position = formData.get("position") as string;
  const status = formData.get("status") as string;

  const adData = {
    title,
    description,
    image_url,
    link_url,
    position,
    status,
    updated_at: new Date().toISOString(),
  };

  if (id) {
    const { error } = await supabase
      .from("ads")
      .update(adData)
      .eq("id", id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("ads")
      .insert([adData]);
    if (error) throw error;
  }

  revalidatePath("/admin/ads");
  revalidatePath("/");
  redirect("/admin/ads");
}

export async function deleteAd(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("ads")
    .delete()
    .eq("id", id);
  
  if (error) throw error;
  
  revalidatePath("/admin/ads");
}
