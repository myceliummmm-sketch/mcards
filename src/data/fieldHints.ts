import type { CardDefinition } from './cardDefinitions';
import type { LocalizedString } from './cardDefinitions';

export interface FieldGuidance {
  questionTitle: LocalizedString;
  hints: LocalizedString[];
  example: LocalizedString;
  validationTip: LocalizedString;
  aiHelper: string;
}

export const FIELD_GUIDANCE: Record<string, FieldGuidance> = {
  // PRODUCT card
  product_name: {
    questionTitle: { en: 'What should we call this product?', ru: 'Как назовём продукт?' },
    hints: [
      { en: 'Keep it short and memorable (1-2 words)', ru: 'Короткое и запоминающееся (1-2 слова)' },
      { en: "Should hint at what it does or who it's for", ru: 'Должно намекать на функцию или аудиторию' },
      { en: 'Avoid generic tech suffixes like "App" or "Tech"', ru: 'Избегайте шаблонных суффиксов вроде "App" или "Tech"' }
    ],
    example: { en: 'FitAI, MealMate, CodeCoach', ru: 'FitAI, MealMate, CodeCoach' },
    validationTip: { en: 'Good product names are memorable and suggestive', ru: 'Хорошие названия запоминаются и вызывают ассоциации' },
    aiHelper: 'evergreen'
  },
  analogy: {
    questionTitle: { en: 'What existing product is this similar to?', ru: 'На какой существующий продукт это похоже?' },
    hints: [
      { en: 'Choose something widely known', ru: 'Выберите что-то широко известное' },
      { en: 'Should capture the core mechanic or value', ru: 'Должно передавать основную механику или ценность' },
      { en: 'The best analogies create instant understanding', ru: 'Лучшие аналогии создают мгновенное понимание' }
    ],
    example: { en: 'Duolingo (gamified learning), Uber (on-demand service)', ru: 'Duolingo (геймификация обучения), Uber (сервис по запросу)' },
    validationTip: { en: 'Your audience must know this reference', ru: 'Ваша аудитория должна знать эту отсылку' },
    aiHelper: 'evergreen'
  },
  target_audience: {
    questionTitle: { en: 'Who is this for?', ru: 'Для кого это?' },
    hints: [
      { en: 'Be specific: "busy professionals" not just "people"', ru: 'Будьте конкретны: "занятые профессионалы", а не просто "люди"' },
      { en: 'Include a defining characteristic or behavior', ru: 'Укажите определяющую характеристику или поведение' },
      { en: 'Think: Who would actually pay for this?', ru: 'Подумайте: кто реально заплатит за это?' }
    ],
    example: { en: 'Working parents who commute daily, Freelance designers aged 25-40', ru: 'Работающие родители с ежедневными поездками, фрилансеры-дизайнеры 25-40 лет' },
    validationTip: { en: 'Specificity beats broad appeal at this stage', ru: 'Конкретность важнее широкого охвата на этом этапе' },
    aiHelper: 'prisma'
  },
  one_liner: {
    questionTitle: { en: 'Combine it all into one powerful sentence', ru: 'Объедините всё в одно мощное предложение' },
    hints: [
      { en: 'Use the formula: [Product] is [Analogy] for [Audience]', ru: 'Используйте формулу: [Продукт] — это [Аналогия] для [Аудитории]' },
      { en: 'Should be tweetable (under 280 characters)', ru: 'Должно влезать в твит (до 280 символов)' },
      { en: 'This is your elevator pitch', ru: 'Это ваш питч в лифте' }
    ],
    example: { en: 'FitAI is Duolingo for busy professionals who want to stay fit', ru: 'FitAI — это Duolingo для занятых профессионалов, которые хотят быть в форме' },
    validationTip: { en: 'Should make someone say "Oh, I get it!"', ru: 'Должно заставить человека сказать "А, понял!"' },
    aiHelper: 'phoenix'
  },

  // PROBLEM card
  who_suffers: {
    questionTitle: { en: 'Who specifically experiences this pain?', ru: 'Кто конкретно испытывает эту боль?' },
    hints: [
      { en: 'Name the exact group: job title, life stage, or role', ru: 'Назовите точную группу: должность, этап жизни или роль' },
      { en: 'Avoid vague terms like "users" or "people"', ru: 'Избегайте размытых терминов вроде "пользователи" или "люди"' },
      { en: 'The more specific, the more credible', ru: 'Чем конкретнее, тем убедительнее' }
    ],
    example: { en: 'Freelance designers, Solo entrepreneurs, Remote workers', ru: 'Фрилансеры-дизайнеры, соло-предприниматели, удалённые работники' },
    validationTip: { en: 'You should be able to find these people on LinkedIn', ru: 'Вы должны найти этих людей на LinkedIn' },
    aiHelper: 'prisma'
  },
  pain_description: {
    questionTitle: { en: 'What exactly is the problem they face?', ru: 'В чём именно их проблема?' },
    hints: [
      { en: 'Describe the actual painful experience', ru: 'Опишите реальный болезненный опыт' },
      { en: 'Use emotional language: frustrated, stressed, overwhelmed', ru: 'Используйте эмоции: разочарованы, напряжены, перегружены' },
      { en: 'Focus on the symptom they feel daily', ru: 'Сфокусируйтесь на симптоме, который они чувствуют ежедневно' }
    ],
    example: { en: 'They spend 3+ hours each week chasing late payments, causing stress and cash flow issues', ru: 'Они тратят 3+ часа в неделю на сбор просроченных платежей, что вызывает стресс и проблемы с cash flow' },
    validationTip: { en: 'Should make the reader wince in recognition', ru: 'Должно заставить читателя поморщиться от узнавания' },
    aiHelper: 'toxic'
  },
  root_cause: {
    questionTitle: { en: 'Why does this problem exist?', ru: 'Почему эта проблема существует?' },
    hints: [
      { en: 'Look for the systemic reason, not just symptoms', ru: 'Ищите системную причину, а не симптомы' },
      { en: "Often it's a missing tool, broken process, or outdated behavior", ru: 'Часто это отсутствующий инструмент, сломанный процесс или устаревшее поведение' },
      { en: 'Think: What would need to change to fix this?', ru: 'Подумайте: что нужно изменить, чтобы это исправить?' }
    ],
    example: { en: 'No automated system to track invoices and send reminders', ru: 'Нет автоматической системы для отслеживания счетов и отправки напоминаний' },
    validationTip: { en: 'The root cause reveals the solution space', ru: 'Коренная причина раскрывает пространство решений' },
    aiHelper: 'toxic'
  },
  pain_cost: {
    questionTitle: { en: 'What does this problem cost them?', ru: 'Во что им обходится эта проблема?' },
    hints: [
      { en: 'Quantify in money, time, or emotional burden', ru: 'Измерьте в деньгах, времени или эмоциональной нагрузке' },
      { en: 'Be specific: "$500/year" beats "a lot of money"', ru: 'Будьте конкретны: "$500/год" лучше, чем "много денег"' },
      { en: 'Multiple costs are more convincing', ru: 'Несколько типов затрат убедительнее' }
    ],
    example: { en: '$2,400/year in lost income, 150 hours annually, constant anxiety', ru: '$2,400/год потерянного дохода, 150 часов в год, постоянная тревога' },
    validationTip: { en: 'The bigger and more specific the cost, the stronger the case', ru: 'Чем больше и конкретнее затраты, тем сильнее аргумент' },
    aiHelper: 'prisma'
  },
  data_source: {
    questionTitle: { en: 'How do you know this is real?', ru: 'Откуда вы знаете, что это реально?' },
    hints: [
      { en: 'Survey data, user interviews, market research', ru: 'Данные опросов, интервью с пользователями, исследования рынка' },
      { en: 'Personal experience counts if you were in this group', ru: 'Личный опыт считается, если вы были в этой группе' },
      { en: "Competitors' customer reviews are gold", ru: 'Отзывы клиентов конкурентов — это золото' }
    ],
    example: { en: 'Survey of 500 freelancers, Reddit analysis of r/freelance', ru: 'Опрос 500 фрилансеров, анализ Reddit r/freelance' },
    validationTip: { en: "Data builds credibility, guesses don't", ru: 'Данные создают доверие, догадки — нет' },
    aiHelper: 'prisma'
  },

  // AUDIENCE card
  demographics: {
    questionTitle: { en: 'Who are they in demographic terms?', ru: 'Кто они в демографических терминах?' },
    hints: [
      { en: 'Age range, location, profession, income level', ru: 'Возраст, локация, профессия, уровень дохода' },
      { en: 'Education level if relevant', ru: 'Уровень образования, если релевантно' },
      { en: "Don't guess - base this on real data", ru: 'Не гадайте — опирайтесь на реальные данные' }
    ],
    example: { en: 'Women 28-40, urban areas, $60k-120k household income', ru: 'Женщины 28-40, города, доход семьи $60k-120k' },
    validationTip: { en: 'Demographics help with targeting and pricing', ru: 'Демография помогает с таргетингом и ценообразованием' },
    aiHelper: 'prisma'
  },
  behaviors: {
    questionTitle: { en: 'What do they actually do?', ru: 'Что они реально делают?' },
    hints: [
      { en: 'Daily routines, tool preferences, spending habits', ru: 'Ежедневные рутины, предпочтения инструментов, привычки трат' },
      { en: 'Where they hang out online and offline', ru: 'Где они тусуются онлайн и офлайн' },
      { en: 'How they currently solve similar problems', ru: 'Как они сейчас решают похожие проблемы' }
    ],
    example: { en: 'Use fitness apps but rarely stick past week 2, check phone before bed', ru: 'Используют фитнес-приложения, но редко продолжают после 2 недели, проверяют телефон перед сном' },
    validationTip: { en: 'Behaviors reveal distribution channels', ru: 'Поведение раскрывает каналы дистрибуции' },
    aiHelper: 'prisma'
  },
  goals: {
    questionTitle: { en: 'What are they trying to achieve?', ru: 'Чего они пытаются достичь?' },
    hints: [
      { en: 'Both immediate and long-term goals', ru: 'И краткосрочные, и долгосрочные цели' },
      { en: 'Career, lifestyle, identity goals', ru: 'Карьерные, жизненные, идентичностные цели' },
      { en: 'The "why" behind their behavior', ru: '"Почему" за их поведением' }
    ],
    example: { en: 'Want to feel confident at work presentations, aspire to leadership roles', ru: 'Хотят чувствовать уверенность на презентациях, стремятся к лидерским ролям' },
    validationTip: { en: 'Goals connect to your value proposition', ru: 'Цели связаны с вашим ценностным предложением' },
    aiHelper: 'evergreen'
  },
  pain_points: {
    questionTitle: { en: 'What frustrates them daily?', ru: 'Что их ежедневно расстраивает?' },
    hints: [
      { en: 'What makes them complain to friends?', ru: 'На что они жалуются друзьям?' },
      { en: 'Where do existing solutions fall short?', ru: 'Где существующие решения не дотягивают?' },
      { en: 'What keeps them up at night?', ru: 'Что не даёт им спать по ночам?' }
    ],
    example: { en: 'Feeling judged when speaking up, wasting time in unproductive meetings', ru: 'Чувство осуждения при высказывании, трата времени на непродуктивных встречах' },
    validationTip: { en: 'Pain points are where your features should aim', ru: 'Болевые точки — туда должны целиться ваши фичи' },
    aiHelper: 'toxic'
  },
  purchase_triggers: {
    questionTitle: { en: 'What makes them finally buy?', ru: 'Что заставляет их наконец купить?' },
    hints: [
      { en: 'Urgency: deadline, event, life change', ru: 'Срочность: дедлайн, событие, изменение в жизни' },
      { en: 'Social proof: friend recommendation, reviews', ru: 'Социальное доказательство: рекомендация друга, отзывы' },
      { en: 'Emotion: fear of missing out, desire for status', ru: 'Эмоция: страх упустить, желание статуса' }
    ],
    example: { en: "Upcoming job interview, colleague's success story, annual review season", ru: 'Предстоящее собеседование, история успеха коллеги, сезон годовых обзоров' },
    validationTip: { en: 'Triggers inform your marketing timing and messaging', ru: 'Триггеры определяют тайминг и сообщения в маркетинге' },
    aiHelper: 'phoenix'
  },

  // VALUE card
  current_alternative: {
    questionTitle: { en: 'What do they use now?', ru: 'Что они используют сейчас?' },
    hints: [
      { en: 'Could be a product, service, or manual process', ru: 'Может быть продукт, сервис или ручной процесс' },
      { en: 'Include "do nothing" if that\'s the real alternative', ru: 'Включите "ничего не делать", если это реальная альтернатива' },
      { en: 'This is your competitive benchmark', ru: 'Это ваш конкурентный бенчмарк' }
    ],
    example: { en: 'Personal trainer, YouTube videos, or just not exercising', ru: 'Персональный тренер, видео на YouTube или просто не заниматься' },
    validationTip: { en: 'You must beat this on cost, quality, or convenience', ru: 'Вы должны победить по цене, качеству или удобству' },
    aiHelper: 'toxic'
  },
  alternative_cost: {
    questionTitle: { en: 'What does the current alternative cost?', ru: 'Сколько стоит текущая альтернатива?' },
    hints: [
      { en: 'Include time cost, not just money', ru: 'Включите затраты времени, не только деньги' },
      { en: 'Hidden costs matter: commute time, subscription bundles', ru: 'Скрытые затраты важны: время на дорогу, пакеты подписок' },
      { en: 'DIY solutions have real costs too', ru: 'DIY-решения тоже имеют реальные затраты' }
    ],
    example: { en: '$100/hour for trainer, 5 hours/week searching YouTube', ru: '$100/час за тренера, 5 часов/неделю на поиск на YouTube' },
    validationTip: { en: 'Your pricing needs to beat this value equation', ru: 'Ваша цена должна побить это уравнение ценности' },
    aiHelper: 'prisma'
  },
  your_solution: {
    questionTitle: { en: 'What makes your approach better?', ru: 'Чем ваш подход лучше?' },
    hints: [
      { en: 'Focus on the transformation, not just features', ru: 'Сфокусируйтесь на трансформации, а не на фичах' },
      { en: 'Cheaper + faster + better - pick your advantage', ru: 'Дешевле + быстрее + лучше — выберите своё преимущество' },
      { en: "What can you do that alternatives can't?", ru: 'Что вы можете, а альтернативы — нет?' }
    ],
    example: { en: 'AI-powered personalized workouts that adapt daily, no commute', ru: 'AI-персонализированные тренировки, адаптирующиеся ежедневно, без поездок' },
    validationTip: { en: 'This must clearly beat the alternative on something important', ru: 'Это должно явно побеждать альтернативу в чём-то важном' },
    aiHelper: 'evergreen'
  },
  your_price: {
    questionTitle: { en: 'What will you charge?', ru: 'Сколько вы будете брать?' },
    hints: [
      { en: 'Be realistic based on alternative pricing', ru: 'Будьте реалистичны, опираясь на цены альтернатив' },
      { en: 'Consider subscription vs one-time pricing', ru: 'Рассмотрите подписку vs разовую оплату' },
      { en: 'Leave room for growth and tiers', ru: 'Оставьте место для роста и уровней' }
    ],
    example: { en: '$19/month, $199/year, $9.99/month starter tier', ru: '$19/месяц, $199/год, $9.99/месяц стартовый уровень' },
    validationTip: { en: 'Pricing validates your value proposition', ru: 'Ценообразование валидирует ваше ценностное предложение' },
    aiHelper: 'phoenix'
  },

  // VISION card
  vision_statement: {
    questionTitle: { en: 'What world are you creating?', ru: 'Какой мир вы создаёте?' },
    hints: [
      { en: 'Think 5-10 years out', ru: 'Думайте на 5-10 лет вперёд' },
      { en: 'Bigger than your product - a movement or change', ru: 'Больше, чем продукт — движение или изменение' },
      { en: 'Should inspire your team and customers', ru: 'Должно вдохновлять команду и клиентов' }
    ],
    example: { en: 'A world where anyone can become a confident public speaker', ru: 'Мир, где каждый может стать уверенным публичным оратором' },
    validationTip: { en: 'Great visions are ambitious but believable', ru: 'Великие видения амбициозны, но реалистичны' },
    aiHelper: 'evergreen'
  },
  who_benefits: {
    questionTitle: { en: 'Who wins in this new world?', ru: 'Кто выигрывает в этом новом мире?' },
    hints: [
      { en: 'Could be broader than your initial audience', ru: 'Может быть шире вашей начальной аудитории' },
      { en: 'Ripple effects: who else benefits indirectly?', ru: 'Эффект волны: кто ещё выигрывает косвенно?' },
      { en: 'Think ecosystem, not just users', ru: 'Думайте экосистемой, а не только пользователями' }
    ],
    example: { en: 'Everyone from students to CEOs, teams with better communication', ru: 'Все от студентов до CEO, команды с лучшей коммуникацией' },
    validationTip: { en: 'Broader benefit = bigger market potential', ru: 'Шире выгода = больше рыночный потенциал' },
    aiHelper: 'evergreen'
  },
  what_becomes_possible: {
    questionTitle: { en: "What can people do now that they couldn't before?", ru: 'Что люди смогут делать теперь, чего не могли раньше?' },
    hints: [
      { en: 'New capabilities or opportunities', ru: 'Новые возможности или перспективы' },
      { en: 'Democratization: access for previously excluded groups', ru: 'Демократизация: доступ для ранее исключённых групп' },
      { en: 'Time/money freed up for other pursuits', ru: 'Время/деньги освобождены для других занятий' }
    ],
    example: { en: 'Anyone can give a TED-quality presentation without years of practice', ru: 'Любой может дать презентацию уровня TED без лет практики' },
    validationTip: { en: 'This is your aspirational marketing message', ru: 'Это ваше вдохновляющее маркетинговое сообщение' },
    aiHelper: 'virgilia'
  },
  barrier_removed: {
    questionTitle: { en: 'What barrier are you eliminating?', ru: 'Какой барьер вы устраняете?' },
    hints: [
      { en: 'Cost, time, expertise, access, fear', ru: 'Стоимость, время, экспертиза, доступ, страх' },
      { en: 'Physical or psychological barriers', ru: 'Физические или психологические барьеры' },
      { en: 'The "because I can\'t [X]" statement', ru: 'Утверждение "потому что я не могу [X]"' }
    ],
    example: { en: 'Cost of coaching, time to practice, fear of judgment', ru: 'Стоимость коучинга, время на практику, страх осуждения' },
    validationTip: { en: 'Removing barriers = expanding your market', ru: 'Устранение барьеров = расширение рынка' },
    aiHelper: 'evergreen'
  }
};

// Helper function to get localized text
export function getLocalizedGuidanceText(text: LocalizedString | string, language: string): string {
  if (typeof text === 'string') return text;
  const lang = language === 'es' ? 'en' : language; // fallback es to en
  return (text as any)[lang] || text.en;
}

// Helper function to get guidance for a field
export function getFieldGuidance(fieldName: string): FieldGuidance | undefined {
  return FIELD_GUIDANCE[fieldName];
}

// Helper function to get AI character for a field
export function getFieldAIHelper(fieldName: string, definition: CardDefinition): string {
  const guidance = FIELD_GUIDANCE[fieldName];
  return guidance?.aiHelper || definition.aiHelpers[0];
}
