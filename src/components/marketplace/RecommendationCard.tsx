import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Sparkles, Target, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

interface RecommendationCardProps {
  cardTitle: string;
  matchScore: number;
  reasons: string[];
  category: 'gap_filler' | 'content_match' | 'related';
  onView: () => void;
}

const categoryConfig = {
  gap_filler: {
    icon: Target,
    label: 'Gap Filler',
    color: 'text-green-500',
    bg: 'bg-green-500/10'
  },
  content_match: {
    icon: Sparkles,
    label: 'Content Match',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10'
  },
  related: {
    icon: Lightbulb,
    label: 'Related',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10'
  }
};

export function RecommendationCard({ cardTitle, matchScore, reasons, category, onView }: RecommendationCardProps) {
  const config = categoryConfig[category];
  const Icon = config.icon;
  const matchPercentage = Math.round(matchScore * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Icon className={`w-4 h-4 flex-shrink-0 ${config.color}`} />
          <h4 className="font-semibold text-sm truncate">{cardTitle}</h4>
        </div>
        <Badge variant="secondary" className={config.bg}>
          {matchPercentage}%
        </Badge>
      </div>

      <div className="space-y-1 mb-3">
        {reasons.slice(0, 2).map((reason, idx) => (
          <p key={idx} className="text-xs text-muted-foreground">
            • {reason}
          </p>
        ))}
      </div>

      <Button 
        size="sm" 
        variant="outline" 
        className="w-full gap-2"
        onClick={onView}
      >
        <Eye className="w-3 h-3" />
        View Card
      </Button>
    </motion.div>
  );
}
