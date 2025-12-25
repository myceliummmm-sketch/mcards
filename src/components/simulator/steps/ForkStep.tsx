import { motion } from 'framer-motion';
import { Zap, Wrench, Clock, Sparkles } from 'lucide-react';
import { SelectedPath } from '@/hooks/useInterviewWizard';
import { useTranslation } from '@/hooks/useTranslation';

interface ForkStepProps {
  onSelect: (path: SelectedPath) => void;
}

export function ForkStep({ onSelect }: ForkStepProps) {
  const { t } = useTranslation();

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
        {t('simulator.interview.howToContinue')}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-muted-foreground mb-8 text-center"
      >
        {t('simulator.interview.choosePath')}
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
            <h3 className="text-xl font-bold text-foreground">{t('simulator.interview.fastPath')}</h3>
          </div>
          
          <p className="text-muted-foreground mb-4">
            {t('simulator.interview.aiTeamWillDo')}
          </p>
          
          <ul className="space-y-1 text-sm text-foreground mb-4">
            <li>• {t('simulator.interview.marketResearch')}</li>
            <li>• {t('simulator.interview.landing')}</li>
            <li>• {t('simulator.interview.firstHypotheses')}</li>
          </ul>

          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" /> 5 {t('simulator.interview.minutes')}
            </span>
            <span className="flex items-center gap-1 text-primary">
              <Sparkles className="w-4 h-4" /> 100 {t('simulator.interview.spores')}
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
            <h3 className="text-xl font-bold text-foreground">{t('simulator.interview.diyPath')}</h3>
          </div>
          
          <p className="text-muted-foreground mb-4">
            {t('simulator.interview.levelUpSkills')}
          </p>
          
          <ul className="space-y-1 text-sm text-foreground mb-4">
            <li>• 20 {t('simulator.interview.cards')}</li>
            <li>• {t('simulator.interview.allPhases')}</li>
            <li>• {t('simulator.interview.aiMentorsHelp')}</li>
          </ul>

          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" /> 7 {t('simulator.interview.days')}
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              {t('simulator.interview.freeStart')}
            </span>
          </div>
        </motion.button>
      </div>
    </motion.div>
  );
}
