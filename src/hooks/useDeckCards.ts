import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type DeckCard = Database['public']['Tables']['deck_cards']['Row'];
type DeckCardInsert = Database['public']['Tables']['deck_cards']['Insert'];

export const useDeckCards = (deckId: string) => {
  const [cards, setCards] = useState<DeckCard[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCards = async () => {
    try {
      const { data, error } = await supabase
        .from('deck_cards')
        .select('*')
        .eq('deck_id', deckId)
        .order('card_slot', { ascending: true });

      if (error) throw error;
      setCards(data || []);
    } catch (error) {
      console.error('Error fetching cards:', error);
      toast({
        title: 'Error loading cards',
        description: 'Failed to load deck cards',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();

    // Subscribe to real-time changes
    const channel = supabase
      .channel(`deck_cards:${deckId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deck_cards',
          filter: `deck_id=eq.${deckId}`
        },
        () => {
          fetchCards();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [deckId]);

  const saveCard = async (cardSlot: number, cardType: string, cardData: any) => {
    try {
      const existingCard = cards.find(c => c.card_slot === cardSlot);

      if (existingCard) {
        // Update existing card
        const { error } = await supabase
          .from('deck_cards')
          .update({
            card_data: cardData,
            card_type: cardType,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingCard.id);

        if (error) throw error;
      } else {
        // Insert new card
        const newCard: DeckCardInsert = {
          deck_id: deckId,
          card_slot: cardSlot,
          card_type: cardType,
          card_data: cardData
        };

        const { error } = await supabase
          .from('deck_cards')
          .insert(newCard);

        if (error) throw error;
      }

      toast({
        title: 'Card saved',
        description: 'Your card has been updated successfully'
      });
    } catch (error) {
      console.error('Error saving card:', error);
      toast({
        title: 'Error saving card',
        description: 'Failed to save card changes',
        variant: 'destructive'
      });
    }
  };

  const clearCard = async (cardSlot: number) => {
    try {
      const existingCard = cards.find(c => c.card_slot === cardSlot);
      if (!existingCard) return;

      const { error } = await supabase
        .from('deck_cards')
        .delete()
        .eq('id', existingCard.id);

      if (error) throw error;

      toast({
        title: 'Card cleared',
        description: 'Card has been reset to empty'
      });
    } catch (error) {
      console.error('Error clearing card:', error);
      toast({
        title: 'Error clearing card',
        description: 'Failed to clear card',
        variant: 'destructive'
      });
    }
  };

  const getCardBySlot = (slot: number): DeckCard | undefined => {
    return cards.find(c => c.card_slot === slot);
  };

  const getFilledCardsCount = (): number => {
    return cards.filter(c => c.card_data && Object.keys(c.card_data).length > 0).length;
  };

  return {
    cards,
    loading,
    saveCard,
    clearCard,
    getCardBySlot,
    getFilledCardsCount
  };
};
