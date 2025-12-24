import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BuildRequest {
  deckId: string;
  cardSlot: number; // 11-15 for BUILD phase
  language: 'en' | 'ru';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { deckId, cardSlot, language = 'ru' } = await req.json() as BuildRequest;
    
    console.log(`[BUILD] Generating card ${cardSlot} for deck ${deckId}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch Vision cards (slots 1-5)
    const { data: visionCards, error: visionError } = await supabase
      .from('deck_cards')
      .select('*')
      .eq('deck_id', deckId)
      .gte('card_slot', 1)
      .lte('card_slot', 5)
      .order('card_slot');

    if (visionError) {
      console.error('[BUILD] Error fetching vision cards:', visionError);
      throw new Error('Failed to fetch vision cards');
    }

    // Fetch Research cards (slots 6-10)
    const { data: researchCards, error: researchError } = await supabase
      .from('deck_cards')
      .select('*')
      .eq('deck_id', deckId)
      .gte('card_slot', 6)
      .lte('card_slot', 10)
      .order('card_slot');

    if (researchError) {
      console.error('[BUILD] Error fetching research cards:', researchError);
    }

    // Fetch previous BUILD cards if any (for context)
    const { data: previousBuildCards } = await supabase
      .from('deck_cards')
      .select('*')
      .eq('deck_id', deckId)
      .gte('card_slot', 11)
      .lt('card_slot', cardSlot)
      .order('card_slot');

    // Build context from Vision cards
    const visionContext = visionCards?.map(card => {
      const data = card.card_data as Record<string, any>;
      const slotNames: Record<number, string> = {
        1: 'V-01 Product',
        2: 'V-02 Problem', 
        3: 'V-03 Audience',
        4: 'V-04 Value',
        5: 'V-05 Vision'
      };
      return `${slotNames[card.card_slot]}:\n${JSON.stringify(data, null, 2)}`;
    }).join('\n\n') || '';

    // Build context from Research cards
    const researchContext = researchCards?.map(card => {
      const data = card.card_data as Record<string, any>;
      const slotNames: Record<number, string> = {
        6: 'R-1 Market Map',
        7: 'R-2 Competitors',
        8: 'R-3 User Insights',
        9: 'R-4 Risks',
        10: 'R-5 Opportunity'
      };
      return `${slotNames[card.card_slot]}:\n${JSON.stringify(data, null, 2)}`;
    }).join('\n\n') || '';

    // Build context from previous BUILD cards
    const buildContext = previousBuildCards?.map(card => {
      const data = card.card_data as Record<string, any>;
      const slotNames: Record<number, string> = {
        11: 'B-01 Features',
        12: 'B-02 User Path',
        13: 'B-03 Screens',
        14: 'B-04 Style'
      };
      return `${slotNames[card.card_slot]}:\n${JSON.stringify(data, null, 2)}`;
    }).join('\n\n') || '';

    // Generate prompt based on card slot
    const cardPrompts: Record<number, string> = {
      11: `You are Prisma (💎), a product strategist, with Tech Priest (⚙️) for technical validation.

Generate FEATURES for this app based on Vision and Research data.

DATA LINKING RULES:
- BASIC FEATURES: Derive from V-02 (pain_description) + R-3 (user_needs, user_quotes)
  → What functions SOLVE the pain users described?
- KEY FEATURES: Derive from V-04 (your_solution, roi_multiple) + R-2 (competitor_weaknesses)
  → What makes us DIFFERENT from competitors?
- MONETIZATION: Derive from R-1 (market_size) + V-04 (your_price) + R-2 (competitor prices)
  → What pricing model fits the market?
- ENGAGEMENT: Derive from V-03 (behaviors, active_hours) + R-3 (pain_points)
  → How do we get users to RETURN?

IMPORTANT:
- For each feature, cite the SOURCE: "(V-02: [quote])" or "(R-3: [data])"
- Keep MVP focused: 3-5 basic features, 2-3 key features max
- Tech Priest validates: is each feature buildable in Lovable?

OUTPUT FORMAT (JSON):
{
  "basic_features": "1. [Feature] - [Benefit] (Source: V-02/R-3)\n2. [Feature] - [Benefit] (Source: ...)",
  "key_features": "1. [Unique feature from V-04] - This differentiates us because [R-2 competitor weakness]\n2. [Feature] - [Benefit]",
  "monetization_features": "Model: [Freemium/Subscription/One-time] (Source: R-1 market data)\nPrice: [X]/month - justified by V-04 ROI\n📍 Why: [explanation]",
  "engagement_features": "1. [Mechanism] - triggers return because V-03 audience [behavior]\n2. [Mechanism] - addresses R-3 pain point about [issue]",
  "tech_validation": "⚙️ Tech Priest Analysis:\n✅ [Feature]: buildable via [technology]\n⚠️ [Feature]: needs [external API/service]\nMVP Timeline: [X] days\nMain Risk: [from R-4]"
}`,

      12: `You are Prisma (💎), UX strategist, with Virgil (🎨) for user experience.

Design the USER PATH (5 steps) based on Vision, Research, and B-01 Features.

DATA LINKING RULES:
- ENTRY: From V-02 (pain) + V-03 (where audience hangs out)
  → User arrives WITH this pain, FROM this source
- INPUT: From B-01 (basic_features) + V-03 (behaviors, patience level)
  → What MINIMUM data do we need? How fast must it be?
- MAGIC: From B-01 (key_features) + V-04 (your_solution)
  → The "WOW" moment where our unique value appears
- VALUE: From V-04 (transformation result) + R-3 (user expectations)
  → User SEES the transformation they were promised
- RETURN: From B-01 (engagement_features) + V-03 (active_hours, behaviors)
  → Why and WHEN do they come back?

IMPORTANT:
- Time to value MUST be < 3 minutes (Zen rule)
- Each step cites source data
- Magic moment = key feature from B-01

OUTPUT FORMAT (JSON):
{
  "step_1_entry": "ENTRY: User arrives with pain\n• Pain: [V-02 pain_description]\n• From: [V-03 where they find us]\n• First impression: [what they see in 3 seconds]\n• Action: [single CTA]\n📍 Source: V-02, V-03",
  "step_2_input": "INPUT: User provides data\n• Required fields: [minimum from B-01 basic_features]\n• Time: [X] seconds max (V-03 patience level)\n• UX: [progress indicator, skip options]\n• Action: [submit button text]\n📍 Source: B-01, V-03",
  "step_3_magic": "MAGIC: The 'wow' moment\n• What happens: [B-01 key_feature in action]\n• User sees: [loading → result animation]\n• Emotion: [anticipation → surprise]\n• Duration: [X] seconds\n📍 Source: B-01 key_features, V-04",
  "step_4_value": "VALUE: Transformation delivered\n• Result: [V-04 transformation visible]\n• User feels: [emotion from V-04]\n• Actions available: [save/share/act]\n• Celebration: [confetti/message]\n📍 Source: V-04, R-3",
  "step_5_return": "RETURN: User comes back\n• Trigger: [B-01 engagement mechanism]\n• When: [V-03 active_hours]\n• New value: [what's different on return]\n• Habit loop: [trigger → action → reward]\n📍 Source: B-01, V-03"
}`,

      13: `You are Virgil (🎨), UI/UX designer, with Prisma (💎) for UX validation.

Define SCREENS based on B-02 User Path and B-01 Features.

DATA LINKING RULES:
- ONBOARDING: From B-02 step_1_entry + V-04 (promise to show)
  → MAX 3 screens, skip button required
- MAIN SCREENS: From B-02 step_2_input + B-02 step_3_magic + B-01 basic_features
  → One screen per major feature
- RESULT SCREENS: From B-02 step_4_value + V-04 (transformation visualization)
  → Show the value beautifully
- PROFILE/SETTINGS: From B-01 monetization_features
  → Subscription management if monetized
- UX NOTES: From V-03 (tech level) + R-2 (competitor UX mistakes)
  → Avoid what competitors do wrong

IMPORTANT:
- Total screens for MVP: 8-10 max (Toxic rule)
- Each screen maps to user path step
- Cite source for each decision

OUTPUT FORMAT (JSON):
{
  "onboarding_screens": "ONBOARDING (3 screens max):\n\n1. Welcome\n• Hero: [V-04 promise in one line]\n• Visual: [illustration of transformation]\n• CTA: 'Next'\n📍 Source: V-04\n\n2. How It Works\n• Step 1: [from B-02 input]\n• Step 2: [from B-02 magic]\n• Step 3: [from B-02 value]\n📍 Source: B-02\n\n3. Get Started\n• CTA: [action text]\n• Trust element: [social proof if available from R-3]\n• Skip: always available",
  "main_screens": "MAIN SCREENS:\n\n1. Input Screen (B-02 step_2)\n• Fields: [from B-01 basic_features]\n• Validation: inline\n• CTA: [submit text]\n📍 Prisma: V-03 patience = [level], keep fields minimal\n\n2. Processing Screen (B-02 step_3)\n• Animation: [magic moment visual]\n• Progress: [what's happening]\n• Duration: [X] seconds",
  "result_screens": "RESULT SCREENS:\n\n1. Main Result (B-02 step_4)\n• Hero: [V-04 transformation result]\n• Details: [breakdown]\n• Actions: Save | Share | [specific action]\n• Celebration: [confetti/animation]\n📍 Source: V-04, B-02 step_4\n\n2. Details Screen\n• Deep dive into result\n• Educational content\n• Next steps",
  "profile_screens": "PROFILE SCREENS:\n\n1. Profile/Settings\n• User info\n• History (B-01 basic: data persistence)\n• [If B-01 monetization]: Subscription status\n• Notifications toggle\n• Theme (if B-04 has options)",
  "ux_notes": "📋 UX Summary:\n• Total: [X] screens\n• Complexity: [Low/Medium] for V-03 audience\n• Navigation: [Tab bar / Stack]\n• V-03 tech level: [consideration]\n⚠️ Avoid (from R-2): [competitor UX mistakes]\n✅ Prioritize: [based on V-03 behaviors]"
}`,

      14: `You are Virgil (🎨), visual designer, with Phoenix (🔥) for brand positioning.

Define app STYLE based on audience and competitive differentiation.

DATA LINKING RULES:
- THEME: From V-03 (demographics, preferences) + R-2 (competitor themes)
  → Dark = premium/serious, Light = friendly/accessible, Auto = safe choice
- MOOD: From V-01 (product positioning) + V-04 (emotion we deliver)
  → Premium/Playful/Professional/Minimal - must match the value
- REFERENCES: From R-3 (apps users already love) + R-2 (competitor design)
  → Take inspiration from what audience knows, avoid competitor look
- COLORS: From V-01 (brand associations) + V-03 (cultural/age preferences)
  → Primary = 60% interface, Accent = CTAs and highlights

IMPORTANT:
- Phoenix validates: Does style SCREAM our value proposition?
- Toxic validates: Does style DIFFER from competitors?
- Every choice must cite source data

OUTPUT FORMAT (JSON):
{
  "theme": "Dark",
  "mood": "Premium",
  "reference_apps": "1. [App name] - V-03 audience uses this\n   → Take: [specific element]\n2. [App name] - similar mood to V-04 emotion\n   → Take: [specific element]\n3. [Competitor from R-2] - ANTI-reference\n   → Avoid: [what they do wrong]\n📍 Source: R-3, R-2",
  "primary_color": "[Color name] (#HEX)\n📍 Why: V-03 [demographic] associates with [meaning]\n📍 Fits V-01 positioning: [how]",
  "accent_color": "[Color name] (#HEX)\n📍 Why: Contrasts with primary, draws attention to CTAs\n📍 Emotion: matches V-04 [transformation feeling]",
  "style_reasoning": "🔥 Phoenix Analysis:\n• Theme [X]: speaks to V-03 because [reason]\n• Mood [X]: delivers V-04 emotion of [emotion]\n• Colors: [primary] + [accent] = [brand message]\n\n☢️ Toxic Check:\n• R-2 [competitor 1]: uses [their style] → we differ by [how]\n• R-2 [competitor 2]: uses [their style] → we differ by [how]\n\n✅ Style Message: '[what the design says about us]'"
}`,

      15: `You are Ever Green (🌲), the team lead, with Tech Priest (⚙️) for technical summary.

Compile the final BUILD SUMMARY from all BUILD cards (B-01 to B-04).

DATA SOURCES:
- app_name: From V-01 product_name
- app_format: Determine based on V-03 audience behavior + B-01 features
  → Mobile App: if audience is mobile-first, needs push notifications
  → Web App: if desktop workflow, lots of text input, B2B
  → Both: if budget allows and audience uses both
- app_description: Synthesize V-01 + V-02 + V-04 into one sentence
- features_summary: List from B-01 (basic + key)
- screens_summary: Count from B-03
- style_summary: From B-04
- tech_stack: Based on B-01 features + R-4 constraints

COHERENCE CHECK (Ever Green):
- Does B-01 solve V-02 pain? ✓/✗
- Does B-02 path lead to V-04 value? ✓/✗
- Does B-03 screens match B-02 path? ✓/✗
- Does B-04 style fit V-03 audience? ✓/✗

OUTPUT FORMAT (JSON):
{
  "app_name": "[From V-01 product_name]",
  "app_format": "Mobile App (iOS + Android)",
  "app_description": "[Product] helps [V-03 audience] solve [V-02 pain] by [V-04 solution], delivering [transformation].",
  "features_summary": "MVP Features:\n✓ [B-01 basic 1]\n✓ [B-01 basic 2]\n✓ [B-01 basic 3]\n\nKey Differentiators:\n⭐ [B-01 key 1]\n⭐ [B-01 key 2]\n\nMonetization:\n💰 [B-01 monetization model]",
  "screens_summary": "📱 Total: [X] screens\n\n• Onboarding: [X] screens\n• Main: [X] screens\n• Result: [X] screens\n• Profile: [X] screens\n\n[From B-03 ux_notes: navigation type]",
  "style_summary": "🎨 [B-04 theme] theme • [B-04 mood] mood\n🎯 Like: [B-04 reference apps]\n🎨 Colors: [B-04 primary] + [B-04 accent]\n\n[From B-04 style_reasoning: brand message]",
  "tech_stack": "⚙️ Tech Priest Recommendations:\n\n📦 Core:\n• Framework: React Native (mobile) / Next.js (web)\n• Database: Supabase\n• Auth: Supabase Auth\n\n🔌 Integrations:\n• [If B-01 needs AI]: Claude API / OpenAI\n• [If B-01 has payments]: Stripe / RevenueCat\n• [If B-01 has push]: Firebase / OneSignal\n\n⚠️ From R-4 risks: [main technical risk and mitigation]\n\n⏱️ Estimated build: [X] days for MVP",
  "build_quality_score": "[X]% - [LEGENDARY/EPIC/RARE/COMMON]\n\n🌲 Ever Green Coherence Check:\n• B-01 → V-02: [✓/✗] features solve pain\n• B-02 → V-04: [✓/✗] path delivers value\n• B-03 → B-02: [✓/✗] screens match path\n• B-04 → V-03: [✓/✗] style fits audience"
}`
    };

    const systemPrompt = language === 'ru' 
      ? `Ты AI-ассистент команды BUILD в системе Mycelium. Отвечай ТОЛЬКО на русском языке. Генерируй контент на основе данных из Vision и Research карт. НЕ выдумывай — только выводы из предоставленных данных.`
      : `You are the BUILD team AI assistant in Mycelium system. Generate content based on Vision and Research card data. DO NOT invent — only derive from provided data.`;

    const userPrompt = `${cardPrompts[cardSlot]}

=== VISION DATA ===
${visionContext}

=== RESEARCH DATA ===
${researchContext}

${buildContext ? `=== PREVIOUS BUILD CARDS ===\n${buildContext}` : ''}

Generate the card content. Return ONLY valid JSON, no markdown.`;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('[BUILD] Calling AI to generate card content...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[BUILD] AI error:', response.status, errorText);
      throw new Error(`AI request failed: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content from AI');
    }

    console.log('[BUILD] AI response received, parsing...');

    // Parse JSON from response
    let cardData: Record<string, any>;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      let jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
      
      // Fix common JSON issues from AI responses:
      // 1. Escape unescaped newlines within string values
      // 2. Handle control characters
      jsonStr = jsonStr.replace(/[\x00-\x1F\x7F]/g, (char: string) => {
        if (char === '\n') return '\\n';
        if (char === '\r') return '\\r';
        if (char === '\t') return '\\t';
        return '';
      });
      
      cardData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('[BUILD] JSON parse error:', parseError);
      console.log('[BUILD] Raw content:', content);
      
      // Fallback: try to extract key-value pairs manually
      try {
        const fallbackData: Record<string, string> = {};
        const keyPattern = /"([^"]+)":\s*"((?:[^"\\]|\\.)*)"/g;
        let match;
        while ((match = keyPattern.exec(content)) !== null) {
          fallbackData[match[1]] = match[2].replace(/\\n/g, '\n').replace(/\\"/g, '"');
        }
        if (Object.keys(fallbackData).length > 0) {
          console.log('[BUILD] Used fallback parsing, found keys:', Object.keys(fallbackData));
          cardData = fallbackData;
        } else {
          throw new Error('Failed to parse AI response as JSON');
        }
      } catch {
        throw new Error('Failed to parse AI response as JSON');
      }
    }

    console.log('[BUILD] Card data generated successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        cardData,
        cardSlot 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[BUILD] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
