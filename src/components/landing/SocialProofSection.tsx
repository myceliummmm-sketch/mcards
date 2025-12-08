import { motion } from "framer-motion";
import { Star, TrendingUp, Lightbulb } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const EXAMPLE_CARDS = [
  {
    title: "SaaS Pricing Model",
    phase: "Research",
    phaseColor: "hsl(280 70% 60%)",
    insight: "Discovered that usage-based pricing converts 3x better than flat-rate for our target segment.",
    author: "Sarah K.",
    rating: 4.8,
    icon: TrendingUp
  },
  {
    title: "MVP Feature List",
    phase: "Build",
    phaseColor: "hsl(200 70% 50%)",
    insight: "Cut 12 'must-have' features down to 3 core ones. Launched 2 months early.",
    author: "Marcus T.",
    rating: 4.9,
    icon: Lightbulb
  },
  {
    title: "Growth Flywheel",
    phase: "Grow",
    phaseColor: "hsl(140 70% 50%)",
    insight: "Mapped the viral loop that drove 40% of our sign-ups from user referrals.",
    author: "Elena R.",
    rating: 5.0,
    icon: Star
  }
];

export const SocialProofSection = () => {
  const { t } = useTranslation();

  return (
    <section className="relative z-10 py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            {t('socialProof.title')}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t('socialProof.subtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {EXAMPLE_CARDS.map((card, index) => (
            <motion.div
              key={card.title}
              className="relative group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="h-full p-6 rounded-xl bg-card/80 border border-border/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300">
                {/* Phase badge */}
                <div 
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mb-4"
                  style={{ 
                    backgroundColor: `${card.phaseColor.replace(')', ' / 0.2)')}`,
                    color: card.phaseColor 
                  }}
                >
                  <card.icon className="w-3 h-3" />
                  {card.phase}
                </div>

                {/* Card title */}
                <h3 className="text-xl font-display font-semibold mb-3 text-foreground">
                  {card.title}
                </h3>

                {/* Insight quote */}
                <div className="relative mb-4">
                  <div className="absolute -left-2 top-0 text-4xl text-primary/20 font-serif">"</div>
                  <p className="text-muted-foreground text-sm italic pl-4">
                    {card.insight}
                  </p>
                </div>

                {/* Author & Rating */}
                <div className="flex items-center justify-between pt-4 border-t border-border/30">
                  <span className="text-sm text-muted-foreground">
                    — {card.author}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium text-foreground">{card.rating}</span>
                  </div>
                </div>
              </div>

              {/* Glow effect on hover */}
              <div 
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl"
                style={{ backgroundColor: `${card.phaseColor.replace(')', ' / 0.1)')}` }}
              />
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.p
          className="text-center mt-12 text-muted-foreground"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <span className="text-primary font-medium">1,000+</span> {t('socialProof.decksCreated')}
        </motion.p>
      </div>
    </section>
  );
};