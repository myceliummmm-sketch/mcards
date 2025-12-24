export type Language = 'en' | 'ru' | 'es';

export type CardPhase = 'idea' | 'research' | 'build' | 'grow' | 'pivot';
export type CardType = 'template' | 'insight' | 'both' | 'research';
export type FieldType = 'text' | 'textarea' | 'select' | 'repeatable';
export type ResearchStatus = 'locked' | 'researching' | 'ready' | 'accepted';

export interface LocalizedString {
  en: string;
  ru: string;
}

export interface FormFieldConfig {
  name: string;
  label: LocalizedString;
  type: FieldType;
  placeholder?: LocalizedString;
  required: boolean;
  options?: LocalizedString[];
}

export interface CardDefinition {
  id: string;
  slot: number;
  phase: CardPhase;
  title: LocalizedString;
  coreQuestion: LocalizedString;
  formula: LocalizedString;
  example?: LocalizedString;
  aiHelpers: string[];
  cardType: CardType;
  fields: FormFieldConfig[];
  isResearchCard?: boolean;
  researchFocus?: string;
  isBuildCard?: boolean;
  buildStep?: number;
}

export const PHASE_CONFIG: Record<CardPhase, {
  name: LocalizedString;
  icon: string;
  color: string;
  description: LocalizedString;
  slots: number[];
}> = {
  idea: {
    name: { en: 'IDEA', ru: 'ИДЕЯ' },
    icon: '💡',
    color: 'hsl(270 70% 60%)',
    description: { en: "WHAT we're building", ru: 'ЧТО мы создаём' },
    slots: [1, 2, 3, 4, 5]
  },
  research: {
    name: { en: 'RESEARCH', ru: 'ИССЛЕДОВАНИЕ' },
    icon: '🔬',
    color: 'hsl(200 70% 55%)',
    description: { en: 'WHAT we know', ru: 'ЧТО мы знаем' },
    slots: [6, 7, 8, 9, 10]
  },
  build: {
    name: { en: 'BUILD', ru: 'СОЗДАНИЕ' },
    icon: '🔧',
    color: 'hsl(140 70% 50%)',
    description: { en: 'HOW it works', ru: 'КАК это работает' },
    slots: [11, 12, 13, 14, 15]
  },
  grow: {
    name: { en: 'GROW', ru: 'РОСТ' },
    icon: '🚀',
    color: 'hsl(30 90% 55%)',
    description: { en: 'HOW it grows', ru: 'КАК это растёт' },
    slots: [16, 17, 18, 19, 20]
  },
  pivot: {
    name: { en: 'PIVOT', ru: 'РАЗВОРОТ' },
    icon: '🔄',
    color: 'hsl(280 80% 55%)',
    description: { en: 'WHEN to change direction', ru: 'КОГДА менять направление' },
    slots: [21, 22, 23, 24, 25]
  }
};

export const CARD_DEFINITIONS: CardDefinition[] = [
  // ============= VISION PHASE (5 cards) =============
  {
    id: 'product',
    slot: 1,
    phase: 'idea',
    title: { en: 'PRODUCT', ru: 'ПРОДУКТ' },
    coreQuestion: { en: 'What is this in one phrase?', ru: 'Что это в одной фразе?' },
    formula: { en: '[Product] is [analogy] for [audience]', ru: '[Продукт] — это [аналогия] для [аудитории]' },
    example: { en: 'Duolingo for public speaking', ru: 'Duolingo для публичных выступлений' },
    aiHelpers: ['evergreen'],
    cardType: 'both',
    fields: [
      { name: 'product_name', label: { en: 'Product Name', ru: 'Название продукта' }, type: 'text', placeholder: { en: 'e.g., FitAI', ru: 'напр., FitAI' }, required: true },
      { name: 'analogy', label: { en: 'Analogy', ru: 'Аналогия' }, type: 'text', placeholder: { en: 'e.g., Duolingo', ru: 'напр., Duolingo' }, required: true },
      { name: 'target_audience', label: { en: 'Target Audience', ru: 'Целевая аудитория' }, type: 'text', placeholder: { en: 'e.g., busy professionals', ru: 'напр., занятые профессионалы' }, required: true },
      { name: 'one_liner', label: { en: 'One-Line Description', ru: 'Описание в одну строку' }, type: 'textarea', placeholder: { en: 'Combine the above into one sentence', ru: 'Объедините вышеуказанное в одно предложение' }, required: true }
    ]
  },
  {
    id: 'problem',
    slot: 2,
    phase: 'idea',
    title: { en: 'PROBLEM', ru: 'ПРОБЛЕМА' },
    coreQuestion: { en: 'What pain do we solve?', ru: 'Какую боль мы решаем?' },
    formula: { en: '[Audience] struggles with [problem] because [reason]', ru: '[Аудитория] страдает от [проблемы] потому что [причина]' },
    example: { en: 'Remote workers struggle with focus because home has too many distractions', ru: 'Удалённые работники страдают от рассеянности потому что дома слишком много отвлечений' },
    aiHelpers: ['toxic', 'prisma'],
    cardType: 'both',
    fields: [
      { name: 'pain_description', label: { en: 'Pain Description', ru: 'Описание боли' }, type: 'textarea', placeholder: { en: 'Describe the pain users feel daily', ru: 'Опишите боль, которую юзеры испытывают ежедневно' }, required: true },
      { name: 'root_cause', label: { en: 'Root Cause', ru: 'Коренная причина' }, type: 'textarea', placeholder: { en: 'Why does this problem exist?', ru: 'Почему эта проблема существует?' }, required: true },
      { name: 'who_suffers', label: { en: 'Who Suffers', ru: 'Кто страдает' }, type: 'textarea', placeholder: { en: 'Who experiences this pain most?', ru: 'Кто больше всего страдает от этой проблемы?' }, required: true },
      { name: 'pain_cost', label: { en: 'Cost of Pain', ru: 'Цена боли' }, type: 'textarea', placeholder: { en: 'What does this problem cost (time, money, emotions)?', ru: 'Во что обходится проблема (время, деньги, эмоции)?' }, required: true },
      { name: 'data_source', label: { en: 'Data Sources', ru: 'Источники данных' }, type: 'textarea', placeholder: { en: 'Research, surveys, or data backing this problem', ru: 'Исследования, опросы или данные, подтверждающие проблему' }, required: false }
    ]
  },
  {
    id: 'audience',
    slot: 3,
    phase: 'idea',
    title: { en: 'AUDIENCE', ru: 'АУДИТОРИЯ' },
    coreQuestion: { en: 'Who exactly is this for?', ru: 'Для кого именно это?' },
    formula: { en: '[Demographics] who [behavior] and want [outcome]', ru: '[Демография] которые [поведение] и хотят [результат]' },
    example: { en: '25-35 year old professionals who work 50+ hours and want work-life balance', ru: 'Профессионалы 25-35 лет, которые работают 50+ часов и хотят баланс работа-жизнь' },
    aiHelpers: ['prisma', 'evergreen'],
    cardType: 'both',
    fields: [
      { name: 'demographics', label: { en: 'Demographics', ru: 'Демография' }, type: 'textarea', placeholder: { en: 'Age, location, profession, income', ru: 'Возраст, локация, профессия, доход' }, required: true },
      { name: 'behaviors', label: { en: 'Behaviors', ru: 'Поведение' }, type: 'textarea', placeholder: { en: 'How do they spend time? What apps do they use?', ru: 'Как они проводят время? Какие приложения используют?' }, required: true },
      { name: 'pain_points', label: { en: 'Pain Points', ru: 'Болевые точки' }, type: 'textarea', placeholder: { en: 'What frustrates them most?', ru: 'Что их больше всего раздражает?' }, required: true },
      { name: 'goals', label: { en: 'Goals', ru: 'Цели' }, type: 'textarea', placeholder: { en: 'What do they want to achieve?', ru: 'Чего они хотят достичь?' }, required: true },
      { name: 'active_hours', label: { en: 'Active Hours', ru: 'Активные часы' }, type: 'textarea', placeholder: { en: 'When are they most active?', ru: 'Когда они наиболее активны?' }, required: false },
      { name: 'purchase_triggers', label: { en: 'Purchase Triggers', ru: 'Триггеры покупки' }, type: 'textarea', placeholder: { en: 'What makes them buy?', ru: 'Что заставляет их покупать?' }, required: false }
    ]
  },
  {
    id: 'value',
    slot: 4,
    phase: 'idea',
    title: { en: 'VALUE', ru: 'ЦЕННОСТЬ' },
    coreQuestion: { en: 'What makes us different?', ru: 'Что делает нас уникальными?' },
    formula: { en: 'Unlike [competitors], we [unique benefit] through [mechanism]', ru: 'В отличие от [конкурентов], мы [уникальная польза] через [механизм]' },
    example: { en: 'Unlike generic fitness apps, we personalize workouts using AI that learns your recovery patterns', ru: 'В отличие от стандартных фитнес-приложений, мы персонализируем тренировки с помощью AI, который изучает ваши паттерны восстановления' },
    aiHelpers: ['evergreen', 'phoenix'],
    cardType: 'both',
    fields: [
      { name: 'current_alternative', label: { en: 'Current Alternative', ru: 'Текущая альтернатива' }, type: 'textarea', placeholder: { en: 'What do people use now?', ru: 'Что люди используют сейчас?' }, required: true },
      { name: 'alternative_cost', label: { en: 'Alternative Cost', ru: 'Стоимость альтернативы' }, type: 'textarea', placeholder: { en: 'What does the current solution cost?', ru: 'Сколько стоит текущее решение?' }, required: true },
      { name: 'your_solution', label: { en: 'Your Solution', ru: 'Ваше решение' }, type: 'textarea', placeholder: { en: 'How do you solve it better?', ru: 'Как вы решаете это лучше?' }, required: true },
      { name: 'your_price', label: { en: 'Your Price', ru: 'Ваша цена' }, type: 'textarea', placeholder: { en: 'What will you charge?', ru: 'Сколько вы будете брать?' }, required: true },
      { name: 'roi_multiple', label: { en: 'ROI Multiple', ru: 'Множитель ROI' }, type: 'textarea', placeholder: { en: 'How much value vs cost?', ru: 'Соотношение ценности к стоимости?' }, required: false }
    ]
  },
  {
    id: 'vision',
    slot: 5,
    phase: 'idea',
    title: { en: 'VISION', ru: 'ВИДЕНИЕ' },
    coreQuestion: { en: 'Where is this going?', ru: 'К чему это ведёт?' },
    formula: { en: 'In [timeframe], [product] will [big vision] by [strategy]', ru: 'Через [срок], [продукт] станет [большое видение] через [стратегия]' },
    example: { en: 'In 5 years, FitAI will be the default personal trainer for 100M people by expanding to nutrition and sleep', ru: 'Через 5 лет, FitAI станет персональным тренером по умолчанию для 100M людей, расширившись на питание и сон' },
    aiHelpers: ['zen', 'evergreen'],
    cardType: 'both',
    fields: [
      { name: 'vision_statement', label: { en: 'Vision Statement', ru: 'Заявление о видении' }, type: 'textarea', placeholder: { en: 'What is the big picture?', ru: 'Какова большая картина?' }, required: true },
      { name: 'what_becomes_possible', label: { en: 'What Becomes Possible', ru: 'Что станет возможным' }, type: 'textarea', placeholder: { en: 'What can users do that they couldn\'t before?', ru: 'Что смогут делать юзеры, чего не могли раньше?' }, required: true },
      { name: 'barrier_removed', label: { en: 'Barrier Removed', ru: 'Устранённый барьер' }, type: 'textarea', placeholder: { en: 'What obstacle do you eliminate?', ru: 'Какое препятствие вы устраняете?' }, required: true },
      { name: 'who_benefits', label: { en: 'Who Benefits', ru: 'Кто выигрывает' }, type: 'textarea', placeholder: { en: 'Who gains the most from this vision?', ru: 'Кто больше всего выиграет от этого видения?' }, required: true }
    ]
  },

  // ============= RESEARCH PHASE (5 AI-driven cards) =============
  {
    id: 'market_map',
    slot: 6,
    phase: 'research',
    title: { en: 'MARKET MAP', ru: 'КАРТА РЫНКА' },
    coreQuestion: { en: 'What does the competitive landscape look like?', ru: 'Как выглядит конкурентный ландшафт?' },
    formula: { en: 'Market size: [X]. Key players: [list]. Our position: [where]', ru: 'Размер рынка: [X]. Ключевые игроки: [список]. Наша позиция: [где]' },
    aiHelpers: ['phoenix', 'evergreen'],
    cardType: 'research',
    isResearchCard: true,
    researchFocus: 'market_landscape',
    fields: [
      { name: 'market_size', label: { en: 'Market Size', ru: 'Размер рынка' }, type: 'text', placeholder: { en: 'AI-researched market size', ru: 'Размер рынка по данным AI' }, required: false },
      { name: 'key_players', label: { en: 'Key Players', ru: 'Ключевые игроки' }, type: 'textarea', placeholder: { en: 'AI-researched competitors', ru: 'Конкуренты по данным AI' }, required: false },
      { name: 'market_trends', label: { en: 'Market Trends', ru: 'Тренды рынка' }, type: 'textarea', placeholder: { en: 'AI-researched trends', ru: 'Тренды по данным AI' }, required: false },
      { name: 'our_position', label: { en: 'Our Position', ru: 'Наша позиция' }, type: 'textarea', placeholder: { en: 'AI-determined positioning', ru: 'Позиционирование по данным AI' }, required: false }
    ]
  },
  {
    id: 'competitor_analysis',
    slot: 7,
    phase: 'research',
    title: { en: 'COMPETITORS', ru: 'КОНКУРЕНТЫ' },
    coreQuestion: { en: 'Who are we competing against and why can we win?', ru: 'С кем мы конкурируем и почему можем победить?' },
    formula: { en: '[Competitor]: [Strengths] vs [Weaknesses]. Our advantage: [X]', ru: '[Конкурент]: [Сильные стороны] vs [Слабые стороны]. Наше преимущество: [X]' },
    aiHelpers: ['toxic', 'phoenix'],
    cardType: 'research',
    isResearchCard: true,
    researchFocus: 'competitor_deep_dive',
    fields: [
      { name: 'direct_competitors', label: { en: 'Direct Competitors', ru: 'Прямые конкуренты' }, type: 'textarea', placeholder: { en: 'AI-researched direct competitors', ru: 'Прямые конкуренты по данным AI' }, required: false },
      { name: 'indirect_competitors', label: { en: 'Indirect Competitors', ru: 'Косвенные конкуренты' }, type: 'textarea', placeholder: { en: 'AI-researched indirect competitors', ru: 'Косвенные конкуренты по данным AI' }, required: false },
      { name: 'competitor_weaknesses', label: { en: 'Competitor Weaknesses', ru: 'Слабости конкурентов' }, type: 'textarea', placeholder: { en: 'AI-found vulnerabilities', ru: 'Уязвимости по данным AI' }, required: false },
      { name: 'differentiation_opportunities', label: { en: 'Differentiation Opportunities', ru: 'Возможности дифференциации' }, type: 'textarea', placeholder: { en: 'AI-suggested positioning', ru: 'Позиционирование по данным AI' }, required: false }
    ]
  },
  {
    id: 'user_interviews',
    slot: 8,
    phase: 'research',
    title: { en: 'USER INSIGHTS', ru: 'ИНСАЙТЫ ЮЗЕРОВ' },
    coreQuestion: { en: 'What do potential users actually need?', ru: 'Что на самом деле нужно потенциальным пользователям?' },
    formula: { en: 'Users say: [quote]. They need: [need]. They fear: [fear]', ru: 'Юзеры говорят: [цитата]. Им нужно: [потребность]. Они боятся: [страх]' },
    aiHelpers: ['prisma', 'virgilia'],
    cardType: 'research',
    isResearchCard: true,
    researchFocus: 'user_research',
    fields: [
      { name: 'user_needs', label: { en: 'User Needs', ru: 'Потребности юзеров' }, type: 'textarea', placeholder: { en: 'AI-researched user needs', ru: 'Потребности юзеров по данным AI' }, required: false },
      { name: 'pain_points', label: { en: 'Pain Points', ru: 'Болевые точки' }, type: 'textarea', placeholder: { en: 'AI-researched pain points', ru: 'Болевые точки по данным AI' }, required: false },
      { name: 'user_quotes', label: { en: 'User Quotes', ru: 'Цитаты юзеров' }, type: 'textarea', placeholder: { en: 'AI-gathered user feedback', ru: 'Обратная связь по данным AI' }, required: false },
      { name: 'unmet_needs', label: { en: 'Unmet Needs', ru: 'Неудовлетворённые потребности' }, type: 'textarea', placeholder: { en: 'AI-identified gaps', ru: 'Пробелы по данным AI' }, required: false }
    ]
  },
  {
    id: 'product_analytics',
    slot: 9,
    phase: 'research',
    title: { en: 'RISK MAP', ru: 'КАРТА РИСКОВ' },
    coreQuestion: { en: 'What could go wrong and how do we prevent it?', ru: 'Что может пойти не так и как это предотвратить?' },
    formula: { en: 'Risk: [X]. Probability: [Y]. Mitigation: [Z]', ru: 'Риск: [X]. Вероятность: [Y]. Митигация: [Z]' },
    aiHelpers: ['toxic', 'zen'],
    cardType: 'research',
    isResearchCard: true,
    researchFocus: 'risk_analysis',
    fields: [
      { name: 'market_risks', label: { en: 'Market Risks', ru: 'Рыночные риски' }, type: 'textarea', placeholder: { en: 'AI-identified market risks', ru: 'Рыночные риски по данным AI' }, required: false },
      { name: 'tech_risks', label: { en: 'Technical Risks', ru: 'Технические риски' }, type: 'textarea', placeholder: { en: 'AI-identified tech risks', ru: 'Технические риски по данным AI' }, required: false },
      { name: 'competition_risks', label: { en: 'Competition Risks', ru: 'Конкурентные риски' }, type: 'textarea', placeholder: { en: 'AI-identified competition risks', ru: 'Конкурентные риски по данным AI' }, required: false },
      { name: 'mitigation_strategies', label: { en: 'Mitigation Strategies', ru: 'Стратегии митигации' }, type: 'textarea', placeholder: { en: 'AI-suggested mitigations', ru: 'Митигации по данным AI' }, required: false }
    ]
  },
  {
    id: 'market_size',
    slot: 10,
    phase: 'research',
    title: { en: 'OPPORTUNITY', ru: 'ВОЗМОЖНОСТЬ' },
    coreQuestion: { en: 'Is this market worth pursuing?', ru: 'Стоит ли выходить на этот рынок?' },
    formula: { en: 'TAM: [X]. SAM: [Y]. SOM: [Z]. Entry strategy: [how]', ru: 'TAM: [X]. SAM: [Y]. SOM: [Z]. Стратегия входа: [как]' },
    aiHelpers: ['phoenix', 'evergreen'],
    cardType: 'research',
    isResearchCard: true,
    researchFocus: 'opportunity_sizing',
    fields: [
      { name: 'tam', label: { en: 'TAM (Total Addressable Market)', ru: 'TAM (Общий адресуемый рынок)' }, type: 'text', placeholder: { en: 'AI-calculated TAM', ru: 'TAM по данным AI' }, required: false },
      { name: 'sam', label: { en: 'SAM (Serviceable Addressable Market)', ru: 'SAM (Доступный рынок)' }, type: 'text', placeholder: { en: 'AI-calculated SAM', ru: 'SAM по данным AI' }, required: false },
      { name: 'som', label: { en: 'SOM (Serviceable Obtainable Market)', ru: 'SOM (Достижимый рынок)' }, type: 'text', placeholder: { en: 'AI-calculated SOM', ru: 'SOM по данным AI' }, required: false },
      { name: 'growth_rate', label: { en: 'Market Growth Rate', ru: 'Темп роста рынка' }, type: 'text', placeholder: { en: 'AI-researched growth rate', ru: 'Темп роста по данным AI' }, required: false },
      { name: 'entry_strategy', label: { en: 'Entry Strategy', ru: 'Стратегия входа' }, type: 'textarea', placeholder: { en: 'AI-suggested entry strategy', ru: 'Стратегия входа по данным AI' }, required: false }
    ]
  },

  // ============= BUILD PHASE (5 cards, slots 11-15) =============
  // BUILD phase works on Vision + Research data to create app specification
  {
    id: 'features',
    slot: 11,
    phase: 'build',
    title: { en: 'FEATURES', ru: 'ФИЧИ' },
    coreQuestion: { en: 'What can the app do?', ru: 'Что умеет приложение?' },
    formula: { en: '[Category]: [Feature] → [User Benefit] (Source: [Vision/Research])', ru: '[Категория]: [Фича] → [Польза для юзера] (Источник: [Vision/Research])' },
    example: { en: 'Basic: Registration → Save progress (V-03: audience needs progress)', ru: 'Базовые: Регистрация → Сохранять прогресс (V-03: аудитории важен прогресс)' },
    aiHelpers: ['prisma', 'techpriest'],
    cardType: 'both',
    isBuildCard: true,
    buildStep: 1,
    fields: [
      { name: 'basic_features', label: { en: 'Basic Features', ru: 'Базовые фичи' }, type: 'textarea', placeholder: { en: 'Essential features (auth, save, etc.)', ru: 'Базовые фичи (авторизация, сохранение и т.д.)' }, required: true },
      { name: 'key_features', label: { en: 'Key Features (Your Value)', ru: 'Ключевые фичи (ваша ценность)' }, type: 'textarea', placeholder: { en: 'Features from V-04 Value proposition', ru: 'Фичи из V-04 ценностного предложения' }, required: true },
      { name: 'monetization_features', label: { en: 'Monetization Features', ru: 'Фичи монетизации' }, type: 'textarea', placeholder: { en: 'Paid features, subscriptions, etc.', ru: 'Платные фичи, подписки и т.д.' }, required: false },
      { name: 'engagement_features', label: { en: 'Engagement Features', ru: 'Фичи вовлечения' }, type: 'textarea', placeholder: { en: 'Push, sharing, gamification', ru: 'Push, шаринг, геймификация' }, required: false },
      { name: 'tech_validation', label: { en: 'Tech Validation', ru: 'Техническая валидация' }, type: 'textarea', placeholder: { en: 'Tech Priest notes on feasibility', ru: 'Заметки Tech Priest о реализуемости' }, required: false }
    ]
  },
  {
    id: 'user_path',
    slot: 12,
    phase: 'build',
    title: { en: 'USER PATH', ru: 'ПУТЬ' },
    coreQuestion: { en: 'How does user move through the app?', ru: 'Как юзер двигается по приложению?' },
    formula: { en: 'Entry → Input → Magic → Value → Return', ru: 'Вход → Ввод → Магия → Ценность → Возврат' },
    example: { en: 'Open app → Enter data → Get AI result → Save → Come back', ru: 'Открыл → Ввёл данные → Получил результат → Сохранил → Вернулся' },
    aiHelpers: ['prisma', 'virgilia'],
    cardType: 'both',
    isBuildCard: true,
    buildStep: 2,
    fields: [
      { name: 'step_1_entry', label: { en: 'Step 1: Entry', ru: 'Шаг 1: Вход' }, type: 'textarea', placeholder: { en: 'First app open experience', ru: 'Первый опыт открытия приложения' }, required: true },
      { name: 'step_2_input', label: { en: 'Step 2: Input', ru: 'Шаг 2: Ввод' }, type: 'textarea', placeholder: { en: 'What user inputs/does', ru: 'Что юзер вводит/делает' }, required: true },
      { name: 'step_3_magic', label: { en: 'Step 3: Magic', ru: 'Шаг 3: Магия' }, type: 'textarea', placeholder: { en: 'Core value delivery moment', ru: 'Момент доставки основной ценности' }, required: true },
      { name: 'step_4_value', label: { en: 'Step 4: Value', ru: 'Шаг 4: Ценность' }, type: 'textarea', placeholder: { en: 'User realizes benefit', ru: 'Юзер понимает пользу' }, required: true },
      { name: 'step_5_return', label: { en: 'Step 5: Return', ru: 'Шаг 5: Возврат' }, type: 'textarea', placeholder: { en: 'Why user comes back', ru: 'Почему юзер возвращается' }, required: true }
    ]
  },
  {
    id: 'screens',
    slot: 13,
    phase: 'build',
    title: { en: 'SCREENS', ru: 'ЭКРАНЫ' },
    coreQuestion: { en: 'What screens are needed?', ru: 'Какие экраны нужны?' },
    formula: { en: '[Screen Name]: [Elements] — [Purpose]', ru: '[Название экрана]: [Элементы] — [Назначение]' },
    example: { en: 'Onboarding (3 screens): Title + Illustration + CTA', ru: 'Онбординг (3 экрана): Заголовок + Иллюстрация + CTA' },
    aiHelpers: ['virgilia', 'prisma'],
    cardType: 'both',
    isBuildCard: true,
    buildStep: 3,
    fields: [
      { name: 'onboarding_screens', label: { en: 'Onboarding Screens', ru: 'Экраны онбординга' }, type: 'textarea', placeholder: { en: 'Welcome, how it works, get started', ru: 'Привет, как работает, начать' }, required: true },
      { name: 'main_screens', label: { en: 'Main Screens', ru: 'Основные экраны' }, type: 'textarea', placeholder: { en: 'Core app screens', ru: 'Основные экраны приложения' }, required: true },
      { name: 'result_screens', label: { en: 'Result/Value Screens', ru: 'Экраны результата/ценности' }, type: 'textarea', placeholder: { en: 'Where user sees value', ru: 'Где юзер видит ценность' }, required: true },
      { name: 'profile_screens', label: { en: 'Profile/Settings Screens', ru: 'Экраны профиля/настроек' }, type: 'textarea', placeholder: { en: 'User account screens', ru: 'Экраны аккаунта юзера' }, required: false },
      { name: 'ux_notes', label: { en: 'UX Notes', ru: 'UX заметки' }, type: 'textarea', placeholder: { en: 'Prisma notes on user experience', ru: 'Заметки Prisma по UX' }, required: false }
    ]
  },
  {
    id: 'style',
    slot: 14,
    phase: 'build',
    title: { en: 'STYLE', ru: 'СТИЛЬ' },
    coreQuestion: { en: 'How should the app look and feel?', ru: 'Как должно выглядеть и ощущаться приложение?' },
    formula: { en: 'Theme: [X]. Mood: [Y]. Reference: [Z]. Colors: [palette]', ru: 'Тема: [X]. Настроение: [Y]. Референс: [Z]. Цвета: [палитра]' },
    example: { en: 'Dark theme + Premium mood + Like Headspace + Purple/Gold', ru: 'Тёмная тема + Премиум настроение + Как Headspace + Фиолетовый/Золото' },
    aiHelpers: ['virgilia'],
    cardType: 'both',
    isBuildCard: true,
    buildStep: 4,
    fields: [
      { name: 'theme', label: { en: 'Theme', ru: 'Тема' }, type: 'select', required: true, options: [{ en: 'Light', ru: 'Светлая' }, { en: 'Dark', ru: 'Тёмная' }, { en: 'Auto', ru: 'Авто' }] },
      { name: 'mood', label: { en: 'Mood', ru: 'Настроение' }, type: 'select', required: true, options: [{ en: 'Playful', ru: 'Игривое' }, { en: 'Premium', ru: 'Премиум' }, { en: 'Strict', ru: 'Строгое' }, { en: 'Warm', ru: 'Тёплое' }] },
      { name: 'reference_apps', label: { en: 'Reference Apps', ru: 'Приложения-референсы' }, type: 'textarea', placeholder: { en: 'Apps with similar style (e.g., Calm, Headspace)', ru: 'Приложения с похожим стилем (напр., Calm, Headspace)' }, required: true },
      { name: 'primary_color', label: { en: 'Primary Color', ru: 'Основной цвет' }, type: 'text', placeholder: { en: 'e.g., Purple, Blue, Green', ru: 'напр., Фиолетовый, Синий, Зелёный' }, required: true },
      { name: 'accent_color', label: { en: 'Accent Color', ru: 'Акцентный цвет' }, type: 'text', placeholder: { en: 'e.g., Gold, Orange, Teal', ru: 'напр., Золото, Оранжевый, Бирюза' }, required: true },
      { name: 'style_reasoning', label: { en: 'Style Reasoning', ru: 'Обоснование стиля' }, type: 'textarea', placeholder: { en: 'Why this style fits the audience', ru: 'Почему этот стиль подходит аудитории' }, required: false }
    ]
  },
  {
    id: 'summary',
    slot: 15,
    phase: 'build',
    title: { en: 'SUMMARY', ru: 'САММАРИ' },
    coreQuestion: { en: 'Ready to generate the app?', ru: 'Готов к генерации приложения?' },
    formula: { en: '[App Name]: [Features] + [Screens] + [Style] = Lovable Prompt', ru: '[Название]: [Фичи] + [Экраны] + [Стиль] = Lovable Prompt' },
    example: { en: 'NumeroAI: 5 features, 7 screens, Dark Premium → Generate!', ru: 'NumeroAI: 5 фич, 7 экранов, Тёмный Премиум → Генерация!' },
    aiHelpers: ['evergreen', 'techpriest'],
    cardType: 'both',
    isBuildCard: true,
    buildStep: 5,
    fields: [
      { name: 'app_name', label: { en: 'App Name', ru: 'Название приложения' }, type: 'text', placeholder: { en: 'From V-01', ru: 'Из V-01' }, required: true },
      { name: 'app_format', label: { en: 'App Format', ru: 'Формат приложения' }, type: 'select', required: true, options: [{ en: 'Mobile App (iOS + Android)', ru: 'Мобильное приложение (iOS + Android)' }, { en: 'Web Application', ru: 'Веб-приложение' }, { en: 'Both (Mobile + Web)', ru: 'Оба (Мобильное + Веб)' }] },
      { name: 'app_description', label: { en: 'App Description', ru: 'Описание приложения' }, type: 'textarea', placeholder: { en: 'One-liner from V-01', ru: 'Одна строка из V-01' }, required: true },
      { name: 'features_summary', label: { en: 'Features Summary', ru: 'Сводка фич' }, type: 'textarea', placeholder: { en: 'Key features from B-01', ru: 'Ключевые фичи из B-01' }, required: true },
      { name: 'screens_summary', label: { en: 'Screens Summary', ru: 'Сводка экранов' }, type: 'textarea', placeholder: { en: 'Screen list from B-03', ru: 'Список экранов из B-03' }, required: true },
      { name: 'style_summary', label: { en: 'Style Summary', ru: 'Сводка стиля' }, type: 'textarea', placeholder: { en: 'Style from B-04', ru: 'Стиль из B-04' }, required: true },
      { name: 'tech_stack', label: { en: 'Tech Stack', ru: 'Технологический стек' }, type: 'textarea', placeholder: { en: 'Database, AI, Payments, etc.', ru: 'База данных, AI, Платежи и т.д.' }, required: false },
      { name: 'build_quality_score', label: { en: 'Build Quality Score', ru: 'Оценка качества' }, type: 'text', placeholder: { en: 'Auto-calculated', ru: 'Авто-расчёт' }, required: false }
    ]
  },

  // ============= GROW PHASE (5 cards, slots 16-20) =============
  {
    id: 'pricing',
    slot: 16,
    phase: 'grow',
    title: { en: 'PRICING', ru: 'ЦЕНООБРАЗОВАНИЕ' },
    coreQuestion: { en: 'How do we price this?', ru: 'Как мы это оцениваем?' },
    formula: { en: 'Free: [X]. Pro: [Y]. Enterprise: [Z]', ru: 'Бесплатно: [X]. Pro: [Y]. Enterprise: [Z]' },
    aiHelpers: ['phoenix', 'evergreen'],
    cardType: 'template',
    fields: [
      { name: 'free_tier', label: { en: 'Free Tier', ru: 'Бесплатный тариф' }, type: 'textarea', placeholder: { en: "What's included in free?", ru: 'Что включено в бесплатный?' }, required: true },
      { name: 'pro_tier', label: { en: 'Pro Tier', ru: 'Pro тариф' }, type: 'textarea', placeholder: { en: "What's included in paid?", ru: 'Что включено в платный?' }, required: true },
      { name: 'pro_price', label: { en: 'Pro Price', ru: 'Цена Pro' }, type: 'text', placeholder: { en: 'e.g., $9.99/month', ru: 'напр., $9.99/месяц' }, required: true },
      { name: 'enterprise_tier', label: { en: 'Enterprise Tier (Optional)', ru: 'Enterprise тариф (необязательно)' }, type: 'textarea', placeholder: { en: 'Enterprise features', ru: 'Функции Enterprise' }, required: false },
      { name: 'pricing_strategy', label: { en: 'Pricing Strategy', ru: 'Стратегия ценообразования' }, type: 'select', required: true, options: [{ en: 'Freemium', ru: 'Freemium' }, { en: 'Free Trial', ru: 'Бесплатный пробный период' }, { en: 'Pay-as-you-go', ru: 'Плати по мере использования' }, { en: 'Subscription', ru: 'Подписка' }, { en: 'One-time', ru: 'Разовая оплата' }] }
    ]
  },
  {
    id: 'acquisition',
    slot: 17,
    phase: 'grow',
    title: { en: 'ACQUISITION', ru: 'ПРИВЛЕЧЕНИЕ' },
    coreQuestion: { en: 'How do we get users?', ru: 'Как мы привлекаем пользователей?' },
    formula: { en: 'Channel: [X]. CAC: [Y]. LTV: [Z]. Ratio: [LTV/CAC]', ru: 'Канал: [X]. CAC: [Y]. LTV: [Z]. Соотношение: [LTV/CAC]' },
    aiHelpers: ['phoenix', 'prisma'],
    cardType: 'template',
    fields: [
      { name: 'primary_channel', label: { en: 'Primary Channel', ru: 'Основной канал' }, type: 'text', placeholder: { en: 'e.g., SEO, Paid ads, Referral', ru: 'напр., SEO, платная реклама, рефералы' }, required: true },
      { name: 'secondary_channels', label: { en: 'Secondary Channels', ru: 'Вторичные каналы' }, type: 'textarea', placeholder: { en: 'Other acquisition channels', ru: 'Другие каналы привлечения' }, required: true },
      { name: 'target_cac', label: { en: 'Target CAC', ru: 'Целевой CAC' }, type: 'text', placeholder: { en: 'e.g., $5 per user', ru: 'напр., $5 за пользователя' }, required: true },
      { name: 'expected_ltv', label: { en: 'Expected LTV', ru: 'Ожидаемый LTV' }, type: 'text', placeholder: { en: 'e.g., $50 per user', ru: 'напр., $50 за пользователя' }, required: true },
      { name: 'ltv_cac_ratio', label: { en: 'LTV/CAC Ratio', ru: 'Соотношение LTV/CAC' }, type: 'text', placeholder: { en: 'e.g., 10:1', ru: 'напр., 10:1' }, required: false }
    ]
  },
  {
    id: 'retention',
    slot: 18,
    phase: 'grow',
    title: { en: 'RETENTION', ru: 'УДЕРЖАНИЕ' },
    coreQuestion: { en: 'How do we keep users?', ru: 'Как мы удерживаем пользователей?' },
    formula: { en: 'Hook: [X]. Habit: [Y]. Target D30: [Z%]', ru: 'Крючок: [X]. Привычка: [Y]. Цель D30: [Z%]' },
    aiHelpers: ['prisma', 'zen'],
    cardType: 'template',
    fields: [
      { name: 'hook_mechanism', label: { en: 'Hook Mechanism', ru: 'Механизм крючка' }, type: 'textarea', placeholder: { en: 'What brings users back?', ru: 'Что возвращает пользователей?' }, required: true },
      { name: 'habit_loop', label: { en: 'Habit Loop', ru: 'Петля привычки' }, type: 'textarea', placeholder: { en: 'Trigger → Action → Reward', ru: 'Триггер → Действие → Награда' }, required: true },
      { name: 'target_d1', label: { en: 'Target D1 Retention', ru: 'Целевое удержание D1' }, type: 'text', placeholder: { en: 'e.g., 40%', ru: 'напр., 40%' }, required: true },
      { name: 'target_d7', label: { en: 'Target D7 Retention', ru: 'Целевое удержание D7' }, type: 'text', placeholder: { en: 'e.g., 20%', ru: 'напр., 20%' }, required: true },
      { name: 'target_d30', label: { en: 'Target D30 Retention', ru: 'Целевое удержание D30' }, type: 'text', placeholder: { en: 'e.g., 10%', ru: 'напр., 10%' }, required: true }
    ]
  },
  {
    id: 'virality',
    slot: 19,
    phase: 'grow',
    title: { en: 'VIRALITY', ru: 'ВИРАЛЬНОСТЬ' },
    coreQuestion: { en: 'How does it spread?', ru: 'Как это распространяется?' },
    formula: { en: 'Mechanic: [X]. K-factor: [Y]. Cycle time: [Z days]', ru: 'Механика: [X]. K-фактор: [Y]. Время цикла: [Z дней]' },
    aiHelpers: ['phoenix', 'virgilia'],
    cardType: 'template',
    fields: [
      { name: 'viral_mechanic', label: { en: 'Viral Mechanic', ru: 'Виральная механика' }, type: 'textarea', placeholder: { en: 'How do users share?', ru: 'Как пользователи делятся?' }, required: true },
      { name: 'share_trigger', label: { en: 'Share Trigger', ru: 'Триггер шаринга' }, type: 'text', placeholder: { en: 'What moment triggers sharing?', ru: 'Какой момент запускает шаринг?' }, required: true },
      { name: 'target_k_factor', label: { en: 'Target K-Factor', ru: 'Целевой K-фактор' }, type: 'text', placeholder: { en: 'e.g., 1.2', ru: 'напр., 1.2' }, required: false },
      { name: 'cycle_time', label: { en: 'Viral Cycle Time', ru: 'Время виральногоцикла' }, type: 'text', placeholder: { en: 'e.g., 3 days', ru: 'напр., 3 дня' }, required: false }
    ]
  },
  {
    id: 'metrics',
    slot: 20,
    phase: 'grow',
    title: { en: 'METRICS', ru: 'МЕТРИКИ' },
    coreQuestion: { en: 'What do we measure?', ru: 'Что мы измеряем?' },
    formula: { en: 'North Star: [X]. Leading: [Y]. Lagging: [Z]', ru: 'North Star: [X]. Опережающие: [Y]. Запаздывающие: [Z]' },
    aiHelpers: ['evergreen', 'techpriest'],
    cardType: 'template',
    fields: [
      { name: 'north_star', label: { en: 'North Star Metric', ru: 'Метрика North Star' }, type: 'text', placeholder: { en: 'e.g., Weekly Active Users', ru: 'напр., недельные активные пользователи' }, required: true },
      { name: 'leading_metrics', label: { en: 'Leading Indicators', ru: 'Опережающие индикаторы' }, type: 'textarea', placeholder: { en: 'Metrics that predict success', ru: 'Метрики, предсказывающие успех' }, required: true },
      { name: 'lagging_metrics', label: { en: 'Lagging Indicators', ru: 'Запаздывающие индикаторы' }, type: 'textarea', placeholder: { en: 'Metrics that confirm success', ru: 'Метрики, подтверждающие успех' }, required: true },
      { name: 'measurement_cadence', label: { en: 'Measurement Cadence', ru: 'Частота измерений' }, type: 'select', required: true, options: [{ en: 'Daily', ru: 'Ежедневно' }, { en: 'Weekly', ru: 'Еженедельно' }, { en: 'Monthly', ru: 'Ежемесячно' }, { en: 'Quarterly', ru: 'Ежеквартально' }] }
    ]
  },

  // ============= PIVOT PHASE (5 cards, slots 21-25) =============
  {
    id: 'signals',
    slot: 21,
    phase: 'pivot',
    title: { en: 'SIGNALS', ru: 'СИГНАЛЫ' },
    coreQuestion: { en: 'What tells us to change?', ru: 'Что говорит нам меняться?' },
    formula: { en: 'Red flag: [X] at [threshold]. Action: [Y]', ru: 'Красный флаг: [X] при [пороге]. Действие: [Y]' },
    aiHelpers: ['toxic', 'evergreen'],
    cardType: 'template',
    fields: [
      { name: 'red_flags', label: { en: 'Red Flag Metrics', ru: 'Метрики красных флагов' }, type: 'textarea', placeholder: { en: 'What metrics indicate problems?', ru: 'Какие метрики указывают на проблемы?' }, required: true },
      { name: 'thresholds', label: { en: 'Thresholds', ru: 'Пороги' }, type: 'textarea', placeholder: { en: 'At what point do we act?', ru: 'В какой момент мы действуем?' }, required: true },
      { name: 'green_flags', label: { en: 'Green Flag Metrics', ru: 'Метрики зелёных флагов' }, type: 'textarea', placeholder: { en: 'What indicates success?', ru: 'Что указывает на успех?' }, required: true },
      { name: 'review_cadence', label: { en: 'Review Cadence', ru: 'Частота проверок' }, type: 'select', required: true, options: [{ en: 'Weekly', ru: 'Еженедельно' }, { en: 'Bi-weekly', ru: 'Раз в две недели' }, { en: 'Monthly', ru: 'Ежемесячно' }] }
    ]
  },
  {
    id: 'pivot_options',
    slot: 22,
    phase: 'pivot',
    title: { en: 'PIVOT OPTIONS', ru: 'ВАРИАНТЫ РАЗВОРОТА' },
    coreQuestion: { en: 'What alternatives do we have?', ru: 'Какие альтернативы у нас есть?' },
    formula: { en: 'Option [N]: [description]. Trigger: [condition]', ru: 'Вариант [N]: [описание]. Триггер: [условие]' },
    aiHelpers: ['evergreen', 'phoenix'],
    cardType: 'template',
    fields: [
      { name: 'option_1', label: { en: 'Pivot Option 1', ru: 'Вариант разворота 1' }, type: 'textarea', placeholder: { en: 'Describe alternative direction', ru: 'Опишите альтернативное направление' }, required: true },
      { name: 'option_1_trigger', label: { en: 'Option 1 Trigger', ru: 'Триггер варианта 1' }, type: 'text', placeholder: { en: 'What condition triggers this?', ru: 'Какое условие запускает это?' }, required: true },
      { name: 'option_2', label: { en: 'Pivot Option 2', ru: 'Вариант разворота 2' }, type: 'textarea', placeholder: { en: 'Describe alternative direction', ru: 'Опишите альтернативное направление' }, required: true },
      { name: 'option_2_trigger', label: { en: 'Option 2 Trigger', ru: 'Триггер варианта 2' }, type: 'text', placeholder: { en: 'What condition triggers this?', ru: 'Какое условие запускает это?' }, required: true },
      { name: 'option_3', label: { en: 'Pivot Option 3 (Optional)', ru: 'Вариант разворота 3 (необязательно)' }, type: 'textarea', placeholder: { en: 'Describe alternative direction', ru: 'Опишите альтернативное направление' }, required: false }
    ]
  },
  {
    id: 'runway',
    slot: 23,
    phase: 'pivot',
    title: { en: 'RUNWAY', ru: 'ЗАПАС ПРОЧНОСТИ' },
    coreQuestion: { en: 'How long can we last?', ru: 'Как долго мы продержимся?' },
    formula: { en: 'Runway: [X months]. Burn: [Y/month]. Extend by: [Z]', ru: 'Запас: [X месяцев]. Сжигание: [Y/месяц]. Продлить на: [Z]' },
    aiHelpers: ['evergreen', 'techpriest'],
    cardType: 'template',
    fields: [
      { name: 'current_runway', label: { en: 'Current Runway', ru: 'Текущий запас' }, type: 'text', placeholder: { en: 'e.g., 12 months', ru: 'напр., 12 месяцев' }, required: true },
      { name: 'monthly_burn', label: { en: 'Monthly Burn Rate', ru: 'Ежемесячный расход' }, type: 'text', placeholder: { en: 'e.g., $10,000/month', ru: 'напр., $10,000/месяц' }, required: true },
      { name: 'extension_options', label: { en: 'Runway Extension Options', ru: 'Варианты продления запаса' }, type: 'textarea', placeholder: { en: 'How to extend runway?', ru: 'Как продлить запас?' }, required: true },
      { name: 'break_even_point', label: { en: 'Break-Even Point', ru: 'Точка безубыточности' }, type: 'text', placeholder: { en: 'When do we break even?', ru: 'Когда выходим на безубыточность?' }, required: false }
    ]
  },
  {
    id: 'kill_criteria',
    slot: 24,
    phase: 'pivot',
    title: { en: 'KILL CRITERIA', ru: 'КРИТЕРИИ ЗАКРЫТИЯ' },
    coreQuestion: { en: 'When do we stop?', ru: 'Когда мы останавливаемся?' },
    formula: { en: 'Kill if: [condition] by [date]. Evidence: [data]', ru: 'Закрыть если: [условие] к [дате]. Доказательство: [данные]' },
    aiHelpers: ['toxic', 'zen'],
    cardType: 'template',
    fields: [
      { name: 'kill_condition_1', label: { en: 'Kill Condition 1', ru: 'Условие закрытия 1' }, type: 'textarea', placeholder: { en: 'Condition that triggers shutdown', ru: 'Условие, запускающее закрытие' }, required: true },
      { name: 'kill_deadline_1', label: { en: 'Deadline 1', ru: 'Дедлайн 1' }, type: 'text', placeholder: { en: 'By when?', ru: 'К какому сроку?' }, required: true },
      { name: 'kill_condition_2', label: { en: 'Kill Condition 2', ru: 'Условие закрытия 2' }, type: 'textarea', placeholder: { en: 'Another shutdown condition', ru: 'Другое условие закрытия' }, required: false },
      { name: 'kill_deadline_2', label: { en: 'Deadline 2', ru: 'Дедлайн 2' }, type: 'text', placeholder: { en: 'By when?', ru: 'К какому сроку?' }, required: false },
      { name: 'graceful_shutdown', label: { en: 'Graceful Shutdown Plan', ru: 'План плавного закрытия' }, type: 'textarea', placeholder: { en: 'How to wind down responsibly?', ru: 'Как закрыться ответственно?' }, required: true }
    ]
  },
  {
    id: 'lessons',
    slot: 25,
    phase: 'pivot',
    title: { en: 'LESSONS', ru: 'УРОКИ' },
    coreQuestion: { en: 'What did we learn?', ru: 'Чему мы научились?' },
    formula: { en: 'Lesson: [X]. Evidence: [Y]. Apply to: [Z]', ru: 'Урок: [X]. Доказательство: [Y]. Применить к: [Z]' },
    aiHelpers: ['zen', 'evergreen'],
    cardType: 'both',
    fields: [
      { name: 'key_learnings', label: { en: 'Key Learnings', ru: 'Ключевые уроки' }, type: 'textarea', placeholder: { en: "What worked and what didn't?", ru: 'Что сработало, а что нет?' }, required: true },
      { name: 'evidence', label: { en: 'Supporting Evidence', ru: 'Подтверждающие данные' }, type: 'textarea', placeholder: { en: 'Data that supports learnings', ru: 'Данные, подтверждающие уроки' }, required: true },
      { name: 'apply_forward', label: { en: 'Apply to Future', ru: 'Применить в будущем' }, type: 'textarea', placeholder: { en: 'How to apply these lessons?', ru: 'Как применить эти уроки?' }, required: true },
      { name: 'share_with', label: { en: 'Share With', ru: 'Поделиться с' }, type: 'text', placeholder: { en: 'Who should know this?', ru: 'Кто должен это знать?' }, required: false }
    ]
  }
];

export const RESEARCH_CARD_SLOTS = [6, 7, 8, 9, 10];

// Helper functions for localization
export const getLocalizedText = (text: LocalizedString, language: Language): string => {
  return text[language] || text.en;
};

export const getCardsByPhase = (phase: CardPhase): CardDefinition[] => {
  return CARD_DEFINITIONS.filter(card => card.phase === phase);
};

export const getCardBySlot = (slot: number): CardDefinition | undefined => {
  return CARD_DEFINITIONS.find(card => card.slot === slot);
};

export const isCardComplete = (cardData: any, definition: CardDefinition): boolean => {
  if (!cardData) return false;
  const requiredFields = definition.fields.filter(f => f.required);
  return requiredFields.every(field => cardData[field.name] && cardData[field.name].trim() !== '');
};

export const isResearchCard = (slot: number): boolean => {
  return RESEARCH_CARD_SLOTS.includes(slot);
};
