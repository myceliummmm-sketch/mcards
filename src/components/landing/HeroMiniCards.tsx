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
    <div className="flex gap-5 mt-8">
      {/* 4 Demo Cards - BIGGER */}
      {displayCards.map((card, index) => (
        <motion.div
          key={card.id}
          className={`relative w-36 h-48 rounded-xl overflow-hidden cursor-pointer group
            bg-gradient-to-br ${PHASE_COLORS[card.phase]} 
            border-2 ${PHASE_BORDER_COLORS[card.phase]}
            transition-all duration-300 ease-out`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ 
            scale: 1.15,
            y: -12,
            rotateX: 5,
            rotateY: -5,
            boxShadow: "0 25px 50px -10px hsl(var(--primary) / 0.5)"
          }}
        >
          {/* Card Image */}
          {card.imageUrl && (
            <div className="absolute inset-0">
              <img 
                src={card.imageUrl} 
                alt={card.title}
                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
            </div>
          )}
          
          {/* Card Content */}
          <div className="absolute inset-0 p-4 flex flex-col justify-end">
            <p className="text-sm font-bold text-foreground">
              {card.title}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary/50 group-hover:border-primary group-hover:scale-110 transition-all">
                <img src={card.evaluation.avatar} alt="" className="w-full h-full object-cover" />
              </div>
              <span className="text-base text-primary font-bold">{card.evaluation.score}</span>
            </div>
          </div>

          {/* Hover glow overlay */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="absolute inset-0 bg-primary/15" />
            <div className="absolute inset-0 border-2 border-primary rounded-xl" />
          </div>
        </motion.div>
      ))}

      {/* Mystery Card - BIGGER */}
      <motion.div
        className={`relative w-36 h-48 rounded-xl overflow-hidden cursor-pointer
          bg-gradient-to-br from-primary/30 to-accent/30
          border-2 border-dashed border-primary/60
          transition-all duration-300 ease-out
          ${mysteryState === 'question' ? 'animate-pulse' : ''}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        onClick={handleMysteryClick}
        whileHover={{ 
          scale: 1.15,
          y: -12,
          borderColor: "hsl(var(--primary))",
          boxShadow: "0 25px 50px -10px hsl(var(--primary) / 0.5)"
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
              <HelpCircle className="w-12 h-12 text-primary mb-3" />
              <span className="text-sm text-muted-foreground font-medium">Click me</span>
            </motion.div>
          ) : (
            <motion.div
              key="revealed"
              className="absolute inset-0 p-4 flex flex-col justify-center"
              initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotateY: -90 }}
              transition={{ duration: 0.3 }}
            >
              <p className={`text-sm font-semibold text-primary mb-2`}>
                {t(`painPoints.${currentPain.key}.label`)}
              </p>
              <p className="text-xs text-muted-foreground leading-tight line-clamp-5">
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
