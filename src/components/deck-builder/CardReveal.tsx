import { motion } from 'framer-motion';
import { ForgeLoadingState } from './ForgeLoadingState';
import { Sparkles } from 'lucide-react';

interface CardRevealProps {
  isRevealing: boolean;
  imageUrl?: string;
  evaluation?: any;
  loadingStage: 'idle' | 'channeling' | 'summoning' | 'evaluating';
}

export const CardReveal = ({ isRevealing, imageUrl, evaluation, loadingStage }: CardRevealProps) => {
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

            {/* Card image */}
            {imageUrl && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="relative"
              >
                <img 
                  src={imageUrl} 
                  alt="Forged card artwork"
                  className="w-full h-56 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                <motion.div 
                  className="absolute top-3 right-3 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-xs font-bold shadow-lg"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                >
                  ✨ FORGED
                </motion.div>
              </motion.div>
            )}

            {/* Fallback when no image */}
            {!imageUrl && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="h-56 flex flex-col items-center justify-center text-muted-foreground gap-3"
              >
                <Sparkles className="w-10 h-10 text-primary" />
                <span className="text-lg font-medium">Card Content Saved</span>
              </motion.div>
            )}

            {/* Overall score badge */}
            {evaluation && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
                className="absolute bottom-3 left-3 bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-full text-sm font-bold shadow-lg"
              >
                Score: {evaluation.overall}/10
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
