import { motion } from "framer-motion";
import { ArrowRight, Users, Zap, Target, DollarSign, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { getAllCharacters, Language } from "@/data/teamCharacters";

// Mobile Team Section - compact AI team showcase
export const MobileTeamSection = () => {
  const { t, language } = useTranslation();
  const characters = getAllCharacters(language as Language);
  
  return (
    <section className="py-12 px-4 bg-card/30">
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="text-xl font-display font-bold mb-2">
          {t('landing.aiTeam.title')} <span className="text-primary">{t('landing.aiTeam.noYesMen')}</span>
        </h2>
        <p className="text-sm text-muted-foreground px-4">
          {t('landing.aiTeam.description')}
        </p>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-3">
        {characters.slice(0, 7).map((character, index) => (
          <motion.div
            key={character.id}
            className="flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
          >
            <div 
              className="w-12 h-12 rounded-full border-2 overflow-hidden mb-1"
              style={{ borderColor: character.color }}
            >
              <img 
                src={character.avatar} 
                alt={character.name}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-[10px] text-muted-foreground">{character.name}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// Mobile How It Works - 3 steps
export const MobileHowItWorks = () => {
  const { t } = useTranslation();
  
  const steps = [
    { icon: Target, key: 'step1', color: 'hsl(190 100% 50%)' },
    { icon: Zap, key: 'step2', color: 'hsl(280 70% 60%)' },
    { icon: DollarSign, key: 'step3', color: 'hsl(140 70% 50%)' },
  ];

  return (
    <section className="py-12 px-4">
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="text-xl font-display font-bold mb-2">
          {t('landing.howItWorks.title')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('landing.howItWorks.subtitle')}
        </p>
      </motion.div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <motion.div
            key={step.key}
            className="flex items-start gap-4 p-4 rounded-xl bg-card/50 border border-border/50"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${step.color.replace(')', ' / 0.2)')}` }}
            >
              <step.icon className="w-5 h-5" style={{ color: step.color }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-muted-foreground">{t(`landing.howItWorks.${step.key}.week`)}</span>
              </div>
              <h3 className="font-bold text-base mb-1" style={{ color: step.color }}>
                {t(`landing.howItWorks.${step.key}.title`)}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t(`landing.howItWorks.${step.key}.description`)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// Mobile Social Proof - compact stats and testimonials
export const MobileSocialProof = () => {
  const { t, language } = useTranslation();

  const testimonials = [
    {
      quote: { en: "Saved 3 months by killing a bad idea", ru: "Сэкономил 3 месяца", es: "Ahorré 3 meses" },
      author: "Alex K.",
      outcome: { en: "$15K saved", ru: "Сэкономлено $15K", es: "$15K ahorrados" },
      color: "hsl(190 100% 50%)"
    },
    {
      quote: { en: "First paying customer before writing code", ru: "Первый клиент до кода", es: "Primer cliente antes del código" },
      author: "Maria S.",
      outcome: { en: "$500 pre-sale", ru: "Предпродажа $500", es: "Preventa $500" },
      color: "hsl(140 70% 50%)"
    },
  ];

  return (
    <section className="py-12 px-4 bg-card/30">
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="text-xl font-display font-bold mb-2">
          {t('socialProof.title')}
        </h2>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="grid grid-cols-3 gap-2 mb-6 p-4 rounded-xl bg-card/50 border border-border/50"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="text-center">
          <p className="text-lg font-bold text-primary">{t('socialProof.stats.validated')}</p>
          <p className="text-[10px] text-muted-foreground">{t('socialProof.stats.validatedLabel')}</p>
        </div>
        <div className="text-center border-x border-border/30">
          <p className="text-lg font-bold text-destructive">{t('socialProof.stats.saved')}</p>
          <p className="text-[10px] text-muted-foreground">{t('socialProof.stats.savedLabel')}</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-accent">{t('socialProof.stats.customers')}</p>
          <p className="text-[10px] text-muted-foreground">{t('socialProof.stats.customersLabel')}</p>
        </div>
      </motion.div>

      {/* Testimonials */}
      <div className="space-y-3">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={testimonial.author}
            className="p-4 rounded-xl bg-card/50 border border-border/50"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <div 
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium mb-2"
              style={{ 
                backgroundColor: `${testimonial.color.replace(')', ' / 0.15)')}`,
                color: testimonial.color 
              }}
            >
              <CheckCircle className="w-3 h-3" />
              {testimonial.outcome[language as 'en' | 'ru' | 'es'] || testimonial.outcome.en}
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              "{testimonial.quote[language as 'en' | 'ru' | 'es'] || testimonial.quote.en}"
            </p>
            <p className="text-xs text-muted-foreground">— {testimonial.author}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// Mobile Bottom CTA
interface MobileBottomCTAProps {
  trackEvent?: (eventType: string, metadata?: Record<string, unknown>) => void;
}

export const MobileBottomCTA = ({ trackEvent }: MobileBottomCTAProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleCtaClick = () => {
    trackEvent?.('cta_click', { location: 'bottom', destination: '/quiz2' });
    navigate("/quiz2");
  };

  return (
    <section className="py-12 px-4 pb-20">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="text-xl font-display font-bold mb-3">
          {t('landing.finalCta.title')}
        </h2>
        <p className="text-sm text-muted-foreground mb-6 px-4">
          {t('landing.finalCta.subtitle')}
        </p>

        <Button
          size="lg"
          onClick={handleCtaClick}
          className="w-full max-w-[300px] text-sm gap-2 py-5 cta-pulse"
        >
          <span>{t('landing.finalCta.cta')}</span>
          <ArrowRight className="h-4 w-4 flex-shrink-0" />
        </Button>

        <p className="mt-4 text-[11px] text-muted-foreground">
          {t('landing.finalCta.free')}
        </p>

        <div className="mt-6 text-sm text-muted-foreground">
          {t('landing.finalCta.hasAccount')}{' '}
          <button 
            onClick={() => navigate('/auth')}
            className="text-primary hover:underline"
          >
            {t('landing.finalCta.signIn')}
          </button>
        </div>

        {/* Real Humans Community Link */}
        <div className="mt-4">
          <a
            href="https://mycelium.gg"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <Users className="w-3 h-3" />
            {t('landing.community.bottomLink')}
          </a>
        </div>
      </motion.div>
    </section>
  );
};
