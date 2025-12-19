import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MarketplaceCard } from '@/data/mockMarketplaceData';
import { getCardBySlot, getLocalizedText } from '@/data/cardDefinitions';
import type { Rarity } from '@/data/rarityConfig';

export function useMarketplaceCards() {
  const [cards, setCards] = useState<MarketplaceCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchMarketplaceCards();
  }, []);

  const fetchMarketplaceCards = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUserId(session?.user?.id || null);

      // Fetch ALL cards with content from ALL decks (public marketplace)
      const { data: allCards, error: cardsError } = await supabase
        .from('deck_cards')
        .select(`
          id,
          card_slot,
          card_type,
          card_data,
          card_image_url,
          evaluation,
          created_at,
          deck_id,
          decks!inner (
            id,
            title,
            user_id
          )
        `)
        .neq('card_data', '{}')
        .order('created_at', { ascending: false });

      if (cardsError) throw cardsError;

      if (!allCards || allCards.length === 0) {
        setCards([]);
        setLoading(false);
        return;
      }

      // Get all unique user IDs
      const userIds = [...new Set(allCards.map(c => (c.decks as any)?.user_id).filter(Boolean))];
      
      // Fetch profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);

      // Map to MarketplaceCard format
      const marketplaceCards: MarketplaceCard[] = allCards.map(card => {
        const deck = card.decks as any;
        const seller = profiles?.find(p => p.id === deck?.user_id);
        const cardDef = getCardBySlot(card.card_slot);
        
        // Determine phase from card slot
        let phase: 'idea' | 'research' | 'build' | 'grow' = 'idea';
        if (card.card_slot >= 1 && card.card_slot <= 5) phase = 'idea';
        else if (card.card_slot >= 6 && card.card_slot <= 10) phase = 'research';
        else if (card.card_slot >= 11 && card.card_slot <= 17) phase = 'build';
        else if (card.card_slot >= 18 && card.card_slot <= 22) phase = 'grow';

        // Get rarity from evaluation
        const evaluation = card.evaluation as any;
        let rarity: Rarity = 'common';
        const score = evaluation?.overallScore || 0;
        if (score >= 9) rarity = 'legendary';
        else if (score >= 7) rarity = 'epic';
        else if (score >= 5) rarity = 'rare';
        else if (score >= 3) rarity = 'uncommon';

        // Calculate price based on score
        const basePrice = 50 + Math.floor(score * 40);

        const cardData = card.card_data as any;
        const title = cardDef ? getLocalizedText(cardDef.title, 'en') : `Card #${card.card_slot}`;

        // Check if it has a real generated image (not base64 or exists)
        const hasImage = card.card_image_url && 
          (card.card_image_url.startsWith('http') || card.card_image_url.startsWith('data:'));

        return {
          id: card.id,
          title: title,
          phase,
          cardType: 'insight' as const,
          rarity,
          price: basePrice,
          seller: {
            username: seller?.username || 'Anonymous',
            avatar: seller?.avatar_url || '/avatars/zen.png'
          },
          description: cardDef ? getLocalizedText(cardDef.coreQuestion, 'en') : 'Strategic card from a real project',
          industry: cardData?.industry || deck?.title || 'General',
          imageUrl: hasImage ? card.card_image_url : undefined,
          stats: {
            views: Math.floor(Math.random() * 200) + 20,
            purchases: 0,
            avgRating: score ? score / 2 : 3.5
          },
          previewData: {
            hasContent: !!cardData && Object.keys(cardData).length > 0,
            score: score,
            ownerId: deck?.user_id,
            deckTitle: deck?.title
          },
          createdAt: card.created_at
        };
      });

      setCards(marketplaceCards);
    } catch (err: any) {
      console.error('Error fetching marketplace cards:', err);
      setError(err.message);
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  const isOwnCard = (card: MarketplaceCard) => {
    return (card.previewData as any)?.ownerId === currentUserId;
  };

  return { cards, loading, error, refetch: fetchMarketplaceCards, isOwnCard, currentUserId };
}
