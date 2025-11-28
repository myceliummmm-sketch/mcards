import { useState } from 'react';
import { Heart, Eye, ShoppingCart, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RarityBadge } from './RarityBadge';
import { PriceTag } from './PriceTag';
import { MarketplaceCard as MarketplaceCardType } from '@/data/mockMarketplaceData';
import { cn } from '@/lib/utils';
import { RARITY_CONFIG } from '@/data/rarityConfig';

interface MarketplaceCardProps {
  card: MarketplaceCardType;
  onBuy: () => void;
  onQuickView: () => void;
  onFavorite: () => void;
  isInCollection: boolean;
  isFavorited: boolean;
  fillsGap?: boolean;
}

export const MarketplaceCard = ({
  card,
  onBuy,
  onQuickView,
  onFavorite,
  isInCollection,
  isFavorited,
  fillsGap,
}: MarketplaceCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const rarityConfig = RARITY_CONFIG[card.rarity];

  const phaseColors = {
    vision: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    research: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    build: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    grow: 'bg-green-500/10 text-green-400 border-green-500/30',
  };

  const phaseIcons = {
    vision: '🔮',
    research: '🔬',
    build: '🔧',
    grow: '🚀',
  };

  return (
    <Card
      className={cn(
        'relative group overflow-hidden transition-all duration-300 hover:scale-105',
        'border-2 backdrop-blur-sm',
        rarityConfig.borderStyle,
        fillsGap && 'gap-filler',
        isHovered && 'shadow-2xl'
      )}
      style={{
        boxShadow: isHovered ? rarityConfig.glow : 'none',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Favorite Button */}
      <Button
        size="icon"
        variant="ghost"
        className={cn(
          'absolute top-2 right-2 z-10 backdrop-blur-sm',
          isFavorited ? 'text-red-500' : 'text-muted-foreground'
        )}
        onClick={(e) => {
          e.stopPropagation();
          onFavorite();
        }}
      >
        <Heart size={18} fill={isFavorited ? 'currentColor' : 'none'} />
      </Button>

      {/* Collection Badge */}
      {isInCollection && (
        <div className="absolute top-2 left-2 z-10 bg-green-500/20 border border-green-500 rounded-full px-2 py-1 flex items-center gap-1 text-xs text-green-400 font-bold backdrop-blur-sm">
          <Check size={14} />
          Owned
        </div>
      )}

      {/* Gap Filler Badge */}
      {fillsGap && (
        <div className="absolute top-2 left-2 z-10 bg-cyan-500/20 border border-cyan-500 rounded-full px-2 py-1 flex items-center gap-1 text-xs text-cyan-400 font-bold backdrop-blur-sm animate-pulse">
          ✨ Fills Gap
        </div>
      )}

      {/* Card Image/Preview */}
      <div
        className={cn(
          'relative h-48 bg-gradient-to-br overflow-hidden',
          rarityConfig.bgGradient
        )}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-6xl opacity-30">{phaseIcons[card.phase]}</div>
        </div>
        {rarityConfig.animated && (
          <div className="absolute inset-0 legendary-shimmer opacity-20" />
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-3">
        {/* Phase & Type */}
        <div className="flex items-center gap-2">
          <Badge className={cn('text-xs border', phaseColors[card.phase])}>
            {card.phase.toUpperCase()}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {card.cardType}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="font-bold text-lg line-clamp-2 text-glow">{card.title}</h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">{card.description}</p>

        {/* Rarity & Industry */}
        <div className="flex items-center justify-between">
          <RarityBadge rarity={card.rarity} />
          <span className="text-xs text-muted-foreground">{card.industry}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Eye size={14} />
            {card.stats.views}
          </div>
          <div className="flex items-center gap-1">
            <ShoppingCart size={14} />
            {card.stats.purchases}
          </div>
          <div className="flex items-center gap-1">
            ⭐ {card.stats.avgRating}
          </div>
        </div>

        {/* Seller */}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs">
            {card.seller.username[0]}
          </div>
          <span className="text-sm text-muted-foreground">@{card.seller.username}</span>
        </div>

        {/* Price & Actions */}
        <div className="flex items-center justify-between pt-2">
          <PriceTag price={card.price} size="lg" />
        </div>

        {/* Hover Actions */}
        <div
          className={cn(
            'flex gap-2 transition-all duration-300',
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          )}
        >
          <Button variant="outline" size="sm" className="flex-1" onClick={onQuickView}>
            <Eye size={14} />
            View
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-gradient-to-r from-primary to-secondary"
            onClick={onBuy}
            disabled={isInCollection}
          >
            <ShoppingCart size={14} />
            {isInCollection ? 'Owned' : 'Buy'}
          </Button>
        </div>
      </div>
    </Card>
  );
};
