"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(profileData: {
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  twitter_handle?: string;
  is_public?: boolean;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("profiles")
    .update(profileData)
    .eq("id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/profile");
  revalidatePath("/admin/users");
  revalidatePath("/");
  return { success: true };
}

export async function updateEmail(newEmail: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // This triggers confirmation emails to both old and new addresses
  const { error } = await supabase.auth.updateUser({ email: newEmail });

  if (error) throw new Error(error.message);

  return { success: true, message: "Verification codes have been sent. Please check your new email to confirm." };
}

export async function verifyEmailChange(email: string, token: string) {
  const supabase = await createClient();
  
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email_change'
  });

  if (error) throw new Error(error.message);

  revalidatePath("/admin/profile");
  return { success: true };
}

export async function getUsers() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("profiles")
    .select("*, articles(count)")
    .order("full_name", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}
