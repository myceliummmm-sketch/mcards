import { motion } from "framer-motion";
import { Book, Rocket } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface PostQuizForkProps {
  onGetPlaybook: () => void;
  onStartBuilding: () => void;
}

export const PostQuizFork = ({ onGetPlaybook, onStartBuilding }: PostQuizForkProps) => {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <motion.h2
          className="text-2xl font-display text-foreground mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {t("landing.mobile.postQuiz.title")}
        </motion.h2>
        <motion.p
          className="text-muted-foreground font-body"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {t("landing.mobile.postQuiz.subtitle")}
        </motion.p>
      </div>

      <div className="space-y-4">
        {/* Get Playbook Card */}
        <motion.button
          onClick={onGetPlaybook}
          className="w-full p-6 rounded-xl bg-gradient-to-br from-card to-muted border border-primary/30 
                     hover:border-primary/60 transition-all duration-300 text-left group"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center 
                            group-hover:bg-primary/30 transition-colors">
              <Book className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-lg text-foreground mb-1">
                {t("landing.mobile.postQuiz.playbook.title")}
              </h3>
              <p className="text-sm text-muted-foreground font-body">
                {t("landing.mobile.postQuiz.playbook.description")}
              </p>
              <span className="inline-block mt-2 px-3 py-1 text-xs rounded-full bg-status-complete/20 text-status-complete font-body">
                FREE
              </span>
            </div>
          </div>
        </motion.button>

        {/* Start Building Card */}
        <motion.button
          onClick={onStartBuilding}
          className="w-full p-6 rounded-xl bg-gradient-to-r from-primary to-secondary 
                     hover:from-primary/90 hover:to-secondary/90 transition-all duration-300 text-left group"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-lg text-white mb-1">
                {t("landing.mobile.postQuiz.build.title")}
              </h3>
              <p className="text-sm text-white/80 font-body">
                {t("landing.mobile.postQuiz.build.description")}
              </p>
            </div>
          </div>
        </motion.button>
      </div>
    </motion.div>
  );
};
