-- 0013_add_ads_description_shape.sql
-- Adds the missing description and shape configuration for Ad Campaigns

ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS description text;

-- Shape can be 'rectangle' or 'square'
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS shape text DEFAULT 'rectangle'::text NOT NULL;

-- Notify PostgREST to reload the schema cache so the API picks up the new columns immediately
NOTIFY pgrst, 'reload schema';
