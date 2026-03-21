-- 0011_dashboard_analytics_rls.sql
-- Grant authors access to view analytics and page impressions on the dashboard

-- 1. Analytics Table
DROP POLICY IF EXISTS "Only admin can view analytics." ON public.analytics;
CREATE POLICY "Admins and Authors can view analytics." ON public.analytics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'author')
  )
);

-- 2. Page Impressions Table
DROP POLICY IF EXISTS "Admins can view page impressions" ON public.page_impressions;
CREATE POLICY "Admins and Authors can view page impressions" ON public.page_impressions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'author')
  )
);

-- 3. Ads Table
-- Currently ads might not have an explicit SELECT restriction, but ensuring safety
DROP POLICY IF EXISTS "Admins and Authors can view ads" ON public.ads;
CREATE POLICY "Admins and Authors can view ads" ON public.ads
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'author')
  )
);

-- Refresh PostgREST cache
NOTIFY pgrst, 'reload schema';
