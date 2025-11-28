import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Scale, Star, Palette } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
  const phaseIcons: Record<string, string> = {
    vision: '🔮',
    research: '🔬',
    build: '🔧',
    grow: '🚀'
  };

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
            {balance.phaseBreakdown.map((phase) => (
              <div key={phase.phase} className="flex items-center gap-2">
                <span className="text-sm w-20">
                  {phaseIcons[phase.phase]} {phase.phase}
                </span>
                <Progress value={phase.percentage} className="flex-1 h-2" />
                <span className="text-xs text-muted-foreground w-12 text-right">
                  {phase.filled}/{phase.total}
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
