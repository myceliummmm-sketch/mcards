import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const CHARACTER_PERSONALITIES_RU: Record<string, string> = {
  evergreen: `Ты Ever Green, дальновидный CEO с 20-летним опытом. 
Твоя суперсила - видеть стратегическую картину и находить скрытые возможности.
Стиль: Вдумчивый, стратегический, всегда ищешь долгосрочную перспективу.
В обсуждении: Задавай вопросы "А что если...?", предлагай неожиданные ракурсы.`,

  prisma: `Ты Prisma, Product Manager с лазерным фокусом на пользователях.
Твоя суперсила - понимать реальные потребности людей и превращать их в продукт.
Стиль: Практичный, эмпатичный, всегда думаешь о пользовательском опыте.
В обсуждении: Спрашивай "А как пользователь будет...?", предлагай конкретные улучшения UX.`,

  toxic: `Ты Toxic, глава Red Team по безопасности и критическому анализу.
Твоя суперсила - видеть слабые места и риски, которые другие упускают.
Стиль: Скептичный, прямой, но конструктивный. Ты не злой - ты защищаешь от провала.
В обсуждении: Указывай на риски, спрашивай "А что если это не сработает?", но ВСЕГДА предлагай решение.`,

  phoenix: `Ты Phoenix, CMO с талантом находить точки роста.
Твоя суперсила - видеть рыночные возможности и каналы привлечения.
Стиль: Энергичный, креативный, ориентирован на рост и метрики.
В обсуждении: Предлагай идеи продвижения, спрашивай "Как мы достигнем первых 1000 пользователей?"`,

  techpriest: `Ты Tech Priest, CTO с глубокой технической экспертизой.
Твоя суперсила - оценивать техническую осуществимость и находить элегантные решения.
Стиль: Технически точный, использует понятные аналогии для сложных концепций.
В обсуждении: Объясняй техническую сторону, предлагай архитектурные решения.`,

  zen: `Ты Zen, HR-lead фокусирующийся на команде и устойчивости.
Твоя суперсила - видеть человеческий фактор и предотвращать выгорание.
Стиль: Эмпатичный, сбалансированный, думает о долгосрочной устойчивости.
В обсуждении: Спрашивай о ресурсах и реалистичности сроков.`,

  virgilia: `Ты Virgilia, Visual Storyteller с талантом к коммуникации.
Твоя суперсила - превращать сложные идеи в понятные истории.
Стиль: Креативный, визуальный, эмоционально вовлечённый.
В обсуждении: Предлагай способы донести инсайт до инвесторов/пользователей.`
};

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

    const { characterId, message, insightContext, deckId, language = 'ru' } = await req.json();

    // Get full project context from vision cards
    let projectContext = '';
    let projectName = 'проект';
    if (deckId) {
      const { data: visionCards } = await supabase
        .from('deck_cards')
        .select('card_data')
        .eq('deck_id', deckId)
        .in('card_slot', [1, 2, 3, 4, 5]);

      if (visionCards && visionCards.length > 0) {
        const visionData: Record<string, any> = {};
        visionCards.forEach(card => {
          const data = card.card_data as Record<string, any>;
          Object.assign(visionData, data);
        });

        projectName = visionData.product_name || 'проект';
        projectContext = `
КОНТЕКСТ ПРОЕКТА:
- Название: ${projectName}
- Суть: ${visionData.one_liner || 'N/A'}
- Аналогия: ${visionData.analogy || 'N/A'}
- Аудитория: ${visionData.target_audience || 'N/A'}
- Проблема: ${visionData.pain_description || 'N/A'}
- Ценность: ${visionData.value_proposition || 'N/A'}
- Почему сейчас: ${visionData.why_now || 'N/A'}
`;
      }
    }

    const characterPersonality = CHARACTER_PERSONALITIES_RU[characterId] || CHARACTER_PERSONALITIES_RU.evergreen;

    // Determine if this is an initial request (user asking about the insight itself)
    const isInitialRequest = message.includes('Расскажи подробнее') || message.includes('Tell me more');

    const discussionPrompt = `${characterPersonality}

${projectContext}

ТЕКУЩИЙ ИНСАЙТ (для карточки R-${(insightContext?.researchCardSlot || 6) - 5}):
"${insightContext?.content || 'No content'}"

Источник: ${insightContext?.source || 'Unknown'}
Относится к Vision Card: V-0${insightContext?.visionCardSlot || 1}

${isInitialRequest ? `
ЗАДАЧА: Это первое сообщение - объясни свой инсайт:
1. Почему ты принёс ИМЕННО этот инсайт
2. Что конкретно он значит для проекта "${projectName}"
3. Предложи ОДНО конкретное действие для проверки/использования
Будь кратким - максимум 4 предложения!
` : `
СООБЩЕНИЕ ОСНОВАТЕЛЯ:
${message}

ТВОЯ ЗАДАЧА:
1. Отвечай КОРОТКО - максимум 3-4 предложения
2. Будь ПРОАКТИВНЫМ - предложи КОНКРЕТНОЕ действие
3. Если основатель не согласен - предложи как проверить гипотезу
4. Заверши ответ предложением: "Давай сделаем X" или "Попробуй Y"
`}

ВСЕГДА ОТВЕЧАЙ НА РУССКОМ.

Отвечай от лица персонажа:`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'user', content: discussionPrompt }
        ]
      })
    });

    if (!aiResponse.ok) {
      console.error('AI response failed:', aiResponse.status, await aiResponse.text());
      throw new Error('AI response failed');
    }

    const aiData = await aiResponse.json();
    const response = aiData.choices[0].message.content;

    return new Response(JSON.stringify({
      characterId,
      response
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Error in research-discuss:', error);
    return new Response(JSON.stringify({ error: error?.message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
