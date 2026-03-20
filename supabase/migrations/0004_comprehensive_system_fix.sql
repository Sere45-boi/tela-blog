-- 0004_comprehensive_system_fix.sql
-- Synchronize all missing tables, columns, and functions for Pulse by Tela

-- 1. Site Settings Resilience
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

-- 2. Page Impressions (Intelligence Tracking)
CREATE TABLE IF NOT EXISTS public.page_impressions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  path text NOT NULL,
  type text DEFAULT 'page_view',
  source text DEFAULT 'direct',
  referrer text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.page_impressions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Anyone can insert page impressions" ON public.page_impressions FOR INSERT WITH CHECK (true);
  CREATE POLICY "Admins can view page impressions" ON public.page_impressions FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
EXCEPTION WHEN others THEN NULL; END $$;

-- 3. Ad Events & Tracking
CREATE TABLE IF NOT EXISTS public.ad_events (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  ad_id uuid REFERENCES public.ads(id) ON DELETE CASCADE,
  event_type text NOT NULL, -- 'impression', 'click'
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.ad_events ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Anyone can insert ad events" ON public.ad_events FOR INSERT WITH CHECK (true);
  CREATE POLICY "Admins can view ad events" ON public.ad_events FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
EXCEPTION WHEN others THEN NULL; END $$;

CREATE OR REPLACE FUNCTION public.increment_ad_impression(ad_uuid uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.ads
  SET impression_count = impression_count + 1
  WHERE id = ad_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_ad_click(ad_uuid uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.ads
  SET click_count = click_count + 1
  WHERE id = ad_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Notifications System
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id),
  type text NOT NULL, -- 'like', 'comment', 'visit', etc.
  message text NOT NULL,
  is_read boolean DEFAULT false,
  link text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users can read own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
  CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);
  CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
EXCEPTION WHEN others THEN NULL; END $$;

-- 5. Refresh PostgREST cache
NOTIFY pgrst, 'reload schema';
