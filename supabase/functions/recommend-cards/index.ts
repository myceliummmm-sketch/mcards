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

    // Fetch deck cards
    const { data: deckCards, error: cardsError } = await supabase
      .from('deck_cards')
      .select('*')
      .eq('deck_id', deckId);

    if (cardsError) throw cardsError;

    // Extract key information from deck cards
    const filledCards = deckCards.filter(card => card.card_data && Object.keys(card.card_data).length > 0);
    const phases = ['vision', 'research', 'build', 'grow'];
    const phaseSlots = {
      vision: [1, 2, 3, 4, 5],
      research: [6, 7, 8, 9, 10, 11],
      build: [12, 13, 14, 15, 16, 17],
      grow: [18, 19, 20, 21, 22]
    };

    // Identify gap phases
    const gapPhases = phases.filter(phase => {
      const slots = phaseSlots[phase as keyof typeof phaseSlots];
      const filledInPhase = filledCards.filter(card => slots.includes(card.card_slot));
      return filledInPhase.length < slots.length;
    });

    // Extract content from filled cards
    const deckContent = filledCards.map(card => {
      const data = card.card_data as any;
      return {
        type: card.card_type,
        slot: card.card_slot,
        content: JSON.stringify(data)
      };
    });

    // Call Lovable AI for analysis
    const aiPrompt = `Analyze this startup deck content and extract:
1. Primary industry/domain
2. Main themes and keywords (max 5)
3. Key pain points or opportunities mentioned
4. Target audience

Deck cards:
${JSON.stringify(deckContent, null, 2)}

Respond with JSON only, no other text:
{
  "industry": "string",
  "themes": ["string"],
  "keywords": ["string"],
  "targetAudience": "string"
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
          { role: 'system', content: 'You are a startup analyst. Return only valid JSON, no markdown or explanations.' },
          { role: 'user', content: aiPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      console.error('AI gateway error:', aiResponse.status);
      throw new Error('Failed to analyze deck content');
    }

    const aiData = await aiResponse.json();
    const analysisText = aiData.choices[0].message.content.trim();
    
    // Parse JSON from AI response (handle markdown code blocks)
    let deckAnalysis;
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      deckAnalysis = JSON.parse(jsonMatch ? jsonMatch[0] : analysisText);
    } catch (e) {
      console.error('Failed to parse AI response:', analysisText);
      deckAnalysis = {
        industry: 'General',
        themes: [],
        keywords: [],
        targetAudience: 'Unknown'
      };
    }

    // Mock marketplace cards for scoring (in production, fetch from DB)
    const marketplaceCards = [
      { id: '1', title: 'Customer Journey Map', phase: 'research', industry: 'SaaS', cardType: 'tool', stats: { avgRating: 4.8, purchases: 234 } },
      { id: '2', title: 'User Interview Framework', phase: 'research', industry: 'General', cardType: 'framework', stats: { avgRating: 4.9, purchases: 567 } },
      { id: '3', title: 'Viral Loop Strategy', phase: 'grow', industry: 'SaaS', cardType: 'strategy', stats: { avgRating: 4.7, purchases: 189 } },
      { id: '4', title: 'Retention Metrics Dashboard', phase: 'grow', industry: 'SaaS', cardType: 'tool', stats: { avgRating: 4.6, purchases: 312 } },
      { id: '5', title: 'Lean Canvas Workshop', phase: 'vision', industry: 'General', cardType: 'framework', stats: { avgRating: 4.8, purchases: 445 } },
      { id: '8', title: 'Market Sizing Template', phase: 'research', industry: 'General', cardType: 'template', stats: { avgRating: 4.7, purchases: 289 } },
    ];

    // Score each marketplace card
    const recommendations = marketplaceCards.map(card => {
      let score = 0;
      const reasons: string[] = [];

      // Gap Match (35%)
      if (gapPhases.includes(card.phase)) {
        score += 35;
        reasons.push(`Fills your missing "${card.phase}" phase gap`);
      }

      // Industry Match (25%)
      if (card.industry === deckAnalysis.industry || card.industry === 'General') {
        const matchPercentage = card.industry === deckAnalysis.industry ? 25 : 10;
        score += matchPercentage;
        if (card.industry === deckAnalysis.industry) {
          reasons.push(`Matches your ${deckAnalysis.industry} industry focus`);
        }
      }

      // Keyword Overlap (20%)
      const cardText = card.title.toLowerCase();
      const matchedKeywords = deckAnalysis.keywords?.filter((kw: string) => 
        cardText.includes(kw.toLowerCase())
      ) || [];
      if (matchedKeywords.length > 0) {
        score += Math.min(20, matchedKeywords.length * 10);
        reasons.push(`Relates to: ${matchedKeywords.join(', ')}`);
      }

      // Popularity (10%)
      if (card.stats.avgRating >= 4.7) {
        score += 10;
        reasons.push(`Highly rated (${card.stats.avgRating}★)`);
      }

      // Determine category
      let category = 'related';
      if (gapPhases.includes(card.phase)) {
        category = 'gap_filler';
      } else if (matchedKeywords.length > 0) {
        category = 'content_match';
      }

      return {
        cardId: card.id,
        score: Math.min(100, score) / 100,
        reasons: reasons.length > 0 ? reasons : ['Related to your deck content'],
        category
      };
    });

    // Sort by score and take top recommendations
    const sortedRecommendations = recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    const completionScore = Math.round((filledCards.length / 22) * 100);

    return new Response(JSON.stringify({
      recommendations: sortedRecommendations,
      deckAnalysis: {
        primaryIndustry: deckAnalysis.industry,
        mainThemes: deckAnalysis.themes || [],
        keywords: deckAnalysis.keywords || [],
        targetAudience: deckAnalysis.targetAudience,
        gapPhases,
        completionScore,
        filledCards: filledCards.length,
        totalCards: 22
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in recommend-cards function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
