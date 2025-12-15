import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { BLOCKER_KEYS, getVideoUrl, CHARACTER_BY_BLOCKER, type QuizResults } from "@/data/quizData";
import { getCharacterById } from "@/data/teamCharacters";
import { useLanguage } from "@/contexts/LanguageContext";

interface VideoQuizResultProps {
  results: QuizResults;
}

export const VideoQuizResult = ({ results }: VideoQuizResultProps) => {
  const { t } = useLanguage();
  const [displayScore, setDisplayScore] = useState(0);
  
  const videoUrl = getVideoUrl(results.totalScore, results.blocker);
  const characterId = CHARACTER_BY_BLOCKER[results.blocker] || "evergreen";
  const character = getCharacterById(characterId);
  const blocker = BLOCKER_KEYS[results.blocker];

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Video */}
      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <video
          src={videoUrl}
          autoPlay
          playsInline
          muted
          loop
          className="w-full max-w-[240px] aspect-[9/16] rounded-2xl object-cover shadow-2xl"
        />
      </motion.div>

      {/* Animated Score */}
      <motion.div
        className="text-center p-4 rounded-xl bg-gradient-to-br from-card to-muted border border-border"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-muted-foreground font-body text-sm mb-1">{t("quiz.result.yourScore")}</p>
        <motion.div
          className="text-5xl font-display"
          style={{ color: "hsl(var(--primary))" }}
        >
          {displayScore}
          <span className="text-xl text-muted-foreground">/100</span>
        </motion.div>
      </motion.div>

      {/* Blocker + Character */}
      <motion.div
        className="p-4 rounded-xl bg-destructive/10 border border-destructive/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-3">
          {character?.avatar && (
            <img 
              src={character.avatar} 
              alt={character.name}
              className="w-12 h-12 rounded-full border-2 border-destructive/50"
            />
          )}
          <div className="flex-1">
            <h4 className="font-display text-destructive text-sm">{t(blocker.titleKey)}</h4>
            <p className="text-xs text-muted-foreground font-body mt-1">
              {character?.name} {t("quiz.videoResult.willHelp")}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
