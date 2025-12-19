/**
 * Dev Subscription Badge
 *
 * Shows a floating badge in dev mode indicating the current subscription tier.
 * Click to cycle through tiers, or use Ctrl+Shift+T.
 */

import { useState, useEffect } from 'react';
import {
  isDevModeEnabled,
  getDevSubscriptionOverride,
  cycleDevSubscriptionTier,
} from '@/lib/devSubscriptionOverride';
import { SubscriptionTier } from '@/data/subscriptionConfig';

const tierColors: Record<SubscriptionTier, string> = {
  free: 'bg-gray-600',
  pro: 'bg-purple-600',
  ultra: 'bg-amber-500',
};

const tierLabels: Record<SubscriptionTier, string> = {
  free: 'FREE',
  pro: 'PRO',
  ultra: 'ULTRA',
};

export function DevSubscriptionBadge() {
  const [tier, setTier] = useState<SubscriptionTier | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isDevModeEnabled()) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);
    setTier(getDevSubscriptionOverride());

    const handleChange = (e: CustomEvent<{ tier: SubscriptionTier | null }>) => {
      setTier(e.detail.tier);
    };

    window.addEventListener('dev-subscription-change', handleChange as EventListener);
    return () => {
      window.removeEventListener('dev-subscription-change', handleChange as EventListener);
    };
  }, []);

  if (!isVisible) return null;

  const currentTier = tier || 'free';

  const handleClick = () => {
    const newTier = cycleDevSubscriptionTier();
    setTier(newTier);
  };

  return (
    <button
      onClick={handleClick}
      className={`
        fixed bottom-4 left-4 z-[9999]
        px-3 py-2 rounded-lg
        ${tierColors[currentTier]}
        text-white text-xs font-bold
        shadow-lg hover:scale-105 transition-transform
        flex items-center gap-2
        cursor-pointer select-none
      `}
      title="Click to cycle tiers (or Ctrl+Shift+T)"
    >
      <span className="opacity-70">DEV</span>
      <span className="border-l border-white/30 pl-2">
        {tierLabels[currentTier]}
      </span>
    </button>
  );
}
