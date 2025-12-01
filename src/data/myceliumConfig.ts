// Mycelium Card Prompt System Configuration
// Based on technical documentation v1.0

export const PHASE_COLORS = {
  vision: { name: 'mint green', hex: '#64FFDA' },
  research: { name: 'deep teal', hex: '#0D4F4F' },
  build: { name: 'warm coral', hex: '#FF8A80' },
  grow: { name: 'electric violet', hex: '#9D4EDD' },
  authentic: { name: 'earth brown', hex: '#8B7355' }
} as const;

export const ACCENT_COLORS = {
  gold: '#FFD700',        // value, light, success
  coral_pink: '#FF6B9D',  // life, emotion, resonance
  cyan: '#00E5FF'         // energy, data, flow
} as const;

// 162-form library organized by category
export const FORM_LIBRARY = {
  geometric: [
    'sphere', 'cube', 'pyramid', 'icosahedron', 'octahedron', 
    'dodecahedron', 'tetrahedron', 'prism', 'torus'
  ],
  crystals: [
    'crystal', 'crystalline cluster', 'obelisk', 'quartz formation', 'shards'
  ],
  architectural: [
    'arch', 'column', 'steps', 'bridge', 'tower', 'gate', 'platform'
  ],
  organic: [
    'seed', 'leaf', 'branch', 'root system', 'flower', 'shell', 
    'feather', 'egg', 'cocoon', 'butterfly'
  ],
  cosmic: [
    'star', 'comet', 'ringed planet', 'black hole', 'nebula clusters', 
    'asteroid', 'constellation'
  ],
  symbolic: [
    'key', 'lock', 'mirror', 'mask', 'crown', 'compass', 'hourglass', 
    'scales', 'shield', 'blade', 'chalice', 'scroll'
  ],
  abstract_human: [
    'hand silhouette', 'eye symbol', 'heart form', 'pair of wings', 'head silhouette'
  ],
  states: [
    'explosion', 'vortex', 'wave', 'spiral', 'crack', 'bubble', 
    'droplet', 'lightning', 'flame', 'ice formation'
  ],
  connectors: [
    'thread', 'chain', 'ribbon', 'beam', 'light bridge', 
    'root connections', 'orbital rings'
  ],
  mechanical: [
    'gear', 'spring', 'piston', 'bolt', 'flywheel', 'valve', 
    'antenna', 'radar dish', 'turbine', 'pendulum'
  ],
  fluids: [
    'waterfall', 'fountain', 'whirlpool', 'river', 'lake', 
    'rain', 'fog', 'cloud', 'steam', 'tsunami'
  ],
  musical: [
    'sound wave', 'tuning fork', 'bell', 'drum', 'string', 
    'note', 'equalizer bars', 'speaker cone', 'echo ripples', 'silence void'
  ],
  natural_phenomena: [
    'rainbow arc', 'aurora', 'eclipse', 'sunrise', 'sunset', 
    'storm', 'tornado', 'volcano', 'earthquake crack', 'avalanche'
  ],
  informational: [
    'network graph', 'decision tree', 'venn diagram', 'pyramid chart', 
    'mind map', 'timeline', 'funnel', 'pie chart', 'pulse line', 'qr pattern'
  ],
  navigation: [
    'lighthouse', 'anchor', 'sail', 'helm wheel', 'flag', 
    'crossroads', 'labyrinth', 'treasure map', 'telescope', 'footprint trail'
  ],
  gaming: [
    'dice', 'cards', 'chess piece', 'target', 'trophy', 
    'medal', 'puzzle piece', 'domino', 'roulette', 'joystick'
  ],
  protective: [
    'fortress', 'barrier', 'helmet', 'armor plate', 'bow and arrow', 
    'catapult', 'battering ram', 'watchtower', 'moat', 'banner'
  ],
  spiritual: [
    'mandala', 'yin yang', 'third eye', 'chakra', 'aura field', 
    'totem', 'rune', 'lotus', 'tree of life', 'infinity symbol'
  ],
  transformational: [
    'phoenix', 'metamorphosis cocoon', 'alchemy symbol', 'melting form', 
    'assembly', 'disassembly', 'mutation', 'fusion', 'division', 'portal'
  ]
} as const;

// Keyword-to-forms mapping for dynamic form selection
export const KEYWORD_TO_FORMS: Record<string, string[]> = {
  idea: ['sphere', 'seed', 'star', 'droplet', 'crystal'],
  stability: ['cube', 'column', 'anchor', 'root system', 'platform'],
  growth: ['pyramid', 'branch', 'comet', 'steps', 'spiral'],
  connection: ['bridge', 'thread', 'network graph', 'constellation', 'root connections'],
  protection: ['shield', 'fortress', 'shell', 'cocoon', 'helmet'],
  time: ['hourglass', 'pendulum', 'comet', 'pulse line', 'river'],
  urgency: ['lightning', 'comet', 'flame', 'explosion'],
  choice: ['crossroads', 'scales', 'branch', 'decision tree', 'compass'],
  change: ['butterfly', 'phoenix', 'portal', 'cocoon', 'metamorphosis cocoon'],
  pain: ['crack', 'shards', 'ice formation', 'chain', 'barrier'],
  dream: ['star', 'lighthouse', 'flag', 'crown', 'aurora'],
  sound: ['note', 'sound wave', 'bell', 'echo ripples', 'tuning fork'],
  data: ['network graph', 'pyramid chart', 'mind map', 'decision tree']
};

// 23 Card Templates (Mycelium system)
export const CARD_TEMPLATES: Record<string, any> = {
  // PHASE: VISION (mint green #64FFDA)
  idea_seed: {
    id: 1,
    slot: 1,
    phase: 'vision',
    name_en: 'IDEA SEED',
    metaphor: 'The small contains the infinite',
    composition: 'straight front view',
    template: 'straight front view, flat mint green background #64FFDA, small glowing low-poly {FORM} floating in center with golden light pulsing inside revealing compressed potential, massive shadow projected behind it showing {FUTURE_SCALE}, single {CONNECTOR} descending toward it, the small contains the infinite, low-poly 3D style with visible facets, inner glow effect, 8k render'
  },
  
  pain_point: {
    id: 2,
    slot: 2,
    phase: 'vision',
    name_en: 'PAIN POINT',
    metaphor: 'Darkness shows where to bring light',
    composition: 'straight front view',
    template: 'straight front view, flat mint green background #64FFDA, dark cracked low-poly {FORM} floating in center, warm golden light beam from above touching the form and illuminating cracks with gold kintsugi effect, where light touches darkness begins transforming, {PAIN_VISUAL}, the wound becomes the guide, low-poly 3D style, dramatic contrast, 8k render'
  },
  
  true_user: {
    id: 3,
    slot: 3,
    phase: 'vision',
    name_en: 'TRUE USER',
    metaphor: 'In infinity one flickers in your rhythm',
    composition: 'straight front view',
    template: 'straight front view, flat mint green background #64FFDA, vast field of countless dim particles fading into fog, one single {FORM} in sharp focus glowing intensely with coral inner light #FF6B9D, {PERSON_DETAILS}, surrounded by countless others dim and distant, recognition is resonance, low-poly 3D style, 8k render'
  },
  
  success_signal: {
    id: 4,
    slot: 4,
    phase: 'vision',
    name_en: 'SUCCESS SIGNAL',
    metaphor: 'True growth measured by depth of glow',
    composition: 'straight front view',
    template: 'straight front view, flat mint green background #64FFDA, glowing scales showing measurement of light, large dim mass on left side versus small intensely luminescent core on right, {SUCCESS_METRIC}, the balance tips toward brighter smaller side, intensity over size, low-poly 3D style, 8k render'
  },
  
  strange_gift: {
    id: 5,
    slot: 5,
    phase: 'vision',
    name_en: 'STRANGE GIFT',
    metaphor: 'One mutated and changed the spectrum',
    composition: 'straight front view',
    template: 'straight front view, flat mint green background #64FFDA, grid of identical dim low-poly forms stretching into fog, one unique {FORM} mutation cracked open radiating golden frequency, {UNIQUE_TRAIT}, nearby identical forms begin awakening to new frequency, difference creates possibility, low-poly 3D style, 8k render'
  },
  
  // PHASE: RESEARCH (deep teal #0D4F4F)
  footprints: {
    id: 6,
    slot: 6,
    phase: 'research',
    name_en: 'FOOTPRINTS',
    metaphor: 'Every traveler leaves glowing traces',
    composition: 'slight top down view',
    template: 'slight top down view, flat deep teal background #0D4F4F, terrain showing multiple glowing trail patterns, {COMPETITOR_PATHS}, paths cross and overlap, some lead to dead ends fading, successful paths glow stronger, ghost traces of failed attempts visible, learn from others journeys, low-poly 3D style, 8k render'
  },
  
  territory: {
    id: 7,
    slot: 7,
    phase: 'research',
    name_en: 'TERRITORY',
    metaphor: 'Living map pulses with opportunities',
    composition: 'slight top down view',
    template: 'slight top down view, flat deep teal background #0D4F4F, living topographic low-poly landscape map floating in space, {MARKET_ZONES}, different regions pulse with varying intensity, one zone blazes brightest with golden light marking opportunity, low-poly 3D style, 8k render'
  },
  
  hidden_truth: {
    id: 8,
    slot: 8,
    phase: 'research',
    name_en: 'HIDDEN TRUTH',
    metaphor: 'You see hologram of the unspoken',
    composition: 'straight front view',
    template: 'straight front view, flat deep teal background #0D4F4F, geometric silhouette with connection point at core, holographic projection expands outward showing fragments of inner world needs desires fears, {USER_INSIGHT}, intimacy of seeing unspoken truth, teal base with coral emotion accents, low-poly 3D style, 8k render'
  },
  
  dark_zones: {
    id: 9,
    slot: 9,
    phase: 'research',
    name_en: 'DARK ZONES',
    metaphor: 'Network senses toxins before you see them',
    composition: 'straight front view',
    template: 'straight front view, flat deep teal background #0D4F4F, glowing path leading forward through darkness, main path pulses healthy cyan light, {RISK_PATHS}, at edges warning amber glow reveals some side paths dim completely as dead ends, sensing tendril tests darkness ahead, low-poly 3D style, noir contrast, 8k render'
  },
  
  sweet_spot: {
    id: 10,
    slot: 10,
    phase: 'research',
    name_en: 'SWEET SPOT',
    metaphor: 'Where three rivers meet new life is born',
    composition: 'straight front view',
    template: 'straight front view, flat deep teal background #0D4F4F, three distinct streams flowing from different directions, first stream coral {PASSION}, second stream cyan {SKILL}, third stream gold {NEED}, where all three meet brilliant starburst new form is born, energy spiral at convergence, low-poly 3D style, 8k render'
  },
  
  insight_wild: {
    id: 11,
    slot: 11,
    phase: 'research',
    name_en: 'INSIGHT',
    metaphor: 'Knowledge crystallizes into form',
    composition: 'straight front view',
    template: 'straight front view, flat deep teal background #0D4F4F, floating crystalline {FORM} containing compressed knowledge, {INSIGHT_DATA}, golden data streams flowing into crystal, light refracts revealing inner structure, discovery made visible, low-poly 3D style, 8k render'
  },
  
  // PHASE: BUILD (warm coral #FF8A80)
  tool_stack: {
    id: 12,
    slot: 12,
    phase: 'build',
    name_en: 'TOOL STACK',
    metaphor: 'Right symbionts amplify each other',
    composition: 'straight front view',
    template: 'straight front view, flat warm coral background #FF8A80, vertical structure of different low-poly symbiotic forms stacked and growing into each other, {TECH_FORMS}, compatible parts glow golden at connections, energy flows through joints, some junctions spark with exchange, low-poly 3D style, 8k render'
  },
  
  first_fruit: {
    id: 13,
    slot: 13,
    phase: 'build',
    name_en: 'FIRST FRUIT',
    metaphor: 'First fruit must carry living seeds',
    composition: 'straight front view',
    template: 'straight front view, flat warm coral background #FF8A80, rough asymmetrical low-poly fruit form with imperfect exterior, cut cross-section reveals perfectly formed luminescent golden seed core, {MVP_ELEMENTS}, essence over appearance, low-poly 3D style, 8k render'
  },
  
  user_path: {
    id: 14,
    slot: 14,
    phase: 'build',
    name_en: 'USER PATH',
    metaphor: 'Light guides itself no signs needed',
    composition: 'three quarter view',
    template: 'three quarter view, flat warm coral background #FF8A80, luminescent pathway through organic tunnel, path glows warmly guiding forward, small geometric traveler form moves through, {PATH_STAGES}, at junctions right path glows brighter, friction-free flow, low-poly 3D style, 8k render'
  },
  
  invisible_skeleton: {
    id: 15,
    slot: 15,
    phase: 'build',
    name_en: 'INVISIBLE SKELETON',
    metaphor: 'Skeleton invisible but defines possibilities',
    composition: 'straight front view',
    template: 'straight front view, flat warm coral background #FF8A80, x-ray vision through organism revealing bioluminescent skeletal wireframe, {DATA_STRUCTURE}, every capability traces to skeletal support, the invisible architecture enabling visible function, low-poly 3D style, 8k render'
  },
  
  vital_organ: {
    id: 16,
    slot: 16,
    phase: 'build',
    name_en: 'VITAL ORGAN',
    metaphor: 'One organ without which there is no survival',
    composition: 'straight front view',
    template: 'straight front view, flat warm coral background #FF8A80, transparent organism with one blazing golden core organ, {CORE_FUNCTION}, all other parts dim in comparison, energy radiates from vital center, remove this and system dies, low-poly 3D style, 8k render'
  },
  
  launch_gate: {
    id: 17,
    slot: 17,
    phase: 'build',
    name_en: 'LAUNCH GATE',
    metaphor: 'All indicators green membrane thins',
    composition: 'straight front view',
    template: 'straight front view, split background coral left violet right, massive low-poly gateway portal in center between two worlds, indicator lights glow mint green signaling readiness, {CHECKLIST_INDICATORS}, small geometric form at threshold about to pass through membrane, point of no return, low-poly 3D style, 8k render'
  },
  
  // PHASE: GROW (electric violet #9D4EDD)
  landing_zone: {
    id: 18,
    slot: 18,
    phase: 'grow',
    name_en: 'LANDING ZONE',
    metaphor: 'Find perfect soil and saturate it completely',
    composition: 'slight top down view',
    template: 'slight top down view, flat electric violet background #9D4EDD, vast terrain map with many zones most dim, one zone blazes with perfect golden match representing {CHANNEL}, concentrated beam of particles launches at optimal zone, {CHANNEL_DETAILS}, precision over scatter, low-poly 3D style, 8k render'
  },
  
  value_exchange: {
    id: 19,
    slot: 19,
    phase: 'grow',
    name_en: 'VALUE EXCHANGE',
    metaphor: 'Healthy organism radiates surplus as gift',
    composition: 'straight front view',
    template: 'straight front view, flat electric violet background #9D4EDD, thriving organism radiating golden energy outward, {MONETIZATION_MODEL}, fed forms return violet resources, perpetual exchange cycle, giving creates receiving, sparks where streams cross, low-poly 3D style, 8k render'
  },
  
  founding_tribe: {
    id: 20,
    slot: 20,
    phase: 'grow',
    name_en: 'FOUNDING TRIBE',
    metaphor: 'First hundred constellation forming galaxy',
    composition: 'straight front view',
    template: 'straight front view, flat electric violet background #9D4EDD, approximately dozen unique star forms in formation, each glows different hue representing {FIRST_USERS}, together form new constellation, golden threads connecting, this is founding tribe not crowd, low-poly 3D style, 8k render'
  },
  
  feedback_pulse: {
    id: 21,
    slot: 21,
    phase: 'grow',
    name_en: 'FEEDBACK PULSE',
    metaphor: 'Information flows from edges to center and back',
    composition: 'straight front view',
    template: 'straight front view, flat electric violet background #9D4EDD, circular network with central core, violet light flows outward, returns as golden enriched signal, {FEEDBACK_MECHANISM}, each cycle network grows brighter, send receive learn adapt, low-poly 3D style, 8k render'
  },
  
  fractal_growth: {
    id: 22,
    slot: 22,
    phase: 'grow',
    name_en: 'FRACTAL GROWTH',
    metaphor: 'Scale distributed growth everywhere',
    composition: 'straight front view',
    template: 'straight front view, flat electric violet background #9D4EDD, fractal network expanding in self-similar pattern, each node contains same golden core code, {SCALE_STRUCTURE}, nodes multiply by replication not central effort, distributed intelligence, low-poly 3D style, 8k render'
  },
  
  // PHASE: AUTHENTIC (earth brown #8B7355) - not used in current deck structure
  golden_scars: {
    id: 23,
    slot: 23,
    phase: 'authentic',
    name_en: 'GOLDEN SCARS',
    metaphor: 'Scars glow gold vulnerability is strength',
    composition: 'straight front view',
    template: 'straight front view, flat earth brown background #8B7355 with warm undertones, intimate sacred space, low-poly {FORM} showing beautiful cracks, golden light fills every crack transforming wounds into art, {VULNERABILITY_VISUAL}, small witness form observes with compassion, vulnerability becomes strength, kintsugi philosophy, low-poly 3D style, 8k render'
  }
};

// Mapping from card slot numbers to Mycelium templates
export const SLOT_TO_TEMPLATE: Record<number, string> = {
  1: 'idea_seed',
  2: 'pain_point',
  3: 'true_user',
  4: 'success_signal',
  5: 'strange_gift',
  6: 'footprints',
  7: 'territory',
  8: 'hidden_truth',
  9: 'dark_zones',
  10: 'sweet_spot',
  11: 'insight_wild',
  12: 'tool_stack',
  13: 'first_fruit',
  14: 'user_path',
  15: 'invisible_skeleton',
  16: 'vital_organ',
  17: 'launch_gate',
  18: 'landing_zone',
  19: 'value_exchange',
  20: 'founding_tribe',
  21: 'feedback_pulse',
  22: 'fractal_growth'
};

// Protection suffix (mandatory for all prompts)
export const PROTECTION_SUFFIX = '--no text, letters, numbers, words, typography, writing, human faces, human figures, people, person, character, anime, cartoon, photorealistic, lens flare, god rays, smoke swirls, generic glow orbs, floating particles cliche, purple-blue nebula, abstract swooshes, stock imagery, corporate art, gradient mesh blobs, pastel colors, blurry edges, vaporwave';

// Forbidden elements for validation
export const FORBIDDEN_ELEMENTS = [
  // People
  'face', 'person', 'human', 'man', 'woman', 'child', 'figure', 
  'portrait', 'character', 'people', 'crowd',
  // Text
  'text', 'letter', 'word', 'writing', 'typography', 'font', 
  'number', 'digit', 'label', 'sign',
  // Styles
  'anime', 'cartoon', 'realistic', 'photorealistic', '3d render smooth', 
  'cinematic', 'dramatic lighting', 'lens flare',
  // AI clichés
  'nebula', 'galaxy swirl', 'energy orb', 'magic particles', 
  'ethereal glow', 'mystical', 'cosmic dust', 'aurora borealis', 
  'light rays', 'god rays', 'volumetric light'
];

// Helper functions
export const selectForm = (userAnswer: string): string => {
  const words = userAnswer.toLowerCase();
  
  // Check keywords in priority order
  for (const [keyword, forms] of Object.entries(KEYWORD_TO_FORMS)) {
    if (words.includes(keyword)) {
      return forms[Math.floor(Math.random() * forms.length)];
    }
  }
  
  // Default fallback
  return 'sphere';
};

export const validatePrompt = (prompt: string): { valid: boolean; violations: string[] } => {
  const lower = prompt.toLowerCase();
  const violations = FORBIDDEN_ELEMENTS.filter(word => lower.includes(word));
  return { valid: violations.length === 0, violations };
};

export const extractDetails = (cardContent: any, templateKey: string): Record<string, string> => {
  // Extract relevant details from card content based on template
  const contentStr = JSON.stringify(cardContent).toLowerCase();
  
  const details: Record<string, string> = {
    FUTURE_SCALE: 'enormous shadow suggesting vast potential',
    CONNECTOR: 'golden thread',
    PAIN_VISUAL: 'cracks spreading like roots',
    PERSON_DETAILS: 'unique resonance pattern',
    SUCCESS_METRIC: 'glowing intensity measurement',
    UNIQUE_TRAIT: 'mutation radiating new frequency',
    COMPETITOR_PATHS: 'intersecting trails of varying brightness',
    MARKET_ZONES: 'topographic regions with different luminosity',
    USER_INSIGHT: 'holographic fragments of hidden needs',
    RISK_PATHS: 'dimming trails leading to darkness',
    PASSION: 'coral stream flowing with warmth',
    SKILL: 'cyan stream pulsing with precision',
    NEED: 'golden stream carrying weight',
    INSIGHT_DATA: 'compressed knowledge streams',
    TECH_FORMS: 'stacked geometric components',
    MVP_ELEMENTS: 'essential seed core',
    PATH_STAGES: 'luminous waypoints',
    DATA_STRUCTURE: 'bioluminescent wireframe skeleton',
    CORE_FUNCTION: 'blazing central organ',
    CHECKLIST_INDICATORS: 'mint green ready signals',
    CHANNEL: 'optimal territory zone',
    CHANNEL_DETAILS: 'concentrated energy beam',
    MONETIZATION_MODEL: 'reciprocal energy exchange',
    FIRST_USERS: 'diverse constellation points',
    FEEDBACK_MECHANISM: 'circular pulse network',
    SCALE_STRUCTURE: 'self-similar fractal nodes',
    VULNERABILITY_VISUAL: 'golden kintsugi cracks'
  };
  
  return details;
};
