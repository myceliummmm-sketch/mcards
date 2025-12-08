import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Users, MessageSquare, Trophy, ShoppingBag, ArrowRight, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { TEAM_CHARACTERS } from "@/data/teamCharacters";
import { CardMosaic } from "@/components/landing/CardMosaic";
import { WhyCardsSection } from "@/components/landing/WhyCardsSection";
import { FogOfWarJourney } from "@/components/landing/FogOfWarJourney";
import { SocialProofSection } from "@/components/landing/SocialProofSection";
import { InteractiveCardDemo } from "@/components/landing/InteractiveCardDemo";
const Index = () => {
  const navigate = useNavigate();
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
  const features = [{
    icon: Sparkles,
    title: "22-Card System",
    description: "Structured framework covering all product phases from vision to growth",
    color: "text-primary"
  }, {
    icon: Users,
    title: "AI Guidance",
    description: "Each card has assigned AI helpers providing context-aware feedback",
    color: "text-secondary"
  }, {
    icon: MessageSquare,
    title: "Group Chat",
    description: "Host team meetings with multiple AI advisors responding in sequence",
    color: "text-accent"
  }, {
    icon: Zap,
    title: "Card Forging",
    description: "Craft cards with AI assistance and watch them come to life",
    color: "text-primary"
  }, {
    icon: Trophy,
    title: "Evaluation",
    description: "Your AI team scores each card for depth, clarity & impact",
    color: "text-secondary"
  }, {
    icon: ShoppingBag,
    title: "Marketplace",
    description: "Trade cards with other builders and find the missing pieces",
    color: "text-accent"
  }];
  return <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => <motion.div key={i} className="absolute w-1 h-1 bg-primary rounded-full" initial={{
        opacity: 0
      }} animate={{
        opacity: [0.1, 0.4, 0.1],
        y: [0, -20, 0]
      }} transition={{
        duration: 3 + Math.random() * 2,
        repeat: Infinity,
        delay: Math.random() * 3
      }} style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`
      }} />)}
      </div>

      {/* Hero Section - Renovated */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          {/* Main Headline */}
          <motion.div className="text-center mb-8" initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8
        }}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-4">
              <span className="text-foreground">You Don't Know</span>
              <br />
              <span className="text-primary text-glow">What You Don't Know.</span>
              <br />
              <span className="text-secondary text-glow-purple">Yet.</span>
            </h1>
          </motion.div>

          {/* Subheadline */}
          <motion.p className="text-center text-lg md:text-xl text-muted-foreground mb-12 max-w-3xl mx-auto" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          duration: 0.8,
          delay: 0.3
        }}>
            Most projects fail because of <span className="text-destructive font-medium">blind spots</span>. 
            Mycelium uses a <span className="text-primary font-medium">22-Card System</span> to build a complete strategic mosaic around your idea, revealing the risks  and opportunities you haven't seen.
          </motion.p>

          {/* Card Mosaic Visualization */}
          <motion.div className="mb-12" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: 0.5
        }}>
            <CardMosaic />
          </motion.div>

          {/* Insight callout */}
          <motion.div className="text-center mb-8" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          duration: 0.8,
          delay: 0.7
        }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-sm">
              <Eye className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">
                Hover over cards to reveal <span className="text-primary font-medium">hidden strategic insights</span>
              </span>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div className="text-center" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: 0.9
        }}>
            <Button size="lg" onClick={() => navigate("/auth")} className="text-lg gap-2 px-10 py-6 cta-pulse">
              <Zap className="h-5 w-5" />
              Start Building Your Deck (Free)
              <ArrowRight className="h-5 w-5" />
            </Button>
            
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required • Join 1,000+ founders
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why Cards Section - NEW */}
      <WhyCardsSection />

      {/* Interactive Card Demo - NEW */}
      <InteractiveCardDemo />

      {/* Fog of War Journey - NEW */}
      <FogOfWarJourney />

      {/* AI Team Showcase - UPDATED */}
      <section className="relative z-10 py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div className="text-center mb-16" initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }}>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              7 Perspectives. <span className="text-destructive">0 Yes-Men.</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Each card you play summons expert AI feedback to cover your blind spots.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
            {characters.map((character, index) => <motion.div key={character.id} className="group relative" initial={{
            opacity: 0,
            scale: 0.8
          }} whileInView={{
            opacity: 1,
            scale: 1
          }} viewport={{
            once: true
          }} transition={{
            delay: index * 0.05
          }}>
                <div className="p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden border-2 group-hover:scale-110 transition-transform" style={{
                borderColor: character.color
              }}>
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
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-24 px-4 bg-gradient-to-b from-background via-muted/20 to-background">
        <div className="container mx-auto max-w-6xl">
          <motion.div className="text-center mb-16" initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }}>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground text-lg">Powerful tools to build your product vision</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => <motion.div key={feature.title} className="p-6 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm card-shine hover:border-primary/50 transition-all duration-300" initial={{
            opacity: 0,
            y: 30
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: index * 0.1
          }}>
                <div className={`w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center mb-4 ${feature.color}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div className="text-center mb-16" initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }}>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">Three simple steps to transform your vision</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[{
            step: 1,
            title: "BUILD",
            description: "Don't stare at a blank page. Draw the 'Vision' and 'Problem' cards to ground your idea in reality.",
            color: "primary"
          }, {
            step: 2,
            title: "CRAFT",
            description: "Forge each card with your AI Squad. They act as a filter, challenging your assumptions before you write a single line of code.",
            color: "secondary"
          }, {
            step: 3,
            title: "TRADE",
            description: "Don't build in a silo. Trade cards with other builders to find the missing pieces of your market strategy.",
            color: "accent"
          }].map((item, index) => <motion.div key={item.step} className="relative text-center" initial={{
            opacity: 0,
            y: 30
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: index * 0.15
          }}>
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-${item.color}/20 border-2 border-${item.color} flex items-center justify-center`}>
                  <span className={`text-2xl font-display font-bold text-${item.color}`}>{item.step}</span>
                </div>
                <h3 className={`text-xl font-display font-bold mb-2 text-${item.color}`}>{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
                
                {/* Connector line */}
                {index < 2 && <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-border to-transparent" />}
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* Social Proof - NEW */}
      <SocialProofSection />

      {/* Stats */}
      <section className="relative z-10 py-16 px-4 bg-gradient-to-b from-background via-muted/20 to-background">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[{
            value: "22",
            label: "Cards"
          }, {
            value: "7",
            label: "AI Advisors"
          }, {
            value: "4",
            label: "Phases"
          }, {
            value: "∞",
            label: "Possibilities"
          }].map((stat, index) => <motion.div key={stat.label} initial={{
            opacity: 0,
            scale: 0.8
          }} whileInView={{
            opacity: 1,
            scale: 1
          }} viewport={{
            once: true
          }} transition={{
            delay: index * 0.1
          }}>
                <p className="text-4xl md:text-5xl font-display font-bold text-primary text-glow mb-2">{stat.value}</p>
                <p className="text-muted-foreground">{stat.label}</p>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-24 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }}>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
              Ready to transform your product vision?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Join builders who use Mycelium Cards to turn ideas into strategic roadmaps.
            </p>
            
            <Button size="lg" onClick={() => navigate("/auth")} className="text-lg gap-2 hover:scale-105 transition-transform card-glow px-10 py-6">
              <Zap className="h-6 w-6" />
              Start Building Your Deck
              <ArrowRight className="h-6 w-6" />
            </Button>
            
            <p className="mt-6 text-sm text-muted-foreground">
              Free • No credit card required
            </p>
            
            <p className="mt-4 text-muted-foreground">
              Already have an account?{" "}
              <button onClick={() => navigate("/auth")} className="text-primary hover:underline">
                Sign In
              </button>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer gradient */}
      <div className="h-32 bg-gradient-to-t from-muted/30 to-transparent" />
    </div>;
};
export default Index;