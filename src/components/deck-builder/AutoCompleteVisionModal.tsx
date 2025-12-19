import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap, Target, Bot } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface AutoCompleteVisionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: () => void;
  sporeBalance: number;
  cost: number;
  canAfford: boolean;
  card1Filled: boolean;
  cards2to5Empty: boolean;
}

export const AutoCompleteVisionModal = ({
  open,
  onOpenChange,
  onGenerate,
  sporeBalance,
  cost,
  canAfford,
  card1Filled,
  cards2to5Empty,
}: AutoCompleteVisionModalProps) => {
  const { t } = useTranslation();

  const canProceed = card1Filled && cards2to5Empty && canAfford;

  const getErrorMessage = () => {
    if (!card1Filled) return t('autoComplete.errors.fillCard1');
    if (!cards2to5Empty) return t('autoComplete.errors.alreadyStarted');
    if (!canAfford) return `${t('autoComplete.errors.needSpores')} ${cost}🍄`;
    return null;
  };

  const errorMessage = getErrorMessage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-violet-500/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-400/50 flex items-center justify-center">
              <Bot className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-purple-200 to-violet-300">
                {t('autoComplete.title')}
              </span>
            </div>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {t('autoComplete.subtitle')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Description */}
          <p className="text-muted-foreground text-sm">
            {t('autoComplete.description')}
          </p>

          {/* Features */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
              <Sparkles className="w-5 h-5 text-violet-400 flex-shrink-0" />
              <span className="text-sm text-violet-200/90">{t('autoComplete.feature1')}</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
              <Zap className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <span className="text-sm text-violet-200/90">{t('autoComplete.feature2')}</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
              <Target className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span className="text-sm text-violet-200/90">{t('autoComplete.feature3')}</span>
            </div>
          </div>

          {/* Cost */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 border border-amber-500/30">
            <div className="flex items-center justify-between">
              <span className="text-amber-200/90 font-medium">{t('autoComplete.cost')}</span>
              <span className="text-xl font-bold text-amber-300">{cost}🍄</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('autoComplete.balance')}: {sporeBalance}🍄
            </div>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              {errorMessage}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
              onClick={onGenerate}
              disabled={!canProceed}
            >
              <Bot className="w-4 h-4 mr-2" />
              {t('autoComplete.generate')} - {cost}🍄
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
