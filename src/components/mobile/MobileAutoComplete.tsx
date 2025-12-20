import { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, Check, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAutoCompleteVision } from '@/hooks/useAutoCompleteVision';
import type { Database } from '@/integrations/supabase/types';

type DeckCard = Database['public']['Tables']['deck_cards']['Row'];

interface MobileAutoCompleteProps {
  deckId: string;
  cards: DeckCard[];
  onComplete: () => void;
  onBack: () => void;
}

export function MobileAutoComplete({
  deckId,
  cards,
  onComplete,
  onBack,
}: MobileAutoCompleteProps) {
  const { t } = useLanguage();
  const {
    startAutoComplete,
    isGenerating,
    progress,
    error,
    isComplete,
  } = useAutoCompleteVision(deckId);

  const [hasStarted, setHasStarted] = useState(false);

  // Start auto-complete on mount
  useEffect(() => {
    if (!hasStarted) {
      setHasStarted(true);
      startAutoComplete();
    }
  }, [hasStarted, startAutoComplete]);

  // Auto-navigate when complete
  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(onComplete, 1500);
      return () => clearTimeout(timer);
    }
  }, [isComplete, onComplete]);

  // Card status component
  const CardStatus = ({ slot, status }: { slot: number; status: 'done' | 'generating' | 'pending' }) => {
    const cardTitles: Record<number, string> = {
      1: t('mobileFlow.autoComplete.card1') || 'Problem',
      2: t('mobileFlow.autoComplete.card2') || 'Audience',
      3: t('mobileFlow.autoComplete.card3') || 'Solution',
      4: t('mobileFlow.autoComplete.card4') || 'Advantage',
      5: t('mobileFlow.autoComplete.card5') || 'Vision',
    };

    return (
      <div className={`flex items-center gap-3 p-4 rounded-lg transition-all ${
        status === 'done'
          ? 'bg-primary/10 border border-primary/30'
          : status === 'generating'
            ? 'bg-muted animate-pulse'
            : 'bg-muted/50'
      }`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          status === 'done'
            ? 'bg-primary text-primary-foreground'
            : status === 'generating'
              ? 'bg-primary/20'
              : 'bg-muted-foreground/20'
        }`}>
          {status === 'done' ? (
            <Check className="w-4 h-4" />
          ) : status === 'generating' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <span className="text-sm text-muted-foreground">{slot}</span>
          )}
        </div>

        <div className="flex-1">
          <div className="font-medium">{cardTitles[slot]}</div>
          <div className="text-xs text-muted-foreground">
            {status === 'done'
              ? (t('mobileFlow.autoComplete.done') || 'Complete')
              : status === 'generating'
                ? (t('mobileFlow.autoComplete.generating') || 'Generating...')
                : (t('mobileFlow.autoComplete.waiting') || 'Waiting...')
            }
          </div>
        </div>
      </div>
    );
  };

  // Determine card statuses based on progress
  const getCardStatus = (slot: number): 'done' | 'generating' | 'pending' => {
    if (slot === 1) return 'done'; // First card is always done (user filled it)

    const cardProgress = progress.find(p => p.slot === slot);
    if (cardProgress?.status === 'complete') return 'done';
    if (cardProgress?.status === 'generating') return 'generating';
    return 'pending';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b">
        <Button variant="ghost" size="icon" onClick={onBack} disabled={isGenerating}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <span className="font-medium">
          {t('mobileFlow.autoComplete.title') || 'AI Auto-Complete'}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
            isComplete
              ? 'bg-primary/10'
              : isGenerating
                ? 'bg-primary/5 animate-pulse'
                : 'bg-muted'
          }`}>
            {isComplete ? (
              <Check className="w-10 h-10 text-primary" />
            ) : error ? (
              <AlertCircle className="w-10 h-10 text-destructive" />
            ) : (
              <Sparkles className={`w-10 h-10 text-primary ${isGenerating ? 'animate-pulse' : ''}`} />
            )}
          </div>
        </div>

        {/* Title */}
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">
            {isComplete
              ? (t('mobileFlow.autoComplete.completeTitle') || 'All cards ready!')
              : error
                ? (t('mobileFlow.autoComplete.errorTitle') || 'Something went wrong')
                : (t('mobileFlow.autoComplete.generatingTitle') || 'AI is crafting your cards...')
            }
          </h2>
          <p className="text-muted-foreground">
            {isComplete
              ? (t('mobileFlow.autoComplete.completeSubtitle') || 'Your Vision phase is complete')
              : error
                ? error
                : (t('mobileFlow.autoComplete.generatingSubtitle') || 'This takes about 2 minutes')
            }
          </p>
        </div>

        {/* Card statuses */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(slot => (
            <CardStatus key={slot} slot={slot} status={getCardStatus(slot)} />
          ))}
        </div>

        {/* Error retry */}
        {error && (
          <Button onClick={() => startAutoComplete()} className="w-full">
            {t('mobileFlow.autoComplete.retry') || 'Try Again'}
          </Button>
        )}

        {/* Complete button */}
        {isComplete && (
          <Button onClick={onComplete} className="w-full">
            {t('mobileFlow.autoComplete.viewCards') || 'View All Cards'}
          </Button>
        )}
      </div>
    </div>
  );
}
