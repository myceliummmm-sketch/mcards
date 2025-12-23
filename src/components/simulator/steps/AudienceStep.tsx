import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AudienceStepProps {
  onNext: (audience: string[]) => void;
  onBack: () => void;
  initialValue?: string[];
}

const audiences = [
  { id: 'students', label: '🎓 Студенты' },
  { id: 'freelancers', label: '💼 Фрилансеры' },
  { id: 'small_business', label: '🏪 Малый бизнес' },
  { id: 'parents', label: '👨‍👩‍👧 Родители' },
  { id: 'creators', label: '🎨 Креаторы' },
  { id: 'developers', label: '👨‍💻 Разработчики' },
];

export function AudienceStep({ onNext, onBack, initialValue = [] }: AudienceStepProps) {
  const [selected, setSelected] = useState<string[]>(initialValue);
  const [customAudience, setCustomAudience] = useState('');

  const toggleAudience = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    const result = [...selected];
    if (customAudience.trim()) {
      result.push(customAudience.trim());
    }
    if (result.length > 0) {
      onNext(result);
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
        Кто будет пользоваться?
      </motion.h2>

      <div className="grid grid-cols-2 gap-3 w-full mb-4">
        {audiences.map((audience, index) => (
          <motion.button
            key={audience.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + index * 0.03 }}
            onClick={() => toggleAudience(audience.id)}
            className={`p-3 rounded-xl border transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-between ${
              selected.includes(audience.id)
                ? 'bg-primary/20 border-primary text-foreground'
                : 'bg-background/50 border-border/50 hover:border-primary/50'
            }`}
          >
            <span>{audience.label}</span>
            {selected.includes(audience.id) && (
              <Check className="w-4 h-4 text-primary" />
            )}
          </motion.button>
        ))}
      </div>

      <div className="w-full mb-6">
        <Input
          value={customAudience}
          onChange={(e) => setCustomAudience(e.target.value)}
          placeholder="✏️ Другое: ..."
          className="bg-background/50 border-border/50 focus:border-primary"
        />
      </div>

      <div className="flex gap-3 w-full">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={selected.length === 0 && !customAudience.trim()}
          className="flex-1 bg-primary hover:bg-primary/90"
        >
          Дальше
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}
