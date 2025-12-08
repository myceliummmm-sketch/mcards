import { useState } from "react";
import { motion } from "framer-motion";
import { PHASE_CONFIG } from "@/data/cardDefinitions";

// 22 card types with their phase assignments
const CARD_MOSAIC = [
  { slot: 1, name: "Problem", phase: "vision", revealed: true },
  { slot: 2, name: "Vision", phase: "vision", revealed: true },
  { slot: 3, name: "Audience", phase: "vision", revealed: false },
  { slot: 4, name: "Unique Value", phase: "vision", revealed: false },
  { slot: 5, name: "Market Size", phase: "research", revealed: false },
  { slot: 6, name: "Competitors", phase: "research", revealed: true },
  { slot: 7, name: "Customer Interviews", phase: "research", revealed: false },
  { slot: 8, name: "Pricing Model", phase: "research", revealed: false },
  { slot: 9, name: "Risk Analysis", phase: "research", revealed: false },
  { slot: 10, name: "MVP Features", phase: "build", revealed: true },
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

const PHASE_COLORS: Record<string, string> = {
  vision: "hsl(270 100% 60%)",
  research: "hsl(190 100% 50%)",
  build: "hsl(150 100% 45%)",
  grow: "hsl(35 100% 55%)",
  pivot: "hsl(320 100% 55%)",
};

export function CardMosaic() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Blueprint grid background */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full bg-[linear-gradient(hsl(var(--primary)/0.1)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--primary)/0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
      </div>

      {/* Card Grid - 6 columns x 4 rows (22 cards + 2 empty) */}
      <div className="grid grid-cols-6 md:grid-cols-11 gap-2 md:gap-3 p-4">
        {CARD_MOSAIC.map((card, index) => {
          const isHovered = hoveredCard === index;
          const isRevealed = card.revealed || isHovered;
          const phaseColor = PHASE_COLORS[card.phase];

          return (
            <motion.div
              key={card.slot}
              className="relative aspect-[2.5/3.5] cursor-pointer group"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ 
                delay: index * 0.03,
                duration: 0.4,
                ease: "easeOut"
              }}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Card container */}
              <motion.div
                className={`
                  absolute inset-0 rounded-md border overflow-hidden
                  transition-all duration-300
                  ${isRevealed 
                    ? 'bg-card border-primary/50' 
                    : 'bg-muted/30 border-border/30'
                  }
                `}
                animate={{
                  boxShadow: isRevealed
                    ? `0 0 20px ${phaseColor}40, 0 0 40px ${phaseColor}20`
                    : '0 0 0 transparent',
                  borderColor: isRevealed ? phaseColor : undefined,
                }}
              >
                {/* Shrouded state - fog overlay */}
                {!isRevealed && (
                  <div className="absolute inset-0 bg-gradient-to-b from-muted/60 to-muted/80">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-muted-foreground/20" />
                    </div>
                  </div>
                )}

                {/* Revealed state - card content */}
                {isRevealed && (
                  <motion.div
                    className="absolute inset-0 flex flex-col items-center justify-center p-1 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Phase indicator dot */}
                    <div 
                      className="w-2 h-2 rounded-full mb-1"
                      style={{ backgroundColor: phaseColor }}
                    />
                    {/* Card name */}
                    <span className="text-[8px] md:text-[10px] font-medium text-foreground leading-tight">
                      {card.name}
                    </span>
                  </motion.div>
                )}

                {/* Hover glow effect */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  animate={{
                    background: isHovered
                      ? `radial-gradient(circle at center, ${phaseColor}30 0%, transparent 70%)`
                      : 'transparent',
                  }}
                />
              </motion.div>

              {/* Floating tooltip on hover for shrouded cards */}
              {isHovered && !card.revealed && (
                <motion.div
                  className="absolute -top-8 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="bg-popover border border-border rounded px-2 py-1 text-xs shadow-lg">
                    <span className="text-primary">?</span> {card.name}
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded border border-primary/50 bg-card" />
          <span>Known</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded border border-border/30 bg-muted/30" />
          <span>Blind Spots</span>
        </div>
      </div>
    </div>
  );
}
