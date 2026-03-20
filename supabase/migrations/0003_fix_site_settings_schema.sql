-- 0003_fix_site_settings_schema.sql
-- Reconcile site_settings table with premium UI requirements

ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS hero_title text,
ADD COLUMN IF NOT EXISTS hero_subtitle text,
ADD COLUMN IF NOT EXISTS hero_description text,
ADD COLUMN IF NOT EXISTS newsletter_title text,
ADD COLUMN IF NOT EXISTS newsletter_description text,
ADD COLUMN IF NOT EXISTS twitter_handle text,
ADD COLUMN IF NOT EXISTS linkedin_url text,
ADD COLUMN IF NOT EXISTS instagram_url text,
ADD COLUMN IF NOT EXISTS facebook_url text,
ADD COLUMN IF NOT EXISTS site_description text;

-- Add comment for documentation
COMMENT ON TABLE public.site_settings IS 'Global site configuration and branding settings';

-- Refresh PostgREST cache (Supabase specific)
NOTIFY pgrst, 'reload schema';
