export type CardPhase = 'vision' | 'research' | 'build' | 'grow';

export interface CardDefinition {
  id: string;
  slot: number;
  phase: CardPhase;
  title: string;
  description: string;
  aiHelper: string;
  questions: string[];
  example?: string;
}

export const PHASE_CONFIG = {
  vision: {
    name: 'Vision',
    icon: '🎯',
    color: 'hsl(var(--primary))',
    slots: [1, 2, 3, 4, 5]
  },
  research: {
    name: 'Research',
    icon: '🔬',
    color: 'hsl(var(--secondary))',
    slots: [6, 7, 8, 9, 10, 11]
  },
  build: {
    name: 'Build',
    icon: '🛠️',
    color: 'hsl(var(--accent))',
    slots: [12, 13, 14, 15, 16, 17]
  },
  grow: {
    name: 'Grow',
    icon: '🌱',
    color: 'hsl(45 100% 55%)',
    slots: [18, 19, 20, 21, 22]
  }
};

export const CARD_DEFINITIONS: CardDefinition[] = [
  // VISION PHASE (5 cards)
  {
    id: 'product',
    slot: 1,
    phase: 'vision',
    title: 'PRODUCT',
    description: 'What are you building?',
    aiHelper: 'ceo',
    questions: [
      'What problem does your product solve?',
      'Who is your target user?',
      'What makes it unique?'
    ],
    example: 'A mobile app that helps busy parents meal plan with AI-generated recipes'
  },
  {
    id: 'vision_statement',
    slot: 2,
    phase: 'vision',
    title: 'VISION',
    description: 'Your inspiring future state',
    aiHelper: 'ceo',
    questions: [
      'What does success look like in 3 years?',
      'How will the world be different?',
      'What impact will you make?'
    ]
  },
  {
    id: 'mission',
    slot: 3,
    phase: 'vision',
    title: 'MISSION',
    description: 'Why you exist',
    aiHelper: 'ceo',
    questions: [
      'What is your core purpose?',
      'What change are you driving?',
      'Who benefits and how?'
    ]
  },
  {
    id: 'values',
    slot: 4,
    phase: 'vision',
    title: 'VALUES',
    description: 'Your guiding principles',
    aiHelper: 'ceo',
    questions: [
      'What principles guide your decisions?',
      'What do you stand for?',
      'What behaviors do you reward?'
    ]
  },
  {
    id: 'success_metrics',
    slot: 5,
    phase: 'vision',
    title: 'SUCCESS METRICS',
    description: 'How you measure victory',
    aiHelper: 'data',
    questions: [
      'What are your North Star metrics?',
      'How do you measure user value?',
      'What numbers matter most?'
    ]
  },
  
  // RESEARCH PHASE (6 cards)
  {
    id: 'target_user',
    slot: 6,
    phase: 'research',
    title: 'TARGET USER',
    description: 'Who you serve deeply',
    aiHelper: 'pm',
    questions: [
      'Who is your ideal user? (demographics, psychographics)',
      'What are their daily routines?',
      'What are their goals and frustrations?'
    ]
  },
  {
    id: 'user_pain',
    slot: 7,
    phase: 'research',
    title: 'USER PAIN',
    description: 'The problem that keeps them up',
    aiHelper: 'pm',
    questions: [
      'What specific pain point does your product address?',
      'How painful is this problem (1-10)?',
      'What do they do today to solve it?'
    ]
  },
  {
    id: 'competitive_landscape',
    slot: 8,
    phase: 'research',
    title: 'COMPETITORS',
    description: 'Who else is playing',
    aiHelper: 'strategist',
    questions: [
      'Who are your top 3 competitors?',
      'What are their strengths and weaknesses?',
      'What makes you different?'
    ]
  },
  {
    id: 'market_size',
    slot: 9,
    phase: 'research',
    title: 'MARKET SIZE',
    description: 'The size of the opportunity',
    aiHelper: 'data',
    questions: [
      'How many potential users exist?',
      'What is the TAM/SAM/SOM?',
      'Is the market growing or shrinking?'
    ]
  },
  {
    id: 'user_research',
    slot: 10,
    phase: 'research',
    title: 'USER INSIGHTS',
    description: 'What users actually said',
    aiHelper: 'pm',
    questions: [
      'What did you learn from user interviews?',
      'What surprised you?',
      'What quotes capture their needs?'
    ]
  },
  {
    id: 'positioning',
    slot: 11,
    phase: 'research',
    title: 'POSITIONING',
    description: 'How you fit in the market',
    aiHelper: 'strategist',
    questions: [
      'What category do you compete in?',
      'What is your unique positioning?',
      'What do you want to be known for?'
    ]
  },
  
  // BUILD PHASE (6 cards)
  {
    id: 'core_features',
    slot: 12,
    phase: 'build',
    title: 'CORE FEATURES',
    description: 'Your MVP feature set',
    aiHelper: 'engineer',
    questions: [
      'What are the 3-5 must-have features?',
      'What can you cut for v1?',
      'What delivers the core value?'
    ]
  },
  {
    id: 'user_flow',
    slot: 13,
    phase: 'build',
    title: 'USER FLOW',
    description: 'The journey through your product',
    aiHelper: 'designer',
    questions: [
      'How does a user first discover value?',
      'What is the happy path?',
      'Where might they get stuck?'
    ]
  },
  {
    id: 'tech_stack',
    slot: 14,
    phase: 'build',
    title: 'TECH STACK',
    description: 'Your technical foundation',
    aiHelper: 'engineer',
    questions: [
      'What technologies will you use?',
      'Why these choices?',
      'What are the tradeoffs?'
    ]
  },
  {
    id: 'design_system',
    slot: 15,
    phase: 'build',
    title: 'DESIGN SYSTEM',
    description: 'Your visual language',
    aiHelper: 'designer',
    questions: [
      'What is your brand aesthetic?',
      'What emotions do you evoke?',
      'What are your key UI patterns?'
    ]
  },
  {
    id: 'mvp_timeline',
    slot: 16,
    phase: 'build',
    title: 'MVP TIMELINE',
    description: 'Your roadmap to launch',
    aiHelper: 'pm',
    questions: [
      'What are your major milestones?',
      'When will you launch?',
      'What are the dependencies?'
    ]
  },
  {
    id: 'team_structure',
    slot: 17,
    phase: 'build',
    title: 'TEAM',
    description: 'Who builds this',
    aiHelper: 'ceo',
    questions: [
      'Who is on the founding team?',
      'What skills do you have/need?',
      'How do you divide responsibilities?'
    ]
  },
  
  // GROW PHASE (5 cards)
  {
    id: 'go_to_market',
    slot: 18,
    phase: 'grow',
    title: 'GO-TO-MARKET',
    description: 'How you reach users',
    aiHelper: 'marketer',
    questions: [
      'What are your top 3 acquisition channels?',
      'What is your launch strategy?',
      'How will you generate buzz?'
    ]
  },
  {
    id: 'pricing_model',
    slot: 19,
    phase: 'grow',
    title: 'PRICING',
    description: 'Your revenue model',
    aiHelper: 'strategist',
    questions: [
      'How will you monetize?',
      'What will you charge?',
      'Why will people pay?'
    ]
  },
  {
    id: 'growth_loops',
    slot: 20,
    phase: 'grow',
    title: 'GROWTH LOOPS',
    description: 'Your viral mechanics',
    aiHelper: 'marketer',
    questions: [
      'How does one user bring another?',
      'What is shareable?',
      'What creates habit?'
    ]
  },
  {
    id: 'retention_strategy',
    slot: 21,
    phase: 'grow',
    title: 'RETENTION',
    description: 'Keeping users engaged',
    aiHelper: 'pm',
    questions: [
      'Why will users come back?',
      'What is your onboarding flow?',
      'How do you fight churn?'
    ]
  },
  {
    id: 'funding_plan',
    slot: 22,
    phase: 'grow',
    title: 'FUNDING',
    description: 'Your financial runway',
    aiHelper: 'ceo',
    questions: [
      'How will you fund development?',
      'What is your burn rate?',
      'When will you be profitable/fundraise?'
    ]
  }
];

export const getCardsByPhase = (phase: CardPhase): CardDefinition[] => {
  return CARD_DEFINITIONS.filter(card => card.phase === phase);
};

export const getCardBySlot = (slot: number): CardDefinition | undefined => {
  return CARD_DEFINITIONS.find(card => card.slot === slot);
};
