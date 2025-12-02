// Subscription tier configuration
export const SUBSCRIPTION_TIERS = {
  free: 'free',
  pro: 'pro',
} as const;

export type SubscriptionTier = typeof SUBSCRIPTION_TIERS[keyof typeof SUBSCRIPTION_TIERS];

// Stripe product and price IDs
export const STRIPE_CONFIG = {
  pro: {
    product_id: 'prod_TX0ugwhZbz8zLD',
    price_id: 'price_1SZwsNKp2fw6elhvTYBWq1QW',
    price_usd: 29,
  },
} as const;

// Phase access configuration
export const FREE_PHASES = ['vision', 'research'] as const;
export const PRO_PHASES = ['build', 'grow'] as const;
export const ALL_PHASES = [...FREE_PHASES, ...PRO_PHASES] as const;

// AI Advisor access configuration
export const FREE_ADVISORS = ['evergreen', 'prisma', 'phoenix'] as const;
export const PRO_ADVISORS = ['toxic', 'techpriest', 'virgilia', 'zen'] as const;
export const ALL_ADVISORS = [...FREE_ADVISORS, ...PRO_ADVISORS] as const;

// Feature limits per tier
export const SUBSCRIPTION_FEATURES = {
  free: {
    phases: FREE_PHASES,
    advisors: FREE_ADVISORS,
    projectLimit: 1,
    canSellOnMarketplace: false,
    monthlySpore: 0,
  },
  pro: {
    phases: ALL_PHASES,
    advisors: ALL_ADVISORS,
    projectLimit: 5,
    canSellOnMarketplace: true,
    monthlySpore: 200,
  },
} as const;

// Helper functions
export function canAccessPhase(tier: SubscriptionTier, phase: string): boolean {
  const features = SUBSCRIPTION_FEATURES[tier];
  return (features.phases as readonly string[]).includes(phase);
}

export function canUseAdvisor(tier: SubscriptionTier, advisorId: string): boolean {
  const features = SUBSCRIPTION_FEATURES[tier];
  return (features.advisors as readonly string[]).includes(advisorId);
}

export function getProjectLimit(tier: SubscriptionTier): number {
  return SUBSCRIPTION_FEATURES[tier].projectLimit;
}

export function canSellOnMarketplace(tier: SubscriptionTier): boolean {
  return SUBSCRIPTION_FEATURES[tier].canSellOnMarketplace;
}
