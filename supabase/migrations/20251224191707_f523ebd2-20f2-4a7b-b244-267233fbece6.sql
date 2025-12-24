-- Drop existing INSERT policies and recreate as PERMISSIVE with explicit roles
DROP POLICY IF EXISTS "Anyone can insert passports" ON public.passports;

CREATE POLICY "Anyone can insert passports"
ON public.passports FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Same for problem_cards
DROP POLICY IF EXISTS "Anyone can insert problem_cards" ON public.problem_cards;

CREATE POLICY "Anyone can insert problem_cards"
ON public.problem_cards FOR INSERT
TO anon, authenticated
WITH CHECK (true);