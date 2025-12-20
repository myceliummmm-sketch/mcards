import { useState, useEffect } from 'react';
import { Mic, MicOff, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { CARD_DEFINITIONS } from '@/data/cardDefinitions';
import type { Database } from '@/integrations/supabase/types';

type DeckCard = Database['public']['Tables']['deck_cards']['Row'];

interface MobileCardEditorProps {
  card: DeckCard;
  cardIndex: number;
  totalCards: number;
  onSave: (data: Record<string, any>) => Promise<void>;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export function MobileCardEditor({
  card,
  cardIndex,
  totalCards,
  onSave,
  onNext,
  onPrevious,
  isFirst,
  isLast,
}: MobileCardEditorProps) {
  const { t, language } = useLanguage();
  const { isListening, isSupported, startListening, stopListening, transcript, error } = useVoiceInput();

  // Get card definition
  const cardDef = CARD_DEFINITIONS.find(
    def => def.id === card.card_type && def.slot === card.card_slot
  );

  // Get the main field (first required field)
  const mainField = cardDef?.fields?.[0];
  const fieldKey = mainField?.name || 'content';

  // Current value
  const cardData = card.card_data as Record<string, any> | null;
  const [value, setValue] = useState(cardData?.[fieldKey] || '');
  const [isSaving, setIsSaving] = useState(false);

  // Update value when transcript changes
  useEffect(() => {
    if (transcript) {
      setValue(prev => prev ? `${prev} ${transcript}` : transcript);
    }
  }, [transcript]);

  // Auto-save on blur or after voice input stops
  const handleSave = async () => {
    if (!value.trim()) return;
    setIsSaving(true);
    try {
      await onSave({ [fieldKey]: value });
    } finally {
      setIsSaving(false);
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
      // Auto-save after voice input
      setTimeout(handleSave, 500);
    } else {
      startListening();
    }
  };

  const handleNext = async () => {
    await handleSave();
    onNext();
  };

  // Card title based on slot
  const getCardTitle = () => {
    const titles: Record<number, { en: string; ru: string }> = {
      1: { en: 'What problem are you solving?', ru: 'Какую проблему ты решаешь?' },
      2: { en: 'Who has this problem?', ru: 'У кого эта проблема?' },
      3: { en: 'How do you solve it?', ru: 'Как ты это решаешь?' },
      4: { en: 'Why you?', ru: 'Почему ты?' },
      5: { en: 'What\'s your vision?', ru: 'Какое твоё видение?' },
    };
    return titles[card.card_slot]?.[language] || cardDef?.title || `Card ${card.card_slot}`;
  };

  // Placeholder text
  const getPlaceholder = () => {
    const placeholders: Record<number, { en: string; ru: string }> = {
      1: {
        en: 'Describe the pain point you\'re addressing. Be specific about who feels this pain and why it matters...',
        ru: 'Опиши проблему, которую ты решаешь. Кто её испытывает и почему это важно...'
      },
      2: {
        en: 'Who is your ideal customer? What do they do? Where do they hang out?',
        ru: 'Кто твой идеальный клиент? Чем занимается? Где его найти?'
      },
      3: {
        en: 'How does your solution work? What makes it unique?',
        ru: 'Как работает твоё решение? Что делает его уникальным?'
      },
      4: {
        en: 'What\'s your unfair advantage? Why will you win?',
        ru: 'В чём твоё преимущество? Почему победишь именно ты?'
      },
      5: {
        en: 'What does success look like in 3 years? Paint the picture.',
        ru: 'Как выглядит успех через 3 года? Нарисуй картину.'
      },
    };
    return placeholders[card.card_slot]?.[language] || mainField?.placeholder || '';
  };

  return (
    <div className="flex-1 flex flex-col p-4">
      {/* Card number */}
      <div className="text-sm text-muted-foreground mb-2">
        {t('mobileFlow.card') || 'Card'} {cardIndex + 1} / {totalCards}
      </div>

      {/* Question */}
      <h2 className="text-xl font-bold mb-4">
        {getCardTitle()}
      </h2>

      {/* Text area */}
      <div className="flex-1 relative">
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave}
          placeholder={getPlaceholder()}
          className="w-full h-full min-h-[200px] resize-none text-lg p-4 pb-16"
        />

        {/* Voice button */}
        {isSupported && (
          <button
            onClick={handleVoiceToggle}
            className={`absolute bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Voice status */}
      {isListening && (
        <div className="text-center text-sm text-muted-foreground py-2">
          {t('mobileFlow.listening') || 'Listening...'} 🎤
        </div>
      )}

      {error && (
        <div className="text-center text-sm text-destructive py-2">
          {error}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={isFirst}
          className="flex-1"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          {t('common.back') || 'Back'}
        </Button>

        <Button
          onClick={handleNext}
          disabled={!value.trim() || isSaving}
          className="flex-1"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              {isLast
                ? (t('mobileFlow.finish') || 'Finish')
                : (t('common.next') || 'Next')
              }
              {!isLast && <ChevronRight className="w-4 h-4 ml-1" />}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
