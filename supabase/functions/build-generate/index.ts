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

Based on the Vision and Research data, generate RECOMMENDED FEATURES for this app.

RULES:
1. ONLY derive features from Vision + Research data. NO inventions.
2. Group into categories: Basic, Key (from V-04), Monetization, Engagement
3. Explain WHY each feature is needed with source reference
4. Tech Priest validates feasibility

OUTPUT FORMAT (JSON):
{
  "basic_features": "1. Registration/Auth - Users save progress (V-03: audience wants to track)\n2. Data persistence - History of results (R-3: users complain about losing data)",
  "key_features": "1. [Main feature from V-04] - [Benefit]\n2. [Second key feature] - [Benefit]",
  "monetization_features": "1. Premium subscription - [If applicable based on V-04 pricing]\n2. One-time purchases - [Based on R-2 competitor analysis]",
  "engagement_features": "1. Push notifications - [If R-3 shows users want daily contact]\n2. Social sharing - [If V-03 audience is active on social]",
  "tech_validation": "All features are implementable in Lovable. [Notes on specific integrations needed]"
}`,

      12: `You are Prisma (💎), UX strategist, with Virgil (🎨) for user experience.

Based on Vision, Research, and B-01 Features, design the USER PATH through the app.

RULES:
1. Path must solve the pain from V-02
2. Path must be understandable by audience from V-03
3. Include all features from B-01
4. Each step has: What happens, What user sees, What user does

OUTPUT FORMAT (JSON):
{
  "step_1_entry": "ENTRY: User opens app first time\n• What happens: Short onboarding (3 screens explaining value)\n• What user sees: Welcome + illustrations + CTA\n• What user does: Swipes, understands value, clicks 'Start'\n📍 Why: V-03 - audience doesn't know the domain, needs explanation",
  "step_2_input": "INPUT: User provides their data\n• What happens: Simple form with minimal fields\n• What user sees: Input fields + progress indicator\n• What user does: Enters required info, clicks 'Calculate'\n📍 Why: V-03 - audience hates long forms",
  "step_3_magic": "MAGIC: AI/App processes and delivers\n• What happens: [Main value delivery from V-04]\n• What user sees: Loading animation, then result\n• What user does: Views result with anticipation",
  "step_4_value": "VALUE: User understands the benefit\n• What happens: Result is displayed beautifully\n• What user sees: Main insight + details + actions\n• What user does: Reads, saves, maybe shares\n📍 Why: This is where V-04 value proposition comes to life",
  "step_5_return": "RETURN: User comes back\n• What happens: Push notification or new content\n• What user sees: Saved history + new recommendations\n• What user does: Returns for more value\n📍 Why: R-3 - users want ongoing engagement"
}`,

      13: `You are Virgil (🎨), UI/UX designer, with Prisma (💎) for UX validation.

Based on B-02 User Path, define the SCREENS needed for the app.

RULES:
1. Each path step = at least 1 screen
2. Include all features from B-01
3. Describe what's ON each screen
4. Keep it simple for V-03 audience

OUTPUT FORMAT (JSON):
{
  "onboarding_screens": "ONBOARDING (3 screens):\n\n1.1 Welcome\n• Hero title with app essence\n• Beautiful illustration\n• 'Next' button\n\n1.2 How It Works\n• 3 steps with icons\n• Simple explanation\n• 'Next' button\n\n1.3 Get Started\n• Call to action\n• 'Create Account' / 'Sign In' buttons",
  "main_screens": "MAIN SCREENS:\n\n2.1 Input/Data Entry\n• [Specific fields based on B-01]\n• Minimal required fields\n• 'Calculate/Submit' button\n📍 Prisma: Keep fields minimal - V-03 audience dislikes long forms\n\n2.2 Dashboard/Home\n• [Main content area]\n• Quick actions\n• Navigation",
  "result_screens": "RESULT SCREENS:\n\n3.1 Main Result\n• [Big beautiful result display]\n• Brief description\n• 'Learn More' button\n• 'Share' button\n• 'Save' button\n\n3.2 Detailed Analysis\n• [Expanded information]\n• [Additional insights]",
  "profile_screens": "PROFILE SCREENS:\n\n4.1 Profile/Settings\n• User info\n• Saved results history\n• Subscription status (if B-01 has monetization)\n• Settings",
  "ux_notes": "UX Notes:\n• Total screens: [X]\n• Complexity level: [Low/Medium] suitable for V-03 audience\n• Navigation: Tab bar / Drawer / Stack"
}`,

      14: `You are Virgil (🎨), visual designer.

Based on V-03 Audience and R-2 Competitors, define the app STYLE.

RULES:
1. Style must appeal to V-03 audience
2. Style must differentiate from R-2 competitors
3. Explain WHY each choice

OUTPUT FORMAT (JSON):
{
  "theme": "Dark",
  "mood": "Premium",
  "reference_apps": "Headspace - same wellness audience, warm and trustworthy\nCalm - premium feel, dark theme done right\n📍 Why: V-03 audience (wellness seekers) trusts these aesthetics",
  "primary_color": "Purple\n📍 Why: Mystical/premium associations, fits [product type]",
  "accent_color": "Gold\n📍 Why: Premium + value associations, contrast with purple",
  "style_reasoning": "• Theme: Dark - V-03 audience associates dark theme with premium/mysterious\n• Mood: Premium - R-2 competitors look cheap, this is differentiation opportunity\n• Colors: Purple + Gold = mystical + valuable, perfect for [product type]\n• Reference: Headspace style but with unique identity"
}`,

      15: `You are Ever Green (🌲), the team lead, with Tech Priest (⚙️) for technical summary.

Compile the final BUILD SUMMARY from all previous cards.

RULES:
1. Pull app name from V-01
2. Summarize features from B-01
3. List screens from B-03
4. Include style from B-04
5. Add technical stack notes
6. Calculate Build Quality Score

OUTPUT FORMAT (JSON):
{
  "app_name": "[From V-01 product_name]",
  "app_description": "[From V-01 one_liner solving V-02 pain for V-03 audience]",
  "features_summary": "✓ [Feature 1 from B-01]\n✓ [Feature 2 from B-01]\n✓ [Feature 3 from B-01]\n...",
  "screens_summary": "• Onboarding (3 screens)\n• [Main screens from B-03]\n• [Result screens]\n• [Profile screens]\nTotal: [X] screens",
  "style_summary": "[Theme] theme • [Mood] mood • Like [Reference]\nColors: [Primary] + [Accent]",
  "tech_stack": "Database: Supabase (users, results, history)\nAI: [If needed from B-01]\nPayments: [If B-01 has monetization]\nPush: [If B-01 has notifications]\n\n⚙️ Tech Priest: All implementable in Lovable. Estimated generation: ~5 minutes",
  "build_quality_score": "[X]% - [Rarity: COMMON/UNCOMMON/RARE/EPIC/LEGENDARY]"
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
