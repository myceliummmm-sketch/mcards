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
            className="flex flex-col z-20 relative"
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

          {/* Right Column - MASSIVE 3D Mockup */}
          <motion.div
            className="absolute right-0 top-1/2 -translate-y-1/2 w-[70vw] pointer-events-none z-0"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            {/* Glow background */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
            </div>

            {/* Floating Image */}
            <motion.div
              className="relative"
              animate={{ 
                y: [0, -20, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <img
                src={hero3dMockup}
                alt="Mycelium Cards Interface"
                className="w-full rotate-180 drop-shadow-2xl"
                style={{
                  filter: 'drop-shadow(0 30px 60px hsl(var(--primary) / 0.4))'
                }}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
