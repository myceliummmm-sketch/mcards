-- Create subscription tier enum
CREATE TYPE public.subscription_tier AS ENUM ('free', 'pro');

-- Create SPORE transaction type enum
CREATE TYPE public.spore_transaction_type AS ENUM ('subscription_credit', 'purchase', 'sale', 'bonus', 'refund');

-- User subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  tier subscription_tier DEFAULT 'free' NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  spore_balance INTEGER DEFAULT 0 NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on user_subscriptions
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription
CREATE POLICY "Users can view their own subscription"
ON public.user_subscriptions FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own subscription (for spore balance changes via app)
CREATE POLICY "Users can update their own subscription"
ON public.user_subscriptions FOR UPDATE
USING (auth.uid() = user_id);

-- Service role can manage all subscriptions (for webhooks)
CREATE POLICY "Service role can manage subscriptions"
ON public.user_subscriptions FOR ALL
USING (auth.role() = 'service_role');

-- SPORE transactions table (audit trail)
CREATE TABLE public.spore_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  transaction_type spore_transaction_type NOT NULL,
  description TEXT,
  reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on spore_transactions
ALTER TABLE public.spore_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view their own transactions"
ON public.spore_transactions FOR SELECT
USING (auth.uid() = user_id);

-- Service role can insert transactions
CREATE POLICY "Service role can insert transactions"
ON public.spore_transactions FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Marketplace listing status enum
CREATE TYPE public.marketplace_listing_status AS ENUM ('active', 'sold', 'removed');

-- Marketplace listings table
CREATE TABLE public.marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL,
  card_id UUID REFERENCES public.deck_cards(id) ON DELETE CASCADE NOT NULL,
  price_spore INTEGER NOT NULL CHECK (price_spore > 0),
  price_usd DECIMAL(10,2),
  status marketplace_listing_status DEFAULT 'active' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  sold_at TIMESTAMPTZ
);

-- Enable RLS on marketplace_listings
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

-- Anyone can view active listings
CREATE POLICY "Anyone can view active listings"
ON public.marketplace_listings FOR SELECT
USING (status = 'active' OR seller_id = auth.uid());

-- Sellers can create listings (PRO only - enforced at app level)
CREATE POLICY "Users can create their own listings"
ON public.marketplace_listings FOR INSERT
WITH CHECK (auth.uid() = seller_id);

-- Sellers can update their own listings
CREATE POLICY "Sellers can update their own listings"
ON public.marketplace_listings FOR UPDATE
USING (auth.uid() = seller_id);

-- Marketplace purchases table
CREATE TABLE public.marketplace_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.marketplace_listings(id) NOT NULL,
  buyer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  price_spore INTEGER NOT NULL,
  platform_fee_spore INTEGER NOT NULL,
  seller_earnings_spore INTEGER NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on marketplace_purchases
ALTER TABLE public.marketplace_purchases ENABLE ROW LEVEL SECURITY;

-- Buyers and sellers can view their purchases
CREATE POLICY "Users can view their purchases"
ON public.marketplace_purchases FOR SELECT
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Service role can insert purchases
CREATE POLICY "Service role can insert purchases"
ON public.marketplace_purchases FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Create trigger for updated_at on user_subscriptions
CREATE TRIGGER update_user_subscriptions_updated_at
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Function to create subscription record for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_subscriptions (user_id, tier, spore_balance)
  VALUES (NEW.id, 'free', 0);
  RETURN NEW;
END;
$$;

-- Trigger to create subscription for new users
CREATE TRIGGER on_auth_user_created_subscription
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_subscription();