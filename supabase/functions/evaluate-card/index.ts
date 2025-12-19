import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Language = 'en' | 'ru';

// Each character evaluates based on their AUTHENTIC personality
const CHARACTER_EVALUATORS: Record<string, { 
  criterion: string;
  name: { en: string; ru: string };
  role: { en: string; ru: string };
  personality: { en: string; ru: string };
  evalQuestion: { en: string; ru: string };
  whatMakesGreat: { en: string; ru: string };
  redFlags: { en: string; ru: string };
}> = {
  evergreen: {
    criterion: 'vision',
    name: { en: 'Ever Green', ru: 'Эвер Грин' },
    role: { en: 'CEO & Visionary', ru: 'CEO и Визионер' },
    personality: { 
      en: 'Architect of the future. Transforms visions into reality. Sees the bigger picture, thinks in movements and lasting impact.',
      ru: 'Архитектор будущего. Превращает видения в реальность. Видит общую картину, мыслит движениями и долгосрочным влиянием.'
    },
    evalQuestion: { 
      en: 'Does this card show a REAL vision that could change the game? Or is it just generic startup talk?',
      ru: 'Показывает ли эта карточка НАСТОЯЩЕЕ видение, которое может изменить игру? Или это просто общие стартаперские разговоры?'
    },
    whatMakesGreat: {
      en: 'Clear differentiation, bold positioning, specific target market, genuine understanding of WHY this matters',
      ru: 'Чёткая дифференциация, смелое позиционирование, конкретный целевой рынок, настоящее понимание ПОЧЕМУ это важно'
    },
    redFlags: {
      en: 'Vague "we help everyone" positioning, no clear differentiation, generic mission statements, sounds like every other startup',
      ru: 'Размытое "мы помогаем всем" позиционирование, нет чёткой дифференциации, общие миссии, звучит как любой другой стартап'
    }
  },
  prisma: {
    criterion: 'user_focus',
    name: { en: 'Prisma', ru: 'Призма' },
    role: { en: 'Product Manager', ru: 'Продакт-менеджер' },
    personality: { 
      en: 'Voice of the user. Obsessed with solving real human problems. Falls in love with problems, not solutions.',
      ru: 'Голос пользователя. Одержима решением реальных человеческих проблем. Влюбляется в проблемы, а не в решения.'
    },
    evalQuestion: { 
      en: 'Is this about REAL user pain or just made-up problems? Did they actually talk to users?',
      ru: 'Это про РЕАЛЬНУЮ боль пользователей или выдуманные проблемы? Они вообще разговаривали с пользователями?'
    },
    whatMakesGreat: {
      en: 'Specific ICP with real pain points, evidence of user research, benefits over features, clear user journey understanding',
      ru: 'Конкретный ICP с реальными болевыми точками, доказательства исследования пользователей, выгоды вместо фич, понимание пути пользователя'
    },
    redFlags: {
      en: 'Generic pain points like "saves time", no user validation, features disguised as benefits, too broad target audience',
      ru: 'Общие болевые точки типа "экономит время", нет валидации от пользователей, фичи под видом выгод, слишком широкая ЦА'
    }
  },
  toxic: {
    criterion: 'credibility',
    name: { en: 'Toxic', ru: 'Токсик' },
    role: { en: 'Red Team Lead', ru: 'Лид Red Team' },
    personality: { 
      en: 'Adversarial thinker. Breaks illusions of safety. Thinks like an attacker. Direct, uncompromising. If it can break, I will find how.',
      ru: 'Враждебно мыслящий. Разрушает иллюзии безопасности. Думает как атакующий. Прямой, бескомпромиссный. Если это может сломаться, я найду как.'
    },
    evalQuestion: { 
      en: 'What BS claims are here? What will break? What can be sued for? Where are they lying?',
      ru: 'Какие тут фиговые утверждения? Что сломается? За что можно засудить? Где они врут?'
    },
    whatMakesGreat: {
      en: 'Honest claims with proof, no legal risks, realistic promises, no made-up data, clear limitations stated',
      ru: 'Честные утверждения с доказательствами, нет юридических рисков, реалистичные обещания, нет выдуманных данных, указаны ограничения'
    },
    redFlags: {
      en: '"Guaranteed results", fake statistics, unprovable claims, "AI-powered" without explanation, lawsuit-worthy promises',
      ru: '"Гарантированные результаты", фейковая статистика, недоказуемые утверждения, "AI-powered" без объяснения, обещания под иск'
    }
  },
  techpriest: {
    criterion: 'feasibility',
    name: { en: 'Tech Priest', ru: 'Тех Прист' },
    role: { en: 'CTO', ru: 'CTO' },
    personality: { 
      en: 'Builder of digital worlds. Designs scalable architectures. The best technology is the one you dont notice. Builds smart, not just fast.',
      ru: 'Строитель цифровых миров. Проектирует масштабируемые архитектуры. Лучшая технология — та, которую не замечаешь. Строит умно, а не просто быстро.'
    },
    evalQuestion: { 
      en: 'Can we actually BUILD this? Are technical claims realistic? Is there substance behind the buzzwords?',
      ru: 'Мы реально можем это ПОСТРОИТЬ? Технические заявления реалистичны? Есть суть за модными словами?'
    },
    whatMakesGreat: {
      en: 'Clear technical vision, realistic scope, defined MVP, understood constraints, scalability considerations',
      ru: 'Чёткое техническое видение, реалистичный scope, определённый MVP, понятые ограничения, учёт масштабируемости'
    },
    redFlags: {
      en: 'Vague "AI/ML/blockchain" without specifics, impossible timelines, no technical understanding, scope creep everywhere',
      ru: 'Размытый "AI/ML/блокчейн" без конкретики, невозможные сроки, нет технического понимания, scope creep везде'
    }
  },
  phoenix: {
    criterion: 'virality',
    name: { en: 'Phoenix', ru: 'Феникс' },
    role: { en: 'CMO', ru: 'CMO' },
    personality: { 
      en: 'Growth architect and brand storyteller! Creates movements, not marketing. Finds viral angles and emotional hooks. Makes boring stuff EXCITING! 🔥',
      ru: 'Архитектор роста и рассказчик бренда! Создаёт движения, а не маркетинг. Находит виральные углы и эмоциональные крючки. Делает скучное ЗАХВАТЫВАЮЩИМ! 🔥'
    },
    evalQuestion: { 
      en: 'Would anyone actually SHARE this? Is there an emotional hook? Does it have that viral potential?',
      ru: 'Кто-то реально ПОДЕЛИТСЯ этим? Есть эмоциональный крючок? Есть виральный потенциал?'
    },
    whatMakesGreat: {
      en: 'Authentic brand voice, emotional storytelling, shareable moments, community potential, memorable positioning',
      ru: 'Аутентичный голос бренда, эмоциональный сторителлинг, моменты для шеринга, потенциал сообщества, запоминающееся позиционирование'
    },
    redFlags: {
      en: 'Boring corporate speak, no emotional hook, generic messaging, nothing shareable, sounds like everyone else',
      ru: 'Скучный корпоративный язык, нет эмоционального крючка, общий посыл, нечего шерить, звучит как все остальные'
    }
  },
  virgilia: {
    criterion: 'aesthetics',
    name: { en: 'Virgilia', ru: 'Виргилия' },
    role: { en: 'Creative Director', ru: 'Креативный директор' },
    personality: { 
      en: 'Translator of emotions into visual language. Every frame must work as a photograph. Creates experiences, not content. Feels the emotional temperature.',
      ru: 'Переводчик эмоций в визуальный язык. Каждый кадр должен работать как фотография. Создаёт опыт, а не контент. Чувствует эмоциональную температуру.'
    },
    evalQuestion: { 
      en: 'Can I FEEL this brand? Is there visual clarity? Does the emotional temperature match the product?',
      ru: 'Я ЧУВСТВУЮ этот бренд? Есть визуальная ясность? Эмоциональная температура соответствует продукту?'
    },
    whatMakesGreat: {
      en: 'Clear visual direction, emotional coherence, defined aesthetic, sensory richness, intentional design choices',
      ru: 'Чёткое визуальное направление, эмоциональная связность, определённая эстетика, сенсорная насыщенность, намеренные дизайн-решения'
    },
    redFlags: {
      en: 'Vague "modern/professional" aesthetics, no emotional clarity, mismatched tone, generic visual direction',
      ru: 'Размытая "современная/профессиональная" эстетика, нет эмоциональной ясности, несоответствие тона, общее визуальное направление'
    }
  },
  zen: {
    criterion: 'sustainability',
    name: { en: 'Zen', ru: 'Зен' },
    role: { en: 'Chief People Officer', ru: 'Chief People Officer' },
    personality: { 
      en: 'Culture keeper. Reminds everyone that behind every KPI stands a human being. Happy people build great companies. Holds the emotional map.',
      ru: 'Хранитель культуры. Напоминает, что за каждым KPI стоит человек. Счастливые люди строят великие компании. Держит эмоциональную карту.'
    },
    evalQuestion: { 
      en: 'Is this sustainable for humans? Is the language inclusive? Does it create wellbeing or anxiety?',
      ru: 'Это устойчиво для людей? Язык инклюзивный? Это создаёт благополучие или тревогу?'
    },
    whatMakesGreat: {
      en: 'Human-centered approach, inclusive language, sustainable vision, care for stakeholders, positive emotional impact',
      ru: 'Человекоцентричный подход, инклюзивный язык, устойчивое видение, забота о стейкхолдерах, позитивное эмоциональное воздействие'
    },
    redFlags: {
      en: 'Exclusionary language, burnout-inducing promises, manipulation tactics, no care for people, anxiety-creating messaging',
      ru: 'Исключающий язык, обещания ведущие к выгоранию, манипулятивные тактики, нет заботы о людях, тревожный посыл'
    }
  }
};

const getRarityLabels = (lang: Language) => {
  if (lang === 'ru') {
    return {
      legendary: 'ЛЕГЕНДАРНО',
      epic: 'ЭПИК',
      rare: 'РЕДКО',
      uncommon: 'НЕОБЫЧНО',
      common: 'ОБЫЧНО'
    };
  }
  return {
    legendary: 'LEGENDARY',
    epic: 'EPIC',
    rare: 'RARE',
    uncommon: 'UNCOMMON',
    common: 'COMMON'
  };
};

// Generate evaluation from a single character
async function evaluateWithCharacter(
  characterId: string,
  cardType: string,
  cardContent: any,
  cardDefinition: any,
  lang: Language,
  apiKey: string
): Promise<{ criterion: string; score: number; explanation: string; evaluator: string }> {
  const char = CHARACTER_EVALUATORS[characterId];
  if (!char) {
    throw new Error(`Unknown character: ${characterId}`);
  }

  const isToxic = characterId === 'toxic';
  
  const systemPrompt = lang === 'ru'
    ? `Ты ${char.name.ru}, ${char.role.ru} стартап-команды.
${char.personality.ru}

ТЫ ОЦЕНИВАЕШЬ ЧЕСТНО как настоящий эксперт:
- Высокие баллы (7+) даёшь ТОЛЬКО за действительно качественную, аутентичную работу
- Средние баллы (5-6) за нормальную работу с недостатками
- Низкие баллы (3-4) за слабую работу с очевидными проблемами
- Не завышай оценки! Но и не занижай без причины.
${isToxic ? '\nТЫ ТОКСИК - ты находишь ВСЕ слабые места и BS. Ты не веришь словам без доказательств.' : ''}`
    : `You are ${char.name.en}, ${char.role.en} of the startup team.
${char.personality.en}

YOU EVALUATE HONESTLY as a real expert:
- High scores (7+) ONLY for truly quality, authentic work
- Medium scores (5-6) for normal work with flaws
- Low scores (3-4) for weak work with obvious problems
- Don't inflate scores! But don't deflate without reason.
${isToxic ? '\nYOU ARE TOXIC - you find ALL weak spots and BS. You dont believe words without proof.' : ''}`;

  const prompt = lang === 'ru'
    ? `ОЦЕНКА КАРТОЧКИ "${cardType}" | ТВОЙ КРИТЕРИЙ: ${char.criterion.toUpperCase()}

📋 СОДЕРЖАНИЕ КАРТОЧКИ:
${JSON.stringify(cardContent, null, 2)}

❓ ТВОЙ ВОПРОС (ответь честно):
${char.evalQuestion.ru}

✅ ЧТО ДЕЛАЕТ КАРТОЧКУ ОТЛИЧНОЙ:
${char.whatMakesGreat.ru}

🚩 КРАСНЫЕ ФЛАГИ (проверь!):
${char.redFlags.ru}

📊 ШКАЛА ОЦЕНОК:
- 8-10: ВЫДАЮЩЕЕСЯ - аутентично, конкретно, убедительно
- 6-7: ХОРОШО - есть суть, но можно улучшить
- 4-5: СРЕДНЕ - много общих фраз или проблем
- 1-3: СЛАБО - переделывать

Оценивай ЧЕСТНО. Если данные общие и неконкретные - это 4-5 баллов.
Если данные аутентичные и специфичные - это 7+ баллов.

Верни JSON:
{
  "score": <число от 1 до 10>,
  "good": "<что хорошо в карточке>",
  "bad": "<что плохо, что улучшить>",
  "explanation": "<твоё честное мнение как ${char.name.ru}>"
}`
    : `CARD EVALUATION "${cardType}" | YOUR CRITERION: ${char.criterion.toUpperCase()}

📋 CARD CONTENT:
${JSON.stringify(cardContent, null, 2)}

❓ YOUR QUESTION (answer honestly):
${char.evalQuestion.en}

✅ WHAT MAKES A CARD GREAT:
${char.whatMakesGreat.en}

🚩 RED FLAGS (check for these!):
${char.redFlags.en}

📊 SCORING SCALE:
- 8-10: OUTSTANDING - authentic, specific, convincing
- 6-7: GOOD - has substance but could improve
- 4-5: AVERAGE - too generic or has problems
- 1-3: WEAK - needs rework

Evaluate HONESTLY. If data is generic and unspecific - thats 4-5 points.
If data is authentic and specific - thats 7+ points.

Return JSON:
{
  "score": <number from 1 to 10>,
  "good": "<whats good about the card>",
  "bad": "<whats bad, what to improve>",
  "explanation": "<your honest opinion as ${char.name.en}>"
}`;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI error for ${characterId}:`, response.status, errorText);
      return {
        criterion: char.criterion,
        score: 5,
        explanation: lang === 'ru' ? 'Ошибка оценки' : 'Evaluation error',
        evaluator: characterId
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error(`No content from AI for ${characterId}`);
      return {
        criterion: char.criterion,
        score: 5,
        explanation: lang === 'ru' ? 'Нет ответа от AI' : 'No AI response',
        evaluator: characterId
      };
    }

    const parsed = JSON.parse(content);
    const score = Math.min(10, Math.max(1, parsed.score || 5));
    
    // Log the evaluation
    console.log(`${characterId} (${char.criterion}): ${score}/10 - Problems: ${parsed.problems_found?.length || 0}`);
    
    return {
      criterion: char.criterion,
      score: Math.round(score * 10) / 10,
      explanation: parsed.explanation || (lang === 'ru' ? 'Оценка завершена' : 'Evaluation complete'),
      evaluator: characterId
    };
  } catch (err) {
    console.error(`Failed evaluation for ${characterId}:`, err);
    return {
      criterion: char.criterion,
      score: 5,
      explanation: lang === 'ru' ? 'Ошибка обработки' : 'Processing error',
      evaluator: characterId
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cardType, cardContent, cardDefinition, language = 'en' } = await req.json();
    const lang = (language === 'ru' ? 'ru' : 'en') as Language;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Evaluating card:', cardType, 'Language:', lang);
    console.log('Using INDEPENDENT character evaluations');

    // Run all character evaluations IN PARALLEL
    const characterIds = Object.keys(CHARACTER_EVALUATORS);
    const evaluationPromises = characterIds.map(charId =>
      evaluateWithCharacter(charId, cardType, cardContent, cardDefinition, lang, LOVABLE_API_KEY)
    );

    const results = await Promise.all(evaluationPromises);

    // Build evaluation object
    const evaluation: any = {};
    for (const result of results) {
      evaluation[result.criterion] = {
        score: result.score,
        explanation: result.explanation,
        evaluator: result.evaluator
      };
    }

    // Calculate overall score as average
    const scores = results.map(r => r.score);
    const overall = scores.reduce((a, b) => a + b, 0) / scores.length;
    evaluation.overall = Math.round(overall * 10) / 10;

    // Determine rarity
    const rarityLabels = getRarityLabels(lang);
    let rarity = rarityLabels.common;
    if (overall >= 9.0) rarity = rarityLabels.legendary;
    else if (overall >= 8.0) rarity = rarityLabels.epic;
    else if (overall >= 6.5) rarity = rarityLabels.rare;
    else if (overall >= 5.0) rarity = rarityLabels.uncommon;

    console.log(`=== FINAL EVALUATION ===`);
    console.log(`Overall: ${evaluation.overall}/10 (${rarity})`);
    console.log(`Individual scores:`, scores.join(', '));

    return new Response(
      JSON.stringify({ evaluation }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in evaluate-card:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
