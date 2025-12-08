import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DemoCardConfig {
  id: string;
  slot: number;
  cardContent: Record<string, string>;
}

const DEMO_CARD_CONFIGS: DemoCardConfig[] = [
  {
    id: 'demo-problem',
    slot: 2,
    cardContent: {
      pain_summary: 'Freelancers lose 30% of income to late payments',
      user_emotion: 'Frustrated and anxious about cash flow',
      desired_outcome: 'Guaranteed payment within 24 hours'
    }
  },
  {
    id: 'demo-audience',
    slot: 3,
    cardContent: {
      who_description: 'Solo designers & developers, 28-42',
      key_behaviors: 'Value creative freedom, use modern tools',
      access_channels: 'Twitter, Dribbble, ProductHunt'
    }
  },
  {
    id: 'demo-market',
    slot: 6,
    cardContent: {
      market_name: 'Invoice Financing for Freelancers',
      market_size: '$3.1B market opportunity',
      key_trends: '40% YoY growth in freelance economy'
    }
  },
  {
    id: 'demo-mvp',
    slot: 12,
    cardContent: {
      feature_list: 'One-click invoice, payment guarantee, reminders',
      launch_timeline: '6-week build',
      success_metric: 'First 100 paying freelancers'
    }
  }
];

export function useDemoCardImages() {
  const [images, setImages] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCards, setLoadingCards] = useState<Set<string>>(new Set());

  const generateImageForCard = async (cardId: string): Promise<string | null> => {
    const config = DEMO_CARD_CONFIGS.find(c => c.id === cardId);
    if (!config) return null;

    // Check if already in cache
    if (images[cardId]) return images[cardId];

    // Check if already loading
    if (loadingCards.has(cardId)) return null;

    setLoadingCards(prev => new Set(prev).add(cardId));

    try {
      const { data, error } = await supabase.functions.invoke('generate-card-image', {
        body: {
          cardSlot: config.slot,
          cardContent: config.cardContent
        }
      });

      if (error) throw error;

      if (data?.imageUrl) {
        setImages(prev => ({ ...prev, [cardId]: data.imageUrl }));
        return data.imageUrl;
      }
    } catch (error) {
      console.error(`Failed to generate image for ${cardId}:`, error);
    } finally {
      setLoadingCards(prev => {
        const next = new Set(prev);
        next.delete(cardId);
        return next;
      });
    }

    return null;
  };

  const generateAllImages = async () => {
    setIsLoading(true);
    
    // Generate images sequentially to avoid rate limits
    for (const config of DEMO_CARD_CONFIGS) {
      if (!images[config.id]) {
        await generateImageForCard(config.id);
      }
    }
    
    setIsLoading(false);
  };

  const clearCache = () => {
    setImages({});
  };

  const isCardLoading = (cardId: string) => loadingCards.has(cardId);

  return {
    images,
    isLoading,
    generateImageForCard,
    generateAllImages,
    clearCache,
    isCardLoading
  };
}
