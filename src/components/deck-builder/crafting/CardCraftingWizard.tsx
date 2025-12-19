import { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { WizardProgress } from './WizardProgress';
import { WizardStep } from './WizardStep';
import { AIGuidePanel } from './AIGuidePanel';
import { StepNavigation } from './StepNavigation';
import { SummaryReview } from './SummaryReview';
import { getFieldGuidance, getFieldAIHelper } from '@/data/fieldHints';
import type { CardDefinition } from '@/data/cardDefinitions';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';

interface CardCraftingWizardProps {
  definition: CardDefinition;
  initialData: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
  onForge: (formData: Record<string, any>) => void;
  isForging: boolean;
  deckId?: string;
}

export const CardCraftingWizard = ({
  definition,
  initialData,
  onChange,
  onForge,
  isForging,
  deckId
}: CardCraftingWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const { refetch: refetchSubscription, sporeBalance } = useSubscription();
  const isInitialMount = useRef(true);
  const lastSyncedData = useRef<string>(JSON.stringify(initialData));
  const lastInitialData = useRef<string>(JSON.stringify(initialData));

  // Sync internal state when initialData prop changes (e.g., opening a different card)
  // Only reset if the new data is NOT from our own onChange call (avoids infinite loop)
  useEffect(() => {
    const newInitialDataStr = JSON.stringify(initialData);
    // If this data matches what we just synced to parent, ignore it (it's our own data coming back)
    if (newInitialDataStr === lastSyncedData.current) {
      return;
    }
    // Only reset if it's truly different initial data (opening a different card)
    if (newInitialDataStr !== lastInitialData.current) {
      lastInitialData.current = newInitialDataStr;
      lastSyncedData.current = newInitialDataStr;
      setFormData(initialData);
      setCurrentStep(1);
      setCompletedSteps(new Set());
      setIsReviewMode(false);
      isInitialMount.current = true;
    }
  }, [initialData]);
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

  // Sync with parent only when user makes changes (not on mount or parent updates)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    const currentDataStr = JSON.stringify(formData);
    if (currentDataStr !== lastSyncedData.current) {
      lastSyncedData.current = currentDataStr;
      onChange(formData);
    }
  }, [formData]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore Enter key in textareas (should create new line instead)
      const target = e.target as HTMLElement;
      if (target.tagName === 'TEXTAREA') return;

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

  // AI Auto-complete entire card
  const handleAIAutoComplete = async () => {
    if (!deckId || isAIGenerating) return;

    if (sporeBalance < 10) {
      toast({
        title: language === 'ru' ? '❌ Недостаточно SPORE' : '❌ Not enough SPORE',
        description: language === 'ru' ? 'Нужно 10 SPORE для AI генерации' : 'Need 10 SPORE for AI generation',
        variant: 'destructive'
      });
      return;
    }

    setIsAIGenerating(true);
    toast({
      title: language === 'ru' ? '✨ AI генерирует карточку...' : '✨ AI generating card...',
      description: language === 'ru' ? 'Подождите несколько секунд' : 'Please wait a few seconds'
    });

    try {
      const { data, error } = await supabase.functions.invoke('auto-complete-single-card', {
        body: {
          deckId,
          slot: definition.slot,
          language
        }
      });

      if (error) throw error;

      if (data.success && data.cardData) {
        // Merge AI generated data with existing form data
        const newFormData = { ...formData, ...data.cardData };
        setFormData(newFormData);
        lastSyncedData.current = JSON.stringify(newFormData);
        onChange(newFormData);

        // Mark all steps as completed
        const allSteps = new Set(definition.fields.map((_, i) => i + 1));
        setCompletedSteps(allSteps);

        toast({
          title: language === 'ru' ? '✅ Карточка сгенерирована!' : '✅ Card generated!',
          description: language === 'ru' ? 'Проверьте и отредактируйте при необходимости' : 'Review and edit if needed'
        });

        // Refresh subscription to update SPORE balance
        refetchSubscription();
      } else {
        throw new Error(data.error || 'Failed to generate');
      }
    } catch (error) {
      console.error('AI auto-complete error:', error);
      toast({
        title: language === 'ru' ? '❌ Ошибка генерации' : '❌ Generation failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsAIGenerating(false);
    }
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
          hasExistingCard={Object.keys(initialData).length > 0}
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
            onAIAutoComplete={deckId ? handleAIAutoComplete : undefined}
            isAIGenerating={isAIGenerating}
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