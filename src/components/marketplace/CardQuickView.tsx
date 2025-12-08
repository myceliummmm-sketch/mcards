import { X, ShoppingCart, Heart, Eye, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { RarityBadge } from './RarityBadge';
import { PriceTag } from './PriceTag';
import { WhyRecommended } from './WhyRecommended';
import { PhaseIcon } from '@/components/deck-builder/PhaseIcon';
import { MarketplaceCard } from '@/data/mockMarketplaceData';
import { cn } from '@/lib/utils';
import { RARITY_CONFIG } from '@/data/rarityConfig';
import type { CardPhase } from '@/data/cardDefinitions';
import { useTranslation } from '@/hooks/useTranslation';

interface CardQuickViewProps {
  card: MarketplaceCard | null;
  isOpen: boolean;
  onClose: () => void;
  onBuy: () => void;
  onFavorite: () => void;
  isInCollection: boolean;
  isFavorited: boolean;
  recommendation?: {
    score: number;
    reasons: string[];
    category: string;
  };
}

export const CardQuickView = ({
  card,
  isOpen,
  onClose,
  onBuy,
  onFavorite,
  isInCollection,
  isFavorited,
  recommendation,
}: CardQuickViewProps) => {
  const { t } = useTranslation();
  
  if (!card) return null;

  const rarityConfig = RARITY_CONFIG[card.rarity];

  const phaseColors = {
    vision: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    research: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    build: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    grow: 'bg-green-500/10 text-green-400 border-green-500/30',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Card Details</DialogTitle>
        </DialogHeader>

        {/* Hero Section - Card Preview with 5:7 ratio */}
        <div className="-mx-6 -mt-6">
          <AspectRatio ratio={5/7}>
            <div
              className={cn(
                'relative w-full h-full overflow-hidden',
                rarityConfig.borderStyle
              )}
            >
              {/* Background Image */}
              <img 
                src={card.imageUrl || `https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=500&fit=crop`}
                alt={card.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              
              {/* Legendary shimmer overlay */}
              {rarityConfig.animated && (
                <div className="absolute inset-0 legendary-shimmer opacity-30" />
              )}

              {/* Top Gradient Overlay */}
              <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/80 via-black/50 to-transparent" />
              
              {/* Bottom Gradient Overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />

              {/* Favorite Button */}
              <Button
                size="icon"
                variant="ghost"
                className={cn(
                  'absolute top-4 right-4 backdrop-blur-md bg-black/40',
                  isFavorited ? 'text-red-500' : 'text-white'
                )}
                onClick={onFavorite}
              >
                <Heart size={24} fill={isFavorited ? 'currentColor' : 'none'} />
              </Button>

              {/* Bottom Info */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">{card.title}</h2>
                <div className="flex items-center justify-between">
                  <RarityBadge rarity={card.rarity} className="backdrop-blur-md" />
                  <PriceTag price={card.price} size="md" className="drop-shadow-lg" />
                </div>
              </div>
            </div>
          </AspectRatio>
        </div>

        {/* Content */}
        <div className="space-y-6 pt-4">
          {/* Title & Badges */}
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-glow">{card.title}</h2>
            <div className="flex flex-wrap gap-2">
              <Badge className={cn('text-sm border flex items-center gap-1', phaseColors[card.phase])}>
                <PhaseIcon phase={card.phase as CardPhase} size="sm" />
                {t(`phases.${card.phase}`).toUpperCase()}
              </Badge>
              <Badge variant="outline" className="text-sm capitalize">
                {card.cardType}
              </Badge>
              <RarityBadge rarity={card.rarity} />
            </div>
          </div>

          {/* Recommendation Section */}
          {recommendation && (
            <>
              <WhyRecommended
                reasons={recommendation.reasons}
                matchScore={recommendation.score}
                category={recommendation.category}
              />
              <Separator />
            </>
          )}

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed">{card.description}</p>

          <Separator />

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <Eye size={16} />
                <span className="text-sm">{t('marketplace.views')}</span>
              </div>
              <div className="text-2xl font-bold">{card.stats.views.toLocaleString()}</div>
            </div>
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <ShoppingCart size={16} />
                <span className="text-sm">{t('marketplace.purchases')}</span>
              </div>
              <div className="text-2xl font-bold">{card.stats.purchases.toLocaleString()}</div>
            </div>
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <Star size={16} />
                <span className="text-sm">{t('marketplace.rating')}</span>
              </div>
              <div className="text-2xl font-bold">{card.stats.avgRating.toFixed(1)}</div>
            </div>
          </div>

          <Separator />

          {/* Seller Info */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-lg font-bold">
                {card.seller.username[0]}
              </div>
              <div>
                <div className="text-sm text-muted-foreground">{t('marketplace.createdBy')}</div>
                <div className="font-medium">@{card.seller.username}</div>
              </div>
            </div>
            <Badge variant="outline">{card.industry}</Badge>
          </div>

          {/* Preview Data */}
          {card.previewData && (
            <div className="p-4 bg-muted/20 rounded-lg">
              <h4 className="text-sm font-semibold mb-2 text-muted-foreground">{t('marketplace.whatsInside')}</h4>
              <div className="flex flex-wrap gap-3">
                {Object.entries(card.previewData).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-2xl">📦</span>
                    <span className="text-sm">
                      <span className="font-bold text-primary">{String(value)}</span>{' '}
                      <span className="text-muted-foreground">{key}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price & Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <PriceTag price={card.price} size="lg" />
            <div className="flex gap-2">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-secondary"
                onClick={onBuy}
                disabled={isInCollection}
              >
                <ShoppingCart size={18} />
                {isInCollection ? t('marketplace.alreadyOwned') : t('marketplace.buyNow')}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};