import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: Set<number>;
  onStepClick: (step: number) => void;
}

export const WizardProgress = ({ currentStep, totalSteps, completedSteps, onStepClick }: WizardProgressProps) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-secondary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNum = i + 1;
          const isCompleted = completedSteps.has(stepNum);
          const isCurrent = stepNum === currentStep;
          const isClickable = stepNum <= currentStep || isCompleted;

          return (
            <button
              key={stepNum}
              onClick={() => isClickable && onStepClick(stepNum)}
              disabled={!isClickable}
              className="group relative"
            >
              <motion.div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                  transition-all duration-300
                  ${isCurrent 
                    ? 'bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110' 
                    : isCompleted
                    ? 'bg-secondary text-secondary-foreground'
                    : 'bg-muted text-muted-foreground'
                  }
                  ${isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed opacity-50'}
                `}
                whileHover={isClickable ? { scale: 1.15 } : {}}
                whileTap={isClickable ? { scale: 0.95 } : {}}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  stepNum
                )}
              </motion.div>
              
              {isClickable && (
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  <div className="text-xs text-muted-foreground">
                    Step {stepNum}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Step Counter Text */}
      <div className="text-center">
        <span className="text-sm font-medium text-foreground">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-xs text-muted-foreground ml-2">
          ({completedSteps.size} completed)
        </span>
      </div>
    </div>
  );
};