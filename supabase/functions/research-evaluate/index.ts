import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

// Team character expertise and evaluation focus
const EVALUATORS = {
  phoenix: {
    criterion: 'depth',
    name: 'Феникс',
    role: 'CMO',
    expertise: 'рост, бренд и маркетинг',
    evalFocus: 'глубину анализа рынка и потенциал для роста бренда',
    style: 'энергичный, визионерский, ориентированный на рост',
  },
  toxic: {
    criterion: 'uniqueness', 
    name: 'Токсик',
    role: 'Red Team Lead',
    expertise: 'риски и конкурентный анализ',
    evalFocus: 'уникальность позиционирования и конкурентные преимущества',
    style: 'критичный, прямой, ищет слабые места',
  },
  prisma: {
    criterion: 'actionability',
    name: 'Призма',
    role: 'Product Manager',
    expertise: 'потребности пользователей и продуктовая стратегия',
    evalFocus: 'практическую применимость инсайтов для развития продукта',
    style: 'прагматичный, user-centric, ориентированный на действия',
  },
  evergreen: {
    criterion: 'source_quality',
    name: 'Эвер Грин',
    role: 'CEO',
    expertise: 'стратегическое видение и принятие решений',
    evalFocus: 'качество источников и достоверность данных для стратегических решений',
    style: 'стратегический, вдумчивый, системный мыслитель',
  },
};

interface InsightData {
  content: string;
  source: string;
  sourceUrl?: string;
  score: number;
  rarity: string;
  resonated?: boolean;
}

interface EvaluationResult {
  depth: { score: number; explanation: string; evaluator: string };
  uniqueness: { score: number; explanation: string; evaluator: string };
  actionability: { score: number; explanation: string; evaluator: string };
  source_quality: { score: number; explanation: string; evaluator: string };
  final_score: number;
}

async function generateEvaluations(
  insights: InsightData[],
  researchCardName: string,
  language: string = 'ru'
): Promise<EvaluationResult> {
  const insightsSummary = insights.map((i, idx) => 
    `Инсайт ${idx + 1} (${i.rarity}, ${i.score}/10): "${i.content.substring(0, 300)}..."\nИсточник: ${i.source || 'AI Analysis'}`
  ).join('\n\n');

  const resonatedCount = insights.filter(i => i.resonated).length;
  const avgScore = insights.reduce((sum, i) => sum + i.score, 0) / insights.length;

  const evaluations: any = {};

  // Generate evaluation from each character in parallel
  const evaluationPromises = Object.entries(EVALUATORS).map(async ([charId, char]) => {
    const prompt = `Ты ${char.name}, ${char.role} стартап-команды. Твоя экспертиза: ${char.expertise}.
Твой стиль общения: ${char.style}.

ЗАДАЧА: Оцени качество research-инсайтов по карточке "${researchCardName}".

ИНСАЙТЫ ДЛЯ ОЦЕНКИ:
${insightsSummary}

СТАТИСТИКА:
- Всего инсайтов: ${insights.length}
- Принято (резонировало): ${resonatedCount}
- Средний балл: ${avgScore.toFixed(1)}/10

ТЫ ОЦЕНИВАЕШЬ: ${char.evalFocus}

КРИТЕРИИ ОЦЕНКИ "${char.criterion}":
${char.criterion === 'depth' ? '- Насколько глубоко проработана тема?\n- Есть ли конкретные данные и цифры?\n- Охвачены ли ключевые аспекты?' : ''}
${char.criterion === 'uniqueness' ? '- Насколько уникальны эти инсайты?\n- Дают ли они конкурентное преимущество?\n- Есть ли здесь редкие находки?' : ''}
${char.criterion === 'actionability' ? '- Можно ли сразу применить эти инсайты?\n- Понятны ли следующие шаги?\n- Помогут ли они в разработке продукта?' : ''}
${char.criterion === 'source_quality' ? '- Надёжны ли источники данных?\n- Верифицированы ли факты?\n- Актуальны ли данные?' : ''}

ВАЖНО: Отвечай от первого лица, как будто ты ${char.name}. Используй свой характерный стиль.

Верни JSON:
{
  "score": <число от 1 до 10>,
  "explanation": "<2-3 предложения объяснения оценки от лица ${char.name}>"
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
            { role: 'system', content: `Ты ${char.name}, эксперт в ${char.expertise}. Твой стиль: ${char.style}. Давай честные, экспертные оценки.` },
            { role: 'user', content: prompt }
          ],
          response_format: { type: "json_object" }
        }),
      });

      if (!response.ok) {
        console.error(`AI evaluation error for ${charId}:`, await response.text());
        return { charId, char, score: avgScore, explanation: `Оценка на основе данных исследования.` };
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) {
        return { charId, char, score: avgScore, explanation: `Оценка на основе данных исследования.` };
      }

      const parsed = JSON.parse(content);
      return {
        charId,
        char,
        score: Math.min(10, Math.max(1, parsed.score || avgScore)),
        explanation: parsed.explanation || `Оценка на основе данных исследования.`,
      };
    } catch (err) {
      console.error(`Failed to generate evaluation for ${charId}:`, err);
      return { charId, char, score: avgScore, explanation: `Оценка на основе данных исследования.` };
    }
  });

  const results = await Promise.all(evaluationPromises);

  // Build evaluation object
  for (const result of results) {
    evaluations[result.char.criterion] = {
      score: Math.round(result.score * 10) / 10,
      explanation: result.explanation,
      evaluator: result.charId,
    };
  }

  // Calculate final score as weighted average
  const weights = { depth: 0.25, uniqueness: 0.25, actionability: 0.3, source_quality: 0.2 };
  let finalScore = 0;
  for (const [key, weight] of Object.entries(weights)) {
    finalScore += (evaluations[key]?.score || avgScore) * weight;
  }

  return {
    ...evaluations,
    final_score: Math.round(finalScore * 10) / 10,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { insights, researchCardName, language = 'ru' } = await req.json();

    if (!insights || !Array.isArray(insights)) {
      return new Response(JSON.stringify({ error: 'insights array required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Generating evaluations for ${insights.length} insights, card: ${researchCardName}`);

    const evaluations = await generateEvaluations(insights, researchCardName, language);

    console.log('Generated evaluations:', JSON.stringify(evaluations, null, 2));

    return new Response(JSON.stringify(evaluations), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err: unknown) {
    console.error('research-evaluate error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
