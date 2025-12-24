import { motion } from 'framer-motion';
import { Lightbulb, AlertTriangle, Target, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProblemCardData {
  id: string;
  answers: number[];
  ai_analysis: {
    problemStatement: string;
    keyInsight: string;
    riskFactor: string;
    firstStep: string;
  } | null;
  created_at: string;
}

interface SavedProblemCardsProps {
  cards: ProblemCardData[];
  onViewCard: (cardId: string) => void;
  onStartNew: () => void;
}

export function SavedProblemCards({ cards, onViewCard, onStartNew }: SavedProblemCardsProps) {
  if (cards.length === 0) {
    return null;
  }

  return (
    <motion.div
      className="mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Your Problem Cards</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onStartNew}
          className="text-[#2E7D32] hover:text-[#2E7D32] hover:bg-[#2E7D32]/10"
        >
          + New Card
        </Button>
      </div>

      <div className="space-y-3">
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#2E7D32]/30 transition-colors cursor-pointer"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
            onClick={() => onViewCard(card.id)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {card.ai_analysis ? (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-[#2E7D32]" />
                      <span className="text-xs text-white/50">Problem Card #{index + 1}</span>
                    </div>
                    <p className="text-white/80 text-sm line-clamp-2 mb-2">
                      {card.ai_analysis.problemStatement}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <Target className="w-3 h-3" />
                      <span className="truncate">{card.ai_analysis.keyInsight}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-white/50">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm">Analysis pending...</span>
                  </div>
                )}
              </div>

              <ArrowRight className="w-5 h-5 text-white/30 flex-shrink-0" />
            </div>

            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-white/40">
              <span>
                {new Date(card.created_at).toLocaleDateString()}
              </span>
              {card.ai_analysis?.riskFactor && (
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">
                  {card.ai_analysis.riskFactor.length > 30 
                    ? card.ai_analysis.riskFactor.slice(0, 30) + '...'
                    : card.ai_analysis.riskFactor
                  }
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
