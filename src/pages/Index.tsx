import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Users, MessageSquare, Trophy, ShoppingBag, ArrowRight, Globe, Target, Search, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { TEAM_CHARACTERS } from "@/data/teamCharacters";
import { CardMosaic } from "@/components/landing/CardMosaic";
import { WhyCardsSection } from "@/components/landing/WhyCardsSection";
import { FogOfWarJourney } from "@/components/landing/FogOfWarJourney";
import { SocialProofSection } from "@/components/landing/SocialProofSection";
import { InteractiveCardDemo } from "@/components/landing/InteractiveCardDemo";
import { PainPointsCarousel } from "@/components/landing/PainPointsCarousel";
import { useTranslation } from "@/hooks/useTranslation";

const Index = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useTranslation();

  useEffect(() => {
    // Check existing session
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    // Listen for auth state changes (handles OAuth redirect landing here)
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/dashboard");
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const characters = Object.values(TEAM_CHARACTERS);

  const features = [
    {
      icon: Sparkles,
      titleKey: "landing.features.cardSystem.title",
      descriptionKey: "landing.features.cardSystem.description",
      color: "text-primary"
    },
    {
      icon: Users,
      titleKey: "landing.features.aiGuidance.title",
      descriptionKey: "landing.features.aiGuidance.description",
      color: "text-secondary"
    },
    {
      icon: MessageSquare,
      titleKey: "landing.features.groupChat.title",
      descriptionKey: "landing.features.groupChat.description",
      color: "text-accent"
    },
    {
      icon: Zap,
      titleKey: "landing.features.cardForging.title",
      descriptionKey: "landing.features.cardForging.description",
      color: "text-primary"
    },
    {
      icon: Trophy,
      titleKey: "landing.features.evaluation.title",
      descriptionKey: "landing.features.evaluation.description",
      color: "text-secondary"
    },
    {
      icon: ShoppingBag,
      titleKey: "landing.features.marketplace.title",
      descriptionKey: "landing.features.marketplace.description",
      color: "text-accent"
    }
  ];

  const howItWorks = [
    {
      step: 1,
      titleKey: "landing.howItWorks.step1.title",
      descriptionKey: "landing.howItWorks.step1.description",
      weekKey: "landing.howItWorks.step1.week",
      color: "primary",
      icon: Target
    },
    {
      step: 2,
      titleKey: "landing.howItWorks.step2.title",
      descriptionKey: "landing.howItWorks.step2.description",
      weekKey: "landing.howItWorks.step2.week",
      color: "secondary",
      icon: Search
    },
    {
      step: 3,
      titleKey: "landing.howItWorks.step3.title",
      descriptionKey: "landing.howItWorks.step3.description",
      weekKey: "landing.howItWorks.step3.week",
      color: "accent",
      icon: DollarSign
    }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Language Toggle - Fixed in top right */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLanguage(language === 'en' ? 'ru' : 'en')}
          className="gap-2 bg-background/80 backdrop-blur-sm border-border/50 hover:border-primary/50"
        >
          <Globe className="h-4 w-4" />
          {language === 'en' ? '🇷🇺 RU' : '🇬🇧 EN'}
        </Button>
      </div>

      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0.1, 0.4, 0.1],
              y: [0, -20, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          {/* Main Headline */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-4">
              <span className="text-foreground">{t('landing.hero.headline1')}</span>
              <br />
              <span className="text-primary text-glow">{t('landing.hero.headline2')}</span>
            </h1>
          </motion.div>

          {/* Subheadline - Pain + Solution */}
          <motion.div
            className="text-center mb-12 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <p className="text-lg md:text-xl text-muted-foreground mb-2">
              {t('landing.hero.subheadline')}
            </p>
            <p className="text-lg md:text-xl text-destructive font-medium mb-4">
              {t('landing.hero.blindSpots')}
            </p>
            <p className="text-xl md:text-2xl text-primary font-semibold">
              {t('landing.hero.cardSystem')}
            </p>
            <p className="text-muted-foreground mt-2">
              {t('landing.hero.toReveal')}
            </p>
          </motion.div>

          {/* Card Mosaic Visualization */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <CardMosaic />
          </motion.div>

          {/* CTA */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <Button size="lg" onClick={() => navigate("/auth")} className="text-lg gap-2 px-10 py-6 cta-pulse">
              <Zap className="h-5 w-5" />
              {t('landing.hero.cta')}
              <ArrowRight className="h-5 w-5" />
            </Button>

            <p className="mt-4 text-sm text-muted-foreground">
              {t('landing.hero.noCreditCard')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pain Points Carousel - NEW */}
      <PainPointsCarousel />

      {/* Why Cards Section */}
      <WhyCardsSection />

      {/* Interactive Card Demo */}
      <InteractiveCardDemo />

      {/* Fog of War Journey */}
      <FogOfWarJourney />

      {/* AI Team Showcase */}
      <section className="relative z-10 py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              {t('landing.aiTeam.title')} <span className="text-destructive">{t('landing.aiTeam.noYesMen')}</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              {t('landing.aiTeam.description')}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
            {characters.map((character, index) => (
              <motion.div
                key={character.id}
                className="group relative"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 text-center">
                  <div
                    className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden border-2 group-hover:scale-110 transition-transform"
                    style={{ borderColor: character.color }}
                  >
                    <img src={character.avatar} alt={character.name} className="w-full h-full object-cover" />
                  </div>

                  <h4 className="font-display font-semibold text-sm mb-1">{character.name}</h4>
                  <p className="text-xs text-muted-foreground">{character.role}</p>

                  {/* Hover tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg max-w-xs">
                      <p className="text-xs italic text-muted-foreground">"{character.tagline}"</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-24 px-4 bg-gradient-to-b from-background via-muted/20 to-background">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">{t('landing.features.title')}</h2>
            <p className="text-muted-foreground text-lg">{t('landing.features.subtitle')}</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.titleKey}
                className="p-6 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm card-shine hover:border-primary/50 transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={`w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center mb-4 ${feature.color}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-2">{t(feature.titleKey)}</h3>
                <p className="text-muted-foreground">{t(feature.descriptionKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">{t('landing.howItWorks.title')}</h2>
            <p className="text-muted-foreground text-lg">{t('landing.howItWorks.subtitle')}</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((item, index) => (
              <motion.div
                key={item.step}
                className="relative text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-${item.color}/20 border-2 border-${item.color} flex items-center justify-center`}>
                  <item.icon className={`w-8 h-8 text-${item.color}`} />
                </div>
                <span className="inline-block px-3 py-1 rounded-full bg-muted/50 text-xs text-muted-foreground mb-2">
                  {t(item.weekKey)}
                </span>
                <h3 className={`text-xl font-display font-bold mb-2 text-${item.color}`}>{t(item.titleKey)}</h3>
                <p className="text-muted-foreground text-sm">{t(item.descriptionKey)}</p>

                {/* Connector line */}
                {index < 2 && <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-border to-transparent" />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <SocialProofSection />

      {/* Stats */}
      <section className="relative z-10 py-16 px-4 bg-gradient-to-b from-background via-muted/20 to-background">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "21", labelKey: "landing.stats.cards" },
              { value: "7", labelKey: "landing.stats.advisors" },
              { value: "4", labelKey: "landing.stats.phases" },
              { value: "∞", labelKey: "landing.stats.possibilities" }
            ].map((stat, index) => (
              <motion.div
                key={stat.labelKey}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <p className="text-4xl md:text-5xl font-display font-bold text-primary text-glow mb-2">{stat.value}</p>
                <p className="text-muted-foreground">{t(stat.labelKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-24 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
              {t('landing.finalCta.title')}
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              {t('landing.finalCta.subtitle')}
            </p>

            <Button size="lg" onClick={() => navigate("/auth")} className="text-lg gap-2 hover:scale-105 transition-transform card-glow px-10 py-6">
              <Zap className="h-6 w-6" />
              {t('landing.finalCta.cta')}
              <ArrowRight className="h-6 w-6" />
            </Button>

            <p className="mt-6 text-sm text-muted-foreground">
              {t('landing.finalCta.free')}
            </p>

            <p className="mt-4 text-muted-foreground">
              {t('landing.finalCta.hasAccount')}{" "}
              <button onClick={() => navigate("/auth")} className="text-primary hover:underline">
                {t('landing.finalCta.signIn')}
              </button>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer gradient */}
      <div className="h-32 bg-gradient-to-t from-muted/30 to-transparent" />
    </div>
  );
};

export default Index;
