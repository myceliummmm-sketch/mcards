import { motion } from 'framer-motion';
import { Sparkles, Zap, Eye } from 'lucide-react';

interface ForgeLoadingStateProps {
  stage: 'idle' | 'channeling' | 'summoning' | 'evaluating';
}

const stageConfig = {
  idle: {
    icon: Sparkles,
    text: 'Preparing magic...',
    color: 'text-primary'
  },
  channeling: {
    icon: Zap,
    text: 'Channeling creative energy...',
    color: 'text-primary'
  },
  summoning: {
    icon: Sparkles,
    text: 'Summoning visual essence...',
    color: 'text-secondary'
  },
  evaluating: {
    icon: Eye,
    text: 'Team evaluation in progress...',
    color: 'text-accent'
  }
};

export const ForgeLoadingState = ({ stage }: ForgeLoadingStateProps) => {
  const config = stageConfig[stage];
  const Icon = config.icon;

  return (
    <div className="relative h-64 flex items-center justify-center overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary/30"
            initial={{ 
              x: '50%', 
              y: '50%',
              scale: 0,
              opacity: 0 
            }}
            animate={{
              x: `${Math.cos(i * 30 * Math.PI / 180) * 100 + 50}%`,
              y: `${Math.sin(i * 30 * Math.PI / 180) * 100 + 50}%`,
              scale: [0, 1, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>

      {/* Spinning outer ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: 'linear' 
        }}
        className="absolute w-40 h-40 border-2 border-dashed border-primary/40 rounded-full"
      />

      {/* Inner spinning ring (opposite direction) */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ 
          duration: 3, 
          repeat: Infinity, 
          ease: 'linear' 
        }}
        className="absolute w-28 h-28 border-2 border-dotted border-secondary/40 rounded-full"
      />

      {/* Pulsing center icon */}
      <motion.div
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.6, 1, 0.6]
        }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="relative z-10 bg-background/80 backdrop-blur-sm border border-primary/30 rounded-full p-8 shadow-lg shadow-primary/20"
      >
        <Icon className={`w-10 h-10 ${config.color}`} />
      </motion.div>

      {/* Floating particles effect */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-1 h-1 rounded-full bg-accent/60"
          initial={{ 
            x: '50%',
            y: '50%',
            opacity: 0
          }}
          animate={{
            x: `${50 + (i % 2 === 0 ? 1 : -1) * 30}%`,
            y: ['50%', '20%', '50%'],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: i * 0.4,
            ease: 'easeInOut'
          }}
        />
      ))}

      {/* Stage text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center"
      >
        <p className={`text-sm font-medium ${config.color} text-glow`}>
          {config.text}
        </p>
        <motion.div 
          className="flex gap-1 justify-center mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary/60"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.4, 1, 0.4]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};
