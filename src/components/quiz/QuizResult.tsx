import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Rocket, Sparkles, Clock, Target, Zap, Book, Users } from "lucide-react";
import { BLOCKER_KEYS, getVideoUrl, CHARACTER_BY_BLOCKER, type QuizResults } from "@/data/quizData";
import { getCharacterById, TEAM_CHARACTERS } from "@/data/teamCharacters";
import { useLanguage } from "@/contexts/LanguageContext";
interface QuizResultProps {
  results: QuizResults;
  answers: number[];
  onGetPlaybook: () => void;
  onStartBuilding: () => void;
  onShare: () => void;
}

export const QuizResult = ({ results, answers, onGetPlaybook, onStartBuilding, onShare }: QuizResultProps) => {
  const { t } = useLanguage();
  const [displayScore, setDisplayScore] = useState(0);
  const blocker = BLOCKER_KEYS[results.blocker];
  const videoUrl = getVideoUrl(results.totalScore, results.blocker);
  const characterId = CHARACTER_BY_BLOCKER[results.blocker];
  const character = getCharacterById(characterId);

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
      nameKey: "quiz.result.visionPhase", 
      days: results.visionDays, 
      badge: "FREE", 
      icon: Target,
      color: "text-secondary" 
    },
    { 
      nameKey: "quiz.result.researchPhase", 
      days: results.researchDays, 
      badge: "FREE", 
      icon: Sparkles,
      color: "text-primary" 
    },
    { 
      nameKey: "quiz.result.buildPhase", 
      days: results.buildDays, 
      badge: null, 
      icon: Zap,
      color: "text-accent" 
    },
    { 
      nameKey: "quiz.result.firstCustomer", 
      days: null, 
      badge: "🎉", 
      icon: Rocket,
      color: "text-status-complete" 
    },
  ];

  const getDaysText = (days: number) => {
    if (days === 1) return t("quiz.result.day");
    if (days < 5) return t("quiz.result.days2to4");
    return t("quiz.result.days");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Video Section */}
      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <video
          src={videoUrl}
          autoPlay
          playsInline
          muted
          loop
          className="w-full max-w-[500px] aspect-[16/9] rounded-2xl object-cover shadow-2xl"
        />
      </motion.div>

      {/* Score Display */}
      <motion.div
        className="text-center p-6 rounded-xl bg-gradient-to-br from-card to-muted border border-border card-glow-strong"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-muted-foreground font-body text-sm mb-2">{t("quiz.result.yourScore")}</p>
        <motion.div
          className="text-6xl font-display text-glow"
          style={{ color: "hsl(var(--primary))" }}
        >
          {displayScore}
          <span className="text-2xl text-muted-foreground">/100</span>
        </motion.div>
      </motion.div>

      {/* Blocker Analysis with Character - MOVED UP */}
      <motion.div
        className="p-4 rounded-lg bg-destructive/10 border border-destructive/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-start gap-3">
          {character && (
            <img 
              src={character.avatar} 
              alt={character.name}
              className="w-12 h-12 rounded-full border-2 border-destructive/50 shrink-0"
            />
          )}
          <div>
            <h4 className="font-display text-destructive mb-1">{t(blocker.titleKey)}</h4>
            <p className="text-sm text-muted-foreground font-body">{t(blocker.descriptionKey)}</p>
          </div>
        </div>
      </motion.div>

      {/* Action Cards - MOVED UP */}
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="text-center mb-2">
          <h3 className="text-lg font-display text-foreground">
            {t("landing.mobile.postQuiz.title")}
          </h3>
          <p className="text-sm text-muted-foreground font-body">
            {t("landing.mobile.postQuiz.subtitle")}
          </p>
        </div>

        {/* Get Playbook Card */}
        <motion.button
          onClick={onGetPlaybook}
          className="w-full p-4 rounded-xl bg-gradient-to-br from-card to-muted border border-primary/30 
                     hover:border-primary/60 transition-all duration-300 text-left group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center 
                            group-hover:bg-primary/30 transition-colors shrink-0">
              <Book className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-base text-foreground mb-0.5">
                {t("landing.mobile.postQuiz.playbook.title")}
              </h3>
              <p className="text-xs text-muted-foreground font-body line-clamp-2">
                {t("landing.mobile.postQuiz.playbook.description")}
              </p>
              <span className="inline-block mt-1.5 px-2 py-0.5 text-xs rounded-full bg-status-complete/20 text-status-complete font-body">
                FREE
              </span>
            </div>
          </div>
        </motion.button>

        {/* Start Building Card */}
        <motion.button
          onClick={onStartBuilding}
          className="w-full p-4 rounded-xl bg-gradient-to-r from-primary to-secondary 
                     hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 text-left group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-base text-white mb-0.5">
                {t("landing.mobile.postQuiz.build.title")}
              </h3>
              <p className="text-xs text-white/80 font-body line-clamp-2">
                {t("landing.mobile.postQuiz.build.description")}
              </p>
              <div className="flex gap-2 mt-1.5">
                <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-white/20 text-white font-body">
                  FREE
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-white/20 text-white font-body">
                  <Clock className="w-3 h-3" />
                  15 min
                </span>
              </div>
            </div>
          </div>
        </motion.button>
      </motion.div>

      {/* Time to First $1000 - MOVED DOWN */}
      <motion.div
        className="flex items-center justify-center gap-3 p-4 rounded-lg bg-card border border-primary/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Clock className="w-6 h-6 text-primary" />
        <div>
          <p className="text-sm text-muted-foreground font-body">{t("quiz.result.timeToFirst1000")}</p>
          <p className="text-2xl font-display text-foreground">
            {results.daysToFirst100} {getDaysText(results.daysToFirst100)}
          </p>
        </div>
      </motion.div>

      {/* Team Avatars & Mycelium Value - MOVED DOWN */}
      <motion.div
        className="p-4 rounded-lg bg-gradient-to-br from-card to-muted border border-border"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-5 h-5 text-primary" />
          <h4 className="font-display text-foreground text-sm">{t("quiz.result.meetYourTeam")}</h4>
        </div>
        
        {/* Avatar Stack */}
        <div className="flex items-center mb-3">
          <div className="flex -space-x-3">
            {Object.values(TEAM_CHARACTERS).slice(0, 7).map((char, idx) => (
              <motion.img
                key={char.id}
                src={char.avatar}
                alt={char.name}
                className="w-10 h-10 rounded-full border-2 border-card object-cover"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + idx * 0.05 }}
              />
            ))}
          </div>
          <span className="ml-3 text-sm font-display text-primary">7 AI Advisors</span>
        </div>
        
        <p className="text-xs text-muted-foreground font-body leading-relaxed">
          {t("quiz.result.myceliumValue")}
        </p>
      </motion.div>

      {/* Roadmap - MOVED DOWN */}
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <h3 className="text-lg font-display text-foreground">{t("quiz.result.yourRoadmap")}</h3>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-secondary via-primary to-accent" />
          {roadmapPhases.map((phase, idx) => (
            <motion.div
              key={phase.nameKey}
              className="relative flex items-center gap-4 py-3 pl-10"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8 + idx * 0.15 }}
            >
              <div className={`absolute left-2 w-5 h-5 rounded-full bg-card border-2 border-current ${phase.color} flex items-center justify-center`}>
                <phase.icon className="w-3 h-3" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-body text-foreground">{t(phase.nameKey)}</span>
                  {phase.badge && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-status-complete/20 text-status-complete font-body">
                      {phase.badge}
                    </span>
                  )}
                </div>
                {phase.days && (
                  <span className="text-sm text-muted-foreground font-body">
                    {phase.days} {getDaysText(phase.days)}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Share Section */}
      <motion.div
        className="text-center p-4 rounded-lg bg-card border border-border"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
      >
        <p className="text-sm text-muted-foreground font-body mb-3">
          {t("quiz.result.shareBonus")}
        </p>
        <Button
          variant="outline"
          onClick={onShare}
          className="gap-2"
        >
          <Share2 className="w-4 h-4" />
          {t("quiz.result.shareResult")}
        </Button>
      </motion.div>
    </motion.div>
  );
};