-- Add email column to profiles for registry lookups and better admin management
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- Backfill emails from auth.users (requires security definer function or manual update)
-- Since we are running this as a migration, we can use a temporary function to sync.
CREATE OR REPLACE FUNCTION public.sync_profile_emails()
RETURNS void AS $$
BEGIN
  UPDATE public.profiles p
  SET email = u.email
  FROM auth.users u
  WHERE p.id = u.id AND p.email IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT public.sync_profile_emails();
DROP FUNCTION public.sync_profile_emails();

-- Update the handle_new_user trigger to include email
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role, email)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url', 
    'user',
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
