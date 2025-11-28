import { Rarity } from './rarityConfig';

export interface MarketplaceCard {
  id: string;
  title: string;
  phase: 'vision' | 'research' | 'build' | 'grow';
  cardType: 'insight' | 'action' | 'milestone' | 'team';
  rarity: Rarity;
  price: number;
  seller: {
    username: string;
    avatar: string;
  };
  description: string;
  industry: string;
  imageUrl?: string;
  stats: {
    views: number;
    purchases: number;
    avgRating: number;
  };
  previewData: any;
  createdAt: string;
}

export const MOCK_MARKETPLACE_CARDS: MarketplaceCard[] = [
  {
    id: '1',
    title: 'AI-Powered Market Analysis',
    phase: 'research',
    cardType: 'insight',
    rarity: 'legendary',
    price: 500,
    seller: { username: 'TechGuru', avatar: '/avatars/techpriest.png' },
    description: 'Advanced AI analysis of market trends and competitor positioning',
    industry: 'AI/ML',
    stats: { views: 2340, purchases: 156, avgRating: 4.9 },
    previewData: { competitorCount: 12, marketSize: '$2.4B' },
    createdAt: '2025-01-15',
  },
  {
    id: '2',
    title: 'User Interview Framework',
    phase: 'research',
    cardType: 'action',
    rarity: 'rare',
    price: 150,
    seller: { username: 'Phoenix', avatar: '/avatars/phoenix.png' },
    description: 'Comprehensive framework for conducting effective user interviews',
    industry: 'SaaS & Software',
    stats: { views: 890, purchases: 67, avgRating: 4.7 },
    previewData: { questions: 25, templates: 5 },
    createdAt: '2025-01-14',
  },
  {
    id: '3',
    title: 'MVP Launch Checklist',
    phase: 'build',
    cardType: 'milestone',
    rarity: 'epic',
    price: 300,
    seller: { username: 'Prisma', avatar: '/avatars/prisma.png' },
    description: 'Complete checklist for launching your MVP successfully',
    industry: 'E-commerce',
    stats: { views: 1560, purchases: 203, avgRating: 4.8 },
    previewData: { tasks: 47, integrations: 8 },
    createdAt: '2025-01-13',
  },
  {
    id: '4',
    title: 'Growth Hacking Playbook',
    phase: 'grow',
    cardType: 'insight',
    rarity: 'legendary',
    price: 450,
    seller: { username: 'Ever', avatar: '/avatars/ever.png' },
    description: 'Proven growth strategies from scaling 0 to 100k users',
    industry: 'SaaS & Software',
    stats: { views: 3120, purchases: 289, avgRating: 5.0 },
    previewData: { channels: 15, casestudies: 12 },
    createdAt: '2025-01-12',
  },
  {
    id: '5',
    title: 'Vision Board Template',
    phase: 'vision',
    cardType: 'insight',
    rarity: 'uncommon',
    price: 75,
    seller: { username: 'Zen', avatar: '/avatars/zen.png' },
    description: 'Structured template for articulating your product vision',
    industry: 'Consumer Apps',
    stats: { views: 420, purchases: 34, avgRating: 4.5 },
    previewData: { sections: 8 },
    createdAt: '2025-01-11',
  },
  {
    id: '6',
    title: 'Competitive Analysis Matrix',
    phase: 'research',
    cardType: 'insight',
    rarity: 'rare',
    price: 200,
    seller: { username: 'Virgilia', avatar: '/avatars/virgilia.png' },
    description: 'Deep dive competitive analysis with scoring framework',
    industry: 'FinTech',
    stats: { views: 1100, purchases: 89, avgRating: 4.6 },
    previewData: { competitors: 20, metrics: 15 },
    createdAt: '2025-01-10',
  },
  {
    id: '7',
    title: 'Feature Prioritization Matrix',
    phase: 'build',
    cardType: 'action',
    rarity: 'uncommon',
    price: 100,
    seller: { username: 'Toxic', avatar: '/avatars/toxic.png' },
    description: 'Framework for prioritizing features based on impact vs effort',
    industry: 'B2B',
    stats: { views: 670, purchases: 45, avgRating: 4.4 },
    previewData: { frameworks: 3 },
    createdAt: '2025-01-09',
  },
  {
    id: '8',
    title: 'Investor Pitch Deck Blueprint',
    phase: 'vision',
    cardType: 'milestone',
    rarity: 'epic',
    price: 350,
    seller: { username: 'TechGuru', avatar: '/avatars/techpriest.png' },
    description: 'Winning pitch deck template with proven success stories',
    industry: 'FinTech',
    stats: { views: 2890, purchases: 178, avgRating: 4.9 },
    previewData: { slides: 12, examples: 5 },
    createdAt: '2025-01-08',
  },
  {
    id: '9',
    title: 'SEO Strategy Playbook',
    phase: 'grow',
    cardType: 'action',
    rarity: 'rare',
    price: 180,
    seller: { username: 'Phoenix', avatar: '/avatars/phoenix.png' },
    description: 'Comprehensive SEO strategy for early-stage startups',
    industry: 'E-commerce',
    stats: { views: 1450, purchases: 112, avgRating: 4.7 },
    previewData: { tactics: 23, tools: 15 },
    createdAt: '2025-01-07',
  },
  {
    id: '10',
    title: 'Tech Stack Decision Framework',
    phase: 'build',
    cardType: 'insight',
    rarity: 'common',
    price: 50,
    seller: { username: 'Prisma', avatar: '/avatars/prisma.png' },
    description: 'Guide to choosing the right tech stack for your product',
    industry: 'SaaS & Software',
    stats: { views: 340, purchases: 28, avgRating: 4.2 },
    previewData: { stacks: 8 },
    createdAt: '2025-01-06',
  },
  {
    id: '11',
    title: 'Customer Retention Strategies',
    phase: 'grow',
    cardType: 'insight',
    rarity: 'epic',
    price: 280,
    seller: { username: 'Ever', avatar: '/avatars/ever.png' },
    description: 'Proven tactics to reduce churn and increase customer lifetime value',
    industry: 'SaaS & Software',
    stats: { views: 1980, purchases: 145, avgRating: 4.8 },
    previewData: { strategies: 18, metrics: 12 },
    createdAt: '2025-01-05',
  },
  {
    id: '12',
    title: 'Problem-Solution Fit Canvas',
    phase: 'vision',
    cardType: 'action',
    rarity: 'rare',
    price: 160,
    seller: { username: 'Zen', avatar: '/avatars/zen.png' },
    description: 'Validate problem-solution fit before building',
    industry: 'HealthTech',
    stats: { views: 890, purchases: 72, avgRating: 4.6 },
    previewData: { templates: 4 },
    createdAt: '2025-01-04',
  },
];
