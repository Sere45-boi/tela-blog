"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createCategory(name: string, slug: string, description?: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .insert([{ name, slug, description }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/admin/categories");
  return data;
}

export async function createTag(name: string, slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tags")
    .insert([{ name, slug }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/admin/tags");
  return data;
}

export async function upsertArticle(articleData: {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  category_id?: string;
  status: "draft" | "published" | "scheduled";
  is_featured?: boolean;
  meta_title?: string;
  meta_description?: string;
  og_image_url?: string;
  tags?: string[];
  read_time_minutes?: number;
  author_id?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Determine actual author (defaults to current user if not provided)
  const finalAuthorId = articleData.author_id || user.id;

  // Omit tags and other fields that shouldn't go directly into the articles table
  const { tags, ...coreArticleData } = articleData;

  const payload = {
    ...coreArticleData,
    author_id: finalAuthorId,
    ...(articleData.status === "published" && !articleData.id ? { published_at: new Date().toISOString() } : {})
  };

  const { data, error } = await supabase
    .from("articles")
    .upsert(payload, { onConflict: "id" })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // If we have tags, attach them
  if (tags && tags.length > 0) {
    // We need to resolve tag IDs first, or assume tags are already created if we just pass IDs
    // For now, let's look for tags by name or ID
    const { data: tagRecords } = await supabase.from("tags").select("id, name").in("name", tags);
    if (tagRecords) {
      await attachTagsToArticle(data.id, tagRecords.map(t => t.id));
    }
  }
  
  revalidatePath("/admin/articles");
  revalidatePath("/");
  revalidatePath(`/blog/${articleData.slug}`);
  return data;
}

export async function deleteArticle(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("articles").delete().eq("id", id);
  if (error) throw new Error(error.message);
  
  revalidatePath("/admin/articles");
  revalidatePath("/");
}

export async function attachTagsToArticle(articleId: string, tagIds: string[]) {
  const supabase = await createClient();
  
  // Clear existing
  await supabase.from("article_tags").delete().eq("article_id", articleId);
  
  if (tagIds.length > 0) {
    const payloads = tagIds.map(tag_id => ({ article_id: articleId, tag_id }));
    const { error } = await supabase.from("article_tags").insert(payloads);
    if (error) throw new Error(error.message);
  }
}
