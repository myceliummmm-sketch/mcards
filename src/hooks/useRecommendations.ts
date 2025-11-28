import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Recommendation {
  cardId: string;
  score: number;
  reasons: string[];
  category: 'gap_filler' | 'content_match' | 'related';
}

interface DeckAnalysis {
  primaryIndustry: string;
  mainThemes: string[];
  keywords: string[];
  targetAudience: string;
  gapPhases: string[];
  completionScore: number;
  filledCards: number;
  totalCards: number;
}

interface RecommendationsResponse {
  recommendations: Recommendation[];
  deckAnalysis: DeckAnalysis;
}

export function useRecommendations(deckId: string | null) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [deckAnalysis, setDeckAnalysis] = useState<DeckAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    if (!deckId) {
      setRecommendations([]);
      setDeckAnalysis(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('recommend-cards', {
        body: { deckId }
      });

      if (functionError) throw functionError;

      const response = data as RecommendationsResponse;
      setRecommendations(response.recommendations);
      setDeckAnalysis(response.deckAnalysis);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
    } finally {
      setIsLoading(false);
    }
  }, [deckId]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return {
    recommendations,
    deckAnalysis,
    isLoading,
    error,
    refetch: fetchRecommendations
  };
}
