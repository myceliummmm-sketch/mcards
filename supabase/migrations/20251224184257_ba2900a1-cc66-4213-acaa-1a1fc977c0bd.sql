-- Create passports table to persist user passport data
CREATE TABLE public.passports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  founder_name TEXT NOT NULL,
  archetype TEXT NOT NULL,
  passport_number TEXT UNIQUE NOT NULL,
  wallet_synced BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on passports
ALTER TABLE public.passports ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert passports (for guest users)
CREATE POLICY "Anyone can insert passports"
ON public.passports FOR INSERT
WITH CHECK (true);

-- Users can view their own passports (by email or user_id)
CREATE POLICY "Users can view own passports"
ON public.passports FOR SELECT
USING (
  user_id = auth.uid() 
  OR (user_id IS NULL AND email IS NOT NULL)
);

-- Users can update their own passports
CREATE POLICY "Users can update own passports"
ON public.passports FOR UPDATE
USING (user_id = auth.uid() OR user_id IS NULL);

-- Create problem_cards table to store generated problem cards
CREATE TABLE public.problem_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passport_id UUID REFERENCES public.passports(id) ON DELETE CASCADE NOT NULL,
  answers INTEGER[] NOT NULL,
  ai_analysis JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on problem_cards
ALTER TABLE public.problem_cards ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert problem cards
CREATE POLICY "Anyone can insert problem_cards"
ON public.problem_cards FOR INSERT
WITH CHECK (true);

-- Users can view problem_cards through their passports
CREATE POLICY "Users can view own problem_cards"
ON public.problem_cards FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.passports
    WHERE passports.id = problem_cards.passport_id
    AND (passports.user_id = auth.uid() OR passports.user_id IS NULL)
  )
);

-- Users can update their own problem_cards
CREATE POLICY "Users can update own problem_cards"
ON public.problem_cards FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.passports
    WHERE passports.id = problem_cards.passport_id
    AND (passports.user_id = auth.uid() OR passports.user_id IS NULL)
  )
);