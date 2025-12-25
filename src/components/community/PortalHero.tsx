import { motion } from 'framer-motion';
import { ArrowRight, Users, Send, Sparkles, Target, Zap, Shield, Compass, Lightbulb, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import passportMockup from '@/assets/passport-mockup.png';
import myceliumBg from '@/assets/mycelium-network.gif';

interface PortalHeroProps {
  memberCount: number | null;
  onInitialize: () => void;
}

export function PortalHero({ memberCount, onInitialize }: PortalHeroProps) {
  const { t } = useTranslation();

  const whatIsMyceliumFeatures = [
    {
      icon: Sparkles,
      titleKey: 'portal.landing.aiResearchTeam',
      descKey: 'portal.landing.aiResearchDesc'
    },
    {
      icon: Target,
      titleKey: 'portal.landing.problemDiscovery',
      descKey: 'portal.landing.problemDiscoveryDesc'
    },
    {
      icon: Zap,
      titleKey: 'portal.landing.livingNetwork',
      descKey: 'portal.landing.livingNetworkDesc'
    }
  ];

  const forWhomFeatures = [
    {
      icon: Compass,
      titleKey: 'portal.landing.soloFounders',
      descKey: 'portal.landing.soloFoundersDesc'
    },
    {
      icon: Shield,
      titleKey: 'portal.landing.sideHustlers',
      descKey: 'portal.landing.sideHustlersDesc'
    },
    {
      icon: Lightbulb,
      titleKey: 'portal.landing.noCodeBuilders',
      descKey: 'portal.landing.noCodeBuildersDesc'
    }
  ];

  const howItWorksSteps = [
    {
      step: "01",
      icon: Users,
      titleKey: 'portal.landing.step1Title',
      descKey: 'portal.landing.step1Desc'
    },
    {
      step: "02",
      icon: Target,
      titleKey: 'portal.landing.step2Title',
      descKey: 'portal.landing.step2Desc'
    },
    {
      step: "03",
      icon: Sparkles,
      titleKey: 'portal.landing.step3Title',
      descKey: 'portal.landing.step3Desc'
    },
    {
      step: "04",
      icon: Rocket,
      titleKey: 'portal.landing.step4Title',
      descKey: 'portal.landing.step4Desc'
    }
  ];

  return (
    <div className="relative">
      {/* Hero Section - Full Screen */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${myceliumBg})` }}
        />
        <div className="absolute inset-0 bg-background/80" />
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            {/* Left side - Text content */}
            <motion.div 
              className="flex-1 text-center lg:text-left"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Member count badge */}
              {memberCount !== null && (
              <motion.div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/40 mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary font-medium">
                  {memberCount.toLocaleString()} {t('portal.hero.membersCount')}
                </span>
              </motion.div>
              )}

              {/* Main headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground leading-tight mb-6">
                {t('portal.hero.headline1')}
                <br />
                <span className="text-primary">{t('portal.hero.headline2')}</span>
                <br />
                <span className="text-foreground/90">{t('portal.hero.headline3')}</span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl">
                {t('portal.hero.subtitle')}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  onClick={onInitialize}
                  size="lg"
                  className="group bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-primary shadow-[4px_4px_0_hsl(var(--primary)/0.5)] hover:shadow-[2px_2px_0_hsl(var(--primary)/0.5)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all min-h-14 text-lg font-bold"
                >
                  {t('portal.hero.cta')}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-2 border-border text-foreground hover:bg-accent min-h-14"
                >
                  <a 
                    href="https://t.me/mycelium_dao" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center"
                  >
                    <Send className="mr-2 w-5 h-5" />
                    {t('portal.hero.joinTelegram')}
                  </a>
                </Button>
              </div>
            </motion.div>

            {/* Right side - Passport mockup */}
            <motion.div 
              className="flex-1 flex justify-center lg:justify-end"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.div
                className="relative"
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 2, 0]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                {/* Glow effect */}
                <div className="absolute inset-0 blur-3xl bg-primary/30 rounded-3xl scale-110" />
                
                {/* Passport image */}
                <img 
                  src={passportMockup} 
                  alt="Mycelium Digital Passport" 
                  className="relative z-10 w-full max-w-md lg:max-w-lg drop-shadow-2xl"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
            <div className="w-1 h-2 bg-muted-foreground/50 rounded-full" />
          </div>
        </motion.div>
      </div>

      {/* What is Mycelium Section */}
      <section className="relative py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
              {t('portal.landing.whatIsMycelium')} <span className="text-primary">{t('portal.landing.mycelium')}</span>?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('portal.landing.whatIsDesc')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {whatIsMyceliumFeatures.map((item, index) => (
              <motion.div
                key={item.titleKey}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{t(item.titleKey)}</h3>
                <p className="text-muted-foreground">{t(item.descKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* For Whom Section */}
      <section className="relative py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
              {t('portal.landing.forWhom')} <span className="text-primary">{t('portal.landing.whom')}</span>?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('portal.landing.forWhomDesc')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {forWhomFeatures.map((item, index) => (
              <motion.div
                key={item.titleKey}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4 mx-auto">
                  <item.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{t(item.titleKey)}</h3>
                <p className="text-muted-foreground">{t(item.descKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
              {t('portal.landing.howItWorks')} <span className="text-primary">{t('portal.landing.works')}</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {howItWorksSteps.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-border" />
                )}
                <div className="relative z-10 bg-card border border-border rounded-2xl p-6 h-full">
                  <span className="text-4xl font-black text-primary/30">{item.step}</span>
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center my-3">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{t(item.titleKey)}</h3>
                  <p className="text-sm text-muted-foreground">{t(item.descKey)}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-16"
          >
            <Button
              onClick={onInitialize}
              size="lg"
              className="group bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-primary shadow-[4px_4px_0_hsl(var(--primary)/0.5)] hover:shadow-[2px_2px_0_hsl(var(--primary)/0.5)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all min-h-14 text-lg font-bold"
            >
              {t('portal.landing.startJourney')}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
