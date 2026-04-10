"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

import { headers } from "next/headers";

/**
 * Generates a unique invitation token and stores it in the database.
 * Only admins can call this.
 */
export async function createInvitation(email: string, role: 'author' | 'admin' = 'author') {
  const supabase = await createClient();
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = host?.includes("localhost") ? "http" : "https";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;
  
  // Verify requester is admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== 'admin') {
    throw new Error("Only administrators can invite new users.");
  }

  // Generate invitation with 2-hour expiry
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 2);

  const { data, error } = await supabase
    .from("invitations")
    .insert({
      email,
      role,
      invited_by: user.id,
      expires_at: expiresAt.toISOString()
    })
    .select("token")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/admin/users");
  
  // Return the full invite URL (this would normally be emailed)
  return { 
    token: data.token,
    inviteUrl: `${baseUrl}/signup?invite=${data.token}`
  };
}

/**
 * Validates an invitation token.
 */
export async function validateInvitation(token: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("invitations")
    .select("*")
    .eq("token", token)
    .gt("expires_at", new Date().toISOString())
    .is("claimed_at", null)
    .maybeSingle();

  if (error) throw new Error("Invalid or expired invitation");
  if (!data) return null;

  return data;
}

/**
 * Claims an invitation after a user has successfully signed up.
 * This should be called during the signup process.
 */
export async function claimInvitation(token: string, userId: string) {
  const supabase = await createClient();
  
  // 1. Fetch the role associated with this invitation
  const { data: inviteData, error: fetchError } = await supabase
    .from("invitations")
    .select("role")
    .eq("token", token)
    .single();

  if (fetchError || !inviteData) {
    console.error("Failed to fetch invitation data:", fetchError?.message);
    throw new Error("Invitation not found or invalid.");
  }

  // 2. Update the profile with the invited role and set to active
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ 
      role: inviteData.role,
      is_active: true 
    })
    .eq("id", userId);

  if (profileError) {
    console.error("Failed to update profile role:", profileError.message);
  }
  
  // 3. Mark invitation as claimed
  const { error: inviteError } = await supabase
    .from("invitations")
    .update({ claimed_at: new Date().toISOString() })
    .eq("token", token);

  if (inviteError) console.error("Invitation claim cleanup error:", inviteError.message);

  revalidatePath("/admin/users");
  return { success: true };
}
