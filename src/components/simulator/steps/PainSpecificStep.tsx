import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/hooks/useTranslation';

interface PainSpecificStepProps {
  painArea: string;
  onSelect: (pain: string) => void;
  onBack: () => void;
}

export function PainSpecificStep({ painArea, onSelect, onBack }: PainSpecificStepProps) {
  const [customPain, setCustomPain] = useState('');
  const { t } = useTranslation();

  const painOptions: Record<string, { id: string; labelKey: string }[]> = {
    money: [
      { id: 'budgeting', labelKey: 'budgeting' },
      { id: 'investing', labelKey: 'investing' },
      { id: 'debts', labelKey: 'debts' },
      { id: 'income', labelKey: 'income' },
    ],
    time: [
      { id: 'planning', labelKey: 'planning' },
      { id: 'commute', labelKey: 'commute' },
      { id: 'routine', labelKey: 'routine' },
      { id: 'search', labelKey: 'searchInfo' },
    ],
    services: [
      { id: 'delivery', labelKey: 'delivery' },
      { id: 'support', labelKey: 'support' },
      { id: 'repair', labelKey: 'repair' },
      { id: 'booking', labelKey: 'booking' },
    ],
    health: [
      { id: 'fitness', labelKey: 'fitness' },
      { id: 'nutrition', labelKey: 'nutrition' },
      { id: 'sleep', labelKey: 'sleep' },
      { id: 'doctors', labelKey: 'doctors' },
    ],
    education: [
      { id: 'courses', labelKey: 'courses' },
      { id: 'languages', labelKey: 'languages' },
      { id: 'skills', labelKey: 'skills' },
      { id: 'habits', labelKey: 'habits' },
    ],
    home: [
      { id: 'cleaning', labelKey: 'cleaning' },
      { id: 'renovation', labelKey: 'renovation' },
      { id: 'shopping', labelKey: 'shopping' },
      { id: 'organization', labelKey: 'organization' },
    ],
  };

  const areaLabels: Record<string, string> = {
    money: t('simulator.interview.money').replace('💸 ', ''),
    time: t('simulator.interview.time').replace('⏰ ', ''),
    services: t('simulator.interview.services').replace('📱 ', ''),
    health: t('simulator.interview.health').replace('🏥 ', ''),
    education: t('simulator.interview.education').replace('📚 ', ''),
    home: t('simulator.interview.home').replace('🏠 ', ''),
  };

  const options = painOptions[painArea] || [];
  const areaLabel = areaLabels[painArea] || painArea;

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
        className="text-2xl font-bold text-foreground mb-6 text-center"
      >
        {t('simulator.interview.inAreaWhatMost').replace('{area}', areaLabel)}
      </motion.h2>

      <div className="grid grid-cols-1 gap-3 w-full mb-4">
        {options.map((option, index) => (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + index * 0.03 }}
            onClick={() => onSelect(option.id)}
            className="p-4 rounded-xl bg-background/50 border border-border/50 hover:border-primary/50 hover:bg-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98] text-left"
          >
            <span>{t(`simulator.interview.${option.labelKey}`)}</span>
          </motion.button>
        ))}
      </div>

      <div className="w-full mb-6">
        <Input
          value={customPain}
          onChange={(e) => setCustomPain(e.target.value)}
          placeholder={t('simulator.interview.ownPain')}
          className="bg-background/50 border-border/50 focus:border-primary"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && customPain.trim()) {
              onSelect(customPain.trim());
            }
          }}
        />
        {customPain.trim() && (
          <Button
            onClick={() => onSelect(customPain.trim())}
            className="w-full mt-2 bg-primary hover:bg-primary/90"
          >
            {t('simulator.interview.continue')}
          </Button>
        )}
      </div>

      <Button variant="outline" onClick={onBack} className="w-full">
        <ArrowLeft className="w-4 h-4 mr-2" />
        {t('simulator.interview.back')}
      </Button>
    </motion.div>
  );
}
