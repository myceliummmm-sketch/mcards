-- Telegram integration columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS telegram_id BIGINT UNIQUE;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS telegram_username TEXT;

-- Biorobot-detector quiz results
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS quiz_blocker TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS assigned_character TEXT;

-- Onboarding progress tracking (detailed step instead of boolean)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_step TEXT DEFAULT 'new';

-- Index for fast telegram_id lookups
CREATE INDEX IF NOT EXISTS idx_profiles_telegram_id ON public.profiles(telegram_id);

-- Documentation
COMMENT ON COLUMN public.profiles.telegram_id IS 'Telegram user ID for TMA/bot integration';
COMMENT ON COLUMN public.profiles.telegram_username IS 'Telegram @username';
COMMENT ON COLUMN public.profiles.quiz_blocker IS 'Biorobot-detector quiz result blocker type';
COMMENT ON COLUMN public.profiles.assigned_character IS 'AI mentor character assigned after quiz';
COMMENT ON COLUMN public.profiles.onboarding_step IS 'User progress: new, quiz_done, vision_started, vision_complete, research, build, grow';