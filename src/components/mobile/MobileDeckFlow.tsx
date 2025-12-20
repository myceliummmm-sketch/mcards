import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Sparkles, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MobileCardEditor } from './MobileCardEditor';
import { MobileChat } from './MobileChat';
import { MobileAutoComplete } from './MobileAutoComplete';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { CARD_DEFINITIONS } from '@/data/cardDefinitions';
import type { Database } from '@/integrations/supabase/types';

type DeckCard = Database['public']['Tables']['deck_cards']['Row'];

interface MobileDeckFlowProps {
  deckId: string;
  deckTitle: string;
  cards: DeckCard[];
  onCardUpdate: (cardId: string, data: Record<string, any>) => Promise<void>;
  onForgeCard: (cardId: string) => Promise<void>;
  onRenameDeck: (newTitle: string) => Promise<void>;
}

type FlowStep = 'editing' | 'choose-path' | 'auto-complete' | 'chat';

export function MobileDeckFlow({
  deckId,
  deckTitle,
  cards,
  onCardUpdate,
  onForgeCard,
  onRenameDeck,
}: MobileDeckFlowProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { sporeBalance } = useSubscription();

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [flowStep, setFlowStep] = useState<FlowStep>('editing');
  const [showChat, setShowChat] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  // Initialize vision cards if none exist
  useEffect(() => {
    const initializeCards = async () => {
      const visionCardsExist = cards.some(c => c.card_slot >= 1 && c.card_slot <= 5);

      if (!visionCardsExist && cards.length === 0 && !isInitializing) {
        setIsInitializing(true);

        // Get vision card definitions (slots 1-5)
        const visionDefs = CARD_DEFINITIONS.filter(d => d.slot >= 1 && d.slot <= 5);

        // Create empty cards for each vision slot
        for (const def of visionDefs) {
          await supabase
            .from('deck_cards')
            .upsert({
              deck_id: deckId,
              card_slot: def.slot,
              card_type: def.cardType,
              card_data: {},
            }, {
              onConflict: 'deck_id,card_slot'
            });
        }

        setIsInitializing(false);
        // Cards will be refetched via realtime subscription
      }
    };

    initializeCards();
  }, [deckId, cards, isInitializing]);

  // Get vision cards only (slots 1-5, regardless of card_type)
  const visionCards = cards
    .filter(c => c.card_slot >= 1 && c.card_slot <= 5)
    .sort((a, b) => a.card_slot - b.card_slot);

  const currentCard = visionCards[currentCardIndex];

  // Count completed cards
  const completedCards = visionCards.filter(card => {
    const data = card.card_data as Record<string, any> | null;
    return data && Object.keys(data).some(k => k !== 'completed' && data[k]);
  }).length;

  // Check if first card is done
  const isFirstCardDone = () => {
    if (!visionCards[0]) return false;
    const data = visionCards[0].card_data as Record<string, any> | null;
    return data && Object.keys(data).some(k => k !== 'completed' && data[k]);
  };

  // Auto-rename deck after first card
  const handleFirstCardComplete = async (content: string) => {
    if (deckTitle === 'New Idea' || deckTitle === 'Untitled') {
      // Extract a title from the first ~50 chars
      const shortTitle = content.slice(0, 50).split('\n')[0] || 'My Idea';
      await onRenameDeck(shortTitle);
    }
  };

  const handleCardSave = async (cardId: string, data: Record<string, any>) => {
    await onCardUpdate(cardId, data);

    // If first card, maybe rename deck
    if (currentCardIndex === 0 && data.problem) {
      await handleFirstCardComplete(data.problem);
    }
  };

  const handleNextCard = () => {
    if (currentCardIndex === 0 && isFirstCardDone()) {
      // After first card, show choice
      setFlowStep('choose-path');
    } else if (currentCardIndex < visionCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    }
  };

  const handleChooseManual = () => {
    setCurrentCardIndex(1);
    setFlowStep('editing');
  };

  const handleChooseAuto = () => {
    setFlowStep('auto-complete');
  };

  const handleAutoCompleteFinished = () => {
    setFlowStep('editing');
    setCurrentCardIndex(visionCards.length - 1);
  };

  // Floating chat button
  const FloatingChatButton = () => (
    <button
      onClick={() => setShowChat(true)}
      className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center z-50 active:scale-95 transition-transform"
    >
      <MessageCircle className="w-6 h-6" />
    </button>
  );

  // Progress dots
  const ProgressDots = () => (
    <div className="flex items-center gap-2 justify-center py-4">
      {visionCards.map((card, idx) => {
        const data = card.card_data as Record<string, any> | null;
        const isDone = data && Object.keys(data).some(k => k !== 'completed' && data[k]);
        const isCurrent = idx === currentCardIndex;

        return (
          <button
            key={card.id}
            onClick={() => {
              setCurrentCardIndex(idx);
              setFlowStep('editing');
            }}
            className={`w-3 h-3 rounded-full transition-all ${
              isCurrent
                ? 'bg-primary w-6'
                : isDone
                  ? 'bg-primary/60'
                  : 'bg-muted-foreground/30'
            }`}
          />
        );
      })}
    </div>
  );

  // Choose path screen
  if (flowStep === 'choose-path') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="font-medium truncate">{deckTitle}</span>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Check className="w-8 h-8 text-primary" />
          </div>

          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">
              {t('mobileFlow.choosePath.title') || 'First card done!'}
            </h2>
            <p className="text-muted-foreground">
              {t('mobileFlow.choosePath.subtitle') || 'How do you want to continue?'}
            </p>
          </div>

          <div className="w-full space-y-3 max-w-sm">
            <Button
              onClick={handleChooseAuto}
              className="w-full h-auto py-4 flex-col gap-1"
              disabled={sporeBalance < 50}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <span>{t('mobileFlow.choosePath.auto') || 'AI generates 4 cards'}</span>
              </div>
              <span className="text-xs opacity-70">50 SPORE</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleChooseManual}
              className="w-full h-auto py-4"
            >
              {t('mobileFlow.choosePath.manual') || 'I\'ll do it myself'}
            </Button>
          </div>

          <button
            onClick={() => setShowChat(true)}
            className="text-sm text-muted-foreground underline"
          >
            {t('mobileFlow.choosePath.askTeam') || 'Ask the AI team first'}
          </button>
        </div>

        {showChat && (
          <MobileChat
            deckId={deckId}
            cards={cards}
            onClose={() => setShowChat(false)}
          />
        )}
      </div>
    );
  }

  // Auto-complete screen
  if (flowStep === 'auto-complete') {
    return (
      <MobileAutoComplete
        deckId={deckId}
        cards={visionCards}
        onComplete={handleAutoCompleteFinished}
        onBack={() => setFlowStep('choose-path')}
      />
    );
  }

  // Loading state while initializing cards
  if (isInitializing || (cards.length === 0 && !visionCards.length)) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Setting up your deck...</p>
      </div>
    );
  }

  // Main editing screen
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <span className="font-medium truncate flex-1">{deckTitle}</span>
        <span className="text-xs text-muted-foreground">
          {completedCards}/{visionCards.length}
        </span>
      </div>

      {/* Progress */}
      <ProgressDots />

      {/* Card Editor */}
      {currentCard && (
        <MobileCardEditor
          card={currentCard}
          cardIndex={currentCardIndex}
          totalCards={visionCards.length}
          onSave={(data) => handleCardSave(currentCard.id, data)}
          onNext={handleNextCard}
          onPrevious={() => setCurrentCardIndex(prev => Math.max(0, prev - 1))}
          isFirst={currentCardIndex === 0}
          isLast={currentCardIndex === visionCards.length - 1}
        />
      )}

      {/* Floating chat button */}
      <FloatingChatButton />

      {/* Chat modal */}
      {showChat && (
        <MobileChat
          deckId={deckId}
          cards={cards}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}
