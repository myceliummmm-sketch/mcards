import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ForgeLoadingState } from './ForgeLoadingState';
import { CardReveal } from './CardReveal';
import { EvaluationMatrix } from './EvaluationMatrix';
import { Sparkles } from 'lucide-react';

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
              className="w-full max-w-2xl space-y-6"
            >
              {/* Card Reveal with flip animation */}
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

              {/* Show evaluation details when complete AND evaluation exists */}
              {forgingStage === 'complete' && evaluation && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="space-y-4"
                >
                  {/* Celebration Header */}
                  <div className="text-center space-y-2">
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
                  </div>

                  {/* Full Evaluation Matrix */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 }}
                  >
                    <EvaluationMatrix evaluation={evaluation} />
                  </motion.div>
                </motion.div>
              )}

              {/* Action Button - ALWAYS show when complete (outside evaluation conditional) */}
              {forgingStage === 'complete' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: evaluation ? 1.6 : 0.8 }}
                  className="flex gap-3 justify-center pt-6 pb-4"
                >
                  <Button
                    onClick={onDismiss}
                    size="lg"
                    className="gap-2 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/30 text-base px-8 py-6"
                  >
                    <Sparkles className="w-5 h-5" />
                    Craft more cards!
                  </Button>
                </motion.div>
              )}
             </motion.div>
           )}
          </div>
        </ScrollArea>
      </motion.div>
    </AnimatePresence>
  );
};
