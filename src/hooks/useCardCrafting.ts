import { useState, useCallback } from 'react';
import { CardDefinition } from '@/data/cardDefinitions';
import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();

  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [isAIGenerating, setIsAIGenerating] = useState(false);

  const totalSteps = definition.fields.length;
  const currentField = definition.fields[currentStep - 1];

  // Actions
  const markStepComplete = useCallback((step: number) => {
    setCompletedSteps(prev => new Set([...prev, step]));
  }, []);

  const updateField = useCallback((fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  }, []);

  const goNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsReviewMode(true);
    }
  };

  const goBack = () => {
    if (isReviewMode) {
      setIsReviewMode(false);
    } else if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
    setIsReviewMode(false);
  };

  // AI Logic
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

      // Mark all steps complete
      const allSteps = new Set(definition.fields.map((_, i) => i + 1));
      setCompletedSteps(allSteps);

      return data;
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
    totalSteps,
    actions: {
      updateField,
      goNext,
      goBack,
      goToStep,
      markStepComplete,
      autoGenerateCard
    }
  };
};
