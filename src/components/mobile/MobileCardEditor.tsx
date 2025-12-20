import { useState, useEffect, useMemo } from 'react';
import { Mic, MicOff, ChevronLeft, ChevronRight, Loader2, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { CARD_DEFINITIONS } from '@/data/cardDefinitions';
import { getCharacterById, type Language } from '@/data/teamCharacters';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
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

// Map card slots to AI team members
const SLOT_CHARACTER_MAP: Record<number, string> = {
  1: 'prisma',      // Problem - Product Manager
  2: 'phoenix',     // Audience - CMO
  3: 'techpriest',  // Solution - CTO
  4: 'toxic',       // Why You - Security (competitive advantage)
  5: 'evergreen',   // Vision - CEO
};

// Tips for each slot
const SLOT_TIPS: Record<number, { en: string; ru: string }> = {
  1: { 
    en: "Fall in love with the problem, not the solution! What pain keeps people awake at night?",
    ru: "Влюбись в проблему, а не в решение! Какая боль не даёт людям спать?"
  },
  2: { 
    en: "Who's your ideal customer? Picture them clearly — what do they do, where do they hang out?",
    ru: "Кто твой идеальный клиент? Представь его ясно — чем занимается, где его найти?"
  },
  3: { 
    en: "How does your tech magic work? Explain it like you're teaching a friend.",
    ru: "Как работает твоя технологическая магия? Объясни как другу."
  },
  4: { 
    en: "What's your unfair advantage? Why will YOU win this game?",
    ru: "В чём твоё нечестное преимущество? Почему победишь именно ТЫ?"
  },
  5: { 
    en: "Dream big! What does success look like in 3-5 years?",
    ru: "Мечтай по-крупному! Как выглядит успех через 3-5 лет?"
  },
};

// Gradient backgrounds for each slot
const SLOT_GRADIENTS: Record<number, string> = {
  1: 'from-blue-600/30 via-cyan-500/20 to-transparent',
  2: 'from-orange-500/30 via-red-500/20 to-transparent',
  3: 'from-purple-600/30 via-violet-500/20 to-transparent',
  4: 'from-amber-500/30 via-orange-500/20 to-transparent',
  5: 'from-emerald-500/30 via-green-500/20 to-transparent',
};

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
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Get character for this slot
  const characterId = SLOT_CHARACTER_MAP[card.card_slot] || 'prisma';
  const character = useMemo(() => 
    getCharacterById(characterId, language as Language), 
    [characterId, language]
  );

  // Get tip for this slot
  const tip = SLOT_TIPS[card.card_slot]?.[language as 'en' | 'ru'] || SLOT_TIPS[card.card_slot]?.en;
  
  // Get gradient for this slot
  const gradient = SLOT_GRADIENTS[card.card_slot] || SLOT_GRADIENTS[1];

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

  // Generate AI suggestions
  const generateSuggestions = async () => {
    setIsGeneratingSuggestions(true);
    setShowSuggestions(true);
    setSuggestions([]);
    
    try {
      const { data, error } = await supabase.functions.invoke('suggest-card-field', {
        body: {
          cardType: card.card_type,
          fieldName: fieldKey,
          currentValue: value,
          previousAnswers: cardData || {},
          language
        }
      });

      if (error) throw error;
      
      if (data?.suggestions && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions);
      } else {
        toast.error(language === 'ru' ? 'Не удалось получить подсказки' : 'Failed to get suggestions');
      }
    } catch (err) {
      console.error('Error generating suggestions:', err);
      toast.error(language === 'ru' ? 'Ошибка генерации' : 'Generation error');
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const applySuggestion = (suggestion: string) => {
    setValue(suggestion);
    setShowSuggestions(false);
    toast.success(language === 'ru' ? 'Подсказка применена!' : 'Suggestion applied!');
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
    return titles[card.card_slot]?.[language as 'en' | 'ru'] || (cardDef?.title as any)?.[language] || (cardDef?.title as any)?.en || `Card ${card.card_slot}`;
  };

  // Placeholder text
  const getPlaceholder = () => {
    const placeholders: Record<number, { en: string; ru: string }> = {
      1: {
        en: 'Describe the pain point you\'re addressing...',
        ru: 'Опиши проблему, которую ты решаешь...'
      },
      2: {
        en: 'Who is your ideal customer?',
        ru: 'Кто твой идеальный клиент?'
      },
      3: {
        en: 'How does your solution work?',
        ru: 'Как работает твоё решение?'
      },
      4: {
        en: 'What\'s your unfair advantage?',
        ru: 'В чём твоё преимущество?'
      },
      5: {
        en: 'What does success look like in 3 years?',
        ru: 'Как выглядит успех через 3 года?'
      },
    };
    return placeholders[card.card_slot]?.[language as 'en' | 'ru'] || (mainField?.placeholder as any)?.[language] || (mainField?.placeholder as any)?.en || '';
  };

  return (
    <div className={`flex-1 flex flex-col min-h-screen bg-gradient-to-b ${gradient} relative overflow-hidden`}>
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col p-4">
        {/* Progress bar */}
        <div className="h-1.5 bg-muted/30 rounded-full mb-4 overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((cardIndex + 1) / totalCards) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        {/* Card number badge */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-3"
        >
          <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
            {cardIndex + 1} / {totalCards}
          </span>
        </motion.div>

        {/* AI Character Helper */}
        {character && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-start gap-3 mb-4 p-3 rounded-2xl backdrop-blur-sm bg-background/40 border border-white/10"
          >
            <div 
              className="w-12 h-12 rounded-full overflow-hidden ring-2 flex-shrink-0"
              style={{ boxShadow: `0 0 20px ${character.color}40`, borderColor: character.color }}
            >
              <img 
                src={character.avatar} 
                alt={character.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm" style={{ color: character.color }}>
                  {character.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {character.role}
                </span>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {tip}
              </p>
            </div>
          </motion.div>
        )}

        {/* Question */}
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-bold mb-4 text-foreground"
        >
          {getCardTitle()}
        </motion.h2>

        {/* Text area with glassmorphism */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex-1 relative"
        >
          <div className="relative h-full rounded-2xl backdrop-blur-md bg-background/60 border border-white/20 shadow-xl overflow-hidden">
            <Textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onBlur={handleSave}
              placeholder={getPlaceholder()}
              className="w-full h-full min-h-[180px] resize-none text-lg p-4 pb-16 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />

            {/* Voice button */}
            {isSupported && (
              <button
                onClick={handleVoiceToggle}
                className={`absolute bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse scale-110'
                    : 'bg-primary/90 text-primary-foreground hover:bg-primary hover:scale-105'
                }`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            )}
          </div>
        </motion.div>

        {/* Voice status */}
        <AnimatePresence>
          {isListening && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-center text-sm text-primary py-2 flex items-center justify-center gap-2"
            >
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              {t('mobileFlow.listening') || 'Listening...'} 🎤
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="text-center text-sm text-destructive py-2">
            {error}
          </div>
        )}

        {/* AI Suggest Button */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="py-3"
        >
          <Button
            variant="outline"
            onClick={generateSuggestions}
            disabled={isGeneratingSuggestions}
            className="w-full backdrop-blur-sm bg-background/40 border-primary/30 hover:bg-primary/20 hover:border-primary/50 transition-all"
          >
            {isGeneratingSuggestions ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {language === 'ru' ? 'Генерирую...' : 'Generating...'}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                {language === 'ru' ? '✨ AI подсказка' : '✨ AI Suggest'}
              </>
            )}
          </Button>
        </motion.div>

        {/* AI Suggestions */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-2 pb-3"
            >
              <p className="text-xs text-muted-foreground mb-2">
                {language === 'ru' ? 'Выбери подсказку:' : 'Choose a suggestion:'}
              </p>
              {suggestions.map((suggestion, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => applySuggestion(suggestion)}
                  className="w-full text-left p-3 rounded-xl backdrop-blur-sm bg-background/50 border border-white/10 hover:bg-primary/10 hover:border-primary/30 transition-all text-sm"
                >
                  <Zap className="w-3 h-3 inline mr-2 text-primary" />
                  {suggestion}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mini Card Preview */}
        <AnimatePresence>
          {value.trim().length > 20 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mb-3 p-3 rounded-xl bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-md border border-white/20 shadow-lg"
            >
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: character?.color + '30', color: character?.color }}
                >
                  {card.card_slot}
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {language === 'ru' ? 'Превью карточки' : 'Card Preview'}
                </span>
              </div>
              <p className="text-sm text-foreground/90 line-clamp-2">
                {value}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex gap-3 pt-2"
        >
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={isFirst}
            className="flex-1 backdrop-blur-sm bg-background/40 border-white/20 hover:bg-background/60"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {t('common.back') || 'Back'}
          </Button>

          <Button
            onClick={handleNext}
            disabled={!value.trim() || isSaving}
            className="flex-1 bg-primary hover:bg-primary/90 shadow-lg"
            style={{ boxShadow: character ? `0 4px 20px ${character.color}40` : undefined }}
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
        </motion.div>
      </div>
    </div>
  );
}
