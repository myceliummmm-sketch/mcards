import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { WizardProgress } from './WizardProgress';
import { WizardStep } from './WizardStep';
import { AIGuidePanel } from './AIGuidePanel';
import { StepNavigation } from './StepNavigation';
import { SummaryReview } from './SummaryReview';
import { getFieldGuidance, getFieldAIHelper } from '@/data/fieldHints';
import type { CardDefinition } from '@/data/cardDefinitions';
import { useTranslation } from '@/hooks/useTranslation';

interface CardCraftingWizardProps {
  definition: CardDefinition;
  initialData: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
  onForge: (formData: Record<string, any>) => void;
  isForging: boolean;
}

export const CardCraftingWizard = ({ 
  definition, 
  initialData, 
  onChange, 
  onForge,
  isForging 
}: CardCraftingWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isReviewMode, setIsReviewMode] = useState(false);
  const { t } = useTranslation();

  const totalSteps = definition.fields.length;
  
  // Safety check for step bounds
  const safeCurrentStep = Math.min(Math.max(1, currentStep), totalSteps);
  const currentFieldIndex = safeCurrentStep - 1;
  const currentField = definition.fields[currentFieldIndex];
  const currentValue = currentField ? formData[currentField.name] : undefined;

  // Get guidance for current field (now with fallback support)
  const guidance = currentField ? getFieldGuidance(currentField.name, currentField) : null;
  const aiHelper = currentField ? getFieldAIHelper(currentField.name, definition) : definition.aiHelpers[0];

  // Check if current field is complete
  const isCurrentStepComplete = currentValue !== undefined && currentValue !== null && currentValue !== '';

  // Update completed steps
  useEffect(() => {
    if (isCurrentStepComplete && !completedSteps.has(safeCurrentStep)) {
      setCompletedSteps(prev => new Set([...prev, safeCurrentStep]));
    }
  }, [isCurrentStepComplete, safeCurrentStep, completedSteps]);

  // Sync with parent
  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  // Navigation handlers wrapped in useCallback
  const handleNext = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsReviewMode(true);
    }
  }, [currentStep, totalSteps]);

  const handlePrevious = useCallback(() => {
    if (isReviewMode) {
      setIsReviewMode(false);
    } else if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [isReviewMode, currentStep]);

  const handleSkip = useCallback(() => {
    handleNext();
  }, [handleNext]);

  // Keyboard navigation with proper null checks
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && !isReviewMode) {
        // Safe null check for currentField
        if (currentField && (isCurrentStepComplete || !currentField.required)) {
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentField, isCurrentStepComplete, isReviewMode, handleNext]);

  const handleFieldChange = (value: any) => {
    if (!currentField) return;
    setFormData(prev => ({
      ...prev,
      [currentField.name]: value
    }));
  };

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
    setIsReviewMode(false);
  };

  const handleEditFromReview = (fieldIndex: number) => {
    setCurrentStep(fieldIndex + 1);
    setIsReviewMode(false);
  };

  if (isReviewMode) {
    return (
      <div className="space-y-6 pb-32">
        <WizardProgress
          currentStep={totalSteps}
          totalSteps={totalSteps}
          completedSteps={completedSteps}
          onStepClick={handleStepClick}
        />
        
        <SummaryReview
          definition={definition}
          formData={formData}
          onEdit={handleEditFromReview}
          onForge={() => onForge(formData)}
          isForging={isForging}
        />

        <div className="flex justify-start">
          <button
            onClick={handlePrevious}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('wizard.backToEditing')}
          </button>
        </div>
      </div>
    );
  }

  // Ensure we have a valid field before rendering
  if (!currentField || !guidance) {
    return (
      <div className="space-y-6 pb-32">
        <WizardProgress
          currentStep={safeCurrentStep}
          totalSteps={totalSteps}
          completedSteps={completedSteps}
          onStepClick={handleStepClick}
        />
        <div className="flex items-center justify-center py-12">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-muted-foreground"
          >
            Loading step...
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-32">
      {/* Progress Bar */}
      <WizardProgress
        currentStep={safeCurrentStep}
        totalSteps={totalSteps}
        completedSteps={completedSteps}
        onStepClick={handleStepClick}
      />

      {/* AI Guide */}
      <AIGuidePanel characterId={aiHelper} />

      {/* Current Step - No mode prop to prevent flickering */}
      <AnimatePresence>
        <motion.div
          key={`step-${currentField.name}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <WizardStep
            field={currentField}
            guidance={guidance}
            value={currentValue}
            onChange={handleFieldChange}
            isComplete={isCurrentStepComplete}
            cardType={definition.cardType}
            cardDefinition={definition}
            previousAnswers={formData}
          />
        </motion.div>
      </AnimatePresence>

      {/* Fixed Navigation at Bottom */}
      <StepNavigation
        currentStep={safeCurrentStep}
        totalSteps={totalSteps}
        canGoNext={isCurrentStepComplete}
        isOptionalField={!currentField.required}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSkip={handleSkip}
      />
    </div>
  );
};
