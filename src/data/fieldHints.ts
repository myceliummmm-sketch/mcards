import type { CardDefinition } from './cardDefinitions';

export interface FieldGuidance {
  questionTitle: string;
  hints: string[];
  example: string;
  validationTip: string;
  aiHelper: string;
}

export const FIELD_GUIDANCE: Record<string, FieldGuidance> = {
  // PRODUCT card
  product_name: {
    questionTitle: 'What should we call this product?',
    hints: [
      'Keep it short and memorable (1-2 words)',
      'Should hint at what it does or who it\'s for',
      'Avoid generic tech suffixes like "App" or "Tech"'
    ],
    example: 'FitAI, MealMate, CodeCoach',
    validationTip: 'Good product names are memorable and suggestive',
    aiHelper: 'evergreen'
  },
  analogy: {
    questionTitle: 'What existing product is this similar to?',
    hints: [
      'Choose something widely known',
      'Should capture the core mechanic or value',
      'The best analogies create instant understanding'
    ],
    example: 'Duolingo (gamified learning), Uber (on-demand service)',
    validationTip: 'Your audience must know this reference',
    aiHelper: 'evergreen'
  },
  target_audience: {
    questionTitle: 'Who is this for?',
    hints: [
      'Be specific: "busy professionals" not just "people"',
      'Include a defining characteristic or behavior',
      'Think: Who would actually pay for this?'
    ],
    example: 'Working parents who commute daily, Freelance designers aged 25-40',
    validationTip: 'Specificity beats broad appeal at this stage',
    aiHelper: 'prisma'
  },
  one_liner: {
    questionTitle: 'Combine it all into one powerful sentence',
    hints: [
      'Use the formula: [Product] is [Analogy] for [Audience]',
      'Should be tweetable (under 280 characters)',
      'This is your elevator pitch'
    ],
    example: 'FitAI is Duolingo for busy professionals who want to stay fit',
    validationTip: 'Should make someone say "Oh, I get it!"',
    aiHelper: 'phoenix'
  },

  // PROBLEM card
  who_suffers: {
    questionTitle: 'Who specifically experiences this pain?',
    hints: [
      'Name the exact group: job title, life stage, or role',
      'Avoid vague terms like "users" or "people"',
      'The more specific, the more credible'
    ],
    example: 'Freelance designers, Solo entrepreneurs, Remote workers',
    validationTip: 'You should be able to find these people on LinkedIn',
    aiHelper: 'prisma'
  },
  pain_description: {
    questionTitle: 'What exactly is the problem they face?',
    hints: [
      'Describe the actual painful experience',
      'Use emotional language: frustrated, stressed, overwhelmed',
      'Focus on the symptom they feel daily'
    ],
    example: 'They spend 3+ hours each week chasing late payments, causing stress and cash flow issues',
    validationTip: 'Should make the reader wince in recognition',
    aiHelper: 'toxic'
  },
  root_cause: {
    questionTitle: 'Why does this problem exist?',
    hints: [
      'Look for the systemic reason, not just symptoms',
      'Often it\'s a missing tool, broken process, or outdated behavior',
      'Think: What would need to change to fix this?'
    ],
    example: 'No automated system to track invoices and send reminders',
    validationTip: 'The root cause reveals the solution space',
    aiHelper: 'toxic'
  },
  pain_cost: {
    questionTitle: 'What does this problem cost them?',
    hints: [
      'Quantify in money, time, or emotional burden',
      'Be specific: "$500/year" beats "a lot of money"',
      'Multiple costs are more convincing'
    ],
    example: '$2,400/year in lost income, 150 hours annually, constant anxiety',
    validationTip: 'The bigger and more specific the cost, the stronger the case',
    aiHelper: 'prisma'
  },
  data_source: {
    questionTitle: 'How do you know this is real?',
    hints: [
      'Survey data, user interviews, market research',
      'Personal experience counts if you were in this group',
      'Competitors\' customer reviews are gold'
    ],
    example: 'Survey of 500 freelancers, Reddit analysis of r/freelance',
    validationTip: 'Data builds credibility, guesses don\'t',
    aiHelper: 'prisma'
  },

  // AUDIENCE card
  demographics: {
    questionTitle: 'Who are they in demographic terms?',
    hints: [
      'Age range, location, profession, income level',
      'Education level if relevant',
      'Don\'t guess - base this on real data'
    ],
    example: 'Women 28-40, urban areas, $60k-120k household income',
    validationTip: 'Demographics help with targeting and pricing',
    aiHelper: 'prisma'
  },
  behaviors: {
    questionTitle: 'What do they actually do?',
    hints: [
      'Daily routines, tool preferences, spending habits',
      'Where they hang out online and offline',
      'How they currently solve similar problems'
    ],
    example: 'Use fitness apps but rarely stick past week 2, check phone before bed',
    validationTip: 'Behaviors reveal distribution channels',
    aiHelper: 'prisma'
  },
  goals: {
    questionTitle: 'What are they trying to achieve?',
    hints: [
      'Both immediate and long-term goals',
      'Career, lifestyle, identity goals',
      'The "why" behind their behavior'
    ],
    example: 'Want to feel confident at work presentations, aspire to leadership roles',
    validationTip: 'Goals connect to your value proposition',
    aiHelper: 'evergreen'
  },
  pain_points: {
    questionTitle: 'What frustrates them daily?',
    hints: [
      'What makes them complain to friends?',
      'Where do existing solutions fall short?',
      'What keeps them up at night?'
    ],
    example: 'Feeling judged when speaking up, wasting time in unproductive meetings',
    validationTip: 'Pain points are where your features should aim',
    aiHelper: 'toxic'
  },
  purchase_triggers: {
    questionTitle: 'What makes them finally buy?',
    hints: [
      'Urgency: deadline, event, life change',
      'Social proof: friend recommendation, reviews',
      'Emotion: fear of missing out, desire for status'
    ],
    example: 'Upcoming job interview, colleague\'s success story, annual review season',
    validationTip: 'Triggers inform your marketing timing and messaging',
    aiHelper: 'phoenix'
  },

  // VALUE card
  current_alternative: {
    questionTitle: 'What do they use now?',
    hints: [
      'Could be a product, service, or manual process',
      'Include "do nothing" if that\'s the real alternative',
      'This is your competitive benchmark'
    ],
    example: 'Personal trainer, YouTube videos, or just not exercising',
    validationTip: 'You must beat this on cost, quality, or convenience',
    aiHelper: 'toxic'
  },
  alternative_cost: {
    questionTitle: 'What does the current alternative cost?',
    hints: [
      'Include time cost, not just money',
      'Hidden costs matter: commute time, subscription bundles',
      'DIY solutions have real costs too'
    ],
    example: '$100/hour for trainer, 5 hours/week searching YouTube',
    validationTip: 'Your pricing needs to beat this value equation',
    aiHelper: 'prisma'
  },
  your_solution: {
    questionTitle: 'What makes your approach better?',
    hints: [
      'Focus on the transformation, not just features',
      'Cheaper + faster + better - pick your advantage',
      'What can you do that alternatives can\'t?'
    ],
    example: 'AI-powered personalized workouts that adapt daily, no commute',
    validationTip: 'This must clearly beat the alternative on something important',
    aiHelper: 'evergreen'
  },
  your_price: {
    questionTitle: 'What will you charge?',
    hints: [
      'Be realistic based on alternative pricing',
      'Consider subscription vs one-time pricing',
      'Leave room for growth and tiers'
    ],
    example: '$19/month, $199/year, $9.99/month starter tier',
    validationTip: 'Pricing validates your value proposition',
    aiHelper: 'phoenix'
  },

  // VISION card
  vision_statement: {
    questionTitle: 'What world are you creating?',
    hints: [
      'Think 5-10 years out',
      'Bigger than your product - a movement or change',
      'Should inspire your team and customers'
    ],
    example: 'A world where anyone can become a confident public speaker',
    validationTip: 'Great visions are ambitious but believable',
    aiHelper: 'evergreen'
  },
  who_benefits: {
    questionTitle: 'Who wins in this new world?',
    hints: [
      'Could be broader than your initial audience',
      'Ripple effects: who else benefits indirectly?',
      'Think ecosystem, not just users'
    ],
    example: 'Everyone from students to CEOs, teams with better communication',
    validationTip: 'Broader benefit = bigger market potential',
    aiHelper: 'evergreen'
  },
  what_becomes_possible: {
    questionTitle: 'What can people do now that they couldn\'t before?',
    hints: [
      'New capabilities or opportunities',
      'Democratization: access for previously excluded groups',
      'Time/money freed up for other pursuits'
    ],
    example: 'Anyone can give a TED-quality presentation without years of practice',
    validationTip: 'This is your aspirational marketing message',
    aiHelper: 'virgilia'
  },
  barrier_removed: {
    questionTitle: 'What barrier are you eliminating?',
    hints: [
      'Cost, time, expertise, access, fear',
      'Physical or psychological barriers',
      'The "because I can\'t [X]" statement'
    ],
    example: 'Cost of coaching, time to practice, fear of judgment',
    validationTip: 'Removing barriers = expanding your market',
    aiHelper: 'evergreen'
  }
};

// Helper function to get guidance for a field
export function getFieldGuidance(fieldName: string): FieldGuidance | undefined {
  return FIELD_GUIDANCE[fieldName];
}

// Helper function to get AI character for a field
export function getFieldAIHelper(fieldName: string, definition: CardDefinition): string {
  const guidance = FIELD_GUIDANCE[fieldName];
  return guidance?.aiHelper || definition.aiHelpers[0];
}