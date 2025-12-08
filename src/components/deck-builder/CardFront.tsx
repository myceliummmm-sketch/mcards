import { motion } from 'framer-motion';
import type { CardDefinition } from '@/data/cardDefinitions';
import { RarityBadge } from '@/components/marketplace/RarityBadge';
import { Rarity } from '@/data/rarityConfig';
import { PhaseIcon } from './PhaseIcon';
import { useTranslation } from '@/hooks/useTranslation';

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
  const { t } = useTranslation();

  const getPhaseGlowClass = () => {
    const phase = definition.phase?.toLowerCase();
    if (phase === 'vision') return 'phase-glow-vision';
    if (phase === 'research') return 'phase-glow-research';
    if (phase === 'build') return 'phase-glow-build';
    if (phase === 'grow') return 'phase-glow-grow';
    if (phase === 'pivot') return 'phase-glow-pivot';
    return 'phase-glow-vision';
  };

  return (
    <motion.div
      className="relative w-full h-full overflow-hidden"
      whileHover={{ scale: 1.01 }}
    >
      {/* Background: Image or cyberpunk empty state */}
      <div className="absolute inset-0">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt="Crystal specimen"
            className="w-full h-full object-cover"
          />
        ) : (
          /* Cyberpunk Empty Card State */
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* Dark cyberpunk base */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
            
            {/* Animated grid mesh */}
            <div className="absolute inset-0 card-empty-grid" />
            
            {/* Phase-colored radial glow */}
            <div className={`absolute inset-0 ${getPhaseGlowClass()}`} />
            
            {/* Center orb with phase icon */}
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/20 flex items-center justify-center orb-pulse backdrop-blur-sm">
                <PhaseIcon phase={definition.phase} size="lg" className="opacity-60" />
              </div>
              <span className="text-[10px] text-white/40 font-mono tracking-[0.2em] uppercase">
                {t('cardEditor.awaitingForge')}
              </span>
            </div>
            
            {/* Scanlines overlay */}
            <div className="absolute inset-0 card-empty-scanlines pointer-events-none" />
          </div>
        )}
      </div>

      {/* Subtle dark overlay for forged cards */}
      {imageUrl && <div className="absolute inset-0 bg-black/20" />}

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