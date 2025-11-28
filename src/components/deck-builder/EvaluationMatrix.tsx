import { motion } from 'framer-motion';
import { EvaluationScore } from './EvaluationScore';

interface Evaluation {
  depth: { score: number; explanation: string; evaluator: string };
  relevance: { score: number; explanation: string; evaluator: string };
  credibility: { score: number; explanation: string; evaluator: string };
  actionability: { score: number; explanation: string; evaluator: string };
  impact: { score: number; explanation: string; evaluator: string };
  clarity: { score: number; explanation: string; evaluator: string };
  market_fit: { score: number; explanation: string; evaluator: string };
  overall: number;
}

interface EvaluationMatrixProps {
  evaluation: Evaluation;
}

export const EvaluationMatrix = ({ evaluation }: EvaluationMatrixProps) => {
  const criteria = [
    { key: 'depth', ...evaluation.depth },
    { key: 'relevance', ...evaluation.relevance },
    { key: 'credibility', ...evaluation.credibility },
    { key: 'actionability', ...evaluation.actionability },
    { key: 'impact', ...evaluation.impact },
    { key: 'clarity', ...evaluation.clarity },
    { key: 'market_fit', ...evaluation.market_fit },
  ];

  const getOverallColor = (score: number) => {
    if (score >= 8) return 'hsl(180 70% 50%)';
    if (score >= 6) return 'hsl(140 50% 50%)';
    return 'hsl(0 0% 50%)';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 p-6 bg-background/50 border border-border rounded-lg"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-mono font-bold text-primary uppercase tracking-wider">
          // EVALUATION MATRIX
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-xs text-muted-foreground">Overall Score:</span>
          <span 
            className="text-2xl font-bold font-mono"
            style={{ color: getOverallColor(evaluation.overall) }}
          >
            {evaluation.overall}/10
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {criteria.map((criterion, index) => (
          <motion.div
            key={criterion.key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <EvaluationScore
              criterion={criterion.key}
              score={criterion.score}
              explanation={criterion.explanation}
              evaluator={criterion.evaluator}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
