-- 0010_smart_onboarding_trigger.sql
-- Force case-insensitive email matching for invitations

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
DECLARE
  invited_role public.user_role;
BEGIN
  -- 1. Search for a valid, unclaimed invitation (case-insensitive)
  -- auth.users email is usually lowercased, but let's be safe.
  SELECT role INTO invited_role
  FROM public.invitations
  WHERE LOWER(TRIM(email)) = LOWER(TRIM(new.email))
    AND claimed_at IS NULL
    AND expires_at > now()
  LIMIT 1;

  -- 2. Insert into profiles
  -- We strictly use the invited role if found.
  -- FALLBACK: If no invitation is found, we'll assign 'author' for now 
  -- to ensure the user can at least see the dashboard during this testing phase.
  INSERT INTO public.profiles (id, full_name, avatar_url, role, is_active, is_public)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url', 
    COALESCE(invited_role, 'author'::public.user_role),
    true,
    true
  );

  -- 3. Mark invitation as claimed
  IF invited_role IS NOT NULL THEN
    UPDATE public.invitations
    SET claimed_at = now()
    WHERE LOWER(TRIM(email)) = LOWER(TRIM(new.email))
      AND claimed_at IS NULL;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Refresh PostgREST cache
NOTIFY pgrst, 'reload schema';
