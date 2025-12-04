-- Add 'ultra' to the subscription_tier enum
ALTER TYPE public.subscription_tier ADD VALUE IF NOT EXISTS 'ultra';