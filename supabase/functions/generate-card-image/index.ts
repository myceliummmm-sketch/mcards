import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ═══════════════════════════════════════
// PHASE COLORS
// ═══════════════════════════════════════
const PHASE_COLORS = {
  idea: { name: "mint green", hex: "#64FFDA" },
  research: { name: "deep teal", hex: "#0D4F4F" },
  build: { name: "warm coral", hex: "#FF8A80" },
  grow: { name: "electric violet", hex: "#9D4EDD" },
  authentic: { name: "earth brown", hex: "#8B7355" }
};

const ACCENT_COLORS = {
  gold: "#FFD700",
  coral_pink: "#FF6B9D",
  cyan: "#00E5FF"
};

// ═══════════════════════════════════════
// KEYWORD TO FORMS MAPPING
// ═══════════════════════════════════════
const KEYWORD_TO_FORMS: Record<string, string[]> = {
  idea: ["sphere", "seed", "star", "droplet", "crystal"],
  stability: ["cube", "column", "anchor", "root system", "platform"],
  growth: ["pyramid", "branch", "comet", "steps", "spiral"],
  connection: ["bridge", "thread", "network graph", "constellation", "root connections"],
  protection: ["shield", "fortress", "shell", "cocoon", "helmet"],
  time: ["hourglass", "pendulum", "comet", "pulse line", "river"],
  urgency: ["lightning", "comet", "flame", "explosion"],
  choice: ["crossroads", "scales", "branch", "decision tree", "compass"],
  change: ["butterfly", "phoenix", "portal", "cocoon", "metamorphosis cocoon"],
  pain: ["crack", "shards", "ice formation", "chain", "barrier"],
  dream: ["star", "lighthouse", "flag", "crown", "aurora"],
  sound: ["note", "sound wave", "bell", "echo ripples", "tuning fork"],
  data: ["network graph", "pyramid chart", "mind map", "decision tree"]
};

// ═══════════════════════════════════════
// FORM SELECTION
// ═══════════════════════════════════════
function selectForm(userAnswer: string): string {
  const words = userAnswer.toLowerCase();
  
  for (const [keyword, forms] of Object.entries(KEYWORD_TO_FORMS)) {
    if (words.includes(keyword)) {
      return forms[Math.floor(Math.random() * forms.length)];
    }
  }
  
  return 'sphere'; // default
}

// ═══════════════════════════════════════
// 23 CARD TEMPLATES
// ═══════════════════════════════════════
const CARD_TEMPLATES: Record<string, any> = {
  idea_seed: {
    id: 1,
    phase: "idea",
    name: "IDEA SEED",
    template: `straight front view, flat mint green background #64FFDA, small glowing low-poly {FORM} floating in center with golden light pulsing inside revealing compressed potential, massive shadow projected behind it showing {FUTURE_SCALE}, single {CONNECTOR} descending toward it, the small contains the infinite, low-poly 3D style with visible facets, inner glow effect, 8k render`
  },
  
  pain_point: {
    id: 2,
    phase: "idea",
    name: "PAIN POINT",
    template: `straight front view, flat mint green background #64FFDA, dark cracked low-poly {FORM} floating in center, warm golden light beam from above touching the form and illuminating cracks with gold kintsugi effect, where light touches darkness begins transforming, {PAIN_VISUAL}, the wound becomes the guide, low-poly 3D style, dramatic contrast, 8k render`
  },
  
  true_user: {
    id: 3,
    phase: "idea",
    name: "TRUE USER",
    template: `straight front view, flat mint green background #64FFDA, vast field of countless dim particles fading into fog, one single {FORM} in sharp focus glowing intensely with coral inner light #FF6B9D, {PERSON_DETAILS}, in infinity one resonates, low-poly 3D style, 8k render`
  },
  
  success_signal: {
    id: 4,
    phase: "research",
    name: "SUCCESS SIGNAL",
    template: `straight front view, flat deep teal background #0D4F4F, balance scale with two sides, left side massive dim form, right side small intensely luminescent {FORM} core, scale tips toward brighter smaller side, {SUCCESS_METRICS}, true growth measured by intensity not size, low-poly 3D style, 8k render`
  },
  
  strange_gift: {
    id: 5,
    phase: "research",
    name: "STRANGE GIFT",
    template: `straight front view, flat deep teal background #0D4F4F, grid of identical dim low-poly forms stretching into fog, one unique {FORM} mutation cracked open radiating new frequency spectrum, {UNIQUE_TRAIT}, nearby identical forms begin awakening, low-poly 3D style, 8k render`
  },
  
  territory: {
    id: 6,
    phase: "research",
    name: "TERRITORY",
    template: `slight top down view, flat deep teal background #0D4F4F, living topographic low-poly landscape map floating in space, different regions pulse with varying intensity, one zone blazes brightest with golden light marking {OPPORTUNITY}, low-poly 3D style, 8k render`
  },
  
  footprints: {
    id: 7,
    phase: "research",
    name: "FOOTPRINTS",
    template: `slight top down view, flat deep teal background #0D4F4F, terrain showing multiple glowing trail patterns, paths cross and overlap, {COMPETITOR_PATHS}, some lead to dead ends fading, successful paths glow stronger, ghost traces of failed attempts visible, learn from others journeys, low-poly 3D style, 8k render`
  },
  
  hidden_truth: {
    id: 8,
    phase: "research",
    name: "HIDDEN TRUTH",
    template: `straight front view, flat deep teal background #0D4F4F, geometric silhouette with connection point at core, holographic projection expands outward showing fragments of {INSIGHT}, teal base with coral emotion accents, intimacy of seeing unspoken truth, low-poly 3D style, 8k render`
  },
  
  dark_zones: {
    id: 9,
    phase: "research",
    name: "DARK ZONES",
    template: `straight front view, flat deep teal background #0D4F4F, glowing path leading forward through darkness, main path pulses healthy cyan light, at edges warning amber glow reveals {RISKS}, some side paths dim completely as dead ends, sensing tendril tests darkness ahead, low-poly 3D style, noir contrast, 8k render`
  },
  
  sweet_spot: {
    id: 10,
    phase: "research",
    name: "SWEET SPOT",
    template: `straight front view, flat deep teal background #0D4F4F, three distinct streams flowing from different directions, first stream coral {PASSION}, second stream cyan {SKILL}, third stream gold {NEED}, where all three meet brilliant starburst new form is born, energy spiral at convergence, low-poly 3D style, 8k render`
  },
  
  tool_stack: {
    id: 11,
    phase: "build",
    name: "TOOL STACK",
    template: `straight front view, flat warm coral background #FF8A80, vertical structure of different low-poly symbiotic forms stacked and growing into each other, {TECH_FORMS}, compatible parts glow golden at connections, energy flows through joints, some junctions spark with exchange, low-poly 3D style, 8k render`
  },
  
  first_fruit: {
    id: 12,
    phase: "build",
    name: "FIRST FRUIT",
    template: `straight front view, flat warm coral background #FF8A80, rough asymmetrical low-poly fruit form with imperfect exterior, cut cross-section reveals perfectly formed luminescent golden seed core, {MVP_ELEMENTS}, essence over appearance, low-poly 3D style, 8k render`
  },
  
  vital_organ: {
    id: 13,
    phase: "build",
    name: "VITAL ORGAN",
    template: `straight front view, flat warm coral background #FF8A80, transparent organism revealing single pulsing luminescent golden organ at center, {CORE_FUNCTION}, all other structures exist to support this one, without it organism cannot survive, low-poly 3D style, 8k render`
  },
  
  user_path: {
    id: 14,
    phase: "build",
    name: "USER PATH",
    template: `three quarter view, flat warm coral background #FF8A80, luminescent pathway through organic tunnel, path glows warmly guiding forward, small geometric traveler form moves through, {PATH_STAGES}, at junctions right path glows brighter, friction-free flow, low-poly 3D style, 8k render`
  },
  
  invisible_skeleton: {
    id: 15,
    phase: "build",
    name: "INVISIBLE SKELETON",
    template: `straight front view, flat warm coral background #FF8A80, x-ray vision through organism revealing bioluminescent skeletal wireframe, {DATA_STRUCTURE}, every capability traces to skeletal support, the invisible architecture enabling visible function, low-poly 3D style, 8k render`
  },
  
  launch_gate: {
    id: 16,
    phase: "build",
    name: "LAUNCH GATE",
    template: `straight front view, split background coral left violet right, massive low-poly gateway portal in center between two worlds, indicator lights glow mint green signaling readiness, {CHECKLIST_INDICATORS}, small geometric form at threshold about to pass through membrane, point of no return, low-poly 3D style, 8k render`
  },
  
  landing_zone: {
    id: 17,
    phase: "grow",
    name: "LANDING ZONE",
    template: `slight top down view, flat electric violet background #9D4EDD, vast terrain map with many zones most dim, one zone blazes with perfect golden match representing {CHANNEL}, concentrated beam of particles launches at optimal zone, {CHANNEL_DETAILS}, precision over scatter, low-poly 3D style, 8k render`
  },
  
  founding_tribe: {
    id: 18,
    phase: "grow",
    name: "FOUNDING TRIBE",
    template: `straight front view, flat electric violet background #9D4EDD, approximately dozen unique star forms in formation, each glows different hue representing {FIRST_USERS}, together form new constellation, golden threads connecting, this is founding tribe not crowd, low-poly 3D style, 8k render`
  },
  
  feedback_pulse: {
    id: 19,
    phase: "grow",
    name: "FEEDBACK PULSE",
    template: `straight front view, flat electric violet background #9D4EDD, circular network with central core, violet light flows outward, returns as golden enriched signal, {FEEDBACK_MECHANISM}, each cycle network grows brighter, send receive learn adapt, low-poly 3D style, 8k render`
  },
  
  pivot_compass: {
    id: 20,
    phase: "grow",
    name: "PIVOT COMPASS",
    template: `straight front view, flat electric violet background #9D4EDD, organism with deep glowing golden roots anchored below, above shows direction change, old growth dim bending away, new growth blazes violet toward {NEW_DIRECTION}, pivot point glows with decision energy, roots stay same, low-poly 3D style, 8k render`
  },
  
  fractal_growth: {
    id: 21,
    phase: "grow",
    name: "FRACTAL GROWTH",
    template: `straight front view, flat electric violet background #9D4EDD, fractal network expanding in self-similar pattern, each node contains same golden core code, {SCALE_STRUCTURE}, nodes multiply by replication not central effort, distributed intelligence, low-poly 3D style, 8k render`
  },
  
  value_exchange: {
    id: 22,
    phase: "grow",
    name: "VALUE EXCHANGE",
    template: `straight front view, flat electric violet background #9D4EDD, thriving organism radiating golden energy outward, {MONETIZATION_MODEL}, fed forms return violet resources, perpetual exchange cycle, giving creates receiving, sparks where streams cross, low-poly 3D style, 8k render`
  },
  
  golden_scars: {
    id: 23,
    phase: "authentic",
    name: "GOLDEN SCARS",
    template: `straight front view, flat earth brown background #8B7355 with warm undertones, intimate sacred space, low-poly {FORM} showing beautiful cracks, golden light fills every crack transforming wounds into art, {VULNERABILITY_VISUAL}, small witness form observes with compassion, vulnerability becomes strength, kintsugi philosophy, low-poly 3D style, 8k render`
  }
};

// ═══════════════════════════════════════
// SLOT TO TEMPLATE MAPPING
// ═══════════════════════════════════════
const SLOT_TO_TEMPLATE: Record<number, string> = {
  1: 'idea_seed',
  2: 'pain_point',
  3: 'true_user',
  4: 'success_signal',
  5: 'strange_gift',
  6: 'territory',
  7: 'footprints',
  8: 'hidden_truth',
  9: 'dark_zones',
  10: 'sweet_spot',
  11: 'tool_stack',
  12: 'first_fruit',
  13: 'vital_organ',
  14: 'user_path',
  15: 'invisible_skeleton',
  16: 'launch_gate',
  17: 'landing_zone',
  18: 'founding_tribe',
  19: 'feedback_pulse',
  20: 'pivot_compass',
  21: 'fractal_growth',
  22: 'value_exchange',
  23: 'golden_scars'
};

// ═══════════════════════════════════════
// PROTECTION & VALIDATION
// ═══════════════════════════════════════
const PROTECTION_SUFFIX = `CRITICAL: absolutely NO text, NO letters, NO numbers, NO words, NO typography, NO writing, NO symbols, NO signs, NO labels, NO human faces, NO human figures, NO people, NO person, NO characters, NO portraits, NO anime, NO cartoon, NO photorealistic, NO lens flare, NO god rays, NO smoke swirls, NO generic glow orbs, NO floating particles cliche, NO purple-blue nebula, NO abstract swooshes, NO stock imagery, NO corporate art, NO gradient mesh blobs, NO pastel colors, NO blurry edges, NO vaporwave. Only abstract geometric low-poly 3D forms, pure shapes, no representational imagery.`;

const FORBIDDEN_ELEMENTS = [
  // People - strict
  "face", "person", "human", "man", "woman", "child", "figure", "portrait", "character", "people", "crowd", "body", "head", "eye", "hand", "silhouette",
  // Text - strict
  "text", "letter", "word", "writing", "typography", "font", "number", "digit", "label", "sign", "logo", "title", "caption", "symbol", "icon", "glyph", "inscription",
  // Styles
  "anime", "cartoon", "realistic", "photorealistic", "3d render smooth", "cinematic", "dramatic lighting", "lens flare",
  // AI clichés
  "nebula", "galaxy swirl", "energy orb", "magic particles", "ethereal glow", "mystical", "cosmic dust", "aurora borealis", "light rays", "god rays", "volumetric light"
];

function validatePrompt(prompt: string): { valid: boolean; violations: string[] } {
  const lower = prompt.toLowerCase();
  const violations = FORBIDDEN_ELEMENTS.filter(word => lower.includes(word));
  return { valid: violations.length === 0, violations };
}

// Sanitize prompt by removing/replacing forbidden elements
function sanitizePrompt(text: string): string {
  let sanitized = text;
  
  // Safe abstract replacements for common forbidden terms
  const replacements: Record<string, string> = {
    "man": "entity",
    "woman": "entity",
    "person": "form",
    "human": "organic form",
    "people": "forms",
    "figure": "shape",
    "character": "element",
    "head": "apex",
    "face": "surface",
    "eye": "point",
    "hand": "appendage",
    "body": "structure",
    "silhouette": "outline",
    "sign": "marker",
    "symbol": "glyph-shape",
    "icon": "minimal form",
    "label": "tag-element",
    "text": "pattern",
    "letter": "glyph",
    "word": "sequence",
    "writing": "marks",
    "logo": "emblem-shape"
  };
  
  // Replace forbidden words with safe alternatives
  for (const [forbidden, safe] of Object.entries(replacements)) {
    const regex = new RegExp(`\\b${forbidden}\\b`, 'gi');
    sanitized = sanitized.replace(regex, safe);
  }
  
  // Remove any remaining forbidden elements that don't have replacements
  for (const forbidden of FORBIDDEN_ELEMENTS) {
    if (!replacements[forbidden]) {
      const regex = new RegExp(`\\b${forbidden}\\b`, 'gi');
      sanitized = sanitized.replace(regex, '');
    }
  }
  
  // Clean up extra spaces
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  return sanitized;
}

// ═══════════════════════════════════════
// EXTRACT DETAILS FROM USER CONTENT
// ═══════════════════════════════════════
function extractDetails(cardContent: Record<string, any>, templateKey: string): Record<string, string> {
  // Convert content to text for analysis and sanitize it
  const rawText = Object.values(cardContent)
    .filter(v => v && typeof v === 'string')
    .join(' ');
  const contentText = sanitizePrompt(rawText);
  
  // Default details with simple extraction
  const details: Record<string, string> = {
    FUTURE_SCALE: contentText.substring(0, 50) || "transformative impact on millions",
    CONNECTOR: "thread",
    PAIN_VISUAL: "deep fractures showing source of suffering",
    PERSON_DETAILS: "specific traits defining the ideal user",
    SUCCESS_METRICS: "measurable indicators of true progress",
    UNIQUE_TRAIT: "distinctive characteristic setting apart from others",
    OPPORTUNITY: "prime market space ready for cultivation",
    COMPETITOR_PATHS: "trails left by existing solutions",
    INSIGHT: "inner world needs desires fears",
    RISKS: "potential failure points along edges",
    PASSION: "what drives deep engagement",
    SKILL: "unique capability strength",
    NEED: "market demand signal",
    TECH_FORMS: "symbiotic technology components",
    MVP_ELEMENTS: "essential core features",
    CORE_FUNCTION: "the one capability without which nothing works",
    PATH_STAGES: "journey steps from entry to value",
    DATA_STRUCTURE: "underlying information architecture",
    CHECKLIST_INDICATORS: "readiness signals for launch",
    CHANNEL: "optimal distribution pathway",
    CHANNEL_DETAILS: "specific characteristics of chosen channel",
    FIRST_USERS: "initial community members",
    FEEDBACK_MECHANISM: "how information flows back",
    NEW_DIRECTION: "adjusted strategic course",
    SCALE_STRUCTURE: "pattern for exponential growth",
    MONETIZATION_MODEL: "value exchange mechanism",
    VULNERABILITY_VISUAL: "visible cracks transformed to strength"
  };
  
  return details;
}

// ═══════════════════════════════════════
// MAIN SERVE FUNCTION
// ═══════════════════════════════════════
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const cardSlot = requestBody.cardSlot;
    const cardContent = requestBody.cardContent || {};
    const deckId = requestBody.deckId; // NEW: Accept deckId to save directly to DB
    
    console.log('Mycelium System: Received request:', { cardSlot, deckId, cardContentKeys: Object.keys(cardContent) });
    
    // Get template key from slot
    const templateKey = SLOT_TO_TEMPLATE[cardSlot];
    if (!templateKey) {
      throw new Error(`Invalid card slot: ${cardSlot}`);
    }
    
    const template = CARD_TEMPLATES[templateKey];
    console.log('Mycelium System: Using template:', templateKey, template.name);
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Select form based on user content
    const contentText = Object.values(cardContent).join(' ');
    const selectedForm = selectForm(contentText);
    console.log('Mycelium System: Selected form:', selectedForm);
    
    // Extract details for placeholders
    const details = extractDetails(cardContent, templateKey);
    
    // Build prompt by replacing placeholders
    let prompt = template.template
      .replace('{FORM}', selectedForm);
    
    // Replace all detail placeholders
    for (const [key, value] of Object.entries(details)) {
      prompt = prompt.replace(`{${key}}`, value);
    }
    
    // Validate and sanitize prompt BEFORE adding protection suffix
    const validation = validatePrompt(prompt);
    if (!validation.valid) {
      console.warn('Mycelium System: Prompt contains forbidden elements:', validation.violations);
      // Sanitize the prompt to remove forbidden elements
      prompt = sanitizePrompt(prompt);
      console.log('Mycelium System: Prompt sanitized, new length:', prompt.length);
    }
    
    // Add aspect ratio and protection suffix AFTER validation/sanitization
    prompt += ` --ar 3:4 ${PROTECTION_SUFFIX}`;
    
    console.log('Mycelium System: Final prompt length:', prompt.length);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      // Pass through rate limit and payment errors with correct status codes
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please wait a moment and try again.', code: 'RATE_LIMITED' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits in Settings → Workspace → Usage.', code: 'PAYMENT_REQUIRED' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      throw new Error('No image generated');
    }

    console.log('Mycelium System: Low-poly 3D card generated successfully for', template.name);

    // NEW: Save image directly to database in edge function (not relying on client!)
    if (deckId) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        const { error: updateError } = await supabase
          .from('deck_cards')
          .update({ card_image_url: imageUrl })
          .eq('deck_id', deckId)
          .eq('card_slot', cardSlot);
        
        if (updateError) {
          console.error('Mycelium System: Failed to save image to DB:', updateError);
        } else {
          console.log('Mycelium System: Image saved to DB for slot', cardSlot);
        }
      } catch (dbError) {
        console.error('Mycelium System: DB update error:', dbError);
      }
    }

    return new Response(
      JSON.stringify({ imageUrl, savedToDb: !!deckId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-card-image:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});