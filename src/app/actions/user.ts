"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(profileData: {
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  linkedin_url?: string;
  twitter_handle?: string;
  is_public?: boolean;
  is_active?: boolean;
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

export async function verifyEmailChange(newEmail: string, newToken: string, oldEmail: string, oldToken: string) {
  const supabase = await createClient();
  
  // 1. Verify token for old email (Identity Verification)
  const { error: oldError } = await supabase.auth.verifyOtp({
    email: oldEmail,
    token: oldToken,
    type: 'email_change'
  });
  if (oldError) throw new Error("Old email verification failed: " + oldError.message);

  // 2. Verify token for new email (Confirmation)
  const { error: newError } = await supabase.auth.verifyOtp({
    email: newEmail,
    token: newToken,
    type: 'email_change'
  });
  if (newError) throw new Error("New email verification failed: " + newError.message);

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

export async function deactivateUser(userId: string) {
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

  // Log this action
  await supabase.from("admin_activity_logs").insert({
    user_id: adminUser.id,
    action: `Deactivated author profile`,
    path: "/admin/users"
  });
  
  revalidatePath("/admin/users");
  return { success: true };
}

export async function hardDeleteUser(userId: string) {
  const supabase = await createClient();
  const { data: { user: adminUser } } = await supabase.auth.getUser();
  
  if (!adminUser) throw new Error("Unauthorized");
  
  // Verify requester is admin
  const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', adminUser.id).single();
  if (adminProfile?.role !== 'admin') throw new Error("Only administrators can permanently delete users.");

  // Check for articles first
  const { count, error: countError } = await supabase
    .from("articles")
    .select("*", { count: 'exact', head: true })
    .eq("author_id", userId);

  if (countError) throw new Error(countError.message);
  if (count && count > 0) {
    throw new Error(`Cannot delete author. They have ${count} published articles. Reassign or delete their articles first.`);
  }

  // Permanent delete from profiles table
  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", userId);

  if (error) throw new Error(error.message);

  // Log this action
  await supabase.from("admin_activity_logs").insert({
    user_id: adminUser.id,
    action: `Permanently deleted author profile`,
    path: "/admin/users"
  });
  
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

export async function verifyUserAccess(email: string) {
  const supabase = await createClient();
  
  // Check if a profile exists with this email and is active
  const { data, error } = await supabase
    .from("profiles")
    .select("id, is_active")
    .eq("email", email)
    .maybeSingle();

  if (error) throw new Error("Database lookup failed");
  
  if (!data) {
    throw new Error("This email is not registered in our team database. Please contact an administrator for an invitation.");
  }

  if (data.is_active === false) {
    throw new Error("This account has been deactivated. Please contact an administrator.");
  }

  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
  return { success: true };
}
