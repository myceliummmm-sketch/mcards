import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { DEMO_CARDS, DemoCard, PHASE_COLORS as DEMO_PHASE_COLORS, PHASE_GLOW, PHASE_BORDER_COLORS, PHASE_ACCENT } from "@/data/demoCardData";
import { CardDetailModal } from "./CardDetailModal";

// Import phase icons
import visionIcon from "@/assets/icons/vision.png";
import researchIcon from "@/assets/icons/research.png";
import buildIcon from "@/assets/icons/build.png";
import growIcon from "@/assets/icons/grow.png";
import pivotIcon from "@/assets/icons/pivot.png";

// Mapping: mosaic card name → demo card id
const DEMO_SLOT_MAPPING: Record<string, string> = {
  'Problem': 'demo-problem',
  'Audience': 'demo-audience',
  'Competitors': 'demo-market',  // Market Map in demo data
  'MVP Features': 'demo-mvp'
};

// Pain point quotes for locked cards - targeting job seekers, stressed workers, coders
const PAIN_POINTS: Record<string, string> = {
  'Vision': "I have 100 ideas but zero conviction which one to pursue",
  'Unique Value': "Everyone says 'be unique' but my idea already exists on ProductHunt",
  'Market Size': "I built it for everyone... so no one cares",
  'Customer Interviews': "I asked my mom, she said it's genius. Launch failed anyway",
  'Pricing Model': "Free users love me. Paying users? What paying users?",
  'Risk Analysis': "I ignored the red flags. Now I'm 6 months deep with nothing",
  'Tech Stack': "I spent 3 months choosing the perfect stack. Still no MVP",
  'Architecture': "My architecture is beautiful. My user count is zero",
  'Timeline': "It'll take 2 weeks... said me 8 months ago",
  'Budget': "I quit my job for this. Runway: 3 months. Progress: 10%",
  'Team Roles': "I'm CEO, CTO, CFO, and also the intern doing everything",
  'Launch Plan': "I'll just post on Twitter when it's ready...",
  'Marketing': "If you build it, they will come... right? RIGHT?!",
  'Growth Metrics': "I have 1000 signups! Active users? ...don't ask",
  'Retention': "Day 1: 100 users. Day 7: tumbleweeds",
  'Monetization': "I'll figure out money later. Narrator: He didn't",
  'Pivot Signals': "Users want X. I'm building Y. They just don't get my vision"
};

// 22 card types with their phase assignments
const CARD_MOSAIC = [
  { slot: 1, name: "Problem", phase: "vision" },
  { slot: 2, name: "Vision", phase: "vision" },
  { slot: 3, name: "Audience", phase: "vision" },
  { slot: 4, name: "Unique Value", phase: "vision" },
  { slot: 5, name: "Market Size", phase: "research" },
  { slot: 6, name: "Competitors", phase: "research" },
  { slot: 7, name: "Customer Interviews", phase: "research" },
  { slot: 8, name: "Pricing Model", phase: "research" },
  { slot: 9, name: "Risk Analysis", phase: "research" },
  { slot: 10, name: "MVP Features", phase: "build" },
  { slot: 11, name: "Tech Stack", phase: "build" },
  { slot: 12, name: "Architecture", phase: "build" },
  { slot: 13, name: "Timeline", phase: "build" },
  { slot: 14, name: "Budget", phase: "build" },
  { slot: 15, name: "Team Roles", phase: "build" },
  { slot: 16, name: "Launch Plan", phase: "grow" },
  { slot: 17, name: "Marketing", phase: "grow" },
  { slot: 18, name: "Growth Metrics", phase: "grow" },
  { slot: 19, name: "Retention", phase: "grow" },
  { slot: 20, name: "Monetization", phase: "grow" },
  { slot: 21, name: "Pivot Signals", phase: "pivot" },
];

const PHASE_CONFIG: Record<string, { 
  color: string; 
  glow: string; 
  gradient: string;
  icon: string;
  label: string;
}> = {
  vision: { 
    color: "hsl(270 100% 60%)", 
    glow: "0 0 20px hsl(270 100% 60% / 0.4), 0 0 40px hsl(270 100% 60% / 0.2)",
    gradient: "linear-gradient(135deg, hsl(270 100% 60% / 0.2), hsl(270 100% 40% / 0.1))",
    icon: visionIcon,
    label: "Vision"
  },
  research: { 
    color: "hsl(190 100% 50%)", 
    glow: "0 0 20px hsl(190 100% 50% / 0.4), 0 0 40px hsl(190 100% 50% / 0.2)",
    gradient: "linear-gradient(135deg, hsl(190 100% 50% / 0.2), hsl(190 100% 30% / 0.1))",
    icon: researchIcon,
    label: "Research"
  },
  build: { 
    color: "hsl(150 100% 45%)", 
    glow: "0 0 20px hsl(150 100% 45% / 0.4), 0 0 40px hsl(150 100% 45% / 0.2)",
    gradient: "linear-gradient(135deg, hsl(150 100% 45% / 0.2), hsl(150 100% 30% / 0.1))",
    icon: buildIcon,
    label: "Build"
  },
  grow: { 
    color: "hsl(35 100% 55%)", 
    glow: "0 0 20px hsl(35 100% 55% / 0.4), 0 0 40px hsl(35 100% 55% / 0.2)",
    gradient: "linear-gradient(135deg, hsl(35 100% 55% / 0.2), hsl(35 100% 35% / 0.1))",
    icon: growIcon,
    label: "Grow"
  },
  pivot: { 
    color: "hsl(320 100% 55%)", 
    glow: "0 0 20px hsl(320 100% 55% / 0.4), 0 0 40px hsl(320 100% 55% / 0.2)",
    gradient: "linear-gradient(135deg, hsl(320 100% 55% / 0.2), hsl(320 100% 35% / 0.1))",
    icon: pivotIcon,
    label: "Pivot"
  },
};

// Helper to get demo card by mosaic card name
const getDemoCard = (name: string): DemoCard | undefined => {
  const demoId = DEMO_SLOT_MAPPING[name];
  if (!demoId) return undefined;
  return DEMO_CARDS.find(c => c.id === demoId);
};

// Flippable Demo Card Component - uses static imageUrl from demoCardData
const FlippableDemoCard = ({
  card,
  demoCard,
  onCardClick,
  index
}: {
  card: typeof CARD_MOSAIC[0];
  demoCard: DemoCard;
  onCardClick: (demoCard: DemoCard) => void;
  index: number;
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const getRarityColor = (score: number) => {
    if (score >= 90) return 'text-amber-400';
    if (score >= 80) return 'text-purple-400';
    if (score >= 70) return 'text-blue-400';
    return 'text-emerald-400';
  };

  return (
    <motion.div
      className="relative aspect-[2.5/3.5] cursor-pointer group perspective-1000"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        delay: index * 0.04,
        duration: 0.5,
        ease: "easeOut"
      }}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={() => onCardClick(demoCard)}
      whileHover={{ scale: 1.08, y: -8, zIndex: 10 }}
    >
      <motion.div
        className="absolute inset-0 transition-transform duration-500"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front - Card Image */}
        <div 
          className={`absolute inset-0 rounded-lg border-2 ${PHASE_BORDER_COLORS[demoCard.phase]} overflow-hidden shadow-2xl ${PHASE_GLOW[demoCard.phase]}`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {demoCard.imageUrl ? (
            <img 
              src={demoCard.imageUrl} 
              alt={demoCard.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${DEMO_PHASE_COLORS[demoCard.phase]}`}>
              <Sparkles className="w-6 h-6 text-muted-foreground/50" />
            </div>
          )}
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          {/* Score badge */}
          <div className={`absolute top-1.5 right-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm ${getRarityColor(demoCard.evaluation.score)}`}>
            <Sparkles className="w-2.5 h-2.5" />
            <span className="text-[10px] font-bold">{demoCard.evaluation.score}</span>
          </div>
          
          {/* Bottom content */}
          <div className="absolute bottom-0 left-0 right-0 p-2">
            <span className={`text-[9px] md:text-[10px] font-bold uppercase tracking-wider ${PHASE_ACCENT[demoCard.phase]}`}>
              {demoCard.title}
            </span>
            <p className="text-[7px] md:text-[8px] text-white/70 line-clamp-1 mt-0.5">
              {demoCard.content.headline}
            </p>
          </div>
        </div>

        {/* Back - Evaluation */}
        <div 
          className={`absolute inset-0 rounded-lg border-2 ${PHASE_BORDER_COLORS[demoCard.phase]} bg-gradient-to-br from-card/98 to-card backdrop-blur-sm p-2 flex flex-col shadow-2xl ${PHASE_GLOW[demoCard.phase]}`}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {/* Evaluator */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <img 
              src={demoCard.evaluation.avatar} 
              alt={demoCard.evaluation.character}
              className="w-5 h-5 md:w-6 md:h-6 rounded-full border border-primary/50"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[8px] md:text-[9px] font-bold text-foreground truncate">
                {demoCard.evaluation.character}
              </p>
            </div>
            <span className={`text-sm md:text-base font-bold ${getRarityColor(demoCard.evaluation.score)}`}>
              {demoCard.evaluation.score}
            </span>
          </div>
          
          {/* Score bar */}
          <div className="w-full h-1 bg-background/50 rounded-full overflow-hidden mb-1.5">
            <motion.div 
              className={`h-full ${
                demoCard.evaluation.score >= 90 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' : 
                demoCard.evaluation.score >= 80 ? 'bg-gradient-to-r from-purple-500 to-pink-400' : 
                'bg-gradient-to-r from-blue-500 to-cyan-400'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${demoCard.evaluation.score}%` }}
              transition={{ delay: 0.3, duration: 0.5 }}
            />
          </div>
          
          {/* Feedback */}
          <p className="text-[7px] md:text-[8px] text-foreground/80 italic leading-tight flex-1 line-clamp-4">
            "{demoCard.evaluation.feedback}"
          </p>
          
          {/* CTA */}
          <div className="mt-auto pt-1 border-t border-white/10">
            <span className="text-[7px] md:text-[8px] text-primary flex items-center gap-0.5">
              Click for details <ArrowRight className="w-2 h-2" />
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Pain Point Card Component - flips to reveal relatable struggles
const PainPointCard = ({
  card,
  index
}: {
  card: typeof CARD_MOSAIC[0];
  index: number;
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const phaseConfig = PHASE_CONFIG[card.phase];
  const painPoint = PAIN_POINTS[card.name] || "Building in the dark without a map";

  return (
    <motion.div
      className="relative aspect-[2.5/3.5] cursor-pointer group perspective-1000"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        delay: index * 0.04,
        duration: 0.5,
        ease: "easeOut"
      }}
          onClick={() => setIsFlipped(!isFlipped)}
          whileHover={{ scale: 1.05, y: -5, zIndex: 5 }}
    >
      <motion.div
        className="absolute inset-0 transition-transform duration-500"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front - Mysterious shrouded card */}
        <div 
          className="absolute inset-0 rounded-lg overflow-hidden"
          style={{
            background: `linear-gradient(135deg, hsl(var(--muted) / 0.4), hsl(var(--muted) / 0.2))`,
            border: `1px solid ${phaseConfig.color}20`,
            boxShadow: `inset 0 0 30px hsl(var(--background) / 0.5)`,
            backfaceVisibility: 'hidden'
          }}
        >
          {/* Smoke/mystery effect */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              background: `radial-gradient(ellipse at center, ${phaseConfig.color}30, transparent 70%)`
            }}
          />
          
          {/* Scanlines */}
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,hsl(var(--muted-foreground)/0.1)_2px,hsl(var(--muted-foreground)/0.1)_4px)]" />
          
          {/* Question mark hint */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              animate={{ 
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-2xl md:text-3xl font-light"
              style={{ color: `${phaseConfig.color}60` }}
            >
              ?
            </motion.div>
            <span 
              className="text-[8px] md:text-[9px] text-center px-2 mt-2 font-medium"
              style={{ color: `${phaseConfig.color}80` }}
            >
              {card.name}
            </span>
          </div>
          
          {/* Tap hint */}
          <div className="absolute bottom-1.5 left-0 right-0 text-center">
            <span className="text-[6px] md:text-[7px] text-muted-foreground/40">tap to reveal</span>
          </div>
        </div>

        {/* Back - Pain point quote */}
        <div 
          className="absolute inset-0 rounded-lg overflow-hidden p-2 md:p-3 flex flex-col justify-center"
          style={{
            background: `linear-gradient(145deg, hsl(var(--card)), hsl(var(--card) / 0.95))`,
            border: `1px solid ${phaseConfig.color}40`,
            boxShadow: phaseConfig.glow,
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          {/* Decorative quote marks */}
          <div 
            className="absolute top-1 left-1.5 text-xl md:text-2xl opacity-20 font-serif"
            style={{ color: phaseConfig.color }}
          >
            "
          </div>
          
          {/* Pain point text */}
          <p 
            className="text-[8px] md:text-[10px] leading-tight text-center italic text-foreground/90 px-1"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {painPoint}
          </p>
          
          {/* Decorative closing quote */}
          <div 
            className="absolute bottom-1 right-1.5 text-xl md:text-2xl opacity-20 font-serif"
            style={{ color: phaseConfig.color }}
          >
            "
          </div>
          
          {/* Card type label */}
          <div className="absolute bottom-1.5 left-0 right-0 text-center">
            <span 
              className="text-[6px] md:text-[7px] font-bold uppercase tracking-wider"
              style={{ color: phaseConfig.color }}
            >
              {card.name}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export function CardMosaic() {
  const [selectedCard, setSelectedCard] = useState<DemoCard | null>(null);

  const handleCardClick = useCallback((demoCard: DemoCard) => {
    setSelectedCard(demoCard);
  }, []);

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      {/* Blueprint grid background */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-[linear-gradient(hsl(var(--primary)/0.2)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--primary)/0.2)_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-3 md:gap-4 p-4 md:p-6">
        {CARD_MOSAIC.map((card, index) => {
          const demoCard = getDemoCard(card.name);

          if (demoCard) {
            return (
              <FlippableDemoCard
                key={card.slot}
                card={card}
                demoCard={demoCard}
                onCardClick={handleCardClick}
                index={index}
              />
            );
          }

          return (
            <PainPointCard
              key={card.slot}
              card={card}
              index={index}
            />
          );
        })}
      </div>

      {/* Card Detail Modal */}
      <AnimatePresence>
        {selectedCard && (
          <CardDetailModal
            card={selectedCard}
            imageUrl={selectedCard.imageUrl}
            isOpen={!!selectedCard}
            onClose={() => setSelectedCard(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
