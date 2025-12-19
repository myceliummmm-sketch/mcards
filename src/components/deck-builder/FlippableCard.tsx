import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { CardFront } from './CardFront';
import { ReviewBadge } from './review/ReviewBadge';
import type { CardDefinition } from '@/data/cardDefinitions';
import type { Database } from '@/integrations/supabase/types';
import { calculateRarity, type Rarity } from '@/data/rarityConfig';

type DeckCard = Database['public']['Tables']['deck_cards']['Row'];

interface FlippableCardProps {
  definition: CardDefinition;
  cardRow?: DeckCard;
  isInsight?: boolean;
  onEdit: () => void;
  onUpdateCardImage?: (slot: number, imageUrl: string) => Promise<void>;
  isGenerating?: boolean;
  isNextToFill?: boolean;
  onAISingleCard?: (slot: number) => void;
  sporeBalance?: number;
}

// Get rarity from evaluation score using new thresholds
const getCardRarity = (score?: number): Rarity => {
  if (!score) return 'common';
  return calculateRarity(score);
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

const FlippableCardComponent = ({
  definition,
  cardRow,
  isInsight = false,
  onEdit,
  onUpdateCardImage,
  isGenerating = false,
  isNextToFill = false,
  onAISingleCard,
  sporeBalance = 0
}: FlippableCardProps) => {
  const [showFlash, setShowFlash] = useState(false);

  // Read from dedicated columns, not from card_data
  const cardContent = cardRow?.card_data as Record<string, any> | null;
  const imageUrl = cardRow?.card_image_url;
  const evaluation = cardRow?.evaluation as { overall?: number } | null;
  const cardId = cardRow?.id;

  const isEmpty = !cardContent || Object.keys(cardContent).length === 0;
  const isComplete = !isEmpty && (cardContent as any)?.completed === true;
  const preview = cardContent?.summary || cardContent?.description || cardContent?.content || '';

  const handleRegenerateImage = async (newImageUrl: string) => {
    if (onUpdateCardImage) {
      await onUpdateCardImage(definition.slot, newImageUrl);
    }
  };

  const getCardStyle = () => {
    if (isGenerating) {
      return 'border-primary shadow-[0_0_20px_hsl(var(--primary)/0.5)] animate-pulse';
    }
    if (isNextToFill && isEmpty) {
      return 'border-primary border-2 shadow-[0_0_25px_hsl(var(--primary)/0.6)] animate-pulse';
    }
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

  // Clicking on card opens the editor directly
  const handleCardClick = () => {
    if (isGenerating) return; // Don't allow editing while generating
    if (isForged) {
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 400);
    }
    onEdit();
  };

  return (
    <div className={`relative w-full aspect-[3/4] perspective-1000 rounded-xl ${rarityGlowClass}`}>
      {cardId && <ReviewBadge cardId={cardId} />}
      
      {/* Generating overlay */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            className="absolute inset-0 z-40 rounded-xl bg-primary/20 backdrop-blur-sm flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <p className="mt-3 text-sm font-medium text-primary">
              Generating...
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Please wait a few seconds
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      
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

      {/* AI Auto-Complete Button for empty cards - top right corner */}
      {isEmpty && !isGenerating && onAISingleCard && (
        <motion.button
          className="absolute top-2 right-2 z-50 flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/30 border border-violet-400/30 backdrop-blur-sm transition-all"
          onClick={(e) => {
            e.stopPropagation();
            onAISingleCard(definition.slot);
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          title={sporeBalance < 10 ? 'Not enough SPORE' : 'AI Generate (10 SPORE)'}
        >
          <Sparkles className="w-3 h-3" />
          <span>AI</span>
          <span className="opacity-80">10🍄</span>
        </motion.button>
      )}

      <motion.div
        className={`relative w-full h-full ${isGenerating ? '' : 'cursor-pointer'}`}
        whileHover={isGenerating ? {} : { scale: 1.02 }}
        whileTap={isGenerating ? {} : { scale: 0.98 }}
        onClick={handleCardClick}
      >
        {/* Single card face - no flipping */}
        <div
          className={`absolute inset-0 rounded-xl border-2 overflow-hidden ${getCardStyle()}`}
        >
          <CardFront
            definition={definition}
            isEmpty={isEmpty && !isGenerating}
            isComplete={isComplete}
            isInsight={isInsight}
            preview={preview}
            imageUrl={imageUrl || undefined}
            evaluationScore={evaluation?.overall}
          />
        </div>
      </motion.div>
    </div>
  );
};

// Memoize to prevent re-renders when parent updates other cards
export const FlippableCard = memo(FlippableCardComponent, (prevProps, nextProps) => {
  // Only re-render if this specific card's data changed
  return (
    prevProps.cardRow?.id === nextProps.cardRow?.id &&
    prevProps.cardRow?.card_data === nextProps.cardRow?.card_data &&
    prevProps.cardRow?.card_image_url === nextProps.cardRow?.card_image_url &&
    prevProps.cardRow?.evaluation === nextProps.cardRow?.evaluation &&
    prevProps.isGenerating === nextProps.isGenerating &&
    prevProps.isInsight === nextProps.isInsight &&
    prevProps.isNextToFill === nextProps.isNextToFill &&
    prevProps.sporeBalance === nextProps.sporeBalance &&
    prevProps.onAISingleCard === nextProps.onAISingleCard
  );
});