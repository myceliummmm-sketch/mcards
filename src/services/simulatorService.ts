import { supabase } from '@/integrations/supabase/client';

export type InterestArena = 'gaming' | 'fintech' | 'health' | 'ai';

export interface SimulatorParams {
  userClass: 'coder' | 'founder';
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
  ai: { domain: 'AI & Productivity', audience: 'knowledge workers', problem: 'repetitive manual tasks' }
};

export const simulatorService = {
  async generateStartup(params: SimulatorParams): Promise<SimulationResult> {
    const arena = arenaContent[params.interest];
    
    // 1. Generate personalized text content
    const title = params.userClass === 'coder' 
      ? `${arena.domain} AI Platform` 
      : `${arena.domain} Marketplace`;
    
    const description = params.difficulty === 'hard' 
      ? `Disrupting ${arena.domain.toLowerCase()} against all odds.` 
      : `Viral growth in ${arena.domain.toLowerCase()} achieved.`;

    const cardContent: CardContent = {
      vision_statement: params.userClass === 'coder'
        ? `A world where ${arena.audience} harness AI to transform ${arena.domain.toLowerCase()}`
        : `A borderless ${arena.domain.toLowerCase()} economy where talent meets opportunity`,
      what_becomes_possible: params.userClass === 'coder'
        ? `10x faster innovation in ${arena.domain.toLowerCase()} through intelligent automation`
        : `Breaking the boundaries of ${arena.domain.toLowerCase()} markets globally`,
      barrier_removed: params.userClass === 'coder'
        ? `Eliminating ${arena.problem} forever`
        : `Removing middlemen and ${arena.problem}`,
      who_benefits: params.userClass === 'coder'
        ? `Developers and ${arena.audience} worldwide`
        : `${arena.audience.charAt(0).toUpperCase() + arena.audience.slice(1)} and entrepreneurs`
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
