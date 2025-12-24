-- Drop and recreate INSERT policies with explicit roles for passports
DROP POLICY IF EXISTS "Anyone can insert passports" ON public.passports;

CREATE POLICY "Anyone can insert passports"
ON public.passports FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Drop and recreate INSERT policies with explicit roles for problem_cards
DROP POLICY IF EXISTS "Anyone can insert problem_cards" ON public.problem_cards;

CREATE POLICY "Anyone can insert problem_cards"
ON public.problem_cards FOR INSERT
TO anon, authenticated
WITH CHECK (true);