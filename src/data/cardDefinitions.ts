export type CardPhase = 'vision' | 'research' | 'build' | 'grow';
export type CardType = 'template' | 'insight' | 'both';
export type FieldType = 'text' | 'textarea' | 'select' | 'repeatable';

export interface FormFieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required: boolean;
  options?: string[];
  maxRepeats?: number; // For repeatable fields
}

export interface CardDefinition {
  id: string;
  slot: number;
  phase: CardPhase;
  title: string;
  coreQuestion: string;
  formula: string;
  example?: string;
  aiHelpers: string[]; // Character IDs
  cardType: CardType;
  fields: FormFieldConfig[];
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
    slots: [6, 7, 8, 9, 10, 11]
  },
  build: {
    name: 'BUILD',
    icon: '🔧',
    color: 'hsl(140 70% 50%)',
    description: 'HOW it works',
    slots: [12, 13, 14, 15, 16, 17]
  },
  grow: {
    name: 'GROW',
    icon: '🚀',
    color: 'hsl(30 90% 55%)',
    description: 'HOW it grows',
    slots: [18, 19, 20, 21, 22]
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

  // ============= RESEARCH PHASE (6 cards) =============
  {
    id: 'competitor',
    slot: 6,
    phase: 'research',
    title: 'COMPETITOR',
    coreQuestion: 'Who already solves this problem?',
    formula: "Top-N: [list]. Gap: [what they don't do]. Wedge: [your entry]",
    aiHelpers: ['toxic', 'prisma'],
    cardType: 'both',
    fields: [
      { name: 'competitors_list', label: 'Main Competitors', type: 'textarea', placeholder: 'List top competitors and brief description', required: true },
      { name: 'their_pricing', label: 'Competitor Pricing', type: 'text', placeholder: 'e.g., $10-50/month', required: true },
      { name: 'their_weaknesses', label: 'Their Weaknesses', type: 'textarea', placeholder: 'What do they do poorly?', required: true },
      { name: 'market_gap', label: 'Market Gap', type: 'textarea', placeholder: "What's missing in the market?", required: true },
      { name: 'your_wedge', label: 'Your Competitive Advantage', type: 'textarea', placeholder: 'How are you different/better?', required: true }
    ]
  },
  {
    id: 'market',
    slot: 7,
    phase: 'research',
    title: 'MARKET',
    coreQuestion: "What's the size of opportunity?",
    formula: "TAM: [X], SAM: [Y], SOM: [Z]. Growth: [%]. Timing: [why now]",
    aiHelpers: ['evergreen', 'phoenix'],
    cardType: 'both',
    fields: [
      { name: 'tam', label: 'Total Addressable Market', type: 'text', placeholder: 'e.g., $5B', required: true },
      { name: 'sam', label: 'Serviceable Addressable Market', type: 'text', placeholder: 'e.g., $500M', required: true },
      { name: 'som', label: 'Serviceable Obtainable Market', type: 'text', placeholder: 'e.g., $10M in year 1', required: true },
      { name: 'growth_rate', label: 'Market Growth Rate', type: 'text', placeholder: 'e.g., 25% YoY', required: true },
      { name: 'timing_reason', label: 'Why Now?', type: 'textarea', placeholder: 'Why is now the right time?', required: true },
      { name: 'data_source', label: 'Data Source', type: 'text', placeholder: 'e.g., Gartner Report 2024', required: false }
    ]
  },
  {
    id: 'user_voice',
    slot: 8,
    phase: 'research',
    title: 'USER VOICE',
    coreQuestion: 'What do real users say?',
    formula: 'Top complaints: [list with %]. Opportunity: [what to do]',
    aiHelpers: ['prisma', 'zen'],
    cardType: 'both',
    fields: [
      { name: 'complaints_list', label: 'Top User Complaints', type: 'textarea', placeholder: 'List main complaints with percentages if available', required: true },
      { name: 'percentages', label: 'Percentage Breakdown', type: 'text', placeholder: 'e.g., 40% say too complex, 35% say too expensive', required: false },
      { name: 'opportunity', label: 'Opportunity', type: 'textarea', placeholder: 'What does this reveal about opportunities?', required: true },
      { name: 'data_source', label: 'Data Source', type: 'text', placeholder: 'e.g., Reddit analysis, user interviews', required: true },
      { name: 'sample_size', label: 'Sample Size', type: 'text', placeholder: 'e.g., 500 users, 2000 comments', required: false }
    ]
  },
  {
    id: 'insight_9',
    slot: 9,
    phase: 'research',
    title: 'INSIGHT',
    coreQuestion: 'What important knowledge do we have?',
    formula: '[Fact]. Data: [source]. Applicable to: [areas]',
    aiHelpers: ['prisma', 'toxic'],
    cardType: 'insight',
    fields: [
      { name: 'insight_text', label: 'The Insight', type: 'textarea', placeholder: 'Describe the key insight or finding', required: true },
      { name: 'data_source', label: 'Data Source', type: 'text', placeholder: 'Where does this data come from?', required: true },
      { name: 'sample_size', label: 'Sample Size (Optional)', type: 'text', placeholder: 'e.g., N=5000', required: false },
      { name: 'applicable_to', label: 'Applicable To', type: 'text', placeholder: 'Which industries/products?', required: true },
      { name: 'action_item', label: 'Action Item', type: 'textarea', placeholder: 'What should be done based on this insight?', required: true }
    ]
  },
  {
    id: 'insight_10',
    slot: 10,
    phase: 'research',
    title: 'INSIGHT',
    coreQuestion: 'What important knowledge do we have?',
    formula: '[Fact]. Data: [source]. Applicable to: [areas]',
    aiHelpers: ['phoenix', 'techpriest'],
    cardType: 'insight',
    fields: [
      { name: 'insight_text', label: 'The Insight', type: 'textarea', placeholder: 'Describe the key insight or finding', required: true },
      { name: 'data_source', label: 'Data Source', type: 'text', placeholder: 'Where does this data come from?', required: true },
      { name: 'sample_size', label: 'Sample Size (Optional)', type: 'text', placeholder: 'e.g., N=5000', required: false },
      { name: 'applicable_to', label: 'Applicable To', type: 'text', placeholder: 'Which industries/products?', required: true },
      { name: 'action_item', label: 'Action Item', type: 'textarea', placeholder: 'What should be done based on this insight?', required: true }
    ]
  },
  {
    id: 'insight_11',
    slot: 11,
    phase: 'research',
    title: 'INSIGHT',
    coreQuestion: 'What important knowledge do we have?',
    formula: '[Fact]. Data: [source]. Applicable to: [areas]',
    aiHelpers: ['virgilia', 'zen'],
    cardType: 'insight',
    fields: [
      { name: 'insight_text', label: 'The Insight', type: 'textarea', placeholder: 'Describe the key insight or finding', required: true },
      { name: 'data_source', label: 'Data Source', type: 'text', placeholder: 'Where does this data come from?', required: true },
      { name: 'sample_size', label: 'Sample Size (Optional)', type: 'text', placeholder: 'e.g., N=5000', required: false },
      { name: 'applicable_to', label: 'Applicable To', type: 'text', placeholder: 'Which industries/products?', required: true },
      { name: 'action_item', label: 'Action Item', type: 'textarea', placeholder: 'What should be done based on this insight?', required: true }
    ]
  },

  // ============= BUILD PHASE (6 cards) =============
  {
    id: 'features',
    slot: 12,
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
    slot: 13,
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
    slot: 14,
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
    slot: 15,
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
    id: 'ux_pattern_16',
    slot: 16,
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
      { name: 'implementation_tips', label: 'Implementation Tips', type: 'textarea', placeholder: 'How to implement effectively', required: false }
    ]
  },
  {
    id: 'ux_pattern_17',
    slot: 17,
    phase: 'build',
    title: 'UX PATTERN',
    coreQuestion: 'What UX pattern should we use?',
    formula: '[Pattern]: [how it works]. Result: [metric]. Works in: [areas]',
    example: 'Progress Visualization: +35% completion rate',
    aiHelpers: ['virgilia', 'prisma'],
    cardType: 'both',
    fields: [
      { name: 'pattern_name', label: 'Pattern Name', type: 'text', placeholder: 'e.g., Progress Visualization', required: true },
      { name: 'how_it_works', label: 'How It Works', type: 'textarea', placeholder: 'Describe the UX pattern', required: true },
      { name: 'expected_result', label: 'Expected Result', type: 'text', placeholder: 'e.g., +35% completion', required: true },
      { name: 'applicable_to', label: 'Applicable To', type: 'text', placeholder: 'Industries/products where this works', required: true },
      { name: 'implementation_tips', label: 'Implementation Tips', type: 'textarea', placeholder: 'How to implement effectively', required: false }
    ]
  },

  // ============= GROW PHASE (5 cards) =============
  {
    id: 'style',
    slot: 18,
    phase: 'grow',
    title: 'STYLE',
    coreQuestion: 'How does it look and feel?',
    formula: 'Mood: [X]. Colors: [Y]. References: [Z]',
    example: 'Calm Tech: soft gradients, pastel, lots of whitespace. Reference: Headspace',
    aiHelpers: ['virgilia'],
    cardType: 'both',
    fields: [
      { name: 'mood', label: 'Overall Mood', type: 'text', placeholder: 'e.g., energetic, calm, professional', required: true },
      { name: 'color_palette', label: 'Color Palette', type: 'text', placeholder: 'e.g., neon cyan, electric purple', required: true },
      { name: 'typography', label: 'Typography', type: 'text', placeholder: 'e.g., bold sans-serif, modern', required: true },
      { name: 'references', label: 'Reference Apps/Brands', type: 'textarea', placeholder: 'e.g., Nike Training Club, Headspace', required: true },
      { name: 'ui_style', label: 'UI Style', type: 'select', required: true, options: ['Modern', 'Classic', 'Minimal', 'Bold'] }
    ]
  },
  {
    id: 'money',
    slot: 19,
    phase: 'grow',
    title: 'MONEY',
    coreQuestion: 'How do we make money?',
    formula: 'Model: [X]. Price: [Y]. Conversion benchmark: [Z%]',
    example: 'Freemium: Free + $9.99/mo. Conversion 2-5%. 7-day trial +30%',
    aiHelpers: ['evergreen', 'phoenix'],
    cardType: 'both',
    fields: [
      { name: 'model_type', label: 'Model Type', type: 'select', required: true, options: ['Freemium', 'Subscription', 'One-time', 'Usage-based'] },
      { name: 'price_tiers', label: 'Pricing Structure', type: 'textarea', placeholder: 'Describe tiers and pricing', required: true },
      { name: 'conversion_benchmark', label: 'Expected Conversion Rate', type: 'text', placeholder: 'e.g., 2-5%', required: true },
      { name: 'trial_strategy', label: 'Free Trial Details', type: 'text', placeholder: 'e.g., 7-day free trial', required: false },
      { name: 'paywall_trigger', label: 'Paywall Trigger', type: 'textarea', placeholder: 'When does paywall appear?', required: true }
    ]
  },
  {
    id: 'channel',
    slot: 20,
    phase: 'grow',
    title: 'CHANNEL',
    coreQuestion: 'Where do we find users?',
    formula: 'Channel [N]: [name], CAC: $[X], specifics: [Y]',
    example: 'Fitness B2C: Instagram Reels CAC $2-4, TikTok CAC $1-3. Timing: January +300%',
    aiHelpers: ['phoenix'],
    cardType: 'both',
    fields: [
      { name: 'channels_list', label: 'Acquisition Channels', type: 'textarea', placeholder: 'List channels and strategy for each', required: true },
      { name: 'cac_per_channel', label: 'CAC Estimates', type: 'text', placeholder: 'e.g., Instagram $2-4, TikTok $1-3', required: true },
      { name: 'best_timing', label: 'Best Timing', type: 'text', placeholder: 'When to focus on each channel', required: false },
      { name: 'creative_tips', label: 'Creative/Content Tips', type: 'textarea', placeholder: 'What content works best?', required: false }
    ]
  },
  {
    id: 'viral',
    slot: 21,
    phase: 'grow',
    title: 'VIRAL',
    coreQuestion: 'How do users bring others?',
    formula: 'Trigger: [X] → Action: [Y] → Result: K-factor [Z]',
    example: 'Achievement Sharing: achievement → beautiful card → Stories. K=0.3',
    aiHelpers: ['phoenix', 'virgilia'],
    cardType: 'both',
    fields: [
      { name: 'trigger_moment', label: 'Trigger Moment', type: 'textarea', placeholder: 'What triggers sharing?', required: true },
      { name: 'share_mechanic', label: 'Share Mechanic', type: 'textarea', placeholder: 'How does sharing work?', required: true },
      { name: 'k_factor_benchmark', label: 'Expected K-factor', type: 'text', placeholder: 'e.g., 0.3 (30% bring 1 friend)', required: true },
      { name: 'examples', label: 'Examples from Similar Products', type: 'textarea', placeholder: 'What works in similar apps?', required: false }
    ]
  },
  {
    id: 'metrics',
    slot: 22,
    phase: 'grow',
    title: 'METRICS',
    coreQuestion: 'How do we measure success?',
    formula: 'North Star: [X]. Benchmarks: D1 [Y%], D7 [Z%], D30 [W%]',
    example: 'Fitness Apps: North Star = workouts/week. D30 retention 15%+',
    aiHelpers: ['prisma', 'techpriest'],
    cardType: 'both',
    fields: [
      { name: 'north_star_metric', label: 'North Star Metric', type: 'text', placeholder: 'e.g., workouts per week', required: true },
      { name: 'healthy_user_definition', label: 'Healthy User Definition', type: 'textarea', placeholder: 'What defines an engaged user?', required: true },
      { name: 'retention_benchmarks', label: 'Retention Benchmarks', type: 'text', placeholder: 'e.g., D1: 40%, D7: 25%, D30: 15%', required: true },
      { name: 'activation_metric', label: 'Activation Metric', type: 'text', placeholder: 'What action = "activated"?', required: true }
    ]
  }
];

export const getCardsByPhase = (phase: CardPhase): CardDefinition[] => {
  return CARD_DEFINITIONS.filter(card => card.phase === phase);
};

export const getCardBySlot = (slot: number): CardDefinition | undefined => {
  return CARD_DEFINITIONS.find(card => card.slot === slot);
};

export const isCardComplete = (cardData: any, definition: CardDefinition): boolean => {
  if (!cardData) return false;
  
  const requiredFields = definition.fields.filter(f => f.required);
  return requiredFields.every(field => {
    const value = cardData[field.name];
    return value !== undefined && value !== null && value !== '';
  });
};
