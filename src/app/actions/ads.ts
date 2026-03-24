"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

import { z } from "zod";

const adSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  shape: z.enum(["square", "rectangle"]).default("square"),
  image_url: z.string().url("Valid image URL is required"),
  target_url: z.string().url("Valid target URL is required"),
  position: z.string().min(1, "Position is required"),
  status: z.enum(["active", "draft", "paused", "completed"]).default("active"),
});

export async function upsertAd(formData: FormData) {
  const supabase = await createClient();
  
  // Parse and validate with Zod
  const rawData = {
    id: formData.get("id") as string || undefined,
    title: formData.get("title") as string,
    description: formData.get("description") as string || undefined,
    shape: formData.get("shape") as string || "square",
    image_url: formData.get("image_url") as string,
    target_url: (formData.get("target_url") || formData.get("link_url")) as string,
    position: formData.get("position") as string,
    status: formData.get("status") as string || "active",
  };

  const parsed = adSchema.safeParse(rawData);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const { id, ...validData } = parsed.data;
  
  const adData = {
    ...validData,
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

  revalidatePath("/admin/campaigns");
  revalidatePath("/");
  
  return { success: true };
}

export async function deleteAd(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("ads")
    .delete()
    .eq("id", id);
  
  if (error) throw error;
  
  revalidatePath("/admin/campaigns");
}
