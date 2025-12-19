import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, MessageCircle, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Insight, 
  RARITY_COLORS, 
  TEAM_MEMBER_INFO, 
} from '@/types/research';
import { getCharacterById } from '@/data/teamCharacters';
import { DiscussionDrawer } from './DiscussionDrawer';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

interface InsightValidationFlowProps {
  insights: Insight[];
  isStreaming?: boolean;
  completedCards?: number;
  deckId?: string;
  totalExpectedInsights?: number; // 15 for full research, 3 for single card re-research
  singleCardMode?: boolean; // true when re-researching single card
  onComplete: (results: { resonated: boolean; insight: Insight }[]) => void;
  onCancel: () => void;
}

export function InsightValidationFlow({ 
  insights, 
  isStreaming = false,
  completedCards = 0,
  deckId,
  totalExpectedInsights = 15,
  singleCardMode = false,
  onComplete, 
  onCancel 
}: InsightValidationFlowProps) {
  const { language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<{ resonated: boolean; insight: Insight }[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showResult, setShowResult] = useState<'resonated' | 'rejected' | null>(null);
  const [discussionOpen, setDiscussionOpen] = useState(false);
  const [discussingInsight, setDiscussingInsight] = useState<Insight | null>(null);

  const currentInsight = insights[currentIndex];
  const availableInsights = insights.length;
  const canValidate = currentIndex < availableInsights;
  const isWaitingForMore = isStreaming && currentIndex >= availableInsights;
  
  // Progress based on what we've validated vs total expected
  const progress = (results.length / totalExpectedInsights) * 100;
  const resonatedCount = results.filter(r => r.resonated).length;

  const handleAction = useCallback((resonated: boolean, showAnim: 'resonated' | 'rejected' | null = null) => {
    if (isAnimating || !currentInsight) return;
    
    setIsAnimating(true);
    if (showAnim) setShowResult(showAnim);
    
    const newResults = [...results, { resonated, insight: currentInsight }];
    setResults(newResults);

    setTimeout(() => {
      setShowResult(null);
      
      const nextIndex = currentIndex + 1;
      // Complete when we've validated all expected insights
      const allInsightsValidated = newResults.length >= totalExpectedInsights;
      const noMoreInsightsExpected = !isStreaming && nextIndex >= insights.length && newResults.length >= insights.length;
      
      if (allInsightsValidated || noMoreInsightsExpected) {
        onComplete(newResults);
      } else {
        setCurrentIndex(nextIndex);
      }
      setIsAnimating(false);
    }, 400);
  }, [currentInsight, currentIndex, insights.length, isAnimating, isStreaming, onComplete, results, totalExpectedInsights]);

  const handleResonate = useCallback(() => handleAction(true, 'resonated'), [handleAction]);
  const handleReject = useCallback(() => handleAction(false, 'rejected'), [handleAction]);

  const handleDiscuss = useCallback(() => {
    if (isAnimating || !currentInsight) return;
    setDiscussingInsight(currentInsight);
    setDiscussionOpen(true);
  }, [currentInsight, isAnimating]);

  const handleDiscussionMessage = async (message: string, characterId: string): Promise<string | null> => {
    if (!discussingInsight) return null;
    
    try {
      const { data, error } = await supabase.functions.invoke('research-discuss', {
        body: {
          characterId,
          message,
          language,
          deckId,
          insightContext: {
            content: discussingInsight.content,
            source: discussingInsight.source,
            visionCardSlot: discussingInsight.visionCardSlot,
            researchCardSlot: discussingInsight.researchCardSlot,
          }
        }
      });
      
      if (error) throw error;
      return data?.response || null;
    } catch (err) {
      console.error('Discussion error:', err);
      return language === 'ru' 
        ? 'Извини, не могу ответить сейчас. Попробуй позже.'
        : 'Sorry, I cannot respond right now. Try again later.';
    }
  };

  // Handle just closing the discussion (no action on insight)
  const handleDiscussionClose = (open: boolean) => {
    if (!open) {
      setDiscussingInsight(null);
    }
    setDiscussionOpen(open);
  };

  // Handle rejecting the insight after discussion
  const handleRejectAfterDiscussion = useCallback(() => {
    if (!discussingInsight) return;
    
    const newResults = [...results, { resonated: false, insight: discussingInsight }];
    setResults(newResults);
    setDiscussionOpen(false);
    setDiscussingInsight(null);
    
    const nextIndex = currentIndex + 1;
    // Complete when we've validated all expected insights
    const allInsightsValidated = newResults.length >= totalExpectedInsights;
    const noMoreInsightsExpected = !isStreaming && nextIndex >= insights.length && newResults.length >= insights.length;
    
    if (allInsightsValidated || noMoreInsightsExpected) {
      onComplete(newResults);
    } else {
      setCurrentIndex(nextIndex);
    }
  }, [discussingInsight, results, currentIndex, isStreaming, insights.length, onComplete, totalExpectedInsights]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keyboard shortcuts when user is typing in input fields
      const target = e.target as HTMLElement;
      const isInputFocused = target.tagName === 'INPUT' ||
                             target.tagName === 'TEXTAREA' ||
                             target.isContentEditable;
      if (isInputFocused) return;

      if (!canValidate || isAnimating || discussionOpen) return;
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        handleResonate();
      } else if (e.key === 'ArrowDown' || e.key === 's') {
        handleReject();
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        handleDiscuss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleResonate, handleReject, handleDiscuss, canValidate, isAnimating, discussionOpen]);

  // Vision card labels
  const visionLabels: Record<number, string> = {
    1: 'V-01 PRODUCT',
    2: 'V-02 PROBLEM',
    3: 'V-03 AUDIENCE',
    4: 'V-04 VALUE',
    5: 'V-05 VISION',
  };

  // Research card labels - map from research slot
  const researchLabels: Record<number, string> = {
    6: 'R-1 КАРТА РЫНКА',
    7: 'R-2 АНАЛИЗ КОНКУРЕНТОВ',
    8: 'R-3 ИНСАЙТЫ ПОЛЬЗОВАТЕЛЕЙ',
    9: 'R-4 ОЦЕНКА РИСКОВ',
    10: 'R-5 ОЦЕНКА ВОЗМОЖНОСТИ',
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              {singleCardMode 
                ? `Инсайт ${results.length + 1} / ${totalExpectedInsights}`
                : `Инсайт ${results.length + 1} / ${totalExpectedInsights}`
              }
              {isStreaming && availableInsights < totalExpectedInsights && (
                <span className="ml-2 text-primary">
                  <Loader2 className="w-3 h-3 inline animate-spin mr-1" />
                  Загружено: {availableInsights}
                </span>
              )}
            </span>
            <span className="text-sm text-green-500">
              ✓ {resonatedCount} резонирует
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          
          {/* Vision Cards Progress - only show in full research mode */}
          {!singleCardMode && (
            <div className="flex gap-2 mt-3">
              {[1, 2, 3, 4, 5].map(slot => {
                const slotInsights = results.filter(r => r.insight.visionCardSlot === slot);
                const completed = slotInsights.length;
                const resonated = slotInsights.filter(r => r.resonated).length;
                const isCurrent = currentInsight?.visionCardSlot === slot;
                const isLoading = isStreaming && completedCards < slot;
                
                return (
                  <div 
                    key={slot}
                    className={`flex-1 p-2 rounded text-xs text-center transition-all ${
                      isCurrent 
                        ? 'bg-primary/20 border border-primary' 
                        : completed === 3 
                          ? 'bg-green-500/20 border border-green-500/30' 
                          : isLoading
                            ? 'bg-muted/30 border border-dashed border-muted-foreground/30'
                            : 'bg-muted/50'
                    }`}
                  >
                    <div className="font-medium flex items-center justify-center gap-1">
                      V-0{slot}
                      {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                    </div>
                    <div className="text-muted-foreground">{resonated}/{completed}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Waiting State */}
        {isWaitingForMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
            <p className="text-lg font-medium mb-2">
              {singleCardMode ? 'Ищем новые инсайты...' : 'Генерируем следующие инсайты...'}
            </p>
            <p className="text-sm text-muted-foreground">
              Готово {availableInsights} из {totalExpectedInsights}
            </p>
          </motion.div>
        )}

        {/* Insight Card */}
        {canValidate && currentInsight && (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentInsight.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  x: showResult === 'resonated' ? -100 : 0,
                }}
                exit={{ 
                  opacity: 0, 
                  x: showResult === 'resonated' ? -200 : 0,
                  scale: 0.9 
                }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="relative"
              >
                {/* Result Overlay */}
                <AnimatePresence>
                  {showResult === 'resonated' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-green-500/20"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-20 h-20 rounded-full flex items-center justify-center bg-green-500"
                      >
                        <Check className="w-10 h-10 text-white" />
                      </motion.div>
                    </motion.div>
                  )}
                  {showResult === 'rejected' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-red-500/20"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-20 h-20 rounded-full flex items-center justify-center bg-red-500"
                      >
                        <X className="w-10 h-10 text-white" />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {(() => {
                  const teamMember = TEAM_MEMBER_INFO[currentInsight.presenter];
                  const character = getCharacterById(currentInsight.presenter, language);
                  const rarityColor = RARITY_COLORS[currentInsight.rarity];
                  const rarityLabel = currentInsight.rarity.charAt(0).toUpperCase() + currentInsight.rarity.slice(1);

                  return (
                    <div 
                      className="rounded-2xl p-6 border-2 transition-colors"
                      style={{ 
                        backgroundColor: rarityColor.bg,
                        borderColor: rarityColor.primary,
                        boxShadow: `0 0 30px ${rarityColor.glow}`,
                      }}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl overflow-hidden"
                            style={{ backgroundColor: `${rarityColor.primary}30` }}
                          >
                            {character?.avatar ? (
                              <img 
                                src={character.avatar} 
                                alt={teamMember.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              teamMember.emoji
                            )}
                          </div>
                          <div>
                            <div className="font-bold" style={{ color: rarityColor.text }}>
                              {teamMember.emoji} {teamMember.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {teamMember.role}
                            </div>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div 
                            className="text-sm px-3 py-1.5 rounded-full font-bold"
                            style={{ 
                              backgroundColor: `${rarityColor.primary}40`,
                              color: rarityColor.text 
                            }}
                          >
                            ← {visionLabels[currentInsight.visionCardSlot]}
                          </div>
                          <div 
                            className="text-xs px-2 py-0.5 rounded-full opacity-60"
                            style={{ 
                              backgroundColor: `${rarityColor.primary}20`,
                              color: rarityColor.text 
                            }}
                          >
                            {researchLabels[currentInsight.researchCardSlot] || `R-${currentInsight.researchCardSlot - 5}`}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div 
                        className="text-lg leading-relaxed mb-4"
                        style={{ color: rarityColor.text }}
                      >
                        "{currentInsight.content}"
                      </div>

                      {/* Source - only show if it's a real source, not generic */}
                      {currentInsight.source && currentInsight.source !== 'AI Analysis' && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                          <span>🔗</span>
                          {currentInsight.sourceUrl ? (
                            <a 
                              href={currentInsight.sourceUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:underline truncate max-w-[300px]"
                            >
                              {currentInsight.source}
                            </a>
                          ) : (
                            <span>{currentInsight.source}</span>
                          )}
                        </div>
                      )}
                      {currentInsight.source === 'AI Analysis' && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground/60 mb-4">
                          <span>🤖</span>
                          <span>Анализ AI команды</span>
                        </div>
                      )}

                      {/* Score & Rarity */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4" style={{ color: rarityColor.primary }} />
                          <span className="font-bold" style={{ color: rarityColor.primary }}>
                            {rarityLabel}
                          </span>
                          <span className="text-muted-foreground">
                            ({currentInsight.score.toFixed(1)}/10)
                          </span>
                        </div>
                        {currentInsight.maxPossibleScore < 10 && (
                          <div className="text-xs text-muted-foreground">
                            Потолок: {currentInsight.maxPossibleScore.toFixed(1)} (от Vision)
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            </AnimatePresence>

            {/* Action Buttons - 3 columns */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <Button
                size="lg"
                className="h-14 text-base font-bold bg-green-600 hover:bg-green-700 text-white"
                onClick={handleResonate}
                disabled={isAnimating}
              >
                <Check className="w-5 h-5 mr-1.5" />
                Резонирует
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 text-base font-bold border-red-500/50 text-red-400 hover:bg-red-500/10"
                onClick={handleReject}
                disabled={isAnimating}
              >
                <X className="w-5 h-5 mr-1.5" />
                Не резонирует
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 text-base font-bold border-primary/50 text-primary hover:bg-primary/10"
                onClick={handleDiscuss}
                disabled={isAnimating}
              >
                <MessageCircle className="w-5 h-5 mr-1.5" />
                Обсудить
              </Button>
            </div>

            {/* Keyboard Hints */}
            <div className="flex justify-center gap-6 mt-4 text-xs text-muted-foreground">
              <span>A - Резонирует</span>
              <span>S - Не резонирует</span>
              <span>D - Обсудить</span>
            </div>
          </>
        )}

        {/* Cancel */}
        <div className="flex justify-center mt-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-muted-foreground"
          >
            Отменить
          </Button>
        </div>
      </div>

      {/* Discussion Sheet (right side) */}
      <DiscussionDrawer
        open={discussionOpen}
        onOpenChange={handleDiscussionClose}
        cardTitle={discussingInsight ? `${discussingInsight.content.substring(0, 50)}...` : ''}
        evaluators={discussingInsight ? [discussingInsight.presenter] : ['evergreen']}
        presenterCharacterId={discussingInsight?.presenter}
        onSendMessage={handleDiscussionMessage}
        onReject={handleRejectAfterDiscussion}
      />
    </div>
  );
}
