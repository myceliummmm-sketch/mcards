import { motion } from "framer-motion";
import { Book, Rocket, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { VideoQuizResult } from "@/components/quiz/VideoQuizResult";
import { type QuizResults } from "@/data/quizData";

interface PostQuizForkProps {
  onGetPlaybook: () => void;
  onStartBuilding: () => void;
  results?: QuizResults;
}

export const PostQuizFork = ({ onGetPlaybook, onStartBuilding, results }: PostQuizForkProps) => {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Video Result Section (includes video, score, blocker) */}
      {results && (
        <VideoQuizResult results={results} />
      )}

      {/* CTA Buttons - MOVED UP, right after VideoQuizResult */}
      <div className="space-y-3">
        {/* Get Playbook Card */}
        <motion.button
          onClick={onGetPlaybook}
          className="w-full p-4 rounded-xl bg-gradient-to-br from-card to-muted border border-primary/30 
                     hover:border-primary/60 transition-all duration-300 text-left group"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
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
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
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
      </div>

      {/* Title/Subtitle - MOVED DOWN */}
      <div className="text-center">
        <motion.h2
          className="text-lg font-display text-foreground mb-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {t("landing.mobile.postQuiz.title")}
        </motion.h2>
        <motion.p
          className="text-sm text-muted-foreground font-body"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {t("landing.mobile.postQuiz.subtitle")}
        </motion.p>
      </div>
    </motion.div>
  );
};