import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { HealthScoreCard } from './HealthScoreCard';
import { MetricBreakdown } from './MetricBreakdown';
import { AITipsPanel } from './AITipsPanel';
import { useDeckHealth } from '@/hooks/useDeckHealth';
import { Skeleton } from '@/components/ui/skeleton';

interface DeckHealthDashboardProps {
  deckId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DeckHealthDashboard({ deckId, isOpen, onClose }: DeckHealthDashboardProps) {
  const { healthData, isLoading, refresh } = useDeckHealth(deckId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Deck Health Dashboard</span>
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        ) : healthData ? (
          <div className="space-y-6">
            {/* Overall Score */}
            <HealthScoreCard score={healthData.overallScore} />

            {/* Metrics Breakdown */}
            <MetricBreakdown
              completion={healthData.metrics.completion}
              balance={healthData.metrics.balance}
              quality={healthData.metrics.quality}
              variety={healthData.metrics.variety}
            />

            {/* AI Tips */}
            <AITipsPanel
              summary={healthData.insights.summary}
              tips={healthData.insights.tips}
              strengths={healthData.insights.strengths}
              nextAction={healthData.insights.nextAction}
            />

            <p className="text-xs text-muted-foreground text-center">
              Last analyzed: {new Date(healthData.lastAnalyzed).toLocaleString()}
            </p>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Failed to load health data. Please try refreshing.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
