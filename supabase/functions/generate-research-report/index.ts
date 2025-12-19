import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

// Helper functions to extract data from research insights
const extractMarketSize = (insights: any[]): string | null => {
  for (const insight of insights) {
    const content = insight.content || '';
    const match = content.match(/\$[\d.,]+\s*(млрд|млн|B|M|трлн|T)/i);
    if (match) return match[0];
  }
  return null;
};

const extractGrowthRate = (insights: any[]): string | null => {
  for (const insight of insights) {
    const content = insight.content || '';
    const match = content.match(/(\d+[.,]?\d*)\s*%/);
    if (match) return match[0];
  }
  return null;
};

const extractOpportunity = (insights: any[]): string | null => {
  if (insights.length > 0 && insights[0].content) {
    return insights[0].content.substring(0, 150);
  }
  return null;
};

const extractFromInsights = (insights: any[], index: number): string | null => {
  if (insights[index] && insights[index].content) {
    return insights[index].content.substring(0, 80);
  }
  return null;
};

const extractCompetitor = (insights: any[], index: number): string | null => {
  if (insights[index] && insights[index].content) {
    const content = insights[index].content;
    // Try to extract competitor name from content
    const shortened = content.substring(0, 60);
    return shortened;
  }
  return null;
};

const extractRisks = (insights: any[]): string[] => {
  if (insights.length === 0) return ['Риски не определены'];
  return insights.slice(0, 3).map(i => (i.content || 'Риск не определён').substring(0, 60));
};

const extractWhyNow = (marketInsights: any[], opportunityInsights: any[]): string[] => {
  const combined = [...marketInsights, ...opportunityInsights];
  if (combined.length === 0) return ['Тренды не определены'];
  return combined.slice(0, 3).map(i => (i.content || 'Тренд').substring(0, 60));
};
const generateImagePrompt = (data: any): string => {
  const {
    productName,
    productSummary,
    verdict,
    metrics,
    opportunity,
    audience,
    competitors,
    quote,
    risks,
    whyNow,
    recommendation
  } = data;

  return `MYCELIUM UNIVERSE STYLE: dark premium startup report, deep rich colors not pastel, 
bioluminescent accents, clean modern layout, data visualization focus,
professional but magical, collectible artifact feeling

LAYOUT: vertical one-page report, aspect ratio 3:4

BACKGROUND: deep dark blue-black gradient (#0D1117 to #161B22)

---

HEADER SECTION (top 15%):

Left side:
- Mycelium mushroom logo, small, glowing teal
- "MYCELIUM RESEARCH REPORT" text, small caps, white

Center:
- Product name "${productName}" large, bold, white
- One-line description below: "${productSummary}", smaller, gray (#8B949E)

Right side:
- "Export" icon subtle

---

VERDICT SECTION (next 12%):

Center:
- Large glowing circle with score "${verdict.score.toFixed(1)}" huge number inside
- "${verdict.rarity.toUpperCase()}" label above the number, ${verdict.rarity === 'legendary' ? 'gold glow (#FFD700)' : verdict.rarity === 'epic' ? 'purple glow (#9C27B0)' : verdict.rarity === 'rare' ? 'blue glow (#2196F3)' : 'gray glow'}
- "${verdict.resonatedCount}/${verdict.totalCount} резонирует" small text below
- Circle has bioluminescent glow effect

---

KEY METRICS SECTION (next 15%):

Three large metric cards in a row, equal width:

Card 1 - РЫНОК:
- Huge number "${metrics.marketSize}" in teal (#00CED1)
- Small label "размер ниши" below
- Subtle chart icon

Card 2 - РОСТ:
- Huge number "${metrics.marketGrowth}" in teal
- Small label "ежегодно" below
- Trending up arrow icon

Card 3 - ЛИДЕР:
- Huge number "${metrics.marketLeader}" in teal
- Small label "${metrics.leaderName}" below
- Crown or star icon

Cards have dark background (#1C2128), subtle border glow, rounded corners

---

OPPORTUNITY SECTION (next 10%):

One wide card, coral accent border (#E85D75):
- "🎯 ВОЗМОЖНОСТЬ" header
- Main text: "${opportunity}"
- Glowing effect on border

---

TWO COLUMNS SECTION (next 20%):

Left column - АУДИТОРИЯ с Prisma:
- Small circular avatar of Prisma (crystal/diamond aesthetic, teal glow)
- "💎 Prisma" name label
- Card with:
  - "${audience.demographics}"
  - "${audience.psychographics}"
  - "${audience.channels}"
  - "${audience.spending}"

Right column - КОНКУРЕНТЫ с Toxic:
- Small circular avatar of Toxic (radioactive aesthetic, red/orange glow)
- "☢️ Toxic" name label  
- Card with:
  - "${competitors.competitor1}"
  - "${competitors.competitor2}"
  - "${competitors.competitor3}"
  - "= Твоё окно"

---

QUOTE SECTION (next 10%):

Wide card with special styling:
- Large quotation marks, coral color
- "${quote.text}"
- Attribution: "— ${quote.source}"
- Prisma small avatar in corner
- Subtle gradient background

---

BOTTOM SECTION (final 18%):

Two columns:

Left - РИСКИ с Toxic (smaller, muted):
- "⚠️ РИСКИ" header, orange (#F59E0B)
- Small circular Toxic avatar
- Bullet points:
  - "${risks[0]}"
  - "${risks[1]}"
  - "${risks[2]}"

Right - ПОЧЕМУ СЕЙЧАС с Phoenix (brighter):
- "🔥 ПОЧЕМУ СЕЙЧАС" header, coral
- Small circular Phoenix avatar (fire aesthetic, orange glow)
- Bullet points:
  - "${whyNow[0]}"
  - "${whyNow[1]}"
  - "${whyNow[2]}"

---

FOOTER - RECOMMENDATION:

Full width card, gradient background (teal to purple):
- Ever Green avatar (tree aesthetic, green glow) on left
- "🌲 РЕКОМЕНДАЦИЯ EVER GREEN" header
- Main text: "${recommendation}"
- Large button: "🚀 Перейти к BUILD" with glow effect

---

TEAM AVATARS STYLE:

Each advisor has distinct visual:
- 💎 Prisma: crystalline, diamond shapes, teal/cyan glow
- ☢️ Toxic: radioactive symbol elements, orange/red warning glow
- 🔥 Phoenix: flame elements, orange/gold warm glow
- 🌲 Ever Green: tree/leaf elements, green nature glow

Avatars are small circular icons (40-50px), stylized not realistic, 
matching Mycelium bioluminescent aesthetic

---

TYPOGRAPHY:
- Headers: Bold, white, clean sans-serif
- Numbers: Extra bold, teal accent color, large
- Body: Regular weight, white or light gray
- Sources: Small, muted gray, italic

EFFECTS:
- Subtle glow on accent elements
- Soft shadows on cards
- No harsh borders, use gradients
- Floating spore particles in background (very subtle)

FORBIDDEN:
- No cluttered layouts
- No walls of text
- No boring corporate look
- No light/white backgrounds
- No generic stock imagery

Generate a beautiful, premium, collectible research report poster.`;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { deckId } = await req.json();
    if (!deckId) {
      throw new Error('Missing deckId');
    }

    console.log('Generating report for deck:', deckId);

    // Fetch Vision cards (slots 1-5)
    const { data: visionCards, error: visionError } = await supabaseClient
      .from('deck_cards')
      .select('card_slot, card_data, card_type, evaluation')
      .eq('deck_id', deckId)
      .in('card_slot', [1, 2, 3, 4, 5]);

    if (visionError) throw visionError;

    // Fetch Research results (slots 6-10)
    const { data: researchResults, error: researchError } = await supabaseClient
      .from('research_results')
      .select('card_slot, findings, sources, rarity_scores, final_rarity, verdict, team_comments')
      .eq('deck_id', deckId)
      .eq('status', 'accepted');

    if (researchError) throw researchError;

    console.log('Vision cards:', visionCards?.length, 'Research results:', researchResults?.length);

    // Parse vision data
    const visionData: Record<string, any> = {};
    visionCards?.forEach(card => {
      const slotNames: Record<number, string> = {
        1: 'product',
        2: 'problem',
        3: 'audience',
        4: 'value',
        5: 'vision'
      };
      visionData[slotNames[card.card_slot]] = card.card_data;
    });

    // Parse research data
    const researchData: Record<string, any> = {};
    let totalResonated = 0;
    let totalInsights = 0;
    let totalScore = 0;
    let scoreCount = 0;

    researchResults?.forEach(result => {
      const slotNames: Record<number, string> = {
        6: 'market',
        7: 'competitors',
        8: 'users',
        9: 'risks',
        10: 'opportunity'
      };
      
      const findings = result.findings as any;
      researchData[slotNames[result.card_slot]] = {
        ...findings,
        sources: result.sources,
        rarity: result.final_rarity,
        comments: result.team_comments,
      };

      if (findings?.resonated_count !== undefined) {
        totalResonated += findings.resonated_count;
        totalInsights += findings.total_count || 3;
      }
      
      const rarityScores = result.rarity_scores as any;
      if (rarityScores?.final_score) {
        totalScore += rarityScores.final_score;
        scoreCount++;
      }
    });

    const averageScore = scoreCount > 0 ? totalScore / scoreCount : 5;

    // Calculate final rarity
    const calculateRarity = (score: number): string => {
      if (score >= 9.4) return 'legendary';
      if (score >= 8.0) return 'epic';
      if (score >= 7.0) return 'rare';
      if (score >= 6.0) return 'uncommon';
      return 'common';
    };

    const finalRarity = calculateRarity(averageScore);

    // First, generate structured data using text AI
    const systemPrompt = `Ты — аналитик стартапов. Создай данные для Research Report на основе Vision и Research карт.

ФОРМАТ ОТВЕТА (строго JSON):
{
  "productName": "Название продукта из V-01",
  "productSummary": "Одно предложение — суть продукта (до 15 слов)",
  "metrics": {
    "marketSize": "$X.XB" или "$XXM",
    "marketGrowth": "XX%",
    "marketLeader": "XXM" или "XXK",
    "leaderName": "Название лидера"
  },
  "opportunity": "Главная возможность в 1-2 предложения",
  "audience": {
    "demographics": "Демография (5-10 слов)",
    "psychographics": "Психография (5-10 слов)",
    "channels": "Где обитают (5-10 слов)",
    "spending": "Платёжеспособность (5-10 слов)"
  },
  "competitors": {
    "competitor1": "Competitor1: слабость",
    "competitor2": "Competitor2: слабость",
    "competitor3": "Competitor3: слабость"
  },
  "quote": {
    "text": "Цитата пользователя о боли (1-2 предложения)",
    "source": "Reddit r/subreddit или Отзывы"
  },
  "risks": ["Риск 1 (5-10 слов)", "Риск 2", "Риск 3"],
  "whyNow": ["Тренд 1 (5-10 слов)", "Тренд 2", "Тренд 3"],
  "recommendation": "Финальная рекомендация в одном предложении"
}

ПРАВИЛА:
- Используй ТОЛЬКО данные из Vision и Research
- Все тексты должны быть краткими и ёмкими
- Цифры должны быть конкретными
- Язык: русский для текста`;

    const userPrompt = `VISION КАРТЫ:
${JSON.stringify(visionData, null, 2)}

RESEARCH РЕЗУЛЬТАТЫ:
${JSON.stringify(researchData, null, 2)}

МЕТРИКИ:
- Резонанс: ${totalResonated}/${totalInsights}
- Средняя оценка: ${averageScore.toFixed(1)}/10
- Рарность: ${finalRarity}

Создай данные для отчёта.`;

    console.log('Generating report data with AI...');

    const textResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!textResponse.ok) {
      const errorText = await textResponse.text();
      console.error('Text AI API error:', errorText);
      throw new Error('Failed to generate report data');
    }

    const textData = await textResponse.json();
    const textContent = textData.choices?.[0]?.message?.content;

    if (!textContent) {
      throw new Error('No content from text AI');
    }

    // Parse JSON from AI response
    let reportJson: any = {};
    try {
      const jsonMatch = textContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        reportJson = JSON.parse(jsonMatch[1].trim());
      } else {
        reportJson = JSON.parse(textContent);
      }
    } catch (e) {
      console.error('Failed to parse AI response:', textContent);
      // Use fallback structure instead of throwing
      reportJson = {};
    }

    // Get product info from vision data with fallbacks
    const productData = visionData.product || {};
    const problemData = visionData.problem || {};
    const audienceData = visionData.audience || {};
    
    // Get market data from research
    const marketData = researchData.market || {};
    const competitorsData = researchData.competitors || {};
    const usersData = researchData.users || {};
    const risksData = researchData.risks || {};
    const opportunityData = researchData.opportunity || {};

    console.log('Market data structure:', JSON.stringify(marketData, null, 2).substring(0, 500));
    console.log('Competitors data structure:', JSON.stringify(competitorsData, null, 2).substring(0, 500));
    console.log('Users data structure:', JSON.stringify(usersData, null, 2).substring(0, 500));

    // Extract insights from research - handle both array and object formats
    const getInsights = (data: any): any[] => {
      if (Array.isArray(data?.insights)) return data.insights;
      if (Array.isArray(data)) return data;
      return [];
    };
    
    const marketInsights = getInsights(marketData);
    const competitorInsights = getInsights(competitorsData);
    const userInsights = getInsights(usersData);
    const riskInsights = getInsights(risksData);
    const opportunityInsights = getInsights(opportunityData);
    
    console.log('Extracted insights counts:', {
      market: marketInsights.length,
      competitors: competitorInsights.length,
      users: userInsights.length,
      risks: riskInsights.length,
      opportunity: opportunityInsights.length
    });
    
    // Log first insight content for debugging
    if (marketInsights.length > 0) {
      console.log('First market insight content:', marketInsights[0]?.content?.substring(0, 200));
    }

    // Build comprehensive report with fallbacks
    const finalReportJson: any = {
      productName: reportJson.productName || productData.product_name || 'Unnamed Product',
      productSummary: reportJson.productSummary || productData.one_liner || 'Описание отсутствует',
      verdict: {
        rarity: finalRarity,
        score: averageScore,
        resonatedCount: totalResonated,
        totalCount: totalInsights,
      },
      metrics: {
        marketSize: reportJson.metrics?.marketSize || extractMarketSize(marketInsights) || '$N/A',
        marketGrowth: reportJson.metrics?.marketGrowth || extractGrowthRate(marketInsights) || 'N/A',
        marketLeader: reportJson.metrics?.marketLeader || 'N/A',
        leaderName: reportJson.metrics?.leaderName || 'Лидер рынка',
      },
      opportunity: reportJson.opportunity || extractOpportunity(opportunityInsights) || 'Возможность не определена',
      audience: {
        demographics: reportJson.audience?.demographics || extractFromInsights(userInsights, 0) || audienceData.demographics || 'Не определено',
        psychographics: reportJson.audience?.psychographics || extractFromInsights(userInsights, 1) || audienceData.psychographics || 'Не определено',
        channels: reportJson.audience?.channels || extractFromInsights(userInsights, 2) || audienceData.channels || 'Не определено',
        spending: reportJson.audience?.spending || audienceData.spending_habits || 'Не определено',
      },
      competitors: {
        competitor1: reportJson.competitors?.competitor1 || extractCompetitor(competitorInsights, 0) || 'Конкурент 1',
        competitor2: reportJson.competitors?.competitor2 || extractCompetitor(competitorInsights, 1) || 'Конкурент 2',
        competitor3: reportJson.competitors?.competitor3 || extractCompetitor(competitorInsights, 2) || 'Конкурент 3',
      },
      quote: {
        text: reportJson.quote?.text || problemData.pain_description?.substring(0, 150) || 'Нет цитаты',
        source: reportJson.quote?.source || 'Исследование рынка',
      },
      risks: reportJson.risks?.length ? reportJson.risks : extractRisks(riskInsights),
      whyNow: reportJson.whyNow?.length ? reportJson.whyNow : extractWhyNow(marketInsights, opportunityInsights),
      recommendation: reportJson.recommendation || 'Рекомендуется продолжить разработку и тестирование гипотез.',
    };

    console.log('Report data generated successfully');

    // Return structured data for HTML rendering (no image generation)
    return new Response(JSON.stringify(finalReportJson), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error generating report:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
