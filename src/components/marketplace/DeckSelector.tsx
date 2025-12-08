import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';
import { useTranslation } from '@/hooks/useTranslation';

type Deck = Database['public']['Tables']['decks']['Row'];

interface DeckSelectorProps {
  decks: Deck[];
  selectedDeckId: string | null;
  onDeckChange: (deckId: string | null) => void;
  loading?: boolean;
}

export function DeckSelector({ decks, selectedDeckId, onDeckChange, loading }: DeckSelectorProps) {
  const { t } = useTranslation();
  
  if (loading || decks.length === 0) return null;

  return (
    <div className="flex items-center gap-3 mb-6 p-4 bg-card/50 backdrop-blur-sm rounded-lg border border-border">
      <Sparkles className="w-5 h-5 text-primary" />
      <div className="flex-1">
        <p className="text-sm text-muted-foreground mb-1">{t('marketplace.getRecommendations')}</p>
        <Select value={selectedDeckId || 'none'} onValueChange={(value) => onDeckChange(value === 'none' ? null : value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t('marketplace.selectDeck')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">{t('marketplace.noRecommendations')}</SelectItem>
            {decks.map((deck) => (
              <SelectItem key={deck.id} value={deck.id}>
                {deck.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}