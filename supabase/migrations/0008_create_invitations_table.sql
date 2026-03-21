-- 0008_create_invitations_table.sql
-- Create invitations table for author onboarding

CREATE TABLE IF NOT EXISTS public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role text NOT NULL DEFAULT 'author' CHECK (role IN ('author', 'admin')),
  token uuid NOT NULL DEFAULT gen_random_uuid(),
  invited_by uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  claimed_at timestamp with time zone,
  
  -- Ensure one active invitation per email at a time (simplified constraint)
  UNIQUE (email, token)
);

-- Enable RLS
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Admins can manage all invitations
CREATE POLICY "Admins can manage invitations" 
ON public.invitations 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 2. Public can read non-claimed invitations by token (for validation during signup)
CREATE POLICY "Public can read invitations by token" 
ON public.invitations 
FOR SELECT 
TO public 
USING (claimed_at IS NULL AND expires_at > now());

-- Add token index for fast lookups
CREATE INDEX IF NOT EXISTS invitations_token_idx ON public.invitations(token);
