-- 0012_article_view_rpc.sql
-- Create a secure RPC function to dynamically increment article views natively in PostgreSQL.

CREATE OR REPLACE FUNCTION increment_article_view(article_slug TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.articles
  SET view_count = view_count + 1
  WHERE slug = article_slug AND status = 'published';
END;
$$;
