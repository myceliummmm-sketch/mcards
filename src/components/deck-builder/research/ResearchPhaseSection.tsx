import { motion } from 'framer-motion';
import { CARD_DEFINITIONS, RESEARCH_CARD_SLOTS } from '@/data/cardDefinitions';
import { useResearch } from '@/hooks/useResearch';
import { ResearchCard } from './ResearchCard';
import { Progress } from '@/components/ui/progress';
import { Lock, Unlock, CheckCircle } from 'lucide-react';

interface ResearchPhaseSectionProps {
  deckId: string;
}

export function ResearchPhaseSection({ deckId }: ResearchPhaseSectionProps) {
  const {
    isReady,
    results,
    isLoading,
    isResearching,
    startResearch,
    acceptResearch,
    discussResearch,
    getResultForSlot,
    canResearchSlot
  } = useResearch(deckId);

  const researchCards = CARD_DEFINITIONS.filter(c => RESEARCH_CARD_SLOTS.includes(c.slot));
  const acceptedCount = results.filter(r => r.status === 'accepted').length;
  const progressPercent = (acceptedCount / 5) * 100;

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <div className="animate-pulse">Loading research status...</div>
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔬</span>
          <div>
            <h2 className="text-xl font-bold text-foreground">RESEARCH</h2>
            <p className="text-sm text-muted-foreground">
              AI-powered market research • {acceptedCount}/5 complete
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isReady ? (
            <Unlock className="w-4 h-4 text-green-500" />
          ) : (
            <Lock className="w-4 h-4 text-muted-foreground" />
          )}
          <span className="text-sm text-muted-foreground">
            {isReady ? 'Ready to research' : 'Complete Vision cards first'}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-3">
        <Progress value={progressPercent} className="flex-1 h-2" />
        <span className="text-sm font-medium text-foreground">{acceptedCount}/5</span>
      </div>

      {/* Not Ready State */}
      {!isReady && (
        <div className="bg-muted/50 rounded-xl p-6 text-center">
          <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Complete Vision Phase First
          </h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Fill out all 5 Vision cards to unlock AI-powered research. 
            The team will analyze market data based on your vision.
          </p>
        </div>
      )}

      {/* Research Cards Grid */}
      {isReady && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {researchCards.map((definition) => {
            const result = getResultForSlot(definition.slot);
            const isUnlocked = canResearchSlot(definition.slot);
            const isCurrentlyResearching = isResearching === definition.slot;

            return (
              <ResearchCard
                key={definition.slot}
                definition={definition}
                result={result}
                isUnlocked={isUnlocked}
                isResearching={isCurrentlyResearching}
                onStartResearch={() => startResearch(definition.slot)}
                onAccept={() => acceptResearch(definition.slot)}
                onDiscuss={(msg, char) => discussResearch(definition.slot, msg, char)}
                deckId={deckId}
              />
            );
          })}
        </div>
      )}

      {/* Completion State */}
      {acceptedCount === 5 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-green-500/10 to-primary/10 rounded-xl p-6 text-center border border-green-500/20"
        >
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Research Phase Complete! 🎉
          </h3>
          <p className="text-muted-foreground text-sm">
            You've completed all research cards. Time to move to the Build phase!
          </p>
        </motion.div>
      )}
    </motion.section>
  );
}