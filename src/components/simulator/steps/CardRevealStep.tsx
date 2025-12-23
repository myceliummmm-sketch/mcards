import { motion } from 'framer-motion';
import { ArrowRight, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InterviewData, generateVisionStatement, CardRarity } from '@/hooks/useInterviewWizard';

interface CardRevealStepProps {
  data: InterviewData;
  onContinue: () => void;
  onEdit: () => void;
}

const rarityConfig: Record<CardRarity, { label: string; color: string; bg: string; border: string }> = {
  common: { label: 'COMMON', color: 'text-gray-400', bg: 'from-gray-500/20 to-gray-600/20', border: 'border-gray-500/30' },
  rare: { label: 'RARE', color: 'text-blue-400', bg: 'from-blue-500/20 to-blue-600/20', border: 'border-blue-500/30' },
  epic: { label: 'EPIC', color: 'text-purple-400', bg: 'from-purple-500/20 to-purple-600/20', border: 'border-purple-500/30' },
  legendary: { label: 'LEGENDARY', color: 'text-amber-400', bg: 'from-amber-500/20 to-amber-600/20', border: 'border-amber-500/30' },
};

const experienceLabels: Record<string, string> = {
  worked_in_field: 'Опыт в сфере',
  studied_deeply: 'Глубокие знания',
  has_network: 'Нетворк',
  starting_fresh: 'Свежий старт',
};

const motivationLabels: Record<string, string> = {
  personal_pain: 'Личный триггер',
  saw_pain: 'Наблюдатель',
  market_opportunity: 'Рыночный взгляд',
  cool_idea: 'Визионер',
};

export function CardRevealStep({ data, onContinue, onEdit }: CardRevealStepProps) {
  const rarity = rarityConfig[data.cardRarity];
  const visionStatement = generateVisionStatement(data);

  const getExperienceChecks = () => {
    const checks = [
      { key: 'personal_pain', label: motivationLabels[data.motivation || ''] || 'Мотивация', checked: !!data.motivation },
      { key: 'worked_in_field', label: experienceLabels.worked_in_field, checked: data.experience.includes('worked_in_field') },
      { key: 'has_network', label: experienceLabels.has_network, checked: data.experience.includes('has_network') },
    ];
    return checks;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center px-4 w-full max-w-md mx-auto"
    >
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl font-bold text-foreground mb-6 text-center"
      >
        🎉 Карточка готова!
      </motion.h2>

      {/* Vision Statement Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className={`w-full rounded-2xl border-2 ${rarity.border} bg-gradient-to-br ${rarity.bg} p-6 mb-6 backdrop-blur-sm`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">★ VISION STATEMENT</span>
          <span className={`text-sm font-bold ${rarity.color}`}>[{rarity.label}]</span>
        </div>

        <div className="h-px bg-border/50 mb-4" />

        {/* Vision Statement */}
        <p className="text-lg font-medium text-foreground leading-relaxed mb-6">
          "{visionStatement}"
        </p>

        <div className="h-px bg-border/50 mb-4" />

        {/* Founder Fit Score */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">🔥 Founder Fit</span>
            <span className={`text-lg font-bold ${rarity.color}`}>{data.founderFitScore}%</span>
          </div>
          <div className="h-3 bg-background/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${data.founderFitScore}%` }}
              transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
              className={`h-full bg-gradient-to-r ${
                data.cardRarity === 'legendary'
                  ? 'from-amber-500 to-yellow-400'
                  : data.cardRarity === 'epic'
                  ? 'from-purple-500 to-violet-400'
                  : data.cardRarity === 'rare'
                  ? 'from-blue-500 to-cyan-400'
                  : 'from-gray-500 to-gray-400'
              }`}
            />
          </div>
        </div>

        {/* Experience Checklist */}
        <div className="space-y-2">
          {getExperienceChecks().map((check) => (
            <div key={check.key} className="flex items-center gap-2 text-sm">
              <span className={check.checked ? 'text-primary' : 'text-muted-foreground'}>
                {check.checked ? '✓' : '○'}
              </span>
              <span className={check.checked ? 'text-foreground' : 'text-muted-foreground'}>
                {check.label}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex gap-3 w-full">
        <Button variant="outline" onClick={onEdit} className="flex-1">
          <Edit2 className="w-4 h-4 mr-2" />
          Изменить
        </Button>
        <Button
          onClick={onContinue}
          className="flex-1 bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90"
        >
          Круто!
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}
