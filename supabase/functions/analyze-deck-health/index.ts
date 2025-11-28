import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.86.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { deckId } = await req.json();

    if (!deckId) {
      return new Response(JSON.stringify({ error: 'deckId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch deck and cards
    const { data: deck, error: deckError } = await supabase
      .from('decks')
      .select('*')
      .eq('id', deckId)
      .single();

    if (deckError) throw deckError;

    const { data: deckCards, error: cardsError } = await supabase
      .from('deck_cards')
      .select('*')
      .eq('deck_id', deckId);

    if (cardsError) throw cardsError;

    // Calculate metrics
    const totalSlots = 22;
    const filledCards = deckCards.filter(card => card.card_data && Object.keys(card.card_data).length > 0);
    const completionRate = (filledCards.length / totalSlots) * 100;

    // Phase distribution
    const phaseSlots = {
      vision: [1, 2, 3, 4, 5],
      research: [6, 7, 8, 9, 10, 11],
      build: [12, 13, 14, 15, 16, 17],
      grow: [18, 19, 20, 21, 22]
    };

    const phaseCompletion = Object.entries(phaseSlots).map(([phase, slots]) => {
      const filledInPhase = filledCards.filter(card => slots.includes(card.card_slot));
      return {
        phase,
        filled: filledInPhase.length,
        total: slots.length,
        percentage: (filledInPhase.length / slots.length) * 100
      };
    });

    // Calculate balance (how evenly distributed across phases)
    const phasePercentages = phaseCompletion.map(p => p.percentage);
    const avgPercentage = phasePercentages.reduce((a, b) => a + b, 0) / phasePercentages.length;
    const variance = phasePercentages.reduce((sum, p) => sum + Math.pow(p - avgPercentage, 2), 0) / phasePercentages.length;
    const balanceScore = Math.max(0, 100 - (Math.sqrt(variance) * 2));

    // Quality score (based on evaluation scores if available)
    const evaluatedCards = filledCards.filter(card => card.evaluation);
    const qualityScores = evaluatedCards.map(card => {
      const evaluation = card.evaluation as any;
      return evaluation?.scores?.overall || 0;
    });
    const qualityScore = qualityScores.length > 0 
      ? qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length 
      : 50;

    // Card type variety
    const cardTypes = new Set(filledCards.map(card => card.card_type));
    const varietyScore = Math.min(100, (cardTypes.size / 8) * 100); // Assuming ~8 different card types

    // Overall health score (weighted average)
    const overallScore = Math.round(
      completionRate * 0.4 +
      balanceScore * 0.25 +
      qualityScore * 0.25 +
      varietyScore * 0.1
    );

    // Prepare context for AI analysis
    const analysisContext = {
      deckTitle: deck.title,
      completionRate: Math.round(completionRate),
      filledCards: filledCards.length,
      totalCards: totalSlots,
      phaseBreakdown: phaseCompletion,
      balanceScore: Math.round(balanceScore),
      qualityScore: Math.round(qualityScore),
      varietyScore: Math.round(varietyScore),
      overallScore,
      weakestPhase: phaseCompletion.reduce((min, p) => p.percentage < min.percentage ? p : min),
      strongestPhase: phaseCompletion.reduce((max, p) => p.percentage > max.percentage ? p : max),
      hasEvaluations: evaluatedCards.length > 0,
      evaluatedCardsCount: evaluatedCards.length
    };

    // Generate AI insights
    const aiPrompt = `You are a startup advisor analyzing a deck called "${deck.title}".

Deck Health Metrics:
- Overall Score: ${overallScore}/100
- Completion: ${Math.round(completionRate)}% (${filledCards.length}/${totalSlots} cards)
- Phase Balance: ${Math.round(balanceScore)}/100
- Content Quality: ${Math.round(qualityScore)}/100
- Card Variety: ${Math.round(varietyScore)}/100

Phase Breakdown:
${phaseCompletion.map(p => `- ${p.phase}: ${p.filled}/${p.total} cards (${Math.round(p.percentage)}%)`).join('\n')}

Weakest Phase: ${analysisContext.weakestPhase.phase} (${Math.round(analysisContext.weakestPhase.percentage)}%)
Strongest Phase: ${analysisContext.strongestPhase.phase} (${Math.round(analysisContext.strongestPhase.percentage)}%)

Generate a JSON response with:
1. A brief 1-2 sentence summary of the deck's current state
2. 3-5 specific, actionable improvement tips prioritized by impact
3. 2-3 strengths to highlight
4. Next best action they should take

Respond with ONLY valid JSON, no markdown:
{
  "summary": "string",
  "tips": [
    {
      "title": "string",
      "description": "string",
      "priority": "high" | "medium" | "low",
      "category": "completion" | "balance" | "quality" | "variety"
    }
  ],
  "strengths": ["string"],
  "nextAction": "string"
}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a startup advisor. Return only valid JSON.' },
          { role: 'user', content: aiPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      console.error('AI gateway error:', aiResponse.status);
      throw new Error('Failed to generate insights');
    }

    const aiData = await aiResponse.json();
    const insightsText = aiData.choices[0].message.content.trim();
    
    // Parse AI insights
    let insights;
    try {
      const jsonMatch = insightsText.match(/\{[\s\S]*\}/);
      insights = JSON.parse(jsonMatch ? jsonMatch[0] : insightsText);
    } catch (e) {
      console.error('Failed to parse AI insights:', insightsText);
      insights = {
        summary: "Your deck is progressing well. Focus on filling gaps and improving content quality.",
        tips: [
          {
            title: "Complete Missing Cards",
            description: `Fill the remaining ${totalSlots - filledCards.length} empty slots to reach 100% completion.`,
            priority: "high",
            category: "completion"
          },
          {
            title: "Balance Your Phases",
            description: `Focus on the ${analysisContext.weakestPhase.phase} phase which needs more attention.`,
            priority: "medium",
            category: "balance"
          }
        ],
        strengths: ["Good progress so far"],
        nextAction: "Work on your weakest phase to improve overall balance"
      };
    }

    return new Response(JSON.stringify({
      overallScore,
      metrics: {
        completion: {
          score: Math.round(completionRate),
          filled: filledCards.length,
          total: totalSlots
        },
        balance: {
          score: Math.round(balanceScore),
          phaseBreakdown: phaseCompletion
        },
        quality: {
          score: Math.round(qualityScore),
          evaluatedCards: evaluatedCards.length,
          totalFilled: filledCards.length
        },
        variety: {
          score: Math.round(varietyScore),
          uniqueTypes: cardTypes.size
        }
      },
      insights,
      lastAnalyzed: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-deck-health function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
