import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/hooks/useTranslation';

interface PainStoryStepProps {
  onNext: (details: string[]) => void;
  onSkip: () => void;
  onBack: () => void;
  initialValue?: string[];
}

export function PainStoryStep({ onNext, onSkip, onBack, initialValue = [] }: PainStoryStepProps) {
  const [selected, setSelected] = useState<string[]>(initialValue);
  const [customPain, setCustomPain] = useState('');
  const { t } = useTranslation();

  const painDetails = [
    { id: 'time_waste', label: t('simulator.interview.timeWaste') },
    { id: 'money_loss', label: t('simulator.interview.moneyLoss') },
    { id: 'daily_frustration', label: t('simulator.interview.dailyFrustration') },
    { id: 'no_solution', label: t('simulator.interview.noSolution') },
    { id: 'diy_fail', label: t('simulator.interview.diyFail') },
  ];

  const toggleDetail = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    const result = [...selected];
    if (customPain.trim()) {
      result.push(customPain.trim());
    }
    onNext(result);
  };

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
        {t('simulator.interview.tellYourPain')}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-muted-foreground mb-6 text-center"
      >
        {t('simulator.interview.givesContext')}
      </motion.p>

      <div className="space-y-3 w-full mb-4">
        {painDetails.map((detail, index) => (
          <motion.button
            key={detail.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + index * 0.03 }}
            onClick={() => toggleDetail(detail.id)}
            className={`w-full p-4 rounded-xl border transition-all hover:scale-[1.02] active:scale-[0.98] text-left flex items-center justify-between ${
              selected.includes(detail.id)
                ? 'bg-primary/20 border-primary text-foreground'
                : 'bg-background/50 border-border/50 hover:border-primary/50'
            }`}
          >
            <span>{detail.label}</span>
            {selected.includes(detail.id) && (
              <Check className="w-5 h-5 text-primary flex-shrink-0" />
            )}
          </motion.button>
        ))}
      </div>

      <div className="w-full mb-6">
        <Input
          value={customPain}
          onChange={(e) => setCustomPain(e.target.value)}
          placeholder={t('simulator.interview.ownStory')}
          className="bg-background/50 border-border/50 focus:border-primary"
        />
      </div>

      <div className="flex gap-3 w-full">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('simulator.interview.back')}
        </Button>
        <Button variant="ghost" onClick={onSkip}>
          {t('simulator.interview.skip')}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={selected.length === 0 && !customPain.trim()}
          className="flex-1 bg-primary hover:bg-primary/90"
        >
          {t('simulator.interview.next')}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}
