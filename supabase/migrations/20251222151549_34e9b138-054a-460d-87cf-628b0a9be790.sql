-- Create table for A/B test event tracking
CREATE TABLE public.ab_test_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  session_id TEXT NOT NULL,
  variant TEXT NOT NULL CHECK (variant IN ('A', 'B')),
  event_type TEXT NOT NULL,
  page_load_time_ms INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create index for faster queries
CREATE INDEX idx_ab_test_events_session ON public.ab_test_events(session_id);
CREATE INDEX idx_ab_test_events_variant ON public.ab_test_events(variant);
CREATE INDEX idx_ab_test_events_created ON public.ab_test_events(created_at);

-- Enable RLS
ALTER TABLE public.ab_test_events ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (same pattern as leads table)
CREATE POLICY "Anyone can insert events" 
ON public.ab_test_events 
FOR INSERT 
WITH CHECK (true);

-- Only service role can read (for admin dashboard via edge function)
CREATE POLICY "Service role can read events" 
ON public.ab_test_events 
FOR SELECT 
USING (auth.role() = 'service_role');