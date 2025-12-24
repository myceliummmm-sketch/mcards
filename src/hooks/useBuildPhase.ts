import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getCardsByPhase } from '@/data/cardDefinitions';
import type { Database } from '@/integrations/supabase/types';
import type { Rarity } from '@/data/rarityConfig';

type DeckCard = Database['public']['Tables']['deck_cards']['Row'];

export interface CardScore {
  score: number;
  rarity: Rarity;
  details: Record<string, number>;
  feedback: string;
}

export interface BuildScore {
  overallScore: number;
  rarity: { name: string; nameLocalized: string; emoji: string };
  cardScores: Record<number, { score: number; details: Record<string, number>; feedback: string }>;
  coherenceCheck: Record<string, boolean>;
}

export type BuildMode = 'auto' | 'hybrid' | 'manual';

export interface CardWarning {
  type: string;
  message: string;
  field?: string;
}

// Helper to convert score to rarity
function scoreToRarity(score: number): Rarity {
  // BUILD uses 0-100 scale, convert to rarity
  if (score >= 90) return 'legendary';
  if (score >= 75) return 'epic';
  if (score >= 50) return 'rare';
  if (score >= 30) return 'uncommon';
  return 'common';
}

interface UseBuildPhaseParams {
  deckId: string;
  cards: DeckCard[];
  language: string;
  onRefresh?: () => Promise<void> | void;
}

interface UseBuildPhaseReturn {
  // State
  generatingSlots: number[];
  isGenerating: boolean;
  buildScore: BuildScore | null;
  isEvaluating: boolean;
  cardWarnings: Record<number, CardWarning[]>;
  buildMode: BuildMode;
  filledCount: number;
  definitions: ReturnType<typeof getCardsByPhase>;

  // Setters
  setBuildMode: (mode: BuildMode) => void;

  // Handlers
  evaluateBuildPhase: () => Promise<void>;
  generateBuildCard: (cardSlot: number) => Promise<void>;
  generateAllBuildCards: () => Promise<void>;

  // Helpers
  getCardScore: (slot: number) => CardScore | null;
  getCardRarity: (slot: number) => Rarity | null;
  getCardFeedback: (slot: number) => string | null;
}

export function useBuildPhase({
  deckId,
  cards,
  language,
  onRefresh
}: UseBuildPhaseParams): UseBuildPhaseReturn {
  const { toast } = useToast();
  const definitions = getCardsByPhase('build');

  // State
  const [generatingSlots, setGeneratingSlots] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [buildScore, setBuildScore] = useState<BuildScore | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [cardWarnings, setCardWarnings] = useState<Record<number, CardWarning[]>>({});
  const [buildMode, setBuildMode] = useState<BuildMode>('hybrid');

  // Computed
  const filledCount = definitions.filter(def =>
    cards.some(c => c.card_slot === def.slot && c.card_data && Object.keys(c.card_data as object).length > 0)
  ).length;

  // Evaluate BUILD phase with AI
  const evaluateBuildPhase = useCallback(async () => {
    if (isEvaluating || filledCount < 5) return;

    setIsEvaluating(true);
    try {
      const { data, error } = await supabase.functions.invoke('build-evaluate', {
        body: { deckId, language }
      });

      if (error) throw error;
      if (data?.success) {
        setBuildScore(data);
      }
    } catch (error) {
      console.error('[BUILD] Evaluation error:', error);
    } finally {
      setIsEvaluating(false);
    }
  }, [deckId, language, isEvaluating, filledCount]);

  // Generate a single BUILD card
  const generateBuildCard = useCallback(async (cardSlot: number) => {
    if (generatingSlots.includes(cardSlot)) return;

    setGeneratingSlots(prev => [...prev, cardSlot]);

    try {
      toast({
        title: language === 'ru' ? '🔧 Генерация карточки...' : '🔧 Generating card...',
        description: language === 'ru'
          ? 'AI анализирует Vision и Research данные'
          : 'AI is analyzing Vision and Research data',
      });

      console.log('[BUILD UI] Calling build-generate for slot:', cardSlot);

      const { data, error } = await supabase.functions.invoke('build-generate', {
        body: { deckId, cardSlot, language }
      });

      console.log('[BUILD UI] Response:', { data, error });

      if (error) throw error;

      if (data?.cardData) {
        // Get existing card or create new
        const existingCard = cards.find(c => c.card_slot === cardSlot);

        if (existingCard) {
          const { error: updateError } = await supabase
            .from('deck_cards')
            .update({
              card_data: data.cardData,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingCard.id);

          if (updateError) throw updateError;
        } else {
          const cardDef = definitions.find(d => d.slot === cardSlot);
          const { error: insertError } = await supabase
            .from('deck_cards')
            .insert({
              deck_id: deckId,
              card_slot: cardSlot,
              card_type: cardDef?.id || 'build',
              card_data: data.cardData
            });

          if (insertError) throw insertError;
        }

        // Trigger refresh to update UI
        if (onRefresh) {
          console.log('[BUILD UI] Triggering refresh...');
          await onRefresh();
        }

        // Handle Toxic Validation warnings
        if (data.warnings && data.warnings.length > 0) {
          setCardWarnings(prev => ({
            ...prev,
            [cardSlot]: data.warnings
          }));

          // Show warning toast
          const warningCount = data.warnings.length;
          toast({
            title: language === 'ru'
              ? `⚠️ Карточка готова (${warningCount} предупреждений)`
              : `⚠️ Card ready (${warningCount} warnings)`,
            description: data.warnings[0].message,
            variant: 'destructive',
          });
        } else {
          // Clear any previous warnings for this slot
          setCardWarnings(prev => {
            const updated = { ...prev };
            delete updated[cardSlot];
            return updated;
          });

          toast({
            title: language === 'ru' ? '✅ Карточка готова!' : '✅ Card ready!',
            description: language === 'ru'
              ? 'Нажмите чтобы редактировать'
              : 'Click to edit',
          });
        }
      } else {
        throw new Error('No card data returned');
      }
    } catch (error) {
      console.error('Build generation error:', error);
      toast({
        title: language === 'ru' ? '❌ Ошибка генерации' : '❌ Generation error',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setGeneratingSlots(prev => prev.filter(s => s !== cardSlot));
    }
  }, [deckId, language, cards, definitions, generatingSlots, onRefresh, toast]);

  // Generate all BUILD cards sequentially
  const generateAllBuildCards = useCallback(async () => {
    if (isGenerating) return;

    setIsGenerating(true);

    toast({
      title: language === 'ru' ? '🚀 Генерация BUILD фазы' : '🚀 Generating BUILD phase',
      description: language === 'ru'
        ? 'Создаём все 5 карточек последовательно...'
        : 'Creating all 5 cards sequentially...',
    });

    try {
      // Generate cards in order (11 -> 15)
      for (const slot of [11, 12, 13, 14, 15]) {
        await generateBuildCard(slot);
        // Small delay between cards
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      toast({
        title: language === 'ru' ? '🎉 BUILD фаза готова!' : '🎉 BUILD phase complete!',
        description: language === 'ru'
          ? 'Все карточки сгенерированы. Проверьте и отредактируйте.'
          : 'All cards generated. Review and edit as needed.',
      });
    } catch (error) {
      console.error('Build all error:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating, language, generateBuildCard, toast]);

  // Auto-evaluate when all 5 cards are filled
  useEffect(() => {
    if (filledCount === 5 && !buildScore && !isEvaluating) {
      evaluateBuildPhase();
    }
  }, [filledCount, buildScore, isEvaluating, evaluateBuildPhase]);

  // Helper: Get card score with rarity
  const getCardScore = useCallback((slot: number): CardScore | null => {
    if (!buildScore?.cardScores?.[slot]) return null;
    const scoreData = buildScore.cardScores[slot];
    return {
      score: scoreData.score,
      rarity: scoreToRarity(scoreData.score),
      details: scoreData.details,
      feedback: scoreData.feedback,
    };
  }, [buildScore]);

  // Helper: Get just the rarity for a card
  const getCardRarity = useCallback((slot: number): Rarity | null => {
    const scoreData = buildScore?.cardScores?.[slot];
    if (!scoreData) return null;
    return scoreToRarity(scoreData.score);
  }, [buildScore]);

  // Helper: Get feedback for a card
  const getCardFeedback = useCallback((slot: number): string | null => {
    return buildScore?.cardScores?.[slot]?.feedback || null;
  }, [buildScore]);

  return {
    // State
    generatingSlots,
    isGenerating,
    buildScore,
    isEvaluating,
    cardWarnings,
    buildMode,
    filledCount,
    definitions,

    // Setters
    setBuildMode,

    // Handlers
    evaluateBuildPhase,
    generateBuildCard,
    generateAllBuildCards,

    // Helpers
    getCardScore,
    getCardRarity,
    getCardFeedback,
  };
}
