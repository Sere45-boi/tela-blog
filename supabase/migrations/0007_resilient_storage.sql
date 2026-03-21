-- 0007_resilient_storage.sql
-- Resilient Storage Setup for 'content' bucket

-- 1. Create the bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('content', 'content', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Clean up existing policies to avoid naming conflicts
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Owner Access" ON storage.objects;

-- 3. Re-create policies with specific scope for 'content' bucket
CREATE POLICY "Public Read Access" ON storage.objects FOR SELECT USING (bucket_id = 'content');

CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'content' AND auth.role() = 'authenticated');

CREATE POLICY "Owner Access" ON storage.objects FOR ALL
USING (bucket_id = 'content' AND auth.uid() = owner);

NOTIFY pgrst, 'reload schema';
