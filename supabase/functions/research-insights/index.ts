import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TAVILY_API_KEY = Deno.env.get('TAVILY_API_KEY');
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

// Vision → Research mapping
const VISION_TO_RESEARCH_MAP: Record<number, number> = {
  1: 6,  // V-01 PRODUCT → R-1 Market Map
  2: 8,  // V-02 PROBLEM → R-3 User Insights
  3: 7,  // V-03 AUDIENCE → R-2 Competitor Analysis
  4: 9,  // V-04 VALUE → R-4 Risk Assessment
  5: 10, // V-05 VISION → R-5 Opportunity Score
};

// Helper function to extract key terms from Vision data
function extractSearchTerms(visionData: any): {
  productName: string;
  category: string;
  audience: string;
  pain: string;
  solution: string;
  competitors: string;
} {
  const productName = visionData.product_name || '';
  
  // Extract category from analogy (e.g., "Duolingo для нумерологии" -> "нумерология", "numerology")
  const analogy = visionData.analogy || '';
  let category = '';
  
  // Try multiple patterns to extract the domain/category
  const patterns = [
    / для (.+)$/i,           // "X для Y"
    / for (.+)$/i,           // "X for Y"
    /^(.+) like /i,          // "Y like X"
    /^(.+) version of /i,    // "Y version of X"
  ];
  
  for (const pattern of patterns) {
    const match = analogy.match(pattern);
    if (match && match[1]) {
      category = match[1].trim();
      break;
    }
  }
  
  // If no pattern matched, use product_category or one_liner keywords
  if (!category) {
    category = visionData.product_category || 
               visionData.one_liner?.split(' ').slice(0, 3).join(' ') || 
               '';
  }
  
  const audience = visionData.target_audience || visionData.demographics || '';
  const pain = visionData.pain_description || visionData.problem_statement || '';
  const solution = visionData.your_solution || visionData.value_proposition || '';
  const competitors = visionData.competitors || '';
  
  return { productName, category, audience, pain, solution, competitors };
}

// Research card config - uses SPECIFIC Vision data
const RESEARCH_CONFIG: Record<number, {
  name: string;
  searchQueries: (v: any) => string[];
  presenters: string[];
  focusAreas: string[];
}> = {
  6: {
    name: 'Market Map',
    searchQueries: (v) => {
      const { productName, category, audience } = extractSearchTerms(v);
      const year = new Date().getFullYear();
      
      // Build specific queries using actual product data
      const queries: string[] = [];
      
      if (category) {
        queries.push(`"${category}" app market size ${year} revenue TAM SAM`);
        queries.push(`"${category}" industry growth rate CAGR ${year} statistics`);
      }
      
      if (audience) {
        queries.push(`${audience} apps market trends ${year}`);
      }
      
      if (productName && category) {
        queries.push(`${category} ${productName} market analysis competitors`);
      }
      
      // Fallback if no specific data
      if (queries.length === 0) {
        queries.push(`mobile app market trends ${year}`);
      }
      
      console.log('[Market Map] Search queries:', queries);
      return queries.slice(0, 3);
    },
    presenters: ['phoenix', 'evergreen', 'phoenix'],
    focusAreas: ['market_size', 'growth_rate', 'key_trends']
  },
  7: {
    name: 'Competitor Analysis',
    searchQueries: (v) => {
      const { category, audience, pain, competitors } = extractSearchTerms(v);
      const year = new Date().getFullYear();
      
      const queries: string[] = [];
      
      // Use explicitly mentioned competitors if available
      if (competitors) {
        queries.push(`${competitors} app review features pricing ${year}`);
      }
      
      if (category) {
        queries.push(`best "${category}" apps ${year} top rated alternatives`);
        queries.push(`"${category}" app comparison review ${year}`);
      }
      
      if (pain) {
        // Search for apps solving the same pain
        const painKeywords = pain.split(' ').slice(0, 5).join(' ');
        queries.push(`apps for "${painKeywords}" alternatives ${year}`);
      }
      
      if (audience && category) {
        queries.push(`${category} apps for ${audience} reddit review`);
      }
      
      if (queries.length === 0) {
        queries.push(`app competitors analysis ${year}`);
      }
      
      console.log('[Competitor Analysis] Search queries:', queries);
      return queries.slice(0, 3);
    },
    presenters: ['toxic', 'prisma', 'toxic'],
    focusAreas: ['competitor_names', 'competitor_weaknesses', 'market_gaps']
  },
  8: {
    name: 'User Insights',
    searchQueries: (v) => {
      const { category, audience, pain } = extractSearchTerms(v);
      
      const queries: string[] = [];
      
      if (pain) {
        // Search for real user complaints about this pain
        const painKeywords = pain.split(' ').slice(0, 6).join(' ');
        queries.push(`reddit "${painKeywords}" frustration help`);
        queries.push(`"${painKeywords}" user complaints problems forum`);
      }
      
      if (audience) {
        queries.push(`${audience} problems challenges reddit quora`);
      }
      
      if (category) {
        queries.push(`"${category}" app user reviews complaints what's missing`);
      }
      
      if (queries.length === 0) {
        queries.push(`user feedback app problems reddit`);
      }
      
      console.log('[User Insights] Search queries:', queries);
      return queries.slice(0, 3);
    },
    presenters: ['prisma', 'zen', 'prisma'],
    focusAreas: ['user_quotes', 'pain_frequency', 'workarounds']
  },
  9: {
    name: 'Risk Assessment',
    searchQueries: (v) => {
      const { productName, category, competitors } = extractSearchTerms(v);
      const year = new Date().getFullYear();
      
      const queries: string[] = [];
      
      if (category) {
        queries.push(`"${category}" app startup failures lessons learned`);
        queries.push(`"${category}" business challenges monetization problems ${year}`);
      }
      
      if (competitors) {
        queries.push(`${competitors} funding roadmap plans ${year}`);
      }
      
      if (productName) {
        queries.push(`${productName} type app risks challenges barriers`);
      }
      
      if (queries.length === 0) {
        queries.push(`mobile app startup risks failures`);
      }
      
      console.log('[Risk Assessment] Search queries:', queries);
      return queries.slice(0, 3);
    },
    presenters: ['toxic', 'techpriest', 'toxic'],
    focusAreas: ['market_risk', 'technical_risk', 'competition_risk']
  },
  10: {
    name: 'Opportunity Score',
    searchQueries: (v) => {
      const { category, audience } = extractSearchTerms(v);
      const year = new Date().getFullYear();
      const whyNow = v.why_now || '';
      
      const queries: string[] = [];
      
      if (category) {
        queries.push(`"${category}" market opportunity trends ${year}`);
        queries.push(`"${category}" industry growth investment ${year}`);
      }
      
      if (audience) {
        queries.push(`${audience} spending trends behavior ${year}`);
      }
      
      if (whyNow) {
        // Extract key trend from why_now
        const trendKeywords = whyNow.split(' ').slice(0, 5).join(' ');
        queries.push(`"${trendKeywords}" trend ${year}`);
      }
      
      if (queries.length === 0) {
        queries.push(`app market opportunity ${year}`);
      }
      
      console.log('[Opportunity Score] Search queries:', queries);
      return queries.slice(0, 3);
    },
    presenters: ['evergreen', 'phoenix', 'toxic'],
    focusAreas: ['strategic_window', 'scalability', 'timing']
  }
};

const RARITY_THRESHOLDS = {
  legendary: 9.4,
  epic: 8.0,
  rare: 7.0,
  uncommon: 6.0,
  common: 0,
};

function calculateRarity(score: number): string {
  if (score >= RARITY_THRESHOLDS.legendary) return 'legendary';
  if (score >= RARITY_THRESHOLDS.epic) return 'epic';
  if (score >= RARITY_THRESHOLDS.rare) return 'rare';
  if (score >= RARITY_THRESHOLDS.uncommon) return 'uncommon';
  return 'common';
}

function applyScoreCeiling(rawScore: number, visionScore: number): number {
  const maxAllowed = Math.min(10, visionScore + 2);
  return Math.min(rawScore, maxAllowed);
}

async function searchTavily(query: string): Promise<any[]> {
  if (!TAVILY_API_KEY) {
    console.log('No Tavily API key');
    return [];
  }

  try {
    // Force English-language search from US for quality sources
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query: query + ' site:.com OR site:.org', // Prioritize English sources
        search_depth: 'advanced', // Better quality sources
        max_results: 8,
        include_answer: true,
        include_raw_content: false,
        include_domains: [
          'statista.com', 'techcrunch.com', 'forbes.com', 'bloomberg.com',
          'crunchbase.com', 'reddit.com', 'medium.com', 'producthunt.com',
          'venturebeat.com', 'businessinsider.com', 'ycombinator.com',
          'entrepreneur.com', 'inc.com', 'wired.com', 'theverge.com'
        ]
      })
    });

    if (!response.ok) {
      console.log('Tavily response not ok:', response.status);
      return [];
    }
    const data = await response.json();
    console.log(`Tavily found ${data.results?.length || 0} results for: ${query}`);
    return data.results || [];
  } catch (error) {
    console.error('Tavily error:', error);
    return [];
  }
}

async function generateInsightsForSlot(
  researchSlot: number,
  visionSlot: number,
  visionData: any,
  visionScore: number,
  searchResults: any[],
  globalIndex: number,
  language: string = 'ru'
): Promise<any[]> {
  const config = RESEARCH_CONFIG[researchSlot];
  if (!config) return [];

  const searchContext = searchResults.slice(0, 8).map(r => 
    `Source: ${r.url || 'N/A'}\nTitle: ${r.title || ''}\nContent: ${(r.content || r.snippet || '').substring(0, 400)}`
  ).join('\n\n');

  const maxScore = Math.min(10, visionScore + 2);

  // Build comprehensive context from all Vision card fields
  const projectContext = `
PROJECT NAME: ${visionData.product_name || 'Unknown Project'}
ONE-LINER: ${visionData.one_liner || 'N/A'}
ANALOGY: ${visionData.analogy || 'N/A'} (пример: "Uber для доставки еды" = конкуренты в сфере доставки еды)
TARGET AUDIENCE: ${visionData.target_audience || 'N/A'}
USER FREQUENCY: ${visionData.user_frequency || 'N/A'}
PROBLEM BEING SOLVED: ${visionData.pain_description || 'N/A'}
CURRENT WORKAROUND: ${visionData.current_workaround || 'N/A'}
PAIN INTENSITY: ${visionData.pain_intensity || 'N/A'}
VALUE PROPOSITION: ${visionData.value_proposition || 'N/A'}
KEY BENEFIT: ${visionData.key_benefit || 'N/A'}
WHY NOW: ${visionData.why_now || 'N/A'}
VISION: ${visionData.vision_statement || 'N/A'}
SUCCESS METRIC: ${visionData.success_metric || 'N/A'}
`.trim();

  // Research-specific instructions - IMPROVED for each slot
  const researchInstructions: Record<number, string> = {
    6: `MARKET MAP: Analyze the REAL market size and growth for "${visionData.analogy || visionData.product_name}".
Find SPECIFIC numbers: TAM/SAM/SOM, growth rates, funding trends in this space.
Focus on the DOMAIN/CATEGORY of the product, not just the product name.
Example: If product is "Duolingo for numerology" - analyze the numerology/spirituality/self-development app market.`,

    7: `COMPETITOR ANALYSIS: Find REAL competitors that solve similar problems for "${visionData.target_audience}".
CRITICAL: The product "${visionData.product_name}" solves: "${visionData.pain_description}"
DO NOT search for companies with similar NAMES - search for companies solving SIMILAR PROBLEMS.
Example: If the pain is "people struggle to understand numerology", competitors are OTHER numerology apps, astrology apps, personality analysis tools - NOT random companies with similar names.
Find 2-3 ACTUAL competitors and analyze their strengths and weaknesses.`,

    8: `USER INSIGHTS: Find what "${visionData.target_audience}" ACTUALLY say about "${visionData.pain_description}".
Look for REAL user quotes from forums, reviews, Reddit, Twitter.
What workarounds do they use? How often do they experience this pain?
Include EXACT quotes when possible.`,

    9: `RISK ASSESSMENT for this SPECIFIC project:
Project: "${visionData.product_name}" - ${visionData.one_liner}
Target: "${visionData.target_audience}"
IMPORTANT: This is a PET PROJECT / indie app - analyze risks SPECIFIC to small indie products:
- User acquisition challenges for niche products
- Monetization risks for this specific audience
- Competition from established players in this category
- Technical feasibility risks
DO NOT cite generic "startups fail" statistics - focus on THIS project's specific risks.`,

    10: `OPPORTUNITY ASSESSMENT for "${visionData.product_name}":
Why NOW is the right time: "${visionData.why_now}"
Analyze: Is this timing actually good? What market trends support this?
What's the growth potential for serving "${visionData.target_audience}"?
Focus on SPECIFIC opportunities, not generic advice.`
  };

  const langInstruction = language === 'ru' 
    ? 'КРИТИЧЕСКИ ВАЖНО: Пиши ВСЕ инсайты ТОЛЬКО НА РУССКОМ ЯЗЫКЕ. Используй конкретные факты и цифры из веб-данных.'
    : 'Write all insights in English. Use specific facts and numbers from web data.';

  const prompt = `You are a startup research analyst generating UNIQUE, HIGHLY RELEVANT insights.

${projectContext}

RESEARCH FOCUS: ${config.name}
${researchInstructions[researchSlot] || ''}

WEB RESEARCH DATA:
${searchContext || 'No web data - use your knowledge of this domain'}

MAX INSIGHT SCORE: ${maxScore}/10 (based on Vision card quality: ${visionScore}/10)

${langInstruction}

CRITICAL RULES:
1. Each insight must be about THIS SPECIFIC PROJECT and its domain
2. DO NOT mention generic startup statistics unless directly relevant
3. For competitors: Name REAL products/apps in the same category, not companies with similar names
4. Be SPECIFIC - use numbers, names, facts from the web data
5. Each of the 3 insights must cover a DIFFERENT aspect
6. 2-3 sentences per insight, actionable and clear
7. NEVER include dates like "15.12.2025", "События дня 15.12.25", "Совет дня. 15.12.2025" etc.
   - Remove all specific dates from insights
   - Write timeless insights that don't reference specific days
8. SOURCE RULES - VERY IMPORTANT:
   - "source" must be the EXACT website name/title from web data (e.g. "Statista", "TechCrunch", "Reddit r/astrology")
   - "sourceUrl" must be a REAL URL from the web data, or null if no URL available
   - DO NOT invent URLs like "youtube.com/watch?v=..." - only use URLs you found in research
   - If you're using your own knowledge (not from web data), set source to "AI Analysis" and sourceUrl to null

Return exactly this JSON format:
{
  "insights": [
    {"content": "<specific insight about ${config.focusAreas[0]} for this project>", "source": "<exact source name from web data or 'AI Analysis'>", "sourceUrl": "<exact url from web data or null>", "rawScore": <1-${maxScore}>},
    {"content": "<specific insight about ${config.focusAreas[1]} for this project>", "source": "<exact source name from web data or 'AI Analysis'>", "sourceUrl": "<exact url from web data or null>", "rawScore": <1-${maxScore}>},
    {"content": "<specific insight about ${config.focusAreas[2] || config.focusAreas[0]} for this project>", "source": "<exact source name from web data or 'AI Analysis'>", "sourceUrl": "<exact url from web data or null>", "rawScore": <1-${maxScore}>}
  ]
}`;

  try {
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
            content: `You are an expert startup research analyst. Your job is to provide HIGHLY RELEVANT, SPECIFIC insights based on the PROJECT CONTEXT. Never be generic. Always relate insights back to the specific product, audience, and problem being solved. When analyzing competitors, find products in the SAME CATEGORY that solve SIMILAR PROBLEMS - not companies with similar names.` 
          },
          { role: 'user', content: prompt }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      console.error('AI failed:', response.status);
      return [];
    }

    const aiData = await response.json();
    const result = JSON.parse(aiData.choices[0].message.content);
    
    return (result.insights || []).map((insight: any, index: number) => {
      const cappedScore = applyScoreCeiling(insight.rawScore || 5, visionScore);
      return {
        id: crypto.randomUUID(),
        visionCardSlot: visionSlot,
        researchCardSlot: researchSlot,
        content: insight.content,
        source: insight.source || 'Research',
        sourceUrl: insight.sourceUrl || null,
        presenter: config.presenters[index] || config.presenters[0],
        score: cappedScore,
        maxPossibleScore: maxScore,
        rarity: calculateRarity(cappedScore),
        resonated: null,
        index: globalIndex + index,
      };
    });
  } catch (error) {
    console.error('Generate error:', error);
    return [];
  }
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
      return new Response(JSON.stringify({ error: 'No auth' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { deckId, stream, language = 'ru', singleSlot } = await req.json();

    // Verify deck
    const { data: deck } = await supabase
      .from('decks')
      .select('*')
      .eq('id', deckId)
      .eq('user_id', user.id)
      .single();

    if (!deck) {
      return new Response(JSON.stringify({ error: 'Deck not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get vision cards
    const { data: visionCards } = await supabase
      .from('deck_cards')
      .select('*')
      .eq('deck_id', deckId)
      .in('card_slot', [1, 2, 3, 4, 5]);

    if (!visionCards || visionCards.length < 5) {
      return new Response(JSON.stringify({ error: 'Complete Vision first' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Combine vision data and scores
    const visionData: Record<string, any> = {};
    const visionScores: Record<number, number> = {};
    
    visionCards.forEach(card => {
      const data = card.card_data as Record<string, any>;
      Object.assign(visionData, data);
      const evaluation = card.evaluation as Record<string, any> | null;
      visionScores[card.card_slot] = evaluation?.overall || evaluation?.overallScore || 5;
    });

    // Log extracted search terms for debugging
    const searchTerms = extractSearchTerms(visionData);
    console.log('=== RESEARCH INSIGHTS START ===');
    console.log('Vision data keys:', Object.keys(visionData));
    console.log('Extracted search terms:', JSON.stringify(searchTerms, null, 2));
    console.log('Full Vision data:', JSON.stringify({
      product_name: visionData.product_name,
      analogy: visionData.analogy,
      product_category: visionData.product_category,
      one_liner: visionData.one_liner,
      target_audience: visionData.target_audience,
      demographics: visionData.demographics,
      pain_description: visionData.pain_description,
      your_solution: visionData.your_solution,
      competitors: visionData.competitors,
      why_now: visionData.why_now
    }, null, 2));

    // STREAMING MODE - return insights progressively via SSE
    if (stream) {
      const encoder = new TextEncoder();
      const streamResponse = new ReadableStream({
        async start(controller) {
          let globalIndex = 0;
          let totalSources = 0;

          // If singleSlot is specified, only process that slot
          const slotsToProcess = singleSlot 
            ? Object.entries(VISION_TO_RESEARCH_MAP).filter(([_, rSlot]) => rSlot === singleSlot)
            : Object.entries(VISION_TO_RESEARCH_MAP);

          console.log(`Processing ${slotsToProcess.length} slots${singleSlot ? ` (single slot ${singleSlot})` : ''}`);

          // Process each vision card sequentially and stream results
          for (const [visionSlotStr, researchSlot] of slotsToProcess) {
            const visionSlot = parseInt(visionSlotStr);
            const visionScore = visionScores[visionSlot] || 5;
            const config = RESEARCH_CONFIG[researchSlot];

            console.log(`Processing V${visionSlot} → R${researchSlot - 5}`);

            // Search with improved queries
            const searchResults: any[] = [];
            const queries = config.searchQueries(visionData);
            console.log(`Search queries for R${researchSlot - 5}:`, queries);
            
            for (const query of queries) {
              const results = await searchTavily(query);
              searchResults.push(...results);
              totalSources += results.length;
            }

            // Generate insights
            const insights = await generateInsightsForSlot(
              researchSlot, visionSlot, visionData, visionScore, searchResults, globalIndex, language
            );

            // Stream each insight
            for (const insight of insights) {
              const event = `data: ${JSON.stringify({ type: 'insight', insight, totalSources })}\n\n`;
              controller.enqueue(encoder.encode(event));
            }

            globalIndex += insights.length;

            // Send progress update
            const progress = `data: ${JSON.stringify({ 
              type: 'progress', 
              completed: visionSlot, 
              total: singleSlot ? 1 : 5,
              insightsCount: globalIndex,
              totalSources 
            })}\n\n`;
            controller.enqueue(encoder.encode(progress));
          }

          // Send completion
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', totalInsights: globalIndex, totalSources })}\n\n`));
          controller.close();
        }
      });

      return new Response(streamResponse, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        }
      });
    }

    // NON-STREAMING MODE - return all at once (for backwards compat)
    const allInsights: any[] = [];
    let totalSources = 0;
    let globalIndex = 0;

    for (const [visionSlotStr, researchSlot] of Object.entries(VISION_TO_RESEARCH_MAP)) {
      const visionSlot = parseInt(visionSlotStr);
      const visionScore = visionScores[visionSlot] || 5;
      const config = RESEARCH_CONFIG[researchSlot];

      const searchResults: any[] = [];
      for (const query of config.searchQueries(visionData)) {
        const results = await searchTavily(query);
        searchResults.push(...results);
        totalSources += results.length;
      }

      const insights = await generateInsightsForSlot(
        researchSlot, visionSlot, visionData, visionScore, searchResults, globalIndex, language
      );
      allInsights.push(...insights);
      globalIndex += insights.length;
    }

    return new Response(JSON.stringify({
      success: true,
      insights: allInsights,
      sourcesCount: totalSources,
      visionScores,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error?.message || 'Error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
