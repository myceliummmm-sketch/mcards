import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";

export const QuizTeaser = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <motion.section
      className="py-12 px-4"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-md mx-auto text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Rocket className="w-5 h-5" />
          <span className="text-sm font-body">{t("landing.quizTeaser.title")}</span>
        </div>
        
        <Button
          onClick={() => navigate("/quiz2")}
          size="lg"
          className="font-display"
        >
          {t("landing.quizTeaser.cta")}
        </Button>
      </div>
    </motion.section>
  );
};
