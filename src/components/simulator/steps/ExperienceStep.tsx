import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExperienceStepProps {
  onNext: (experience: string[]) => void;
  onBack: () => void;
  initialValue?: string[];
}

const experienceOptions = [
  { id: 'worked_in_field', label: '🏆 Работал в этой сфере', bonus: '+20%' },
  { id: 'studied_deeply', label: '📚 Глубоко изучал тему', bonus: '+10%' },
  { id: 'has_network', label: '👥 Есть связи/нетворк в индустрии', bonus: '+15%' },
  { id: 'starting_fresh', label: '🌱 Начинаю с нуля', bonus: '+0%', exclusive: true },
];

export function ExperienceStep({ onNext, onBack, initialValue = [] }: ExperienceStepProps) {
  const [selected, setSelected] = useState<string[]>(initialValue);

  const toggleExperience = (id: string) => {
    const option = experienceOptions.find((o) => o.id === id);
    
    if (option?.exclusive) {
      // If selecting "starting fresh", clear all others
      setSelected(['starting_fresh']);
    } else {
      // Remove "starting fresh" if selecting anything else
      setSelected((prev) => {
        const filtered = prev.filter((e) => e !== 'starting_fresh');
        return filtered.includes(id)
          ? filtered.filter((e) => e !== id)
          : [...filtered, id];
      });
    }
  };

  const handleSubmit = () => {
    if (selected.length > 0) {
      onNext(selected);
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
        className="text-2xl font-bold text-foreground mb-2 text-center"
      >
        Что у тебя уже есть?
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-muted-foreground mb-6 text-center"
      >
        Можно выбрать несколько
      </motion.p>

      <div className="space-y-3 w-full mb-6">
        {experienceOptions.map((option, index) => (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + index * 0.03 }}
            onClick={() => toggleExperience(option.id)}
            className={`w-full p-4 rounded-xl border transition-all hover:scale-[1.02] active:scale-[0.98] text-left flex items-center justify-between ${
              selected.includes(option.id)
                ? 'bg-primary/20 border-primary text-foreground'
                : 'bg-background/50 border-border/50 hover:border-primary/50'
            }`}
          >
            <span>{option.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-primary/70">{option.bonus}</span>
              {selected.includes(option.id) && (
                <Check className="w-5 h-5 text-primary" />
              )}
            </div>
          </motion.button>
        ))}
      </div>

      <div className="flex gap-3 w-full">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={selected.length === 0}
          className="flex-1 bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Создать карточку
        </Button>
      </div>
    </motion.div>
  );
}
