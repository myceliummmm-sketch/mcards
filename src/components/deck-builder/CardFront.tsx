import { motion } from 'framer-motion';
import type { CardDefinition } from '@/data/cardDefinitions';
import { RarityBadge } from '@/components/marketplace/RarityBadge';
import { Rarity } from '@/data/rarityConfig';

interface CardFrontProps {
  definition: CardDefinition;
  isEmpty: boolean;
  isComplete: boolean;
  isInsight: boolean;
  preview?: string;
  imageUrl?: string;
  evaluationScore?: number;
}

const getCardRarity = (score?: number): Rarity => {
  if (!score) return 'common';
  if (score <= 3) return 'common';
  if (score <= 5) return 'uncommon';
  if (score <= 7) return 'rare';
  if (score <= 9) return 'epic';
  return 'legendary';
}

export const CardFront = ({ 
  definition, 
  imageUrl,
  evaluationScore
}: CardFrontProps) => {
  const getEmptyGradient = () => {
    const phase = definition.phase?.toLowerCase();
    if (phase === 'vision') return 'card-empty-vision';
    if (phase === 'research') return 'card-empty-research';
    if (phase === 'build') return 'card-empty-build';
    if (phase === 'grow') return 'card-empty-grow';
    if (phase === 'pivot') return 'card-empty-pivot';
    return 'card-empty-vision';
  };

  return (
    <motion.div
      className="relative w-full h-full overflow-hidden"
      whileHover={{ scale: 1.01 }}
    >
      {/* Background: Image or gradient */}
      <div className="absolute inset-0">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt="Crystal specimen"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full ${getEmptyGradient()}`} />
        )}
      </div>

      {/* Subtle dark overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Glassmorphism Card Title Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg px-4 py-2 shadow-lg">
          <span className="text-white/90 text-sm font-semibold tracking-widest uppercase">
            {definition.title}
          </span>
        </div>
      </div>

      {/* Minimal slot badge */}
      <div className="absolute top-2 left-2 backdrop-blur-md bg-black/40 border border-white/30 rounded px-2 py-1">
        <span className="text-xs font-mono text-white font-bold">
          #{definition.slot.toString().padStart(2, '0')}
        </span>
      </div>

      {/* Rarity badge */}
      {evaluationScore !== undefined && (
        <div className="absolute top-2 right-2">
          <RarityBadge rarity={getCardRarity(evaluationScore)} />
        </div>
      )}
    </motion.div>
  );
};