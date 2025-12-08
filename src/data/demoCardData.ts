import everAvatar from '@/assets/avatars/ever.png';
import phoenixAvatar from '@/assets/avatars/phoenix.png';
import prismaAvatar from '@/assets/avatars/prisma.png';
import techPriestAvatar from '@/assets/avatars/techpriest.png';

export interface DemoCard {
  id: string;
  type: string;
  phase: 'vision' | 'research' | 'build' | 'grow';
  title: string;
  slot: number;
  templateKey: string;
  content: {
    headline: string;
    details: string[];
  };
  evaluation: {
    score: number;
    feedback: string;
    character: string;
    avatar: string;
  };
  imageUrl?: string;
}

export const DEMO_CARDS: DemoCard[] = [
  {
    id: 'demo-problem',
    type: 'problem',
    phase: 'vision',
    title: 'Problem',
    slot: 2,
    templateKey: 'pain_point',
    content: {
      headline: 'Freelancers lose 30% of income to late payments',
      details: [
        'Average wait time: 45 days after invoice',
        'Mental load of chasing payments drains creative energy',
        '67% have considered quitting freelance due to cash flow'
      ]
    },
    evaluation: {
      score: 87,
      feedback: 'Strong problem with quantified pain. Consider adding emotional cost beyond financial.',
      character: 'Phoenix',
      avatar: phoenixAvatar
    },
    imageUrl: '/demo-cards/hero-sphere.png'
  },
  {
    id: 'demo-audience',
    type: 'audience',
    phase: 'vision',
    title: 'Audience',
    slot: 3,
    templateKey: 'true_user',
    content: {
      headline: 'Solo designers & developers, 28-42',
      details: [
        'Earning $75K-$150K annually from client work',
        'Value creative freedom over job security',
        'Use Figma, Notion, and Stripe already'
      ]
    },
    evaluation: {
      score: 72,
      feedback: 'Good demographic clarity. Missing: where do they hang out online? How do you reach them?',
      character: 'Prisma',
      avatar: prismaAvatar
    },
    imageUrl: '/demo-cards/audience.png'
  },
  {
    id: 'demo-market',
    type: 'market_map',
    phase: 'research',
    title: 'Market Map',
    slot: 6,
    templateKey: 'territory',
    content: {
      headline: 'Invoice financing is a $3.1B market',
      details: [
        'Competitors: FreshBooks, Wave, Honeybook',
        'Gap: None focus on instant payment guarantee',
        'Trend: 40% YoY growth in freelance economy'
      ]
    },
    evaluation: {
      score: 91,
      feedback: 'Excellent market sizing. The gap you identified is defensible. Research validated.',
      character: 'Ever',
      avatar: everAvatar
    },
    imageUrl: '/demo-cards/competitors-terrain.png'
  },
  {
    id: 'demo-mvp',
    type: 'mvp_features',
    phase: 'build',
    title: 'MVP Features',
    slot: 12,
    templateKey: 'first_fruit',
    content: {
      headline: '3 features, 6-week build',
      details: [
        '✓ One-click invoice with payment guarantee',
        '✓ Client reminder automation (no awkward emails)',
        '✓ Cash flow dashboard with predictions'
      ]
    },
    evaluation: {
      score: 78,
      feedback: 'Scope is tight. Consider: which ONE feature proves the core value prop fastest?',
      character: 'Tech Priest',
      avatar: techPriestAvatar
    },
    imageUrl: '/demo-cards/tech-stack.png'
  }
];

export const PHASE_COLORS: Record<string, string> = {
  vision: 'from-purple-500/20 to-violet-600/20',
  research: 'from-blue-500/20 to-cyan-600/20',
  build: 'from-amber-500/20 to-orange-600/20',
  grow: 'from-emerald-500/20 to-green-600/20'
};

export const PHASE_BORDER_COLORS: Record<string, string> = {
  vision: 'border-purple-500/40',
  research: 'border-blue-500/40',
  build: 'border-amber-500/40',
  grow: 'border-emerald-500/40'
};

export const PHASE_GLOW: Record<string, string> = {
  vision: 'shadow-purple-500/30',
  research: 'shadow-blue-500/30',
  build: 'shadow-amber-500/30',
  grow: 'shadow-emerald-500/30'
};

export const PHASE_ACCENT: Record<string, string> = {
  vision: 'text-purple-400',
  research: 'text-blue-400',
  build: 'text-amber-400',
  grow: 'text-emerald-400'
};
