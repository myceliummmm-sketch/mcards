import { motion } from 'framer-motion';
import { ArrowLeft, Car, Home, Bird, Tv, FileText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnalogyTemplate } from '@/hooks/useInterviewWizard';
import { useTranslation } from '@/hooks/useTranslation';

interface AnalogyStepProps {
  onSelect: (template: AnalogyTemplate) => void;
  onBack: () => void;
}

export function AnalogyStep({ onSelect, onBack }: AnalogyStepProps) {
  const { t } = useTranslation();

  const analogies: { id: AnalogyTemplate; icon: React.ReactNode; label: string }[] = [
    { id: 'uber', icon: <Car className="w-6 h-6" />, label: t('simulator.interview.uberFor') },
    { id: 'airbnb', icon: <Home className="w-6 h-6" />, label: t('simulator.interview.airbnbFor') },
    { id: 'duolingo', icon: <Bird className="w-6 h-6" />, label: t('simulator.interview.duolingoFor') },
    { id: 'netflix', icon: <Tv className="w-6 h-6" />, label: t('simulator.interview.netflixFor') },
    { id: 'notion', icon: <FileText className="w-6 h-6" />, label: t('simulator.interview.notionFor') },
    { id: 'custom', icon: <Sparkles className="w-6 h-6" />, label: t('simulator.interview.custom') },
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
        {t('simulator.interview.itsLike')}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-muted-foreground mb-6 text-center"
      >
        {t('simulator.interview.chooseAnalogy')}
      </motion.p>

      <div className="grid grid-cols-2 gap-3 w-full mb-6">
        {analogies.map((analogy, index) => (
          <motion.button
            key={analogy.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            onClick={() => onSelect(analogy.id)}
            className="p-4 rounded-xl bg-background/50 border border-border/50 hover:border-primary/50 hover:bg-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98] text-center"
          >
            <span className="text-lg">{analogy.label}</span>
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
