import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PhaseBreakdown {
  phase: string;
  filled: number;
  total: number;
  percentage: number;
}

interface Tip {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'completion' | 'balance' | 'quality' | 'variety';
}

interface Insights {
  summary: string;
  tips: Tip[];
  strengths: string[];
  nextAction: string;
}

interface DeckHealthMetrics {
  completion: {
    score: number;
    filled: number;
    total: number;
  };
  balance: {
    score: number;
    phaseBreakdown: PhaseBreakdown[];
  };
  quality: {
    score: number;
    evaluatedCards: number;
    totalFilled: number;
  };
  variety: {
    score: number;
    uniqueTypes: number;
  };
}

interface DeckHealthResponse {
  overallScore: number;
  metrics: DeckHealthMetrics;
  insights: Insights;
  lastAnalyzed: string;
}

export function useDeckHealth(deckId: string | null) {
  const [healthData, setHealthData] = useState<DeckHealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeHealth = useCallback(async () => {
    if (!deckId) {
      setHealthData(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('analyze-deck-health', {
        body: { deckId }
      });

      if (functionError) throw functionError;

      setHealthData(data as DeckHealthResponse);
    } catch (err) {
      console.error('Error analyzing deck health:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze deck health');
    } finally {
      setIsLoading(false);
    }
  }, [deckId]);

  useEffect(() => {
    analyzeHealth();
  }, [analyzeHealth]);

  return {
    healthData,
    isLoading,
    error,
    refresh: analyzeHealth
  };
}
