import { Coins } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function SporeWallet() {
  const { sporeBalance, isPro } = useSubscription();

  if (!isPro && sporeBalance === 0) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium">
          <Coins className="h-4 w-4 text-primary" />
          <span>{sporeBalance}</span>
          <span className="text-muted-foreground text-xs">SPORE</span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>Your SPORE balance for marketplace purchases</p>
      </TooltipContent>
    </Tooltip>
  );
}
