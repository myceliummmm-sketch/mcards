import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, Zap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface ResearchLoadingScreenProps {
  isSearching: boolean;
  sourcesFound: number;
  insightsReady: number;
  totalInsights: number;
  estimatedTime: string;
  onReady: () => void;
}

const SEARCH_MESSAGES = [
  { emoji: '🔍', text: 'Команда ищет данные по твоей идее...' },
  { emoji: '🌐', text: 'Анализируем рыночные источники...' },
  { emoji: '📊', text: 'Собираем статистику и тренды...' },
  { emoji: '💬', text: 'Ищем цитаты реальных пользователей...' },
  { emoji: '⚠️', text: 'Выявляем потенциальные риски...' },
  { emoji: '🎯', text: 'Формируем инсайты для валидации...' },
];

export function ResearchLoadingScreen({
  isSearching,
  sourcesFound,
  insightsReady,
  totalInsights,
  estimatedTime,
  onReady,
}: ResearchLoadingScreenProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const progress = (insightsReady / totalInsights) * 100;
  const isReady = insightsReady >= totalInsights;

  // Rotate messages
  useEffect(() => {
    if (!isSearching) return;
    
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % SEARCH_MESSAGES.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isSearching]);

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md text-center"
      >
        {/* Icon */}
        <motion.div
          animate={isSearching ? { rotate: 360 } : {}}
          transition={{ duration: 2, repeat: isSearching ? Infinity : 0, ease: 'linear' }}
          className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center"
        >
          {isReady ? (
            <Sparkles className="w-12 h-12 text-primary" />
          ) : (
            <Search className="w-12 h-12 text-primary" />
          )}
        </motion.div>

        {/* Title */}
        <h2 className="text-2xl font-bold mb-2">
          {isReady ? '✨ Готово!' : '🔬 Research в процессе'}
        </h2>

        {/* Message */}
        <motion.p
          key={isReady ? 'ready' : messageIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-muted-foreground mb-6"
        >
          {isReady 
            ? `Команда нашла ${insightsReady} инсайтов!`
            : `${SEARCH_MESSAGES[messageIndex].emoji} ${SEARCH_MESSAGES[messageIndex].text}`
          }
        </motion.p>

        {/* Progress */}
        <div className="mb-6">
          <Progress value={progress} className="h-3 mb-2" />
          <div className="text-sm text-muted-foreground text-center">
            <span>Инсайтов: {insightsReady}/{totalInsights}</span>
          </div>
        </div>

        {/* Sources Found */}
        {sourcesFound > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6"
          >
            <Globe className="w-4 h-4" />
            <span>Найдено источников: {sourcesFound}</span>
          </motion.div>
        )}

        {/* Ready Button */}
        {isReady && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              size="lg"
              className="w-full h-14 text-lg font-bold"
              onClick={onReady}
            >
              <Zap className="w-5 h-5 mr-2" />
              🚀 Погнали!
            </Button>
          </motion.div>
        )}

        {/* Team Members Working */}
        {!isReady && (
          <div className="flex justify-center gap-3 mt-6">
            {['🔥', '💎', '☢️', '⚙️', '🌲'].map((emoji, i) => (
              <motion.div
                key={emoji}
                animate={{ 
                  y: [0, -5, 0],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg"
              >
                {emoji}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
