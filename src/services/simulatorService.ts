import { supabase } from '@/integrations/supabase/client';

export type InterestArena = 'gaming' | 'fintech' | 'health' | 'ai' | 'crypto' | 'ecommerce' | 'education' | 'saas';
export type UserClass = 'coder' | 'founder' | 'designer' | 'marketer' | 'hustler' | 'dreamer';

export interface SimulatorParams {
  userClass: UserClass;
  interest: InterestArena;
  difficulty: 'hard' | 'god';
  language: string;
}

export interface CardContent {
  vision_statement: string;
  what_becomes_possible: string;
  barrier_removed: string;
  who_benefits: string;
}

export interface SimulationResult {
  title: string;
  description: string;
  stats: {
    users: string;
    revenue: string;
  };
  imageUrl: string;
  cardContent: CardContent;
}

// Arena-specific content templates
const arenaContent: Record<InterestArena, { domain: string; audience: string; problem: string }> = {
  gaming: { domain: 'Gaming & Entertainment', audience: 'gamers and content creators', problem: 'fragmented gaming experiences' },
  fintech: { domain: 'Finance & Commerce', audience: 'businesses and consumers', problem: 'financial friction and barriers' },
  health: { domain: 'Health & Wellness', audience: 'health-conscious individuals', problem: 'disconnected health data' },
  ai: { domain: 'AI & Productivity', audience: 'knowledge workers', problem: 'repetitive manual tasks' },
  crypto: { domain: 'Crypto & Web3', audience: 'traders and builders', problem: 'complex onboarding and trust issues' },
  ecommerce: { domain: 'E-commerce & Retail', audience: 'merchants and shoppers', problem: 'customer acquisition costs' },
  education: { domain: 'Education & Learning', audience: 'students and professionals', problem: 'engagement and skill gaps' },
  saas: { domain: 'SaaS & Productivity', audience: 'teams and businesses', problem: 'workflow inefficiencies' }
};

// Class-specific content generation
const classContent: Record<UserClass, { titleSuffix: string; visionPrefix: string; approach: string }> = {
  coder: { titleSuffix: 'AI Platform', visionPrefix: 'harness AI to transform', approach: 'intelligent automation' },
  founder: { titleSuffix: 'Marketplace', visionPrefix: 'create a borderless economy in', approach: 'strategic vision' },
  designer: { titleSuffix: 'Experience', visionPrefix: 'reimagine the beauty of', approach: 'design-driven innovation' },
  marketer: { titleSuffix: 'Growth Engine', visionPrefix: 'amplify the reach of', approach: 'viral growth strategies' },
  hustler: { titleSuffix: 'Empire', visionPrefix: 'disrupt and dominate', approach: 'relentless execution' },
  dreamer: { titleSuffix: 'Revolution', visionPrefix: 'imagine a world transformed by', approach: 'visionary thinking' }
};

export const simulatorService = {
  async generateStartup(params: SimulatorParams): Promise<SimulationResult> {
    const arena = arenaContent[params.interest];
    const classInfo = classContent[params.userClass];
    
    // 1. Generate personalized text content based on class
    const title = `${arena.domain} ${classInfo.titleSuffix}`;
    
    const description = params.difficulty === 'hard' 
      ? `Disrupting ${arena.domain.toLowerCase()} against all odds.` 
      : `Viral growth in ${arena.domain.toLowerCase()} achieved.`;

    const cardContent: CardContent = {
      vision_statement: `A world where ${arena.audience} ${classInfo.visionPrefix} ${arena.domain.toLowerCase()}`,
      what_becomes_possible: `10x faster innovation in ${arena.domain.toLowerCase()} through ${classInfo.approach}`,
      barrier_removed: `Eliminating ${arena.problem} forever`,
      who_benefits: `${arena.audience.charAt(0).toUpperCase() + arena.audience.slice(1)} and entrepreneurs`
    };

    // 2. Call the REAL AI Image Generator
    console.log("Hacking visual cortex...");
    
    let imageUrl = "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=600&fit=crop"; // Fallback
    
    try {
      const { data: imgData, error: imgError } = await supabase.functions.invoke('generate-card-image', {
        body: { 
          cardSlot: 5, // Vision template - triggers low-poly 3D style
          cardContent: cardContent 
        }
      });

      if (imgError) {
        console.error('Image generation error:', imgError);
      } else if (imgData?.imageUrl) {
        imageUrl = imgData.imageUrl;
        console.log("Visual cortex hacked successfully!");
      }
    } catch (error) {
      console.error('Failed to generate image:', error);
    }

    return {
      title,
      description,
      stats: {
        users: params.difficulty === 'god' ? "10M+" : "1.2M",
        revenue: params.difficulty === 'god' ? "$500k/mo" : "$50k/mo"
      },
      imageUrl,
      cardContent
    };
  }
};
