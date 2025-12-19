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
    const { cardData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Extract data from Vision cards
    const product = cardData?.slot_1 || {};
    const problem = cardData?.slot_2 || {};
    const audience = cardData?.slot_3 || {};
    const value = cardData?.slot_4 || {};
    const vision = cardData?.slot_5 || {};

    const prompt = `Based on the following product information, generate DETAILED and COMPELLING website landing page sections. Be specific, use the actual data provided, and create persuasive copy.

PRODUCT INFO:
- Product Name: ${product.product_name || 'Not specified'}
- One-liner: ${product.one_liner || 'Not specified'}
- Analogy: ${product.analogy || 'Not specified'}
- Target Audience: ${product.target_audience || audience.demographics || 'Not specified'}

PROBLEM:
- Who suffers: ${problem.who_suffers || 'Not specified'}
- Pain: ${problem.pain_description || 'Not specified'}
- Cost of inaction: ${problem.pain_cost || 'Not specified'}

AUDIENCE:
- Demographics: ${audience.demographics || 'Not specified'}
- Goals: ${audience.goals || 'Not specified'}
- Pain points: ${audience.pain_points || 'Not specified'}

VALUE PROPOSITION:
- Current alternative: ${value.current_alternative || 'Not specified'}
- Alternative cost: ${value.alternative_cost || 'Not specified'}
- Your solution: ${value.your_solution || 'Not specified'}
- Your price: ${value.your_price || 'Not specified'}

VISION:
- Vision statement: ${vision.vision_statement || 'Not specified'}
- What becomes possible: ${vision.what_becomes_possible || 'Not specified'}

Generate 6 website sections with RICH, DETAILED content. Each section should be 2-4 sentences of compelling copy:`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert website copywriter and conversion specialist. Generate compelling landing page content that converts visitors into customers.
Always respond with valid JSON in this exact format:
{
  "sections": [
    {"id": "hero", "title": "Hero Section", "content": "Powerful headline and subheadline that captures attention and communicates the core value proposition in 2-3 sentences"},
    {"id": "problem", "title": "The Problem", "content": "Describe the pain point your audience faces. Make them feel understood. 2-3 sentences."},
    {"id": "solution", "title": "The Solution", "content": "How your product solves the problem. Be specific about the transformation. 2-3 sentences."},
    {"id": "benefits", "title": "Key Benefits", "content": "List 3-4 specific benefits with brief explanations. Use bullet-point style text."},
    {"id": "social_proof", "title": "Social Proof", "content": "Trust indicators, testimonial-style text, or credibility markers. 2-3 sentences."},
    {"id": "cta", "title": "Call to Action", "content": "Compelling CTA with urgency and clear next step. Include pricing if available. 2-3 sentences."}
  ],
  "metadata": {
    "product_name": "extracted product name",
    "tagline": "short catchy tagline",
    "primary_color_suggestion": "color name based on product personality"
  }
}
Be specific and compelling. Use the actual product details provided. Create copy that sells.`
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    console.log('AI Response:', content.substring(0, 500));
    
    // Parse JSON from response
    let sections;
    let metadata = {};
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        sections = parsed.sections;
        metadata = parsed.metadata || {};
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
    }

    // Fallback sections if parsing fails
    if (!sections || !Array.isArray(sections)) {
      sections = [
        { 
          id: 'hero', 
          title: 'Hero Section', 
          content: product.one_liner 
            ? `${product.product_name || 'Our Product'}: ${product.one_liner}. ${product.analogy || ''}`
            : `${product.product_name || 'Our Product'} - Transforming how ${product.target_audience || 'you'} achieve success.`
        },
        { 
          id: 'problem', 
          title: 'The Problem', 
          content: problem.pain_description 
            ? `${problem.who_suffers || 'Many people'} face a real challenge: ${problem.pain_description}. The cost? ${problem.pain_cost || 'Wasted time, money, and opportunity'}.`
            : `Traditional solutions aren't cutting it. You deserve better.`
        },
        { 
          id: 'solution', 
          title: 'The Solution', 
          content: value.your_solution 
            ? `${value.your_solution}. Unlike ${value.current_alternative || 'existing solutions'}, we deliver real results.`
            : `A smarter approach that actually works.`
        },
        { 
          id: 'benefits', 
          title: 'Key Benefits', 
          content: audience.goals 
            ? `• Achieve ${audience.goals}\n• Save time and resources\n• Get results faster\n• Expert support included`
            : `• Save time and money\n• Easy to use\n• Proven results\n• Expert support`
        },
        { 
          id: 'social_proof', 
          title: 'Social Proof', 
          content: `Trusted by ${product.target_audience || 'thousands of users'} worldwide. Join the community transforming their results.`
        },
        { 
          id: 'cta', 
          title: 'Call to Action', 
          content: value.your_price 
            ? `Get started today for just ${value.your_price}. Transform your results in minutes, not months.`
            : `Start your free trial today. No credit card required. See the difference for yourself.`
        },
      ];
      
      metadata = {
        product_name: product.product_name || 'Your Product',
        tagline: product.one_liner || 'The smarter solution',
        primary_color_suggestion: 'blue'
      };
    }

    // Return sections along with raw card data for richer prompt generation
    return new Response(JSON.stringify({ 
      sections, 
      metadata,
      rawCardData: {
        product,
        problem,
        audience,
        value,
        vision
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-website-brief:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
