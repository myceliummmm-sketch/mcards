import { useState } from 'react';
import { motion } from 'framer-motion';
import { CardFront } from './CardFront';
import { CardBack } from './CardBack';
import { ReviewBadge } from './review/ReviewBadge';
import type { CardDefinition } from '@/data/cardDefinitions';
import { useDeckCards } from '@/hooks/useDeckCards';
import type { Database } from '@/integrations/supabase/types';

type DeckCard = Database['public']['Tables']['deck_cards']['Row'];

interface FlippableCardProps {
  definition: CardDefinition;
  cardRow?: DeckCard;
  isInsight?: boolean;
  onEdit: () => void;
  deckId: string;
}

export const FlippableCard = ({ 
  definition, 
  cardRow,
  isInsight = false,
  onEdit,
  deckId
}: FlippableCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const { updateCardImage } = useDeckCards(deckId);

  // Read from dedicated columns, not from card_data
  const cardContent = cardRow?.card_data as Record<string, any> | null;
  const imageUrl = cardRow?.card_image_url;
  const evaluation = cardRow?.evaluation as { overall?: number } | null;
  const cardId = cardRow?.id;

  const isEmpty = !cardContent || Object.keys(cardContent).length === 0;
  const isComplete = !isEmpty && (cardContent as any)?.completed === true;
  const preview = cardContent?.summary || cardContent?.description || cardContent?.content || '';

  const handleRegenerateImage = async (newImageUrl: string) => {
    await updateCardImage(definition.slot, newImageUrl);
  };

  const getCardStyle = () => {
    if (isInsight) {
      return 'border-status-insight shadow-[0_0_20px_hsl(var(--status-insight)/0.5)]';
    }
    if (isComplete) {
      return 'border-status-complete shadow-[0_0_15px_hsl(var(--status-complete)/0.3)]';
    }
    if (!isEmpty) {
      return 'border-status-in-progress shadow-[0_0_15px_hsl(var(--status-in-progress)/0.3)]';
    }
    return 'border-status-empty border-dashed';
  };

  return (
    <div className="relative w-full aspect-[3/4] perspective-1000">
      {cardId && <ReviewBadge cardId={cardId} />}
      
      <motion.div
        className="relative w-full h-full preserve-3d cursor-pointer"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring' }}
        whileHover={{ scale: 1.02 }}
      >
        {/* Front face */}
        <motion.div
          className={`absolute inset-0 backface-hidden rounded-xl border-2 overflow-hidden ${getCardStyle()}`}
          style={{ 
            backfaceVisibility: 'hidden',
            pointerEvents: isFlipped ? 'none' : 'auto'
          }}
          onClick={() => setIsFlipped(true)}
        >
          <CardFront
            definition={definition}
            isEmpty={isEmpty}
            isComplete={isComplete}
            isInsight={isInsight}
            preview={preview}
            imageUrl={imageUrl || undefined}
            evaluationScore={evaluation?.overall}
          />
        </motion.div>

        {/* Back face */}
        <motion.div
          className={`absolute inset-0 backface-hidden rounded-xl border-2 overflow-hidden ${getCardStyle()}`}
          style={{ 
            backfaceVisibility: 'hidden',
            rotateY: 180,
            pointerEvents: isFlipped ? 'auto' : 'none'
          }}
          onClick={() => setIsFlipped(false)}
        >
          <CardBack
            definition={definition}
            content={cardContent}
            evaluation={evaluation}
            isEmpty={isEmpty}
            onEdit={() => {
              onEdit();
            }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
};
