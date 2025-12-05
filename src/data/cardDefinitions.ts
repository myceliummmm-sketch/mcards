export type CardPhase = 'vision' | 'research' | 'build' | 'grow' | 'pivot';
export type CardType = 'template' | 'insight' | 'both' | 'research';
export type FieldType = 'text' | 'textarea' | 'select' | 'repeatable';
export type ResearchStatus = 'locked' | 'researching' | 'ready' | 'accepted';

export interface FormFieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required: boolean;
  options?: string[];
  maxRepeats?: number;
}

export interface CardDefinition {
  id: string;
  slot: number;
  phase: CardPhase;
  title: string;
  coreQuestion: string;
  formula: string;
  example?: string;
  aiHelpers: string[];
  cardType: CardType;
  fields: FormFieldConfig[];
  isResearchCard?: boolean;
  researchFocus?: string;
}

export const PHASE_CONFIG = {
  vision: {
    name: 'VISION',
    icon: '🔮',
    color: 'hsl(270 70% 60%)',
    description: "WHAT we're building",
    slots: [1, 2, 3, 4, 5]
  },
  research: {
    name: 'RESEARCH',
    icon: '🔬',
    color: 'hsl(200 70% 55%)',
    description: 'WHAT we know',
    slots: [6, 7, 8, 9, 10]
  },
  build: {
    name: 'BUILD',
    icon: '🔧',
    color: 'hsl(140 70% 50%)',
    description: 'HOW it works',
    slots: [11, 12, 13, 14, 15]
  },
  grow: {
    name: 'GROW',
    icon: '🚀',
    color: 'hsl(30 90% 55%)',
    description: 'HOW it grows',
    slots: [16, 17, 18, 19, 20]
  },
  pivot: {
    name: 'PIVOT',
    icon: '🔄',
    color: 'hsl(280 80% 55%)',
    description: 'WHEN to change direction',
    slots: [21, 22, 23, 24, 25]
  }
};

export const CARD_DEFINITIONS: CardDefinition[] = [
  // ============= VISION PHASE (5 cards) =============
  {
    id: 'product',
    slot: 1,
    phase: 'vision',
    title: 'PRODUCT',
    coreQuestion: 'What is this in one phrase?',
    formula: '[Product] is [analogy] for [audience]',
    example: 'Duolingo for public speaking',
    aiHelpers: ['evergreen'],
    cardType: 'both',
    fields: [
      { name: 'product_name', label: 'Product Name', type: 'text', placeholder: 'e.g., FitAI', required: true },
      { name: 'analogy', label: 'Analogy', type: 'text', placeholder: 'e.g., Duolingo', required: true },
      { name: 'target_audience', label: 'Target Audience', type: 'text', placeholder: 'e.g., busy professionals', required: true },
      { name: 'one_liner', label: 'One-Line Description', type: 'textarea', placeholder: 'Combine the above into one sentence', required: true }
    ]
  },
  {
    id: 'problem',
    slot: 2,
    phase: 'vision',
    title: 'PROBLEM',
    coreQuestion: 'What pain are we solving?',
    formula: '[Who] suffers from [what] because [why]. Cost: [amount]',
    example: 'Freelancers lose 30% income due to late payments. Data: survey of 2000 people',
    aiHelpers: ['prisma', 'toxic'],
    cardType: 'both',
    fields: [
      { name: 'who_suffers', label: 'Who Suffers?', type: 'text', placeholder: 'e.g., busy professionals', required: true },
      { name: 'pain_description', label: 'What Do They Suffer From?', type: 'textarea', placeholder: 'Describe the pain point in detail', required: true },
      { name: 'root_cause', label: 'Why Does This Happen?', type: 'textarea', placeholder: 'What causes this problem?', required: true },
      { name: 'pain_cost', label: 'Cost of the Problem', type: 'text', placeholder: 'e.g., $500/year, 10 hours/week', required: true },
      { name: 'data_source', label: 'Data Source (Optional)', type: 'text', placeholder: 'e.g., Survey of 500 users', required: false }
    ]
  },
  {
    id: 'audience',
    slot: 3,
    phase: 'vision',
    title: 'AUDIENCE',
    coreQuestion: 'Who are we building for?',
    formula: '[Demographics] who [behavior] and want [goal]',
    example: 'Busy moms 28-40, use apps at 6AM and 9PM, pain: guilt feeling',
    aiHelpers: ['phoenix', 'prisma'],
    cardType: 'both',
    fields: [
      { name: 'demographics', label: 'Demographics', type: 'text', placeholder: 'Age, gender, location, profession', required: true },
      { name: 'behaviors', label: 'Behaviors', type: 'textarea', placeholder: 'What do they do? How do they behave?', required: true },
      { name: 'goals', label: 'Goals', type: 'textarea', placeholder: 'What do they want to achieve?', required: true },
      { name: 'pain_points', label: 'Pain Points', type: 'textarea', placeholder: 'What frustrates them?', required: true },
      { name: 'purchase_triggers', label: 'Purchase Triggers', type: 'textarea', placeholder: 'What makes them buy?', required: true },
      { name: 'active_hours', label: 'Active Hours', type: 'text', placeholder: 'e.g., 6AM-9AM, 8PM-11PM', required: false }
    ]
  },
  {
    id: 'value',
    slot: 4,
    phase: 'vision',
    title: 'VALUE',
    coreQuestion: 'Why will they pay?',
    formula: 'Instead of [alternative] for [price] — they get [result] for [your price]',
    example: 'EdTech value pattern: tutor $500 vs AI-tutor $29/mo = 17x ROI',
    aiHelpers: ['evergreen', 'phoenix'],
    cardType: 'both',
    fields: [
      { name: 'current_alternative', label: 'Current Alternative', type: 'text', placeholder: 'e.g., personal trainer', required: true },
      { name: 'alternative_cost', label: 'Alternative Cost', type: 'text', placeholder: 'e.g., $100/hour', required: true },
      { name: 'your_solution', label: 'Your Solution', type: 'textarea', placeholder: 'What do you offer instead?', required: true },
      { name: 'your_price', label: 'Your Price', type: 'text', placeholder: 'e.g., $9.99/month', required: true },
      { name: 'roi_multiple', label: 'ROI Multiple', type: 'text', placeholder: 'e.g., 10x, 17x', required: false }
    ]
  },
  {
    id: 'vision',
    slot: 5,
    phase: 'vision',
    title: 'VISION',
    coreQuestion: 'What world are we creating?',
    formula: "We're creating a world where [who] can [what] without [barrier]",
    example: 'Democratization vision pattern: quality X accessible to everyone',
    aiHelpers: ['evergreen', 'virgilia'],
    cardType: 'both',
    fields: [
      { name: 'vision_statement', label: 'Vision Statement', type: 'textarea', placeholder: "Describe the world you're creating", required: true },
      { name: 'who_benefits', label: 'Who Benefits?', type: 'text', placeholder: 'e.g., everyone, small businesses', required: true },
      { name: 'what_becomes_possible', label: 'What Becomes Possible?', type: 'textarea', placeholder: "What can people do now that they couldn't before?", required: true },
      { name: 'barrier_removed', label: 'Barrier Removed', type: 'text', placeholder: 'e.g., cost, time, expertise', required: true }
    ]
  },

  // ============= RESEARCH PHASE (5 AI-driven cards) =============
  {
    id: 'market_map',
    slot: 6,
    phase: 'research',
    title: 'MARKET MAP',
    coreQuestion: 'What does the competitive landscape look like?',
    formula: 'Market size: [X]. Key players: [list]. Our position: [where]',
    aiHelpers: ['phoenix', 'evergreen'],
    cardType: 'research',
    isResearchCard: true,
    researchFocus: 'market_landscape',
    fields: [
      { name: 'market_size', label: 'Market Size', type: 'text', placeholder: 'AI-researched market size', required: false },
      { name: 'key_players', label: 'Key Players', type: 'textarea', placeholder: 'AI-researched competitors', required: false },
      { name: 'market_trends', label: 'Market Trends', type: 'textarea', placeholder: 'AI-researched trends', required: false },
      { name: 'our_position', label: 'Our Position', type: 'textarea', placeholder: 'AI-determined positioning', required: false }
    ]
  },
  {
    id: 'competitor_analysis',
    slot: 7,
    phase: 'research',
    title: 'COMPETITOR ANALYSIS',
    coreQuestion: 'How do competitors stack up?',
    formula: 'Strengths: [X]. Weaknesses: [Y]. Our advantage: [Z]',
    aiHelpers: ['toxic', 'prisma'],
    cardType: 'research',
    isResearchCard: true,
    researchFocus: 'competitor_deep_dive',
    fields: [
      { name: 'competitor_strengths', label: 'Competitor Strengths', type: 'textarea', placeholder: 'AI-researched strengths', required: false },
      { name: 'competitor_weaknesses', label: 'Competitor Weaknesses', type: 'textarea', placeholder: 'AI-researched weaknesses', required: false },
      { name: 'pricing_analysis', label: 'Pricing Analysis', type: 'textarea', placeholder: 'AI-researched pricing', required: false },
      { name: 'our_advantage', label: 'Our Competitive Advantage', type: 'textarea', placeholder: 'AI-determined advantage', required: false }
    ]
  },
  {
    id: 'user_insights',
    slot: 8,
    phase: 'research',
    title: 'USER INSIGHTS',
    coreQuestion: 'What do real users say?',
    formula: 'Pain points: [list]. Desires: [list]. Behavior: [patterns]',
    aiHelpers: ['prisma', 'zen'],
    cardType: 'research',
    isResearchCard: true,
    researchFocus: 'user_research',
    fields: [
      { name: 'user_pain_points', label: 'User Pain Points', type: 'textarea', placeholder: 'AI-researched pain points', required: false },
      { name: 'user_desires', label: 'User Desires', type: 'textarea', placeholder: 'AI-researched desires', required: false },
      { name: 'behavior_patterns', label: 'Behavior Patterns', type: 'textarea', placeholder: 'AI-researched behaviors', required: false },
      { name: 'key_quotes', label: 'Key User Quotes', type: 'textarea', placeholder: 'AI-found quotes', required: false }
    ]
  },
  {
    id: 'risk_assessment',
    slot: 9,
    phase: 'research',
    title: 'RISK ASSESSMENT',
    coreQuestion: 'What could go wrong?',
    formula: 'Risk: [X]. Probability: [%]. Mitigation: [strategy]',
    aiHelpers: ['toxic', 'techpriest'],
    cardType: 'research',
    isResearchCard: true,
    researchFocus: 'risk_analysis',
    fields: [
      { name: 'market_risks', label: 'Market Risks', type: 'textarea', placeholder: 'AI-identified market risks', required: false },
      { name: 'technical_risks', label: 'Technical Risks', type: 'textarea', placeholder: 'AI-identified tech risks', required: false },
      { name: 'competitive_risks', label: 'Competitive Risks', type: 'textarea', placeholder: 'AI-identified competitive risks', required: false },
      { name: 'mitigation_strategies', label: 'Mitigation Strategies', type: 'textarea', placeholder: 'AI-suggested mitigations', required: false }
    ]
  },
  {
    id: 'opportunity_score',
    slot: 10,
    phase: 'research',
    title: 'OPPORTUNITY SCORE',
    coreQuestion: 'Should we proceed?',
    formula: 'Verdict: [GO/CONDITIONAL GO/PIVOT/STOP]. Score: [X/100]',
    aiHelpers: ['evergreen', 'phoenix', 'toxic'],
    cardType: 'research',
    isResearchCard: true,
    researchFocus: 'synthesis',
    fields: [
      { name: 'overall_score', label: 'Overall Score', type: 'text', placeholder: 'AI-calculated score', required: false },
      { name: 'verdict', label: 'Verdict', type: 'text', placeholder: 'GO / CONDITIONAL GO / PIVOT / STOP', required: false },
      { name: 'key_strengths', label: 'Key Strengths', type: 'textarea', placeholder: 'AI-identified strengths', required: false },
      { name: 'key_concerns', label: 'Key Concerns', type: 'textarea', placeholder: 'AI-identified concerns', required: false },
      { name: 'recommendations', label: 'Recommendations', type: 'textarea', placeholder: 'AI recommendations', required: false }
    ]
  },

  // ============= BUILD PHASE (5 cards, slots 11-15) =============
  {
    id: 'features',
    slot: 11,
    phase: 'build',
    title: 'FEATURES',
    coreQuestion: 'What can the product do?',
    formula: 'Feature [N]: [name] → gives user [result]',
    aiHelpers: ['prisma', 'techpriest'],
    cardType: 'template',
    fields: [
      { name: 'feature_1', label: 'Feature 1 Name', type: 'text', placeholder: 'e.g., AI Voice Coach', required: true },
      { name: 'feature_1_benefit', label: 'Feature 1 Benefit', type: 'textarea', placeholder: 'What does this give the user?', required: true },
      { name: 'feature_2', label: 'Feature 2 Name', type: 'text', placeholder: 'e.g., Progress Tracking', required: true },
      { name: 'feature_2_benefit', label: 'Feature 2 Benefit', type: 'textarea', placeholder: 'What does this give the user?', required: true },
      { name: 'feature_3', label: 'Feature 3 Name', type: 'text', placeholder: 'e.g., Adaptive Workouts', required: true },
      { name: 'feature_3_benefit', label: 'Feature 3 Benefit', type: 'textarea', placeholder: 'What does this give the user?', required: true },
      { name: 'feature_4', label: 'Feature 4 Name (Optional)', type: 'text', placeholder: '', required: false },
      { name: 'feature_4_benefit', label: 'Feature 4 Benefit', type: 'textarea', placeholder: '', required: false },
      { name: 'feature_5', label: 'Feature 5 Name (Optional)', type: 'text', placeholder: '', required: false },
      { name: 'feature_5_benefit', label: 'Feature 5 Benefit', type: 'textarea', placeholder: '', required: false }
    ]
  },
  {
    id: 'flow',
    slot: 12,
    phase: 'build',
    title: 'FLOW',
    coreQuestion: 'How does user get value?',
    formula: 'Step 1 → Step 2 → [First Value] → ... → [Conversion]',
    aiHelpers: ['prisma', 'virgilia'],
    cardType: 'template',
    fields: [
      { name: 'step_1', label: 'Step 1', type: 'text', placeholder: 'e.g., Sign up with Google', required: true },
      { name: 'step_2', label: 'Step 2', type: 'text', placeholder: 'e.g., Complete fitness assessment', required: true },
      { name: 'first_value_moment', label: 'First Value Moment', type: 'textarea', placeholder: 'When does user first experience value?', required: true },
      { name: 'conversion_step', label: 'Conversion Step', type: 'text', placeholder: 'What triggers conversion/purchase?', required: true },
      { name: 'total_steps', label: 'Total Steps to Conversion', type: 'text', placeholder: 'e.g., 5 steps', required: true }
    ]
  },
  {
    id: 'screens',
    slot: 13,
    phase: 'build',
    title: 'SCREENS',
    coreQuestion: 'What screens are needed?',
    formula: '[Screen]: [purpose]',
    aiHelpers: ['techpriest', 'virgilia'],
    cardType: 'template',
    fields: [
      { name: 'screen_1_name', label: 'Screen 1 Name', type: 'text', placeholder: 'e.g., Dashboard', required: true },
      { name: 'screen_1_purpose', label: 'Screen 1 Purpose', type: 'textarea', placeholder: 'What is this screen for?', required: true },
      { name: 'screen_2_name', label: 'Screen 2 Name', type: 'text', placeholder: 'e.g., Workout View', required: true },
      { name: 'screen_2_purpose', label: 'Screen 2 Purpose', type: 'textarea', placeholder: 'What is this screen for?', required: true },
      { name: 'screen_3_name', label: 'Screen 3 Name', type: 'text', placeholder: 'e.g., Progress', required: true },
      { name: 'screen_3_purpose', label: 'Screen 3 Purpose', type: 'textarea', placeholder: 'What is this screen for?', required: true },
      { name: 'screen_4_name', label: 'Screen 4 Name (Optional)', type: 'text', placeholder: '', required: false },
      { name: 'screen_4_purpose', label: 'Screen 4 Purpose', type: 'textarea', placeholder: '', required: false }
    ]
  },
  {
    id: 'data',
    slot: 14,
    phase: 'build',
    title: 'DATA',
    coreQuestion: 'What data do we store?',
    formula: 'User data: [X]. Content: [Y]. Analytics: [Z]',
    aiHelpers: ['techpriest', 'toxic'],
    cardType: 'template',
    fields: [
      { name: 'user_data', label: 'User Data', type: 'textarea', placeholder: 'What user data is stored?', required: true },
      { name: 'content_data', label: 'Content Data', type: 'textarea', placeholder: 'What content/product data?', required: true },
      { name: 'analytics_data', label: 'Analytics Data', type: 'textarea', placeholder: 'What analytics are tracked?', required: true },
      { name: 'integrations', label: 'Third-Party Integrations', type: 'text', placeholder: 'e.g., Stripe, SendGrid', required: false },
      { name: 'privacy_level', label: 'Privacy Level', type: 'select', required: true, options: ['Basic', 'Standard', 'Strict'] }
    ]
  },
  {
    id: 'ux_pattern',
    slot: 15,
    phase: 'build',
    title: 'UX PATTERN',
    coreQuestion: 'What UX pattern should we use?',
    formula: '[Pattern]: [how it works]. Result: [metric]. Works in: [areas]',
    example: 'Streak Mechanic: +40% D30 retention. Works: learning, fitness',
    aiHelpers: ['virgilia', 'prisma'],
    cardType: 'both',
    fields: [
      { name: 'pattern_name', label: 'Pattern Name', type: 'text', placeholder: 'e.g., Streak Mechanic', required: true },
      { name: 'how_it_works', label: 'How It Works', type: 'textarea', placeholder: 'Describe the UX pattern', required: true },
      { name: 'expected_result', label: 'Expected Result', type: 'text', placeholder: 'e.g., +40% retention', required: true },
      { name: 'applicable_to', label: 'Applicable To', type: 'text', placeholder: 'Industries/products where this works', required: true },
      { name: 'data_source', label: 'Data Source', type: 'text', placeholder: 'e.g., Nir Eyal research', required: false }
    ]
  },

  // ============= GROW PHASE (5 cards, slots 16-20) =============
  {
    id: 'pricing',
    slot: 16,
    phase: 'grow',
    title: 'PRICING',
    coreQuestion: 'How do we price this?',
    formula: 'Free: [X]. Pro: [Y]. Enterprise: [Z]',
    aiHelpers: ['phoenix', 'evergreen'],
    cardType: 'template',
    fields: [
      { name: 'free_tier', label: 'Free Tier', type: 'textarea', placeholder: 'What\'s included in free?', required: true },
      { name: 'pro_tier', label: 'Pro Tier', type: 'textarea', placeholder: 'What\'s included in paid?', required: true },
      { name: 'pro_price', label: 'Pro Price', type: 'text', placeholder: 'e.g., $9.99/month', required: true },
      { name: 'enterprise_tier', label: 'Enterprise Tier (Optional)', type: 'textarea', placeholder: 'Enterprise features', required: false },
      { name: 'pricing_strategy', label: 'Pricing Strategy', type: 'select', required: true, options: ['Freemium', 'Free Trial', 'Pay-as-you-go', 'Subscription', 'One-time'] }
    ]
  },
  {
    id: 'acquisition',
    slot: 17,
    phase: 'grow',
    title: 'ACQUISITION',
    coreQuestion: 'How do we get users?',
    formula: 'Channel: [X]. CAC: [Y]. LTV: [Z]. Ratio: [LTV/CAC]',
    aiHelpers: ['phoenix', 'prisma'],
    cardType: 'template',
    fields: [
      { name: 'primary_channel', label: 'Primary Channel', type: 'text', placeholder: 'e.g., SEO, Paid ads, Referral', required: true },
      { name: 'secondary_channels', label: 'Secondary Channels', type: 'textarea', placeholder: 'Other acquisition channels', required: true },
      { name: 'target_cac', label: 'Target CAC', type: 'text', placeholder: 'e.g., $5 per user', required: true },
      { name: 'expected_ltv', label: 'Expected LTV', type: 'text', placeholder: 'e.g., $50 per user', required: true },
      { name: 'ltv_cac_ratio', label: 'LTV/CAC Ratio', type: 'text', placeholder: 'e.g., 10:1', required: false }
    ]
  },
  {
    id: 'retention',
    slot: 18,
    phase: 'grow',
    title: 'RETENTION',
    coreQuestion: 'How do we keep users?',
    formula: 'Hook: [X]. Habit: [Y]. Target D30: [Z%]',
    aiHelpers: ['prisma', 'zen'],
    cardType: 'template',
    fields: [
      { name: 'hook_mechanism', label: 'Hook Mechanism', type: 'textarea', placeholder: 'What brings users back?', required: true },
      { name: 'habit_loop', label: 'Habit Loop', type: 'textarea', placeholder: 'Trigger → Action → Reward', required: true },
      { name: 'target_d1', label: 'Target D1 Retention', type: 'text', placeholder: 'e.g., 40%', required: true },
      { name: 'target_d7', label: 'Target D7 Retention', type: 'text', placeholder: 'e.g., 20%', required: true },
      { name: 'target_d30', label: 'Target D30 Retention', type: 'text', placeholder: 'e.g., 10%', required: true }
    ]
  },
  {
    id: 'virality',
    slot: 19,
    phase: 'grow',
    title: 'VIRALITY',
    coreQuestion: 'How does it spread?',
    formula: 'Mechanic: [X]. K-factor: [Y]. Cycle time: [Z days]',
    aiHelpers: ['phoenix', 'virgilia'],
    cardType: 'template',
    fields: [
      { name: 'viral_mechanic', label: 'Viral Mechanic', type: 'textarea', placeholder: 'How do users share?', required: true },
      { name: 'share_trigger', label: 'Share Trigger', type: 'text', placeholder: 'What moment triggers sharing?', required: true },
      { name: 'target_k_factor', label: 'Target K-Factor', type: 'text', placeholder: 'e.g., 1.2', required: false },
      { name: 'cycle_time', label: 'Viral Cycle Time', type: 'text', placeholder: 'e.g., 3 days', required: false }
    ]
  },
  {
    id: 'metrics',
    slot: 20,
    phase: 'grow',
    title: 'METRICS',
    coreQuestion: 'What do we measure?',
    formula: 'North Star: [X]. Leading: [Y]. Lagging: [Z]',
    aiHelpers: ['evergreen', 'techpriest'],
    cardType: 'template',
    fields: [
      { name: 'north_star', label: 'North Star Metric', type: 'text', placeholder: 'e.g., Weekly Active Users', required: true },
      { name: 'leading_metrics', label: 'Leading Indicators', type: 'textarea', placeholder: 'Metrics that predict success', required: true },
      { name: 'lagging_metrics', label: 'Lagging Indicators', type: 'textarea', placeholder: 'Metrics that confirm success', required: true },
      { name: 'measurement_cadence', label: 'Measurement Cadence', type: 'select', required: true, options: ['Daily', 'Weekly', 'Monthly', 'Quarterly'] }
    ]
  },

  // ============= PIVOT PHASE (5 cards, slots 21-25) =============
  {
    id: 'signals',
    slot: 21,
    phase: 'pivot',
    title: 'SIGNALS',
    coreQuestion: 'What tells us to change?',
    formula: 'Red flag: [X] at [threshold]. Action: [Y]',
    aiHelpers: ['toxic', 'evergreen'],
    cardType: 'template',
    fields: [
      { name: 'red_flags', label: 'Red Flag Metrics', type: 'textarea', placeholder: 'What metrics indicate problems?', required: true },
      { name: 'thresholds', label: 'Thresholds', type: 'textarea', placeholder: 'At what point do we act?', required: true },
      { name: 'green_flags', label: 'Green Flag Metrics', type: 'textarea', placeholder: 'What indicates success?', required: true },
      { name: 'review_cadence', label: 'Review Cadence', type: 'select', required: true, options: ['Weekly', 'Bi-weekly', 'Monthly'] }
    ]
  },
  {
    id: 'pivot_options',
    slot: 22,
    phase: 'pivot',
    title: 'PIVOT OPTIONS',
    coreQuestion: 'What alternatives do we have?',
    formula: 'Option [N]: [description]. Trigger: [condition]',
    aiHelpers: ['evergreen', 'phoenix'],
    cardType: 'template',
    fields: [
      { name: 'option_1', label: 'Pivot Option 1', type: 'textarea', placeholder: 'Describe alternative direction', required: true },
      { name: 'option_1_trigger', label: 'Option 1 Trigger', type: 'text', placeholder: 'What condition triggers this?', required: true },
      { name: 'option_2', label: 'Pivot Option 2', type: 'textarea', placeholder: 'Describe alternative direction', required: true },
      { name: 'option_2_trigger', label: 'Option 2 Trigger', type: 'text', placeholder: 'What condition triggers this?', required: true },
      { name: 'option_3', label: 'Pivot Option 3 (Optional)', type: 'textarea', placeholder: 'Describe alternative direction', required: false }
    ]
  },
  {
    id: 'runway',
    slot: 23,
    phase: 'pivot',
    title: 'RUNWAY',
    coreQuestion: 'How long can we last?',
    formula: 'Runway: [X months]. Burn: [Y/month]. Extend by: [Z]',
    aiHelpers: ['evergreen', 'techpriest'],
    cardType: 'template',
    fields: [
      { name: 'current_runway', label: 'Current Runway', type: 'text', placeholder: 'e.g., 12 months', required: true },
      { name: 'monthly_burn', label: 'Monthly Burn Rate', type: 'text', placeholder: 'e.g., $10,000/month', required: true },
      { name: 'extension_options', label: 'Runway Extension Options', type: 'textarea', placeholder: 'How to extend runway?', required: true },
      { name: 'break_even_point', label: 'Break-Even Point', type: 'text', placeholder: 'When do we break even?', required: false }
    ]
  },
  {
    id: 'kill_criteria',
    slot: 24,
    phase: 'pivot',
    title: 'KILL CRITERIA',
    coreQuestion: 'When do we stop?',
    formula: 'Kill if: [condition] by [date]. Evidence: [data]',
    aiHelpers: ['toxic', 'zen'],
    cardType: 'template',
    fields: [
      { name: 'kill_condition_1', label: 'Kill Condition 1', type: 'textarea', placeholder: 'Condition that triggers shutdown', required: true },
      { name: 'kill_deadline_1', label: 'Deadline 1', type: 'text', placeholder: 'By when?', required: true },
      { name: 'kill_condition_2', label: 'Kill Condition 2', type: 'textarea', placeholder: 'Another shutdown condition', required: false },
      { name: 'kill_deadline_2', label: 'Deadline 2', type: 'text', placeholder: 'By when?', required: false },
      { name: 'graceful_shutdown', label: 'Graceful Shutdown Plan', type: 'textarea', placeholder: 'How to wind down responsibly?', required: true }
    ]
  },
  {
    id: 'lessons',
    slot: 25,
    phase: 'pivot',
    title: 'LESSONS',
    coreQuestion: 'What did we learn?',
    formula: 'Lesson: [X]. Evidence: [Y]. Apply to: [Z]',
    aiHelpers: ['zen', 'evergreen'],
    cardType: 'both',
    fields: [
      { name: 'key_learnings', label: 'Key Learnings', type: 'textarea', placeholder: 'What worked and what didn\'t?', required: true },
      { name: 'evidence', label: 'Supporting Evidence', type: 'textarea', placeholder: 'Data that supports learnings', required: true },
      { name: 'apply_forward', label: 'Apply to Future', type: 'textarea', placeholder: 'How to apply these lessons?', required: true },
      { name: 'share_with', label: 'Share With', type: 'text', placeholder: 'Who should know this?', required: false }
    ]
  }
];

export const RESEARCH_CARD_SLOTS = [6, 7, 8, 9, 10];

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