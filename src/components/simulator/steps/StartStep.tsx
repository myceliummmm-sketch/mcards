import { motion } from 'framer-motion';
import { Lightbulb, Sparkles } from 'lucide-react';
import { Branch } from '@/hooks/useInterviewWizard';

interface StartStepProps {
  onSelect: (branch: Branch) => void;
}

export function StartStep({ onSelect }: StartStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center text-center px-4"
    >
      <motion.h1
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary via-amber-400 to-primary bg-clip-text text-transparent mb-2"
      >
        REVENUE ENGINE
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-lg text-primary/80 font-medium tracking-wider mb-2"
      >
        ⚡ GOD MODE ON
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground mb-8"
      >
        Generate your $1M Strategy & claim 500 Spores
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-sm space-y-3"
      >
        <p className="text-lg font-medium text-foreground mb-4">С чего начнём?</p>
        
        <button
          onClick={() => onSelect('idea')}
          className="w-full p-4 rounded-xl bg-gradient-to-r from-primary/20 to-amber-500/20 border border-primary/30 hover:border-primary/60 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-primary" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-foreground">💡 У меня есть идея</p>
            <p className="text-sm text-muted-foreground">Знаю что хочу сделать</p>
          </div>
        </button>

        <button
          onClick={() => onSelect('discovery')}
          className="w-full p-4 rounded-xl bg-gradient-to-r from-violet-500/20 to-primary/20 border border-violet-500/30 hover:border-violet-500/60 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-violet-400" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-foreground">🔮 Помоги найти идею</p>
            <p className="text-sm text-muted-foreground">Хочу, но не знаю что</p>
          </div>
        </button>
      </motion.div>
    </motion.div>
  );
}
