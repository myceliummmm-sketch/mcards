import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Gift, Globe, FileText, Zap, DollarSign, RefreshCw, Bot, Sparkles, Target } from 'lucide-react';
import type { CardPhase } from '@/data/cardDefinitions';
import { useTranslation } from '@/hooks/useTranslation';
import { Separator } from '@/components/ui/separator';

interface RewardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phase: CardPhase;
  // Auto-complete props (only for vision phase)
  onAutoComplete?: () => void;
  sporeBalance?: number;
  autoCompleteCost?: number;
  canAutoComplete?: boolean;
  card1Filled?: boolean;
  cards2to5Empty?: boolean;
}

const REWARD_ICONS: Record<CardPhase, React.ElementType> = {
  idea: Globe,
  research: FileText,
  build: Zap,
  grow: DollarSign,
  pivot: RefreshCw,
};

const REWARD_ICON_COLORS: Record<CardPhase, string> = {
  idea: 'text-violet-400',
  research: 'text-amber-400',
  build: 'text-blue-400',
  grow: 'text-green-400',
  pivot: 'text-purple-400',
};

export const RewardModal = ({ 
  open, 
  onOpenChange, 
  phase,
  onAutoComplete,
  sporeBalance = 0,
  autoCompleteCost = 40,
  canAutoComplete = false,
  card1Filled = false,
  cards2to5Empty = true,
}: RewardModalProps) => {
  const { t } = useTranslation();
  const IconComponent = REWARD_ICONS[phase];
  const iconColor = REWARD_ICON_COLORS[phase];

  const showAutoComplete = phase === 'idea' && onAutoComplete;
  const canAfford = sporeBalance >= autoCompleteCost;
  const canProceed = card1Filled && cards2to5Empty && canAfford;

  const getAutoCompleteError = () => {
    if (!card1Filled) return t('autoComplete.errors.fillCard1');
    if (!cards2to5Empty) return t('autoComplete.errors.alreadyStarted');
    if (!canAfford) return `${t('autoComplete.errors.needSpores')} ${autoCompleteCost}🍄`;
    return null;
  };

  const autoCompleteError = showAutoComplete ? getAutoCompleteError() : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-amber-500/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-400/50 flex items-center justify-center">
              <IconComponent className={`w-6 h-6 ${iconColor}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-amber-400" />
                <span className="text-amber-200/80 text-sm font-normal">{t('rewards.phaseReward')}</span>
              </div>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300">
                {t(`rewards.${phase}.title`)}
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Description */}
          <p className="text-muted-foreground text-sm">
            {t(`rewards.${phase}.description`)}
          </p>

          {/* Benefits */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground">{t('rewards.whatsIncluded')}</h4>
            <ul className="space-y-1.5">
              {[1, 2, 3, 4].map((index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  {t(`rewards.${phase}.benefit${index}`)}
                </li>
              ))}
            </ul>
          </div>

          {/* Full Description */}
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-sm text-amber-200/90 leading-relaxed">
              {t(`rewards.${phase}.fullDescription`)}
            </p>
          </div>

          {/* Auto-Complete Section - Only for Vision phase */}
          {showAutoComplete && (
            <>
              <Separator className="bg-border/50" />
              
              <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-violet-500/10 border border-violet-500/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-400/50 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-violet-200">{t('autoComplete.title')}</h4>
                    <p className="text-xs text-muted-foreground">{t('autoComplete.subtitle')}</p>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-violet-200/80">
                    <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                    {t('autoComplete.feature1')}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-violet-200/80">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    {t('autoComplete.feature2')}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-violet-200/80">
                    <Target className="w-3.5 h-3.5 text-green-400" />
                    {t('autoComplete.feature3')}
                  </div>
                </div>

                {/* Cost and Balance */}
                <div className="flex items-center justify-between mb-3 p-2 rounded-lg bg-black/20">
                  <span className="text-sm text-muted-foreground">{t('autoComplete.cost')}: <span className="font-bold text-amber-300">{autoCompleteCost}🍄</span></span>
                  <span className="text-xs text-muted-foreground">{t('autoComplete.balance')}: {sporeBalance}🍄</span>
                </div>

                {/* Error */}
                {autoCompleteError && (
                  <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs mb-3">
                    {autoCompleteError}
                  </div>
                )}

                {/* Button */}
                <Button
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                  onClick={() => {
                    onOpenChange(false);
                    onAutoComplete();
                  }}
                  disabled={!canProceed}
                >
                  <Bot className="w-4 h-4 mr-2" />
                  {t('autoComplete.generate')} - {autoCompleteCost}🍄
                </Button>
              </div>
            </>
          )}

          {/* Unlock hint */}
          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground">
              {t('rewards.unlockHint')}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
