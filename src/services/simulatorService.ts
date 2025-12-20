import { supabase } from '@/integrations/supabase/client';

export interface SimulatorParams {
  userClass: 'coder' | 'founder';
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

export const simulatorService = {
  async generateStartup(params: SimulatorParams): Promise<SimulationResult> {
    // 1. Generate text content instantly (mocked)
    const title = params.userClass === 'coder' 
      ? "AI Code Assistant" 
      : "Global Marketplace";
    
    const description = params.difficulty === 'hard' 
      ? "Survival mode activated." 
      : "Viral growth achieved.";

    const cardContent: CardContent = {
      vision_statement: params.userClass === 'coder'
        ? "A world where developers focus on creativity, not boilerplate"
        : "A borderless economy where talent meets opportunity",
      what_becomes_possible: params.userClass === 'coder'
        ? "10x faster development cycles through intelligent automation"
        : "Breaking the boundaries of global markets",
      barrier_removed: params.userClass === 'coder'
        ? "Eliminating repetitive coding tasks forever"
        : "Eliminating middlemen and geographical barriers",
      who_benefits: params.userClass === 'coder'
        ? "Developers worldwide seeking creative freedom"
        : "Global creators and entrepreneurs"
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
