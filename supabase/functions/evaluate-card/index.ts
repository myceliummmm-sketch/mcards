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
    const prompt = `You are a team of critical startup experts evaluating a "${cardType}" card for a product deck.

Card Question: ${cardDefinition.coreQuestion}
Card Formula: ${cardDefinition.formula}

Card Content:
${JSON.stringify(cardContent, null, 2)}

CRITICAL SCORING GUIDELINES:
- Evaluate each criterion INDEPENDENTLY based on the ACTUAL content provided
- Use the FULL 1-10 range - do NOT default to middle scores
- Be CRITICAL and DISCRIMINATING - not everything deserves a 7
- Empty, placeholder, or vague content should score 1-3
- Generic content without specifics should score 4-5
- Adequate content with some details should score 6-7
- Strong content with evidence/research should score 8-9
- Exceptional, compelling content should score 10

SCORING RUBRIC:
- 1-2: Missing, empty, or placeholder content (e.g., "lorem ipsum", "TBD", single words)
- 3-4: Vague, generic statements lacking any specifics or evidence
- 5-6: Adequate but surface-level, needs more depth or supporting details
- 7-8: Good with specific details, clear rationale, and some evidence
- 9-10: Excellent with compelling evidence, unique insights, and thorough analysis

Evaluate on these 7 criteria:
${CRITERIA.map(c => `- ${c.name}: ${c.description} (Evaluator: ${c.evaluator})`).join('\n')}

For each criterion, provide a score (1-10) and a brief explanation (1-2 sentences) from the evaluator's perspective.

Respond ONLY with valid JSON:
{
  "depth": { "score": YOUR_SCORE, "explanation": "Your evaluation..." },
  "relevance": { "score": YOUR_SCORE, "explanation": "Your evaluation..." },
  "credibility": { "score": YOUR_SCORE, "explanation": "Your evaluation..." },
  "actionability": { "score": YOUR_SCORE, "explanation": "Your evaluation..." },
  "impact": { "score": YOUR_SCORE, "explanation": "Your evaluation..." },
  "clarity": { "score": YOUR_SCORE, "explanation": "Your evaluation..." },
  "market_fit": { "score": YOUR_SCORE, "explanation": "Your evaluation..." }
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

    // Parse JSON from response - with robust cleaning
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response:', content);
      throw new Error('Invalid response format');
    }

    let jsonString = jsonMatch[0];
    
    // Clean common JSON issues from AI responses
    // Remove any markdown code block markers that might be inside
    jsonString = jsonString.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Fix unescaped newlines within string values
    jsonString = jsonString.replace(/(?<=:\s*"[^"]*)\n(?=[^"]*")/g, '\\n');
    
    // Try to parse, with fallback cleaning
    let evaluation;
    try {
      evaluation = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Initial parse failed, attempting cleanup:', parseError);
      
      // More aggressive cleanup: replace problematic characters in string values
      // This regex finds string values and escapes internal quotes
      jsonString = jsonString.replace(/"explanation":\s*"([^"]*)"/g, (_match: string, p1: string) => {
        const cleaned = p1.replace(/"/g, '\\"').replace(/\n/g, ' ');
        return `"explanation": "${cleaned}"`;
      });
      
      try {
        evaluation = JSON.parse(jsonString);
      } catch (secondError) {
        console.error('Second parse failed:', secondError);
        console.error('Problematic JSON:', jsonString.substring(0, 500));
        throw new Error('Failed to parse AI response as JSON');
      }
    }

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
