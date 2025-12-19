import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.86.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Language = 'en' | 'ru';

const getLocalizedLabels = (lang: Language) => {
  if (lang === 'ru') {
    return {
      idea: 'ИДЕЯ',
      research: 'ИССЛЕДОВАНИЕ',
      build: 'СОЗДАНИЕ',
      grow: 'РОСТ',
      completion: 'завершённость',
      balance: 'баланс',
      quality: 'качество',
      variety: 'разнообразие',
      high: 'высокий',
      medium: 'средний',
      low: 'низкий'
    };
  }
  return {
    idea: 'IDEA',
    research: 'RESEARCH',
    build: 'BUILD',
    grow: 'GROW',
    completion: 'completion',
    balance: 'balance',
    quality: 'quality',
    variety: 'variety',
    high: 'high',
    medium: 'medium',
    low: 'low'
  };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { deckId, language = 'en' } = await req.json();
    const lang = (language === 'ru' ? 'ru' : 'en') as Language;
    const labels = getLocalizedLabels(lang);

    if (!deckId) {
      const errorMsg = lang === 'ru' ? 'deckId обязателен' : 'deckId is required';
      return new Response(JSON.stringify({ error: errorMsg }), {
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

    // Don't select card_image_url - it's huge base64 data (1MB+ per card)
    const { data: deckCards, error: cardsError } = await supabase
      .from('deck_cards')
      .select('id, deck_id, card_slot, card_type, card_data, evaluation, is_insight, created_at, updated_at, last_evaluated_at')
      .eq('deck_id', deckId);

    if (cardsError) throw cardsError;

    // Calculate metrics
    const totalSlots = 20;
    const filledCards = deckCards.filter(card => card.card_data && Object.keys(card.card_data).length > 0);
    const completionRate = (filledCards.length / totalSlots) * 100;

    // Phase distribution (5 cards per phase = 20 total)
    const phaseSlots = {
      idea: [1, 2, 3, 4, 5],
      research: [6, 7, 8, 9, 10],
      build: [11, 12, 13, 14, 15],
      grow: [16, 17, 18, 19, 20]
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
    const evaluatedCards = filledCards.filter(card => {
      const eval_data = card.evaluation as any;
      return eval_data && typeof eval_data.overall === 'number';
    });
    
    const qualityScores = evaluatedCards.map(card => {
      const evaluation = card.evaluation as any;
      return evaluation.overall;
    });
    
    // Scores are on 0-10 scale, convert to 0-100 for consistency
    const qualityScore = qualityScores.length > 0 
      ? (qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length) * 10
      : 0;

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

    // Generate AI insights with localization
    const langInstruction = lang === 'ru' 
      ? 'ВАЖНО: Весь ответ ДОЛЖЕН быть на РУССКОМ языке!'
      : 'IMPORTANT: All responses MUST be in ENGLISH!';

    const roleIntro = lang === 'ru'
      ? `Ты стартап-советник, анализирующий колоду под названием "${deck.title}".`
      : `You are a startup advisor analyzing a deck called "${deck.title}".`;

    const metricsLabel = lang === 'ru' ? 'Метрики здоровья колоды' : 'Deck Health Metrics';
    const overallScoreLabel = lang === 'ru' ? 'Общий балл' : 'Overall Score';
    const completionLabel = lang === 'ru' ? 'Завершённость' : 'Completion';
    const cardsLabel = lang === 'ru' ? 'карточек' : 'cards';
    const phaseBalanceLabel = lang === 'ru' ? 'Баланс фаз' : 'Phase Balance';
    const contentQualityLabel = lang === 'ru' ? 'Качество контента' : 'Content Quality';
    const cardVarietyLabel = lang === 'ru' ? 'Разнообразие карточек' : 'Card Variety';
    const phaseBreakdownLabel = lang === 'ru' ? 'Разбивка по фазам' : 'Phase Breakdown';
    const weakestPhaseLabel = lang === 'ru' ? 'Слабейшая фаза' : 'Weakest Phase';
    const strongestPhaseLabel = lang === 'ru' ? 'Сильнейшая фаза' : 'Strongest Phase';

    const instructionsText = lang === 'ru'
      ? `Сгенерируй JSON ответ с:
1. Краткое резюме текущего состояния колоды (1-2 предложения)
2. 3-5 конкретных, действенных советов по улучшению, расставленных по приоритету воздействия
3. 2-3 сильные стороны для выделения
4. Следующее лучшее действие, которое следует предпринять

Ответь ТОЛЬКО валидным JSON, без markdown:
{
  "summary": "строка на русском",
  "tips": [
    {
      "title": "строка на русском",
      "description": "строка на русском",
      "priority": "high" | "medium" | "low",
      "category": "completion" | "balance" | "quality" | "variety"
    }
  ],
  "strengths": ["строка на русском"],
  "nextAction": "строка на русском"
}`
      : `Generate a JSON response with:
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

    const aiPrompt = `${langInstruction}

${roleIntro}

${metricsLabel}:
- ${overallScoreLabel}: ${overallScore}/100
- ${completionLabel}: ${Math.round(completionRate)}% (${filledCards.length}/${totalSlots} ${cardsLabel})
- ${phaseBalanceLabel}: ${Math.round(balanceScore)}/100
- ${contentQualityLabel}: ${Math.round(qualityScore)}/100
- ${cardVarietyLabel}: ${Math.round(varietyScore)}/100

${phaseBreakdownLabel}:
${phaseCompletion.map(p => `- ${p.phase}: ${p.filled}/${p.total} ${cardsLabel} (${Math.round(p.percentage)}%)`).join('\n')}

${weakestPhaseLabel}: ${analysisContext.weakestPhase.phase} (${Math.round(analysisContext.weakestPhase.percentage)}%)
${strongestPhaseLabel}: ${analysisContext.strongestPhase.phase} (${Math.round(analysisContext.strongestPhase.percentage)}%)

${instructionsText}`;

    const systemPrompt = lang === 'ru'
      ? 'Ты стартап-советник. Отвечай только валидным JSON на русском языке.'
      : 'You are a startup advisor. Return only valid JSON.';

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: aiPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      console.error('AI gateway error:', aiResponse.status);
      throw new Error(lang === 'ru' ? 'Не удалось сгенерировать инсайты' : 'Failed to generate insights');
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
      // Fallback insights based on language
      if (lang === 'ru') {
        insights = {
          summary: "Ваша колода развивается хорошо. Сосредоточьтесь на заполнении пробелов и улучшении качества контента.",
          tips: [
            {
              title: "Заполните недостающие карточки",
              description: `Заполните оставшиеся ${totalSlots - filledCards.length} пустых слотов, чтобы достичь 100% завершённости.`,
              priority: "high",
              category: "completion"
            },
            {
              title: "Сбалансируйте фазы",
              description: `Сфокусируйтесь на фазе ${analysisContext.weakestPhase.phase}, которая требует больше внимания.`,
              priority: "medium",
              category: "balance"
            }
          ],
          strengths: ["Хороший прогресс на данный момент"],
          nextAction: "Поработайте над самой слабой фазой для улучшения общего баланса"
        };
      } else {
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
