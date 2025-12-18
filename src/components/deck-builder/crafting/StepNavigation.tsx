import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, SkipForward, Sparkles } from 'lucide-react';
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
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border z-50">
      <div className="max-w-2xl mx-auto flex items-center gap-3">
        {/* Previous Button */}
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={isFirstStep}
          className="h-12 px-4"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        {/* Skip Button (if optional) */}
        {isOptionalField && (
          <Button
            variant="ghost"
            onClick={onSkip}
            className="h-12 gap-2 text-muted-foreground"
          >
            <SkipForward className="w-4 h-4" />
            {t('wizard.skip')}
          </Button>
        )}
        
        {/* Main Action Button - Big and Prominent */}
        <Button
          onClick={onNext}
          disabled={!canGoNext && !isOptionalField}
          className="flex-1 h-14 text-lg gap-3 font-semibold"
          size="lg"
        >
          {isLastStep ? (
            <>
              <Sparkles className="w-5 h-5" />
              {t('wizard.reviewForge')}
            </>
          ) : (
            <>
              {t('wizard.next')}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </Button>
      </div>
      
      {/* Keyboard hint */}
      <div className="max-w-2xl mx-auto mt-2 text-center">
        <span className="text-xs text-muted-foreground">
          {t('wizard.pressEnter')}
        </span>
      </div>
    </div>
  );
};
