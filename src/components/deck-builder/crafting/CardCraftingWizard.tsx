import { useEffect, useRef } from 'react';
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
import { useSubscription } from '@/hooks/useSubscription';
import { useCardCrafting } from '@/hooks/useCardCrafting';

interface CardCraftingWizardProps {
  definition: CardDefinition;
  initialData: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
  onForge: (formData: Record<string, any>) => void;
  isForging: boolean;
  deckId?: string;
  hasExistingCard?: boolean;
}

export const CardCraftingWizard = ({
  definition,
  initialData,
  onChange,
  onForge,
  isForging,
  deckId,
  hasExistingCard = false
}: CardCraftingWizardProps) => {
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const { refetch: refetchSubscription, sporeBalance } = useSubscription();

  // Use the crafting hook for all state and actions
  const {
    state,
    currentField,
    currentValue,
    isCurrentStepComplete,
    totalSteps,
    refs,
    actions
  } = useCardCrafting(definition, initialData, deckId);

  const { currentStep, formData, completedSteps, isReviewMode, isAIGenerating } = state;
  const { lastSyncedData, isInitialMount } = refs;
  
  // Track previous initialData to detect when a DIFFERENT card is opened
  const prevInitialDataRef = useRef<string>(JSON.stringify(initialData));

  // Get guidance for current field
  const guidance = currentField ? getFieldGuidance(currentField.name) : null;
  const aiHelper = currentField ? getFieldAIHelper(currentField.name, definition) : definition.aiHelpers[0];

  // Sync internal state ONLY when a different card is opened (initialData changes externally)
  // Do NOT include formData in dependencies - that causes infinite loop!
  useEffect(() => {
    const newInitialDataStr = JSON.stringify(initialData);
    
    // If initialData hasn't changed from what we tracked, do nothing
    if (newInitialDataStr === prevInitialDataRef.current) {
      return;
    }
    
    // initialData changed - this means a different card was opened
    prevInitialDataRef.current = newInitialDataStr;
    
    // Only reset if the new data is actually different from current synced data
    if (newInitialDataStr !== lastSyncedData.current) {
      actions.resetState(initialData);
    }
  }, [initialData, actions, lastSyncedData]);

  // Update completed steps when current field is filled
  useEffect(() => {
    if (isCurrentStepComplete && !completedSteps.has(currentStep)) {
      actions.markStepComplete(currentStep);
    }
  }, [isCurrentStepComplete, currentStep, completedSteps, actions]);

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
  }, [formData, onChange, lastSyncedData, isInitialMount]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore Enter key in textareas (should create new line instead)
      const target = e.target as HTMLElement;
      if (target.tagName === 'TEXTAREA') return;

      if (e.key === 'Enter' && !e.shiftKey && !isReviewMode) {
        if (isCurrentStepComplete || !currentField?.required) {
          actions.goNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentStep, isCurrentStepComplete, currentField, isReviewMode, actions]);

  const handleFieldChange = (value: any) => {
    if (currentField) {
      actions.updateField(currentField.name, value);
    }
  };

  const handleEditFromReview = (fieldIndex: number) => {
    actions.goToStep(fieldIndex + 1);
  };

  // AI Auto-complete entire card with toast notifications
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

    toast({
      title: language === 'ru' ? '✨ AI генерирует карточку...' : '✨ AI generating card...',
      description: language === 'ru' ? 'Подождите несколько секунд' : 'Please wait a few seconds'
    });

    try {
      const result = await actions.autoGenerateCard(language, sporeBalance);
      
      if (result?.success) {
        // Sync to parent
        const newFormData = { ...formData, ...result.cardData };
        onChange(newFormData);

        toast({
          title: language === 'ru' ? '✅ Карточка сгенерирована!' : '✅ Card generated!',
          description: language === 'ru' ? 'Проверьте и отредактируйте при необходимости' : 'Review and edit if needed'
        });

        // Refresh subscription to update SPORE balance
        refetchSubscription();
      }
    } catch (error) {
      console.error('AI auto-complete error:', error);
      if (error instanceof Error && error.message === 'INSUFFICIENT_SPORES') {
        toast({
          title: language === 'ru' ? '❌ Недостаточно SPORE' : '❌ Not enough SPORE',
          description: language === 'ru' ? 'Нужно 10 SPORE для AI генерации' : 'Need 10 SPORE for AI generation',
          variant: 'destructive'
        });
      } else {
        toast({
          title: language === 'ru' ? '❌ Ошибка генерации' : '❌ Generation failed',
          description: error instanceof Error ? error.message : 'Unknown error',
          variant: 'destructive'
        });
      }
    }
  };

  // Handle forge - clear draft after successful forge
  const handleForge = () => {
    actions.clearDraft();
    onForge(formData);
  };

  if (isReviewMode) {
    return (
      <div className="space-y-6">
        <WizardProgress
          currentStep={totalSteps}
          totalSteps={totalSteps}
          completedSteps={completedSteps}
          onStepClick={actions.goToStep}
        />
        
        <SummaryReview
          definition={definition}
          formData={formData}
          onEdit={handleEditFromReview}
          onForge={handleForge}
          isForging={isForging}
          hasExistingCard={hasExistingCard}
        />

        <div className="flex justify-start">
          <button
            onClick={actions.goBack}
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
        onStepClick={actions.goToStep}
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
        onPrevious={actions.goBack}
        onNext={actions.goNext}
        onSkip={actions.goNext}
      />
    </div>
  );
};
