import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Insight, 
  ResearchSession, 
  calculateRarity,
} from '@/types/research';

export interface UseInsightValidationReturn {
  session: ResearchSession | null;
  isLoading: boolean;
  isSearching: boolean;
  isStreamingComplete: boolean;
  sourcesFound: number;
  streamingInsights: Insight[];
  completedVisionCards: number;
  startResearch: () => Promise<void>;
  startResearchForSlot: (slotNumber: number) => Promise<void>;
  completeValidation: (results: { resonated: boolean; insight: Insight }[]) => Promise<void>;
  resetSession: () => void;
}

export function useInsightValidation(deckId: string): UseInsightValidationReturn {
  // Try to restore from localStorage on init
  const getStoredSession = () => {
    try {
      const stored = localStorage.getItem(`research_session_${deckId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Check if session is still valid (less than 1 hour old)
        const age = Date.now() - new Date(parsed.startedAt).getTime();
        if (age < 3600000) return parsed;
      }
    } catch {}
    return null;
  };

  const getStoredInsights = () => {
    try {
      const stored = localStorage.getItem(`research_insights_${deckId}`);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  };

  const [session, setSession] = useState<ResearchSession | null>(getStoredSession);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isStreamingComplete, setIsStreamingComplete] = useState(false); // Track when ALL insights received
  const [sourcesFound, setSourcesFound] = useState(0);
  const [streamingInsights, setStreamingInsights] = useState<Insight[]>(getStoredInsights);
  const [completedVisionCards, setCompletedVisionCards] = useState(0);
  const { toast } = useToast();
  const { language } = useLanguage();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Persist session and insights to localStorage
  useEffect(() => {
    if (session) {
      localStorage.setItem(`research_session_${deckId}`, JSON.stringify(session));
    }
  }, [session, deckId]);

  useEffect(() => {
    if (streamingInsights.length > 0) {
      localStorage.setItem(`research_insights_${deckId}`, JSON.stringify(streamingInsights));
    }
  }, [streamingInsights, deckId]);

  const startResearch = useCallback(async () => {
    if (!deckId) return;

    try {
      setIsLoading(true);
      setIsSearching(true);
      setSourcesFound(0);
      setStreamingInsights([]);
      setCompletedVisionCards(0);

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          title: 'Требуется авторизация',
          description: 'Войдите, чтобы начать research',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: '🔬 Research запущен',
        description: 'Инсайты будут появляться по мере готовности...',
      });

      // Create initial session
      const newSession: ResearchSession = {
        id: crypto.randomUUID(),
        deckId,
        status: 'searching',
        insights: [],
        currentInsightIndex: 0,
        resonatedCount: 0,
        totalInsights: 15,
        averageScore: 0,
        finalRarity: 'common',
        startedAt: new Date().toISOString(),
        completedAt: null,
      };
      setSession(newSession);

      // Use streaming endpoint
      abortControllerRef.current = new AbortController();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/research-insights`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionData.session.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ deckId, stream: true, language }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to start research');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let buffer = '';
      const allInsights: Insight[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // Process complete SSE events
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          
          const jsonStr = line.slice(6).trim();
          if (!jsonStr || jsonStr === '[DONE]') continue;

          try {
            const event = JSON.parse(jsonStr);

            if (event.type === 'insight') {
              allInsights.push(event.insight);
              setStreamingInsights([...allInsights]);
              setSourcesFound(event.totalSources || 0);
              
              // Update session with new insight
              setSession(prev => prev ? {
                ...prev,
                insights: [...allInsights],
                status: 'ready',
              } : null);

              // After first 3 insights, mark as ready to start validating
              if (allInsights.length >= 3) {
                setIsSearching(false);
              }
            } else if (event.type === 'progress') {
              setCompletedVisionCards(event.completed);
              setSourcesFound(event.totalSources || 0);
            } else if (event.type === 'done') {
              setIsSearching(false);
              setIsStreamingComplete(true); // Mark that ALL insights have been received
              setSession(prev => prev ? {
                ...prev,
                insights: allInsights,
                totalInsights: event.totalInsights,
                status: 'ready',
              } : null);
            }
          } catch (e) {
            // Skip malformed JSON
          }
        }
      }

      toast({
        title: '✨ Research готов!',
        description: `Найдено ${allInsights.length} инсайтов`,
      });

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Research cancelled');
        return;
      }
      console.error('Error starting research:', error);
      setIsSearching(false);
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось запустить research',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [deckId, language, toast]);

  const completeValidation = useCallback(async (
    results: { resonated: boolean; insight: Insight }[]
  ) => {
    console.log('completeValidation called with', results.length, 'results');
    console.log('deckId:', deckId, 'session:', !!session);
    
    if (!deckId) {
      console.error('completeValidation: No deckId!');
      return;
    }
    
    // Don't require session - we can work without it
    // if (!session) return;

    try {
      setIsLoading(true);
      console.log('Starting completeValidation processing...');

      const resonatedInsights = results.filter(r => r.resonated);
      const resonatedCount = resonatedInsights.length;
      const averageScore = resonatedInsights.length > 0
        ? resonatedInsights.reduce((sum, r) => sum + r.insight.score, 0) / resonatedInsights.length
        : 0;
      const finalRarity = calculateRarity(averageScore);

      const resonanceRate = (resonatedCount / results.length) * 100;
      let verdict: 'go' | 'conditional_go' | 'pivot' | 'stop' = 'stop';
      if (resonanceRate >= 80) verdict = 'go';
      else if (resonanceRate >= 60) verdict = 'conditional_go';
      else if (resonanceRate >= 40) verdict = 'pivot';

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        console.error('completeValidation: No auth session, but continuing anyway to save cards');
        // Don't return! We still want to save the cards
      }

      // Group by research slot and save
      const slotUpdates: Record<number, {
        resonatedCount: number;
        totalCount: number;
        insights: Insight[];
      }> = {};

      results.forEach(r => {
        const researchSlot = r.insight.researchCardSlot;
        if (!slotUpdates[researchSlot]) {
          slotUpdates[researchSlot] = { resonatedCount: 0, totalCount: 0, insights: [] };
        }
        slotUpdates[researchSlot].totalCount++;
        if (r.resonated) slotUpdates[researchSlot].resonatedCount++;
        slotUpdates[researchSlot].insights.push(r.insight);
      });

      // Research card names for evaluation context
      const RESEARCH_CARD_NAMES: Record<number, string> = {
        6: 'Карта рынка',
        7: 'Анализ конкурентов',
        8: 'Инсайты пользователей',
        9: 'Оценка рисков',
        10: 'Оценка возможностей',
      };

      // Helper function to get AI-generated evaluations from team
      const getTeamEvaluations = async (
        insights: Insight[], 
        researchSlot: number
      ): Promise<Record<string, any>> => {
        const cardName = RESEARCH_CARD_NAMES[researchSlot] || 'Research';
        
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          if (!sessionData.session) {
            throw new Error('No auth session');
          }

          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/research-evaluate`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionData.session.access_token}`,
                'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              },
              body: JSON.stringify({
                insights: insights.map(i => ({
                  content: i.content,
                  source: i.source,
                  sourceUrl: i.sourceUrl,
                  score: i.score,
                  rarity: i.rarity,
                  resonated: i.resonated,
                })),
                researchCardName: cardName,
                language,
              }),
            }
          );

          if (!response.ok) {
            console.error('Failed to get AI evaluations:', await response.text());
            throw new Error('AI evaluation failed');
          }

          return await response.json();
        } catch (err) {
          console.error('Error getting team evaluations:', err);
          // Fallback to simple calculation
          const avgScore = insights.reduce((sum, i) => sum + i.score, 0) / insights.length;
          return {
            depth: { score: avgScore, explanation: 'Оценка на основе данных.', evaluator: 'phoenix' },
            uniqueness: { score: avgScore, explanation: 'Оценка на основе данных.', evaluator: 'toxic' },
            actionability: { score: avgScore, explanation: 'Оценка на основе данных.', evaluator: 'prisma' },
            source_quality: { score: avgScore, explanation: 'Оценка на основе данных.', evaluator: 'evergreen' },
            final_score: avgScore,
          };
        }
      };

      // First pass: save research results with AI-generated evaluations
      for (const [slotStr, data] of Object.entries(slotUpdates)) {
        const slot = parseInt(slotStr);
        
        // Get AI-generated team evaluations
        console.log(`Getting team evaluations for slot ${slot}...`);
        const rarityScores = await getTeamEvaluations(data.insights, slot);
        const slotRarity = calculateRarity(rarityScores.final_score);

        const { error: researchError } = await supabase.from('research_results').upsert({
          deck_id: deckId,
          card_slot: slot,
          findings: {
            insights: data.insights,
            resonated_count: data.resonatedCount,
            total_count: data.totalCount,
            resonance_rate: (data.resonatedCount / data.totalCount) * 100,
          } as any,
          team_comments: data.insights.map(i => ({
            characterId: i.presenter,
            comment: i.content,
            sentiment: i.resonated ? 'positive' : 'neutral',
          })) as any,
          sources: data.insights.map(i => ({
            url: i.sourceUrl || '',
            title: i.source,
            snippet: i.content.substring(0, 200),
          })) as any,
          rarity_scores: rarityScores as any,
          final_rarity: slotRarity,
          verdict: slot === 10 ? verdict : null,
          status: 'accepted' as const,
          researched_at: new Date().toISOString(),
          accepted_at: new Date().toISOString(),
        }, {
          onConflict: 'deck_id,card_slot',
          ignoreDuplicates: false
        });
        
        if (researchError) {
          console.error(`Failed to save research_results for slot ${slot}:`, researchError);
        } else {
          console.log(`Successfully saved research_results for slot ${slot} with team evaluations`);
        }
      }

      // Second pass: FIRST save cards to deck_cards, THEN generate images
      console.log('Saving cards to deck_cards FIRST, slotUpdates:', Object.keys(slotUpdates));
      
      // Step 1: Save all cards immediately WITHOUT images
      for (const [slotStr, data] of Object.entries(slotUpdates)) {
        const slot = parseInt(slotStr);
        const slotScore = data.insights.reduce((sum, i) => sum + i.score, 0) / data.insights.length;
        const slotRarity = calculateRarity(slotScore);
        
        const cardContent = {
          insights: data.insights.map(i => i.content),
          resonated_count: data.resonatedCount,
          total_count: data.totalCount,
          summary: data.insights.filter(i => i.resonated !== false).map(i => i.content).join(' | ')
        };

        const cardTypeMap: Record<number, string> = {
          6: 'market_map',
          7: 'competitor_analysis',
          8: 'user_insights',
          9: 'risk_assessment',
          10: 'opportunity_score'
        };

        console.log(`Step 1: Saving card for slot ${slot} WITHOUT image`);
        
        const { error: upsertError } = await supabase
          .from('deck_cards')
          .upsert({
            deck_id: deckId,
            card_slot: slot,
            card_type: cardTypeMap[slot] || 'research',
            card_data: cardContent as any,
            card_image_url: null, // Will be updated after generation
            evaluation: {
              overall: slotScore,
              rarity: slotRarity,
              resonated_count: data.resonatedCount,
              total_count: data.totalCount,
            } as any,
          }, { 
            onConflict: 'deck_id,card_slot',
            ignoreDuplicates: false 
          });
        
        if (upsertError) {
          console.error(`Failed to save card slot ${slot}:`, upsertError);
        } else {
          console.log(`Successfully saved card slot ${slot}`);
        }
      }

      // Step 2: Generate images in parallel and update cards - use Promise.all to ensure completion
      toast({
        title: '🎨 Генерируем изображения...',
        description: 'Карточки сохранены, создаём визуал',
      });

      // Generate images in parallel - edge function now saves directly to DB!
      // This is fire-and-forget - we don't need to wait for images
      Object.entries(slotUpdates).forEach(([slotStr, data]) => {
        const slot = parseInt(slotStr);
        const cardContent = {
          insights: data.insights.map(i => i.content),
          resonated_count: data.resonatedCount,
          total_count: data.totalCount,
          summary: data.insights.filter(i => i.resonated !== false).map(i => i.content).join(' | ')
        };

        console.log(`Triggering image generation for slot ${slot} (will save to DB in edge function)`);
        
        // Fire and forget - edge function saves to DB directly
        supabase.functions.invoke('generate-card-image', {
          body: { cardSlot: slot, cardContent, deckId }
        }).then(response => {
          if (response.error) {
            console.error(`Image generation error for slot ${slot}:`, response.error);
          } else {
            console.log(`Image generated and saved for slot ${slot}:`, response.data?.savedToDb);
          }
        }).catch(err => {
          console.error(`Image generation exception for slot ${slot}:`, err);
        });
      });

      toast({
        title: '🎨 Генерируем изображения...',
        description: 'Карточки появятся через 10-20 сек',
      });

      setSession(prev => prev ? {
        ...prev,
        status: 'complete',
        resonatedCount,
        averageScore,
        finalRarity,
        completedAt: new Date().toISOString(),
      } : null);

      // Clear localStorage after successful completion
      localStorage.removeItem(`research_session_${deckId}`);
      localStorage.removeItem(`research_insights_${deckId}`);

      toast({
        title: '🎉 Research завершён!',
        description: `${resonatedCount}/${results.length} инсайтов резонируют`,
      });

    } catch (error: any) {
      console.error('Error completing validation:', error);
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось сохранить результаты',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [deckId, session, toast]);

  const resetSession = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setSession(null);
    setIsSearching(false);
    setSourcesFound(0);
    setStreamingInsights([]);
    setCompletedVisionCards(0);
    // Clear localStorage
    localStorage.removeItem(`research_session_${deckId}`);
    localStorage.removeItem(`research_insights_${deckId}`);
    
    // Delete old research report so it regenerates with fresh data
    try {
      await supabase.from('research_reports').delete().eq('deck_id', deckId);
      console.log('Deleted old research report for deck:', deckId);
    } catch (err) {
      console.error('Failed to delete research report:', err);
    }
  }, [deckId]);

  // Start research for a specific slot only (re-research a card)
  const startResearchForSlot = useCallback(async (slotNumber: number) => {
    if (!deckId) return;

    try {
      setIsLoading(true);
      setIsSearching(true);
      setSourcesFound(0);
      setStreamingInsights([]);

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          title: 'Требуется авторизация',
          description: 'Войдите, чтобы начать research',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: '🔬 Research для карточки запущен',
        description: `Ищем инсайты для слота R-${slotNumber - 5}...`,
      });

      // Create session for single slot - only 3 insights for one card
      const singleSlotTotalInsights = 3;
      const newSession: ResearchSession = {
        id: crypto.randomUUID(),
        deckId,
        status: 'searching',
        insights: [],
        currentInsightIndex: 0,
        resonatedCount: 0,
        totalInsights: singleSlotTotalInsights, // Only 3 insights for single slot
        averageScore: 0,
        finalRarity: 'common',
        startedAt: new Date().toISOString(),
        completedAt: null,
      };
      setSession(newSession);

      // Call research-insights with specific slot
      abortControllerRef.current = new AbortController();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/research-insights`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionData.session.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ deckId, stream: true, language, singleSlot: slotNumber }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to start research for slot');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let buffer = '';
      const allInsights: Insight[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          
          const jsonStr = line.slice(6).trim();
          if (!jsonStr || jsonStr === '[DONE]') continue;

          try {
            const event = JSON.parse(jsonStr);

            if (event.type === 'insight') {
              allInsights.push(event.insight);
              setStreamingInsights([...allInsights]);
              setSourcesFound(event.totalSources || 0);
              
              setSession(prev => prev ? {
                ...prev,
                insights: [...allInsights],
                status: 'ready',
              } : null);

              if (allInsights.length >= 3) {
                setIsSearching(false);
              }
            } else if (event.type === 'done') {
              setIsSearching(false);
              setSession(prev => prev ? {
                ...prev,
                insights: allInsights,
                totalInsights: event.totalInsights,
                status: 'ready',
              } : null);
            }
          } catch (e) {
            // Skip malformed JSON
          }
        }
      }

      toast({
        title: '✨ Инсайты готовы!',
        description: `Найдено ${allInsights.length} инсайтов для карточки`,
      });

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Research cancelled');
        return;
      }
      console.error('Error starting slot research:', error);
      setIsSearching(false);
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось запустить research для карточки',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [deckId, language, toast]);

  return {
    session,
    isLoading,
    isSearching,
    isStreamingComplete,
    sourcesFound,
    streamingInsights,
    completedVisionCards,
    startResearch,
    startResearchForSlot,
    completeValidation,
    resetSession,
  };
}
