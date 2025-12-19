import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CARD_DEFINITIONS, RESEARCH_CARD_SLOTS, PHASE_CONFIG } from '@/data/cardDefinitions';
import { useResearch } from '@/hooks/useResearch';
import { useInsightValidation } from '@/hooks/useInsightValidation';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Lock, CheckCircle, Gift, Rocket, Sparkles } from 'lucide-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ResearchCard } from './ResearchCard';
import { InsightValidationFlow } from './InsightValidationFlow';
import { ResearchLoadingScreen } from './ResearchLoadingScreen';
import { ResearchCompletionScreen } from './ResearchCompletionScreen';
import { ResearchReportModal } from './ResearchReportModal';
import { PhaseIcon } from '../PhaseIcon';
import { RewardModal } from '../RewardModal';
import { GenerateResearchReportButton } from '../GenerateResearchReportButton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { Insight } from '@/types/research';
import { supabase } from '@/integrations/supabase/client';

interface ResearchPhaseSectionProps {
  deckId: string;
  visionCards?: Array<{
    card_slot: number;
    evaluation: any;
    card_data: any;
  }>;
  onRefresh?: () => void;
}

export function ResearchPhaseSection({ deckId, visionCards = [], onRefresh }: ResearchPhaseSectionProps) {
  const { t } = useTranslation();
  const config = PHASE_CONFIG['research'];
  const [rewardModalOpen, setRewardModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [completionResults, setCompletionResults] = useState<{ resonated: boolean; insight: Insight }[]>([]);
  const [cardImages, setCardImages] = useState<Record<number, string>>({});
  const [acceptingSlot, setAcceptingSlot] = useState<number | null>(null);
  const [reResearchSlot, setReResearchSlot] = useState<number | null>(null);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  
  // INSTANT check - just check if we have 5 vision cards with data (ignore evaluation)
  const visionComplete = visionCards.filter(c => c.card_data && Object.keys(c.card_data).length > 0).length >= 5;
  
  // Old research hook for status
  const {
    isReady: hookIsReady,
    results,
    isLoading,
    isResearching: researchingSlot,
    getResultForSlot,
    reResearch,
    refetch: refetchResearch,
  } = useResearch(deckId);

  // Debug: log results
  console.log('ResearchPhaseSection: results from hook:', results.length, results.map(r => ({ slot: r.card_slot, status: r.status, hasFindings: !!r.findings })));

  // Use local check OR hook check (whichever is true first)
  const isReady = visionComplete || hookIsReady;

  // New insight validation hook
  const {
    session,
    isLoading: isValidationLoading,
    isSearching,
    isStreamingComplete,
    sourcesFound,
    streamingInsights,
    completedVisionCards,
    startResearch: startInsightResearch,
    startResearchForSlot,
    completeValidation,
    resetSession,
  } = useInsightValidation(deckId);

  // Handle starting re-research for a single card
  const handleStartReResearch = async (slot: number) => {
    setReResearchSlot(slot);
    await startResearchForSlot(slot);
  };

  // Handle completing re-research validation  
  const handleReResearchComplete = async (validationResults: { resonated: boolean; insight: Insight }[]) => {
    setIsGeneratingImages(true); // START: Show generating state on cards
    await completeValidation(validationResults);
    setReResearchSlot(null);
    resetSession();
    
    // CRITICAL: Refetch research results after saving
    console.log('handleReResearchComplete: Refetching research data');
    await refetchResearch();
    onRefresh?.(); // Refresh deck cards for progress bar
    
    // Fetch images with delays
    setTimeout(fetchCardImages, 1000);
    setTimeout(fetchCardImages, 3000);
    setTimeout(() => {
      fetchCardImages();
      refetchResearch();
      onRefresh?.();
    }, 6000);
    
    // Stop generating state after 15 seconds
    setTimeout(() => {
      setIsGeneratingImages(false);
      onRefresh?.();
    }, 15000);
  };

  const researchCards = CARD_DEFINITIONS.filter(c => RESEARCH_CARD_SLOTS.includes(c.slot));
  const acceptedCount = results.filter(r => r.status === 'accepted').length;
  
  // Check if research has been done (even if results were reset) - cards have images OR status is ready/accepted
  const hasResearchBeenDone = results.some(r => r.status === 'ready' || r.status === 'accepted') || 
    Object.values(cardImages).some(url => url && url.length > 0);

  // Fetch card images for mini thumbnails with realtime subscription
  const fetchCardImages = async () => {
    if (!deckId) return;
    
    const { data } = await supabase
      .from('deck_cards')
      .select('card_slot, card_image_url')
      .eq('deck_id', deckId)
      .in('card_slot', RESEARCH_CARD_SLOTS);
    
    if (data) {
      const images: Record<number, string> = {};
      data.forEach(card => {
        if (card.card_image_url) {
          images[card.card_slot] = card.card_image_url;
        }
      });
      setCardImages(images);
    }
  };

  useEffect(() => {
    fetchCardImages();

    // Subscribe to realtime updates for card images - listen to ALL events
    const channel = supabase
      .channel(`research_cards_images:${deckId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'deck_cards',
          filter: `deck_id=eq.${deckId}`
        },
        (payload) => {
          console.log('Card update received:', payload.eventType, payload);
          // Refresh images when any card is updated/inserted
          fetchCardImages();
        }
      )
      .subscribe();

    // Also poll every 3 seconds as backup (realtime can be delayed)
    const pollInterval = setInterval(fetchCardImages, 3000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [deckId]);

  // Auto-stop generating state when all 5 images are loaded
  useEffect(() => {
    if (isGeneratingImages) {
      const loadedImagesCount = Object.values(cardImages).filter(url => url && url.length > 0).length;
      if (loadedImagesCount >= 5) {
        console.log('All 5 research images loaded, stopping generating state');
        setIsGeneratingImages(false);
      }
    }
  }, [cardImages, isGeneratingImages]);

  // Handle starting the new research flow
  const handleStartResearch = async () => {
    await startInsightResearch();
  };

  // Handle completing insight validation
  const handleValidationComplete = async (validationResults: { resonated: boolean; insight: Insight }[]) => {
    setCompletionResults(validationResults);
    setShowCompletion(true);
    setIsGeneratingImages(true); // START: Show generating state on cards
    await completeValidation(validationResults);
    
    // CRITICAL: Refetch research results after saving to get updated data
    console.log('handleValidationComplete: Refetching research data after completeValidation');
    await refetchResearch();
    onRefresh?.(); // Refresh deck cards for progress bar
    
    // Fetch images with delays as they generate
    setTimeout(fetchCardImages, 1000);
    setTimeout(fetchCardImages, 3000);
    setTimeout(() => {
      fetchCardImages();
      refetchResearch(); // Refetch again after images should be ready
      onRefresh?.(); // Refresh again after images
    }, 6000);
    
    // Stop generating state after 15 seconds (images should be done by then)
    setTimeout(() => {
      setIsGeneratingImages(false);
      onRefresh?.(); // Final refresh
    }, 15000);
  };

  // Handle continuing after completion - soft refresh without page reload
  const handleContinue = async () => {
    setShowCompletion(false);
    setCompletionResults([]);
    resetSession();
    
    // Fetch data immediately
    await Promise.all([
      refetchResearch(),
      fetchCardImages()
    ]);
    onRefresh?.(); // Refresh deck cards for progress bar
    
    // Images may still be generating - fetch again after delays
    setTimeout(fetchCardImages, 1000);
    setTimeout(fetchCardImages, 3000);
    setTimeout(() => {
      fetchCardImages();
      setIsGeneratingImages(false); // Stop generating state when user continues
      onRefresh?.(); // Final refresh
    }, 6000);
    
    // Clear localStorage to start fresh next time
    localStorage.removeItem(`research_session_${deckId}`);
    localStorage.removeItem(`research_insights_${deckId}`);
  };

  // Don't hide the whole block when loading - just show loading state inside
  // if (isLoading) { ... } - REMOVED to prevent block disappearing

  // Show insight validation flow - can start as soon as we have 3+ insights
  // Also check streamingInsights for restored sessions
  const insightsToShow = session?.insights?.length ? session.insights : streamingInsights;
  const isReResearchMode = reResearchSlot !== null;
  const minInsightsNeeded = isReResearchMode ? 3 : 3;
  const canStartValidation = insightsToShow.length >= minInsightsNeeded && !showCompletion;
  
  if (canStartValidation) {
    return (
      <InsightValidationFlow
        insights={insightsToShow}
        isStreaming={!isStreamingComplete}
        completedCards={completedVisionCards}
        deckId={deckId}
        totalExpectedInsights={isReResearchMode ? 3 : 15}
        singleCardMode={isReResearchMode}
        onComplete={isReResearchMode ? handleReResearchComplete : handleValidationComplete}
        onCancel={() => {
          if (isReResearchMode) {
            setReResearchSlot(null);
          }
          resetSession();
        }}
      />
    );
  }

  // Show loading screen during initial search (before we have enough insights)
  const loadingTotalInsights = isReResearchMode ? 3 : 15;
  if (isSearching && insightsToShow.length < minInsightsNeeded) {
    return (
      <ResearchLoadingScreen
        isSearching={true}
        sourcesFound={sourcesFound}
        insightsReady={insightsToShow.length}
        totalInsights={loadingTotalInsights}
        estimatedTime={isReResearchMode ? "30 сек" : "2 минуты"}
        onReady={() => {}}
      />
    );
  }

  // Show completion screen
  if (showCompletion && completionResults.length > 0) {
    return (
      <ResearchCompletionScreen
        results={completionResults}
        onContinue={handleContinue}
      />
    );
  }

  return (
    <div 
      className={cn(
        "rounded-xl border-2 transition-all overflow-hidden",
        !isReady && "opacity-70"
      )}
      style={{ borderColor: isReady ? config.color : `${config.color}80` }}
    >
      <Accordion type="single" collapsible defaultValue={isReady ? 'research' : undefined}>
        <AccordionItem value="research" className="border-b-0">
          <AccordionTrigger 
            className="hover:no-underline group py-6 px-6"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <PhaseIcon phase="research" size="lg" />
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-display font-bold text-foreground">
                      {t('phases.research')}
                    </h2>
                    {!isReady && (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        {t('research.completeVisionFirst')}
                      </span>
                    )}
                  </div>
                  {/* Mini thumbnails */}
                  <div className="flex gap-1.5 mt-2">
                    {researchCards.map(def => {
                      const result = getResultForSlot(def.slot);
                      const isAccepted = result?.status === 'accepted';
                      const imageUrl = cardImages[def.slot];
                      
                      return (
                        <div 
                          key={def.slot}
                          className={cn(
                            'w-7 h-10 rounded-sm overflow-hidden border-2 transition-all flex items-center justify-center',
                            (isAccepted || imageUrl)
                              ? 'shadow-sm' 
                              : 'border-dashed bg-muted/30'
                          )}
                          style={{ 
                            borderColor: (isAccepted || imageUrl) ? config.color : 'hsl(var(--muted-foreground) / 0.3)'
                          }}
                        >
                          {imageUrl ? (
                            <img 
                              src={imageUrl} 
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : isAccepted ? (
                            <div 
                              className="w-full h-full" 
                              style={{ background: `${config.color}40` }} 
                            />
                          ) : (
                            <Lock className="w-3 h-3 text-muted-foreground/40" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Reward hint - clickable golden button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setRewardModalOpen(true);
                    }}
                    className="flex items-center gap-2 mt-3 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-400/25 to-amber-500/20 border border-amber-400/50 shadow-lg shadow-amber-500/10 whitespace-nowrap flex-shrink-0 hover:from-amber-500/30 hover:via-yellow-400/35 hover:to-amber-500/30 hover:border-amber-400/70 transition-all cursor-pointer"
                  >
                    <Gift className="w-4 h-4 text-amber-400 animate-pulse flex-shrink-0" />
                    <span className="text-sm text-amber-200/90">
                      {t('rewards.reward')}:{' '}
                      <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 drop-shadow-sm">
                        {t('rewards.research.title')}
                      </span>
                    </span>
                </button>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Generate Research Report Button - show when all 5 accepted */}
                {isReady && acceptedCount > 0 && (
                  <GenerateResearchReportButton
                    filledCount={acceptedCount}
                    totalCount={5}
                    deckId={deckId}
                    onOpenReport={(data) => {
                      setReportData(data);
                      setReportModalOpen(true);
                    }}
                  />
                )}
                
                {/* Start Research Button in collapsed header - only show if NO research done yet */}
                {isReady && !hasResearchBeenDone && !session && (
                  <Button
                    size="sm"
                    className="h-10 px-4 font-bold bg-primary hover:bg-primary/90"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartResearch();
                    }}
                    disabled={isValidationLoading}
                  >
                    <Rocket className="w-4 h-4 mr-2" />
                    {t('research.startResearch')}
                  </Button>
                )}
                
                <div 
                  className={cn(
                    "w-16 h-16 rounded-full border-4 flex items-center justify-center font-bold text-lg",
                    !isReady && "opacity-60"
                  )}
                  style={{ 
                    borderColor: isReady ? config.color : `${config.color}80`,
                    color: isReady ? config.color : `${config.color}80`
                  }}
                >
                  {!isReady ? (
                    <Lock className="w-6 h-6" />
                  ) : (
                    `${acceptedCount}/5`
                  )}
                </div>
              </div>
            </div>
          </AccordionTrigger>
          
          <AccordionContent>
            {/* Not Ready State - Compact */}
            {!isReady && (
              <div className="bg-muted/30 rounded-lg p-4 mb-4 flex items-center gap-3 mx-6">
                <Lock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-foreground font-medium">{t('research.completeVisionTitle')}</p>
                  <p className="text-xs text-muted-foreground">{t('research.completeVisionDesc')}</p>
                </div>
              </div>
            )}

            {/* Research Cards Grid - ALWAYS show when isReady */}
            {isReady && (
              <motion.div 
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 lg:gap-10 px-6 pb-8"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1 }
                  }
                }}
              >
                {researchCards.map((definition) => {
                  const result = getResultForSlot(definition.slot);
                  const isAccepted = result?.status === 'accepted';

                  return (
                    <motion.div
                      key={definition.slot}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 }
                      }}
                    >
                      <ErrorBoundary>
                        <ResearchCard
                          definition={definition}
                          result={result}
                          isUnlocked={true}
                          isResearching={researchingSlot === definition.slot}
                          isGeneratingImages={isGeneratingImages}
                          onStartResearch={() => startResearchForSlot(definition.slot)}
                          onAccept={() => {}}
                          onDiscuss={() => Promise.resolve(null)}
                          onReResearch={() => handleStartReResearch(definition.slot)}
                          deckId={deckId}
                          cardImageUrl={cardImages[definition.slot]}
                          isAccepting={acceptingSlot === definition.slot}
                        />
                      </ErrorBoundary>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <RewardModal open={rewardModalOpen} onOpenChange={setRewardModalOpen} phase="research" />
      <ResearchReportModal 
        open={reportModalOpen} 
        onClose={() => {
          setReportModalOpen(false);
          setReportData(null);
        }} 
        deckId={deckId}
        initialData={reportData}
      />
    </div>
  );
}
