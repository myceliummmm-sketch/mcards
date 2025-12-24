import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BuildEvaluateRequest {
  deckId: string;
  language?: 'en' | 'ru';
}

// Scoring criteria for each BUILD card based on ТЗ v4.0
const BUILD_SCORING_CRITERIA: Record<number, {
  name: { en: string; ru: string };
  criteria: {
    key: string;
    weight: number;
    question: { en: string; ru: string };
  }[];
}> = {
  11: {
    name: { en: 'FEATURES', ru: 'ФИЧИ' },
    criteria: [
      { key: 'pain_solving', weight: 0.25, question: { en: 'Do all features solve pains from Research?', ru: 'Все фичи решают боли из Research?' } },
      { key: 'feasibility', weight: 0.25, question: { en: 'Tech Priest: Is everything buildable?', ru: 'Tech Priest: всё реализуемо?' } },
      { key: 'no_bloat', weight: 0.25, question: { en: 'Toxic: No unnecessary features?', ru: 'Toxic: ничего лишнего?' } },
      { key: 'monetization', weight: 0.15, question: { en: 'Is monetization justified?', ru: 'Монетизация обоснована?' } },
      { key: 'engagement', weight: 0.10, question: { en: 'Does engagement create habit?', ru: 'Engagement создаёт привычку?' } },
    ]
  },
  12: {
    name: { en: 'USER PATH', ru: 'ПУТЬ' },
    criteria: [
      { key: 'steps_concrete', weight: 0.20, question: { en: 'Are all 5 steps concrete?', ru: 'Все 5 шагов конкретны?' } },
      { key: 'time_to_value', weight: 0.25, question: { en: 'Time to value < 3 minutes?', ru: 'До ценности < 3 минут?' } },
      { key: 'magic_moment', weight: 0.25, question: { en: 'Does Magic create "wow"?', ru: 'Magic вызывает "вау"?' } },
      { key: 'return_habit', weight: 0.20, question: { en: 'Does Return create habit?', ru: 'Return создаёт привычку?' } },
      { key: 'simplicity', weight: 0.10, question: { en: 'Zen: Not too complex?', ru: 'Zen: не сложно?' } },
    ]
  },
  13: {
    name: { en: 'SCREENS', ru: 'ЭКРАНЫ' },
    criteria: [
      { key: 'path_linked', weight: 0.25, question: { en: 'Each screen linked to path?', ru: 'Каждый экран связан с путём?' } },
      { key: 'onboarding_count', weight: 0.20, question: { en: 'Onboarding ≤ 3 screens?', ru: 'Онбординг ≤ 3 экрана?' } },
      { key: 'total_count', weight: 0.25, question: { en: 'Total screens ≤ 10?', ru: 'Всего ≤ 10 экранов?' } },
      { key: 'ux_audience', weight: 0.20, question: { en: 'UX notes consider audience?', ru: 'UX заметки учитывают аудиторию?' } },
      { key: 'no_bloat', weight: 0.10, question: { en: 'Toxic: Nothing unnecessary?', ru: 'Toxic: ничего лишнего?' } },
    ]
  },
  14: {
    name: { en: 'STYLE', ru: 'СТИЛЬ' },
    criteria: [
      { key: 'data_justified', weight: 0.30, question: { en: 'Each choice justified by data?', ru: 'Каждый выбор обоснован данными?' } },
      { key: 'references_known', weight: 0.25, question: { en: 'References known to audience?', ru: 'Референсы знакомы аудитории?' } },
      { key: 'value_screams', weight: 0.25, question: { en: 'Phoenix: Style screams value?', ru: 'Phoenix: стиль кричит ценность?' } },
      { key: 'competitor_diff', weight: 0.20, question: { en: 'Toxic: Different from competitors?', ru: 'Toxic: отличается от конкурентов?' } },
    ]
  },
  15: {
    name: { en: 'SUMMARY', ru: 'СБОРКА' },
    criteria: [
      { key: 'all_filled', weight: 0.25, question: { en: 'Everything filled?', ru: 'Всё заполнено?' } },
      { key: 'coherent', weight: 0.30, question: { en: 'Ever Green: All coherent?', ru: 'Ever Green: всё согласовано?' } },
      { key: 'tech_optimal', weight: 0.25, question: { en: 'Tech Stack optimal?', ru: 'Tech Stack оптимален?' } },
      { key: 'ready', weight: 0.20, question: { en: 'Toxic: Ready to generate?', ru: 'Toxic: готов к генерации?' } },
    ]
  }
};

// Rarity thresholds based on ТЗ v4.0
const RARITY_THRESHOLDS = {
  legendary: 90,
  epic: 75,
  rare: 50,
  common: 0
};

function getRarity(score: number): { name: string; nameRu: string; emoji: string } {
  if (score >= RARITY_THRESHOLDS.legendary) return { name: 'LEGENDARY', nameRu: 'ЛЕГЕНДАРНЫЙ', emoji: '🏆' };
  if (score >= RARITY_THRESHOLDS.epic) return { name: 'EPIC', nameRu: 'ЭПИЧЕСКИЙ', emoji: '💜' };
  if (score >= RARITY_THRESHOLDS.rare) return { name: 'RARE', nameRu: 'РЕДКИЙ', emoji: '💙' };
  return { name: 'COMMON', nameRu: 'ОБЫЧНЫЙ', emoji: '⬜' };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { deckId, language = 'ru' } = await req.json() as BuildEvaluateRequest;

    console.log(`[BUILD-EVALUATE] Evaluating BUILD phase for deck ${deckId}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch BUILD cards (slots 11-15)
    const { data: buildCards, error: buildError } = await supabase
      .from('deck_cards')
      .select('*')
      .eq('deck_id', deckId)
      .gte('card_slot', 11)
      .lte('card_slot', 15)
      .order('card_slot');

    if (buildError) {
      throw new Error(`Failed to fetch BUILD cards: ${buildError.message}`);
    }

    // Fetch Vision cards for context
    const { data: visionCards } = await supabase
      .from('deck_cards')
      .select('*')
      .eq('deck_id', deckId)
      .gte('card_slot', 1)
      .lte('card_slot', 5);

    // Fetch Research cards for context
    const { data: researchCards } = await supabase
      .from('deck_cards')
      .select('*')
      .eq('deck_id', deckId)
      .gte('card_slot', 6)
      .lte('card_slot', 10);

    // Use AI to evaluate each BUILD card
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const cardScores: Record<number, { score: number; details: Record<string, number>; feedback: string }> = {};

    for (const slot of [11, 12, 13, 14, 15]) {
      const card = buildCards?.find(c => c.card_slot === slot);
      const cardData = card?.card_data as Record<string, any> | null;

      if (!cardData || Object.keys(cardData).length === 0) {
        cardScores[slot] = { score: 0, details: {}, feedback: language === 'ru' ? 'Карта не заполнена' : 'Card not filled' };
        continue;
      }

      const criteria = BUILD_SCORING_CRITERIA[slot];

      // Build evaluation prompt
      const evalPrompt = `You are evaluating a BUILD phase card for a startup deck builder.

CARD: ${criteria.name[language]} (Slot ${slot})
CARD DATA:
${JSON.stringify(cardData, null, 2)}

CONTEXT - Vision Cards:
${JSON.stringify(visionCards?.map(c => ({ slot: c.card_slot, data: c.card_data })) || [], null, 2)}

CONTEXT - Research Cards:
${JSON.stringify(researchCards?.map(c => ({ slot: c.card_slot, data: c.card_data })) || [], null, 2)}

CONTEXT - Other BUILD Cards:
${JSON.stringify(buildCards?.filter(c => c.card_slot !== slot).map(c => ({ slot: c.card_slot, data: c.card_data })) || [], null, 2)}

EVALUATION CRITERIA:
${criteria.criteria.map((c, i) => `${i + 1}. ${c.question[language]} (weight: ${c.weight * 100}%)`).join('\n')}

For EACH criterion, score from 0-100 based on how well the card meets it.
Consider:
- Does the card reference source data from Vision/Research?
- Is the content specific or generic?
- Are there red flags (bloat, unrealistic claims, missing data)?

OUTPUT FORMAT (JSON only, no markdown):
{
  "scores": {
    "${criteria.criteria.map(c => c.key).join('": 0, "')}": 0
  },
  "feedback": "[2-3 sentences of constructive feedback in ${language === 'ru' ? 'Russian' : 'English'}]",
  "strengths": "[1-2 key strengths]",
  "improvements": "[1-2 key improvements needed]"
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
              { role: 'system', content: 'You are a strict but fair startup evaluator. Return only valid JSON.' },
              { role: 'user', content: evalPrompt }
            ],
          }),
        });

        if (!response.ok) {
          throw new Error(`AI request failed: ${response.status}`);
        }

        const aiData = await response.json();
        const content = aiData.choices?.[0]?.message?.content || '';

        // Parse AI response
        let evalResult: any;
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          evalResult = JSON.parse(jsonMatch ? jsonMatch[0] : content);
        } catch {
          console.error(`[BUILD-EVALUATE] Failed to parse AI response for slot ${slot}`);
          evalResult = { scores: {}, feedback: 'Evaluation error' };
        }

        // Calculate weighted score
        let weightedScore = 0;
        const details: Record<string, number> = {};

        for (const criterion of criteria.criteria) {
          const criterionScore = evalResult.scores?.[criterion.key] || 50;
          details[criterion.key] = criterionScore;
          weightedScore += criterionScore * criterion.weight;
        }

        cardScores[slot] = {
          score: Math.round(weightedScore),
          details,
          feedback: evalResult.feedback || ''
        };

      } catch (evalError) {
        console.error(`[BUILD-EVALUATE] Error evaluating slot ${slot}:`, evalError);
        cardScores[slot] = { score: 50, details: {}, feedback: 'Evaluation incomplete' };
      }
    }

    // Calculate overall BUILD score
    const filledCards = Object.values(cardScores).filter(c => c.score > 0);
    const overallScore = filledCards.length > 0
      ? Math.round(filledCards.reduce((sum, c) => sum + c.score, 0) / filledCards.length)
      : 0;

    const rarity = getRarity(overallScore);

    // Build coherence check
    const coherenceCheck = {
      features_solve_pain: cardScores[11]?.details?.pain_solving >= 70,
      path_delivers_value: cardScores[12]?.details?.magic_moment >= 70,
      screens_match_path: cardScores[13]?.details?.path_linked >= 70,
      style_fits_audience: cardScores[14]?.details?.data_justified >= 70,
    };

    const result = {
      success: true,
      overallScore,
      rarity: {
        name: rarity.name,
        nameLocalized: language === 'ru' ? rarity.nameRu : rarity.name,
        emoji: rarity.emoji
      },
      cardScores,
      coherenceCheck,
      summary: language === 'ru'
        ? `BUILD фаза: ${overallScore}% (${rarity.nameRu})`
        : `BUILD phase: ${overallScore}% (${rarity.name})`
    };

    console.log(`[BUILD-EVALUATE] Complete: ${overallScore}% ${rarity.name}`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[BUILD-EVALUATE] Error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
