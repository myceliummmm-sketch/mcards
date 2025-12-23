import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PainSpecificStepProps {
  painArea: string;
  onSelect: (pain: string) => void;
  onBack: () => void;
}

const painOptions: Record<string, { id: string; label: string }[]> = {
  money: [
    { id: 'budgeting', label: '💳 Бюджетирование и учёт расходов' },
    { id: 'investing', label: '📈 Инвестиции и накопления' },
    { id: 'debts', label: '💸 Долги и кредиты' },
    { id: 'income', label: '💰 Поиск подработки/заработка' },
  ],
  time: [
    { id: 'planning', label: '📅 Планирование и календарь' },
    { id: 'commute', label: '🚗 Дорога и пробки' },
    { id: 'routine', label: '📧 Рутина и переписки' },
    { id: 'search', label: '🔍 Поиск информации' },
  ],
  services: [
    { id: 'delivery', label: '🚚 Доставка (еда, товары)' },
    { id: 'support', label: '📞 Поддержка и сервис' },
    { id: 'repair', label: '🔧 Ремонт и мастера' },
    { id: 'booking', label: '📋 Бронирование и очереди' },
  ],
  health: [
    { id: 'fitness', label: '🏋️ Фитнес и спорт' },
    { id: 'nutrition', label: '🥗 Питание и диеты' },
    { id: 'sleep', label: '😴 Сон и восстановление' },
    { id: 'doctors', label: '👨‍⚕️ Врачи и запись на приём' },
  ],
  education: [
    { id: 'courses', label: '🎓 Курсы и программы' },
    { id: 'languages', label: '🌍 Иностранные языки' },
    { id: 'skills', label: '💼 Профессиональные навыки' },
    { id: 'habits', label: '📱 Мотивация и привычки' },
  ],
  home: [
    { id: 'cleaning', label: '🧹 Уборка и клининг' },
    { id: 'renovation', label: '🔨 Ремонт и обустройство' },
    { id: 'shopping', label: '🛒 Покупки и списки' },
    { id: 'organization', label: '📦 Организация пространства' },
  ],
};

const areaLabels: Record<string, string> = {
  money: 'Деньги',
  time: 'Время',
  services: 'Сервисы',
  health: 'Здоровье',
  education: 'Обучение',
  home: 'Быт',
};

export function PainSpecificStep({ painArea, onSelect, onBack }: PainSpecificStepProps) {
  const [customPain, setCustomPain] = useState('');
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
        В «{areaLabel}» что больше всего?
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
            <span>{option.label}</span>
          </motion.button>
        ))}
      </div>

      <div className="w-full mb-6">
        <Input
          value={customPain}
          onChange={(e) => setCustomPain(e.target.value)}
          placeholder="✏️ Своё: ..."
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
            Продолжить
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
