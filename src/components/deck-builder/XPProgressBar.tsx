import { motion } from 'framer-motion';
import { Gift, Globe, FileText, Zap, DollarSign } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useTranslation } from '@/hooks/useTranslation';

interface XPProgressBarProps {
  current: number;
  total: number;
}

interface Milestone {
  cards: number;
  rewardKey: string;
  icon: typeof Gift;
  color: string;
}

// Milestones with reward keys for translations
// 20 cards total: Vision(5) + Research(5) + Build(5) + Grow(5)
const MILESTONES: Milestone[] = [
  { 
    cards: 5, 
    rewardKey: 'websitePrompt', 
    icon: Globe, 
    color: 'text-violet-400',
  },
  { 
    cards: 10, 
    rewardKey: 'researchReport', 
    icon: FileText, 
    color: 'text-amber-400',
  },
  { 
    cards: 15, 
    rewardKey: 'fullPrompt', 
    icon: Zap, 
    color: 'text-blue-400',
  },
  { 
    cards: 20, 
    rewardKey: 'dollarStrategy', 
    icon: DollarSign, 
    color: 'text-green-400',
  },
];

export const XPProgressBar = ({ current, total }: XPProgressBarProps) => {
  const percentage = (current / total) * 100;
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-foreground">
          {t('milestones.deckProgress')}
        </span>
        <span className="text-sm font-bold text-primary text-glow">
          {current} / {total}
        </span>
      </div>
      
      <div className="xp-bar relative h-5 bg-muted border-2 border-border rounded-full overflow-visible">
        <motion.div
          className="xp-fill h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        
        {/* Milestone markers with rewards - evenly distributed */}
        {MILESTONES.map((milestone, index) => {
          // Evenly distribute: 25%, 50%, 75%, 100%
          const milestonePos = ((index + 1) / MILESTONES.length) * 100;
          const isReached = current >= milestone.cards;
          const Icon = milestone.icon;
          const isLast = index === MILESTONES.length - 1;
          
          return (
            <div
              key={milestone.cards}
              className="absolute top-1/2 group cursor-pointer"
              style={{ 
                left: `${milestonePos}%`,
                transform: 'translateY(-50%) translateX(-50%)'
              }}
              onClick={() => setSelectedMilestone(milestone)}
            >
              {/* Milestone circle */}
              <div
                className={`relative w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                  isReached
                    ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-black border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.6)]'
                    : 'bg-muted text-muted-foreground border-border hover:border-primary/50'
                }`}
              >
                {isReached ? (
                  <Gift className="w-4 h-4" />
                ) : (
                  <Icon className={`w-4 h-4 ${milestone.color}`} />
                )}
              </div>
              
              {/* Beautiful tooltip on hover - appears BELOW */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-20 scale-95 group-hover:scale-100">
                {/* Arrow pointing up */}
                <div className={`absolute bottom-full left-1/2 -translate-x-1/2 -mb-1 border-8 border-transparent ${isReached ? 'border-b-amber-400/50' : 'border-b-primary/30'}`}></div>
                <div className={`bg-gradient-to-br from-card via-card to-card/90 border-2 ${isReached ? 'border-amber-400/50' : 'border-primary/30'} rounded-xl px-4 py-3 shadow-2xl min-w-[200px]`}>
                  {/* Reward name */}
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-4 h-4 ${milestone.color}`} />
                    <span className={`text-sm font-bold ${milestone.color}`}>{t(`milestones.${milestone.rewardKey}.title`)}</span>
                  </div>
                  
                  {/* Description */}
                  <p className="text-xs text-foreground/80 mb-2 leading-relaxed">
                    {t(`milestones.${milestone.rewardKey}.description`)}
                  </p>
                  
                  {/* Benefit highlight */}
                  <div className={`text-xs font-semibold ${isReached ? 'text-amber-400' : 'text-primary'} flex items-center gap-1`}>
                    ✨ {t(`milestones.${milestone.rewardKey}.benefit`)}
                  </div>
                  
                  {/* Progress indicator */}
                  <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground uppercase">{t('milestones.unlockAt')}</span>
                    <span className="text-xs font-bold text-foreground">{milestone.cards} {t('milestones.cards')}</span>
                  </div>
                  
                  {/* Click hint */}
                  <div className="mt-2 text-[10px] text-primary/70 text-center">
                    {t('milestones.clickForDetails')}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Reward Modal */}
      <Dialog open={!!selectedMilestone} onOpenChange={() => setSelectedMilestone(null)}>
        <DialogContent className="bg-gradient-to-br from-card via-card to-background border-2 border-primary/30 max-w-md">
          {selectedMilestone && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 flex items-center justify-center`}>
                    <selectedMilestone.icon className={`w-6 h-6 ${selectedMilestone.color}`} />
                  </div>
                  <div>
                    <span className={`text-xl font-bold ${selectedMilestone.color}`}>
                      {t(`milestones.${selectedMilestone.rewardKey}.title`)}
                    </span>
                    <p className="text-sm text-muted-foreground font-normal">
                      {t('milestones.unlockAt')} {selectedMilestone.cards} {t('milestones.cards')}
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <p className="text-foreground/90 leading-relaxed">
                  {t(`milestones.${selectedMilestone.rewardKey}.fullDescription`)}
                </p>
                
                <div className={`p-4 rounded-xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/20`}>
                  <div className="flex items-center gap-2 text-primary font-semibold">
                    <span className="text-lg">✨</span>
                    {t(`milestones.${selectedMilestone.rewardKey}.benefit`)}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <span className="text-sm text-muted-foreground">{t('milestones.yourProgress')}</span>
                  <span className={`text-sm font-bold ${current >= selectedMilestone.cards ? 'text-green-400' : 'text-foreground'}`}>
                    {current >= selectedMilestone.cards ? `✓ ${t('milestones.unlocked')}` : `${current} / ${selectedMilestone.cards} ${t('milestones.cards')}`}
                  </span>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {current === total && (
        <motion.div
          className="mt-4 text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary rounded-full text-primary-foreground font-bold text-lg shadow-lg">
            <span>✨</span>
            <span>{t('milestones.deckComplete')}</span>
            <span>✨</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};
