import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Crown, Gift, Sparkles, Loader2, CheckCircle2, Rocket } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FlippableCard } from '../FlippableCard';
import { PhaseIcon } from '../PhaseIcon';
import { UpgradeModal } from '@/components/paywall/UpgradeModal';
import { RewardModal } from '../RewardModal';
import { PHASE_CONFIG, getCardsByPhase } from '@/data/cardDefinitions';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type DeckCard = Database['public']['Tables']['deck_cards']['Row'];

interface BuildPhaseSectionProps {
  deckId: string;
  cards: DeckCard[];
  onEditCard: (slot: number) => void;
  onRefresh?: () => void;
  locked?: boolean;
  visionCards?: DeckCard[];
  researchCards?: DeckCard[];
}

export const BuildPhaseSection = ({ 
  deckId, 
  cards, 
  onEditCard,
  onRefresh,
  locked = false,
  visionCards = [],
  researchCards = []
}: BuildPhaseSectionProps) => {
  const config = PHASE_CONFIG['build'];
  const definitions = getCardsByPhase('build');
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [rewardModalOpen, setRewardModalOpen] = useState(false);
  const [generatingSlots, setGeneratingSlots] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { t, language } = useTranslation();
  const { toast } = useToast();

  const filledCount = definitions.filter(def => 
    cards.some(c => c.card_slot === def.slot && c.card_data && Object.keys(c.card_data as object).length > 0)
  ).length;

  // Check if Vision phase is complete (at least first card filled)
  const visionComplete = visionCards.some(c => 
    c.card_slot === 1 && c.card_data && Object.keys(c.card_data as object).length > 0
  );

  // Check if Research phase has any data
  const hasResearchData = researchCards.some(c => 
    c.card_data && Object.keys(c.card_data as object).length > 0
  );

  const handleAccordionClick = (e: React.MouseEvent) => {
    if (locked) {
      e.preventDefault();
      e.stopPropagation();
      setUpgradeModalOpen(true);
    }
  };

  const generateBuildCard = async (cardSlot: number) => {
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
          onRefresh();
        }

        toast({
          title: language === 'ru' ? '✅ Карточка готова!' : '✅ Card ready!',
          description: language === 'ru' 
            ? 'Нажмите чтобы редактировать' 
            : 'Click to edit',
        });
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
  };

  const generateAllBuildCards = async () => {
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
  };

  const canStartBuild = visionComplete;

  return (
    <>
      <div 
        className={cn(
          "rounded-xl border-2 transition-all overflow-hidden",
          locked && "opacity-70"
        )}
        style={{ borderColor: locked ? `${config.color}80` : config.color }}
      >
        <Accordion type="single" collapsible defaultValue={locked || filledCount === 0 ? undefined : 'build'}>
          <AccordionItem value="build" className="border-b-0">
            <AccordionTrigger 
              className={cn(
                "hover:no-underline group py-6 px-6",
                locked && "cursor-pointer"
              )}
              onClick={handleAccordionClick}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                  <PhaseIcon phase="build" size="lg" />
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-display font-bold text-foreground">
                        {t('phases.build')}
                      </h2>
                      {locked && (
                        <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 gap-1">
                          <Crown className="w-3 h-3" />
                          PRO
                        </Badge>
                      )}
                    </div>
                    
                    {/* Mini thumbnails */}
                    <div className="flex gap-1.5 mt-2">
                      {definitions.map(def => {
                        const cardData = cards.find(c => c.card_slot === def.slot);
                        const hasData = cardData?.card_data && Object.keys(cardData.card_data as object).length > 0;
                        const imageUrl = cardData?.card_image_url;
                        const isGenerating = generatingSlots.includes(def.slot);
                        
                        return (
                          <div 
                            key={def.slot}
                            className={cn(
                              'w-7 h-10 rounded-sm overflow-hidden border-2 transition-all flex items-center justify-center',
                              hasData 
                                ? 'shadow-sm' 
                                : 'border-dashed bg-muted/30'
                            )}
                            style={{ 
                              borderColor: hasData ? config.color : 'hsl(var(--muted-foreground) / 0.3)'
                            }}
                          >
                            {isGenerating ? (
                              <Loader2 className="w-3 h-3 animate-spin text-primary" />
                            ) : imageUrl ? (
                              <img src={imageUrl} className="w-full h-full object-cover" alt="" />
                            ) : hasData ? (
                              <div 
                                className="w-full h-full" 
                                style={{ background: `${config.color}40` }} 
                              />
                            ) : (
                              <Lock className="w-3 h-3 text-muted-foreground/40" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Reward hint */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setRewardModalOpen(true);
                      }}
                      className="flex items-center gap-2 mt-3 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-400/25 to-amber-500/20 border border-amber-400/50 shadow-lg shadow-amber-500/10 whitespace-nowrap flex-shrink-0 hover:from-amber-500/30 hover:via-yellow-400/35 hover:to-amber-500/30 hover:border-amber-400/70 transition-all cursor-pointer"
                    >
                      <Gift className="w-4 h-4 text-amber-400 animate-pulse flex-shrink-0" />
                      <span className="text-sm text-amber-200/90">
                        {t('rewards.reward')}:{' '}
                        <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 drop-shadow-sm">
                          {language === 'ru' ? 'Lovable Промт' : 'Lovable Prompt'} 🚀
                        </span>
                      </span>
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Generate All Button */}
                  {!locked && canStartBuild && filledCount === 0 && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <Button
                        onClick={generateAllBuildCards}
                        disabled={isGenerating}
                        className="gap-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {language === 'ru' ? 'Генерация...' : 'Generating...'}
                          </>
                        ) : (
                          <>
                            <Rocket className="w-4 h-4" />
                            {language === 'ru' ? 'Сгенерировать всё' : 'Generate All'}
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <div 
                      className={cn(
                        "w-16 h-16 rounded-full border-4 flex items-center justify-center font-bold text-lg",
                        locked && "opacity-60"
                      )}
                      style={{ 
                        borderColor: locked ? `${config.color}80` : config.color,
                        color: locked ? `${config.color}80` : config.color 
                      }}
                    >
                      {locked ? (
                        <Lock className="w-6 h-6" />
                      ) : (
                        `${filledCount}/${definitions.length}`
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            
            <AccordionContent>
              {!canStartBuild ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-6 pb-8"
                >
                  <div className="p-6 rounded-xl bg-muted/30 border border-muted text-center">
                    <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-lg font-semibold mb-2">
                      {language === 'ru' ? 'Сначала завершите Vision' : 'Complete Vision First'}
                    </h3>
                    <p className="text-muted-foreground">
                      {language === 'ru' 
                        ? 'BUILD фаза использует данные из Vision и Research карт для генерации спецификации приложения.'
                        : 'BUILD phase uses Vision and Research card data to generate app specification.'}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 lg:gap-10 px-6 pb-8"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.1 }
                    }
                  }}
                >
                  {definitions.map((definition) => {
                    const cardData = cards.find(c => c.card_slot === definition.slot);
                    const hasData = cardData?.card_data && Object.keys(cardData.card_data as object).length > 0;
                    const isCardGenerating = generatingSlots.includes(definition.slot);
                    
                    // Check if previous card is filled (for sequential generation)
                    const prevSlot = definition.slot - 1;
                    const canGenerate = definition.slot === 11 || 
                      cards.some(c => c.card_slot === prevSlot && c.card_data && Object.keys(c.card_data as object).length > 0);
                    
                    return (
                      <motion.div
                        key={definition.slot}
                        variants={{
                          hidden: { opacity: 0, y: 20 },
                          visible: { opacity: 1, y: 0 }
                        }}
                        className="relative"
                      >
                        <FlippableCard
                          definition={definition}
                          cardRow={cardData}
                          isInsight={false}
                          onEdit={() => hasData ? onEditCard(definition.slot) : (canGenerate && generateBuildCard(definition.slot))}
                          isGenerating={isCardGenerating}
                        />
                        
                        {/* Generate button overlay for empty cards */}
                        {!hasData && canGenerate && !isCardGenerating && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg cursor-pointer hover:bg-black/50 transition-colors"
                            onClick={() => generateBuildCard(definition.slot)}
                          >
                            <div className="text-center p-4">
                              <Sparkles className="w-8 h-8 mx-auto mb-2 text-primary animate-pulse" />
                              <span className="text-sm font-medium text-white">
                                {language === 'ru' ? 'Сгенерировать' : 'Generate'}
                              </span>
                            </div>
                          </motion.div>
                        )}
                        
                        {/* Completed indicator */}
                        {hasData && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      
      <UpgradeModal open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen} />
      <RewardModal 
        open={rewardModalOpen} 
        onOpenChange={setRewardModalOpen} 
        phase="build"
      />
    </>
  );
};
