/**
 * Dev Mode Subscription Override
 *
 * Allows testing different subscription tiers locally without touching the database.
 *
 * Usage:
 *   - URL param: ?tier=pro or ?tier=ultra or ?tier=free
 *   - Keyboard shortcut: Ctrl+Shift+T to cycle through tiers
 *   - localStorage: localStorage.setItem('dev_subscription_tier', 'ultra')
 *
 * Only works when:
 *   - Running in development mode (import.meta.env.DEV)
 *   - OR when DEV_MODE_ENABLED is set in localStorage
 */

import { SubscriptionTier, SUBSCRIPTION_TIERS } from '@/data/subscriptionConfig';

const DEV_STORAGE_KEY = 'dev_subscription_tier';
const DEV_MODE_KEY = 'dev_mode_enabled';

export function isDevModeEnabled(): boolean {
  return import.meta.env.DEV || localStorage.getItem(DEV_MODE_KEY) === 'true';
}

export function enableDevMode(): void {
  localStorage.setItem(DEV_MODE_KEY, 'true');
  console.log('🔧 Dev mode enabled');
}

export function disableDevMode(): void {
  localStorage.removeItem(DEV_MODE_KEY);
  localStorage.removeItem(DEV_STORAGE_KEY);
  console.log('🔧 Dev mode disabled');
}

export function getDevSubscriptionOverride(): SubscriptionTier | null {
  if (!isDevModeEnabled()) {
    return null;
  }

  // Check URL params first (highest priority)
  const urlParams = new URLSearchParams(window.location.search);
  const urlTier = urlParams.get('tier');

  if (urlTier && isValidTier(urlTier)) {
    // Persist to localStorage so it sticks across navigation
    localStorage.setItem(DEV_STORAGE_KEY, urlTier);
    return urlTier as SubscriptionTier;
  }

  // Check localStorage
  const storedTier = localStorage.getItem(DEV_STORAGE_KEY);
  if (storedTier && isValidTier(storedTier)) {
    return storedTier as SubscriptionTier;
  }

  return null;
}

export function setDevSubscriptionTier(tier: SubscriptionTier): void {
  if (!isDevModeEnabled()) {
    console.warn('Dev mode is not enabled. Call enableDevMode() first.');
    return;
  }
  localStorage.setItem(DEV_STORAGE_KEY, tier);
  console.log(`🔧 Dev subscription set to: ${tier.toUpperCase()}`);

  // Dispatch event so React can react to the change
  window.dispatchEvent(new CustomEvent('dev-subscription-change', { detail: { tier } }));
}

export function clearDevSubscriptionOverride(): void {
  localStorage.removeItem(DEV_STORAGE_KEY);
  console.log('🔧 Dev subscription override cleared');
  window.dispatchEvent(new CustomEvent('dev-subscription-change', { detail: { tier: null } }));
}

export function cycleDevSubscriptionTier(): SubscriptionTier {
  const tiers: SubscriptionTier[] = ['free', 'pro', 'ultra'];
  const currentTier = getDevSubscriptionOverride() || 'free';
  const currentIndex = tiers.indexOf(currentTier);
  const nextIndex = (currentIndex + 1) % tiers.length;
  const nextTier = tiers[nextIndex];

  setDevSubscriptionTier(nextTier);
  return nextTier;
}

function isValidTier(tier: string): tier is SubscriptionTier {
  return Object.values(SUBSCRIPTION_TIERS).includes(tier as SubscriptionTier);
}

// Setup keyboard shortcut (Ctrl+Shift+T)
export function setupDevKeyboardShortcut(): () => void {
  if (!isDevModeEnabled()) {
    return () => {};
  }

  const handler = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'T') {
      e.preventDefault();
      const newTier = cycleDevSubscriptionTier();

      // Show a toast-like notification
      showDevNotification(`Subscription: ${newTier.toUpperCase()}`);
    }
  };

  window.addEventListener('keydown', handler);
  console.log('🔧 Dev mode: Press Ctrl+Shift+T to cycle subscription tiers');

  return () => window.removeEventListener('keydown', handler);
}

function showDevNotification(message: string): void {
  // Create or update notification element
  let notification = document.getElementById('dev-subscription-notification');

  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'dev-subscription-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      font-weight: 600;
      z-index: 99999;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      transition: opacity 0.3s, transform 0.3s;
      opacity: 0;
      transform: translateY(-10px);
    `;
    document.body.appendChild(notification);
  }

  notification.textContent = `🔧 ${message}`;
  notification.style.opacity = '1';
  notification.style.transform = 'translateY(0)';

  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-10px)';
  }, 2000);
}

// Export helper for console usage
if (typeof window !== 'undefined') {
  (window as any).devSubscription = {
    enable: enableDevMode,
    disable: disableDevMode,
    set: setDevSubscriptionTier,
    clear: clearDevSubscriptionOverride,
    cycle: cycleDevSubscriptionTier,
    get: getDevSubscriptionOverride,
  };
}
