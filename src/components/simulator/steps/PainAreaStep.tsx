import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/hooks/useTranslation';

interface PainAreaStepProps {
  onSelect: (area: string) => void;
  onBack: () => void;
}

export function PainAreaStep({ onSelect, onBack }: PainAreaStepProps) {
  const [customPain, setCustomPain] = useState('');
  const { t } = useTranslation();

  const painAreas = [
    { id: 'money', label: t('simulator.interview.money') },
    { id: 'time', label: t('simulator.interview.time') },
    { id: 'services', label: t('simulator.interview.services') },
    { id: 'health', label: t('simulator.interview.health') },
    { id: 'education', label: t('simulator.interview.education') },
    { id: 'home', label: t('simulator.interview.home') },
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
        {t('simulator.interview.whatAnnoys')}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-muted-foreground mb-6 text-center"
      >
        {t('simulator.interview.chooseArea')}
      </motion.p>

      <div className="grid grid-cols-2 gap-3 w-full mb-4">
        {painAreas.map((area, index) => (
          <motion.button
            key={area.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            onClick={() => onSelect(area.id)}
            className="p-4 rounded-xl bg-background/50 border border-border/50 hover:border-primary/50 hover:bg-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98] text-center"
          >
            <span className="text-lg">{area.label}</span>
          </motion.button>
        ))}
      </div>

      <div className="w-full mb-6">
        <Input
          value={customPain}
          onChange={(e) => setCustomPain(e.target.value)}
          placeholder={t('simulator.interview.otherPain')}
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
            {t('simulator.interview.continueWith')} "{customPain}"
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
