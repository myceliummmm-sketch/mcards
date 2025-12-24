-- Force PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';

-- Drop and recreate passports INSERT policy with explicit AS PERMISSIVE
DROP POLICY IF EXISTS "Anyone can insert passports" ON public.passports;

CREATE POLICY "Anyone can insert passports"
ON public.passports 
AS PERMISSIVE
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Drop and recreate problem_cards INSERT policy with explicit AS PERMISSIVE
DROP POLICY IF EXISTS "Anyone can insert problem_cards" ON public.problem_cards;

CREATE POLICY "Anyone can insert problem_cards"
ON public.problem_cards 
AS PERMISSIVE
FOR INSERT
TO anon, authenticated
WITH CHECK (true);