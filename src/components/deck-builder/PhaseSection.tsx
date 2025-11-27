import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FlippableCard } from './FlippableCard';
import { PHASE_CONFIG, getCardsByPhase, type CardPhase } from '@/data/cardDefinitions';
import type { Database } from '@/integrations/supabase/types';

type DeckCard = Database['public']['Tables']['deck_cards']['Row'];

interface PhaseSectionProps {
  phase: CardPhase;
  cards: DeckCard[];
  onEditCard: (slot: number) => void;
}

export const PhaseSection = ({ phase, cards, onEditCard }: PhaseSectionProps) => {
  const config = PHASE_CONFIG[phase];
  const definitions = getCardsByPhase(phase);
  
  const filledCount = definitions.filter(def => 
    cards.some(c => c.card_slot === def.slot && c.card_data && Object.keys(c.card_data).length > 0)
  ).length;

  return (
    <Accordion type="single" collapsible defaultValue={phase}>
      <AccordionItem value={phase} className="border-b-0">
        <AccordionTrigger 
          className="hover:no-underline group py-6 px-6 rounded-lg mb-4 border-2 transition-all"
          style={{ borderColor: config.color }}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <span className="text-3xl">{config.icon}</span>
              <div className="text-left">
                <h2 className="text-2xl font-display font-bold text-foreground">
                  {config.name}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {definitions.length} cards in this phase
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-16 h-16 rounded-full border-4 flex items-center justify-center font-bold text-lg"
                  style={{ 
                    borderColor: config.color,
                    color: config.color 
                  }}
                >
                  {filledCount}/{definitions.length}
                </div>
              </div>
            </div>
          </div>
        </AccordionTrigger>
        
        <AccordionContent>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6 pb-6"
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
                    cardData={cardData?.card_data}
                    isInsight={cardData?.is_insight || false}
                    onEdit={() => onEditCard(definition.slot)}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
