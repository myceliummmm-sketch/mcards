import { useState } from 'react';
import { Lock, Crown, Diamond, Gift, Sparkles } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FlippableCard } from './FlippableCard';
import { PhaseIcon } from './PhaseIcon';
import { Badge } from '@/components/ui/badge';
import { UpgradeModal } from '@/components/paywall/UpgradeModal';
import { GenerateWebsiteButton } from './GenerateWebsiteButton';
import { GenerateWebsiteModal } from './GenerateWebsiteModal';
import { RewardModal } from './RewardModal';
import { PHASE_CONFIG, getCardsByPhase, type CardPhase } from '@/data/cardDefinitions';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import type { Database } from '@/integrations/supabase/types';

type DeckCard = Database['public']['Tables']['deck_cards']['Row'];

interface PhaseSectionProps {
  phase: CardPhase;
  cards: DeckCard[];
  onEditCard: (slot: number) => void;
  deckId: string;
  locked?: boolean;
  // Auto-complete props for vision phase
  onAutoComplete?: () => void;
  sporeBalance?: number;
  generatingSlots?: number[];
  onUpdateCardImage?: (slot: number, imageUrl: string) => Promise<void>;
  onAISingleCard?: (slot: number) => void;
}

export const PhaseSection = ({ phase, cards, onEditCard, deckId, locked = false, onAutoComplete, sporeBalance = 0, generatingSlots = [], onUpdateCardImage, onAISingleCard }: PhaseSectionProps) => {
  const config = PHASE_CONFIG[phase];
  const definitions = getCardsByPhase(phase);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [websiteModalOpen, setWebsiteModalOpen] = useState(false);
  const [rewardModalOpen, setRewardModalOpen] = useState(false);
  const { t } = useTranslation();
  
  const filledCount = definitions.filter(def =>
    cards.some(c => c.card_slot === def.slot && c.card_data && Object.keys(c.card_data).length > 0)
  ).length;

  // Find the first empty card slot in this phase (next to fill)
  const nextToFillSlot = definitions.find(def => {
    const cardData = cards.find(c => c.card_slot === def.slot);
    const hasData = cardData?.card_data && Object.keys(cardData.card_data as object).length > 0;
    return !hasData;
  })?.slot;

  const handleAccordionClick = (e: React.MouseEvent) => {
    if (locked) {
      e.preventDefault();
      e.stopPropagation();
      setUpgradeModalOpen(true);
    }
  };

  return (
    <>
      <div 
        className={cn(
          "rounded-xl border-2 transition-all overflow-hidden",
          locked && "opacity-70"
        )}
        style={{ borderColor: locked ? `${config.color}80` : config.color }}
      >
        <Accordion type="single" collapsible defaultValue={locked || filledCount === 0 ? undefined : phase}>
          <AccordionItem value={phase} className="border-b-0">
            <AccordionTrigger 
              className={cn(
                "hover:no-underline group py-6 px-6",
                locked && "cursor-pointer"
              )}
              onClick={handleAccordionClick}
            >
              <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <PhaseIcon phase={phase} size="lg" />
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-display font-bold text-foreground">
                      {t(`phases.${phase}`)}
                    </h2>
                    {locked && phase !== 'pivot' && (
                      <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 gap-1">
                        <Crown className="w-3 h-3" />
                        PRO
                      </Badge>
                    )}
                    {locked && phase === 'pivot' && (
                      <Badge 
                        variant="secondary" 
                        className="bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-violet-400 border-violet-500/30 gap-1"
                      >
                        <Diamond className="w-3 h-3" />
                        ULTRA
                      </Badge>
                    )}
                  </div>
                  {/* Mini thumbnails - visible in header */}
                  <div className="flex gap-1.5 mt-2">
                    {definitions.map(def => {
                      const cardData = cards.find(c => c.card_slot === def.slot);
                      const hasData = cardData?.card_data && Object.keys(cardData.card_data as object).length > 0;
                      const imageUrl = cardData?.card_image_url;
                      const isNext = def.slot === nextToFillSlot && !locked;

                      return (
                        <div
                          key={def.slot}
                          className={cn(
                            'w-7 h-10 rounded-sm overflow-hidden border-2 transition-all flex items-center justify-center',
                            hasData
                              ? 'shadow-sm'
                              : isNext
                                ? 'animate-pulse shadow-[0_0_10px_hsl(var(--primary)/0.5)]'
                                : 'border-dashed bg-muted/30'
                          )}
                          style={{
                            borderColor: hasData ? config.color : isNext ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground) / 0.3)'
                          }}
                          title={hasData ? `#${String(def.slot).padStart(2, '0')} - ${t('cardEditor.complete')}` : `#${String(def.slot).padStart(2, '0')} - ${t('cardEditor.empty')}`}
                        >
                          {imageUrl ? (
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
                  
                  {/* Reward hint - clickable golden button */}
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
                      {phase === 'grow' ? (
                        <>
                          <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300">
                            First{' '}
                          </span>
                          <span className="relative inline-block overflow-hidden">
                            <span className="absolute inset-0 text-xl font-black text-green-400 blur-md animate-pulse">
                              $1000
                            </span>
                            <span className="relative text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-300 to-green-400">
                              $1000
                            </span>
                            <span 
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                              style={{
                                animation: 'shine 2s ease-in-out infinite',
                                transform: 'skewX(-20deg)',
                              }}
                            />
                          </span>
                          <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300">
                            {' '}Strategy
                          </span>
                          <span className="ml-1">💰</span>
                        </>
                      ) : (
                        <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 drop-shadow-sm">
                          {t(`rewards.${phase}.title`)}
                        </span>
                      )}
                    </span>
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* AI Generation Button - Only for Vision phase */}
                {phase === 'idea' && !locked && onAutoComplete && (
                  <div onClick={(e) => e.stopPropagation()}>
                    {(() => {
                      const card1Filled = cards.some(c => c.card_slot === 1 && c.card_data && Object.keys(c.card_data as object).length > 0);
                      const cards2to5Empty = !cards.some(c => c.card_slot >= 2 && c.card_slot <= 5 && c.card_data && Object.keys(c.card_data as object).length > 0);
                      const canGenerate = card1Filled && cards2to5Empty && sporeBalance >= 40;
                      
                      return (
                        <button
                          onClick={onAutoComplete}
                          disabled={!canGenerate}
                          className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                            canGenerate
                              ? "bg-gradient-to-r from-violet-600/80 to-purple-600/80 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/20 border border-violet-400/30"
                              : "bg-muted/50 text-muted-foreground/50 cursor-not-allowed border border-muted"
                          )}
                          title={!card1Filled ? t('autoComplete.fillCard1First') : !cards2to5Empty ? t('autoComplete.cardsNotEmpty') : sporeBalance < 40 ? t('autoComplete.notEnoughSpores') : t('autoComplete.generateCards')}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>AI</span>
                          <span className="text-xs opacity-80">40🍄</span>
                        </button>
                      );
                    })()}
                  </div>
                )}
                
                {/* Generate Website Button - Only for Vision phase */}
                {phase === 'idea' && !locked && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <GenerateWebsiteButton
                      filledCount={filledCount}
                      totalCount={definitions.length}
                      onClick={() => setWebsiteModalOpen(true)}
                    />
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 lg:gap-10 px-6 pb-8">
              {definitions.map((definition) => {
                const cardData = cards.find(c => c.card_slot === definition.slot);

                return (
                  <div key={definition.slot}>
                    <FlippableCard
                      definition={definition}
                      cardRow={cardData}
                      isInsight={cardData?.is_insight || false}
                      onEdit={() => onEditCard(definition.slot)}
                      onUpdateCardImage={onUpdateCardImage}
                      isGenerating={generatingSlots.includes(definition.slot)}
                      isNextToFill={definition.slot === nextToFillSlot && !locked}
                      onAISingleCard={!locked ? onAISingleCard : undefined}
                      sporeBalance={sporeBalance}
                    />
                  </div>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
        </Accordion>
      </div>
      
      <UpgradeModal open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen} />
      <RewardModal 
        open={rewardModalOpen} 
        onOpenChange={setRewardModalOpen} 
        phase={phase}
        onAutoComplete={phase === 'idea' ? onAutoComplete : undefined}
        sporeBalance={sporeBalance}
        autoCompleteCost={40}
        card1Filled={cards.some(c => c.card_slot === 1 && c.card_data && Object.keys(c.card_data as object).length > 0)}
        cards2to5Empty={!cards.some(c => c.card_slot >= 2 && c.card_slot <= 5 && c.card_data && Object.keys(c.card_data as object).length > 0)}
      />
      
      {phase === 'idea' && (
        <GenerateWebsiteModal
          open={websiteModalOpen}
          onOpenChange={setWebsiteModalOpen}
          cards={cards}
          deckId={deckId}
        />
      )}
    </>
  );
};