import { useState, useCallback, useRef } from 'react';
import { CardDefinition } from '@/data/cardDefinitions';
import { supabase } from '@/integrations/supabase/client';

export interface CardCraftingState {
  currentStep: number;
  formData: Record<string, any>;
  completedSteps: Set<number>;
  isReviewMode: boolean;
  isAIGenerating: boolean;
}

export const useCardCrafting = (
  definition: CardDefinition,
  initialData: Record<string, any>,
  deckId?: string
) => {
  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  
  // Refs for sync tracking
  const lastSyncedData = useRef<string>(JSON.stringify(initialData));
  const isInitialMount = useRef(true);

  const totalSteps = definition.fields.length;
  const currentField = definition.fields[currentStep - 1];
  const currentValue = formData[currentField?.name];
  const isCurrentStepComplete = currentValue !== undefined && currentValue !== null && currentValue !== '';

  // Actions
  const markStepComplete = useCallback((step: number) => {
    setCompletedSteps(prev => new Set([...prev, step]));
  }, []);

  const updateField = useCallback((fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  }, []);

  const goNext = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsReviewMode(true);
    }
  }, [currentStep, totalSteps]);

  const goBack = useCallback(() => {
    if (isReviewMode) {
      setIsReviewMode(false);
    } else if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [isReviewMode, currentStep]);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
    setIsReviewMode(false);
  }, []);

  // Reset state when switching to a different card
  const resetState = useCallback((newData: Record<string, any>) => {
    setFormData(newData);
    setCurrentStep(1);
    setCompletedSteps(new Set());
    setIsReviewMode(false);
    lastSyncedData.current = JSON.stringify(newData);
    isInitialMount.current = true;
  }, []);

  // Set form data and mark filled steps as complete
  const setFormDataFull = useCallback((data: Record<string, any>) => {
    setFormData(data);
    lastSyncedData.current = JSON.stringify(data);
    // Mark all filled steps as complete
    const filledSteps = new Set(
      definition.fields
        .map((f, i) => (data[f.name] !== undefined && data[f.name] !== null && data[f.name] !== '') ? i + 1 : null)
        .filter((x): x is number => x !== null)
    );
    setCompletedSteps(filledSteps);
  }, [definition.fields]);

  // AI Auto-complete Logic
  const autoGenerateCard = async (language: string, sporeBalance: number) => {
    if (!deckId || isAIGenerating) return;

    if (sporeBalance < 10) {
      throw new Error("INSUFFICIENT_SPORES");
    }

    setIsAIGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('auto-complete-single-card', {
        body: { deckId, slot: definition.slot, language }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to generate');

      const newFormData = { ...formData, ...data.cardData };
      setFormData(newFormData);
      lastSyncedData.current = JSON.stringify(newFormData);

      // Mark all steps complete
      const allSteps = new Set(definition.fields.map((_, i) => i + 1));
      setCompletedSteps(allSteps);

      return { success: true, cardData: data.cardData };
    } finally {
      setIsAIGenerating(false);
    }
  };

  return {
    state: {
      currentStep,
      formData,
      completedSteps,
      isReviewMode,
      isAIGenerating
    },
    currentField,
    currentValue,
    isCurrentStepComplete,
    totalSteps,
    refs: {
      lastSyncedData,
      isInitialMount
    },
    actions: {
      updateField,
      goNext,
      goBack,
      goToStep,
      markStepComplete,
      resetState,
      setFormDataFull,
      autoGenerateCard
    }
  };
};
