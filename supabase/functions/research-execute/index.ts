import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TAVILY_API_KEY = Deno.env.get('TAVILY_API_KEY');
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const CARD_CONFIG: Record<number, { 
  name: string; 
  searchQueries: (vision: any) => string[];
  evaluators: string[];
  focusAreas: string[];
}> = {
  6: { // Market Map
    name: 'Market Map',
    searchQueries: (v) => [
      `${v.product_name || ''} market size ${v.target_audience || ''}`,
      `${v.analogy || ''} industry trends 2024`,
      `${v.target_audience || ''} market analysis`
    ],
    evaluators: ['phoenix', 'evergreen'],
    focusAreas: ['market_size', 'key_players', 'market_trends', 'positioning']
  },
  7: { // Competitor Analysis
    name: 'Competitor Analysis',
    searchQueries: (v) => [
      `${v.product_name || ''} competitors ${v.analogy || ''}`,
      `${v.analogy || ''} alternatives comparison pricing`,
      `best ${v.target_audience || ''} apps products weaknesses`
    ],
    evaluators: ['toxic', 'prisma'],
    focusAreas: ['strengths', 'weaknesses', 'pricing', 'differentiation']
  },
  8: { // User Insights
    name: 'User Insights',
    searchQueries: (v) => [
      `${v.target_audience || ''} pain points problems`,
      `${v.pain_description || ''} user complaints reddit`,
      `${v.target_audience || ''} needs wants behavior`
    ],
    evaluators: ['prisma', 'zen'],
    focusAreas: ['pain_points', 'desires', 'behaviors', 'quotes']
  },
  9: { // Risk Assessment
    name: 'Risk Assessment',
    searchQueries: (v) => [
      `${v.product_name || ''} startup risks ${v.target_audience || ''}`,
      `${v.analogy || ''} business model risks challenges`,
      `${v.target_audience || ''} market risks regulatory`
    ],
    evaluators: ['toxic', 'techpriest'],
    focusAreas: ['market_risks', 'technical_risks', 'competitive_risks', 'mitigation']
  },
  10: { // Opportunity Score (synthesis)
    name: 'Opportunity Score',
    searchQueries: (v) => [
      `${v.product_name || ''} opportunity assessment`,
      `${v.analogy || ''} success factors`
    ],
    evaluators: ['evergreen', 'phoenix', 'toxic'],
    focusAreas: ['overall_assessment', 'key_strengths', 'key_concerns', 'verdict']
  }
};

const CHARACTER_PROMPTS: Record<string, string> = {
  evergreen: "You are Ever Green, a visionary CEO. You focus on strategic vision, market opportunity, and long-term potential. Be direct and focused on the big picture.",
  prisma: "You are Prisma, a Product Manager obsessed with user needs. Focus on user problems, product-market fit, and actionable insights. Question assumptions.",
  toxic: "You are Toxic, a Red Team Security Lead. Be critical, skeptical, and point out risks and vulnerabilities. Challenge weak data and questionable sources. Be blunt but constructive.",
  phoenix: "You are Phoenix, a CMO focused on growth. Assess market positioning, brand potential, and go-to-market opportunities. Think about differentiation.",
  techpriest: "You are Tech Priest, the CTO. Focus on technical feasibility, scalability, and implementation risks. Use analogies to explain complex concepts.",
  zen: "You are Zen, focused on culture and human factors. Consider team dynamics, user wellbeing, and sustainable growth. Bring empathy to the analysis.",
  virgilia: "You are Virgilia, a Visual Storyteller. Focus on emotional resonance, user experience, and how findings translate to compelling narratives."
};

async function searchTavily(query: string): Promise<any[]> {
  if (!TAVILY_API_KEY) {
    console.log('No Tavily API key, returning mock results');
    return [];
  }

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query,
        search_depth: 'advanced',
        max_results: 5,
        include_answer: true
      })
    });

    if (!response.ok) {
      console.error('Tavily search failed:', response.status);
      return [];
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Tavily search error:', error);
    return [];
  }
}

async function evaluateWithAI(
  cardSlot: number,
  visionData: any,
  searchResults: any[],
  previousResearch: any[]
): Promise<{ findings: any; teamComments: any[]; rarityScores: any; verdict?: string }> {
  const config = CARD_CONFIG[cardSlot];
  
  const searchContext = searchResults.map(r => 
    `Source: ${r.url || 'N/A'}\nTitle: ${r.title || ''}\nContent: ${r.content || r.snippet || ''}`
  ).join('\n\n');

  const previousContext = previousResearch.length > 0 
    ? `\n\nPrevious research findings:\n${JSON.stringify(previousResearch.map(r => r.findings), null, 2)}`
    : '';

  // Build the analysis prompt
  const analysisPrompt = `You are analyzing research for a startup project.

PROJECT VISION:
- Product: ${visionData.product_name || 'Unknown'} - ${visionData.one_liner || ''}
- Problem: ${visionData.pain_description || 'Not specified'}
- Audience: ${visionData.target_audience || 'Not specified'} - ${visionData.demographics || ''}
- Value Prop: ${visionData.your_solution || 'Not specified'}

RESEARCH TASK: ${config.name}
Focus areas: ${config.focusAreas.join(', ')}

WEB RESEARCH RESULTS:
${searchContext || 'No web results available'}
${previousContext}

Based on this research, provide:
1. Key findings for each focus area
2. Quality assessment (depth, actionability, uniqueness, source quality) - score 1-10 each
3. ${cardSlot === 10 ? 'A final verdict: GO, CONDITIONAL_GO, PIVOT, or STOP with reasoning' : 'Key insights and concerns'}

Respond in JSON format:
{
  "findings": {
    // structured findings per focus area
  },
  "quality_scores": {
    "depth": <1-10>,
    "actionability": <1-10>,
    "uniqueness": <1-10>,
    "source_quality": <1-10>
  },
  "key_insight": "<main takeaway>",
  "concerns": ["<list of concerns>"]
  ${cardSlot === 10 ? ', "verdict": "<GO|CONDITIONAL_GO|PIVOT|STOP>", "verdict_reasoning": "<explanation>"' : ''}
}`;

  const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: 'You are a startup research analyst. Provide structured, actionable insights.' },
        { role: 'user', content: analysisPrompt }
      ],
      response_format: { type: "json_object" }
    })
  });

  if (!aiResponse.ok) {
    console.error('AI analysis failed:', aiResponse.status);
    throw new Error('AI analysis failed');
  }

  const aiData = await aiResponse.json();
  const analysis = JSON.parse(aiData.choices[0].message.content);

  // Generate team comments from evaluators
  const teamComments = [];
  for (const evaluatorId of config.evaluators) {
    const commentPrompt = `${CHARACTER_PROMPTS[evaluatorId]}

Based on these research findings:
${JSON.stringify(analysis.findings, null, 2)}

Key insight: ${analysis.key_insight}
Concerns: ${analysis.concerns?.join(', ') || 'None noted'}

Provide a brief (2-3 sentences) comment in your character's voice. Be specific about what you see in the data. ${evaluatorId === 'toxic' ? 'Be critical and point out weaknesses or risks.' : ''}`;

    const commentResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'user', content: commentPrompt }
        ]
      })
    });

    if (commentResponse.ok) {
      const commentData = await commentResponse.json();
      teamComments.push({
        characterId: evaluatorId,
        comment: commentData.choices[0].message.content,
        sentiment: evaluatorId === 'toxic' ? 'critical' : 'positive'
      });
    }
  }

  // Calculate final rarity based on quality scores
  const scores = analysis.quality_scores || { depth: 5, actionability: 5, uniqueness: 5, source_quality: 5 };
  const weightedScore = (
    scores.depth * 0.30 +
    scores.actionability * 0.25 +
    scores.uniqueness * 0.25 +
    scores.source_quality * 0.20
  );

  let finalRarity = 'common';
  if (weightedScore >= 9.5) finalRarity = 'legendary';
  else if (weightedScore >= 8.0) finalRarity = 'epic';
  else if (weightedScore >= 6.0) finalRarity = 'rare';
  else if (weightedScore >= 4.0) finalRarity = 'uncommon';

  return {
    findings: analysis.findings,
    teamComments,
    rarityScores: {
      ...scores,
      final_score: weightedScore
    },
    verdict: analysis.verdict
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { deckId, cardSlot } = await req.json();

    if (!CARD_CONFIG[cardSlot]) {
      return new Response(JSON.stringify({ error: 'Invalid card slot' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify deck ownership
    const { data: deck, error: deckError } = await supabase
      .from('decks')
      .select('*')
      .eq('id', deckId)
      .eq('user_id', user.id)
      .single();

    if (deckError || !deck) {
      return new Response(JSON.stringify({ error: 'Deck not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get vision cards data
    const { data: visionCards } = await supabase
      .from('deck_cards')
      .select('*')
      .eq('deck_id', deckId)
      .in('card_slot', [1, 2, 3, 4, 5]);

    // Combine vision data
    const visionData: Record<string, any> = {};
    (visionCards || []).forEach(card => {
      const data = card.card_data as Record<string, any>;
      Object.assign(visionData, data);
    });

    // Get previous research results
    const { data: previousResearch } = await supabase
      .from('research_results')
      .select('*')
      .eq('deck_id', deckId)
      .lt('card_slot', cardSlot)
      .eq('status', 'accepted');

    // Mark as researching
    await supabase
      .from('research_results')
      .upsert({
        deck_id: deckId,
        card_slot: cardSlot,
        status: 'researching',
        researched_at: new Date().toISOString()
      }, {
        onConflict: 'deck_id,card_slot'
      });

    // Perform web searches
    const config = CARD_CONFIG[cardSlot];
    const searchQueries = config.searchQueries(visionData);
    
    console.log(`Executing research for slot ${cardSlot}: ${config.name}`);
    console.log('Search queries:', searchQueries);

    const allResults: any[] = [];
    for (const query of searchQueries) {
      const results = await searchTavily(query);
      allResults.push(...results);
    }

    console.log(`Found ${allResults.length} search results`);

    // Evaluate with AI
    const evaluation = await evaluateWithAI(
      cardSlot,
      visionData,
      allResults,
      previousResearch || []
    );

    // Store results
    const { data: result, error: updateError } = await supabase
      .from('research_results')
      .upsert({
        deck_id: deckId,
        card_slot: cardSlot,
        findings: evaluation.findings,
        team_comments: evaluation.teamComments,
        sources: allResults.slice(0, 10).map(r => ({
          url: r.url,
          title: r.title,
          snippet: r.content?.substring(0, 200)
        })),
        rarity_scores: evaluation.rarityScores,
        final_rarity: evaluation.rarityScores.final_score >= 9.5 ? 'legendary' 
          : evaluation.rarityScores.final_score >= 8.0 ? 'epic'
          : evaluation.rarityScores.final_score >= 6.0 ? 'rare'
          : evaluation.rarityScores.final_score >= 4.0 ? 'uncommon'
          : 'common',
        verdict: evaluation.verdict || null,
        status: 'ready',
        researched_at: new Date().toISOString()
      }, {
        onConflict: 'deck_id,card_slot'
      })
      .select()
      .single();

    if (updateError) {
      console.error('Error storing results:', updateError);
      throw updateError;
    }

    return new Response(JSON.stringify({
      success: true,
      result
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Error in research-execute:', error);
    return new Response(JSON.stringify({ error: error?.message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});