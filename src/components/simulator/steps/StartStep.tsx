import { motion } from 'framer-motion';
import { Lightbulb, Sparkles } from 'lucide-react';
import { Branch } from '@/hooks/useInterviewWizard';
import { Button } from '@/components/ui/button';

interface StartStepProps {
  onSelect: (branch: Branch) => void;
}

export function StartStep({ onSelect }: StartStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center text-center px-4 max-w-md"
    >
      {/* Status Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-8 px-4 py-2 rounded-full bg-[#00FF00]/10 border border-[#00FF00]/30 inline-block"
      >
        <span className="text-[#00FF00] font-mono text-sm">
          💰 POTENTIAL REVENUE: LOADING...
        </span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="text-4xl font-bold font-mono tracking-tight mb-2"
      >
        <span className="text-[#00FF00]">REVENUE</span> ENGINE
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-lg text-orange-400 font-bold tracking-wider mb-2"
      >
        ⚡ GOD MODE ON
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-white/60 mb-8"
      >
        Generate your $1M Strategy & claim 500 Spores
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full space-y-3"
      >
        <p className="text-lg font-medium text-white mb-4 font-mono">С чего начнём?</p>
        
        <button
          onClick={() => onSelect('idea')}
          className="w-full p-4 rounded-xl bg-gradient-to-r from-[#00FF00]/20 to-amber-500/20 border border-[#00FF00]/30 hover:border-[#00FF00]/60 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-full bg-[#00FF00]/20 flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-[#00FF00]" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-white font-mono">💡 У меня есть идея</p>
            <p className="text-sm text-white/60">Знаю что хочу сделать</p>
          </div>
        </button>

        <button
          onClick={() => onSelect('discovery')}
          className="w-full p-4 rounded-xl bg-gradient-to-r from-violet-500/20 to-[#00FF00]/20 border border-violet-500/30 hover:border-violet-500/60 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-violet-400" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-white font-mono">🔮 Помоги найти идею</p>
            <p className="text-sm text-white/60">Хочу, но не знаю что</p>
          </div>
        </button>
      </motion.div>
    </motion.div>
  );
}
