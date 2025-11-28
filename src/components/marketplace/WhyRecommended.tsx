import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Check } from 'lucide-react';

interface WhyRecommendedProps {
  reasons: string[];
  matchScore: number;
  category: string;
}

export function WhyRecommended({ reasons, matchScore, category }: WhyRecommendedProps) {
  const matchPercentage = Math.round(matchScore * 100);

  const categoryLabels: Record<string, string> = {
    gap_filler: 'Gap Filler',
    content_match: 'Content Match',
    related: 'Related Insight'
  };

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="w-5 h-5 text-primary" />
          Why This Is Recommended For You
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-sm">
            {categoryLabels[category] || 'Recommended'}
          </Badge>
          <div className="flex-1">
            <Progress value={matchPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {matchPercentage}% match with your deck
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {reasons.map((reason, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm">{reason}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
