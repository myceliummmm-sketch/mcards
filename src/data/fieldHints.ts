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
    questionTitle: { en: 'Social profile of your user', ru: 'Социальный профиль вашего пользователя' },
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
  },

  // ========== BUILD CARD #11: FEATURES ==========
  basic_features: {
    questionTitle: { en: 'What basic features must your MVP have?', ru: 'Какие базовые функции должен иметь ваш MVP?' },
    hints: [
      { en: 'Features that SOLVE pain from V-02 + R-3', ru: 'Функции, которые РЕШАЮТ боль из V-02 + R-3' },
      { en: 'Keep to 3-5 features max for MVP', ru: 'Держитесь 3-5 функций макс для MVP' },
      { en: 'Each feature should have a source citation', ru: 'Каждая функция должна иметь ссылку на источник' }
    ],
    example: { en: '1. User auth (data persistence)\n2. Dashboard (V-02: users need visibility)\n3. Export data (R-3: portability need)', ru: '1. Авторизация (сохранение данных)\n2. Дашборд (V-02: юзерам нужна видимость)\n3. Экспорт данных (R-3: потребность в портабельности)' },
    validationTip: { en: 'Every feature must trace back to user pain', ru: 'Каждая функция должна восходить к боли пользователя' },
    aiHelper: 'prisma'
  },
  key_features: {
    questionTitle: { en: 'What makes you DIFFERENT from competitors?', ru: 'Что отличает вас от конкурентов?' },
    hints: [
      { en: 'Derive from V-04 (your unique solution)', ru: 'Выводите из V-04 (ваше уникальное решение)' },
      { en: 'Reference R-2 competitor weaknesses', ru: 'Ссылайтесь на слабости конкурентов из R-2' },
      { en: 'Keep to 2-3 differentiators max', ru: 'Держитесь 2-3 отличий максимум' }
    ],
    example: { en: '1. AI-powered personalization (V-04)\n2. Real-time sync (R-2: competitors lack this)', ru: '1. AI-персонализация (V-04)\n2. Синхронизация в реальном времени (R-2: у конкурентов нет)' },
    validationTip: { en: 'These should beat competitors from R-2', ru: 'Должны побеждать конкурентов из R-2' },
    aiHelper: 'prisma'
  },
  monetization_features: {
    questionTitle: { en: 'How will you make money?', ru: 'Как вы будете зарабатывать?' },
    hints: [
      { en: 'Based on R-1 market size and V-04 pricing', ru: 'На основе размера рынка R-1 и ценообразования V-04' },
      { en: 'Freemium, subscription, one-time, or usage-based?', ru: 'Freemium, подписка, разовая оплата или по использованию?' },
      { en: 'Consider competitor pricing from R-2', ru: 'Учтите цены конкурентов из R-2' }
    ],
    example: { en: 'Freemium model:\n- Free: 5 projects\n- Pro $19/mo: unlimited + AI', ru: 'Freemium модель:\n- Бесплатно: 5 проектов\n- Pro $19/мес: безлимит + AI' },
    validationTip: { en: 'Must fit audience willingness to pay (V-03)', ru: 'Должно соответствовать готовности платить (V-03)' },
    aiHelper: 'phoenix'
  },
  engagement_features: {
    questionTitle: { en: 'How will users come back?', ru: 'Как пользователи будут возвращаться?' },
    hints: [
      { en: 'Based on V-03 behaviors and active hours', ru: 'На основе поведения и активных часов из V-03' },
      { en: 'Push notifications, streaks, social features', ru: 'Пуш-уведомления, серии, социальные функции' },
      { en: 'Address pain points from R-3', ru: 'Решайте болевые точки из R-3' }
    ],
    example: { en: '- Daily reminder at 7am (V-03: morning routine)\n- Progress streak with rewards\n- Share achievements', ru: '- Ежедневное напоминание в 7 утра (V-03: утренняя рутина)\n- Серия прогресса с наградами\n- Шеринг достижений' },
    validationTip: { en: 'Should create a habit loop', ru: 'Должно создавать петлю привычки' },
    aiHelper: 'prisma'
  },
  tech_validation: {
    questionTitle: { en: 'Is this technically feasible?', ru: 'Технически реализуемо?' },
    hints: [
      { en: 'Tech Priest validates each feature', ru: 'Tech Priest валидирует каждую функцию' },
      { en: 'Note what needs external APIs/services', ru: 'Отметьте, что требует внешних API/сервисов' },
      { en: 'Flag any technical risks from R-4', ru: 'Отметьте технические риски из R-4' }
    ],
    example: { en: '⚙️ Tech Priest:\n✅ User auth: Supabase Auth\n⚠️ AI features: needs OpenAI API', ru: '⚙️ Tech Priest:\n✅ Авторизация: Supabase Auth\n⚠️ AI функции: нужен OpenAI API' },
    validationTip: { en: 'Everything must be buildable in Lovable', ru: 'Всё должно быть реализуемо в Lovable' },
    aiHelper: 'techpriest'
  },

  // ========== BUILD CARD #12: USER PATH ==========
  step_1_entry: {
    questionTitle: { en: 'How does the user arrive?', ru: 'Как пользователь приходит?' },
    hints: [
      { en: 'From V-02 pain + V-03 where they hang out', ru: 'Из V-02 боль + V-03 где они тусуются' },
      { en: 'What do they see in the first 3 seconds?', ru: 'Что они видят в первые 3 секунды?' },
      { en: 'Single clear CTA', ru: 'Один чёткий призыв к действию' }
    ],
    example: { en: 'User arrives with pain from V-02\n• From: Instagram/TikTok\n• First see: "Solve [problem] in 5 min"\n• CTA: "Start Free"', ru: 'Юзер приходит с болью из V-02\n• Откуда: Instagram/TikTok\n• Видит: "Реши [проблему] за 5 мин"\n• CTA: "Начать бесплатно"' },
    validationTip: { en: 'Should hook them within 3 seconds', ru: 'Должно зацепить за 3 секунды' },
    aiHelper: 'virgilia'
  },
  step_2_input: {
    questionTitle: { en: 'What minimum data do you need?', ru: 'Какой минимум данных вам нужен?' },
    hints: [
      { en: 'Based on B-01 basic features', ru: 'На основе базовых функций B-01' },
      { en: 'V-03 patience level - be fast!', ru: 'Уровень терпения V-03 — будьте быстры!' },
      { en: 'Aim for under 60 seconds', ru: 'Цельтесь менее 60 секунд' }
    ],
    example: { en: 'Quick setup:\n• Fields: Name, Goal, Level (3 taps)\n• Time: 45 seconds max\n• Progress bar showing 3 steps', ru: 'Быстрая настройка:\n• Поля: Имя, Цель, Уровень (3 тапа)\n• Время: 45 сек макс\n• Прогресс-бар на 3 шага' },
    validationTip: { en: 'Less fields = higher completion', ru: 'Меньше полей = выше конверсия' },
    aiHelper: 'zen'
  },
  step_3_magic: {
    questionTitle: { en: 'What is the "WOW" moment?', ru: 'Какой момент "ВАУ"?' },
    hints: [
      { en: 'B-01 key feature in action', ru: 'Ключевая функция B-01 в действии' },
      { en: 'V-04 unique solution revealed', ru: 'Уникальное решение V-04 раскрывается' },
      { en: 'This is where they fall in love', ru: 'Здесь они влюбляются' }
    ],
    example: { en: 'AI generates personal result:\n• Loading: "AI analyzing..."\n• Reveal: Animated result card\n• Emotion: Surprise → Excitement', ru: 'AI генерирует персональный результат:\n• Загрузка: "AI анализирует..."\n• Раскрытие: Анимированная карточка\n• Эмоция: Удивление → Воодушевление' },
    validationTip: { en: 'This moment determines retention', ru: 'Этот момент определяет удержание' },
    aiHelper: 'phoenix'
  },
  step_4_value: {
    questionTitle: { en: 'How do they see the transformation?', ru: 'Как они видят трансформацию?' },
    hints: [
      { en: 'V-04 transformation visible', ru: 'Трансформация из V-04 видна' },
      { en: 'Celebration moment (confetti, sound)', ru: 'Момент празднования (конфетти, звук)' },
      { en: 'Clear next actions: save, share, act', ru: 'Чёткие следующие действия: сохранить, поделиться, действовать' }
    ],
    example: { en: 'First success complete!\n• Result: "Done! 🎉"\n• Feel: Accomplishment, pride\n• Actions: Share | Save | Next\n• Celebration: Confetti', ru: 'Первый успех завершён!\n• Результат: "Готово! 🎉"\n• Чувство: Достижение, гордость\n• Действия: Поделиться | Сохранить | Далее\n• Празднование: Конфетти' },
    validationTip: { en: 'Make them feel successful', ru: 'Заставьте их почувствовать успех' },
    aiHelper: 'virgilia'
  },
  step_5_return: {
    questionTitle: { en: 'Why and when do they come back?', ru: 'Почему и когда они возвращаются?' },
    hints: [
      { en: 'B-01 engagement mechanisms', ru: 'Механизмы вовлечения B-01' },
      { en: 'V-03 active hours for timing', ru: 'Активные часы V-03 для тайминга' },
      { en: 'Create habit loop: trigger → action → reward', ru: 'Создайте петлю привычки: триггер → действие → награда' }
    ],
    example: { en: 'Daily routine trigger:\n• Trigger: Push at 7am (V-03)\n• New value: Fresh daily content\n• Habit loop: Notification → Open → See streak', ru: 'Триггер ежедневной рутины:\n• Триггер: Пуш в 7 утра (V-03)\n• Новая ценность: Свежий контент\n• Петля привычки: Уведомление → Открыть → Серия' },
    validationTip: { en: 'Retention > Acquisition for growth', ru: 'Удержание > Привлечение для роста' },
    aiHelper: 'prisma'
  },

  // ========== BUILD CARD #13: SCREENS ==========
  onboarding_screens: {
    questionTitle: { en: 'How do you welcome new users?', ru: 'Как вы встречаете новых пользователей?' },
    hints: [
      { en: 'MAX 3 screens (Toxic rule)', ru: 'МАКС 3 экрана (правило Toxic)' },
      { en: 'Show V-04 promise immediately', ru: 'Покажите обещание V-04 сразу' },
      { en: 'Always have skip button', ru: 'Всегда кнопка пропуска' }
    ],
    example: { en: '1. Welcome: Hero message + visual\n2. How It Works: 3 simple steps\n3. Get Started: Sign up CTA', ru: '1. Приветствие: Главное сообщение + визуал\n2. Как это работает: 3 простых шага\n3. Начать: CTA регистрации' },
    validationTip: { en: '50%+ skip onboarding - keep it short!', ru: '50%+ пропускают онбординг — будьте кратки!' },
    aiHelper: 'virgilia'
  },
  main_screens: {
    questionTitle: { en: 'What are the core screens?', ru: 'Какие основные экраны?' },
    hints: [
      { en: 'Map to B-02 step_2 and step_3', ru: 'Сопоставьте с B-02 step_2 и step_3' },
      { en: 'One screen per major feature', ru: 'Один экран на основную функцию' },
      { en: 'Keep navigation simple', ru: 'Навигация простая' }
    ],
    example: { en: '1. Home/Dashboard: Today\'s tasks\n2. Input Screen: Data entry\n3. Progress View: Charts and stats', ru: '1. Главная/Дашборд: Задачи на сегодня\n2. Экран ввода: Ввод данных\n3. Прогресс: Графики и статистика' },
    validationTip: { en: 'Each screen serves one purpose', ru: 'Каждый экран — одна цель' },
    aiHelper: 'virgilia'
  },
  result_screens: {
    questionTitle: { en: 'How do you show success?', ru: 'Как вы показываете успех?' },
    hints: [
      { en: 'Map to B-02 step_4 value delivery', ru: 'Сопоставьте с B-02 step_4 доставка ценности' },
      { en: 'Celebrate achievements', ru: 'Празднуйте достижения' },
      { en: 'Include sharing options', ru: 'Включите опции шеринга' }
    ],
    example: { en: '1. Success Screen: Congrats + stats\n2. Achievement: Badge animation\n• Share to Stories button', ru: '1. Экран успеха: Поздравление + статистика\n2. Достижение: Анимация бейджа\n• Кнопка "В Stories"' },
    validationTip: { en: 'Make success feel tangible', ru: 'Сделайте успех ощутимым' },
    aiHelper: 'virgilia'
  },
  profile_screens: {
    questionTitle: { en: 'What settings and profile screens?', ru: 'Какие настройки и экраны профиля?' },
    hints: [
      { en: 'Include subscription management if monetized', ru: 'Включите управление подпиской если монетизация' },
      { en: 'User preferences and data', ru: 'Предпочтения пользователя и данные' },
      { en: 'History and achievements', ru: 'История и достижения' }
    ],
    example: { en: '1. Profile: Avatar, stats, history\n2. Settings: Notifications, subscription, theme', ru: '1. Профиль: Аватар, статистика, история\n2. Настройки: Уведомления, подписка, тема' },
    validationTip: { en: 'Keep settings minimal for MVP', ru: 'Минимум настроек для MVP' },
    aiHelper: 'zen'
  },
  ux_notes: {
    questionTitle: { en: 'Any UX considerations?', ru: 'UX-соображения?' },
    hints: [
      { en: 'Consider V-03 tech level', ru: 'Учтите техуровень V-03' },
      { en: 'Avoid competitor UX mistakes from R-2', ru: 'Избегайте UX-ошибок конкурентов из R-2' },
      { en: 'Accessibility considerations', ru: 'Доступность' }
    ],
    example: { en: '📋 UX Summary:\n• Total: 8 screens (under 10 ✓)\n• Navigation: Tab bar\n• Avoid R-2 competitor: cluttered home', ru: '📋 UX Сводка:\n• Всего: 8 экранов (меньше 10 ✓)\n• Навигация: Tab bar\n• Избегать R-2: перегруженный главный' },
    validationTip: { en: 'Simple UX wins over feature-rich', ru: 'Простой UX побеждает фиче-насыщенный' },
    aiHelper: 'zen'
  },

  // ========== BUILD CARD #14: STYLE ==========
  theme: {
    questionTitle: { en: 'Light, Dark, or Auto theme?', ru: 'Светлая, Тёмная или Авто тема?' },
    hints: [
      { en: 'Based on V-03 demographics', ru: 'На основе демографии V-03' },
      { en: 'Dark = premium/serious, Light = friendly', ru: 'Тёмная = премиум, Светлая = дружелюбный' },
      { en: 'Consider competitor themes from R-2', ru: 'Учтите темы конкурентов из R-2' }
    ],
    example: { en: 'Dark theme\n• V-03: Young professionals prefer dark\n• Premium feel matches V-04', ru: 'Тёмная тема\n• V-03: Молодые профессионалы предпочитают тёмную\n• Премиум соответствует V-04' },
    validationTip: { en: 'Theme should match brand positioning', ru: 'Тема должна соответствовать позиционированию' },
    aiHelper: 'virgilia'
  },
  mood: {
    questionTitle: { en: 'What is the visual mood?', ru: 'Какое визуальное настроение?' },
    hints: [
      { en: 'Premium, Playful, Professional, or Minimal', ru: 'Премиум, Игривый, Профессиональный или Минимальный' },
      { en: 'Must match V-04 emotion delivery', ru: 'Должно соответствовать эмоции V-04' },
      { en: 'Consistent with V-01 positioning', ru: 'Согласовано с позиционированием V-01' }
    ],
    example: { en: 'Premium mood\n• V-04 emotion: confident, accomplished\n• Subtle gradients, smooth animations', ru: 'Премиум настроение\n• V-04 эмоция: уверенный, успешный\n• Тонкие градиенты, плавные анимации' },
    validationTip: { en: 'Mood creates the emotional experience', ru: 'Настроение создаёт эмоциональный опыт' },
    aiHelper: 'virgilia'
  },
  reference_apps: {
    questionTitle: { en: 'What apps inspire your design?', ru: 'Какие приложения вдохновляют ваш дизайн?' },
    hints: [
      { en: 'Apps your V-03 audience already uses', ru: 'Приложения, которые V-03 аудитория уже использует' },
      { en: 'Include ANTI-references from R-2', ru: 'Включите АНТИ-референсы из R-2' },
      { en: 'Be specific about what to take', ru: 'Конкретизируйте что взять' }
    ],
    example: { en: '1. Headspace → Take: Calm UX\n2. Peloton → Take: Celebrations\n3. [Competitor] → Avoid: Cluttered UI', ru: '1. Headspace → Взять: Спокойный UX\n2. Peloton → Взять: Празднования\n3. [Конкурент] → Избегать: Перегруженный UI' },
    validationTip: { en: 'References speed up design decisions', ru: 'Референсы ускоряют дизайн-решения' },
    aiHelper: 'virgilia'
  },
  primary_color: {
    questionTitle: { en: 'What is your primary brand color?', ru: 'Какой основной цвет бренда?' },
    hints: [
      { en: '60% of interface will use this color', ru: '60% интерфейса будет этого цвета' },
      { en: 'Consider V-03 cultural associations', ru: 'Учтите культурные ассоциации V-03' },
      { en: 'Must work with chosen theme', ru: 'Должен работать с выбранной темой' }
    ],
    example: { en: 'Deep Purple (#6366F1)\n• V-03 associates with: wisdom\n• Works well on dark background', ru: 'Глубокий Фиолетовый (#6366F1)\n• V-03 ассоциации: мудрость\n• Хорошо на тёмном фоне' },
    validationTip: { en: 'Primary color is your brand identity', ru: 'Основной цвет — идентичность бренда' },
    aiHelper: 'virgilia'
  },
  accent_color: {
    questionTitle: { en: 'What color draws attention?', ru: 'Какой цвет привлекает внимание?' },
    hints: [
      { en: 'Used for CTAs and highlights', ru: 'Для кнопок действия и акцентов' },
      { en: 'Must contrast with primary', ru: 'Должен контрастировать с основным' },
      { en: 'Match V-04 transformation emotion', ru: 'Соответствовать эмоции трансформации V-04' }
    ],
    example: { en: 'Vibrant Gold (#F59E0B)\n• Contrasts with purple primary\n• V-04 emotion: success', ru: 'Яркий Золотой (#F59E0B)\n• Контрастирует с фиолетовым\n• V-04 эмоция: успех' },
    validationTip: { en: 'Accent drives user actions', ru: 'Акцент управляет действиями пользователя' },
    aiHelper: 'virgilia'
  },
  style_reasoning: {
    questionTitle: { en: 'Why these style choices?', ru: 'Почему такие стилевые решения?' },
    hints: [
      { en: 'Phoenix validates: does style scream value?', ru: 'Phoenix валидирует: стиль кричит ценность?' },
      { en: 'Toxic validates: different from competitors?', ru: 'Toxic валидирует: отличается от конкурентов?' },
      { en: 'Connect each choice to data', ru: 'Свяжите каждый выбор с данными' }
    ],
    example: { en: '🔥 Phoenix: Dark + Premium = speaks to V-03\n☢️ Toxic: R-2 uses Light → we differ\n✅ Message: "Elevated experience"', ru: '🔥 Phoenix: Тёмная + Премиум = говорит с V-03\n☢️ Toxic: R-2 использует Светлую → отличаемся\n✅ Послание: "Элитный опыт"' },
    validationTip: { en: 'Every style choice has a reason', ru: 'Каждое стилевое решение имеет причину' },
    aiHelper: 'phoenix'
  },

  // ========== BUILD CARD #15: SUMMARY ==========
  app_name: {
    questionTitle: { en: 'Final app name', ru: 'Финальное название приложения' },
    hints: [
      { en: 'Should match V-01 product_name', ru: 'Должно совпадать с product_name из V-01' },
      { en: 'Confirm it is memorable and unique', ru: 'Убедитесь что запоминающееся и уникальное' },
      { en: 'Check domain/app store availability', ru: 'Проверьте доступность домена/app store' }
    ],
    example: { en: 'FitAI (from V-01)', ru: 'FitAI (из V-01)' },
    validationTip: { en: 'Name is your first impression', ru: 'Название — первое впечатление' },
    aiHelper: 'evergreen'
  },
  app_format: {
    questionTitle: { en: 'Mobile, Web, or Both?', ru: 'Мобильное, Веб или Оба?' },
    hints: [
      { en: 'Based on V-03 audience behavior', ru: 'На основе поведения аудитории V-03' },
      { en: 'Mobile if push notifications important', ru: 'Мобильное если важны пуш-уведомления' },
      { en: 'Web if lots of text input or B2B', ru: 'Веб если много текстового ввода или B2B' }
    ],
    example: { en: 'Mobile App (iOS + Android)\n• V-03: Mobile-first audience\n• B-01 needs push notifications', ru: 'Мобильное приложение (iOS + Android)\n• V-03: Mobile-first аудитория\n• B-01 нужны пуш-уведомления' },
    validationTip: { en: 'Format affects tech stack', ru: 'Формат влияет на техстек' },
    aiHelper: 'techpriest'
  },
  app_description: {
    questionTitle: { en: 'One-line app description', ru: 'Описание приложения в одну строку' },
    hints: [
      { en: 'Combine V-01 + V-02 + V-04', ru: 'Объедините V-01 + V-02 + V-04' },
      { en: 'Who + Problem + Solution + Transformation', ru: 'Кто + Проблема + Решение + Трансформация' },
      { en: 'App Store friendly', ru: 'Подходит для App Store' }
    ],
    example: { en: '[Product] helps [audience] solve [problem] by [solution], delivering [transformation].', ru: '[Продукт] помогает [аудитории] решить [проблему] через [решение], давая [трансформацию].' },
    validationTip: { en: 'This goes in the App Store', ru: 'Это идёт в App Store' },
    aiHelper: 'evergreen'
  },
  features_summary: {
    questionTitle: { en: 'Summary of all features', ru: 'Сводка всех функций' },
    hints: [
      { en: 'Pull from B-01 Features card', ru: 'Возьмите из карточки B-01 Функции' },
      { en: 'Group by Basic, Key, Monetization', ru: 'Группируйте по Базовые, Ключевые, Монетизация' },
      { en: 'Bullet points for clarity', ru: 'Буллеты для ясности' }
    ],
    example: { en: 'MVP Features:\n✓ Auth + profiles\n✓ Core feature\n\nKey: ⭐ Differentiator\n\nMonetization: 💰 Freemium', ru: 'MVP Функции:\n✓ Авторизация + профили\n✓ Основная функция\n\nКлючевое: ⭐ Отличие\n\nМонетизация: 💰 Freemium' },
    validationTip: { en: 'Complete feature inventory', ru: 'Полный инвентарь функций' },
    aiHelper: 'prisma'
  },
  screens_summary: {
    questionTitle: { en: 'Summary of all screens', ru: 'Сводка всех экранов' },
    hints: [
      { en: 'Pull from B-03 Screens card', ru: 'Возьмите из карточки B-03 Экраны' },
      { en: 'Count totals by category', ru: 'Посчитайте итоги по категориям' },
      { en: 'Include navigation type', ru: 'Включите тип навигации' }
    ],
    example: { en: '📱 Total: 8 screens\n• Onboarding: 3\n• Main: 3\n• Result: 1\n• Profile: 1\n\nNav: Tab bar', ru: '📱 Всего: 8 экранов\n• Онбординг: 3\n• Основные: 3\n• Результат: 1\n• Профиль: 1\n\nНав: Tab bar' },
    validationTip: { en: 'Screen count under 10 for MVP', ru: 'Экранов меньше 10 для MVP' },
    aiHelper: 'virgilia'
  },
  style_summary: {
    questionTitle: { en: 'Summary of visual style', ru: 'Сводка визуального стиля' },
    hints: [
      { en: 'Pull from B-04 Style card', ru: 'Возьмите из карточки B-04 Стиль' },
      { en: 'Theme + Mood + Colors', ru: 'Тема + Настроение + Цвета' },
      { en: 'Key references', ru: 'Ключевые референсы' }
    ],
    example: { en: '🎨 Dark theme • Premium mood\n🎯 Like: Headspace, Peloton\n🎨 Colors: Purple + Gold', ru: '🎨 Тёмная тема • Премиум настроение\n🎯 Как: Headspace, Peloton\n🎨 Цвета: Фиолетовый + Золотой' },
    validationTip: { en: 'Style is your brand identity', ru: 'Стиль — идентичность бренда' },
    aiHelper: 'virgilia'
  },
  tech_stack: {
    questionTitle: { en: 'What technologies to use?', ru: 'Какие технологии использовать?' },
    hints: [
      { en: 'Based on B-01 features requirements', ru: 'На основе требований функций B-01' },
      { en: 'Consider R-4 technical risks', ru: 'Учтите технические риски R-4' },
      { en: 'Lovable-compatible stack', ru: 'Стек, совместимый с Lovable' }
    ],
    example: { en: '⚙️ Core: React Native + Supabase\n🔌 Integrations: Framer Motion, RevenueCat', ru: '⚙️ Ядро: React Native + Supabase\n🔌 Интеграции: Framer Motion, RevenueCat' },
    validationTip: { en: 'All buildable in Lovable', ru: 'Всё собирается в Lovable' },
    aiHelper: 'techpriest'
  },
  build_quality_score: {
    questionTitle: { en: 'BUILD phase quality check', ru: 'Проверка качества BUILD фазы' },
    hints: [
      { en: 'Ever Green coherence check', ru: 'Проверка согласованности Ever Green' },
      { en: 'All 4 checks should pass', ru: 'Все 4 проверки должны пройти' },
      { en: 'Score determines rarity', ru: 'Оценка определяет редкость' }
    ],
    example: { en: '85% EPIC 💜\n✓ B-01 → V-02: features solve pain\n✓ B-02 → V-04: path delivers value', ru: '85% ЭПИЧЕСКИЙ 💜\n✓ B-01 → V-02: функции решают боль\n✓ B-02 → V-04: путь доставляет ценность' },
    validationTip: { en: 'All checks must pass for Legendary', ru: 'Все проверки должны пройти для Легендарного' },
    aiHelper: 'evergreen'
  }
};

// Helper function to get localized text
export function getLocalizedGuidanceText(text: LocalizedString | string, language: string): string {
  if (typeof text === 'string') return text;
  const lang = language === 'es' ? 'en' : language; // fallback es to en
  return text[lang as keyof LocalizedString] || text.en;
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
