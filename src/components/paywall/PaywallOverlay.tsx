import { useState } from 'react';
import { Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UpgradeModal } from './UpgradeModal';

interface PaywallOverlayProps {
  phase: string;
  children?: React.ReactNode;
}

export function PaywallOverlay({ phase, children }: PaywallOverlayProps) {
  const [showUpgrade, setShowUpgrade] = useState(false);

  const phaseLabels: Record<string, string> = {
    build: 'Build',
    grow: 'Grow',
  };

  return (
    <>
      <div className="relative">
        {/* Blurred content behind */}
        <div className="blur-sm opacity-50 pointer-events-none select-none">
          {children}
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg border border-border">
          <div className="text-center p-6 max-w-sm">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            
            <h3 className="text-xl font-semibold mb-2">
              {phaseLabels[phase] || phase} Phase Locked
            </h3>
            
            <p className="text-muted-foreground text-sm mb-6">
              Upgrade to Pro to unlock the {phaseLabels[phase]?.toLowerCase() || phase} phase and take your ideas to the next level.
            </p>
            
            <Button onClick={() => setShowUpgrade(true)} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Unlock for $29/mo
            </Button>
          </div>
        </div>
      </div>

      <UpgradeModal open={showUpgrade} onOpenChange={setShowUpgrade} />
    </>
  );
}
