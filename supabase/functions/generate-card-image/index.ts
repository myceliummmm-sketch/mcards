import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cardType, cardContent, phase } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Define phase themes
    const phaseThemes: Record<string, { colors: string; mood: string }> = {
      vision: { colors: 'deep purple and violet with mystical glowing accents', mood: 'mystical and visionary' },
      research: { colors: 'electric blue and cyan with data-like patterns', mood: 'analytical and insightful' },
      build: { colors: 'emerald green and mint with technical circuits', mood: 'technical and constructive' },
      grow: { colors: 'vibrant orange and gold with explosive energy', mood: 'dynamic and expansive' }
    };

    const theme = phaseThemes[phase] || phaseThemes.vision;

    // Construct prompt for image generation
    const prompt = `Create a collectible trading card style illustration for a "${cardType}" card. 
Theme: ${theme.mood}. 
Visual style: Dark cyberpunk aesthetic with ${theme.colors}, glowing neon accents, holographic effects. 
The card should evoke the feeling of: ${cardContent}. 
Art style: High-quality digital art, game card illustration, detailed but not cluttered. 
Composition: Central focused imagery with subtle geometric patterns in background.
No text or words in the image.`;

    console.log('Generating image with prompt:', prompt);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      throw new Error('No image generated');
    }

    console.log('Image generated successfully');

    return new Response(
      JSON.stringify({ imageUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-card-image:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
