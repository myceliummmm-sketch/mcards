import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Crown, Diamond } from 'lucide-react';
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
}

export const PhaseSection = ({ phase, cards, onEditCard, deckId, locked = false }: PhaseSectionProps) => {
  const config = PHASE_CONFIG[phase];
  const definitions = getCardsByPhase(phase);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [websiteModalOpen, setWebsiteModalOpen] = useState(false);
  const { t } = useTranslation();
  
  const filledCount = definitions.filter(def => 
    cards.some(c => c.card_slot === def.slot && c.card_data && Object.keys(c.card_data).length > 0)
  ).length;

  const handleAccordionClick = (e: React.MouseEvent) => {
    if (locked) {
      e.preventDefault();
      e.stopPropagation();
      setUpgradeModalOpen(true);
    }
  };

  return (
    <>
      <Accordion type="single" collapsible defaultValue={locked ? undefined : phase}>
        <AccordionItem value={phase} className="border-b-0">
          <AccordionTrigger 
            className={cn(
              "hover:no-underline group py-6 px-6 rounded-lg mb-4 border-2 transition-all",
              locked && "opacity-70 cursor-pointer"
            )}
            style={{ borderColor: locked ? `${config.color}80` : config.color }}
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
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Generate Website Button - Only for Vision phase */}
              {phase === 'vision' && !locked && (
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
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 lg:gap-10 px-6 pb-8"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {definitions.map((definition) => {
              const cardData = cards.find(c => c.card_slot === definition.slot);
              
              return (
                <motion.div
                  key={definition.slot}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                >
                  <FlippableCard
                    definition={definition}
                    cardRow={cardData}
                    isInsight={cardData?.is_insight || false}
                    onEdit={() => onEditCard(definition.slot)}
                    deckId={deckId}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </AccordionContent>
      </AccordionItem>
      </Accordion>
      
      <UpgradeModal open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen} />
      
      {phase === 'vision' && (
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