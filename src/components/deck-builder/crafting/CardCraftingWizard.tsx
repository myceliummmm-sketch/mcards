import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { WizardProgress } from './WizardProgress';
import { WizardStep } from './WizardStep';
import { AIGuidePanel } from './AIGuidePanel';
import { StepNavigation } from './StepNavigation';
import { SummaryReview } from './SummaryReview';
import { getFieldGuidance, getFieldAIHelper } from '@/data/fieldHints';
import type { CardDefinition } from '@/data/cardDefinitions';

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

  const totalSteps = definition.fields.length;
  const currentFieldIndex = currentStep - 1;
  const currentField = definition.fields[currentFieldIndex];
  const currentValue = formData[currentField?.name];

  // Get guidance for current field
  const guidance = currentField ? getFieldGuidance(currentField.name) : null;
  const aiHelper = currentField ? getFieldAIHelper(currentField.name, definition) : definition.aiHelpers[0];

  // Check if current field is complete
  const isCurrentStepComplete = currentValue !== undefined && currentValue !== null && currentValue !== '';

  // Update completed steps
  useEffect(() => {
    if (isCurrentStepComplete && !completedSteps.has(currentStep)) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
    }
  }, [isCurrentStepComplete, currentStep]);

  // Sync with parent
  useEffect(() => {
    onChange(formData);
  }, [formData]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && !isReviewMode) {
        if (isCurrentStepComplete || !currentField.required) {
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentStep, isCurrentStepComplete, currentField, isReviewMode]);

  const handleFieldChange = (value: any) => {
    setFormData(prev => ({
      ...prev,
      [currentField.name]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsReviewMode(true);
    }
  };

  const handlePrevious = () => {
    if (isReviewMode) {
      setIsReviewMode(false);
    } else if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    handleNext();
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
      <div className="space-y-6">
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
            ← Back to editing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <WizardProgress
        currentStep={currentStep}
        totalSteps={totalSteps}
        completedSteps={completedSteps}
        onStepClick={handleStepClick}
      />

      {/* AI Guide */}
      <AIGuidePanel characterId={aiHelper} />

      {/* Current Step */}
      <AnimatePresence mode="wait">
        {currentField && guidance && (
          <WizardStep
            key={currentField.name}
            field={currentField}
            guidance={guidance}
            value={currentValue}
            onChange={handleFieldChange}
            isComplete={isCurrentStepComplete}
            cardType={definition.cardType}
            cardDefinition={definition}
            previousAnswers={formData}
          />
        )}
      </AnimatePresence>

      {/* Navigation */}
      <StepNavigation
        currentStep={currentStep}
        totalSteps={totalSteps}
        canGoNext={isCurrentStepComplete}
        isOptionalField={!currentField?.required}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSkip={handleSkip}
      />
    </div>
  );
};