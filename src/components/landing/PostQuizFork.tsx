import { motion } from "framer-motion";
import { Book } from "lucide-react";
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

      {/* Single CTA Button */}
      <motion.button
        onClick={onGetPlaybook}
        className="w-full p-5 rounded-xl bg-gradient-to-r from-primary to-secondary 
                   hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 text-left group
                   shadow-lg shadow-primary/20"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Book className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-lg text-white mb-0.5">
              {t("landing.mobile.postQuiz.playbook.title")}
            </h3>
            <p className="text-sm text-white/80 font-body">
              {t("landing.mobile.postQuiz.playbook.description")}
            </p>
          </div>
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-white/20 text-white">
            FREE
          </span>
        </div>
      </motion.button>

    </motion.div>
  );
};