import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Sparkles } from "lucide-react";

// Import phase icons
import visionIcon from "@/assets/icons/vision.png";
import researchIcon from "@/assets/icons/research.png";
import buildIcon from "@/assets/icons/build.png";
import growIcon from "@/assets/icons/grow.png";
import pivotIcon from "@/assets/icons/pivot.png";

// 22 card types with their phase assignments and sample snippets
const CARD_MOSAIC = [
  { slot: 1, name: "Problem", phase: "vision", revealed: true, snippet: "What pain are you solving?" },
  { slot: 2, name: "Vision", phase: "vision", revealed: true, snippet: "What world are you creating?" },
  { slot: 3, name: "Audience", phase: "vision", revealed: false },
  { slot: 4, name: "Unique Value", phase: "vision", revealed: false },
  { slot: 5, name: "Market Size", phase: "research", revealed: false },
  { slot: 6, name: "Competitors", phase: "research", revealed: true, snippet: "Who else plays this game?" },
  { slot: 7, name: "Customer Interviews", phase: "research", revealed: false },
  { slot: 8, name: "Pricing Model", phase: "research", revealed: false },
  { slot: 9, name: "Risk Analysis", phase: "research", revealed: false },
  { slot: 10, name: "MVP Features", phase: "build", revealed: true, snippet: "Your must-have feature list" },
  { slot: 11, name: "Tech Stack", phase: "build", revealed: false },
  { slot: 12, name: "Architecture", phase: "build", revealed: false },
  { slot: 13, name: "Timeline", phase: "build", revealed: false },
  { slot: 14, name: "Budget", phase: "build", revealed: false },
  { slot: 15, name: "Team Roles", phase: "build", revealed: false },
  { slot: 16, name: "Launch Plan", phase: "grow", revealed: false },
  { slot: 17, name: "Marketing", phase: "grow", revealed: false },
  { slot: 18, name: "Growth Metrics", phase: "grow", revealed: false },
  { slot: 19, name: "Retention", phase: "grow", revealed: false },
  { slot: 20, name: "Monetization", phase: "grow", revealed: false },
  { slot: 21, name: "Pivot Signals", phase: "pivot", revealed: false },
  { slot: 22, name: "Exit Strategy", phase: "pivot", revealed: false },
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

export function CardMosaic() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      {/* Blueprint grid background */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-[linear-gradient(hsl(var(--primary)/0.2)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--primary)/0.2)_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* Card Grid - 7 columns for better sizing */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-3 md:gap-4 p-4 md:p-6">
        {CARD_MOSAIC.map((card, index) => {
          const isHovered = hoveredCard === index;
          const isRevealed = card.revealed;
          const phaseConfig = PHASE_CONFIG[card.phase];

          return (
            <motion.div
              key={card.slot}
              className="relative aspect-[2.5/3.5] cursor-pointer group"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ 
                delay: index * 0.04,
                duration: 0.5,
                ease: "easeOut"
              }}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              {/* Card container */}
              <motion.div
                className="absolute inset-0 rounded-lg overflow-hidden"
                style={{
                  background: isRevealed ? phaseConfig.gradient : 'hsl(var(--muted) / 0.3)',
                  boxShadow: isRevealed && isHovered ? phaseConfig.glow : 'none',
                  border: `1px solid ${isRevealed ? phaseConfig.color + '60' : 'hsl(var(--border) / 0.3)'}`,
                }}
              >
                {/* Cyberpunk corner accents for revealed cards */}
                {isRevealed && (
                  <>
                    <div 
                      className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 rounded-tl-lg"
                      style={{ borderColor: phaseConfig.color }}
                    />
                    <div 
                      className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 rounded-tr-lg"
                      style={{ borderColor: phaseConfig.color }}
                    />
                    <div 
                      className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 rounded-bl-lg"
                      style={{ borderColor: phaseConfig.color }}
                    />
                    <div 
                      className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 rounded-br-lg"
                      style={{ borderColor: phaseConfig.color }}
                    />
                  </>
                )}

                {/* Shrouded state - fog/glitch overlay */}
                {!isRevealed && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {/* Scanlines effect */}
                    <div className="absolute inset-0 opacity-30 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,hsl(var(--muted-foreground)/0.1)_2px,hsl(var(--muted-foreground)/0.1)_4px)]" />
                    
                    {/* Lock icon */}
                    <div className="relative z-10 flex flex-col items-center gap-1">
                      <Lock className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground/40" />
                      {isHovered && (
                        <motion.span 
                          className="text-[8px] md:text-[9px] text-muted-foreground/60 text-center px-1"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          Unlock
                        </motion.span>
                      )}
                    </div>
                  </div>
                )}

                {/* Revealed state - card content */}
                {isRevealed && (
                  <motion.div
                    className="absolute inset-0 flex flex-col items-center justify-between p-2 md:p-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Phase icon */}
                    <div className="relative">
                      <img 
                        src={phaseConfig.icon} 
                        alt={phaseConfig.label}
                        className="w-6 h-6 md:w-8 md:h-8 object-contain"
                      />
                      {isHovered && (
                        <motion.div
                          className="absolute inset-0 rounded-full"
                          style={{ boxShadow: phaseConfig.glow }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        />
                      )}
                    </div>

                    {/* Card name & snippet */}
                    <div className="flex flex-col items-center text-center gap-0.5">
                      <span 
                        className="text-[9px] md:text-[11px] font-bold uppercase tracking-wider"
                        style={{ color: phaseConfig.color }}
                      >
                        {card.name}
                      </span>
                      {card.snippet && (
                        <span className="text-[7px] md:text-[9px] text-muted-foreground/80 leading-tight hidden sm:block">
                          {card.snippet}
                        </span>
                      )}
                    </div>

                    {/* Sparkle indicator */}
                    <Sparkles 
                      className="w-3 h-3 md:w-4 md:h-4 opacity-60"
                      style={{ color: phaseConfig.color }}
                    />
                  </motion.div>
                )}

                {/* Hover glow pulse effect */}
                {isHovered && isRevealed && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none rounded-lg"
                    style={{
                      background: `radial-gradient(circle at center, ${phaseConfig.color}20 0%, transparent 70%)`,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded border-2"
            style={{ 
              borderColor: PHASE_CONFIG.vision.color,
              background: PHASE_CONFIG.vision.gradient 
            }}
          />
          <span>Revealed Cards</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border border-border/30 bg-muted/30 flex items-center justify-center">
            <Lock className="w-2 h-2 text-muted-foreground/40" />
          </div>
          <span>Your Blind Spots</span>
        </div>
      </div>
    </div>
  );
}
