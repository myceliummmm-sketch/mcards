import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardFront } from './CardFront';
import { CardBack } from './CardBack';
import { ReviewBadge } from './review/ReviewBadge';
import type { CardDefinition } from '@/data/cardDefinitions';
import { format } from 'date-fns';
import { useDeckCards } from '@/hooks/useDeckCards';

interface FlippableCardProps {
  definition: CardDefinition;
  cardData?: any;
  cardId?: string;
  isInsight?: boolean;
  onEdit: () => void;
  deckId: string;
}

export const FlippableCard = ({ 
  definition, 
  cardData,
  cardId,
  isInsight = false,
  onEdit,
  deckId
}: FlippableCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const { updateCardImage } = useDeckCards(deckId);

  const isEmpty = !cardData || Object.keys(cardData).length === 0;
  const isComplete = !isEmpty && cardData.completed === true;
  const preview = cardData?.summary || cardData?.description || cardData?.content || '';

  const calculateXP = () => {
    let xp = 0;
    if (!isEmpty) xp += 10;
    if (cardData?.evaluation?.overall) xp += Math.round(cardData.evaluation.overall);
    return { earned: xp, max: 20 };
  };

  const handleRegenerateImage = async (imageUrl: string) => {
    await updateCardImage(definition.slot, imageUrl);
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
    <div 
      className="relative w-full aspect-[3/4] perspective-1000"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      {cardId && <ReviewBadge cardId={cardId} />}
      
      <motion.div
        className="relative w-full h-full preserve-3d cursor-pointer"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring' }}
        whileHover={{ scale: 1.02 }}
        onHoverStart={() => setIsHovering(true)}
        onHoverEnd={() => setIsHovering(false)}
      >
        {/* Hover Info Overlay - Only show on front face when card has data */}
        <AnimatePresence>
          {isHovering && !isFlipped && !isEmpty && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
            >
              <div className="card-glass-panel rounded-lg p-4 space-y-2 text-white text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⭐</span>
                  <span>XP: {calculateXP().earned}/{calculateXP().max}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">📅</span>
                  <span>Updated: {cardData?.updated_at ? format(new Date(cardData.updated_at), 'MMM d, yyyy') : 'N/A'}</span>
                </div>
                {cardData?.evaluation?.overall && (
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📊</span>
                    <span>Score: {cardData.evaluation.overall.toFixed(1)}/10</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Front face */}
        <motion.div
          className={`absolute inset-0 backface-hidden rounded-xl border-2 overflow-hidden ${getCardStyle()}`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <CardFront
            definition={definition}
            isEmpty={isEmpty}
            isComplete={isComplete}
            isInsight={isInsight}
            preview={preview}
            imageUrl={cardData?.card_image_url}
          />
        </motion.div>

        {/* Back face */}
        <motion.div
          className={`absolute inset-0 backface-hidden rounded-xl border-2 overflow-hidden ${getCardStyle()}`}
          style={{ 
            backfaceVisibility: 'hidden',
            rotateY: 180
          }}
        >
          <CardBack
            definition={definition}
            content={cardData}
            onEdit={() => {
              onEdit();
            }}
            cardType={definition.cardType}
            phase={definition.phase || 'vision'}
            onRegenerateImage={handleRegenerateImage}
          />
        </motion.div>
      </motion.div>
    </div>
  );
};
