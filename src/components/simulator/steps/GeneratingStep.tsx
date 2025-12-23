import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface GeneratingStepProps {
  onComplete: () => void;
}

const stages = [
  { text: 'Анализирую данные...', duration: 1200 },
  { text: 'Формирую видение...', duration: 1500 },
  { text: 'Оцениваю Founder Fit...', duration: 1000 },
  { text: 'Генерирую карточку...', duration: 800 },
];

export function GeneratingStep({ onComplete }: GeneratingStepProps) {
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (stageIndex < stages.length) {
      timeout = setTimeout(() => {
        setStageIndex((prev) => prev + 1);
        setProgress((prev) => prev + 100 / stages.length);
      }, stages[stageIndex].duration);
    } else {
      timeout = setTimeout(onComplete, 500);
    }

    return () => clearTimeout(timeout);
  }, [stageIndex, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center px-4 py-12"
    >
      <motion.div
        animate={{ 
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{ 
          rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
          scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
        }}
        className="w-24 h-24 rounded-full bg-gradient-to-r from-primary via-amber-400 to-primary flex items-center justify-center mb-8 shadow-2xl shadow-primary/30"
      >
        <Sparkles className="w-12 h-12 text-white" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl font-bold text-foreground mb-4"
      >
        ✨ Магия...
      </motion.h2>

      <div className="w-full max-w-xs mb-4">
        <div className="h-2 bg-background/50 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-amber-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={stageIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-muted-foreground text-center"
        >
          {stages[stageIndex]?.text || 'Готово!'}
        </motion.p>
      </AnimatePresence>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-sm text-primary/60 mt-4"
      >
        Ever Green создаёт твой Vision Statement
      </motion.p>
    </motion.div>
  );
}
