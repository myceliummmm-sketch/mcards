import { motion } from 'framer-motion';
import { ArrowLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Motivation } from '@/hooks/useInterviewWizard';

interface MotivationStepProps {
  onSelect: (motivation: Motivation) => void;
  onBack: () => void;
}

const motivations: { id: Motivation; emoji: string; label: string; description?: string }[] = [
  { id: 'personal_pain', emoji: '😤', label: 'Сам страдал от проблемы', description: '+25% к Founder Fit' },
  { id: 'saw_pain', emoji: '👀', label: 'Видел боль у других', description: '+15% к Founder Fit' },
  { id: 'market_opportunity', emoji: '💰', label: 'Вижу рыночную возможность', description: '+10% к Founder Fit' },
  { id: 'cool_idea', emoji: '💡', label: 'Просто крутая идея', description: '+5% к Founder Fit' },
];

export function MotivationStep({ onSelect, onBack }: MotivationStepProps) {
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
        Почему именно это?
      </motion.h2>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2 text-sm text-muted-foreground mb-6 bg-primary/10 rounded-lg px-3 py-2"
      >
        <Info className="w-4 h-4 text-primary flex-shrink-0" />
        <span>Это влияет на твой Founder Fit Score</span>
      </motion.div>

      <div className="space-y-3 w-full mb-6">
        {motivations.map((motivation, index) => (
          <motion.button
            key={motivation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            onClick={() => onSelect(motivation.id)}
            className="w-full p-4 rounded-xl bg-background/50 border border-border/50 hover:border-primary/50 hover:bg-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98] text-left flex items-center justify-between"
          >
            <span className="text-lg">
              {motivation.emoji} {motivation.label}
            </span>
            {motivation.description && (
              <span className="text-xs text-primary/70">{motivation.description}</span>
            )}
          </motion.button>
        ))}
      </div>

      <Button variant="outline" onClick={onBack} className="w-full">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Назад
      </Button>
    </motion.div>
  );
}
