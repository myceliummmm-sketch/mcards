import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardFront } from './CardFront';
import { CardBack } from './CardBack';
import { ReviewBadge } from './review/ReviewBadge';
import type { CardDefinition } from '@/data/cardDefinitions';
import { useDeckCards } from '@/hooks/useDeckCards';
import type { Database } from '@/integrations/supabase/types';
import type { Rarity } from '@/data/rarityConfig';

type DeckCard = Database['public']['Tables']['deck_cards']['Row'];

interface FlippableCardProps {
  definition: CardDefinition;
  cardRow?: DeckCard;
  isInsight?: boolean;
  onEdit: () => void;
  deckId: string;
}

// Get rarity from evaluation score
const getCardRarity = (score?: number): Rarity => {
  if (!score) return 'common';
  if (score <= 3) return 'common';
  if (score <= 5) return 'uncommon';
  if (score <= 7) return 'rare';
  if (score <= 9) return 'epic';
  return 'legendary';
};

// Get glow class based on rarity
const getRarityGlowClass = (score?: number): string => {
  const rarity = getCardRarity(score);
  switch (rarity) {
    case 'legendary':
      return 'rarity-glow-legendary';
    case 'epic':
      return 'rarity-glow-epic';
    case 'rare':
      return 'rarity-glow-rare';
    case 'uncommon':
      return 'rarity-glow-uncommon';
    default:
      return '';
  }
};

// Get flash color based on rarity
const getRarityFlashColor = (score?: number): string => {
  const rarity = getCardRarity(score);
  switch (rarity) {
    case 'legendary':
      return 'rgba(234, 179, 8, 0.8)';
    case 'epic':
      return 'rgba(168, 85, 247, 0.7)';
    case 'rare':
      return 'rgba(59, 130, 246, 0.6)';
    case 'uncommon':
      return 'rgba(34, 197, 94, 0.5)';
    default:
      return 'rgba(255, 255, 255, 0.4)';
  }
};

export const FlippableCard = ({ 
  definition, 
  cardRow,
  isInsight = false,
  onEdit,
  deckId
}: FlippableCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
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

  // Only apply rarity glow to forged cards with images
  const rarityGlowClass = imageUrl ? getRarityGlowClass(evaluation?.overall) : '';
  const isForged = !!imageUrl;

  const handleFlip = (toFlipped: boolean) => {
    // Trigger flash effect when flipping a forged card
    if (isForged && toFlipped !== isFlipped) {
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 400);
    }
    setIsFlipped(toFlipped);
  };

  return (
    <div className={`relative w-full aspect-[3/4] perspective-1000 rounded-xl ${rarityGlowClass}`}>
      {cardId && <ReviewBadge cardId={cardId} />}
      
      {/* Flash effect overlay */}
      <AnimatePresence>
        {showFlash && isForged && (
          <motion.div
            className="absolute inset-0 z-50 rounded-xl pointer-events-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 1.5] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{
              background: `radial-gradient(circle at center, ${getRarityFlashColor(evaluation?.overall)} 0%, transparent 70%)`,
            }}
          />
        )}
      </AnimatePresence>
      
      <motion.div
        className="relative w-full h-full preserve-3d cursor-pointer"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100, damping: 20 }}
        whileHover={{ scale: 1.02 }}
      >
        {/* Front face */}
        <motion.div
          className={`absolute inset-0 backface-hidden rounded-xl border-2 overflow-hidden ${getCardStyle()}`}
          style={{ 
            backfaceVisibility: 'hidden',
            pointerEvents: isFlipped ? 'none' : 'auto'
          }}
          onClick={() => handleFlip(true)}
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
          onClick={() => handleFlip(false)}
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
