/**
 * Strict TypeScript interfaces for all card data types
 * Based on CARD_DEFINITIONS in src/data/cardDefinitions.ts
 */

// ============= VISION/IDEA PHASE (slots 1-5) =============

/** Slot 1: Product Card */
export interface ProductCardData {
  product_name: string;
  analogy: string;
  target_audience: string;
  one_liner: string;
}

/** Slot 2: Problem Card */
export interface ProblemCardData {
  pain_description: string;
  root_cause: string;
  who_suffers: string;
  pain_cost: string;
  data_source?: string;
}

/** Slot 3: Audience Card */
export interface AudienceCardData {
  demographics: string;
  behaviors: string;
  pain_points: string;
  goals: string;
  active_hours?: string;
  purchase_triggers?: string;
}

/** Slot 4: Value Card */
export interface ValueCardData {
  current_alternative: string;
  alternative_cost: string;
  your_solution: string;
  your_price: string;
  roi_multiple?: string;
}

/** Slot 5: Vision Card */
export interface VisionCardData {
  vision_statement: string;
  what_becomes_possible: string;
  barrier_removed: string;
  who_benefits: string;
}

// ============= RESEARCH PHASE (slots 6-10) =============

/** Slot 6: Market Map Card */
export interface MarketMapCardData {
  market_size?: string;
  key_players?: string;
  market_trends?: string;
  our_position?: string;
}

/** Slot 7: Competitors Card */
export interface CompetitorsCardData {
  direct_competitors?: string;
  indirect_competitors?: string;
  competitor_weaknesses?: string;
  differentiation_opportunities?: string;
}

/** Slot 8: User Insights Card */
export interface UserInsightsCardData {
  user_needs?: string;
  pain_points?: string;
  user_quotes?: string;
  unmet_needs?: string;
}

/** Slot 9: Risk Map Card */
export interface RiskMapCardData {
  market_risks?: string;
  tech_risks?: string;
  competition_risks?: string;
  mitigation_strategies?: string;
}

/** Slot 10: Opportunity Card */
export interface OpportunityCardData {
  tam?: string;
  sam?: string;
  som?: string;
  growth_rate?: string;
  entry_strategy?: string;
}

// ============= BUILD PHASE (slots 11-15) =============

/** Slot 11: Features Card */
export interface FeaturesCardData {
  basic_features: string;
  key_features: string;
  monetization_features?: string;
  engagement_features?: string;
  tech_validation?: string;
}

/** Slot 12: User Path Card */
export interface UserPathCardData {
  step_1_entry: string;
  step_2_input: string;
  step_3_magic: string;
  step_4_value: string;
  step_5_return: string;
}

/** Slot 13: Screens Card */
export interface ScreensCardData {
  onboarding_screens: string;
  main_screens: string;
  result_screens: string;
  profile_screens?: string;
  ux_notes?: string;
}

/** Slot 14: Style Card */
export interface StyleCardData {
  theme: 'Light' | 'Dark' | 'Auto' | string;
  mood: 'Playful' | 'Premium' | 'Strict' | 'Warm' | string;
  reference_apps: string;
  primary_color: string;
  accent_color: string;
  style_reasoning?: string;
}

/** Slot 15: Summary Card */
export interface SummaryCardData {
  app_name: string;
  app_format: 'Mobile App (iOS + Android)' | 'Web Application' | 'Both (Mobile + Web)' | string;
  app_description: string;
  features_summary: string;
  screens_summary: string;
  style_summary: string;
  tech_stack?: string;
  build_quality_score?: string;
}

// ============= GROW PHASE (slots 16-20) =============

/** Slot 16: Pricing Card */
export interface PricingCardData {
  free_tier: string;
  pro_tier: string;
  pro_price: string;
  enterprise_tier?: string;
  pricing_strategy: 'Freemium' | 'Free Trial' | 'Pay-as-you-go' | 'Subscription' | 'One-time' | string;
}

/** Slot 17: Acquisition Card */
export interface AcquisitionCardData {
  primary_channel: string;
  secondary_channels: string;
  target_cac: string;
  expected_ltv: string;
  ltv_cac_ratio?: string;
}

/** Slot 18: Retention Card */
export interface RetentionCardData {
  hook_mechanism: string;
  habit_loop: string;
  target_d1: string;
  target_d7: string;
  target_d30: string;
}

/** Slot 19: Virality Card */
export interface ViralityCardData {
  viral_mechanic: string;
  share_trigger: string;
  target_k_factor?: string;
  cycle_time?: string;
}

/** Slot 20: Metrics Card */
export interface MetricsCardData {
  north_star: string;
  leading_metrics: string;
  lagging_metrics: string;
  measurement_cadence: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | string;
}

// ============= PIVOT PHASE (slots 21-25) =============

/** Slot 21: Signals Card */
export interface SignalsCardData {
  red_flags: string;
  thresholds: string;
  green_flags: string;
  review_cadence: 'Weekly' | 'Bi-weekly' | 'Monthly' | string;
}

/** Slot 22: Pivot Options Card */
export interface PivotOptionsCardData {
  option_1: string;
  option_1_trigger: string;
  option_2: string;
  option_2_trigger: string;
  option_3?: string;
}

/** Slot 23: Runway Card */
export interface RunwayCardData {
  current_runway: string;
  monthly_burn: string;
  extension_options: string;
  break_even_point?: string;
}

/** Slot 24: Kill Criteria Card */
export interface KillCriteriaCardData {
  kill_condition_1: string;
  kill_deadline_1: string;
  kill_condition_2?: string;
  kill_deadline_2?: string;
  graceful_shutdown: string;
}

/** Slot 25: Lessons Card */
export interface LessonsCardData {
  key_learnings: string;
  evidence: string;
  apply_forward: string;
  share_with?: string;
}

// ============= UNION TYPES AND MAPPINGS =============

/** Union of all card data types */
export type AllCardData =
  | ProductCardData
  | ProblemCardData
  | AudienceCardData
  | ValueCardData
  | VisionCardData
  | MarketMapCardData
  | CompetitorsCardData
  | UserInsightsCardData
  | RiskMapCardData
  | OpportunityCardData
  | FeaturesCardData
  | UserPathCardData
  | ScreensCardData
  | StyleCardData
  | SummaryCardData
  | PricingCardData
  | AcquisitionCardData
  | RetentionCardData
  | ViralityCardData
  | MetricsCardData
  | SignalsCardData
  | PivotOptionsCardData
  | RunwayCardData
  | KillCriteriaCardData
  | LessonsCardData;

/** Map from card slot number to its data type */
export interface CardDataMap {
  1: ProductCardData;
  2: ProblemCardData;
  3: AudienceCardData;
  4: ValueCardData;
  5: VisionCardData;
  6: MarketMapCardData;
  7: CompetitorsCardData;
  8: UserInsightsCardData;
  9: RiskMapCardData;
  10: OpportunityCardData;
  11: FeaturesCardData;
  12: UserPathCardData;
  13: ScreensCardData;
  14: StyleCardData;
  15: SummaryCardData;
  16: PricingCardData;
  17: AcquisitionCardData;
  18: RetentionCardData;
  19: ViralityCardData;
  20: MetricsCardData;
  21: SignalsCardData;
  22: PivotOptionsCardData;
  23: RunwayCardData;
  24: KillCriteriaCardData;
  25: LessonsCardData;
}

/** Valid card slot numbers */
export type CardSlot = keyof CardDataMap;

/** Get the card data type for a specific slot */
export type CardDataForSlot<S extends CardSlot> = CardDataMap[S];

// ============= PHASE GROUPINGS =============

/** Vision/Idea phase card data (slots 1-5) */
export type VisionPhaseCardData =
  | ProductCardData
  | ProblemCardData
  | AudienceCardData
  | ValueCardData
  | VisionCardData;

/** Research phase card data (slots 6-10) */
export type ResearchPhaseCardData =
  | MarketMapCardData
  | CompetitorsCardData
  | UserInsightsCardData
  | RiskMapCardData
  | OpportunityCardData;

/** Build phase card data (slots 11-15) */
export type BuildPhaseCardData =
  | FeaturesCardData
  | UserPathCardData
  | ScreensCardData
  | StyleCardData
  | SummaryCardData;

/** Grow phase card data (slots 16-20) */
export type GrowPhaseCardData =
  | PricingCardData
  | AcquisitionCardData
  | RetentionCardData
  | ViralityCardData
  | MetricsCardData;

/** Pivot phase card data (slots 21-25) */
export type PivotPhaseCardData =
  | SignalsCardData
  | PivotOptionsCardData
  | RunwayCardData
  | KillCriteriaCardData
  | LessonsCardData;

// ============= TYPE GUARDS =============

/** Required fields for each card slot */
const REQUIRED_FIELDS: Record<CardSlot, string[]> = {
  1: ['product_name', 'analogy', 'target_audience', 'one_liner'],
  2: ['pain_description', 'root_cause', 'who_suffers', 'pain_cost'],
  3: ['demographics', 'behaviors', 'pain_points', 'goals'],
  4: ['current_alternative', 'alternative_cost', 'your_solution', 'your_price'],
  5: ['vision_statement', 'what_becomes_possible', 'barrier_removed', 'who_benefits'],
  6: [], // Research cards have optional fields
  7: [],
  8: [],
  9: [],
  10: [],
  11: ['basic_features', 'key_features'],
  12: ['step_1_entry', 'step_2_input', 'step_3_magic', 'step_4_value', 'step_5_return'],
  13: ['onboarding_screens', 'main_screens', 'result_screens'],
  14: ['theme', 'mood', 'reference_apps', 'primary_color', 'accent_color'],
  15: ['app_name', 'app_format', 'app_description', 'features_summary', 'screens_summary', 'style_summary'],
  16: ['free_tier', 'pro_tier', 'pro_price', 'pricing_strategy'],
  17: ['primary_channel', 'secondary_channels', 'target_cac', 'expected_ltv'],
  18: ['hook_mechanism', 'habit_loop', 'target_d1', 'target_d7', 'target_d30'],
  19: ['viral_mechanic', 'share_trigger'],
  20: ['north_star', 'leading_metrics', 'lagging_metrics', 'measurement_cadence'],
  21: ['red_flags', 'thresholds', 'green_flags', 'review_cadence'],
  22: ['option_1', 'option_1_trigger', 'option_2', 'option_2_trigger'],
  23: ['current_runway', 'monthly_burn', 'extension_options'],
  24: ['kill_condition_1', 'kill_deadline_1', 'graceful_shutdown'],
  25: ['key_learnings', 'evidence', 'apply_forward'],
};

/**
 * Type guard to check if data conforms to a specific card slot's type
 * @param data - The card data to validate
 * @param slot - The card slot number (1-25)
 * @returns True if data has all required fields for the slot
 */
export function isCardDataOfType<S extends CardSlot>(
  data: unknown,
  slot: S
): data is CardDataMap[S] {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const requiredFields = REQUIRED_FIELDS[slot];
  const dataObj = data as Record<string, unknown>;

  return requiredFields.every(field => {
    const value = dataObj[field];
    return value !== undefined && value !== null && value !== '';
  });
}

/**
 * Check if a slot number is valid
 */
export function isValidCardSlot(slot: number): slot is CardSlot {
  return slot >= 1 && slot <= 25;
}

/**
 * Get required fields for a card slot
 */
export function getRequiredFieldsForSlot(slot: CardSlot): string[] {
  return REQUIRED_FIELDS[slot];
}

/**
 * Validate card data and return missing required fields
 */
export function getMissingRequiredFields(data: unknown, slot: CardSlot): string[] {
  if (!data || typeof data !== 'object') {
    return REQUIRED_FIELDS[slot];
  }

  const dataObj = data as Record<string, unknown>;
  return REQUIRED_FIELDS[slot].filter(field => {
    const value = dataObj[field];
    return value === undefined || value === null || value === '';
  });
}
