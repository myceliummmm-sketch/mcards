import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

interface HealthScoreCardProps {
  score: number;
  quality: {
    score: number;
    evaluatedCards: number;
    totalFilled: number;
  };
}

export function HealthScoreCard({ score, quality }: HealthScoreCardProps) {
  const { language } = useLanguage();
  
  // Convert quality score (0-100) to 10-point scale
  const avgCardScore = quality.evaluatedCards > 0 ? (quality.score / 10).toFixed(1) : '—';
  
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-500';
    if (score >= 6) return 'text-yellow-500';
    if (score >= 4) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreGrade = (score: number) => {
    if (language === 'ru') {
      if (score >= 9) return 'Отлично';
      if (score >= 8) return 'Супер';
      if (score >= 7) return 'Хорошо';
      if (score >= 6) return 'Неплохо';
      if (score >= 4) return 'Нужна работа';
      return 'Нет оценок';
    }
    if (score >= 9) return 'Excellent';
    if (score >= 8) return 'Great';
    if (score >= 7) return 'Good';
    if (score >= 6) return 'Fair';
    if (score >= 4) return 'Needs Work';
    return 'No ratings';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 7) return <TrendingUp className="w-6 h-6 text-green-500" />;
    if (score >= 4) return <Minus className="w-6 h-6 text-yellow-500" />;
    return <TrendingDown className="w-6 h-6 text-red-500" />;
  };

  const displayScore = quality.evaluatedCards > 0 ? quality.score / 10 : 0;

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          {language === 'ru' ? 'Средний балл карточек' : 'Average Card Score'}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="flex items-center justify-between mb-4">
          <div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className={`text-6xl font-bold ${getScoreColor(displayScore)}`}
            >
              {avgCardScore}
            </motion.div>
            <div className="text-sm text-muted-foreground mt-1">
              {language === 'ru' ? 'из 10' : 'out of 10'}
            </div>
          </div>
          <div className="text-center">
            {quality.evaluatedCards > 0 ? getScoreIcon(displayScore) : <Minus className="w-6 h-6 text-muted-foreground" />}
            <div className={`text-lg font-semibold mt-2 ${quality.evaluatedCards > 0 ? getScoreColor(displayScore) : 'text-muted-foreground'}`}>
              {quality.evaluatedCards > 0 ? getScoreGrade(displayScore) : (language === 'ru' ? 'Нет оценок' : 'No ratings')}
            </div>
          </div>
        </div>
        
        <Progress value={displayScore * 10} className="h-3" />
        
        <p className="text-xs text-muted-foreground mt-3 text-center">
          {language === 'ru' 
            ? `На основе AI-оценок ${quality.evaluatedCards} из ${quality.totalFilled} карточек`
            : `Based on AI evaluations of ${quality.evaluatedCards} of ${quality.totalFilled} cards`}
        </p>
      </CardContent>
    </Card>
  );
}
