import { motion } from "framer-motion";
import { Star, Clock, XCircle, DollarSign, CheckCircle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const TESTIMONIALS = [
  {
    quote: {
      en: "Saved 3 months by killing a bad idea in Week 1",
      ru: "Сэкономил 3 месяца, убив плохую идею на первой неделе"
    },
    author: "Alex K.",
    role: { en: "Solo Founder", ru: "Соло-фаундер" },
    outcome: { en: "Avoided $15K loss", ru: "Избежал потери $15K" },
    icon: Clock,
    color: "hsl(190 100% 50%)"
  },
  {
    quote: {
      en: "Found my first paying customer before writing code",
      ru: "Нашёл первого платящего клиента до написания кода"
    },
    author: "Maria S.",
    role: { en: "No-Code Builder", ru: "No-Code билдер" },
    outcome: { en: "$500 pre-sale", ru: "Предпродажа $500" },
    icon: DollarSign,
    color: "hsl(140 70% 50%)"
  },
  {
    quote: {
      en: "Used my deck to raise $50K pre-seed from angels",
      ru: "Использовал колоду для привлечения $50K pre-seed"
    },
    author: "David T.",
    role: { en: "Student → Founder", ru: "Студент → Фаундер" },
    outcome: { en: "$50K raised", ru: "Привлёк $50K" },
    icon: Star,
    color: "hsl(280 70% 60%)"
  }
];

export const SocialProofSection = () => {
  const { t, language } = useTranslation();

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

        {/* Stats Bar */}
        <motion.div
          className="grid grid-cols-3 gap-4 mb-12 p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-display font-bold text-primary">
              {t('socialProof.stats.validated')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('socialProof.stats.validatedLabel')}
            </p>
          </div>
          <div className="text-center border-x border-border/50">
            <p className="text-2xl md:text-3xl font-display font-bold text-destructive">
              {t('socialProof.stats.saved')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('socialProof.stats.savedLabel')}
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-display font-bold text-accent">
              {t('socialProof.stats.customers')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('socialProof.stats.customersLabel')}
            </p>
          </div>
        </motion.div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              className="relative group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="h-full p-6 rounded-xl bg-card/80 border border-border/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300">
                {/* Outcome badge */}
                <div 
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium mb-4"
                  style={{ 
                    backgroundColor: `${testimonial.color.replace(')', ' / 0.15)')}`,
                    color: testimonial.color 
                  }}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  {testimonial.outcome[language]}
                </div>

                {/* Quote */}
                <div className="relative mb-6">
                  <div className="absolute -left-2 -top-2 text-4xl text-primary/20 font-serif">"</div>
                  <p className="text-lg font-medium text-foreground pl-4">
                    {testimonial.quote[language]}
                  </p>
                </div>

                {/* Author & Role */}
                <div className="flex items-center gap-3 pt-4 border-t border-border/30">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${testimonial.color.replace(')', ' / 0.2)')}` }}
                  >
                    <testimonial.icon className="w-5 h-5" style={{ color: testimonial.color }} />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role[language]}</p>
                  </div>
                </div>
              </div>

              {/* Glow effect on hover */}
              <div 
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl"
                style={{ backgroundColor: `${testimonial.color.replace(')', ' / 0.1)')}` }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
