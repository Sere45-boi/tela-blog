-- 0006_expand_profiles_schema.sql
-- Expansion for Professional Profiles

-- 1. Profiles Table Expansion
-- Add columns for social links and administrative status
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bios text, -- Supporting multiple bios if needed, or just naming fix
ADD COLUMN IF NOT EXISTS linkedin_url text,
ADD COLUMN IF NOT EXISTS instagram_url text,
ADD COLUMN IF NOT EXISTS facebook_url text,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT true;

-- Note: 'bio' and 'is_public' were added in 0001, but we use ADD COLUMN IF NOT EXISTS for resilience.
-- Ensure defaults are correct for existing Pulse UI
ALTER TABLE public.profiles ALTER COLUMN is_public SET DEFAULT true;
ALTER TABLE public.profiles ALTER COLUMN is_active SET DEFAULT true;

-- 2. Update existing profiles to be active/public by default
UPDATE public.profiles SET is_active = true WHERE is_active IS NULL;
UPDATE public.profiles SET is_public = true WHERE is_public IS NULL;

-- 3. Refresh PostgREST cache
NOTIFY pgrst, 'reload schema';
