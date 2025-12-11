import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Rocket, Sparkles, Clock, Target, Zap } from "lucide-react";
import { BLOCKER_MESSAGES, type QuizResults } from "@/data/quizData";

interface QuizResultProps {
  results: QuizResults;
  answers: number[];
  onStartVision: () => void;
  onShare: () => void;
}

export const QuizResult = ({ results, answers, onStartVision, onShare }: QuizResultProps) => {
  const [displayScore, setDisplayScore] = useState(0);
  const blocker = BLOCKER_MESSAGES[results.blocker];

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = results.totalScore / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= results.totalScore) {
        setDisplayScore(results.totalScore);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [results.totalScore]);

  const roadmapPhases = [
    { 
      name: "Vision Phase", 
      days: results.visionDays, 
      badge: "FREE", 
      icon: Target,
      color: "text-secondary" 
    },
    { 
      name: "Research Phase", 
      days: results.researchDays, 
      badge: "FREE", 
      icon: Sparkles,
      color: "text-primary" 
    },
    { 
      name: "Build Phase", 
      days: results.buildDays, 
      badge: null, 
      icon: Zap,
      color: "text-accent" 
    },
    { 
      name: "First Customer", 
      days: null, 
      badge: "🎉", 
      icon: Rocket,
      color: "text-status-complete" 
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Score Display */}
      <motion.div
        className="text-center p-6 rounded-xl bg-gradient-to-br from-card to-muted border border-border card-glow-strong"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-muted-foreground font-body text-sm mb-2">Твой Launchpad Score</p>
        <motion.div
          className="text-6xl font-display text-glow"
          style={{ color: "hsl(var(--primary))" }}
        >
          {displayScore}
          <span className="text-2xl text-muted-foreground">/100</span>
        </motion.div>
      </motion.div>

      {/* Time to First $100 */}
      <motion.div
        className="flex items-center justify-center gap-3 p-4 rounded-lg bg-card border border-primary/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Clock className="w-6 h-6 text-primary" />
        <div>
          <p className="text-sm text-muted-foreground font-body">Time to First $100</p>
          <p className="text-2xl font-display text-foreground">
            {results.daysToFirst100} дней
          </p>
        </div>
      </motion.div>

      {/* Roadmap */}
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <h3 className="text-lg font-display text-foreground">Твой Roadmap</h3>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-secondary via-primary to-accent" />
          {roadmapPhases.map((phase, idx) => (
            <motion.div
              key={phase.name}
              className="relative flex items-center gap-4 py-3 pl-10"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7 + idx * 0.15 }}
            >
              <div className={`absolute left-2 w-5 h-5 rounded-full bg-card border-2 border-current ${phase.color} flex items-center justify-center`}>
                <phase.icon className="w-3 h-3" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-body text-foreground">{phase.name}</span>
                  {phase.badge && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-status-complete/20 text-status-complete font-body">
                      {phase.badge}
                    </span>
                  )}
                </div>
                {phase.days && (
                  <span className="text-sm text-muted-foreground font-body">
                    {phase.days} {phase.days === 1 ? "день" : phase.days < 5 ? "дня" : "дней"}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Blocker Analysis */}
      <motion.div
        className="p-4 rounded-lg bg-destructive/10 border border-destructive/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <h4 className="font-display text-destructive mb-1">{blocker.title}</h4>
        <p className="text-sm text-muted-foreground font-body">{blocker.description}</p>
      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
      >
        <Button
          onClick={onStartVision}
          className="w-full py-6 text-lg font-display cta-pulse bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
        >
          <Rocket className="w-5 h-5 mr-2" />
          Начать Vision Phase бесплатно →
        </Button>
      </motion.div>

      {/* Share Section */}
      <motion.div
        className="text-center p-4 rounded-lg bg-card border border-border"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
      >
        <p className="text-sm text-muted-foreground font-body mb-3">
          🎁 Поделись с другом → получи бонусную карточку
        </p>
        <Button
          variant="outline"
          onClick={onShare}
          className="gap-2"
        >
          <Share2 className="w-4 h-4" />
          Поделиться результатом
        </Button>
      </motion.div>
    </motion.div>
  );
};
