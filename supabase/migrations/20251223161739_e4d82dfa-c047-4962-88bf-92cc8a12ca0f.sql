-- Add new columns for Interview Wizard v2 data
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS interview_data jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS founder_fit_score integer,
ADD COLUMN IF NOT EXISTS card_rarity text,
ADD COLUMN IF NOT EXISTS selected_path text;