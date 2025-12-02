import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  SubscriptionTier, 
  SUBSCRIPTION_TIERS,
  canAccessPhase,
  canUseAdvisor,
  getProjectLimit,
  canSellOnMarketplace,
} from '@/data/subscriptionConfig';

interface Subscription {
  tier: SubscriptionTier;
  sporeBalance: number;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  expiresAt: string | null;
}

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  loading: boolean;
  error: string | null;
  isPro: boolean;
  tier: SubscriptionTier;
  sporeBalance: number;
  canAccessPhase: (phase: string) => boolean;
  canUseAdvisor: (advisorId: string) => boolean;
  projectLimit: number;
  canSellOnMarketplace: boolean;
  refetch: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    try {
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setSubscription(null);
        setLoading(false);
        return;
      }

      const { data, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (subError) {
        console.error('Error fetching subscription:', subError);
        setError(subError.message);
        // Default to free tier on error
        setSubscription({
          tier: SUBSCRIPTION_TIERS.free,
          sporeBalance: 0,
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          expiresAt: null,
        });
      } else if (data) {
        setSubscription({
          tier: data.tier as SubscriptionTier,
          sporeBalance: data.spore_balance,
          stripeCustomerId: data.stripe_customer_id,
          stripeSubscriptionId: data.stripe_subscription_id,
          expiresAt: data.expires_at,
        });
      } else {
        // No subscription record, default to free
        setSubscription({
          tier: SUBSCRIPTION_TIERS.free,
          sporeBalance: 0,
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          expiresAt: null,
        });
      }
    } catch (err) {
      console.error('Error in useSubscription:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();

    // Listen for auth changes
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(() => {
      fetchSubscription();
    });

    return () => {
      authSub.unsubscribe();
    };
  }, [fetchSubscription]);

  const tier = subscription?.tier || SUBSCRIPTION_TIERS.free;
  const isPro = tier === SUBSCRIPTION_TIERS.pro;

  return {
    subscription,
    loading,
    error,
    isPro,
    tier,
    sporeBalance: subscription?.sporeBalance || 0,
    canAccessPhase: (phase: string) => canAccessPhase(tier, phase),
    canUseAdvisor: (advisorId: string) => canUseAdvisor(tier, advisorId),
    projectLimit: getProjectLimit(tier),
    canSellOnMarketplace: canSellOnMarketplace(tier),
    refetch: fetchSubscription,
  };
}
