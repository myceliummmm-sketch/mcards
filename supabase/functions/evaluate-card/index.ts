import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EvaluationCriterion {
  name: string;
  description: string;
  evaluator: string;
}

const CRITERIA: EvaluationCriterion[] = [
  { name: 'depth', description: 'How detailed and thorough is the content?', evaluator: 'techpriest' },
  { name: 'relevance', description: 'How connected is this to the project goals?', evaluator: 'prisma' },
  { name: 'credibility', description: 'Is it backed by evidence or data?', evaluator: 'toxic' },
  { name: 'actionability', description: 'How practical and actionable is it?', evaluator: 'prisma' },
  { name: 'impact', description: 'What is the potential effect on success?', evaluator: 'evergreen' },
  { name: 'clarity', description: 'How well articulated is the idea?', evaluator: 'virgilia' },
  { name: 'market_fit', description: 'How aligned with market realities?', evaluator: 'phoenix' }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cardType, cardContent, cardDefinition } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Evaluating card:', cardType);

    // Construct evaluation prompt
    const prompt = `You are a team of startup experts evaluating a "${cardType}" card for a product deck.

Card Question: ${cardDefinition.coreQuestion}
Card Formula: ${cardDefinition.formula}

Card Content:
${JSON.stringify(cardContent, null, 2)}

Evaluate this card on the following 7 criteria. For each criterion, provide:
1. A score from 1-10 (where 1 is poor and 10 is excellent)
2. A brief explanation (1-2 sentences) from the perspective of the assigned team member

Criteria:
${CRITERIA.map(c => `- ${c.name}: ${c.description} (Evaluator: ${c.evaluator})`).join('\n')}

Respond ONLY with valid JSON in this exact format:
{
  "depth": { "score": 7, "explanation": "..." },
  "relevance": { "score": 8, "explanation": "..." },
  "credibility": { "score": 6, "explanation": "..." },
  "actionability": { "score": 8, "explanation": "..." },
  "impact": { "score": 7, "explanation": "..." },
  "clarity": { "score": 9, "explanation": "..." },
  "market_fit": { "score": 7, "explanation": "..." }
}`;

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
            role: 'user',
            content: prompt
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No evaluation generated');
    }

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }

    const evaluation = JSON.parse(jsonMatch[0]);

    // Add evaluator names to each criterion
    const enrichedEvaluation: any = {};
    for (const criterion of CRITERIA) {
      if (evaluation[criterion.name]) {
        enrichedEvaluation[criterion.name] = {
          ...evaluation[criterion.name],
          evaluator: criterion.evaluator
        };
      }
    }

    // Calculate overall score
    const scores = Object.values(enrichedEvaluation).map((e: any) => e.score);
    const overall = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
    enrichedEvaluation.overall = Math.round(overall * 10) / 10;

    console.log('Evaluation complete, overall score:', enrichedEvaluation.overall);

    return new Response(
      JSON.stringify({ evaluation: enrichedEvaluation }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in evaluate-card:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
