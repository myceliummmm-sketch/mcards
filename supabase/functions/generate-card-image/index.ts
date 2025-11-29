import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Extract content themes for crystal specimen visualization
function extractContentThemes(cardType: string, cardContent: string): {
  crystalType: string;
  annotation: string;
  diagram: string;
  scientificFocus: string;
} {
  const contentLower = cardContent.toLowerCase();
  
  // Card-specific crystal visual mappings
  const cardVisuals: Record<string, any> = {
    product: {
      crystalType: 'luminous seed crystal with internal light source, pristine geometric facets',
      annotation: 'POTENTIAL ENERGY READING',
      diagram: 'Cross-section analysis: Core concept nucleus emitting conceptual photons',
      scientificFocus: 'Innovation Emission Patterns'
    },
    problem: {
      crystalType: 'fractured crystal specimen with visible stress fracture lines',
      annotation: 'FRACTURE POINT ANALYSIS',
      diagram: 'Pressure distribution map showing pain vector concentration zones',
      scientificFocus: 'Structural Weakness Assessment'
    },
    solution: {
      crystalType: 'perfectly faceted solution gem refracting prismatic light beams',
      annotation: 'LIGHT REFRACTION EFFICIENCY',
      diagram: 'Energy channeling pathways demonstrating elegant problem resolution',
      scientificFocus: 'Clarity Optimization Study'
    },
    customer: {
      crystalType: 'resonating crystal vibrating at harmonic frequencies',
      annotation: 'RESONANCE FREQUENCY MATCH',
      diagram: 'Harmonic alignment patterns with external signal sources',
      scientificFocus: 'User Alignment Metrics'
    },
    value: {
      crystalType: 'energy exchange crystal cluster showing bi-directional flow',
      annotation: 'ENERGY EXCHANGE RATIOS',
      diagram: 'Input/output flow measurement with value transformation visualization',
      scientificFocus: 'Transformation Efficiency'
    },
    competitor: {
      crystalType: 'comparative specimen array displaying density variations',
      annotation: 'COMPARATIVE DENSITY ANALYSIS',
      diagram: 'Side-by-side differentiation markers with competitive advantage zones',
      scientificFocus: 'Market Position Study'
    },
    market: {
      crystalType: 'vast crystalline landscape from aerial survey perspective',
      annotation: 'DEPOSIT SIZE ESTIMATION',
      diagram: 'TAM/SAM/SOM boundary delineation with growth zone markers',
      scientificFocus: 'Market Topology Survey'
    },
    features: {
      crystalType: 'multi-faceted crystal with individually labeled capability faces',
      annotation: 'FACET CAPABILITY INDEX',
      diagram: 'Each polished face represents distinct feature functionality',
      scientificFocus: 'Feature Set Taxonomy'
    },
    metrics: {
      crystalType: 'measurement crystal with internal calibration grid system',
      annotation: 'GROWTH VELOCITY TRACKING',
      diagram: 'KPI calibration markers with performance threshold indicators',
      scientificFocus: 'Progress Measurement Matrix'
    },
    team: {
      crystalType: 'interconnected crystal lattice network showing collaboration bonds',
      annotation: 'SYNERGY COEFFICIENT ANALYSIS',
      diagram: 'Team node connections with skill set intersection visualizations',
      scientificFocus: 'Collective Capability Study'
    },
    channels: {
      crystalType: 'branching crystal pathways forming distribution networks',
      annotation: 'PATHWAY CONDUCTIVITY RATING',
      diagram: 'Communication channel flow with reach optimization patterns',
      scientificFocus: 'Distribution Network Analysis'
    },
    revenue: {
      crystalType: 'organic growth spiral crystal with expanding formation rings',
      annotation: 'SUSTAINABLE GROWTH RATE',
      diagram: 'Revenue stream patterns showing recurring flow structures',
      scientificFocus: 'Financial Health Indicators'
    }
  };

  // Get base themes or default to product
  let themes = cardVisuals[cardType] || cardVisuals.product;
  
  // Enhance with content-specific details
  if (contentLower.includes('ai') || contentLower.includes('artificial intelligence')) {
    themes.diagram += ' · Enhanced with neural network pattern overlay';
  }
  if (contentLower.includes('fitness') || contentLower.includes('health')) {
    themes.diagram += ' · Organic vitality signatures detected';
  }
  if (contentLower.includes('learning') || contentLower.includes('education')) {
    themes.diagram += ' · Knowledge growth vectors visible';
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

    // Phase-specific crystal types and styling
    const phaseStyles: Record<string, { crystalColor: string; accentColors: string[]; scientificTheme: string }> = {
      vision: { 
        crystalColor: 'ethereal purple-pink quartz with internal glow',
        accentColors: ['neon pink #FF6B9D', 'neon purple #B388FF', 'gold #FFD700'],
        scientificTheme: 'ENERGY EMISSION ANALYSIS'
      },
      research: { 
        crystalColor: 'geometric cyan data crystal with lattice structure',
        accentColors: ['neon cyan #00F0FF', 'electric blue #0EA5E9', 'silver #C0C0C0'],
        scientificTheme: 'STRUCTURAL ANALYSIS'
      },
      build: { 
        crystalColor: 'industrial green construction crystal with metallic inclusions',
        accentColors: ['forest green #10B981', 'copper #B45309', 'stone gray #78716C'],
        scientificTheme: 'LOAD-BEARING PROPERTIES'
      },
      grow: { 
        crystalColor: 'expanding orange fractal crystal with growth rings',
        accentColors: ['sunrise orange #FB923C', 'warm gold #FFD700', 'coral pink #FF6B9D'],
        scientificTheme: 'GROWTH RATE METRICS'
      }
    };

    const selectedStyle = phaseStyles[phase] || phaseStyles.vision;
    
    // Extract crystal specimen details from card content
    const crystalSpec = extractContentThemes(cardType, cardContent);
    
    // Master Field Guide prompt template
    const prompt = `STYLE: 1989 technical field guide page meets synthwave aesthetics.

SUBJECT: Low-poly crystal specimen - ${crystalSpec.crystalType}
Crystal Coloration: ${selectedStyle.crystalColor}

VISUAL FORMAT - Technical Documentation Page:
- Base: Aged cream/ivory paper texture (#F5F0E6) with subtle grain and yellowing
- Main visual: Crystal specimen as precise technical diagram (40-60% of frame, centered)
- Scientific measurement callouts with thin leader lines pointing to crystal features
- Mixed typography: Technical monospace labels + handwritten margin annotations
- Scattered data points, grid coordinates, classification codes in margins
- Chrome beveled metallic tab at top edge showing specimen category
- Page feels like essential documentation from founder's handbook

ANNOTATION DETAILS:
- Primary callout: "${crystalSpec.annotation}"
- Technical diagram note: "${crystalSpec.diagram}"
- Scientific classification: "${selectedStyle.scientificTheme}"
- Additional margin notes in cursive handwriting style with arrows

COLOR PALETTE:
- Base paper: Cream (#F5F0E6), aged ivory (#FBF8F3)
- Neon accents: ${selectedStyle.accentColors.join(', ')}
- Chrome elements: Metallic silver-white highlights with reflective finish
- Technical ink: Deep navy (#1E293B) for precise labels, faded blue (#64748B) for annotations

COMPOSITION ELEMENTS:
- Crystal specimen centered with 40-60% frame coverage
- Technical callout lines radiating to margins (thin, precise)
- Handwritten notes in margins at slight angles with connecting arrows
- Small certification stamps or seals in corners (rotated 5-10°)
- Subtle engineering grid overlay (very faint)
- Measurement scale marks along edges
- Page number "X/22" format at bottom right corner with horizontal line above
- "FIG. {number}" label near specimen

TECHNICAL SPECIFICATIONS:
- Low-poly geometric crystal facets (not organic, sharp angles)
- Chrome beveled tab has 3D depth with gradient sheen
- Paper texture must show subtle fiber grain and age spots
- Neon accent colors used sparingly but impactfully on key elements
- Scientific diagram aesthetic - precise, educational, professional
- Blend of cold technical precision with warm handwritten humanity

8K detail on:
- Paper grain texture and slight yellowing
- Chrome metallic reflections and beveled edges  
- Crystal facet precision and light refraction
- Handwritten annotation authenticity

CRITICAL: NO text, letters, numbers, or readable words in the image itself.
Portrait orientation. This is a scientific specimen study page.`;

    console.log('Generating Crystal Builder Field Guide card:', crystalSpec.crystalType);

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

    console.log('Crystal Builder card image generated successfully');

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