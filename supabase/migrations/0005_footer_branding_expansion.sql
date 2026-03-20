-- 0005_footer_branding_expansion.sql
-- Expansion for Dynamic Footer and Hero Accents

ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS hero_accent_text text DEFAULT 'FINANCIAL OS FOR MODERN BUSINESS',
ADD COLUMN IF NOT EXISTS footer_products jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS footer_company jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS footer_resources jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS footer_legal jsonb DEFAULT '[]'::jsonb;

-- Update existing row with default data based on existing UI
UPDATE public.site_settings 
SET 
  hero_accent_text = 'FINANCIAL OS FOR MODERN BUSINESS',
  footer_products = '[{"label": "Payments", "url": "#"}, {"label": "Invoices", "url": "#"}, {"label": "Escrow", "url": "#"}, {"label": "Storefront", "url": "#"}]'::jsonb,
  footer_company = '[{"label": "About", "url": "#"}, {"label": "Blog", "url": "/blog"}, {"label": "Careers", "url": "#"}, {"label": "Contact", "url": "#"}]'::jsonb,
  footer_resources = '[{"label": "Help center", "url": "#"}, {"label": "Documentation", "url": "#"}, {"label": "Guides", "url": "#"}]'::jsonb,
  footer_legal = '[{"label": "Privacy Policy", "url": "#"}, {"label": "Terms of Service", "url": "#"}]'::jsonb
WHERE id = 1;

-- Refresh PostgREST cache
NOTIFY pgrst, 'reload schema';
