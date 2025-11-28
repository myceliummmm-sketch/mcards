import { useState, useMemo } from 'react';
import { MarketplaceHeader } from '@/components/marketplace/MarketplaceHeader';
import { FilterBar } from '@/components/marketplace/FilterBar';
import { GapFinderSidebar } from '@/components/marketplace/GapFinderSidebar';
import { CardGrid } from '@/components/marketplace/CardGrid';
import { CardQuickView } from '@/components/marketplace/CardQuickView';
import { DeckSelector } from '@/components/marketplace/DeckSelector';
import { RecommendationSidebar } from '@/components/marketplace/RecommendationSidebar';
import { MOCK_MARKETPLACE_CARDS, MarketplaceCard } from '@/data/mockMarketplaceData';
import { Rarity } from '@/data/rarityConfig';
import { useToast } from '@/hooks/use-toast';
import { useUserDecks } from '@/hooks/useUserDecks';
import { useRecommendations } from '@/hooks/useRecommendations';

export default function Marketplace() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState('browse');
  const [selectedPhases, setSelectedPhases] = useState<string[]>([]);
  const [selectedRarities, setSelectedRarities] = useState<Rarity[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [gapFillerMode, setGapFillerMode] = useState(false);
  const [showOwned, setShowOwned] = useState(true);
  const [quickViewCard, setQuickViewCard] = useState<MarketplaceCard | null>(null);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  
  const { decks, loading: decksLoading } = useUserDecks();
  const { recommendations, deckAnalysis, isLoading: recommendationsLoading, refetch } = useRecommendations(selectedDeckId);

  // Mock user data
  const [ownedCardIds, setOwnedCardIds] = useState<string[]>(['1', '3']);
  const [favoritedCardIds, setFavoritedCardIds] = useState<string[]>(['2', '4', '8']);
  const [sellingCardIds] = useState<string[]>(['1']);

  // Mock deck gaps (for Gap Filler Mode)
  const deckGaps = [
    { phase: 'vision', filled: 3, total: 5, icon: '🔮', color: 'purple' },
    { phase: 'research', filled: 4, total: 6, icon: '🔬', color: 'blue' },
    { phase: 'build', filled: 2, total: 6, icon: '🔧', color: 'orange' },
    { phase: 'grow', filled: 5, total: 5, icon: '🚀', color: 'green' },
  ];

  const gapPhases = deckGaps.filter((g) => g.filled < g.total).map((g) => g.phase);

  // Filter and sort cards
  const filteredCards = useMemo(() => {
    let cards = [...MOCK_MARKETPLACE_CARDS];

    // View filter
    if (activeView === 'collection') {
      cards = cards.filter((c) => ownedCardIds.includes(c.id));
    } else if (activeView === 'selling') {
      cards = cards.filter((c) => sellingCardIds.includes(c.id));
    } else if (activeView === 'favorites') {
      cards = cards.filter((c) => favoritedCardIds.includes(c.id));
    }

    // Show owned filter
    if (!showOwned && activeView === 'browse') {
      cards = cards.filter((c) => !ownedCardIds.includes(c.id));
    }

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      cards = cards.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query) ||
          c.industry.toLowerCase().includes(query) ||
          c.seller.username.toLowerCase().includes(query)
      );
    }

    // Phase filter
    if (selectedPhases.length > 0) {
      cards = cards.filter((c) => selectedPhases.includes(c.phase));
    }

    // Rarity filter
    if (selectedRarities.length > 0) {
      cards = cards.filter((c) => selectedRarities.includes(c.rarity));
    }

    // Industry filter
    if (selectedIndustries.length > 0 && !selectedIndustries.includes('all')) {
      cards = cards.filter((c) => selectedIndustries.includes(c.industry));
    }

    // Gap filler mode
    if (gapFillerMode) {
      cards = cards.filter((c) => gapPhases.includes(c.phase));
    }

    // Sort
    switch (sortBy) {
      case 'recommended':
        if (selectedDeckId && recommendations.length > 0) {
          const scoreMap = new Map(recommendations.map(r => [r.cardId, r.score]));
          cards.sort((a, b) => (scoreMap.get(b.id) || 0) - (scoreMap.get(a.id) || 0));
        }
        break;
      case 'newest':
        cards.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'popular':
        cards.sort((a, b) => b.stats.purchases - a.stats.purchases);
        break;
      case 'price_asc':
        cards.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        cards.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        cards.sort((a, b) => b.stats.avgRating - a.stats.avgRating);
        break;
    }

    return cards;
  }, [
    activeView,
    searchQuery,
    selectedPhases,
    selectedRarities,
    selectedIndustries,
    sortBy,
    gapFillerMode,
    showOwned,
    ownedCardIds,
    favoritedCardIds,
    sellingCardIds,
    gapPhases,
    selectedDeckId,
    recommendations,
  ]);

  const handlePhaseToggle = (phase: string) => {
    setSelectedPhases((prev) =>
      prev.includes(phase) ? prev.filter((p) => p !== phase) : [...prev, phase]
    );
  };

  const handleRarityToggle = (rarity: Rarity) => {
    setSelectedRarities((prev) =>
      prev.includes(rarity) ? prev.filter((r) => r !== rarity) : [...prev, rarity]
    );
  };

  const handleIndustryChange = (industry: string) => {
    setSelectedIndustries(industry === 'all' ? [] : [industry]);
  };

  const handleClearFilters = () => {
    setSelectedPhases([]);
    setSelectedRarities([]);
    setSelectedIndustries([]);
    setGapFillerMode(false);
    setShowOwned(true);
  };

  const handleBuy = (cardId: string) => {
    const card = MOCK_MARKETPLACE_CARDS.find((c) => c.id === cardId);
    if (!card) return;

    setOwnedCardIds((prev) => [...prev, cardId]);
    toast({
      title: '🎉 Purchase successful!',
      description: `You now own "${card.title}"`,
    });
    setQuickViewCard(null);
  };

  const handleFavorite = (cardId: string) => {
    setFavoritedCardIds((prev) =>
      prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
    );
  };

  const handleGapPhaseClick = (phase: string) => {
    if (phase) {
      setSelectedPhases([phase]);
    } else {
      setSelectedPhases([]);
    }
  };

  const getRecommendation = (cardId: string) => {
    return recommendations.find(r => r.cardId === cardId);
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <MarketplaceHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeView={activeView}
        onViewChange={setActiveView}
        ownedCount={ownedCardIds.length}
        favoritesCount={favoritedCardIds.length}
        sellingCount={sellingCardIds.length}
      />

      <DeckSelector
        decks={decks}
        selectedDeckId={selectedDeckId}
        onDeckChange={setSelectedDeckId}
        loading={decksLoading}
      />

      <FilterBar
        selectedPhases={selectedPhases}
        selectedRarities={selectedRarities}
        selectedIndustries={selectedIndustries}
        sortBy={sortBy}
        gapFillerMode={gapFillerMode}
        showOwned={showOwned}
        hasRecommendations={selectedDeckId !== null}
        onPhaseToggle={handlePhaseToggle}
        onRarityToggle={handleRarityToggle}
        onIndustryChange={handleIndustryChange}
        onSortChange={setSortBy}
        onGapFillerToggle={() => setGapFillerMode(!gapFillerMode)}
        onShowOwnedToggle={() => setShowOwned(!showOwned)}
        onClearFilters={handleClearFilters}
      />

      <div className="flex gap-6">
        {selectedDeckId && recommendations.length > 0 && (
          <RecommendationSidebar
            recommendations={recommendations}
            deckAnalysis={deckAnalysis}
            marketplaceCards={MOCK_MARKETPLACE_CARDS}
            isLoading={recommendationsLoading}
            onRefresh={refetch}
            onCardView={setQuickViewCard}
          />
        )}

        {gapFillerMode && (
          <div className="w-80 flex-shrink-0">
            <GapFinderSidebar
              gaps={deckGaps}
              onPhaseClick={handleGapPhaseClick}
              activePhase={selectedPhases[0]}
            />
          </div>
        )}

        <div className="flex-1">
          <CardGrid
            cards={filteredCards}
            ownedCardIds={ownedCardIds}
            favoritedCardIds={favoritedCardIds}
            gapPhases={gapFillerMode ? gapPhases : []}
            onBuy={handleBuy}
            onQuickView={setQuickViewCard}
            onFavorite={handleFavorite}
          />
        </div>
      </div>

      <CardQuickView
        card={quickViewCard}
        isOpen={!!quickViewCard}
        onClose={() => setQuickViewCard(null)}
        onBuy={() => quickViewCard && handleBuy(quickViewCard.id)}
        onFavorite={() => quickViewCard && handleFavorite(quickViewCard.id)}
        isInCollection={quickViewCard ? ownedCardIds.includes(quickViewCard.id) : false}
        isFavorited={quickViewCard ? favoritedCardIds.includes(quickViewCard.id) : false}
        recommendation={quickViewCard ? getRecommendation(quickViewCard.id) : undefined}
      />
    </div>
  );
}
