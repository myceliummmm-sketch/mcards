import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type DeckCard = Database['public']['Tables']['deck_cards']['Row'];

export const useDeckCards = (deckId: string) => {
  const [cards, setCards] = useState<DeckCard[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const retryCount = useRef(0);
  const maxRetries = 3;
  const isFetching = useRef(false);
  const pendingRefetch = useRef(false);

  const fetchCards = useCallback(async (showError = true) => {
    if (!deckId) return;

    // Prevent concurrent fetches - queue the next one
    if (isFetching.current) {
      pendingRefetch.current = true;
      return;
    }

    isFetching.current = true;

    try {
      // Fetch all card data including images in one query
      const { data, error } = await supabase
        .from('deck_cards')
        .select('*')
        .eq('deck_id', deckId)
        .order('card_slot', { ascending: true });

      if (error) {
        // Retry on timeout
        if (error.code === '57014' && retryCount.current < maxRetries) {
          retryCount.current++;
          console.log(`Retry ${retryCount.current}/${maxRetries} after timeout...`);
          await new Promise(r => setTimeout(r, 1000 * retryCount.current));
          isFetching.current = false;
          return fetchCards(showError);
        }
        throw error;
      }

      retryCount.current = 0;
      setCards(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cards:', error);
      if (showError) {
        toast({
          title: 'Ошибка загрузки',
          description: 'Не удалось загрузить карточки. Попробуйте обновить страницу.',
          variant: 'destructive'
        });
      }
      setLoading(false);
    } finally {
      isFetching.current = false;

      // Process pending refetch if any
      if (pendingRefetch.current) {
        pendingRefetch.current = false;
        setTimeout(() => fetchCards(false), 100);
      }
    }
  }, [deckId, toast]);

  useEffect(() => {
    fetchCards();

    // Debounced refetch for realtime updates
    let debounceTimer: NodeJS.Timeout | null = null;
    const debouncedRefetch = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        fetchCards(false);
      }, 500); // Wait 500ms before refetching
    };

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
        (payload) => {
          console.log('Realtime update received:', payload.eventType);
          debouncedRefetch();
        }
      )
      .subscribe();

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      supabase.removeChannel(channel);
    };
  }, [deckId, fetchCards]);

  const saveCard = async (
    cardSlot: number, 
    cardType: string, 
    cardData: any,
    imageUrl?: string,
    evaluation?: any,
    silent?: boolean
  ) => {
    try {
      // Get existing card to preserve image/evaluation if not explicitly provided
      const existingCard = cards.find(c => c.card_slot === cardSlot);
      
      const { error } = await supabase
        .from('deck_cards')
        .upsert({
          deck_id: deckId,
          card_slot: cardSlot,
          card_type: cardType,
          card_data: cardData,
          // Preserve existing values if not explicitly provided
          card_image_url: imageUrl !== undefined ? imageUrl : (existingCard?.card_image_url || null),
          evaluation: evaluation !== undefined ? evaluation : (existingCard?.evaluation || null),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'deck_id,card_slot'
        });

      if (error) throw error;

      await fetchCards(false);

      if (!silent) {
        toast({
          title: 'Карточка сохранена',
          description: 'Изменения успешно применены'
        });
      }
    } catch (error) {
      console.error('Error saving card:', error);
      toast({
        title: 'Ошибка сохранения',
        description: 'Не удалось сохранить карточку',
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
        title: 'Карточка очищена',
        description: 'Карточка сброшена'
      });
    } catch (error) {
      console.error('Error clearing card:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось очистить карточку',
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

  const updateCardImage = async (cardSlot: number, imageUrl: string) => {
    try {
      const existingCard = cards.find(c => c.card_slot === cardSlot);
      if (!existingCard) return;

      const { error } = await supabase
        .from('deck_cards')
        .update({
          card_image_url: imageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingCard.id);

      if (error) throw error;

      toast({
        title: '✨ Изображение обновлено',
        description: 'Карточка получила новое изображение'
      });
    } catch (error) {
      console.error('Error updating card image:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить изображение',
        variant: 'destructive'
      });
    }
  };

  return {
    cards,
    loading,
    saveCard,
    clearCard,
    getCardBySlot,
    getFilledCardsCount,
    updateCardImage,
    refetch: fetchCards
  };
};
