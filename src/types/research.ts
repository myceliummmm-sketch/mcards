// Research Flow Types v5.0

export type TeamMember = 'phoenix' | 'prisma' | 'toxic' | 'techpriest' | 'evergreen' | 'zen' | 'virgilia';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type ResearchVerdict = 'go' | 'conditional_go' | 'pivot' | 'stop';

// Vision → Research card mapping
export const VISION_TO_RESEARCH_MAP: Record<number, number> = {
  1: 6,  // V-01 PRODUCT → R-1 Market Map
  2: 8,  // V-02 PROBLEM → R-3 User Insights
  3: 7,  // V-03 AUDIENCE → R-2 Competitor Analysis
  4: 9,  // V-04 VALUE → R-4 Risk Assessment
  5: 10, // V-05 VISION → R-5 Opportunity Score
};

export const RESEARCH_TO_VISION_MAP: Record<number, number> = {
  6: 1,  // R-1 Market Map → V-01 PRODUCT
  7: 3,  // R-2 Competitor Analysis → V-03 AUDIENCE
  8: 2,  // R-3 User Insights → V-02 PROBLEM
  9: 4,  // R-4 Risk Assessment → V-04 VALUE
  10: 5, // R-5 Opportunity Score → V-05 VISION
};

// Research card dependency chain
// Each Research card looks at previous Research cards + its Vision card
export const RESEARCH_DEPENDENCIES: Record<number, { visionSlot: number; previousResearch: number[] }> = {
  6: { visionSlot: 1, previousResearch: [] },           // R-1 only looks at V-01
  7: { visionSlot: 3, previousResearch: [6] },         // R-2 looks at V-03 + R-1
  8: { visionSlot: 2, previousResearch: [6, 7] },      // R-3 looks at V-02 + R-1, R-2
  9: { visionSlot: 4, previousResearch: [6, 7, 8] },   // R-4 looks at V-04 + R-1, R-2, R-3
  10: { visionSlot: 5, previousResearch: [6, 7, 8, 9] }, // R-5 looks at ALL
};

// Insight presenter mapping - who presents which insights
export const INSIGHT_PRESENTERS: Record<number, TeamMember[]> = {
  6: ['phoenix', 'evergreen', 'phoenix'],     // Market Map - Phoenix leads
  7: ['toxic', 'prisma', 'toxic'],            // Competitor Analysis - Toxic leads
  8: ['prisma', 'zen', 'prisma'],             // User Insights - Prisma leads
  9: ['toxic', 'techpriest', 'toxic'],        // Risk Assessment - Toxic leads
  10: ['evergreen', 'phoenix', 'toxic'],      // Opportunity Score - Ever Green leads
};

export interface Insight {
  id: string;
  visionCardSlot: number;
  researchCardSlot: number;
  content: string;
  source: string;
  sourceUrl?: string;
  presenter: TeamMember;
  score: number;          // 1-10, capped by vision card score + 2
  maxPossibleScore: number; // Vision card score + 2
  rarity: Rarity;
  resonated: boolean | null;
  index: number;          // Position in the 15-insight sequence
}

export interface ResearchSession {
  id: string;
  deckId: string;
  status: 'idle' | 'searching' | 'ready' | 'validating' | 'complete';
  insights: Insight[];
  currentInsightIndex: number;
  resonatedCount: number;
  totalInsights: number;
  averageScore: number;
  finalRarity: Rarity;
  startedAt: string | null;
  completedAt: string | null;
}

export interface VisionCardScore {
  slot: number;
  score: number;  // 1-10
  rarity: Rarity;
}

// Rarity thresholds
export const RARITY_THRESHOLDS = {
  legendary: 9.4,
  epic: 8.0,
  rare: 7.0,
  uncommon: 6.0,
  common: 0,
} as const;

export function calculateRarity(score: number): Rarity {
  if (score >= RARITY_THRESHOLDS.legendary) return 'legendary';
  if (score >= RARITY_THRESHOLDS.epic) return 'epic';
  if (score >= RARITY_THRESHOLDS.rare) return 'rare';
  if (score >= RARITY_THRESHOLDS.uncommon) return 'uncommon';
  return 'common';
}

// Apply ceiling rule: Research score can't exceed Vision score + 2
export function applyScoreCeiling(rawScore: number, visionScore: number): number {
  const maxAllowed = Math.min(10, visionScore + 2);
  return Math.min(rawScore, maxAllowed);
}

// Rarity colors
export const RARITY_COLORS: Record<Rarity, { 
  primary: string; 
  bg: string; 
  text: string;
  glow: string;
}> = {
  common: {
    primary: 'hsl(0 0% 62%)',
    bg: 'hsl(0 0% 20%)',
    text: 'hsl(0 0% 80%)',
    glow: 'hsl(0 0% 50% / 0.3)',
  },
  uncommon: {
    primary: 'hsl(142 70% 45%)',
    bg: 'hsl(142 30% 15%)',
    text: 'hsl(142 50% 80%)',
    glow: 'hsl(142 70% 45% / 0.3)',
  },
  rare: {
    primary: 'hsl(210 100% 60%)',
    bg: 'hsl(210 50% 15%)',
    text: 'hsl(210 80% 85%)',
    glow: 'hsl(210 100% 60% / 0.3)',
  },
  epic: {
    primary: 'hsl(270 70% 60%)',
    bg: 'hsl(270 40% 15%)',
    text: 'hsl(270 60% 85%)',
    glow: 'hsl(270 70% 60% / 0.3)',
  },
  legendary: {
    primary: 'hsl(25 100% 55%)',
    bg: 'hsl(25 60% 15%)',
    text: 'hsl(25 80% 85%)',
    glow: 'hsl(25 100% 55% / 0.4)',
  },
};

// Team member display info
export const TEAM_MEMBER_INFO: Record<TeamMember, {
  name: string;
  emoji: string;
  role: string;
  style: string;
}> = {
  phoenix: {
    name: 'Phoenix',
    emoji: '🔥',
    role: 'CMO',
    style: 'Энергичная, позитивная',
  },
  prisma: {
    name: 'Prisma',
    emoji: '💎',
    role: 'Product',
    style: 'Эмпатичная, про людей',
  },
  toxic: {
    name: 'Toxic',
    emoji: '☢️',
    role: 'Red Team',
    style: 'Скептичный, но честный',
  },
  techpriest: {
    name: 'Tech Priest',
    emoji: '⚙️',
    role: 'CTO',
    style: 'Технический, точный',
  },
  evergreen: {
    name: 'Ever Green',
    emoji: '🌲',
    role: 'CEO',
    style: 'Мудрый, стратегический',
  },
  zen: {
    name: 'Zen',
    emoji: '🧘',
    role: 'Culture',
    style: 'Спокойный, гуманный',
  },
  virgilia: {
    name: 'Virgilia',
    emoji: '🎨',
    role: 'Storyteller',
    style: 'Визуальная, эмоциональная',
  },
};
