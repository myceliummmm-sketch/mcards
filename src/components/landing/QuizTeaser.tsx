import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Target, Calendar, Brain, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";

const PreviewCard = ({ 
  icon: Icon, 
  label, 
  delay,
  glowColor 
}: { 
  icon: React.ElementType; 
  label: string; 
  delay: number;
  glowColor: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.9 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ scale: 1.05, y: -8 }}
    className="relative group"
  >
    {/* Glow effect behind card */}
    <div 
      className={`absolute inset-0 rounded-xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 ${glowColor}`}
    />
    
    <div className="relative bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-md border border-primary/20 rounded-xl p-4 text-center space-y-2 hover:border-primary/50 transition-all duration-300 card-shine overflow-hidden">
      {/* Shimmer overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      
      <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center group-hover:from-primary/50 group-hover:to-accent/50 transition-all duration-300 shadow-lg shadow-primary/20">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <p className="text-xs text-muted-foreground font-body">{label}</p>
      <motion.div className="relative">
        <motion.p 
          className="text-2xl font-display font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto]"
          animate={{ 
            backgroundPosition: ["0%", "200%"],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          ???
        </motion.p>
        {/* Typing cursor effect */}
        <motion.span
          className="absolute -right-1 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      </motion.div>
    </div>
  </motion.div>
);

export const QuizTeaser = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const previewCards = [
    { icon: Target, labelKey: "scoreLabel", delay: 0.1, glowColor: "bg-cyan-500/30" },
    { icon: Calendar, labelKey: "daysLabel", delay: 0.2, glowColor: "bg-purple-500/30" },
    { icon: Brain, labelKey: "blockerLabel", delay: 0.3, glowColor: "bg-pink-500/30" },
  ];

  return (
    <motion.section
      className="py-20 px-4 relative overflow-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-1/2 -left-1/4 w-[600px] h-[600px] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.15), transparent 70%)" }}
          animate={{ 
            scale: [1, 1.2, 1],
            x: [-50, 50, -50],
            y: [-30, 30, -30],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute -bottom-1/2 -right-1/4 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, hsl(var(--accent) / 0.1), transparent 70%)" }}
          animate={{ 
            scale: [1.2, 1, 1.2],
            x: [50, -50, 50],
            y: [30, -30, 30],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/40"
          style={{
            left: `${15 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [-20, 20, -20],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        />
      ))}
      
      <div className="max-w-2xl mx-auto text-center space-y-8 relative z-10">
        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-3"
        >
          {/* Badge with decorative lines */}
          <div className="flex items-center justify-center gap-3">
            <motion.div 
              className="h-px w-8 bg-gradient-to-r from-transparent to-primary/50"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            />
            <div className="flex items-center gap-2 text-primary">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
              <span className="text-xs font-body uppercase tracking-wider">{t("landing.quizTeaser.badge")}</span>
            </div>
            <motion.div 
              className="h-px w-8 bg-gradient-to-l from-transparent to-primary/50"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            />
          </div>
          
          <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground text-glow">
            {t("landing.quizTeaser.title")}
          </h3>
        </motion.div>

        {/* Preview Cards */}
        <div className="grid grid-cols-3 gap-3 md:gap-5">
          {previewCards.map((card) => (
            <PreviewCard
              key={card.labelKey}
              icon={card.icon}
              label={t(`landing.quizTeaser.${card.labelKey}`)}
              delay={card.delay}
              glowColor={card.glowColor}
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
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={() => navigate("/quiz2")}
              size="lg"
              className="font-display bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] hover:bg-[length:100%_auto] transition-all duration-500 shadow-lg shadow-primary/30 hover:shadow-primary/50 cta-pulse group"
            >
              <span>{t("landing.quizTeaser.cta")}</span>
              <motion.span
                className="ml-2 inline-block"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.span>
            </Button>
          </motion.div>
          <p className="text-xs text-muted-foreground font-body">
            {t("landing.quizTeaser.timeInfo")}
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
};
