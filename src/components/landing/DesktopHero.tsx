import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { HeroMiniCards } from './HeroMiniCards';
import hero3dMockup from '@/assets/hero-3d-mockup.png';

export const DesktopHero = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className="relative z-10 min-h-screen flex items-center px-4 py-20 overflow-hidden">
      <div className="container mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left Column - Content */}
          <motion.div
            className="flex flex-col"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Main Headline - Same as Mobile */}
            <motion.h1
              className="text-5xl lg:text-6xl xl:text-7xl font-display font-bold mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <span className="text-foreground">{t('landing.mobile.hero.headline1')}</span>
              <br />
              <span className="text-primary text-glow">{t('landing.mobile.hero.headline2')}</span>
            </motion.h1>

            {/* Simple Subheadline */}
            <motion.p
              className="text-xl text-muted-foreground mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              {t('landing.mobile.hero.subline')}
            </motion.p>

            {/* Mini Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <HeroMiniCards />
            </motion.div>

            {/* CTA */}
            <motion.div
              className="mt-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Button 
                size="lg" 
                onClick={() => navigate("/auth")} 
                className="text-lg gap-2 px-10 py-6 cta-pulse"
              >
                <Zap className="h-5 w-5" />
                {t('landing.hero.cta')}
                <ArrowRight className="h-5 w-5" />
              </Button>

              <p className="mt-4 text-sm text-muted-foreground">
                {t('landing.hero.noCreditCard')}
              </p>
            </motion.div>
          </motion.div>

          {/* Right Column - 3D Mockup */}
          <motion.div
            className="relative flex items-center justify-center lg:justify-end"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* Glow background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-pulse" />
            </div>

            {/* Floating Image */}
            <motion.div
              className="relative z-10"
              animate={{ 
                y: [0, -15, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <img
                src={hero3dMockup}
                alt="Mycelium Cards Interface"
                className="w-full max-w-2xl xl:max-w-4xl -scale-x-100 drop-shadow-2xl"
                style={{
                  filter: 'drop-shadow(0 25px 50px rgba(var(--primary-rgb), 0.3))'
                }}
              />
              
              {/* Subtle reflection */}
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
            </motion.div>

            {/* Decorative elements */}
            <motion.div
              className="absolute top-10 right-10 w-4 h-4 bg-primary rounded-full"
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-20 left-10 w-3 h-3 bg-accent rounded-full"
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.8, 0.3]
              }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
            />
            <motion.div
              className="absolute top-1/3 left-5 w-2 h-2 bg-secondary rounded-full"
              animate={{ 
                scale: [1, 1.4, 1],
                opacity: [0.4, 0.9, 0.4]
              }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
