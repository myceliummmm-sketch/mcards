import { useState } from 'react';
import { motion } from 'framer-motion';
import { CardFront } from './CardFront';
import { CardBack } from './CardBack';
import type { CardDefinition } from '@/data/cardDefinitions';

interface FlippableCardProps {
  definition: CardDefinition;
  cardData?: any;
  isInsight?: boolean;
  onEdit: () => void;
}

export const FlippableCard = ({ 
  definition, 
  cardData,
  isInsight = false,
  onEdit 
}: FlippableCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const isEmpty = !cardData || Object.keys(cardData).length === 0;
  const isComplete = !isEmpty && cardData.completed === true;
  const preview = cardData?.summary || cardData?.description || cardData?.content || '';

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
      <motion.div
        className="relative w-full h-full preserve-3d cursor-pointer"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring' }}
        whileHover={{ scale: 1.05 }}
      >
        {/* Front face */}
        <motion.div
          className={`absolute inset-0 backface-hidden rounded-xl border-2 bg-card overflow-hidden ${getCardStyle()}`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="card-shine w-full h-full">
            <CardFront
              definition={definition}
              isEmpty={isEmpty}
              isComplete={isComplete}
              isInsight={isInsight}
              preview={preview}
              imageUrl={cardData?.card_image_url}
            />
          </div>
        </motion.div>

        {/* Back face */}
        <motion.div
          className={`absolute inset-0 backface-hidden rounded-xl border-2 bg-card overflow-hidden ${getCardStyle()}`}
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
          />
        </motion.div>
      </motion.div>
    </div>
  );
};
