import { Coins } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslation } from '@/hooks/useTranslation';
import { APP_VERSION } from '@/data/appVersion';

export function SporeWallet() {
  const { sporeBalance, isPro } = useSubscription();
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      {/* Version Badge */}
      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted/50 border border-border text-xs font-medium text-muted-foreground">
        <span>v{APP_VERSION}</span>
      </div>

      {/* Spore Balance */}
      {(isPro || sporeBalance > 0) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium">
              <Coins className="h-4 w-4 text-primary" />
              <span>{sporeBalance}</span>
              <span className="text-muted-foreground text-xs">SPORE</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('paywall.sporeBalance')}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}