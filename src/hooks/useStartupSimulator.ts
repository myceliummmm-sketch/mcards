import { useState } from 'react';
import { simulatorService, SimulatorParams, SimulationResult } from '@/services/simulatorService';
import { useToast } from '@/hooks/use-toast';

export type GameStep = 'hero' | 'class' | 'difficulty' | 'hacking' | 'result';

export const useStartupSimulator = (language: string = 'en') => {
  const [step, setStep] = useState<GameStep>('hero');
  const [selections, setSelections] = useState<Partial<SimulatorParams>>({});
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const nextStep = (next: GameStep) => setStep(next);

  const selectClass = (c: 'coder' | 'founder') => {
    setSelections(p => ({ ...p, userClass: c }));
    nextStep('difficulty');
  };

  const selectDifficulty = (d: 'hard' | 'god') => {
    const params = { ...selections, difficulty: d } as SimulatorParams;
    setSelections(params);
    nextStep('hacking');
    runSimulation(params);
  };

  const runSimulation = async (params: SimulatorParams) => {
    setIsLoading(true);
    try {
      setResult(await simulatorService.generateStartup({ ...params, language }));
      setStep('result');
    } catch {
      toast({ title: "Error", variant: "destructive" });
      setStep('hero');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    state: { step, selections, result, isLoading },
    actions: { nextStep, selectClass, selectDifficulty }
  };
};
