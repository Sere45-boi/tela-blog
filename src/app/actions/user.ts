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

export async function updateUserRole(userId: string, role: 'admin' | 'author') {
  const supabase = await createClient();
  const { data: { user: adminUser } } = await supabase.auth.getUser();
  
  if (!adminUser) throw new Error("Unauthorized");
  
  // Verify requester is admin
  const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', adminUser.id).single();
  if (adminProfile?.role !== 'admin') throw new Error("Only administrators can change roles.");

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) throw new Error(error.message);
  
  revalidatePath("/admin/users");
  return { success: true };
}

export async function deleteUser(userId: string) {
  const supabase = await createClient();
  const { data: { user: adminUser } } = await supabase.auth.getUser();
  
  if (!adminUser) throw new Error("Unauthorized");
  
  // Verify requester is admin
  const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', adminUser.id).single();
  if (adminProfile?.role !== 'admin') throw new Error("Only administrators can deactivate users.");

  // Soft delete: Mark as inactive
  const { error } = await supabase
    .from("profiles")
    .update({ is_active: false })
    .eq("id", userId);

  if (error) throw new Error(error.message);
  
  revalidatePath("/admin/users");
  return { success: true };
}

export async function updatePassword(password: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw new Error(error.message);

  return { success: true };
}
