import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TAVILY_API_KEY = Deno.env.get('TAVILY_API_KEY');
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

// Vision card slot mapping
const VISION_SLOT_MAP = {
  1: 'product',     // V-01 PRODUCT
  2: 'problem',     // V-02 PROBLEM
  3: 'audience',    // V-03 AUDIENCE
  4: 'value',       // V-04 VALUE
  5: 'vision'       // V-05 VISION
};

// Research card to Vision card mapping
const RESEARCH_TO_VISION_MAP: Record<number, number> = {
  6: 1,  // R-1 Market Map → V-01 PRODUCT
  7: 3,  // R-2 Competitor Analysis → V-03 AUDIENCE + V-04 VALUE
  8: 2,  // R-3 User Insights → V-02 PROBLEM + V-03 AUDIENCE
  9: 4,  // R-4 Risk Assessment → V-04 VALUE + all previous R
  10: 5, // R-5 Opportunity Score → V-05 VISION + ALL
};

// Card configuration with v2.0 prompts - 3 different insights per card
const CARD_CONFIG: Record<number, { 
  name: string;
  presenter: string;
  presenterEmoji: string;
  insightTypes: { type: string; description: string; example: string; antiExample: string }[];
  searchQueries: (vision: any) => string[];
  goodSources: string[];
}> = {
  6: { // R-1 Market Map - based on V-01 PRODUCT
    name: 'Market Map',
    presenter: 'Phoenix',
    presenterEmoji: '🔥',
    insightTypes: [
      {
        type: 'market_size',
        description: 'Конкретный размер рынка ЭТОЙ категории (не всех приложений!)',
        example: 'Рынок astrology apps = $2.2B в 2024',
        antiExample: 'Рынок мобильных приложений = $500B'
      },
      {
        type: 'market_growth',
        description: 'Темп роста ЭТОЙ категории (CAGR, YoY)',
        example: 'Wellness apps растут 25% в год',
        antiExample: 'Технологии развиваются'
      },
      {
        type: 'market_leaders',
        description: 'Топ-3 игрока в ЭТОЙ нише с цифрами (downloads, revenue, users)',
        example: 'Co-Star: 20M downloads, Sanctuary: $20M funding',
        antiExample: 'Есть много конкурентов'
      }
    ],
    searchQueries: (v) => {
      const category = v.analogy || v.product_category || '';
      const product = v.product_name || '';
      return [
        `${category} market size 2024`,
        `${category} app CAGR growth rate 2024`,
        `${category} app top players downloads revenue`,
        `${product} competitors market analysis`
      ].filter(q => q.trim().length > 15);
    },
    goodSources: ['Statista', 'Sensor Tower', 'App Annie', 'data.ai', 'TechCrunch', 'Crunchbase']
  },
  7: { // R-2 Competitor Analysis - based on V-03 AUDIENCE + V-04 VALUE
    name: 'Competitor Analysis',
    presenter: 'Toxic',
    presenterEmoji: '☢️',
    insightTypes: [
      {
        type: 'direct_competitors',
        description: 'Кто уже работает с ЭТОЙ аудиторией? С цифрами.',
        example: 'Co-Star: 10M users, женщины 25-45, daily horoscopes',
        antiExample: 'Есть много приложений'
      },
      {
        type: 'competitor_weaknesses',
        description: 'На что жалуются юзеры конкурентов? (App Store reviews, Reddit)',
        example: '68% отзывов Co-Star жалуются на отсутствие карьерного фокуса',
        antiExample: 'У конкурентов есть недостатки'
      },
      {
        type: 'empty_niche',
        description: 'Чего НЕ делает никто? Где твоя уникальность незанята?',
        example: 'Никто из топ-5 не делает карьерный фокус — твоё окно',
        antiExample: 'Есть возможности для роста'
      }
    ],
    searchQueries: (v) => {
      const category = v.analogy || '';
      const competitors = v.competitors || '';
      const audience = v.target_audience || v.demographics || '';
      return [
        `${category} app competitors comparison 2024`,
        `${competitors} app negative reviews complaints reddit`,
        `${category} ${audience} app gap opportunity`,
        `${category} app what's missing user complaints`
      ].filter(q => q.trim().length > 15);
    },
    goodSources: ['TechCrunch', 'Product Hunt', 'G2', 'App Store reviews', 'Reddit', 'Crunchbase']
  },
  8: { // R-3 User Insights - based on V-02 PROBLEM + V-03 AUDIENCE
    name: 'User Insights',
    presenter: 'Prisma',
    presenterEmoji: '💎',
    insightTypes: [
      {
        type: 'pain_voice',
        description: 'Реальные цитаты людей с ЭТОЙ болью на Reddit, форумах',
        example: '"Мне 42 и я понятия не имею что делать с карьерой" — r/careerguidance',
        antiExample: 'Люди испытывают трудности'
      },
      {
        type: 'pain_frequency',
        description: 'Как часто эта проблема возникает? Статистика.',
        example: '35% смен карьеры происходят в возрасте 35-45 — LinkedIn',
        antiExample: 'Многие люди сталкиваются с этим'
      },
      {
        type: 'current_solutions',
        description: 'Как люди решают проблему СЕЙЧАС? Что не работает?',
        example: '78% пробовали карьерных коучей, но слишком дорого ($200/час)',
        antiExample: 'Люди ищут решения'
      }
    ],
    searchQueries: (v) => {
      const pain = v.pain_description || v.problem_statement || '';
      const audience = v.target_audience || v.demographics || '';
      return [
        `${pain} reddit quotes experiences`,
        `${audience} ${pain} statistics frequency`,
        `${pain} current solutions problems alternatives`,
        `${audience} struggles challenges forum`
      ].filter(q => q.trim().length > 15);
    },
    goodSources: ['Reddit', 'Quora', 'LinkedIn', 'Forbes', 'Harvard Business Review', 'Research studies']
  },
  9: { // R-4 Risk Assessment - based on V-04 VALUE + all previous R
    name: 'Risk Assessment',
    presenter: 'Toxic',
    presenterEmoji: '☢️',
    insightTypes: [
      {
        type: 'competitor_threat',
        description: 'Могут ли лидеры скопировать твою уникальность?',
        example: 'Co-Star получил $25M — могут добавить карьерный фокус за 6 месяцев',
        antiExample: 'Конкуренция высокая'
      },
      {
        type: 'market_barriers',
        description: 'Что мешает войти? Регуляции, технологии, доверие?',
        example: 'Скептицизм к нумерологии — 45% считают это несерьёзным',
        antiExample: 'Есть сложности'
      },
      {
        type: 'failure_cases',
        description: 'Почему похожие стартапы провалились?',
        example: 'Pattern продался за копейки — не смог монетизировать',
        antiExample: 'Стартапы иногда закрываются'
      }
    ],
    searchQueries: (v) => {
      const category = v.analogy || '';
      const competitors = v.competitors || '';
      const solution = v.your_solution || '';
      return [
        `${competitors} funding plans roadmap 2024`,
        `${category} app skepticism trust barriers`,
        `${category} startup failed why reasons`,
        `${category} business risks challenges 2024`
      ].filter(q => q.trim().length > 15);
    },
    goodSources: ['TechCrunch', 'Forbes', 'CB Insights', 'McKinsey', 'Crunchbase', 'Business Insider']
  },
  10: { // R-5 Opportunity Score - based on V-05 VISION + ALL
    name: 'Opportunity Score',
    presenter: 'Ever Green',
    presenterEmoji: '🌲',
    insightTypes: [
      {
        type: 'why_now',
        description: 'Тренды в пользу твоего продукта. Почему момент правильный?',
        example: 'Wellness app downloads выросли на 35% после COVID',
        antiExample: 'Время подходящее'
      },
      {
        type: 'scale_potential',
        description: 'Насколько можно вырасти? TAM, SAM, SOM с цифрами.',
        example: 'TAM: $2.2B astrology + $5B career coaching = потенциал $100M ниша',
        antiExample: 'Есть потенциал роста'
      },
      {
        type: 'strategic_window',
        description: 'Сколько времени до того как конкуренты догонят?',
        example: '12-18 месяцев форы пока Co-Star добавит карьерный фокус',
        antiExample: 'Нужно действовать быстро'
      }
    ],
    searchQueries: (v) => {
      const category = v.analogy || '';
      const competitors = v.competitors || '';
      return [
        `${category} trend 2024 growth why now`,
        `${category} market TAM SAM size potential`,
        `${competitors} roadmap future features plans`,
        `${category} opportunity window timing`
      ].filter(q => q.trim().length > 15);
    },
    goodSources: ['McKinsey', 'Forbes', 'TechCrunch', 'Statista', 'CB Insights', 'a16z']
  }
};

const CHARACTER_PROMPTS: Record<string, { name: string; emoji: string; style: string; prompt: string }> = {
  evergreen: {
    name: 'Ever Green',
    emoji: '🌲',
    style: 'strategic, big-picture',
    prompt: "You are Ever Green 🌲, a visionary CEO. Focus on strategic vision, market opportunity, and long-term potential. Speak about the big picture. Start with 'Большая картина...'"
  },
  prisma: {
    name: 'Prisma',
    emoji: '💎',
    style: 'empathetic, user-focused',
    prompt: "You are Prisma 💎, a Product Manager obsessed with user needs. Focus on user problems, empathy, and actionable insights. Start with 'Люди страдают...' or 'Пользователи говорят...'"
  },
  toxic: {
    name: 'Toxic',
    emoji: '☢️',
    style: 'critical, honest',
    prompt: "You are Toxic ☢️, a Red Team Lead. Be critical, skeptical, point out risks and weak spots. Always start with 'Стоп, есть проблема...' or 'НО...' Be blunt but constructive."
  },
  phoenix: {
    name: 'Phoenix',
    emoji: '🔥',
    style: 'energetic, growth-focused',
    prompt: "You are Phoenix 🔥, a CMO focused on growth and trends. Be energetic and excited about opportunities. Start with 'Это огонь!' or 'Рынок растёт...'"
  },
  techpriest: {
    name: 'Tech Priest',
    emoji: '⚙️',
    style: 'technical, precise',
    prompt: "You are Tech Priest ⚙️, the CTO. Focus on technical feasibility, scalability. Start with 'Технически...' Use analogies to explain."
  },
  zen: {
    name: 'Zen',
    emoji: '🧘',
    style: 'calm, human-focused',
    prompt: "You are Zen 🧘, focused on culture and wellbeing. Consider human factors and sustainable growth. Be calm and empathetic."
  },
  virgilia: {
    name: 'Virgilia',
    emoji: '🎨',
    style: 'visual, emotional',
    prompt: "You are Virgilia 🎨, a Visual Storyteller. Focus on emotional resonance and user experience. Paint the picture."
  }
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
  previousResearch: any[],
  visionScores: Record<number, number>
): Promise<{ findings: any; teamComments: any[]; rarityScores: any; verdict?: string }> {
  const config = CARD_CONFIG[cardSlot];
  
  const searchContext = searchResults.map(r => 
    `Source: ${r.url || 'N/A'}\nTitle: ${r.title || ''}\nContent: ${r.content || r.snippet || ''}`
  ).join('\n\n');

  const previousContext = previousResearch.length > 0 
    ? `\n\nPREVIOUS RESEARCH FINDINGS:\n${JSON.stringify(previousResearch.map(r => r.findings), null, 2)}`
    : '';

  // Extract key terms from Vision for relevance checking
  const visionKeywords = [
    visionData.product_name,
    visionData.analogy,
    visionData.product_category,
    visionData.target_audience,
    visionData.demographics,
    visionData.pain_description,
    visionData.your_solution,
    visionData.competitors
  ].filter(Boolean).join(', ');

  // Get the linked Vision card score for ceiling rule
  const linkedVisionSlot = RESEARCH_TO_VISION_MAP[cardSlot];
  const visionScore = visionScores[linkedVisionSlot] || 5;
  const maxAllowedScore = Math.min(10, visionScore + 2);

  // Build insight type descriptions for the prompt
  const insightDescriptions = config.insightTypes.map(it => 
    `INSIGHT "${it.type}":\n- Описание: ${it.description}\n- ✅ Пример: "${it.example}"\n- ❌ НЕ: "${it.antiExample}"`
  ).join('\n\n');

  // Build the MYCELIUM RESEARCH v2.0 system prompt
  const systemPrompt = `🔍 MYCELIUM RESEARCH TEAM v2.0

You are ${config.presenter} ${config.presenterEmoji}, leading the research for ${config.name}.

## ПРИНЦИП
Каждая Research карта ищет 3 РАЗНЫХ инсайта. Не три раза одно и то же, а три разных угла.

## GOLDEN RULE
Research VALIDATES Vision, doesn't replace it.
You search ONLY for what's in Vision cards. No assumptions. No generalizations.

## PROOF RULE
No proof = No insight. Every insight needs:
- Real working URL
- English source preferred (${config.goodSources.join(', ')})
- Date: 2022 or newer

## CEILING RULE
Research score cannot exceed Vision score + 2.
Vision score for this card = ${visionScore}/10, so maximum = ${maxAllowedScore}/10.

## RELEVANCE RULE
Insight is VALID only if contains:
- Product category from V-01 (e.g., "${visionData.analogy || 'numerology'}", "${visionData.product_category || 'astrology'}", "self-discovery")
- OR direct competitor name (${visionData.competitors || 'from Vision'})
- OR exact target audience from V-03 (${visionData.target_audience || 'from Vision'})

Insight is INVALID if:
- About entire mobile app market
- About related but different niche
- Generic without specific numbers
- Not connected to THIS product

## YOUR 3 INSIGHTS FOR ${config.name.toUpperCase()}:
${insightDescriptions}`;

  const analysisPrompt = `## PROJECT VISION (extracted from cards):
- V-01 PRODUCT: ${visionData.product_name || 'Unknown'} - ${visionData.one_liner || ''} (${visionData.analogy || 'category unknown'})
- V-02 PROBLEM: ${visionData.pain_description || 'Not specified'}
- V-03 AUDIENCE: ${visionData.target_audience || 'Not specified'} (${visionData.demographics || ''})
- V-04 VALUE: ${visionData.your_solution || 'Not specified'}
- V-05 VISION: ${visionData.vision_statement || visionData.scale_vision || 'Not specified'}
${previousContext}

## WEB RESEARCH RESULTS:
${searchContext || 'No web results available - use your knowledge but be honest about limited data'}

## REQUIRED OUTPUT:
Find 3 DIFFERENT insights for ${config.name}. Each insight must be specific, with numbers, and from a real source.

Respond in JSON:
{
  "insights": [
    ${config.insightTypes.map(it => `{
      "type": "${it.type}",
      "text": "<specific finding with numbers - in Russian>",
      "source": "<source name>",
      "url": "<real URL>",
      "date": "<year>",
      "score": <1-${maxAllowedScore} - cannot exceed ${maxAllowedScore} due to ceiling rule>,
      "rarity": "<Common|Rare|Epic|Legendary based on score>",
      "why_matters": "<how this relates to Vision - in Russian>"
    }`).join(',\n    ')}
  ],
  "quality_scores": {
    "relevance": <integer 1-10 - is insight about THIS product? Rate honestly>,
    "source_quality": <integer 1-10 - Statista/McKinsey=9-10, blog=3-5>,
    "actuality": <integer 1-10 - 2024=10, 2023=8, 2022=6, older=lower>,
    "actionability": <integer 1-10 - can founder act on this tomorrow?>,
    "uniqueness": <integer 1-10 - obvious=3, interesting=6, wow=9>
  },
  // IMPORTANT: Each quality_score MUST be a DIFFERENT integer! Do NOT give same score to all criteria.
  // Example: {"relevance": 7, "source_quality": 8, "actuality": 6, "actionability": 9, "uniqueness": 5}
  "key_insight": "<main takeaway in 1 sentence in Russian - with specific number>",
  "concerns": ["<list of concerns or gaps in Russian>"]
  ${cardSlot === 10 ? ', "verdict": "<go|conditional_go|pivot|stop>", "verdict_reasoning": "<explanation based on all research in Russian>"' : ''}
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
        { role: 'system', content: systemPrompt },
        { role: 'user', content: analysisPrompt }
      ],
      response_format: { type: "json_object" }
    })
  });

  if (!aiResponse.ok) {
    const errorText = await aiResponse.text();
    console.error('AI analysis failed:', aiResponse.status, errorText);
    throw new Error('AI analysis failed');
  }

  const aiData = await aiResponse.json();
  let analysis;
  try {
    analysis = JSON.parse(aiData.choices[0].message.content);
  } catch (e) {
    console.error('Failed to parse AI response:', aiData.choices[0].message.content);
    throw new Error('Failed to parse AI analysis');
  }

  // Generate team comment from the lead presenter
  const teamComments = [];
  const presenterKey = config.presenter.toLowerCase().replace(' ', '');
  const character = CHARACTER_PROMPTS[presenterKey] || CHARACTER_PROMPTS['phoenix'];
  
  const commentPrompt = `${character.prompt}

Based on these research findings for ${config.name}:
${JSON.stringify(analysis.insights, null, 2)}

Key insight: ${analysis.key_insight}
Concerns: ${analysis.concerns?.join(', ') || 'None noted'}

Provide a brief comment (2-3 sentences MAX) in Russian, in your character's voice. 
Be specific about what you see in the data.`;

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
      characterId: presenterKey,
      characterName: config.presenter,
      emoji: config.presenterEmoji,
      comment: commentData.choices[0].message.content,
      sentiment: presenterKey === 'toxic' ? 'critical' : 'positive'
    });
  }

  // Calculate final rarity based on quality scores with new weights
  const scores = analysis.quality_scores || { relevance: 5, source_quality: 5, actuality: 5, actionability: 5, uniqueness: 5 };
  const weightedScore = (
    (scores.relevance || 5) * 0.30 +
    (scores.source_quality || 5) * 0.25 +
    (scores.actuality || 5) * 0.20 +
    (scores.actionability || 5) * 0.15 +
    (scores.uniqueness || 5) * 0.10
  );

  // Apply ceiling rule
  const cappedScore = Math.min(weightedScore, maxAllowedScore);

  let finalRarity = 'common';
  if (cappedScore >= 9) finalRarity = 'legendary';
  else if (cappedScore >= 6) finalRarity = 'epic';
  else if (cappedScore >= 4) finalRarity = 'rare';
  else if (cappedScore >= 1) finalRarity = 'common';

  // Convert insights array to findings object for backward compatibility
  const findings: Record<string, any> = {};
  if (analysis.insights && Array.isArray(analysis.insights)) {
    analysis.insights.forEach((insight: any) => {
      findings[insight.type] = {
        insight: insight.text,
        source: insight.url || insight.source,
        confidence: insight.score >= 7 ? 'high' : insight.score >= 4 ? 'medium' : 'low',
        why_matters: insight.why_matters,
        score: insight.score,
        rarity: insight.rarity
      };
    });
  }
  findings.key_insight = analysis.key_insight;
  findings.concerns = analysis.concerns;

  return {
    findings,
    teamComments,
    rarityScores: {
      ...scores,
      final_score: cappedScore,
      vision_ceiling: maxAllowedScore
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

    // Combine vision data and extract scores
    const visionData: Record<string, any> = {};
    const visionScores: Record<number, number> = {};
    (visionCards || []).forEach(card => {
      const data = card.card_data as Record<string, any>;
      Object.assign(visionData, data);
      // Extract evaluation score if available
      const evaluation = card.evaluation as Record<string, any>;
      if (evaluation?.overall_score) {
        visionScores[card.card_slot] = evaluation.overall_score;
      } else {
        visionScores[card.card_slot] = 5; // Default score
      }
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
    
    console.log(`Executing research v2.0 for slot ${cardSlot}: ${config.name}`);
    console.log('Search queries:', searchQueries);

    const allResults: any[] = [];
    for (const query of searchQueries) {
      const results = await searchTavily(query);
      allResults.push(...results);
    }

    console.log(`Found ${allResults.length} search results`);

    // Evaluate with AI (now with vision scores for ceiling rule)
    const evaluation = await evaluateWithAI(
      cardSlot,
      visionData,
      allResults,
      previousResearch || [],
      visionScores
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
        final_rarity: evaluation.rarityScores.final_score >= 9 ? 'legendary' 
          : evaluation.rarityScores.final_score >= 6 ? 'epic'
          : evaluation.rarityScores.final_score >= 4 ? 'rare'
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
