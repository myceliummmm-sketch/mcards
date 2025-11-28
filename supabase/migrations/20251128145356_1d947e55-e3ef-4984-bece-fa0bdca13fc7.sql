-- Create enum for collaborator roles
CREATE TYPE public.collaborator_role AS ENUM ('reviewer', 'editor');

-- Create enum for review status
CREATE TYPE public.review_status AS ENUM ('pending', 'in_progress', 'completed');

-- Create enum for comment types
CREATE TYPE public.comment_type AS ENUM ('comment', 'suggestion', 'approval');

-- Create deck_collaborators table
CREATE TABLE public.deck_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role collaborator_role NOT NULL DEFAULT 'reviewer',
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(deck_id, user_id)
);

-- Create card_reviews table
CREATE TABLE public.card_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES public.deck_cards(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status review_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(card_id, reviewer_id)
);

-- Create card_comments table
CREATE TABLE public.card_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES public.deck_cards(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  comment_type comment_type NOT NULL DEFAULT 'comment',
  field_name TEXT,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.deck_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for deck_collaborators

-- Deck owners can view collaborators on their decks
CREATE POLICY "Deck owners can view their deck collaborators"
ON public.deck_collaborators
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.decks
    WHERE decks.id = deck_collaborators.deck_id
    AND decks.user_id = auth.uid()
  )
);

-- Collaborators can view their own collaboration records
CREATE POLICY "Collaborators can view their own records"
ON public.deck_collaborators
FOR SELECT
USING (user_id = auth.uid());

-- Deck owners can add collaborators
CREATE POLICY "Deck owners can add collaborators"
ON public.deck_collaborators
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.decks
    WHERE decks.id = deck_collaborators.deck_id
    AND decks.user_id = auth.uid()
  )
);

-- Deck owners can remove collaborators
CREATE POLICY "Deck owners can remove collaborators"
ON public.deck_collaborators
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.decks
    WHERE decks.id = deck_collaborators.deck_id
    AND decks.user_id = auth.uid()
  )
);

-- RLS Policies for card_reviews

-- Reviewers can view reviews assigned to them
CREATE POLICY "Reviewers can view their assigned reviews"
ON public.card_reviews
FOR SELECT
USING (reviewer_id = auth.uid());

-- Card owners can view reviews on their cards
CREATE POLICY "Card owners can view reviews on their cards"
ON public.card_reviews
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.deck_cards
    JOIN public.decks ON decks.id = deck_cards.deck_id
    WHERE deck_cards.id = card_reviews.card_id
    AND decks.user_id = auth.uid()
  )
);

-- Card owners can create reviews
CREATE POLICY "Card owners can create reviews"
ON public.card_reviews
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.deck_cards
    JOIN public.decks ON decks.id = deck_cards.deck_id
    WHERE deck_cards.id = card_reviews.card_id
    AND decks.user_id = auth.uid()
  )
);

-- Reviewers can update their review status
CREATE POLICY "Reviewers can update their review status"
ON public.card_reviews
FOR UPDATE
USING (reviewer_id = auth.uid());

-- RLS Policies for card_comments

-- Collaborators and owners can view comments on accessible cards
CREATE POLICY "Users can view comments on accessible cards"
ON public.card_comments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.deck_cards
    JOIN public.decks ON decks.id = deck_cards.deck_id
    WHERE deck_cards.id = card_comments.card_id
    AND (
      decks.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.deck_collaborators
        WHERE deck_collaborators.deck_id = decks.id
        AND deck_collaborators.user_id = auth.uid()
      )
    )
  )
);

-- Collaborators and owners can add comments
CREATE POLICY "Collaborators can add comments"
ON public.card_comments
FOR INSERT
WITH CHECK (
  author_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.deck_cards
    JOIN public.decks ON decks.id = deck_cards.deck_id
    WHERE deck_cards.id = card_comments.card_id
    AND (
      decks.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.deck_collaborators
        WHERE deck_collaborators.deck_id = decks.id
        AND deck_collaborators.user_id = auth.uid()
      )
    )
  )
);

-- Comment authors can update their comments
CREATE POLICY "Authors can update their comments"
ON public.card_comments
FOR UPDATE
USING (author_id = auth.uid());

-- Card owners can resolve any comment on their cards
CREATE POLICY "Card owners can resolve comments"
ON public.card_comments
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.deck_cards
    JOIN public.decks ON decks.id = deck_cards.deck_id
    WHERE deck_cards.id = card_comments.card_id
    AND decks.user_id = auth.uid()
  )
);

-- Comment authors can delete their comments
CREATE POLICY "Authors can delete their comments"
ON public.card_comments
FOR DELETE
USING (author_id = auth.uid());

-- Create trigger for updated_at on card_comments
CREATE TRIGGER update_card_comments_updated_at
BEFORE UPDATE ON public.card_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Enable realtime for collaboration
ALTER PUBLICATION supabase_realtime ADD TABLE public.card_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.deck_collaborators;