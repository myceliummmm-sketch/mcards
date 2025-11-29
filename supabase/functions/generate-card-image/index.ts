import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Extract meaningful themes from card content
function extractContentThemes(cardType: string, cardContent: string): {
  subject: string;
  visualConcept: string;
  emotion: string;
  context: string;
} {
  // Parse card content to extract key themes
  const contentLower = cardContent.toLowerCase();
  
  // Default themes based on card type
  const typeThemes: Record<string, any> = {
    product: {
      subject: 'an innovative product concept',
      visualConcept: 'the essence of innovation meeting user needs',
      emotion: 'excitement and possibility',
      context: 'A visual metaphor representing the bridge between vision and reality'
    },
    problem: {
      subject: 'a challenge transforming into opportunity',
      visualConcept: 'tension resolving into clarity',
      emotion: 'struggle evolving into understanding',
      context: 'Show the journey from complexity to elegant solution'
    },
    solution: {
      subject: 'an elegant answer emerging',
      visualConcept: 'clarity cutting through complexity',
      emotion: 'relief and empowerment',
      context: 'The moment of breakthrough visualized'
    },
    customer: {
      subject: 'human needs and desires',
      visualConcept: 'empathy and understanding personified',
      emotion: 'connection and recognition',
      context: 'Abstract representation of the human experience being served'
    },
    value: {
      subject: 'transformation and benefit',
      visualConcept: 'value being created and delivered',
      emotion: 'satisfaction and growth',
      context: 'The exchange of value visualized as energy or light'
    },
    channels: {
      subject: 'pathways and connections',
      visualConcept: 'networks of communication flowing',
      emotion: 'accessibility and reach',
      context: 'Abstract representation of connectivity and distribution'
    },
    revenue: {
      subject: 'sustainable growth patterns',
      visualConcept: 'value exchange and prosperity',
      emotion: 'abundance and sustainability',
      context: 'Organic growth patterns representing financial health'
    },
    costs: {
      subject: 'efficient resource allocation',
      visualConcept: 'balance and optimization',
      emotion: 'stability and wisdom',
      context: 'Geometric precision representing careful management'
    },
    metrics: {
      subject: 'success indicators and patterns',
      visualConcept: 'data becoming insight',
      emotion: 'clarity and confidence',
      context: 'Abstract visualization of measurement and progress'
    },
    risks: {
      subject: 'uncertainty and mitigation',
      visualConcept: 'challenges being navigated',
      emotion: 'vigilance and preparedness',
      context: 'Storms clearing or obstacles being overcome'
    }
  };

  // Try to extract specific content themes
  let themes = typeThemes[cardType] || typeThemes.product;
  
  // Enhance with content-specific details if available
  if (contentLower.includes('ai') || contentLower.includes('artificial intelligence')) {
    themes.context += ' with subtle technological intelligence motifs';
  }
  if (contentLower.includes('fitness') || contentLower.includes('health')) {
    themes.context += ' incorporating organic vitality and human energy';
  }
  if (contentLower.includes('learning') || contentLower.includes('education')) {
    themes.context += ' with elements of growth and enlightenment';
  }
  
  return themes;
}

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

    // Enhanced art styles per phase
    const phaseStyles: Record<string, { style: string; colors: string[]; mood: string; composition: string }> = {
      vision: { 
        style: 'ethereal dreamscape with soft flowing gradients and mystical energy',
        colors: ['deep violet', 'soft rose gold', 'starlight white'],
        mood: 'visionary and transcendent',
        composition: 'central radiant focus with flowing organic forms'
      },
      research: { 
        style: 'clean data visualization aesthetic with elegant information design',
        colors: ['ocean blue', 'mint cyan', 'silver'],
        mood: 'analytical and insightful',
        composition: 'layered depth with geometric precision'
      },
      build: { 
        style: 'constructivist architectural forms with technical elegance',
        colors: ['forest green', 'copper', 'stone gray'],
        mood: 'technical and purposeful',
        composition: 'isometric perspective with structured elements'
      },
      grow: { 
        style: 'organic growth patterns merging with dynamic energy',
        colors: ['sunrise orange', 'warm gold', 'coral pink'],
        mood: 'expansive and vibrant',
        composition: 'explosive radial energy with forward motion'
      }
    };

    const selectedStyle = phaseStyles[phase] || phaseStyles.vision;
    
    // Extract meaningful themes from card content
    const extractedThemes = extractContentThemes(cardType, cardContent);
    
    // Construct sophisticated, personalized prompt
    const prompt = `Create a premium collectible card illustration:

Subject: ${extractedThemes.subject}
Visual Concept: ${extractedThemes.visualConcept}
Emotional Tone: ${extractedThemes.emotion || selectedStyle.mood}

Art Direction:
- Style: ${selectedStyle.style}
- Color Palette: ${selectedStyle.colors.join(', ')} with subtle gradients
- Composition: ${selectedStyle.composition}
- Lighting: Cinematic with dramatic highlights and atmospheric depth
- Details: High-quality digital art, refined but not cluttered, gallery-worthy

Visual Identity: 
${extractedThemes.context}

Technical Requirements:
- No text, letters, or words anywhere in the image
- Abstract representation preferred over literal depiction
- Focus on evoking emotion and concept rather than explicit storytelling
- Suitable for portrait-oriented trading card format`;

    console.log('Generating personalized image with prompt:', prompt);

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
