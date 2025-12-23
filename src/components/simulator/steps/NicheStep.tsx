import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AnalogyTemplate } from '@/hooks/useInterviewWizard';

interface NicheStepProps {
  template: AnalogyTemplate;
  onNext: (niche: string) => void;
  onBack: () => void;
  initialValue?: string;
}

const placeholders: Record<AnalogyTemplate, string> = {
  uber: 'доставки еды, перевозки вещей, выгула собак...',
  airbnb: 'аренды офисов, парковок, складов...',
  duolingo: 'программирования, финансов, кулинарии...',
  netflix: 'подкастов, курсов, аудиокниг...',
  notion: 'рецептов, тренировок, путешествий...',
  custom: 'опиши свою нишу...',
};

const labels: Record<AnalogyTemplate, string> = {
  uber: 'Uber для...',
  airbnb: 'Airbnb для...',
  duolingo: 'Duolingo для...',
  netflix: 'Netflix для...',
  notion: 'Notion для...',
  custom: 'Твоя идея для...',
};

export function NicheStep({ template, onNext, onBack, initialValue = '' }: NicheStepProps) {
  const [niche, setNiche] = useState(initialValue);

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
            Назад
          </Button>
          <Button
            type="submit"
            disabled={!niche.trim()}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            Дальше
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
