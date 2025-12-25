import { motion } from 'framer-motion';
import { ArrowLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Motivation } from '@/hooks/useInterviewWizard';
import { useTranslation } from '@/hooks/useTranslation';

interface MotivationStepProps {
  onSelect: (motivation: Motivation) => void;
  onBack: () => void;
}

export function MotivationStep({ onSelect, onBack }: MotivationStepProps) {
  const { t } = useTranslation();

  const motivations: { id: Motivation; label: string; description?: string }[] = [
    { id: 'personal_pain', label: t('simulator.interview.personalPain'), description: t('simulator.interview.personalPainBonus') },
    { id: 'saw_pain', label: t('simulator.interview.sawPain'), description: t('simulator.interview.sawPainBonus') },
    { id: 'market_opportunity', label: t('simulator.interview.marketOpportunity'), description: t('simulator.interview.marketBonus') },
    { id: 'cool_idea', label: t('simulator.interview.coolIdea'), description: t('simulator.interview.coolIdeaBonus') },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex flex-col items-center px-4 w-full max-w-md mx-auto"
    >
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-foreground mb-2 text-center"
      >
        {t('simulator.interview.whyThis')}
      </motion.h2>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2 text-sm text-muted-foreground mb-6 bg-primary/10 rounded-lg px-3 py-2"
      >
        <Info className="w-4 h-4 text-primary flex-shrink-0" />
        <span>{t('simulator.interview.affectsScore')}</span>
      </motion.div>

      <div className="space-y-3 w-full mb-6">
        {motivations.map((motivation, index) => (
          <motion.button
            key={motivation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            onClick={() => onSelect(motivation.id)}
            className="w-full p-4 rounded-xl bg-background/50 border border-border/50 hover:border-primary/50 hover:bg-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98] text-left flex items-center justify-between"
          >
            <span className="text-lg">
              {motivation.label}
            </span>
            {motivation.description && (
              <span className="text-xs text-primary/70">{motivation.description}</span>
            )}
          </motion.button>
        ))}
      </div>

      <Button variant="outline" onClick={onBack} className="w-full">
        <ArrowLeft className="w-4 h-4 mr-2" />
        {t('simulator.interview.back')}
      </Button>
    </motion.div>
  );
}
