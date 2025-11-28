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
        'relative group overflow-hidden transition-all duration-300',
        'border-2 h-[420px] flex flex-col',
        rarityConfig.borderStyle,
        fillsGap && 'gap-filler',
        'hover:scale-[1.02]'
      )}
      style={{
        boxShadow: isHovered ? rarityConfig.glow : 'none',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container - Takes most of the card space */}
      <div className="relative flex-1 overflow-hidden">
        {/* Background Image */}
        <img 
          src={card.imageUrl || `https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=500&fit=crop`}
          alt={card.title}
          className={cn(
            'absolute inset-0 w-full h-full object-cover transition-transform duration-500',
            isHovered && 'scale-110'
          )}
        />
        
        {/* Legendary shimmer overlay */}
        {rarityConfig.animated && (
          <div className="absolute inset-0 legendary-shimmer opacity-30" />
        )}

        {/* Top Gradient Overlay */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/80 via-black/50 to-transparent" />
        
        {/* Bottom Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />

        {/* Top Info Bar */}
        <div className="absolute top-2 left-2 right-2 flex items-start justify-between z-10">
          <div className="flex flex-col gap-2">
            {/* Phase Badge */}
            <Badge className={cn('text-xs border backdrop-blur-md', phaseColors[card.phase])}>
              {card.phase.toUpperCase()}
            </Badge>
            {/* Type Badge */}
            <Badge variant="outline" className="text-xs backdrop-blur-md bg-black/40 border-white/20">
              {card.cardType}
            </Badge>
          </div>

          <div className="flex flex-col gap-2 items-end">
            {/* Favorite Button */}
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                'backdrop-blur-md bg-black/40 h-8 w-8',
                isFavorited ? 'text-red-500' : 'text-white'
              )}
              onClick={(e) => {
                e.stopPropagation();
                onFavorite();
              }}
            >
              <Heart size={16} fill={isFavorited ? 'currentColor' : 'none'} />
            </Button>

            {/* Status Badges */}
            {isInCollection && (
              <div className="bg-green-500/90 border border-green-400 rounded-full px-2 py-0.5 flex items-center gap-1 text-xs text-white font-bold backdrop-blur-md">
                <Check size={12} />
                Owned
              </div>
            )}
            {fillsGap && !isInCollection && (
              <div className="bg-cyan-500/90 border border-cyan-400 rounded-full px-2 py-0.5 flex items-center gap-1 text-xs text-white font-bold backdrop-blur-md animate-pulse">
                ✨ Gap
              </div>
            )}
          </div>
        </div>

        {/* Bottom Info Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          {/* Title */}
          <h3 className="font-bold text-xl text-white mb-2 line-clamp-2 drop-shadow-lg">
            {card.title}
          </h3>

          {/* Rarity & Stats Row */}
          <div className="flex items-center justify-between mb-3">
            <RarityBadge rarity={card.rarity} className="backdrop-blur-md" />
            <div className="flex items-center gap-3 text-xs text-white/90 drop-shadow-lg">
              <div className="flex items-center gap-1">
                <Eye size={12} />
                {card.stats.views}
              </div>
              <div className="flex items-center gap-1">
                ⭐ {card.stats.avgRating}
              </div>
            </div>
          </div>

          {/* Seller & Price Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold">
                {card.seller.username[0]}
              </div>
              <span className="text-sm text-white/90 drop-shadow-lg">@{card.seller.username}</span>
            </div>
            <PriceTag price={card.price} size="md" className="drop-shadow-lg" />
          </div>

          {/* Hover Actions - Slide up from bottom */}
          <div
            className={cn(
              'flex gap-2 mt-3 transition-all duration-300',
              isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            )}
          >
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 backdrop-blur-md bg-black/60 border-white/30 text-white hover:bg-white/20" 
              onClick={onQuickView}
            >
              <Eye size={14} className="mr-1" />
              View
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-gradient-to-r from-primary to-secondary text-background font-bold"
              onClick={onBuy}
              disabled={isInCollection}
            >
              <ShoppingCart size={14} className="mr-1" />
              {isInCollection ? 'Owned' : 'Buy'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
