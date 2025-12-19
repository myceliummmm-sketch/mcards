import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, Clock, Sparkles, Gift, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TEAM_CHARACTERS } from '@/data/teamCharacters';
import { useTranslation } from '@/hooks/useTranslation';
import { Badge } from '@/components/ui/badge';

interface CardProgress {
  slot: number;
  title: string;
  status: 'pending' | 'generating' | 'complete';
  characterId?: string;
}

interface AutoCompleteVisionOverlayProps {
  isActive: boolean;
  cardProgress: CardProgress[];
  isComplete: boolean;
  onDismiss: () => void;
}

export const AutoCompleteVisionOverlay = ({
  isActive,
  cardProgress,
  isComplete,
  onDismiss,
}: AutoCompleteVisionOverlayProps) => {
  const { t } = useTranslation();

  const getStatusIcon = (status: CardProgress['status']) => {
    switch (status) {
      case 'complete':
        return <Check className="w-5 h-5 text-green-400" />;
      case 'generating':
        return <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground/50" />;
    }
  };

  const getStatusText = (card: CardProgress) => {
    switch (card.status) {
      case 'complete':
        return t('autoComplete.progress.complete');
      case 'generating':
        const character = card.characterId ? TEAM_CHARACTERS[card.characterId] : null;
        return character 
          ? `${character.name} ${t('autoComplete.progress.generating')}`
          : t('autoComplete.progress.generatingGeneric');
      default:
        return t('autoComplete.progress.pending');
    }
  };

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md"
        >
          {/* Close button */}
          {isComplete && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              onClick={onDismiss}
              className="absolute top-6 right-6 z-10 p-2 rounded-full bg-muted/50 hover:bg-muted border border-border/50 transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6 text-muted-foreground" />
            </motion.button>
          )}

          <ScrollArea className="h-full">
            <div className="min-h-full flex flex-col items-center justify-center p-6 py-12">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-lg w-full"
              >
                {/* Header */}
                <div className="text-center mb-8">
                  {isComplete ? (
                    <>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 10 }}
                        className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-400/50 flex items-center justify-center"
                      >
                        <Sparkles className="w-10 h-10 text-green-400" />
                      </motion.div>
                      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-emerald-200 to-green-300">
                        {t('autoComplete.complete.title')}
                      </h2>
                      <p className="text-muted-foreground mt-2">
                        {t('autoComplete.complete.subtitle')}
                      </p>
                    </>
                  ) : (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 border-2 border-violet-400/50 flex items-center justify-center"
                      >
                        <Loader2 className="w-10 h-10 text-violet-400" />
                      </motion.div>
                      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-purple-200 to-violet-300">
                        {t('autoComplete.inProgress.title')}
                      </h2>
                      <p className="text-muted-foreground mt-2">
                        {t('autoComplete.inProgress.subtitle')}
                      </p>
                    </>
                  )}
                </div>

                {/* Progress Cards */}
                <div className="space-y-3">
                  {cardProgress.map((card, index) => {
                    const character = card.characterId ? TEAM_CHARACTERS[card.characterId] : null;
                    
                    return (
                      <motion.div
                        key={card.slot}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-xl border transition-all ${
                          card.status === 'complete'
                            ? 'bg-green-500/10 border-green-500/30'
                            : card.status === 'generating'
                            ? 'bg-violet-500/10 border-violet-500/30 animate-pulse'
                            : 'bg-muted/20 border-border/30'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {/* Avatar or placeholder */}
                          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2" 
                            style={{ borderColor: character?.color || 'hsl(var(--border))' }}
                          >
                            {character ? (
                              <img src={character.avatar} alt={character.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-muted flex items-center justify-center">
                                <span className="text-lg">{card.slot}</span>
                              </div>
                            )}
                          </div>

                          {/* Card info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground">
                                Card {card.slot}: {card.title}
                              </span>
                              {card.status === 'complete' && (
                                <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-xs">
                                  EPIC
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {getStatusText(card)}
                            </p>
                          </div>

                          {/* Status icon */}
                          <div className="flex-shrink-0">
                            {getStatusIcon(card.status)}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Completion reward */}
                {isComplete && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 p-6 rounded-xl bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-amber-500/20 border border-amber-500/30"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Gift className="w-6 h-6 text-amber-400" />
                      <span className="font-bold text-amber-200">
                        {t('autoComplete.complete.rewardUnlocked')}
                      </span>
                    </div>
                    <p className="text-sm text-amber-200/80">
                      {t('autoComplete.complete.rewardDescription')}
                    </p>
                  </motion.div>
                )}

                {/* Action button */}
                {isComplete && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mt-6 flex justify-center"
                  >
                    <Button
                      size="lg"
                      onClick={onDismiss}
                      className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                    >
                      {t('autoComplete.complete.viewCards')}
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </ScrollArea>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
