import { Lock, Check, Sparkles } from 'lucide-react';
import { PHASE_CONFIG, CARD_DEFINITIONS, type CardPhase, getLocalizedText } from '@/data/cardDefinitions';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PhaseIcon } from '../PhaseIcon';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Database } from '@/integrations/supabase/types';

type DeckCard = Database['public']['Tables']['deck_cards']['Row'];

interface DeckThumbnailsProps {
  cards: DeckCard[];
}

export function DeckThumbnails({ cards }: DeckThumbnailsProps) {
  const { language } = useLanguage();
  const phases: CardPhase[] = ['idea', 'research', 'build', 'grow'];

  const phaseNames: Record<CardPhase, { en: string; ru: string }> = {
    idea: { en: 'IDEA', ru: 'ИДЕЯ' },
    research: { en: 'RESEARCH', ru: 'ИССЛЕДОВАНИЕ' },
    build: { en: 'BUILD', ru: 'РАЗРАБОТКА' },
    grow: { en: 'GROW', ru: 'РОСТ' },
    pivot: { en: 'PIVOT', ru: 'ПИВОТ' },
  };

  const getCardBySlot = (slot: number) => {
    return cards.find(c => c.card_slot === slot);
  };

  const getCardDefinition = (slot: number) => {
    return CARD_DEFINITIONS.find(c => c.slot === slot);
  };

  const getCardStatus = (slot: number): 'empty' | 'in-progress' | 'forged' => {
    const card = getCardBySlot(slot);
    if (!card || !card.card_data || Object.keys(card.card_data as object).length === 0) {
      return 'empty';
    }
    if (card.evaluation) {
      return 'forged';
    }
    return 'in-progress';
  };

  const getEvaluationScore = (slot: number): number | null => {
    const card = getCardBySlot(slot);
    if (!card?.evaluation) return null;
    const eval_ = card.evaluation as { overall?: number };
    return eval_.overall ?? null;
  };

  const getCardImageUrl = (slot: number): string | null => {
    const card = getCardBySlot(slot);
    return card?.card_image_url || null;
  };

  const getPhaseProgress = (phase: CardPhase) => {
    const slots = PHASE_CONFIG[phase].slots;
    const filled = slots.filter(slot => getCardStatus(slot) !== 'empty').length;
    return { filled, total: slots.length };
  };

  return (
    <TooltipProvider>
      <div className="bg-card/50 rounded-xl border border-border p-4">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">
            {language === 'ru' ? 'Твоя коллекция карт' : 'Your Deck Collection'}
          </h3>
        </div>

        <div className="space-y-4">
          {phases.map(phase => {
            const config = PHASE_CONFIG[phase];
            const progress = getPhaseProgress(phase);
            
            return (
              <div key={phase} className="space-y-2">
                {/* Phase header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PhaseIcon phase={phase} size="sm" />
                    <span className="text-sm font-medium text-foreground">
                      {phaseNames[phase][language]}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {progress.filled}/{progress.total} {language === 'ru' ? 'создано' : 'crafted'}
                  </span>
                </div>

                {/* Card thumbnails */}
                <div className="flex gap-2 flex-wrap">
                  {config.slots.map(slot => {
                    const status = getCardStatus(slot);
                    const definition = getCardDefinition(slot);
                    const score = getEvaluationScore(slot);
                    const imageUrl = getCardImageUrl(slot);

                    return (
                      <Tooltip key={slot}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              'relative w-12 h-16 rounded-md overflow-hidden transition-all duration-200 cursor-pointer',
                              status === 'empty' && 'border-2 border-dashed border-muted-foreground/30 bg-muted/20',
                              status === 'in-progress' && 'border-2 bg-gradient-to-b from-primary/20 to-primary/5',
                              status === 'forged' && 'border-2 shadow-lg',
                              status === 'forged' && 'hover:scale-110 hover:shadow-xl',
                              status !== 'empty' && 'hover:scale-105'
                            )}
                            style={{
                              borderColor: status !== 'empty' ? config.color : undefined,
                              boxShadow: status === 'forged' ? `0 4px 12px ${config.color}40` : undefined
                            }}
                          >
                            {/* Card content */}
                            {status === 'empty' ? (
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <Lock className="w-3 h-3 text-muted-foreground/50" />
                                <span className="text-[10px] text-muted-foreground/50 mt-1">
                                  #{String(slot).padStart(2, '0')}
                                </span>
                              </div>
                            ) : (
                              <>
                                {/* Background - image or gradient */}
                                {imageUrl ? (
                                  <img
                                    src={imageUrl}
                                    alt={definition ? getLocalizedText(definition.title, language) : `Card ${slot}`}
                                    className="absolute inset-0 w-full h-full object-cover"
                                  />
                                ) : (
                                  <div
                                    className="absolute inset-0"
                                    style={{
                                      background: `linear-gradient(135deg, ${config.color}40 0%, ${config.color}20 100%)`
                                    }}
                                  />
                                )}

                                {/* Overlay gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                {/* Card number */}
                                <span className="absolute bottom-0.5 left-1 text-[9px] font-bold text-white/90">
                                  #{String(slot).padStart(2, '0')}
                                </span>

                                {/* Status badge */}
                                {status === 'forged' && (
                                  <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                                    <Check className="w-2.5 h-2.5 text-white" />
                                  </div>
                                )}

                                {/* Score badge */}
                                {score !== null && (
                                  <div
                                    className="absolute bottom-0.5 right-0.5 px-1 py-0.5 rounded text-[8px] font-bold text-white"
                                    style={{
                                      backgroundColor: score >= 7 ? '#22c55e' : score >= 5 ? '#eab308' : '#ef4444'
                                    }}
                                  >
                                    {score.toFixed(1)}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-[200px]">
                          <div className="text-xs">
                            <p className="font-semibold">{definition ? getLocalizedText(definition.title, language) : `Card ${slot}`}</p>
                            {status === 'empty' && (
                              <p className="text-muted-foreground mt-1">
                                {language === 'ru' ? 'Ещё не создана - разблокируй!' : 'Not yet crafted - unlock this card!'}
                              </p>
                            )}
                            {status === 'in-progress' && (
                              <p className="text-amber-500 mt-1">
                                {language === 'ru' ? 'В процессе - скуй для завершения' : 'In progress - forge to complete'}
                              </p>
                            )}
                            {status === 'forged' && score !== null && (
                              <p className="text-emerald-500 mt-1">
                                {language === 'ru' ? `Скована! Оценка: ${score.toFixed(1)}/10` : `Forged! Score: ${score.toFixed(1)}/10`}
                              </p>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Overall progress */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {language === 'ru' ? 'Всего в коллекции' : 'Total Collection'}
            </span>
            <span className="font-semibold text-foreground">
              {cards.filter(c => c.card_data && Object.keys(c.card_data as object).length > 0).length} / 21 {language === 'ru' ? 'карт' : 'cards'}
            </span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
