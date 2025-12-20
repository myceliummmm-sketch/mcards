import { supabase } from '@/integrations/supabase/client';

export interface GenerateCardParams {
  deckId: string;
  slot: number;
  language: string;
}

export interface GenerateCardResponse {
  success: boolean;
  cardData?: Record<string, any>;
  error?: string;
}

export const aiService = {
  async generateCard(params: GenerateCardParams): Promise<Record<string, any>> {
    const { data, error } = await supabase.functions.invoke<GenerateCardResponse>(
      'auto-complete-single-card',
      { body: params }
    );

    if (error) throw error;
    if (!data?.success) throw new Error(data?.error || 'Failed to generate');

    return data.cardData || {};
  }
};
