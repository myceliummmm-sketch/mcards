import { motion } from 'framer-motion';

interface XPProgressBarProps {
  current: number;
  total: number;
}

const MILESTONES = [5, 11, 17, 22];

export const XPProgressBar = ({ current, total }: XPProgressBarProps) => {
  const percentage = (current / total) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-foreground">
          Deck Progress
        </span>
        <span className="text-sm font-bold text-primary text-glow">
          {current} / {total}
        </span>
      </div>
      
      <div className="xp-bar relative h-4 bg-muted border-2 border-border rounded-full overflow-visible">
        <motion.div
          className="xp-fill h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        
        {/* Milestone markers */}
        {MILESTONES.map((milestone) => {
          const milestonePos = (milestone / total) * 100;
          const isReached = current >= milestone;
          
          return (
            <motion.div
              key={milestone}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
              style={{ left: `${milestonePos}%` }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 + (milestone / total) }}
            >
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isReached
                    ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_10px_hsl(var(--primary))]'
                    : 'bg-muted text-muted-foreground border-border'
                }`}
              >
                {milestone}
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {current === total && (
        <motion.div
          className="mt-4 text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary rounded-full text-primary-foreground font-bold text-lg shadow-lg">
            <span>✨</span>
            <span>Deck Complete! Ready to Generate</span>
            <span>✨</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};
