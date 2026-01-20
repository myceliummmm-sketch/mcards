import { useState, useCallback, useRef, useEffect } from 'react';
import { CardDefinition } from '@/data/cardDefinitions';
import { aiService } from '@/services/aiService';
import { toast } from 'sonner';

export interface CardCraftingState {
  currentStep: number;
  formData: Record<string, any>;
  completedSteps: Set<number>;
  isReviewMode: boolean;
  isAIGenerating: boolean;
}

interface DraftData {
  formData: Record<string, any>;
  currentStep: number;
  timestamp: number;
}

const DRAFT_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export const useCardCrafting = (
  definition: CardDefinition,
  initialData: Record<string, any>,
  deckId?: string
) => {
  // Draft key for localStorage
  const draftKey = deckId ? `card_draft_${deckId}_${definition.slot}` : null;

  // Load draft from localStorage
  const loadDraft = useCallback((): DraftData | null => {
    if (!draftKey) return null;
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        const draft = JSON.parse(saved) as DraftData;
        // Check if draft is not older than 24 hours
        if (Date.now() - draft.timestamp < DRAFT_EXPIRY_MS) {
          return draft;
        }
        // Expired draft - remove it
        localStorage.removeItem(draftKey);
      }
    } catch (e) {
      console.error('Error loading draft:', e);
    }
    return null;
  }, [draftKey]);

  // Initialize state ONLY ONCE - use useRef to compute initial values
  const initialStateRef = useRef<{ formData: Record<string, any>; currentStep: number; hasDraft: boolean } | null>(null);
  
  if (initialStateRef.current === null) {
    const draft = loadDraft();
    const hasInitialData = initialData && Object.keys(initialData).length > 0;
    
    // If we have a draft with more data than initialData, use draft
    if (draft?.formData && Object.keys(draft.formData).length > 0) {
      const draftHasMoreData = Object.keys(draft.formData).length >= Object.keys(initialData || {}).length;
      if (draftHasMoreData) {
        initialStateRef.current = {
          formData: draft.formData,
          currentStep: draft.currentStep || 1,
          hasDraft: true
        };
      }
    }
    
    if (initialStateRef.current === null) {
      initialStateRef.current = {
        formData: initialData || {},
        currentStep: 1,
        hasDraft: false
      };
    }
  }

  const initialState = initialStateRef.current;
  
  // State
  const [currentStep, setCurrentStep] = useState(initialState.currentStep);
  const [formData, setFormData] = useState<Record<string, any>>(initialState.formData);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  // Refs for sync tracking
  const lastSyncedData = useRef<string>(JSON.stringify(initialState.formData));
  const isInitialMount = useRef(true);
  const saveDraftTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const draftToastShown = useRef(false);

  const totalSteps = definition.fields.length;
  const currentField = definition.fields[currentStep - 1];
  const currentValue = formData[currentField?.name];
  const isCurrentStepComplete = currentValue !== undefined && currentValue !== null && currentValue !== '';

  // Show toast if draft was restored - only once on mount
  useEffect(() => {
    if (initialState.hasDraft && !draftToastShown.current) {
      draftToastShown.current = true;
      toast.info('📝 Черновик восстановлен', {
        description: 'Продолжайте с того места, где остановились'
      });
    }
  }, []);

  // Save draft to localStorage (debounced)
  useEffect(() => {
    if (!draftKey) return;
    if (Object.keys(formData).length === 0) return;
    
    // Clear previous timeout
    if (saveDraftTimeoutRef.current) {
      clearTimeout(saveDraftTimeoutRef.current);
    }
    
    // Debounce save by 500ms
    saveDraftTimeoutRef.current = setTimeout(() => {
      try {
        const draftData: DraftData = {
          formData,
          currentStep,
          timestamp: Date.now()
        };
        localStorage.setItem(draftKey, JSON.stringify(draftData));
      } catch (e) {
        console.error('Error saving draft:', e);
      }
    }, 500);
    
    return () => {
      if (saveDraftTimeoutRef.current) {
        clearTimeout(saveDraftTimeoutRef.current);
      }
    };
  }, [formData, currentStep, draftKey]);

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

  // Clear draft from localStorage
  const clearDraft = useCallback(() => {
    if (draftKey) {
      localStorage.removeItem(draftKey);
    }
  }, [draftKey]);

  // Reset state when switching to a different card
  const resetState = useCallback((newData: Record<string, any>) => {
    // Check for existing draft for this card
    const draft = loadDraft();
    const hasNewData = newData && Object.keys(newData).length > 0;
    const hasDraftData = draft?.formData && Object.keys(draft.formData).length > 0;
    
    // Use draft if it has more/equal data
    if (hasDraftData && (!hasNewData || Object.keys(draft.formData).length >= Object.keys(newData).length)) {
      setFormData(draft.formData);
      setCurrentStep(draft.currentStep || 1);
      lastSyncedData.current = JSON.stringify(draft.formData);
      // Show toast for restored draft when switching cards
      if (!draftToastShown.current) {
        draftToastShown.current = true;
        toast.info('📝 Черновик восстановлен', {
          description: 'Продолжайте с того места, где остановились'
        });
      }
    } else {
      setFormData(newData);
      setCurrentStep(1);
      lastSyncedData.current = JSON.stringify(newData);
    }
    
    setCompletedSteps(new Set());
    setIsReviewMode(false);
    isInitialMount.current = true;
  }, [loadDraft]);

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
      const cardData = await aiService.generateCard({
        deckId,
        slot: definition.slot,
        language
      });

      const newFormData = { ...formData, ...cardData };
      setFormData(newFormData);
      lastSyncedData.current = JSON.stringify(newFormData);

      // Mark all steps complete
      const allSteps = new Set(definition.fields.map((_, i) => i + 1));
      setCompletedSteps(allSteps);

      return { success: true, cardData };
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
      autoGenerateCard,
      clearDraft
    }
  };
};
