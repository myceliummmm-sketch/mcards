import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Crown, Gift, Sparkles, Loader2, CheckCircle2, Rocket, Trophy, BarChart3, AlertTriangle, Palette, RefreshCw, MessageSquare } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FlippableCard } from '../FlippableCard';
import { PhaseIcon } from '../PhaseIcon';
import { UpgradeModal } from '@/components/paywall/UpgradeModal';
import { RewardModal } from '../RewardModal';
import { RarityBadge } from '@/components/marketplace/RarityBadge';
import { GenerateDesignPromptModal } from './GenerateDesignPromptModal';
import { GenerateLovablePromptModal } from './GenerateLovablePromptModal';
import { PHASE_CONFIG } from '@/data/cardDefinitions';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { useBuildPhase, BuildMode } from '@/hooks/useBuildPhase';
import type { Database } from '@/integrations/supabase/types';

type DeckCard = Database['public']['Tables']['deck_cards']['Row'];

interface BuildPhaseSectionProps {
  deckId: string;
  cards: DeckCard[];
  deckTitle?: string;
  onEditCard: (slot: number) => void;
  onRefresh?: () => void;
  locked?: boolean;
  visionCards?: DeckCard[];
  researchCards?: DeckCard[];
}

export const BuildPhaseSection = ({
  deckId,
  cards,
  deckTitle = 'My Deck',
  onEditCard,
  onRefresh,
  locked = false,
  visionCards = [],
  researchCards = []
}: BuildPhaseSectionProps) => {
  const config = PHASE_CONFIG['build'];
  const { t, language } = useTranslation();

  // UI-only state
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [rewardModalOpen, setRewardModalOpen] = useState(false);
  const [designPromptOpen, setDesignPromptOpen] = useState(false);
  const [lovablePromptOpen, setLovablePromptOpen] = useState(false);

  // Build phase logic from custom hook
  const {
    generatingSlots,
    isGenerating,
    buildScore,
    isEvaluating,
    cardWarnings,
    buildMode,
    filledCount,
    definitions,
    setBuildMode,
    evaluateBuildPhase,
    generateBuildCard,
    generateAllBuildCards,
    getCardRarity,
    getCardFeedback,
  } = useBuildPhase({
    deckId,
    cards,
    language,
    onRefresh
  });

  // Check if Vision phase is complete (at least first card filled)
  const visionComplete = visionCards.some(c =>
    c.card_slot === 1 && c.card_data && Object.keys(c.card_data as object).length > 0
  );

  const handleAccordionClick = (e: React.MouseEvent) => {
    if (locked) {
      e.preventDefault();
      e.stopPropagation();
      setUpgradeModalOpen(true);
    }
  };

  const canStartBuild = visionComplete;
  const allCardsFilled = filledCount === 5;

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
                        const isCardGenerating = generatingSlots.includes(def.slot);

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
                            {isCardGenerating ? (
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
                  {/* Mode Selector */}
                  {!locked && canStartBuild && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <Select value={buildMode} onValueChange={(v) => setBuildMode(v as BuildMode)}>
                        <SelectTrigger className="w-[140px] h-9 text-xs bg-background/80 border-muted">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">
                            <span className="flex items-center gap-2">
                              🤖 {language === 'ru' ? 'Авто' : 'Auto'}
                            </span>
                          </SelectItem>
                          <SelectItem value="hybrid">
                            <span className="flex items-center gap-2">
                              🔄 {language === 'ru' ? 'Гибрид' : 'Hybrid'}
                            </span>
                          </SelectItem>
                          <SelectItem value="manual">
                            <span className="flex items-center gap-2">
                              ✍️ {language === 'ru' ? 'Ручной' : 'Manual'}
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Generate All Button - shows in auto/hybrid mode */}
                  {!locked && canStartBuild && filledCount === 0 && buildMode !== 'manual' && (
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

                  <div className="flex items-center gap-3">
                    {/* BUILD Score Display */}
                    {buildScore && allCardsFilled && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30"
                      >
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
                          {buildScore.overallScore}%
                        </span>
                        <span className="text-xs text-purple-300/80">
                          {buildScore.rarity.emoji} {buildScore.rarity.nameLocalized}
                        </span>
                      </motion.div>
                    )}

                    {/* Evaluate Button */}
                    {allCardsFilled && !buildScore && (
                      <div onClick={(e) => e.stopPropagation()}>
                        <Button
                          onClick={evaluateBuildPhase}
                          disabled={isEvaluating}
                          variant="outline"
                          size="sm"
                          className="gap-2"
                        >
                          {isEvaluating ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <BarChart3 className="w-4 h-4" />
                          )}
                          {language === 'ru' ? 'Оценить' : 'Evaluate'}
                        </Button>
                      </div>
                    )}

                    {/* Progress Counter */}
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
                <>
                  {/* Cards Grid */}
                  <motion.div
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 lg:gap-10 px-6 pb-6"
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
                    <TooltipProvider>
                      {definitions.map((definition) => {
                        const cardData = cards.find(c => c.card_slot === definition.slot);
                        const hasData = cardData?.card_data && Object.keys(cardData.card_data as object).length > 0;
                        const isCardGenerating = generatingSlots.includes(definition.slot);
                        const cardRarity = getCardRarity(definition.slot);
                        const cardFeedback = getCardFeedback(definition.slot);

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

                            {/* Generate/Fill button overlay for empty cards */}
                            {!hasData && canGenerate && !isCardGenerating && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg cursor-pointer hover:bg-black/50 transition-colors"
                                onClick={() => {
                                  if (buildMode === 'manual') {
                                    onEditCard(definition.slot);
                                  } else {
                                    generateBuildCard(definition.slot);
                                  }
                                }}
                              >
                                <div className="text-center p-4">
                                  {buildMode === 'manual' ? (
                                    <>
                                      <span className="text-2xl mb-2 block">✍️</span>
                                      <span className="text-sm font-medium text-white">
                                        {language === 'ru' ? 'Заполнить' : 'Fill in'}
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles className="w-8 h-8 mx-auto mb-2 text-primary animate-pulse" />
                                      <span className="text-sm font-medium text-white">
                                        {language === 'ru' ? 'Сгенерировать' : 'Generate'}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </motion.div>
                            )}

                            {/* Top badges: Rarity + Warning/Check */}
                            {hasData && (
                              <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                                {/* Rarity Badge */}
                                {cardRarity && (
                                  <RarityBadge rarity={cardRarity} className="scale-75 origin-top-right" />
                                )}

                                {/* Warning or Check */}
                                <div className="flex items-center gap-1">
                                  {cardWarnings[definition.slot]?.length > 0 ? (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <motion.div
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                          className="cursor-pointer"
                                        >
                                          <AlertTriangle className="w-5 h-5 text-amber-500 animate-pulse" />
                                        </motion.div>
                                      </TooltipTrigger>
                                      <TooltipContent side="left" className="max-w-64 bg-background/95 border border-amber-500/30">
                                        {cardWarnings[definition.slot].map((warning, i) => (
                                          <div key={i} className="text-xs text-amber-200 mb-1 last:mb-0">
                                            {warning.message}
                                          </div>
                                        ))}
                                      </TooltipContent>
                                    </Tooltip>
                                  ) : (
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Bottom: AI Actions + Team Feedback */}
                            {hasData && (
                              <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
                                {/* Regenerate Button */}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 w-7 p-0 bg-background/80 hover:bg-background"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        generateBuildCard(definition.slot);
                                      }}
                                      disabled={isCardGenerating}
                                    >
                                      {isCardGenerating ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      ) : (
                                        <RefreshCw className="w-3.5 h-3.5" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {language === 'ru' ? 'Перегенерировать' : 'Regenerate'}
                                  </TooltipContent>
                                </Tooltip>

                                {/* Team Feedback */}
                                {cardFeedback && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 w-7 p-0 bg-background/80 hover:bg-background"
                                      >
                                        <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-72 bg-background/95 border border-blue-500/30">
                                      <div className="flex items-start gap-2">
                                        <span className="text-lg">🌲</span>
                                        <div>
                                          <div className="text-xs font-semibold text-blue-300 mb-1">
                                            {language === 'ru' ? 'Анализ команды' : 'Team Analysis'}
                                          </div>
                                          <div className="text-xs text-foreground/80">
                                            {cardFeedback}
                                          </div>
                                        </div>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </TooltipProvider>
                  </motion.div>

                  {/* Action Buttons - Show when all cards filled */}
                  {allCardsFilled && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="px-6 pb-8 flex flex-wrap gap-3 justify-center"
                    >
                      {/* Create Design Prompt Button */}
                      <Button
                        onClick={() => setDesignPromptOpen(true)}
                        variant="outline"
                        className="gap-2 border-pink-500/30 text-pink-400 hover:bg-pink-500/10"
                      >
                        <Palette className="w-4 h-4" />
                        {language === 'ru' ? 'Design Промт' : 'Design Prompt'}
                      </Button>

                      {/* Create Lovable Prompt Button */}
                      <Button
                        onClick={() => setLovablePromptOpen(true)}
                        className="gap-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
                      >
                        <Rocket className="w-4 h-4" />
                        {language === 'ru' ? 'Lovable Промт' : 'Lovable Prompt'}
                      </Button>
                    </motion.div>
                  )}
                </>
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
      <GenerateDesignPromptModal
        open={designPromptOpen}
        onOpenChange={setDesignPromptOpen}
        deckTitle={deckTitle}
        cards={cards}
      />
      <GenerateLovablePromptModal
        open={lovablePromptOpen}
        onOpenChange={setLovablePromptOpen}
        deckTitle={deckTitle}
        cards={cards}
      />
    </>
  );
};
