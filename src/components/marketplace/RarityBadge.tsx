import { RARITY_CONFIG, Rarity } from '@/data/rarityConfig';
import { cn } from '@/lib/utils';

interface RarityBadgeProps {
  rarity: Rarity;
  className?: string;
}

export const RarityBadge = ({ rarity, className }: RarityBadgeProps) => {
  const config = RARITY_CONFIG[rarity];

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider',
        'border backdrop-blur-sm',
        config.borderStyle,
        config.textColor,
        config.animated && 'legendary-shimmer',
        className
      )}
      style={{
        boxShadow: config.glow,
        background: `linear-gradient(135deg, ${config.color}15, ${config.color}05)`,
      }}
    >
      <div
        className="w-2 h-2 rounded-full"
        style={{
          backgroundColor: config.color,
          boxShadow: `0 0 8px ${config.color}`,
        }}
      />
      {config.label}
    </div>
  );
};
