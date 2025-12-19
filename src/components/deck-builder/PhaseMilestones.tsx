import { motion } from 'framer-motion';
import { Check, Lock, Gift, Rocket, FileText, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

interface PhaseMilestone {
  phase: string;
  reward: string;
  icon: React.ReactNode;
  color: string;
  cardsRequired: number;
}

interface PhaseMilestonesProps {
  completedPhases: string[];
  currentPhase: string;
  className?: string;
}

const MILESTONES: PhaseMilestone[] = [
  {
    phase: 'idea',
    reward: 'websitePrompt',
    icon: <FileText className="w-4 h-4" />,
    color: 'from-amber-500 to-orange-600',
    cardsRequired: 5
  },
  {
    phase: 'research',
    reward: 'researchReport',
    icon: <Rocket className="w-4 h-4" />,
    color: 'from-cyan-500 to-blue-600',
    cardsRequired: 10
  },
  {
    phase: 'build',
    reward: 'fullPrompt',
    icon: <Gift className="w-4 h-4" />,
    color: 'from-emerald-500 to-green-600',
    cardsRequired: 15
  },
  {
    phase: 'grow',
    reward: 'dollarStrategy',
    icon: <DollarSign className="w-4 h-4" />,
    color: 'from-pink-500 to-purple-600',
    cardsRequired: 20
  }
];

export const PhaseMilestones = ({ completedPhases, currentPhase, className }: PhaseMilestonesProps) => {
  const { t } = useTranslation();

  const isPhaseComplete = (phase: string) => completedPhases.includes(phase);
  const isCurrentPhase = (phase: string) => currentPhase === phase;
  
  const getCurrentMilestoneIndex = () => {
    const idx = MILESTONES.findIndex(m => m.phase === currentPhase);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className={cn('p-4 rounded-xl bg-muted/30 border border-border', className)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          🥕 {t('deckBuilder.yourRewards') || 'Your Rewards'}
        </h3>
        <span className="text-xs text-muted-foreground">
          {completedPhases.length}/{MILESTONES.length} {t('milestones.unlocked') || 'unlocked'}
        </span>
      </div>
      
      <div className="flex items-center gap-1">
        {MILESTONES.map((milestone, index) => {
          const complete = isPhaseComplete(milestone.phase);
          const current = isCurrentPhase(milestone.phase);
          const locked = index > getCurrentMilestoneIndex();
          
          return (
            <motion.div
              key={milestone.phase}
              className="flex-1 relative"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Connector line */}
              {index > 0 && (
                <div 
                  className={cn(
                    'absolute top-1/2 -left-1 w-2 h-0.5 -translate-y-1/2',
                    complete || current ? 'bg-primary' : 'bg-muted'
                  )} 
                />
              )}
              
              {/* Milestone card */}
              <div
                className={cn(
                  'relative p-2 rounded-lg text-center transition-all',
                  complete && 'bg-gradient-to-br opacity-100',
                  complete && milestone.color,
                  current && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
                  current && !complete && 'bg-primary/10',
                  locked && 'opacity-50'
                )}
              >
                {/* Icon */}
                <div className={cn(
                  'w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-1',
                  complete ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                )}>
                  {complete ? (
                    <Check className="w-4 h-4" />
                  ) : locked ? (
                    <Lock className="w-3 h-3" />
                  ) : (
                    milestone.icon
                  )}
                </div>
                
                {/* Reward text */}
                <div className={cn(
                  'text-[10px] font-medium leading-tight',
                  complete ? 'text-white' : current ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {t(`milestones.${milestone.reward}.title`) || milestone.reward}
                </div>
                
                {/* Current indicator */}
                {current && !complete && (
                  <motion.div
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2"
                    animate={{ y: [0, -2, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <span className="text-xs">👆</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Next reward hint */}
      {!completedPhases.includes('grow') && (
        <p className="text-xs text-muted-foreground mt-3 text-center">
          {t('deckBuilder.completePhaseToUnlock') || 'Complete phase to unlock:'}{' '}
          <span className="font-medium text-foreground">
            {t(`milestones.${MILESTONES.find(m => m.phase === currentPhase)?.reward}.title`) || MILESTONES.find(m => m.phase === currentPhase)?.reward}
          </span>
        </p>
      )}
    </div>
  );
};
