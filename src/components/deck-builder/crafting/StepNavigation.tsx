import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, SkipForward } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  canGoNext: boolean;
  isOptionalField: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSkip: () => void;
}

export const StepNavigation = ({
  currentStep,
  totalSteps,
  canGoNext,
  isOptionalField,
  onPrevious,
  onNext,
  onSkip
}: StepNavigationProps) => {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between pt-6 border-t border-border">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={isFirstStep}
        className="gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('wizard.previous')}
      </Button>

      <div className="flex items-center gap-3">
        {isOptionalField && (
          <Button
            variant="ghost"
            onClick={onSkip}
            className="gap-2 text-muted-foreground"
          >
            <SkipForward className="w-4 h-4" />
            {t('wizard.skip')}
          </Button>
        )}
        
        <Button
          onClick={onNext}
          disabled={!canGoNext && !isOptionalField}
          className="gap-2 min-w-[120px]"
        >
          {isLastStep ? t('wizard.review') : t('wizard.next')}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="text-xs text-muted-foreground">
        {t('wizard.pressEnter')}
      </div>
    </div>
  );
};