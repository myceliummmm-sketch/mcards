import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface CardProgress {
  slot: number;
  title: string;
  status: 'pending' | 'generating' | 'complete';
  characterId?: string;
  stage?: 'content' | 'image' | 'evaluation';
}

const CARD_CONFIG = [
  { slot: 2, title: 'PROBLEM', characterId: 'evergreen' },
  { slot: 3, title: 'AUDIENCE', characterId: 'prisma' },
  { slot: 4, title: 'VALUE', characterId: 'phoenix' },
  { slot: 5, title: 'VISION', characterId: 'techpriest' },
];

export function useAutoCompleteVision(deckId: string, onCardComplete?: () => void) {
  const [isActive, setIsActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [cardProgress, setCardProgress] = useState<CardProgress[]>([]);
  const { toast } = useToast();
  const { language } = useLanguage();

  const startAutoComplete = useCallback(async (card1Data: Record<string, any>) => {
    setIsActive(true);
    setIsComplete(false);
    setCardProgress(CARD_CONFIG.map(c => ({ ...c, status: 'pending' })));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auto-complete-vision`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ deckId, card1Data, language }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to start generation');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = JSON.parse(line.slice(6));

          if (data.type === 'progress') {
            setCardProgress(prev => prev.map(c => 
              c.slot === data.slot 
                ? { ...c, status: 'generating', characterId: data.characterId, stage: data.stage } 
                : c
            ));
          } else if (data.type === 'complete') {
            setCardProgress(prev => prev.map(c => 
              c.slot === data.slot ? { ...c, status: 'complete' } : c
            ));
            // Immediately trigger refresh when a card is complete
            onCardComplete?.();
          } else if (data.type === 'finished') {
            setIsComplete(true);
            // Final refresh to ensure all cards are loaded
            onCardComplete?.();
          } else if (data.type === 'error') {
            toast({ title: 'Error', description: data.error, variant: 'destructive' });
          }
        }
      }
    } catch (error) {
      console.error('Auto-complete error:', error);
      toast({ 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'Failed to generate cards',
        variant: 'destructive' 
      });
      setIsActive(false);
    }
  }, [deckId, language, toast, onCardComplete]);

  const dismiss = useCallback(() => {
    setIsActive(false);
    setIsComplete(false);
    setCardProgress([]);
  }, []);

  return {
    isActive,
    isComplete,
    cardProgress,
    startAutoComplete,
    dismiss,
  };
}
