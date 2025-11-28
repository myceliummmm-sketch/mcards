import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GapData {
  phase: string;
  filled: number;
  total: number;
  icon: string;
  color: string;
}

interface GapFinderSidebarProps {
  gaps: GapData[];
  onPhaseClick: (phase: string) => void;
  activePhase?: string;
}

export const GapFinderSidebar = ({ gaps, onPhaseClick, activePhase }: GapFinderSidebarProps) => {
  const totalFilled = gaps.reduce((acc, g) => acc + g.filled, 0);
  const totalSlots = gaps.reduce((acc, g) => acc + g.total, 0);
  const overallProgress = (totalFilled / totalSlots) * 100;

  return (
    <Card className="p-4 space-y-4 sticky top-4 bg-gradient-to-br from-cyan-950/20 to-blue-950/20 border-cyan-500/30">
      <div className="space-y-2">
        <h3 className="font-bold text-lg flex items-center gap-2 text-cyan-400">
          <span className="text-2xl">✨</span>
          Deck Completion
        </h3>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-bold text-cyan-400">
              {totalFilled}/{totalSlots}
            </span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Missing Slots by Phase
        </h4>

        {gaps.map((gap) => {
          const missing = gap.total - gap.filled;
          const progress = (gap.filled / gap.total) * 100;
          const isActive = activePhase === gap.phase;

          return (
            <Button
              key={gap.phase}
              variant="ghost"
              className={cn(
                'w-full justify-start p-3 h-auto transition-all',
                isActive && 'bg-accent border-2 border-cyan-500'
              )}
              onClick={() => onPhaseClick(gap.phase)}
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{gap.icon}</span>
                    <span className="font-medium capitalize">{gap.phase}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {missing > 0 && (
                      <span
                        className={cn(
                          'text-xs font-bold px-2 py-0.5 rounded-full',
                          'bg-red-500/20 text-red-400 border border-red-500/50'
                        )}
                      >
                        -{missing}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {gap.filled}/{gap.total}
                    </span>
                  </div>
                </div>
                <Progress value={progress} className="h-1.5" />
              </div>
            </Button>
          );
        })}
      </div>

      <div className="pt-4 border-t border-border space-y-2">
        <p className="text-xs text-muted-foreground">
          💡 Gap Filler Mode highlights cards that match your missing slots
        </p>
        <Button variant="outline" size="sm" className="w-full" onClick={() => onPhaseClick('')}>
          View All Cards
        </Button>
      </div>
    </Card>
  );
};
