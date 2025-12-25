import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AnalogyTemplate } from '@/hooks/useInterviewWizard';
import { useTranslation } from '@/hooks/useTranslation';

interface NicheStepProps {
  template: AnalogyTemplate;
  onNext: (niche: string) => void;
  onBack: () => void;
  initialValue?: string;
}

export function NicheStep({ template, onNext, onBack, initialValue = '' }: NicheStepProps) {
  const [niche, setNiche] = useState(initialValue);
  const { t } = useTranslation();

  const placeholders: Record<AnalogyTemplate, string> = {
    uber: t('simulator.interview.nichePlaceholderUber'),
    airbnb: t('simulator.interview.nichePlaceholderAirbnb'),
    duolingo: t('simulator.interview.nichePlaceholderDuolingo'),
    netflix: t('simulator.interview.nichePlaceholderNetflix'),
    notion: t('simulator.interview.nichePlaceholderNotion'),
    custom: t('simulator.interview.nichePlaceholderCustom'),
  };

  const labels: Record<AnalogyTemplate, string> = {
    uber: t('simulator.interview.uberForLabel'),
    airbnb: t('simulator.interview.airbnbForLabel'),
    duolingo: t('simulator.interview.duolingoForLabel'),
    netflix: t('simulator.interview.netflixForLabel'),
    notion: t('simulator.interview.notionForLabel'),
    custom: t('simulator.interview.customForLabel'),
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (niche.trim()) {
      onNext(niche.trim());
    }
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
        className="text-2xl font-bold text-foreground mb-6 text-center"
      >
        {labels[template]}
      </motion.h2>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <Input
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          placeholder={placeholders[template]}
          className="text-lg h-14 bg-background/50 border-primary/30 focus:border-primary"
          autoFocus
        />

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('simulator.interview.back')}
          </Button>
          <Button
            type="submit"
            disabled={!niche.trim()}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            {t('simulator.interview.next')}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
