-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create a security definer function to safely check if a user should see a profile
-- This allows viewing profiles of: self, collaborators on shared decks, or comment authors
CREATE OR REPLACE FUNCTION public.can_view_profile(profile_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    -- User can always view their own profile
    auth.uid() = profile_user_id
    OR
    -- User can view profiles of collaborators on their decks
    EXISTS (
      SELECT 1 FROM deck_collaborators dc
      JOIN decks d ON d.id = dc.deck_id
      WHERE dc.user_id = profile_user_id
      AND d.user_id = auth.uid()
    )
    OR
    -- User can view profiles of deck owners they collaborate with
    EXISTS (
      SELECT 1 FROM deck_collaborators dc
      JOIN decks d ON d.id = dc.deck_id
      WHERE d.user_id = profile_user_id
      AND dc.user_id = auth.uid()
    )
    OR
    -- User can view profiles of comment authors on their cards
    EXISTS (
      SELECT 1 FROM card_comments cc
      JOIN deck_cards dc ON dc.id = cc.card_id
      JOIN decks d ON d.id = dc.deck_id
      WHERE cc.author_id = profile_user_id
      AND d.user_id = auth.uid()
    )
    OR
    -- User can view profiles of other commenters on cards they can access
    EXISTS (
      SELECT 1 FROM card_comments cc
      JOIN deck_cards dc ON dc.id = cc.card_id
      JOIN decks d ON d.id = dc.deck_id
      JOIN deck_collaborators dcol ON dcol.deck_id = d.id
      WHERE cc.author_id = profile_user_id
      AND dcol.user_id = auth.uid()
    )
$$;

-- Create new restrictive policy using the security definer function
CREATE POLICY "Users can view relevant profiles"
ON public.profiles
FOR SELECT
USING (public.can_view_profile(id));