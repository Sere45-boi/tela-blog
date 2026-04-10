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
  
  // Mark invitation as claimed
  // This is a safety cleanup, as the trigger already handles this during signup.
  const { error: inviteError } = await supabase
    .from("invitations")
    .update({ claimed_at: new Date().toISOString() })
    .eq("token", token);

  if (inviteError) console.error("Invitation claim cleanup error:", inviteError.message);

  revalidatePath("/admin/users");
  return { success: true };
}
