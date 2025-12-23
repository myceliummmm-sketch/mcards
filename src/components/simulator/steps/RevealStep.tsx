import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RevealStepProps {
  onComplete: () => void;
}

export function RevealStep({ onComplete }: RevealStepProps) {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Trigger confetti
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6B35', '#4CAF50'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6B35', '#4CAF50'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();

    // Show button after animation
    const timeout = setTimeout(() => {
      setShowButton(true);
    }, 2500);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center px-4 py-12 min-h-[60vh]"
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', duration: 0.8, bounce: 0.5 }}
        className="w-32 h-32 rounded-full bg-gradient-to-r from-amber-400 via-primary to-amber-500 flex items-center justify-center mb-8 shadow-2xl shadow-amber-500/40"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <Sparkles className="w-16 h-16 text-white" />
        </motion.div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl md:text-4xl font-bold text-center mb-4"
      >
        <span className="bg-gradient-to-r from-amber-400 via-primary to-amber-500 bg-clip-text text-transparent">
          ✨ +500 GENESIS SPORES
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-xl text-foreground mb-8 text-center"
      >
        FOUND! 🎉
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-muted-foreground text-center mb-8"
      >
        Твоя стратегия готова к запуску
      </motion.p>

      {showButton && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={onComplete}
          className="px-8 py-4 bg-gradient-to-r from-primary to-amber-500 rounded-xl text-white font-bold text-lg hover:scale-105 transition-transform shadow-xl shadow-primary/30"
        >
          Посмотреть карточку →
        </motion.button>
      )}
    </motion.div>
  );
}
