import { motion } from 'framer-motion';
import type { CardDefinition } from '@/data/cardDefinitions';

interface CardFrontProps {
  definition: CardDefinition;
  isEmpty: boolean;
  isComplete: boolean;
  isInsight: boolean;
  preview?: string;
  imageUrl?: string;
}

export const CardFront = ({ 
  definition, 
  imageUrl
}: CardFrontProps) => {
  const getEmptyGradient = () => {
    const phase = definition.phase?.toLowerCase();
    if (phase === 'vision') return 'card-empty-vision';
    if (phase === 'research') return 'card-empty-research';
    if (phase === 'build') return 'card-empty-build';
    if (phase === 'grow') return 'card-empty-grow';
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

      {/* Minimal slot badge */}
      <div className="absolute top-2 left-2 backdrop-blur-md bg-black/40 border border-white/30 rounded px-2 py-1">
        <span className="text-xs font-mono text-white font-bold">
          #{definition.slot.toString().padStart(2, '0')}
        </span>
      </div>
    </motion.div>
  );
};