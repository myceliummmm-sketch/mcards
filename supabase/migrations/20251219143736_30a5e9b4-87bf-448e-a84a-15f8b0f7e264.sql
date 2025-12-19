-- Create deck_invitations table
CREATE TABLE public.deck_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id uuid NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
  inviter_id uuid NOT NULL,
  invitee_email text NOT NULL,
  role text NOT NULL DEFAULT 'reviewer' CHECK (role IN ('reviewer', 'editor')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz
);

-- Enable RLS
ALTER TABLE public.deck_invitations ENABLE ROW LEVEL SECURITY;

-- Deck owners can create invitations
CREATE POLICY "Deck owners can create invitations"
ON public.deck_invitations
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.decks
    WHERE decks.id = deck_invitations.deck_id
    AND decks.user_id = auth.uid()
  )
  AND inviter_id = auth.uid()
);

-- Deck owners can view invitations for their decks
CREATE POLICY "Deck owners can view their deck invitations"
ON public.deck_invitations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.decks
    WHERE decks.id = deck_invitations.deck_id
    AND decks.user_id = auth.uid()
  )
);

-- Deck owners can delete invitations
CREATE POLICY "Deck owners can delete invitations"
ON public.deck_invitations
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.decks
    WHERE decks.id = deck_invitations.deck_id
    AND decks.user_id = auth.uid()
  )
);

-- Invitees can view invitations sent to them (by email match with their auth email)
CREATE POLICY "Invitees can view their invitations"
ON public.deck_invitations
FOR SELECT
USING (
  invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Invitees can update their invitation status (accept/decline)
CREATE POLICY "Invitees can respond to invitations"
ON public.deck_invitations
FOR UPDATE
USING (
  invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid())
)
WITH CHECK (
  invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Create index for faster lookups
CREATE INDEX idx_deck_invitations_deck_id ON public.deck_invitations(deck_id);
CREATE INDEX idx_deck_invitations_invitee_email ON public.deck_invitations(invitee_email);
CREATE INDEX idx_deck_invitations_status ON public.deck_invitations(status);