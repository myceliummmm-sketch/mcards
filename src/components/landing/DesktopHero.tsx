import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { TEAM_CHARACTERS } from '@/data/teamCharacters';

// Import separate hero panel images
import heroAiTeamPanel from '@/assets/hero-ai-team-panel.png';
import heroMainCards from '@/assets/hero-main-cards.png';
import heroGenerateButton from '@/assets/hero-generate-button.png';
// Import phase icons
import visionIcon from '@/assets/icons/vision.png';
import researchIcon from '@/assets/icons/research.png';
import buildIcon from '@/assets/icons/build.png';
import growIcon from '@/assets/icons/grow.png';

const ROADMAP_PHASES = [
  { id: 'vision', label: 'Vision', icon: visionIcon, color: 'hsl(280 70% 60%)' },
  { id: 'research', label: 'Research', icon: researchIcon, color: 'hsl(190 100% 50%)' },
  { id: 'build', label: 'Build', icon: buildIcon, color: 'hsl(140 70% 50%)' },
  { id: 'grow', label: 'Grow', icon: growIcon, color: 'hsl(45 90% 55%)' },
];

const teamCharactersArray = Object.values(TEAM_CHARACTERS);

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
            {/* Main Headline */}
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

            {/* Team Avatars Row */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-sm text-muted-foreground mb-3">Your AI Team:</p>
              <div className="flex items-center gap-2">
                {teamCharactersArray.map((char, index) => (
                  <motion.div
                    key={char.id}
                    className="relative group"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.08, type: "spring" }}
                  >
                    <div
                      className="w-12 h-12 rounded-full overflow-hidden border-2 transition-all duration-300 group-hover:scale-110 group-hover:z-10"
                      style={{ 
                        borderColor: char.color,
                        boxShadow: `0 0 15px ${char.color.replace(')', ' / 0.3)')}` 
                      }}
                    >
                      <img
                        src={char.avatar}
                        alt={char.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                      <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-lg px-3 py-2 text-center whitespace-nowrap">
                        <p className="text-sm font-medium" style={{ color: char.color }}>{char.name}</p>
                        <p className="text-xs text-muted-foreground">{char.role}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Simple Validation Roadmap */}
            <motion.div
              className="mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <p className="text-sm text-muted-foreground mb-3">Your Validation Roadmap:</p>
              <div className="flex items-center gap-2">
                {ROADMAP_PHASES.map((phase, index) => (
                  <motion.div
                    key={phase.id}
                    className="flex items-center"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                  >
                    <div
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card/60 border border-border/50 hover:border-primary/30 transition-colors"
                      style={{ 
                        boxShadow: `0 0 20px ${phase.color.replace(')', ' / 0.1)')}` 
                      }}
                    >
                      <img src={phase.icon} alt={phase.label} className="w-6 h-6" />
                      <span className="text-sm font-medium text-foreground">{phase.label}</span>
                    </div>
                    {index < ROADMAP_PHASES.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-muted-foreground mx-1" />
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
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

          {/* Right Column - 3 Independently Floating Panels */}
          <div className="absolute right-0 top-[15%] w-[70vw] h-[80vh] pointer-events-none z-0">
            {/* Glow background */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
            </div>

            {/* Layer 1: AI Team Panel - SLOWEST float */}
            <motion.div
              className="absolute"
              style={{ top: '8%', right: '12%', zIndex: 1 }}
              initial={{ opacity: 0, x: 100 }}
              animate={{ 
                opacity: 1, 
                x: 0,
                y: [0, -12, 0] 
              }}
              transition={{
                opacity: { duration: 1, delay: 0.5 },
                x: { duration: 1, delay: 0.5 },
                y: { duration: 8, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <img 
                src={heroAiTeamPanel} 
                alt="AI Team Panel" 
                className="w-[280px] drop-shadow-2xl"
                style={{
                  filter: 'drop-shadow(0 20px 40px hsl(var(--primary) / 0.3))'
                }}
              />
            </motion.div>

            {/* Layer 2: Main Cards - STANDARD float */}
            <motion.div
              className="absolute"
              style={{ top: '10%', right: '-5%', zIndex: 2 }}
              initial={{ opacity: 0, x: 100 }}
              animate={{ 
                opacity: 1, 
                x: 0,
                y: [0, -20, 0] 
              }}
              transition={{
                opacity: { duration: 1, delay: 0.3 },
                x: { duration: 1, delay: 0.3 },
                y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <img 
                src={heroMainCards} 
                alt="Deck Cards" 
                className="w-[650px] drop-shadow-2xl"
                style={{
                  filter: 'drop-shadow(0 30px 60px hsl(var(--primary) / 0.4))'
                }}
              />
            </motion.div>

            {/* Layer 3: Generate Website Button - CONTRARY float + GLOW PULSE */}
            <motion.div
              className="absolute"
              style={{ top: '25%', right: '12%', zIndex: 3 }}
              initial={{ opacity: 0, x: 100 }}
              animate={{ 
                opacity: 1, 
                x: 0,
                y: [0, 15, 0],
                filter: [
                  'drop-shadow(0 0 20px hsl(var(--primary) / 0.4))',
                  'drop-shadow(0 0 40px hsl(var(--primary) / 0.8))',
                  'drop-shadow(0 0 20px hsl(var(--primary) / 0.4))'
                ]
              }}
              transition={{
                opacity: { duration: 1, delay: 0.7 },
                x: { duration: 1, delay: 0.7 },
                y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                filter: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <img 
                src={heroGenerateButton} 
                alt="Generate Website" 
                className="w-[220px]"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
