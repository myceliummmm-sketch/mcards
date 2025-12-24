import { motion } from 'framer-motion';
import { ArrowRight, Users, Send, Sparkles, Target, Zap, Shield, Compass, Lightbulb, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import passportMockup from '@/assets/passport-mockup.png';
import myceliumBg from '@/assets/mycelium-network.gif';

interface PortalHeroProps {
  memberCount: number | null;
  onInitialize: () => void;
}

export function PortalHero({ memberCount, onInitialize }: PortalHeroProps) {
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
                  {memberCount.toLocaleString()} founders already in
                </span>
              </motion.div>
              )}

              {/* Main headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground leading-tight mb-6">
                THE SOLO GRIND
                <br />
                <span className="text-primary">IS DEAD.</span>
                <br />
                <span className="text-foreground/90">JOIN THE LIVING NETWORK.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl">
                Get your Digital Passport. Unlock AI-powered research. 
                Build with a network that grows with you.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  onClick={onInitialize}
                  size="lg"
                  className="group bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-primary shadow-[4px_4px_0_hsl(var(--primary)/0.5)] hover:shadow-[2px_2px_0_hsl(var(--primary)/0.5)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all min-h-14 text-lg font-bold"
                >
                  INITIALIZE MY PASSPORT
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
                    Join Telegram
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
              WHAT IS <span className="text-primary">MYCELIUM</span>?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A living network of independent builders who validate ideas together before investing time and money.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: Sparkles,
                title: "AI Research Team",
                description: "7 AI experts analyze your idea from different angles — market, tech, audience, competition."
              },
              {
                icon: Target,
                title: "Problem Discovery",
                description: "Find real pain points in 60 seconds. No more building solutions nobody needs."
              },
              {
                icon: Zap,
                title: "Living Network",
                description: "Learn from others' insights and mistakes. Share your discoveries. Grow together."
              }
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
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
              FOR <span className="text-primary">WHOM</span>?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built for people who want to validate before they build.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: Compass,
                title: "Solo Founders",
                description: "No budget for market research? Get AI-powered validation that would cost thousands at agencies."
              },
              {
                icon: Shield,
                title: "Side Hustlers",
                description: "Building after your 9-5? Don't waste precious hours on ideas that won't work."
              },
              {
                icon: Lightbulb,
                title: "No-Code Builders",
                description: "Before you start building, know if your idea has real potential."
              }
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4 mx-auto">
                  <item.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
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
              HOW IT <span className="text-primary">WORKS</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                icon: Users,
                title: "Get Your Passport",
                description: "Answer a few questions to discover your founder archetype."
              },
              {
                step: "02",
                icon: Target,
                title: "Create Problem Card",
                description: "Describe the pain you want to solve. Be specific about who suffers."
              },
              {
                step: "03",
                icon: Sparkles,
                title: "AI Council Analyzes",
                description: "Your AI team researches market, competition, and validates demand."
              },
              {
                step: "04",
                icon: Rocket,
                title: "Build with Confidence",
                description: "Start building knowing your idea has real potential."
              }
            ].map((item, index) => (
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
                  <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
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
              START YOUR JOURNEY
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
