import { motion } from 'framer-motion';
import { Sparkles, Zap, Eye, Check } from 'lucide-react';

interface ForgeLoadingStateProps {
  stage: 'idle' | 'channeling' | 'summoning' | 'evaluating';
}

const stages = [
  { id: 'channeling', label: 'Channeling', icon: Zap },
  { id: 'summoning', label: 'Creating', icon: Sparkles },
  { id: 'evaluating', label: 'Evaluating', icon: Eye },
] as const;

const stageConfig = {
  idle: {
    icon: Sparkles,
    text: 'Preparing magic...',
    color: 'text-primary',
    glowColor: 'shadow-primary/40'
  },
  channeling: {
    icon: Zap,
    text: 'Channeling creative energy...',
    color: 'text-cyan-400',
    glowColor: 'shadow-cyan-500/50'
  },
  summoning: {
    icon: Sparkles,
    text: 'Creating visual essence...',
    color: 'text-purple-400',
    glowColor: 'shadow-purple-500/50'
  },
  evaluating: {
    icon: Eye,
    text: 'Team evaluation in progress...',
    color: 'text-pink-400',
    glowColor: 'shadow-pink-500/50'
  }
};

const getStageIndex = (stage: string): number => {
  const index = stages.findIndex(s => s.id === stage);
  return index === -1 ? 0 : index;
};

export const ForgeLoadingState = ({ stage }: ForgeLoadingStateProps) => {
  const config = stageConfig[stage];
  const Icon = config.icon;
  const currentStageIndex = getStageIndex(stage);
  const progress = ((currentStageIndex + 1) / stages.length) * 100;

  return (
    <div className="relative min-h-[420px] flex flex-col items-center justify-center overflow-hidden py-8">
      {/* Background glow effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className={`w-72 h-72 rounded-full bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-3xl`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </div>

      {/* Animated background particles - increased count and radius */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[...Array(16)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2.5 h-2.5 rounded-full bg-gradient-to-r from-primary to-secondary"
            initial={{
              scale: 0,
              opacity: 0
            }}
            animate={{
              x: Math.cos(i * 22.5 * Math.PI / 180) * 120,
              y: Math.sin(i * 22.5 * Math.PI / 180) * 120,
              scale: [0, 1.2, 0],
              opacity: [0, 0.8, 0]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: i * 0.12,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>

      {/* Outer spinning ring - larger */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'linear'
        }}
        className="absolute w-56 h-56 border-2 border-dashed border-primary/30 rounded-full"
      />

      {/* Middle spinning ring */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'linear'
        }}
        className="absolute w-44 h-44 border-2 border-dotted border-secondary/40 rounded-full"
      />

      {/* Inner spinning ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear'
        }}
        className="absolute w-32 h-32 border border-primary/20 rounded-full"
      />

      {/* Pulsing center icon - larger with glow */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className={`relative z-10 bg-background/90 backdrop-blur-md border-2 border-primary/40 rounded-full p-10 shadow-2xl ${config.glowColor}`}
      >
        <motion.div
          animate={{
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          <Icon className={`w-16 h-16 ${config.color}`} />
        </motion.div>
      </motion.div>

      {/* Stage text */}
      <motion.div
        key={stage}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-10 text-center"
      >
        <p className={`text-lg font-semibold ${config.color}`}>
          {config.text}
        </p>
        <motion.div
          className="flex gap-1.5 justify-center mt-3"
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className={`w-2 h-2 rounded-full ${config.color.replace('text-', 'bg-')}`}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.4, 1, 0.4]
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15
              }}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Stage Progress Bar */}
      <div className="absolute bottom-4 left-0 right-0 px-6">
        {/* Progress bar track */}
        <div className="relative h-2 bg-muted/50 rounded-full overflow-hidden mb-4">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        {/* Stage indicators */}
        <div className="flex justify-between items-center">
          {stages.map((s, index) => {
            const StageIcon = s.icon;
            const isCompleted = index < currentStageIndex;
            const isActive = index === currentStageIndex;
            const isPending = index > currentStageIndex;

            return (
              <div key={s.id} className="flex flex-col items-center gap-2">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    opacity: isPending ? 0.4 : 1
                  }}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors
                    ${isCompleted
                      ? 'bg-green-500/20 border-green-500 text-green-400'
                      : isActive
                        ? 'bg-primary/20 border-primary text-primary shadow-lg shadow-primary/30'
                        : 'bg-muted/30 border-muted-foreground/30 text-muted-foreground'
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <StageIcon className="w-5 h-5" />
                  )}
                </motion.div>
                <span className={`text-xs font-medium ${
                  isCompleted
                    ? 'text-green-400'
                    : isActive
                      ? 'text-primary'
                      : 'text-muted-foreground/60'
                }`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
