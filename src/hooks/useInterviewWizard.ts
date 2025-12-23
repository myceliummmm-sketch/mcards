import { useState, useCallback } from 'react';

export type Branch = 'idea' | 'discovery' | null;

export type InterviewStep =
  | 'start'
  | 'project-name'
  | 'analogy'
  | 'niche'
  | 'audience'
  | 'pain-area'
  | 'pain-specific'
  | 'ai-ideas'
  | 'motivation'
  | 'pain-story'
  | 'experience'
  | 'generating'
  | 'video'
  | 'reveal'
  | 'card'
  | 'fork'
  | 'email';

export type AnalogyTemplate = 'uber' | 'airbnb' | 'duolingo' | 'netflix' | 'notion' | 'custom';
export type Motivation = 'personal_pain' | 'saw_pain' | 'market_opportunity' | 'cool_idea';
export type CardRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type SelectedPath = 'fast' | 'diy';

export interface AIIdea {
  name: string;
  analogy: string;
  tagline: string;
}

export interface InterviewData {
  branch: Branch;
  projectName: string;
  analogyTemplate: AnalogyTemplate | null;
  analogyNiche: string;
  targetAudience: string[];
  painArea: string;
  specificPain: string;
  selectedIdea: AIIdea | null;
  motivation: Motivation | null;
  painDetails: string[];
  experience: string[];
  founderFitScore: number;
  cardRarity: CardRarity;
  generatedIdeas: AIIdea[];
  regenerationCount: number;
}

const initialData: InterviewData = {
  branch: null,
  projectName: '',
  analogyTemplate: null,
  analogyNiche: '',
  targetAudience: [],
  painArea: '',
  specificPain: '',
  selectedIdea: null,
  motivation: null,
  painDetails: [],
  experience: [],
  founderFitScore: 30,
  cardRarity: 'common',
  generatedIdeas: [],
  regenerationCount: 0,
};

export function calculateFounderFit(data: InterviewData): { score: number; rarity: CardRarity } {
  let score = 30; // base score for courage to start

  // Motivation bonus (pick one)
  switch (data.motivation) {
    case 'personal_pain':
      score += 25;
      break;
    case 'saw_pain':
      score += 15;
      break;
    case 'market_opportunity':
      score += 10;
      break;
    case 'cool_idea':
      score += 5;
      break;
  }

  // Experience bonuses (stackable)
  if (data.experience.includes('worked_in_field')) score += 20;
  if (data.experience.includes('studied_deeply')) score += 10;
  if (data.experience.includes('has_network')) score += 15;
  // 'starting_fresh' = +0

  score = Math.min(100, score);

  const rarity: CardRarity =
    score >= 90 ? 'legendary' : score >= 70 ? 'epic' : score >= 50 ? 'rare' : 'common';

  return { score, rarity };
}

export function generateVisionStatement(data: InterviewData): string {
  const name = data.projectName || data.selectedIdea?.name || 'Your Project';
  
  if (data.analogyTemplate && data.analogyNiche) {
    const templates: Record<AnalogyTemplate, string> = {
      uber: 'Uber',
      airbnb: 'Airbnb',
      duolingo: 'Duolingo',
      netflix: 'Netflix',
      notion: 'Notion',
      custom: 'innovative solution',
    };
    const template = templates[data.analogyTemplate];
    return `${name} — это ${template} для ${data.analogyNiche}`;
  }
  
  if (data.selectedIdea) {
    return `${data.selectedIdea.name} — ${data.selectedIdea.analogy}`;
  }
  
  return `${name} — твой путь к успеху`;
}

export function useInterviewWizard() {
  const [step, setStep] = useState<InterviewStep>('start');
  const [data, setData] = useState<InterviewData>(initialData);
  const [isLoading, setIsLoading] = useState(false);

  const updateData = useCallback((updates: Partial<InterviewData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  const selectBranch = useCallback((branch: Branch) => {
    updateData({ branch });
    setStep(branch === 'idea' ? 'project-name' : 'pain-area');
  }, [updateData]);

  const goToStep = useCallback((nextStep: InterviewStep) => {
    setStep(nextStep);
  }, []);

  const goBack = useCallback(() => {
    const stepOrder: Record<string, InterviewStep[]> = {
      idea: ['start', 'project-name', 'analogy', 'niche', 'audience', 'motivation', 'pain-story', 'experience', 'generating', 'video', 'reveal', 'card', 'fork', 'email'],
      discovery: ['start', 'pain-area', 'pain-specific', 'ai-ideas', 'motivation', 'pain-story', 'experience', 'generating', 'video', 'reveal', 'card', 'fork', 'email'],
      default: ['start'],
    };
    const branch = data.branch || 'default';
    const order = stepOrder[branch] || stepOrder.default;
    const currentIndex = order.indexOf(step);
    if (currentIndex > 0) {
      // Skip pain-story if motivation wasn't personal_pain
      let prevIndex = currentIndex - 1;
      if (order[prevIndex] === 'pain-story' && data.motivation !== 'personal_pain') {
        prevIndex--;
      }
      setStep(order[Math.max(0, prevIndex)]);
    }
  }, [step, data.branch, data.motivation]);

  const nextFromProjectName = useCallback((projectName: string) => {
    updateData({ projectName });
    setStep('analogy');
  }, [updateData]);

  const nextFromAnalogy = useCallback((template: AnalogyTemplate) => {
    updateData({ analogyTemplate: template });
    setStep('niche');
  }, [updateData]);

  const nextFromNiche = useCallback((niche: string) => {
    updateData({ analogyNiche: niche });
    setStep('audience');
  }, [updateData]);

  const nextFromAudience = useCallback((audience: string[]) => {
    updateData({ targetAudience: audience });
    setStep('motivation');
  }, [updateData]);

  const nextFromPainArea = useCallback((area: string) => {
    updateData({ painArea: area });
    setStep('pain-specific');
  }, [updateData]);

  const nextFromPainSpecific = useCallback((pain: string) => {
    updateData({ specificPain: pain });
    setStep('ai-ideas');
  }, [updateData]);

  const selectAIIdea = useCallback((idea: AIIdea) => {
    updateData({
      selectedIdea: idea,
      projectName: idea.name,
    });
    setStep('motivation');
  }, [updateData]);

  const nextFromMotivation = useCallback((motivation: Motivation) => {
    updateData({ motivation });
    if (motivation === 'personal_pain') {
      setStep('pain-story');
    } else {
      setStep('experience');
    }
  }, [updateData]);

  const nextFromPainStory = useCallback((details: string[]) => {
    updateData({ painDetails: details });
    setStep('experience');
  }, [updateData]);

  const nextFromExperience = useCallback((experience: string[]) => {
    const updatedData = { ...data, experience };
    const { score, rarity } = calculateFounderFit({ ...data, experience });
    updateData({ experience, founderFitScore: score, cardRarity: rarity });
    setStep('generating');
  }, [data, updateData]);

  const finishGenerating = useCallback(() => {
    setStep('video');
  }, []);

  const finishVideo = useCallback(() => {
    setStep('reveal');
  }, []);

  const finishReveal = useCallback(() => {
    setStep('card');
  }, []);

  const selectPath = useCallback((path: SelectedPath) => {
    setStep('email');
  }, []);

  const reset = useCallback(() => {
    setStep('start');
    setData(initialData);
    setIsLoading(false);
  }, []);

  return {
    step,
    data,
    isLoading,
    setIsLoading,
    actions: {
      selectBranch,
      goToStep,
      goBack,
      updateData,
      nextFromProjectName,
      nextFromAnalogy,
      nextFromNiche,
      nextFromAudience,
      nextFromPainArea,
      nextFromPainSpecific,
      selectAIIdea,
      nextFromMotivation,
      nextFromPainStory,
      nextFromExperience,
      finishGenerating,
      finishVideo,
      finishReveal,
      selectPath,
      reset,
    },
  };
}
