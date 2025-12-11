import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Target, Calendar, Brain, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";

const PreviewCard = ({ 
  icon: Icon, 
  label, 
  delay 
}: { 
  icon: React.ElementType; 
  label: string; 
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.9 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ scale: 1.05, y: -4 }}
    className="relative group"
  >
    <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 text-center space-y-2 hover:border-primary/30 transition-all duration-300">
      <div className="w-10 h-10 mx-auto rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <p className="text-xs text-muted-foreground font-body">{label}</p>
      <motion.p 
        className="text-xl font-display font-bold text-foreground"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        ???
      </motion.p>
    </div>
  </motion.div>
);

export const QuizTeaser = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const previewCards = [
    { icon: Target, labelKey: "scoreLabel", delay: 0.1 },
    { icon: Calendar, labelKey: "daysLabel", delay: 0.2 },
    { icon: Brain, labelKey: "blockerLabel", delay: 0.3 },
  ];

  return (
    <motion.section
      className="py-16 px-4 relative"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="max-w-2xl mx-auto text-center space-y-8 relative z-10">
        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-2"
        >
          <div className="flex items-center justify-center gap-2 text-primary">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-body uppercase tracking-wider">{t("landing.quizTeaser.badge")}</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            {t("landing.quizTeaser.title")}
          </h3>
        </motion.div>

        {/* Preview Cards */}
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {previewCards.map((card) => (
            <PreviewCard
              key={card.labelKey}
              icon={card.icon}
              label={t(`landing.quizTeaser.${card.labelKey}`)}
              delay={card.delay}
            />
          ))}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <Button
            onClick={() => navigate("/quiz2")}
            size="lg"
            className="font-display cta-pulse"
          >
            {t("landing.quizTeaser.cta")}
          </Button>
          <p className="text-xs text-muted-foreground font-body">
            {t("landing.quizTeaser.timeInfo")}
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
};
