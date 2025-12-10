import { motion } from "framer-motion";
import { ChevronRight, Lock, Unlock, AlertTriangle } from "lucide-react";
import { PHASE_CONFIG } from "@/data/cardDefinitions";
import { useTranslation } from "@/hooks/useTranslation";

import visionIcon from "@/assets/icons/vision.png";
import researchIcon from "@/assets/icons/research.png";
import buildIcon from "@/assets/icons/build.png";
import growIcon from "@/assets/icons/grow.png";
import pivotIcon from "@/assets/icons/pivot.png";

const PHASE_ICONS: Record<string, string> = {
  vision: visionIcon,
  research: researchIcon,
  build: buildIcon,
  grow: growIcon,
  pivot: pivotIcon,
};

export const FogOfWarJourney = () => {
  const phases = Object.entries(PHASE_CONFIG);
  const { t } = useTranslation();

  return (
    <section className="relative z-10 py-24 px-4 bg-gradient-to-b from-background via-muted/20 to-background overflow-hidden">
      {/* Fog overlay effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-background to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="container mx-auto max-w-6xl relative">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            {t('fogOfWar.title')}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t('fogOfWar.subtitle')}
          </p>
        </motion.div>

        {/* Progress path visualization */}
        <div className="relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 z-0">
            <div className="h-full bg-gradient-to-r from-primary/50 via-secondary/50 to-muted/20 rounded-full" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 relative z-10">
            {phases.map(([key, phase], index) => {
              const isUnlocked = true; // All phases unlocked for landing page demo
              const isCurrent = false; // No current indicator on landing page

              return (
                <motion.div
                  key={key}
                  className="relative group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div
                    className={`relative p-6 rounded-xl backdrop-blur-sm transition-all duration-300 h-full ${
                      isUnlocked
                        ? "bg-card/80 border border-border/50 hover:border-primary/50"
                        : "bg-card/30 border border-border/20"
                    }`}
                    style={{
                      boxShadow: isUnlocked
                        ? `0 0 30px ${phase.color.replace("hsl", "hsla").replace(")", " / 0.3)")}`
                        : "none",
                    }}
                  >
                    {/* Fog overlay for locked phases */}
                    {!isUnlocked && (
                      <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background/80 rounded-xl flex items-center justify-center">
                        <div className="text-center">
                          <Lock className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                          <span className="text-xs text-muted-foreground/50">
                            {t('fogOfWar.locked')}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Unlock indicator */}
                    {isUnlocked && (
                      <div className="absolute -top-2 -right-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: phase.color }}
                        >
                          <Unlock className="w-3 h-3 text-background" />
                        </div>
                      </div>
                    )}

                    {/* Current phase indicator */}
                    {isCurrent && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                          {t('fogOfWar.current')}
                        </span>
                      </div>
                    )}

                    <div className={`w-16 h-16 mb-4 ${!isUnlocked ? "opacity-30" : ""}`}>
                      <img
                        src={PHASE_ICONS[key]}
                        alt={phase.name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <h3
                      className={`text-lg md:text-xl font-display font-bold mb-2 ${
                        !isUnlocked ? "text-muted-foreground/50" : ""
                      }`}
                      style={{ color: isUnlocked ? phase.color : undefined }}
                    >
                      {t(`phases.${key}`)}
                    </h3>

                    <p
                      className={`text-sm mb-2 ${
                        isUnlocked ? "text-muted-foreground" : "text-muted-foreground/30"
                      }`}
                    >
                      {phase.description}
                    </p>

                    <p
                      className={`text-xs ${
                        isUnlocked ? "text-muted-foreground/70" : "text-muted-foreground/20"
                      }`}
                    >
                      {phase.slots.length} {t('fogOfWar.cards')}
                    </p>
                  </div>

                  {/* Arrow connector */}
                  {index < phases.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-20">
                      <ChevronRight
                        className={`h-6 w-6 ${
                          isUnlocked ? "text-primary" : "text-muted-foreground/30"
                        }`}
                      />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Milestones */}
        <motion.div
          className="mt-8 flex flex-wrap justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <div className="px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-sm">
            <span className="text-primary font-medium">✓</span>{" "}
            <span className="text-muted-foreground">{t('fogOfWar.milestone1')}</span>
          </div>
          <div className="px-4 py-2 rounded-full bg-accent/10 border border-accent/30 text-sm">
            <span className="text-accent font-medium">✓</span>{" "}
            <span className="text-muted-foreground">{t('fogOfWar.milestone2')}</span>
          </div>
        </motion.div>

        {/* Pivot Phase Callout */}
        <motion.div
          className="mt-8 mx-auto max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <div className="relative p-4 rounded-xl bg-destructive/10 border border-destructive/30 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-display font-semibold text-destructive mb-1">
                  {t('fogOfWar.pivotSignal.title')}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {t('fogOfWar.pivotSignal.description')}{" "}
                  <span className="text-foreground font-medium">{t('fogOfWar.pivotSignal.highlight')}</span> {t('fogOfWar.pivotSignal.explanation')}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};