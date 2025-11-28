export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export const RARITY_CONFIG = {
  common: {
    color: 'hsl(0 0% 60%)',
    label: 'Common',
    glow: 'none',
    borderStyle: 'border-border',
    bgGradient: 'from-muted/50 to-muted/30',
    textColor: 'text-muted-foreground',
    animated: false,
  },
  uncommon: {
    color: 'hsl(142 76% 36%)',
    label: 'Uncommon',
    glow: '0 0 10px hsl(142 76% 36% / 0.3)',
    borderStyle: 'border-green-600',
    bgGradient: 'from-green-950/50 to-green-900/30',
    textColor: 'text-green-400',
    animated: false,
  },
  rare: {
    color: 'hsl(217 91% 60%)',
    label: 'Rare',
    glow: '0 0 15px hsl(217 91% 60% / 0.4)',
    borderStyle: 'border-blue-500',
    bgGradient: 'from-blue-950/50 to-blue-900/30',
    textColor: 'text-blue-400',
    animated: false,
  },
  epic: {
    color: 'hsl(271 76% 53%)',
    label: 'Epic',
    glow: '0 0 20px hsl(271 76% 53% / 0.5)',
    borderStyle: 'border-purple-500',
    bgGradient: 'from-purple-950/50 to-purple-900/30',
    textColor: 'text-purple-400',
    animated: false,
  },
  legendary: {
    color: 'hsl(45 93% 47%)',
    label: 'Legendary',
    glow: '0 0 25px hsl(45 93% 47% / 0.6)',
    borderStyle: 'border-yellow-500',
    bgGradient: 'from-yellow-950/50 to-yellow-900/30',
    textColor: 'text-yellow-400',
    animated: true,
  },
} as const;

export const INDUSTRY_CATEGORIES = [
  'SaaS & Software',
  'E-commerce',
  'FinTech',
  'HealthTech',
  'EdTech',
  'Gaming',
  'AI/ML',
  'Consumer Apps',
  'B2B',
  'Marketplace',
] as const;

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
] as const;
