import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ResearchResult {
  id: string;
  deck_id: string;
  card_slot: number;
  findings: Record<string, any>;
  team_comments: Array<{
    characterId: string;
    comment: string;
    sentiment: string;
  }>;
  sources: Array<{
    url: string;
    title: string;
    snippet: string;
  }>;
  rarity_scores: {
    // Support both formats from different flows
    depth?: number;
    relevance?: number;
    actionability?: number;
    uniqueness?: number;
    source_quality?: number;
    actuality?: number;
    final_score?: number;
    vision_ceiling?: number;
  };
  final_rarity: string;
  verdict: string | null;
  status: 'locked' | 'researching' | 'ready' | 'accepted';
  researched_at: string | null;
  accepted_at: string | null;
}

export interface ResearchSession {
  id: string;
  deck_id: string;
  current_card_slot: number;
  status: string;
  started_at: string | null;
  completed_at: string | null;
}

export function useResearch(deckId: string) {
  const [isReady, setIsReady] = useState(false);
  const [session, setSession] = useState<ResearchSession | null>(null);
  const [results, setResults] = useState<ResearchResult[]>([]);
  const [currentUnlockedSlot, setCurrentUnlockedSlot] = useState(6);
  const [isLoading, setIsLoading] = useState(true);
  const [isResearching, setIsResearching] = useState<number | null>(null);
  const { toast } = useToast();

  const checkReadiness = useCallback(async () => {
    if (!deckId) return;

    try {
      // First, do a quick local check for vision cards (slots 1-5)
      const { data: visionCards, error: localError } = await supabase
        .from('deck_cards')
        .select('card_slot, evaluation')
        .eq('deck_id', deckId)
        .in('card_slot', [1, 2, 3, 4, 5]);

      if (!localError && visionCards) {
        // Check if all 5 vision cards exist and have evaluations
        const completedSlots = visionCards.filter(c => c.evaluation !== null).length;
        const localIsReady = completedSlots >= 5;
        
        // Set immediately from local data for faster UI update
        setIsReady(localIsReady);
      }

      // ALWAYS fetch research results - don't wait for isReady check
      const { data: researchResults } = await supabase
        .from('research_results')
        .select('*')
        .eq('deck_id', deckId);
      
      if (researchResults && researchResults.length > 0) {
        setResults(researchResults as unknown as ResearchResult[]);
      }

      // Fallback to edge function if local check fails
      if (localError) {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) return;

        const response = await supabase.functions.invoke('research-orchestrator', {
          body: { action: 'check_readiness', deckId }
        });

        if (response.error) throw response.error;

        setIsReady(response.data.isReady);
        setSession(response.data.session);
        if (response.data.results?.length > 0) {
          setResults(response.data.results);
        }
      }
    } catch (error) {
      console.error('Error checking readiness:', error);
    }
  }, [deckId]);

  const fetchStatus = useCallback(async () => {
    if (!deckId) return;

    try {
      setIsLoading(true);
      console.log('useResearch fetchStatus: Starting fetch for deck', deckId);
      
      // First, always fetch directly from database for reliability
      const { data: researchResults, error: resultsError } = await supabase
        .from('research_results')
        .select('*')
        .eq('deck_id', deckId);
      
      console.log('useResearch fetchStatus: Got results', { 
        resultsCount: researchResults?.length || 0, 
        slots: researchResults?.map(r => r.card_slot),
        error: resultsError?.message 
      });
      
      if (resultsError) {
        console.error('Error fetching research_results:', resultsError);
      }
      
      if (researchResults && researchResults.length > 0) {
        console.log('useResearch: Setting results:', researchResults.length, 'items');
        // Log each result's findings
        researchResults.forEach(r => {
          console.log(`  Slot ${r.card_slot}: status=${r.status}, hasFindings=${!!r.findings}, findingsKeys=${r.findings ? Object.keys(r.findings) : 'none'}`);
        });
        setResults(researchResults as unknown as ResearchResult[]);
        
        // Calculate unlocked slot from accepted results
        const acceptedSlots = researchResults
          .filter(r => r.status === 'accepted')
          .map(r => r.card_slot);
        const maxAccepted = Math.max(0, ...acceptedSlots);
        setCurrentUnlockedSlot(maxAccepted < 10 ? maxAccepted + 1 : 10);
      } else {
        console.log('useResearch: No results found, setting empty array');
        setResults([]);
      }

      // Try to get session from edge function (non-blocking)
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        try {
          const response = await supabase.functions.invoke('research-orchestrator', {
            body: { action: 'get_status', deckId }
          });

          if (!response.error && response.data?.session) {
            setSession(response.data.session);
          }
        } catch (edgeError) {
          console.log('Edge function unavailable, using direct DB data');
        }
      }
    } catch (error) {
      console.error('Error fetching status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [deckId]);

  const startResearch = useCallback(async (cardSlot: number) => {
    if (!deckId) return;

    try {
      setIsResearching(cardSlot);
      
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in to start research.',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: '🔬 Research started',
        description: 'Team is analyzing data...',
      });

      const response = await supabase.functions.invoke('research-execute', {
        body: { deckId, cardSlot }
      });

      if (response.error) throw response.error;

      toast({
        title: '✨ Research complete',
        description: 'Review the findings and decide to accept or discuss.',
      });

      await fetchStatus();
    } catch (error: any) {
      console.error('Error starting research:', error);
      toast({
        title: 'Research failed',
        description: error.message || 'Something went wrong',
        variant: 'destructive'
      });
    } finally {
      setIsResearching(null);
    }
  }, [deckId, fetchStatus, toast]);

  const acceptResearch = useCallback(async (cardSlot: number) => {
    if (!deckId) return;

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return;

      const response = await supabase.functions.invoke('research-orchestrator', {
        body: { action: 'accept_research', deckId, cardSlot }
      });

      if (response.error) throw response.error;

      toast({
        title: '🎴 Card earned!',
        description: cardSlot < 10 
          ? 'Next research card unlocked.' 
          : 'Research phase complete!',
      });

      await fetchStatus();
    } catch (error: any) {
      console.error('Error accepting research:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to accept research',
        variant: 'destructive'
      });
    }
  }, [deckId, fetchStatus, toast]);

  const discussResearch = useCallback(async (
    cardSlot: number, 
    message: string, 
    characterId: string
  ): Promise<string | null> => {
    if (!deckId) return null;

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return null;

      const response = await supabase.functions.invoke('research-discuss', {
        body: { deckId, cardSlot, message, characterId }
      });

      if (response.error) throw response.error;

      return response.data.response;
    } catch (error: any) {
      console.error('Error in discussion:', error);
      toast({
        title: 'Discussion failed',
        description: error.message || 'Could not get response',
        variant: 'destructive'
      });
      return null;
    }
  }, [deckId, toast]);

  const reResearch = useCallback(async (cardSlot: number) => {
    if (!deckId) return;

    try {
      setIsResearching(cardSlot);
      
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in to start research.',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: '🔬 Поиск новых инсайтов...',
        description: 'AI ищет свежие данные для карточки',
      });

      // Call research-execute again - it will overwrite existing findings
      const response = await supabase.functions.invoke('research-execute', {
        body: { deckId, cardSlot, isReResearch: true }
      });

      if (response.error) throw response.error;

      toast({
        title: '✨ Новые инсайты найдены!',
        description: 'Просмотрите обновлённые данные.',
      });

      await fetchStatus();
    } catch (error: any) {
      console.error('Error re-researching:', error);
      toast({
        title: 'Ошибка исследования',
        description: error.message || 'Что-то пошло не так',
        variant: 'destructive'
      });
    } finally {
      setIsResearching(null);
    }
  }, [deckId, fetchStatus, toast]);

  const getResultForSlot = useCallback((slot: number): ResearchResult | undefined => {
    return results.find(r => r.card_slot === slot);
  }, [results]);

  const canResearchSlot = useCallback((slot: number): boolean => {
    if (slot === 6) return isReady;
    
    const previousSlot = slot - 1;
    const previousResult = getResultForSlot(previousSlot);
    return previousResult?.status === 'accepted';
  }, [isReady, getResultForSlot]);

  useEffect(() => {
    console.log('useResearch: initializing for deck', deckId);
    checkReadiness();
    fetchStatus();

    // Subscribe to card changes
    const cardsChannel = supabase
      .channel(`research-cards-changes:${deckId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deck_cards',
          filter: `deck_id=eq.${deckId}`
        },
        () => {
          console.log('useResearch: deck_cards changed, refetching');
          checkReadiness();
          fetchStatus();
        }
      )
      .subscribe();

    // Subscribe to research_results changes
    const resultsChannel = supabase
      .channel(`research-results-changes:${deckId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'research_results',
          filter: `deck_id=eq.${deckId}`
        },
        () => {
          console.log('useResearch: research_results changed, refetching');
          fetchStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(cardsChannel);
      supabase.removeChannel(resultsChannel);
    };
  }, [deckId, checkReadiness, fetchStatus]);

  return {
    isReady,
    session,
    results,
    currentUnlockedSlot,
    isLoading,
    isResearching,
    startResearch,
    acceptResearch,
    discussResearch,
    reResearch,
    getResultForSlot,
    canResearchSlot,
    refetch: fetchStatus
  };
}