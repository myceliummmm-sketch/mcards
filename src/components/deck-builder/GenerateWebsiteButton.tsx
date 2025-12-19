import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { triggerForgeConfetti } from './ForgeConfetti';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface GenerateWebsiteButtonProps {
  filledCount: number;
  totalCount: number;
  onClick: () => void;
  disabled?: boolean;
}

// Sparkle particle component
const SparkleParticle = ({ delay, x }: { delay: number; x: number }) => (
  <motion.div
    className="absolute w-1 h-1 bg-yellow-300 rounded-full"
    initial={{ opacity: 0, y: 0, x }}
    animate={{
      opacity: [0, 1, 0],
      y: [-5, -20],
      x: [x, x + (Math.random() - 0.5) * 20],
    }}
    transition={{
      duration: 1.5,
      delay,
      repeat: Infinity,
      repeatDelay: Math.random() * 0.5,
    }}
  />
);

export const GenerateWebsiteButton = ({
  filledCount,
  totalCount,
  onClick,
  disabled = false,
}: GenerateWebsiteButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { language } = useLanguage();
  const percentage = (filledCount / totalCount) * 100;
  const isAlmostReady = filledCount === totalCount - 1;
  const isReady = filledCount === totalCount;

  const handleClick = () => {
    if (!isReady) {
      const remaining = totalCount - filledCount;
      toast.info(
        language === 'ru' 
          ? `Продолжай! Осталось ${remaining} карт${remaining > 1 ? 'ы' : 'а'}` 
          : `Keep crafting! ${remaining} more card${remaining > 1 ? 's' : ''} to go`,
        {
          description: language === 'ru' 
            ? "Заверши все карты Видения для генерации промпта"
            : "Complete all Vision cards to generate your website brief"
        }
      );
      return;
    }
    triggerForgeConfetti();
    onClick();
  };

  // Generate sparkle positions
  const sparkles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    delay: i * 0.2,
    x: 10 + (i * 15),
  }));

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            onClick={handleClick}
            disabled={disabled}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
              "relative overflow-hidden rounded-xl px-6 py-3 font-semibold text-sm transition-all w-[260px]",
              "border-2 backdrop-blur-sm",
              isReady 
                ? "border-primary/80 shadow-lg shadow-primary/30" 
                : isAlmostReady 
                  ? "border-amber-400/60 shadow-md shadow-amber-400/20"
                  : "border-muted-foreground/30",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            animate={isReady ? {
              scale: [1, 1.02, 1],
              boxShadow: [
                "0 0 20px hsl(var(--primary) / 0.3)",
                "0 0 40px hsl(var(--primary) / 0.5)",
                "0 0 20px hsl(var(--primary) / 0.3)",
              ],
            } : {}}
            transition={isReady ? { duration: 2, repeat: Infinity } : {}}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/80 to-muted/50" />

            {/* Mana fill layer */}
            <motion.div
              className={cn(
                "absolute bottom-0 left-0 right-0",
                isReady 
                  ? "bg-gradient-to-t from-primary/60 via-primary/40 to-primary/20"
                  : isAlmostReady
                    ? "bg-gradient-to-t from-amber-500/50 via-amber-400/30 to-amber-300/10"
                    : "bg-gradient-to-t from-purple-600/40 via-purple-500/20 to-transparent"
              )}
              initial={{ height: "0%" }}
              animate={{ height: `${percentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />

            {/* Wave effect on mana surface */}
            {percentage > 0 && (
              <motion.div
                className="absolute left-0 right-0 h-2 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                style={{ bottom: `${percentage}%` }}
                animate={{ x: [-50, 50, -50] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
            )}

            {/* Sparkle particles (visible at 4/5 and 5/5) */}
            <AnimatePresence>
              {(isAlmostReady || isReady) && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {sparkles.map((sparkle) => (
                    <SparkleParticle key={sparkle.id} delay={sparkle.delay} x={sparkle.x} />
                  ))}
                </div>
              )}
            </AnimatePresence>

            {/* Rainbow shimmer for ready state */}
            {isReady && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0"
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            )}

            {/* Content */}
            <div className="relative flex items-center gap-2 z-10">
              {isReady ? (
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                >
                  <Zap className="w-4 h-4 text-primary fill-primary" />
                </motion.div>
              ) : (
                <Sparkles className={cn(
                  "w-4 h-4",
                  isAlmostReady ? "text-amber-400" : "text-muted-foreground"
                )} />
              )}
              
              <span className={cn(
                "transition-colors",
                isReady 
                  ? "text-primary font-bold" 
                  : isAlmostReady 
                    ? "text-amber-400"
                    : "text-muted-foreground"
              )}>
                {isReady 
                  ? (language === 'ru' ? "Создать сайт ✨" : "Generate Website ✨")
                  : (language === 'ru' ? "Создать сайт" : "Generate Website")}
              </span>

              {/* Progress indicator */}
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                isReady 
                  ? "bg-primary/20 text-primary"
                  : isAlmostReady
                    ? "bg-amber-400/20 text-amber-400"
                    : "bg-muted text-muted-foreground"
              )}>
                {filledCount}/{totalCount}
              </span>
            </div>

            {/* Almost ready badge */}
            <AnimatePresence>
              {isAlmostReady && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute -top-2 -right-2 px-2 py-0.5 bg-amber-400 text-amber-950 text-xs font-bold rounded-full"
                >
                  {language === 'ru' ? 'Почти!' : 'Almost!'}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Ready glow ring */}
            {isReady && (
              <motion.div
                className="absolute inset-0 rounded-xl border-2 border-primary"
                animate={{
                  opacity: [0.5, 1, 0.5],
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </motion.button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[250px] p-3 bg-card border-primary/30">
          <div className="text-center">
            <p className="text-sm font-semibold text-primary mb-1">
              {isReady
                ? (language === 'ru' ? '✨ Готово! Создай сайт!' : '✨ Ready! Create your website!')
                : (language === 'ru' ? '🚀 Сгенерируй 5 карт и получи сайт!' : '🚀 Generate 5 cards and get a website!')}
            </p>
            <p className="text-xs text-muted-foreground">
              {isReady
                ? (language === 'ru' 
                    ? 'Нажми чтобы получить готовый промпт для создания лендинга!'
                    : 'Click to get a ready-made prompt for your landing page!')
                : (language === 'ru' 
                    ? 'Заполни все карты Видения — и получишь готовый промпт для создания лендинга!'
                    : 'Complete all Vision cards to get a ready-made prompt for your landing page!')}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
