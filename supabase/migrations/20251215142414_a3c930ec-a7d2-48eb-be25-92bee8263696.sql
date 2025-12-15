-- Create leads table for email capture
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  source TEXT DEFAULT 'quiz_playbook',
  quiz_score INTEGER,
  quiz_blocker TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique index on email (allows same email from different sources)
CREATE UNIQUE INDEX leads_email_source_idx ON public.leads(email, source);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for non-authenticated users)
CREATE POLICY "Anyone can insert leads"
ON public.leads
FOR INSERT
WITH CHECK (true);

-- Only service role can read leads (for admin/analytics)
CREATE POLICY "Service role can read leads"
ON public.leads
FOR SELECT
USING (auth.role() = 'service_role');