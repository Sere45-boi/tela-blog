-- Add missing columns to articles table
alter table public.articles 
add column if not exists og_image_url text,
add column if not exists read_time_minutes integer default 1;

-- Refresh PostgREST cache (Supabase specific, happens automatically but good for documentation)
notify pgrst, 'reload schema';
