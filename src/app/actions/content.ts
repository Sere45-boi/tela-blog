"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { broadcastNewArticle } from "@/app/actions/newsletter";

// PostgreSQL does not support null bytes (\u0000) in text fields.
// Pasting from Word can sometimes introduce these hidden characters.
function sanitizeString(str?: string) {
  if (typeof str !== 'string') return str;
  return str.replace(/\0/g, '');
}

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
  published_at?: string | null;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Determine actual author (defaults to current user if not provided)
  const finalAuthorId = (articleData.author_id && articleData.author_id !== "") ? articleData.author_id : user.id;

  // Omit tags and other fields that shouldn't go directly into the articles table
  const { tags, id, ...coreArticleData } = articleData;

  const payload: any = {
    ...coreArticleData,
    title: sanitizeString(coreArticleData.title) as string,
    content: sanitizeString(coreArticleData.content) as string,
    excerpt: sanitizeString(coreArticleData.excerpt),
    meta_title: sanitizeString(coreArticleData.meta_title),
    meta_description: sanitizeString(coreArticleData.meta_description),
    author_id: finalAuthorId,
    category_id: (articleData.category_id && articleData.category_id !== "") ? articleData.category_id : null,
    status: articleData.status,
    published_at: articleData.status === 'published' 
      ? (articleData.published_at || new Date().toISOString())
      : (articleData.status === 'scheduled' ? articleData.published_at : null)
  };

  if (id) {
    payload.id = id;
  }

  const { data, error } = await supabase
    .from("articles")
    .upsert(payload, { onConflict: "id" })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // If we have tags, attach them
  if (tags && tags.length > 0) {
    const { data: tagRecords } = await supabase.from("tags").select("id, name").in("name", tags);
    if (tagRecords) {
      await attachTagsToArticle(data.id, tagRecords.map(t => t.id));
    }
  }

  // Trigger newsletter broadcast if newly published
  if (articleData.status === "published") {
    broadcastNewArticle({
      id: data.id,
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      featured_image: data.featured_image
    }).catch(err => console.error("Newsletter broadcast failed:", err));
  }

  // Log this action
  const isUpdate = !!id;
  await supabase.from("admin_activity_logs").insert({
    user_id: user.id,
    action: `${isUpdate ? 'Updated' : 'Created'} article: ${articleData.title} (Status: ${articleData.status})`,
    path: `/admin/articles/editor?id=${data.id}`
  });
  
  revalidatePath("/admin/articles");
  revalidatePath("/");
  revalidatePath(`/blog/${articleData.slug}`);
  return data;
}

export async function deleteArticle(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("articles").delete().eq("id", id);
  if (error) throw new Error(error.message);

  // Log this action
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.from("admin_activity_logs").insert({
      user_id: user.id,
      action: `Deleted an article (ID: ${id})`,
      path: "/admin/articles"
    });
  }
  
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
