import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { HealthScoreCard } from './HealthScoreCard';
import { MetricBreakdown } from './MetricBreakdown';
import { AITipsPanel } from './AITipsPanel';
import { DeckThumbnails } from './DeckThumbnails';
import { useDeckHealth } from '@/hooks/useDeckHealth';
import { useTranslation } from '@/hooks/useTranslation';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type DeckCard = Database['public']['Tables']['deck_cards']['Row'];

interface DeckHealthDashboardProps {
  deckId: string;
  cards: DeckCard[];
  isOpen: boolean;
  onClose: () => void;
}

export function DeckHealthDashboard({ deckId, cards, isOpen, onClose }: DeckHealthDashboardProps) {
  const { healthData, isLoading, refresh } = useDeckHealth(deckId);
  const { language } = useTranslation();

  // Auto-refresh when modal opens
  useEffect(() => {
    if (isOpen) {
      refresh();
    }
  }, [isOpen, refresh]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {language === 'ru' ? 'Здоровье колоды' : 'Deck Health Dashboard'}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="relative"
            >
              <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary" />
              <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-primary" />
            </motion.div>
            
            <div className="text-center space-y-2">
              <motion.p 
                className="text-lg font-medium text-foreground"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {language === 'ru' ? 'Анализируем колоду...' : 'Analyzing deck...'}
              </motion.p>
              <p className="text-sm text-muted-foreground">
                {language === 'ru' 
                  ? 'AI изучает ваши карточки и готовит рекомендации' 
                  : 'AI is studying your cards and preparing recommendations'}
              </p>
            </div>
          </div>
        ) : healthData ? (
          <div className="space-y-6">
            <HealthScoreCard score={healthData.overallScore} quality={healthData.metrics.quality} />
            <DeckThumbnails cards={cards} />
            <MetricBreakdown
              completion={healthData.metrics.completion}
              balance={healthData.metrics.balance}
              quality={healthData.metrics.quality}
              variety={healthData.metrics.variety}
            />
            <AITipsPanel
              summary={healthData.insights.summary}
              tips={healthData.insights.tips}
              strengths={healthData.insights.strengths}
              nextAction={healthData.insights.nextAction}
            />
            <p className="text-xs text-muted-foreground text-center">
              {language === 'ru' ? 'Последний анализ:' : 'Last analyzed:'} {new Date(healthData.lastAnalyzed).toLocaleString()}
            </p>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            {language === 'ru' ? 'Не удалось загрузить данные.' : 'Failed to load health data.'}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
