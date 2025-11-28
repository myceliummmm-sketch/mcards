import { MarketplaceCard as MarketplaceCardComponent } from './MarketplaceCard';
import { MarketplaceCard } from '@/data/mockMarketplaceData';

interface CardGridProps {
  cards: MarketplaceCard[];
  ownedCardIds: string[];
  favoritedCardIds: string[];
  gapPhases: string[];
  onBuy: (cardId: string) => void;
  onQuickView: (card: MarketplaceCard) => void;
  onFavorite: (cardId: string) => void;
}

export const CardGrid = ({
  cards,
  ownedCardIds,
  favoritedCardIds,
  gapPhases,
  onBuy,
  onQuickView,
  onFavorite,
}: CardGridProps) => {
  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-bold mb-2">No cards found</h3>
        <p className="text-muted-foreground">
          Try adjusting your filters or search terms
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {cards.map((card) => (
        <MarketplaceCardComponent
          key={card.id}
          card={card}
          onBuy={() => onBuy(card.id)}
          onQuickView={() => onQuickView(card)}
          onFavorite={() => onFavorite(card.id)}
          isInCollection={ownedCardIds.includes(card.id)}
          isFavorited={favoritedCardIds.includes(card.id)}
          fillsGap={gapPhases.includes(card.phase)}
        />
      ))}
    </div>
  );
};
