import { createClient } from "@/utils/supabase/server";

export async function getPublishedArticles(page = 1, limit = 9, categorySlug?: string, searchTerm?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("articles")
    .select(`
      *,
      profiles (full_name, avatar_url),
      categories!inner(id, name, slug)
    `, { count: "exact" })
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (categorySlug) {
    query = query.eq("categories.slug", categorySlug);
  }

  if (searchTerm) {
    query = query.ilike("title", `%${searchTerm}%`);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } = await query.range(from, to);

  if (error) {
    console.error("Error fetching articles:", error.message, error.code, error.details);
    return { data: [], count: 0 };
  }

  return { data, count };
}

export async function getFeaturedArticle() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select(`
      *,
      profiles (full_name, avatar_url),
      categories(name, slug)
    `)
    .eq("status", "published")
    .eq("is_featured", true)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching featured article:", error.message, error.code, error.details);
  }
  return data;
}

export async function getCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error.message, error.code, error.details);
    return [];
  }
  return data;
}

export async function getArticleBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select(`
      *,
      profiles (full_name, avatar_url),
      categories(name, slug)
    `)
    .eq("status", "published")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching article by slug:", error.message, error.code, error.details);
    return null;
  }
  return data;
}
