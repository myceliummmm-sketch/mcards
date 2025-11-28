import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

interface HealthScoreCardProps {
  score: number;
}

export function HealthScoreCard({ score }: HealthScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Great';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 40) return 'Needs Work';
    return 'Critical';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 70) return <TrendingUp className="w-6 h-6 text-green-500" />;
    if (score >= 40) return <Minus className="w-6 h-6 text-yellow-500" />;
    return <TrendingDown className="w-6 h-6 text-red-500" />;
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🏥 Deck Health Score
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="flex items-center justify-between mb-4">
          <div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className={`text-6xl font-bold ${getScoreColor(score)}`}
            >
              {score}
            </motion.div>
            <div className="text-sm text-muted-foreground mt-1">out of 100</div>
          </div>
          <div className="text-center">
            {getScoreIcon(score)}
            <div className={`text-lg font-semibold mt-2 ${getScoreColor(score)}`}>
              {getScoreGrade(score)}
            </div>
          </div>
        </div>
        
        <Progress value={score} className="h-3" />
        
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Health score reflects completion, balance, quality, and variety
        </p>
      </CardContent>
    </Card>
  );
}
