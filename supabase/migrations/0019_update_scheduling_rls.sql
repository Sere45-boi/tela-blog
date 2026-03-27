-- Update RLS policies to support scheduled posts visibility based on published_at
BEGIN;

-- 1. Drop the old policy
DROP POLICY IF EXISTS "Published articles visible to everyone." ON articles;

-- 2. Create the new policy that respects both status and time
CREATE POLICY "Published articles visible to everyone." ON articles 
FOR SELECT USING (
  (status = 'published' OR status = 'scheduled') 
  AND (published_at <= NOW())
);

-- 3. Update the Draft/Scheduled policy to still allow admins/authors to see everything
DROP POLICY IF EXISTS "Draft/Scheduled articles visible ONLY to admins/authors." ON articles;
CREATE POLICY "Draft/Scheduled articles visible ONLY to admins/authors." ON articles 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'author')
  )
);

COMMIT;
