import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Scale, Star, Palette } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PhaseIcon } from '../PhaseIcon';
import type { CardPhase } from '@/data/cardDefinitions';

interface PhaseBreakdown {
  phase: string;
  filled: number;
  total: number;
  percentage: number;
}

interface MetricBreakdownProps {
  completion: {
    score: number;
    filled: number;
    total: number;
  };
  balance: {
    score: number;
    phaseBreakdown: PhaseBreakdown[];
  };
  quality: {
    score: number;
    evaluatedCards: number;
    totalFilled: number;
  };
  variety: {
    score: number;
    uniqueTypes: number;
  };
}

export function MetricBreakdown({ completion, balance, quality, variety }: MetricBreakdownProps) {

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Completion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            Completion
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{completion.score}%</span>
            <span className="text-sm text-muted-foreground">
              {completion.filled}/{completion.total} cards
            </span>
          </div>
          <Progress value={completion.score} className="h-2" />
        </CardContent>
      </Card>

      {/* Balance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Scale className="w-5 h-5 text-blue-500" />
            Phase Balance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold">{balance.score}%</span>
            <span className="text-sm text-muted-foreground">Even distribution</span>
          </div>
          <div className="space-y-2">
            {balance.phaseBreakdown.map((phaseData) => (
              <div key={phaseData.phase} className="flex items-center gap-2">
                <div className="flex items-center gap-1 w-24">
                  <PhaseIcon phase={phaseData.phase as CardPhase} size="xs" />
                  <span className="text-sm capitalize">{phaseData.phase}</span>
                </div>
                <Progress value={phaseData.percentage} className="flex-1 h-2" />
                <span className="text-xs text-muted-foreground w-12 text-right">
                  {phaseData.filled}/{phaseData.total}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quality */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Star className="w-5 h-5 text-yellow-500" />
            Content Quality
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{quality.score}%</span>
            <Badge variant="secondary">
              {quality.evaluatedCards} evaluated
            </Badge>
          </div>
          <Progress value={quality.score} className="h-2" />
          <p className="text-xs text-muted-foreground">
            Based on AI evaluation scores from {quality.evaluatedCards} of {quality.totalFilled} filled cards
          </p>
        </CardContent>
      </Card>

      {/* Variety */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="w-5 h-5 text-purple-500" />
            Card Variety
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{variety.score}%</span>
            <span className="text-sm text-muted-foreground">
              {variety.uniqueTypes} types
            </span>
          </div>
          <Progress value={variety.score} className="h-2" />
          <p className="text-xs text-muted-foreground">
            Diversity of card types improves deck comprehensiveness
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
