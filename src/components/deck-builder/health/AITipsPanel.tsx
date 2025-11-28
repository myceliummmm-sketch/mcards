import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Tip {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'completion' | 'balance' | 'quality' | 'variety';
}

interface AITipsPanelProps {
  summary: string;
  tips: Tip[];
  strengths: string[];
  nextAction: string;
}

export function AITipsPanel({ summary, tips, strengths, nextAction }: AITipsPanelProps) {
  const priorityColors = {
    high: 'bg-red-500/10 text-red-500 border-red-500/30',
    medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
    low: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  };

  const categoryIcons = {
    completion: '✅',
    balance: '⚖️',
    quality: '⭐',
    variety: '🎨',
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <Alert>
        <Sparkles className="w-4 h-4" />
        <AlertDescription className="ml-2">
          {summary}
        </AlertDescription>
      </Alert>

      {/* Strengths */}
      {strengths.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle className="w-5 h-5 text-green-500" />
              What's Working Well
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {strengths.map((strength, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Improvement Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertCircle className="w-5 h-5 text-primary" />
            AI-Powered Improvement Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tips.map((tip, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg border bg-card/50 space-y-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-lg">{categoryIcons[tip.category]}</span>
                  <h4 className="font-semibold text-sm">{tip.title}</h4>
                </div>
                <Badge className={priorityColors[tip.priority]} variant="outline">
                  {tip.priority}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground pl-7">
                {tip.description}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Next Action */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            🎯 Next Best Action
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-medium">{nextAction}</p>
        </CardContent>
      </Card>
    </div>
  );
}
