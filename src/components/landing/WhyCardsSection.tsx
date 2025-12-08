import { motion } from "framer-motion";
import { FileText, LayoutGrid, Brain, Layers, CheckCircle, XCircle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export function WhyCardsSection() {
  const { t } = useTranslation();

  return (
    <section className="relative z-10 py-24 px-4 overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            {t('whyCards.title')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('whyCards.subtitle')}
          </p>
        </motion.div>

        {/* Split Screen Comparison */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Left: The Old Way */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative p-6 rounded-xl bg-muted/20 border border-destructive/30 overflow-hidden">
              {/* Chaos visualization */}
              <div className="relative h-64 md:h-80 flex items-center justify-center">
                {/* Scattered "documents" */}
                <motion.div
                  className="absolute w-24 h-32 bg-muted/60 rounded border border-border/50 transform -rotate-12 top-4 left-4"
                  animate={{ rotate: [-12, -15, -12] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div className="p-2 space-y-1">
                    <div className="h-1.5 bg-muted-foreground/20 rounded w-full" />
                    <div className="h-1.5 bg-muted-foreground/20 rounded w-3/4" />
                    <div className="h-1.5 bg-muted-foreground/20 rounded w-5/6" />
                  </div>
                </motion.div>

                <motion.div
                  className="absolute w-20 h-28 bg-muted/50 rounded border border-border/40 transform rotate-6 top-8 right-8"
                  animate={{ rotate: [6, 10, 6] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  <div className="p-2 space-y-1">
                    <div className="h-1.5 bg-muted-foreground/20 rounded w-full" />
                    <div className="h-1.5 bg-muted-foreground/20 rounded w-2/3" />
                  </div>
                </motion.div>

                {/* Browser tabs mess */}
                <motion.div
                  className="absolute w-40 h-8 bg-muted/70 rounded-t border border-border/50 bottom-20 left-1/2 -translate-x-1/2 flex"
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex-1 border-r border-border/30 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                    </div>
                  ))}
                </motion.div>

                {/* Sticky notes */}
                <motion.div
                  className="absolute w-16 h-16 bg-yellow-500/20 rounded transform rotate-3 bottom-8 left-12"
                  animate={{ rotate: [3, 5, 3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className="absolute w-14 h-14 bg-pink-500/20 rounded transform -rotate-6 bottom-12 right-16"
                  animate={{ rotate: [-6, -8, -6] }}
                  transition={{ duration: 2.2, repeat: Infinity }}
                />

                {/* Center chaos icon */}
                <div className="relative z-10 w-20 h-20 rounded-full bg-destructive/20 border border-destructive/40 flex items-center justify-center">
                  <Brain className="w-10 h-10 text-destructive/60" />
                </div>
              </div>

              {/* Label */}
              <div className="text-center mt-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 border border-destructive/30">
                  <XCircle className="w-4 h-4 text-destructive" />
                  <span className="text-sm font-medium text-destructive">{t('whyCards.oldWay.label')}</span>
                </div>
              </div>

              {/* Problems list */}
              <div className="mt-6 space-y-2 text-sm text-muted-foreground">
                <p>→ {t('whyCards.oldWay.problem1')}</p>
                <p>→ {t('whyCards.oldWay.problem2')}</p>
                <p>→ {t('whyCards.oldWay.problem3')}</p>
              </div>
            </div>
          </motion.div>

          {/* Right: The Mycelium Way */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative p-6 rounded-xl bg-card/50 border border-primary/30 overflow-hidden">
              {/* Order visualization */}
              <div className="relative h-64 md:h-80 flex items-center justify-center">
                {/* Organized card grid */}
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-10 h-14 md:w-12 md:h-16 rounded border bg-card/80 flex items-center justify-center"
                      style={{
                        borderColor: i < 3 ? 'hsl(190 100% 50% / 0.5)' : 'hsl(var(--border) / 0.3)',
                        boxShadow: i < 3 ? '0 0 15px hsl(190 100% 50% / 0.3)' : 'none',
                      }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: i < 3 ? 'hsl(190 100% 50%)' : 'hsl(var(--muted-foreground) / 0.3)',
                        }}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Connecting lines (simplified) */}
                <div className="absolute inset-0 pointer-events-none opacity-30">
                  <svg className="w-full h-full" viewBox="0 0 200 200">
                    <motion.path
                      d="M50 80 L100 100 L150 80"
                      stroke="hsl(190 100% 50%)"
                      strokeWidth="1"
                      fill="none"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </svg>
                </div>
              </div>

              {/* Label */}
              <div className="text-center mt-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">{t('whyCards.newWay.label')}</span>
                </div>
              </div>

              {/* Benefits list */}
              <div className="mt-6 space-y-2 text-sm text-muted-foreground">
                <p className="text-foreground">→ {t('whyCards.newWay.benefit1')}</p>
                <p className="text-foreground">→ {t('whyCards.newWay.benefit2')}</p>
                <p className="text-foreground">→ {t('whyCards.newWay.benefit3')}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom tagline */}
        <motion.p
          className="text-center mt-12 text-lg text-muted-foreground max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          {t('whyCards.tagline')} <span className="text-primary font-medium">{t('whyCards.taglineHighlight')}</span>
          {t('whyCards.taglineEnd')}
        </motion.p>
      </div>
    </section>
  );
}