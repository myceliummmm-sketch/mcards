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
    depth: number;
    actionability: number;
    uniqueness: number;
    source_quality: number;
    final_score: number;
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
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return;

      const response = await supabase.functions.invoke('research-orchestrator', {
        body: { action: 'check_readiness', deckId }
      });

      if (response.error) throw response.error;

      setIsReady(response.data.isReady);
      setSession(response.data.session);
      setResults(response.data.results || []);
    } catch (error) {
      console.error('Error checking readiness:', error);
    }
  }, [deckId]);

  const fetchStatus = useCallback(async () => {
    if (!deckId) return;

    try {
      setIsLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return;

      const response = await supabase.functions.invoke('research-orchestrator', {
        body: { action: 'get_status', deckId }
      });

      if (response.error) throw response.error;

      setSession(response.data.session);
      setResults(response.data.results || []);
      setCurrentUnlockedSlot(response.data.currentUnlockedSlot);
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
    checkReadiness();
    fetchStatus();
  }, [checkReadiness, fetchStatus]);

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
    getResultForSlot,
    canResearchSlot,
    refetch: fetchStatus
  };
}