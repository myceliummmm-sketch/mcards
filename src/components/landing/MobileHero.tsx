import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import myceliumCardsHero from "@/assets/mycelium-cards-hero.png";

export const MobileHero = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-12 relative">
      {/* Subtle background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-primary/20 rounded-full blur-[100px]" />
      </div>

      <motion.div
        className="text-center z-10 max-w-sm mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Card stack image with glow */}
        <motion.div
          className="relative mb-6"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, y: [0, -8, 0] }}
          transition={{ 
            scale: { delay: 0.2, duration: 0.4 },
            y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <img 
            src={myceliumCardsHero} 
            alt="Mycelium Cards" 
            className="w-44 h-auto mx-auto"
          />
          <div className="absolute inset-0 bg-primary/20 blur-3xl -z-10 scale-150" />
        </motion.div>

        {/* Headline */}
        <h1 className="text-3xl font-display font-bold mb-4 leading-tight">
          <span className="text-foreground">{t('landing.mobile.hero.headline1')}</span>
          <br />
          <span className="text-primary">{t('landing.mobile.hero.headline2')}</span>
        </h1>

        {/* Subline */}
        <p className="text-muted-foreground text-base mb-8 leading-relaxed">
          {t('landing.mobile.hero.subline')}
        </p>

        {/* CTA Button */}
        <Button
          size="lg"
          onClick={() => navigate("/quiz2")}
          className="w-full text-lg gap-2 py-6 cta-pulse"
        >
          {t('landing.mobile.hero.cta')}
          <ArrowRight className="h-5 w-5" />
        </Button>

        {/* Time indicator */}
        <p className="mt-4 text-sm text-muted-foreground">
          {t('landing.mobile.hero.time')}
        </p>
      </motion.div>
    </div>
  );
};
