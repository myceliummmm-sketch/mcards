import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { DEMO_CARDS, PHASE_COLORS, PHASE_BORDER_COLORS } from '@/data/demoCardData';

const PAIN_POINTS = [
  { key: 'soloFounder', color: 'text-primary' },
  { key: 'corporate', color: 'text-secondary' },
  { key: 'noCode', color: 'text-accent' },
  { key: 'student', color: 'text-primary' },
];

export const HeroMiniCards = () => {
  const { t } = useTranslation();
  const [mysteryState, setMysteryState] = useState<'question' | 'revealed'>('question');
  const [currentPainIndex, setCurrentPainIndex] = useState(0);
  const [autoRevealTimer, setAutoRevealTimer] = useState<NodeJS.Timeout | null>(null);

  // Auto-cycle mystery card every 6 seconds when in question state
  useEffect(() => {
    if (mysteryState === 'question') {
      const timer = setTimeout(() => {
        handleMysteryClick();
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [mysteryState, currentPainIndex]);

  // After reveal, auto-hide after 4 seconds
  useEffect(() => {
    if (mysteryState === 'revealed') {
      const timer = setTimeout(() => {
        setMysteryState('question');
        setCurrentPainIndex((prev) => (prev + 1) % PAIN_POINTS.length);
      }, 4000);
      setAutoRevealTimer(timer);
      return () => clearTimeout(timer);
    }
  }, [mysteryState]);

  const handleMysteryClick = () => {
    if (autoRevealTimer) {
      clearTimeout(autoRevealTimer);
    }
    if (mysteryState === 'question') {
      setMysteryState('revealed');
    } else {
      setMysteryState('question');
      setCurrentPainIndex((prev) => (prev + 1) % PAIN_POINTS.length);
    }
  };

  const currentPain = PAIN_POINTS[currentPainIndex];
  const displayCards = DEMO_CARDS.slice(0, 4); // Problem, Audience, Market, MVP

  return (
    <div className="flex gap-3 mt-8">
      {/* 4 Demo Cards */}
      {displayCards.map((card, index) => (
        <motion.div
          key={card.id}
          className={`relative w-20 h-28 rounded-xl overflow-hidden cursor-pointer group
            bg-gradient-to-br ${PHASE_COLORS[card.phase]} 
            border ${PHASE_BORDER_COLORS[card.phase]}
            hover:scale-105 transition-transform duration-300`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          {/* Card Image */}
          {card.imageUrl && (
            <div className="absolute inset-0">
              <img 
                src={card.imageUrl} 
                alt={card.title}
                className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
            </div>
          )}
          
          {/* Card Content */}
          <div className="absolute inset-0 p-2 flex flex-col justify-end">
            <p className="text-[10px] font-semibold text-foreground truncate">
              {card.title}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <div className="w-6 h-6 rounded-full overflow-hidden border border-border/50">
                <img src={card.evaluation.avatar} alt="" className="w-full h-full object-cover" />
              </div>
              <span className="text-[9px] text-primary font-bold">{card.evaluation.score}</span>
            </div>
          </div>

          {/* Hover glow */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="absolute inset-0 bg-primary/10 animate-pulse" />
          </div>
        </motion.div>
      ))}

      {/* Mystery Card */}
      <motion.div
        className={`relative w-20 h-28 rounded-xl overflow-hidden cursor-pointer
          bg-gradient-to-br from-primary/30 to-accent/30
          border-2 border-dashed border-primary/60
          hover:border-primary transition-all duration-300
          ${mysteryState === 'question' ? 'animate-pulse' : ''}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        onClick={handleMysteryClick}
      >
        <AnimatePresence mode="wait">
          {mysteryState === 'question' ? (
            <motion.div
              key="question"
              className="absolute inset-0 flex flex-col items-center justify-center"
              initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotateY: -90 }}
              transition={{ duration: 0.3 }}
            >
              <HelpCircle className="w-8 h-8 text-primary mb-1" />
              <span className="text-[9px] text-muted-foreground">Click me</span>
            </motion.div>
          ) : (
            <motion.div
              key="revealed"
              className="absolute inset-0 p-2 flex flex-col justify-center"
              initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotateY: -90 }}
              transition={{ duration: 0.3 }}
            >
              <p className={`text-[9px] font-medium ${currentPain.color} mb-1`}>
                {t(`painPoints.${currentPain.key}.label`)}
              </p>
              <p className="text-[8px] text-muted-foreground leading-tight line-clamp-4">
                {t(`painPoints.${currentPain.key}.pain`)}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Glow effect for mystery card */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-50" />
        </div>
      </motion.div>
    </div>
  );
};
