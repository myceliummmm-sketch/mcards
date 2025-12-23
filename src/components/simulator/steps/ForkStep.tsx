import { motion } from 'framer-motion';
import { Zap, Wrench, Clock, Sparkles } from 'lucide-react';
import { SelectedPath } from '@/hooks/useInterviewWizard';

interface ForkStepProps {
  onSelect: (path: SelectedPath) => void;
}

export function ForkStep({ onSelect }: ForkStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center px-4 w-full max-w-md mx-auto"
    >
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl font-bold text-foreground mb-2 text-center"
      >
        🎉 Как хочешь продолжить?
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-muted-foreground mb-8 text-center"
      >
        Выбери свой путь
      </motion.p>

      <div className="space-y-4 w-full">
        {/* Fast Path */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => onSelect('fast')}
          className="w-full p-5 rounded-2xl bg-gradient-to-r from-primary/20 to-amber-500/20 border border-primary/30 hover:border-primary/60 transition-all hover:scale-[1.02] active:scale-[0.98] text-left"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground">⚡ БЫСТРЫЙ ПУТЬ</h3>
          </div>
          
          <p className="text-muted-foreground mb-4">
            AI-команда сделает за тебя:
          </p>
          
          <ul className="space-y-1 text-sm text-foreground mb-4">
            <li>• Исследование рынка</li>
            <li>• Лендинг</li>
            <li>• Первые гипотезы</li>
          </ul>

          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" /> 5 минут
            </span>
            <span className="flex items-center gap-1 text-primary">
              <Sparkles className="w-4 h-4" /> 100 спор
            </span>
          </div>
        </motion.button>

        {/* DIY Path */}
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => onSelect('diy')}
          className="w-full p-5 rounded-2xl bg-gradient-to-r from-violet-500/20 to-blue-500/20 border border-violet-500/30 hover:border-violet-500/60 transition-all hover:scale-[1.02] active:scale-[0.98] text-left"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <Wrench className="w-6 h-6 text-violet-400" />
            </div>
            <h3 className="text-xl font-bold text-foreground">🛠 СВОИМИ РУКАМИ</h3>
          </div>
          
          <p className="text-muted-foreground mb-4">
            Прокачай навыки фаундера:
          </p>
          
          <ul className="space-y-1 text-sm text-foreground mb-4">
            <li>• 20 карточек</li>
            <li>• Все фазы: Vision → Grow</li>
            <li>• AI-менторы помогают</li>
          </ul>

          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" /> 7 дней
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              🆓 Free start
            </span>
          </div>
        </motion.button>
      </div>
    </motion.div>
  );
}
