import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ForgeLoadingState } from './ForgeLoadingState';
import { CardReveal } from './CardReveal';
import { EvaluationMatrix } from './EvaluationMatrix';
import { Sparkles, X } from 'lucide-react';

interface ForgeRevealOverlayProps {
  isActive: boolean;
  forgingStage: 'idle' | 'forging' | 'revealing' | 'complete';
  loadingStage: 'idle' | 'channeling' | 'summoning' | 'evaluating';
  imageUrl?: string;
  evaluation?: any;
  cardTitle?: string;
  cardType?: string;
  cardData?: Record<string, any>;
  slot?: number;
  onDismiss: () => void;
}

export const ForgeRevealOverlay = ({ 
  isActive, 
  forgingStage, 
  loadingStage, 
  imageUrl, 
  evaluation,
  cardTitle,
  cardType,
  cardData,
  slot,
  onDismiss 
}: ForgeRevealOverlayProps) => {
  if (!isActive || forgingStage === 'idle') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md"
      >
        {/* Close button in top right corner */}
        {forgingStage === 'complete' && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            onClick={onDismiss}
            className="absolute top-6 right-6 z-10 p-2 rounded-full bg-muted/50 hover:bg-muted border border-border/50 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-muted-foreground" />
          </motion.button>
        )}
        
        <ScrollArea className="h-full">
          <div className="min-h-full flex flex-col items-center justify-center p-6 py-12">
          {/* Forging Stage - Show loading animation */}
          {forgingStage === 'forging' && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-lg"
            >
              <ForgeLoadingState stage={loadingStage} />
              <motion.p
                className="text-center text-muted-foreground mt-6 text-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Your card is being forged by the Mycelium system...
              </motion.p>
            </motion.div>
          )}

          {/* Revealing & Complete Stages - Show the magical reveal */}
          {(forgingStage === 'revealing' || forgingStage === 'complete') && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-5xl space-y-6"
            >
              {/* Celebration Header - Full width at top */}
              {forgingStage === 'complete' && evaluation && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="text-center space-y-2"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1, type: 'spring', stiffness: 200 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary/40 rounded-full"
                  >
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span className="text-lg font-bold text-primary">Card Forged Successfully!</span>
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="text-sm text-muted-foreground"
                  >
                    Overall Score: <span className="font-bold text-primary">{evaluation.overall}/10</span>
                  </motion.p>
                </motion.div>
              )}

              {/* Side-by-side layout: Card left, Evaluation right */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Left: Card Reveal */}
                <div className="flex justify-center lg:justify-end">
                  <div className="w-64 sm:w-72 md:w-80 flex-shrink-0">
                    <CardReveal
                      isRevealing={forgingStage === 'revealing' || forgingStage === 'complete'}
                      imageUrl={imageUrl}
                      evaluation={evaluation}
                      loadingStage={loadingStage}
                      cardTitle={cardTitle}
                      cardType={cardType}
                      cardData={cardData}
                      slot={slot}
                    />
                  </div>
                </div>

                {/* Right: Evaluation Matrix */}
                {forgingStage === 'complete' && evaluation && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.4 }}
                    className="flex flex-col justify-start max-w-md"
                  >
                    <EvaluationMatrix evaluation={evaluation} />
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
          </div>
        </ScrollArea>
      </motion.div>
    </AnimatePresence>
  );
};
