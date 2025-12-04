import { motion } from 'framer-motion';
import { ForgeLoadingState } from './ForgeLoadingState';
import { RarityBadge } from '@/components/marketplace/RarityBadge';
import { Rarity } from '@/data/rarityConfig';
import { Sparkles, FileText } from 'lucide-react';

interface CardRevealProps {
  isRevealing: boolean;
  imageUrl?: string;
  evaluation?: any;
  loadingStage: 'idle' | 'channeling' | 'summoning' | 'evaluating';
  cardTitle?: string;
  cardType?: string;
  cardData?: Record<string, any>;
  slot?: number;
}

const getCardRarity = (score?: number): Rarity => {
  if (!score) return 'common';
  if (score <= 3) return 'common';
  if (score <= 5) return 'uncommon';
  if (score <= 7) return 'rare';
  if (score <= 9) return 'epic';
  return 'legendary';
};

export const CardReveal = ({ 
  isRevealing, 
  imageUrl, 
  evaluation, 
  loadingStage,
  cardTitle,
  cardType,
  cardData,
  slot
}: CardRevealProps) => {
  // Get filled fields for summary display
  const filledFields = cardData 
    ? Object.entries(cardData).filter(([_, value]) => value && String(value).trim() !== '')
    : [];

  return (
    <div className="perspective-1000 w-full">
      <motion.div
        className="relative preserve-3d w-full"
        animate={{ 
          rotateY: isRevealing ? 180 : 0,
        }}
        transition={{ 
          duration: 1.2, 
          type: 'spring',
          stiffness: 80,
          damping: 15
        }}
      >
        {/* Back face - Loading state */}
        <motion.div 
          className="backface-hidden w-full"
          animate={{
            scale: isRevealing ? [1, 1.05, 1] : 1
          }}
          transition={{
            duration: 0.6,
            ease: 'easeOut'
          }}
        >
          <div className="relative rounded-xl border-2 border-primary/30 bg-gradient-to-br from-background via-primary/5 to-secondary/5 overflow-hidden">
            {/* Mystical shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-[shimmer_2s_ease-in-out_infinite]" />
            
            <ForgeLoadingState stage={loadingStage} />
          </div>
        </motion.div>

        {/* Front face - Revealed card */}
        <motion.div 
          className="backface-hidden absolute inset-0 w-full"
          style={{ 
            transform: 'rotateY(180deg)',
            transformStyle: 'preserve-3d'
          }}
        >
          <div className="relative rounded-xl border-2 border-primary/50 bg-gradient-to-br from-primary/10 via-background to-secondary/10 overflow-hidden shadow-2xl shadow-primary/20">
            {/* Reveal shimmer effect */}
            {isRevealing && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/30 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ 
                  duration: 1.5,
                  ease: 'easeInOut'
                }}
              />
            )}

            {/* Card image - formatted like CardFront */}
            {imageUrl && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="relative aspect-[3/4]"
              >
                <img 
                  src={imageUrl} 
                  alt="Forged card artwork"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
                
                {/* Slot badge - top left */}
                {slot && (
                  <div className="absolute top-2 left-2 backdrop-blur-md bg-black/40 border border-white/30 rounded px-2 py-1">
                    <span className="text-xs font-mono text-white font-bold">
                      #{slot.toString().padStart(2, '0')}
                    </span>
                  </div>
                )}

                {/* FORGED badge - top right */}
                <motion.div 
                  className="absolute top-2 right-2 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-xs font-bold shadow-lg"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                >
                  ✨ FORGED
                </motion.div>

                {/* Rarity badge - bottom right */}
                {evaluation?.overall && (
                  <motion.div 
                    className="absolute bottom-2 right-2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
                  >
                    <RarityBadge rarity={getCardRarity(evaluation.overall)} />
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Enhanced fallback when no image - show card preview */}
            {!imageUrl && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="p-5"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <span className="text-lg font-bold text-foreground">
                      {cardTitle || 'Strategy Card'}
                    </span>
                  </div>
                  <motion.div 
                    className="bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-xs font-bold shadow-lg"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                  >
                    ✨ FORGED
                  </motion.div>
                </div>

                {cardType && (
                  <span className="inline-block text-xs bg-secondary/20 text-secondary-foreground px-2 py-1 rounded mb-4">
                    {cardType}
                  </span>
                )}

                {/* Card Data Summary */}
                {filledFields.length > 0 ? (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {filledFields.slice(0, 4).map(([key, value], index) => (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="flex flex-col gap-0.5"
                      >
                        <span className="text-[10px] uppercase text-muted-foreground font-mono tracking-wide">
                          {key.replace(/_/g, ' ')}
                        </span>
                        <span className="text-sm text-foreground line-clamp-1">
                          {String(value).substring(0, 80)}{String(value).length > 80 ? '...' : ''}
                        </span>
                      </motion.div>
                    ))}
                    {filledFields.length > 4 && (
                      <span className="text-xs text-muted-foreground">
                        +{filledFields.length - 4} more fields
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 text-muted-foreground gap-2">
                    <Sparkles className="w-8 h-8 text-primary" />
                    <span className="text-sm">Card Content Saved</span>
                  </div>
                )}
              </motion.div>
            )}


            {/* Celebration glow effect */}
            {isRevealing && (
              <motion.div
                className="absolute inset-0 border-2 border-primary/0 rounded-xl"
                animate={{
                  borderColor: ['hsl(var(--primary) / 0)', 'hsl(var(--primary) / 0.8)', 'hsl(var(--primary) / 0)'],
                  boxShadow: [
                    '0 0 0 0 hsl(var(--primary) / 0)',
                    '0 0 30px 10px hsl(var(--primary) / 0.6)',
                    '0 0 0 0 hsl(var(--primary) / 0)'
                  ]
                }}
                transition={{
                  duration: 1.5,
                  ease: 'easeOut'
                }}
              />
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};