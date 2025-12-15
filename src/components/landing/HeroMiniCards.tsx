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
    <div className="flex gap-4 mt-8">
      {/* 4 Demo Cards */}
      {displayCards.map((card, index) => (
        <motion.div
          key={card.id}
          className={`relative w-28 h-40 rounded-xl overflow-hidden cursor-pointer group
            bg-gradient-to-br ${PHASE_COLORS[card.phase]} 
            border ${PHASE_BORDER_COLORS[card.phase]}
            hover:scale-110 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/30
            transition-all duration-300 ease-out`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ 
            boxShadow: "0 20px 40px -10px hsl(var(--primary) / 0.4)"
          }}
        >
          {/* Card Image */}
          {card.imageUrl && (
            <div className="absolute inset-0">
              <img 
                src={card.imageUrl} 
                alt={card.title}
                className="w-full h-full object-cover opacity-60 group-hover:opacity-90 transition-opacity duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
            </div>
          )}
          
          {/* Card Content */}
          <div className="absolute inset-0 p-3 flex flex-col justify-end">
            <p className="text-xs font-semibold text-foreground">
              {card.title}
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-primary/50 group-hover:border-primary transition-colors">
                <img src={card.evaluation.avatar} alt="" className="w-full h-full object-cover" />
              </div>
              <span className="text-sm text-primary font-bold">{card.evaluation.score}</span>
            </div>
          </div>

          {/* Hover glow */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="absolute inset-0 bg-primary/10" />
          </div>
        </motion.div>
      ))}

      {/* Mystery Card */}
      <motion.div
        className={`relative w-28 h-40 rounded-xl overflow-hidden cursor-pointer
          bg-gradient-to-br from-primary/30 to-accent/30
          border-2 border-dashed border-primary/60
          hover:border-primary hover:scale-110 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/30
          transition-all duration-300 ease-out
          ${mysteryState === 'question' ? 'animate-pulse' : ''}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        onClick={handleMysteryClick}
        whileHover={{ 
          boxShadow: "0 20px 40px -10px hsl(var(--primary) / 0.4)"
        }}
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
              <HelpCircle className="w-10 h-10 text-primary mb-2" />
              <span className="text-xs text-muted-foreground">Click me</span>
            </motion.div>
          ) : (
            <motion.div
              key="revealed"
              className="absolute inset-0 p-3 flex flex-col justify-center"
              initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotateY: -90 }}
              transition={{ duration: 0.3 }}
            >
              <p className={`text-xs font-medium ${currentPain.color} mb-2`}>
                {t(`painPoints.${currentPain.key}.label`)}
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight line-clamp-5">
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
