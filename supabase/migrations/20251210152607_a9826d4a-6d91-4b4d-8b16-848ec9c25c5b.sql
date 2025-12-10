-- Create trigger on auth.users to create profile on signup (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- Backfill profiles for existing users who don't have one
INSERT INTO public.profiles (id, username, onboarding_completed)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'username', split_part(au.email, '@', 1)),
  false
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL;

-- Also create user_subscriptions for users who don't have one
INSERT INTO public.user_subscriptions (user_id, tier, spore_balance)
SELECT 
  au.id,
  'free',
  0
FROM auth.users au
LEFT JOIN public.user_subscriptions us ON us.user_id = au.id
WHERE us.id IS NULL;