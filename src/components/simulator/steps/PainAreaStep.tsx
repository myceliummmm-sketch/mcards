import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PainAreaStepProps {
  onSelect: (area: string) => void;
  onBack: () => void;
}

const painAreas = [
  { id: 'money', label: '💸 Деньги' },
  { id: 'time', label: '⏰ Время' },
  { id: 'services', label: '📱 Сервисы' },
  { id: 'health', label: '🏥 Здоровье' },
  { id: 'education', label: '📚 Обучение' },
  { id: 'home', label: '🏠 Быт' },
];

export function PainAreaStep({ onSelect, onBack }: PainAreaStepProps) {
  const [customPain, setCustomPain] = useState('');

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
        Что бесит тебя в жизни?
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-muted-foreground mb-6 text-center"
      >
        Выбери область
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
          placeholder="✏️ Другое: ..."
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
            Продолжить с "{customPain}"
          </Button>
        )}
      </div>

      <Button variant="outline" onClick={onBack} className="w-full">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Назад
      </Button>
    </motion.div>
  );
}
