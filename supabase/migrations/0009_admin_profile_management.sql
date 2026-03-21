-- 0009_admin_profile_management.sql
-- Grant administrators full control over user profiles

-- 1. Allow admins to update any profile
CREATE POLICY "Admins can update any profile" ON public.profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 2. Allow admins to delete any profile
CREATE POLICY "Admins can delete any profile" ON public.profiles
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Refresh PostgREST cache
NOTIFY pgrst, 'reload schema';
