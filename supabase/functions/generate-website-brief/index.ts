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

    const prompt = `Based on the following product information, generate website landing page sections. Be specific and compelling.

PRODUCT INFO:
- Product Name: ${product.product_name || 'Not specified'}
- One-liner: ${product.one_liner || 'Not specified'}
- Analogy: ${product.analogy || 'Not specified'}
- Target Audience: ${product.target_audience || audience.demographics || 'Not specified'}

PROBLEM:
- Who suffers: ${problem.who_suffers || 'Not specified'}
- Pain: ${problem.pain_description || 'Not specified'}
- Cost: ${problem.pain_cost || 'Not specified'}

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

Generate 5 website sections in this exact JSON format. Make the content compelling and specific to the product:`;

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
            content: `You are a website copywriter. Generate compelling landing page content.
Always respond with valid JSON in this exact format:
{
  "sections": [
    {"id": "hero", "title": "Hero Section", "content": "headline and subheadline"},
    {"id": "problem", "title": "Problem Statement", "content": "pain point description"},
    {"id": "solution", "title": "Solution", "content": "how the product solves the problem"},
    {"id": "benefits", "title": "Key Benefits", "content": "3-4 key benefits"},
    {"id": "cta", "title": "Call to Action", "content": "compelling CTA text"}
  ]
}
Keep each content field under 200 characters. Be specific and compelling.`
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Parse JSON from response
    let sections;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        sections = parsed.sections;
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
          content: product.one_liner || `${product.product_name || 'Our Product'} - The smart solution for ${product.target_audience || 'you'}` 
        },
        { 
          id: 'problem', 
          title: 'Problem Statement', 
          content: problem.pain_description || `${problem.who_suffers || 'People'} struggle with common challenges that cost them ${problem.pain_cost || 'time and money'}` 
        },
        { 
          id: 'solution', 
          title: 'Solution', 
          content: value.your_solution || `Instead of ${value.current_alternative || 'expensive alternatives'}, get better results at a fraction of the cost` 
        },
        { 
          id: 'benefits', 
          title: 'Key Benefits', 
          content: `Save time, reduce costs, and achieve ${audience.goals || 'your goals'} faster than ever before` 
        },
        { 
          id: 'cta', 
          title: 'Call to Action', 
          content: `Start your journey today for just ${value.your_price || 'an affordable price'}. Join thousands of satisfied users!` 
        },
      ];
    }

    return new Response(JSON.stringify({ sections }), {
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
