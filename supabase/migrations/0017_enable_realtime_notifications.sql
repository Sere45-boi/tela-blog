-- 0017_enable_realtime_notifications.sql
-- Enable realtime for notifications table and optimize RLS for admin access

-- 1. Enable Realtime
-- We use a DO block to safely add the table to the publication without erroring if it's already there
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;

-- 2. Optimize RLS Policies for Notifications
-- The previous 'EXISTS' check might be slow for realtime subscriptions.
-- Using a security definer function or a more direct role check is often better.

-- Redefine SELECT policy
DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;
CREATE POLICY "Admins and owners can view notifications" 
ON public.notifications FOR SELECT 
USING (
  auth.uid() = user_id 
  OR 
  (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
);

-- Ensure Insert is allowed for system events (already exists but re-affirming)
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "System can insert notifications" 
ON public.notifications FOR INSERT 
WITH CHECK (true);

-- Ensure Update is allowed for marking as read
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Admins and owners can update notifications" 
ON public.notifications FOR UPDATE 
USING (
  auth.uid() = user_id 
  OR 
  (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
);

-- Refresh cache
NOTIFY pgrst, 'reload schema';
