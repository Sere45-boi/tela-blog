-- 1. Add missing bio column to profiles (Fixes Admin Profile 'bio' error)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS twitter_handle text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;

-- 2. Create site_settings table (Fixes Site Settings save errors / missing data)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id integer PRIMARY KEY DEFAULT 1,
  site_title text,
  site_tagline text,
  contact_email text,
  support_phone text,
  header_governance_text text,
  footer_description text,
  footer_copyright_text text,
  footer_link_1_label text,
  footer_link_1_url text,
  footer_link_2_label text,
  footer_link_2_url text,
  meta_keywords text,
  meta_author text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can mutate site settings" ON public.site_settings FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Initialize the defaults based on UI placeholders
INSERT INTO public.site_settings (id, site_title, site_tagline, footer_description, footer_copyright_text)
VALUES (
  1, 
  'Tela Blog', 
  'Stay updated with the latest from Tela.', 
  'Tela is the borderless financial OS for ambitious businesses in emerging markets. Built for global scale.', 
  '© 2026 Tela Blog. All rights reserved.'
) ON CONFLICT (id) DO NOTHING;

-- 3. Create ads table for Campaigns (Fixes Add Campaign Error)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ad_status') THEN
        CREATE TYPE ad_status AS ENUM ('draft', 'active', 'paused', 'completed');
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS public.ads (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  title text NOT NULL,
  image_url text NOT NULL,
  target_url text NOT NULL,
  position text NOT NULL,
  status ad_status DEFAULT 'draft'::ad_status NOT NULL,
  impression_count integer DEFAULT 0 NOT NULL,
  click_count integer DEFAULT 0 NOT NULL,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for ads
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active ads" ON public.ads FOR SELECT USING (status = 'active');
CREATE POLICY "Admins can read all ads" ON public.ads FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can mutate ads" ON public.ads FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 4. Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
