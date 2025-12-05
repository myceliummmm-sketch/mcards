-- Create research status enum
CREATE TYPE public.research_status AS ENUM ('locked', 'researching', 'ready', 'accepted');

-- Create verdict enum for R-05
CREATE TYPE public.research_verdict AS ENUM ('go', 'conditional_go', 'pivot', 'stop');

-- Create research_sessions table to track overall progress
CREATE TABLE public.research_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deck_id UUID NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
  current_card_slot INTEGER NOT NULL DEFAULT 6,
  status research_status NOT NULL DEFAULT 'locked',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(deck_id)
);

-- Create research_results table to store AI findings per card
CREATE TABLE public.research_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deck_id UUID NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
  card_slot INTEGER NOT NULL,
  findings JSONB NOT NULL DEFAULT '{}',
  team_comments JSONB NOT NULL DEFAULT '[]',
  sources JSONB NOT NULL DEFAULT '[]',
  rarity_scores JSONB NOT NULL DEFAULT '{}',
  final_rarity TEXT,
  verdict research_verdict,
  status research_status NOT NULL DEFAULT 'locked',
  researched_at TIMESTAMP WITH TIME ZONE,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(deck_id, card_slot)
);

-- Enable RLS
ALTER TABLE public.research_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_results ENABLE ROW LEVEL SECURITY;

-- RLS policies for research_sessions
CREATE POLICY "Users can view their own research sessions"
ON public.research_sessions
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.decks
  WHERE decks.id = research_sessions.deck_id
  AND decks.user_id = auth.uid()
));

CREATE POLICY "Users can insert their own research sessions"
ON public.research_sessions
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.decks
  WHERE decks.id = research_sessions.deck_id
  AND decks.user_id = auth.uid()
));

CREATE POLICY "Users can update their own research sessions"
ON public.research_sessions
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.decks
  WHERE decks.id = research_sessions.deck_id
  AND decks.user_id = auth.uid()
));

-- RLS policies for research_results
CREATE POLICY "Users can view their own research results"
ON public.research_results
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.decks
  WHERE decks.id = research_results.deck_id
  AND decks.user_id = auth.uid()
));

CREATE POLICY "Users can insert their own research results"
ON public.research_results
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.decks
  WHERE decks.id = research_results.deck_id
  AND decks.user_id = auth.uid()
));

CREATE POLICY "Users can update their own research results"
ON public.research_results
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.decks
  WHERE decks.id = research_results.deck_id
  AND decks.user_id = auth.uid()
));

-- Add triggers for updated_at
CREATE TRIGGER update_research_sessions_updated_at
  BEFORE UPDATE ON public.research_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_research_results_updated_at
  BEFORE UPDATE ON public.research_results
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();