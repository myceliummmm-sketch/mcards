import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Card definitions with prompts for each card
const CARD_PROMPTS: Record<number, { fields: string[], prompt: string }> = {
  1: {
    fields: ['product_name', 'product_type', 'main_feature', 'target_summary'],
    prompt: `Generate a compelling IDEA card for a startup:
- Product name: A catchy, memorable name
- Product type: The category (app, platform, service, etc.)
- Main feature: The core unique value proposition
- Target summary: Brief description of who this is for

Make it innovative and market-ready.`
  },
  2: {
    fields: ['who_suffers', 'pain_description', 'root_cause', 'pain_cost', 'data_source'],
    prompt: `Generate an EXCEPTIONAL PROBLEM card:
- WHO exactly suffers? (specific demographics, job titles, situations)
- WHAT specific pain do they experience daily?
- WHY does this problem exist? (root cause)
- WHAT is the real cost? (quantify: hours, money, emotional toll)
- Include data/research to back claims

Make it compelling and evidence-based.`
  },
  3: {
    fields: ['demographics', 'behaviors', 'goals', 'pain_points', 'purchase_triggers', 'active_hours'],
    prompt: `Generate an EXCEPTIONAL AUDIENCE card with vivid persona:
- Demographics: age, income, location, profession
- Behaviors: daily habits, tools, communities
- Goals: what they're trying to achieve
- Pain points: specific frustrations
- Purchase triggers: what makes them buy
- Active hours: when they're most receptive

Be hyper-specific, include psychographic details.`
  },
  4: {
    fields: ['current_alternative', 'alternative_cost', 'your_solution', 'your_price', 'roi_multiple'],
    prompt: `Generate an EXCEPTIONAL VALUE card:
- Current alternatives: what do people use now?
- Alternative cost: in time, money, frustration (specific numbers)
- Your solution: what makes you unique?
- Price positioning: competitive analysis
- ROI multiple: how much do they save/gain?

Show clear 10x value with numbers and comparisons.`
  },
  5: {
    fields: ['vision_statement', 'who_benefits', 'what_becomes_possible', 'barrier_removed'],
    prompt: `Generate an EXCEPTIONAL VISION card:
- Vision statement: bold, memorable, 1-2 sentences
- Who benefits: beyond direct users
- What becomes possible: new capabilities unlocked
- Barrier removed: what limitation disappears

Make it inspirational yet achievable. Think 5-10 years ahead.`
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { deckId, slot, language = 'en' } = await req.json();
    const COST = 10; // SPORE cost for single card AI

    if (!deckId || !slot) {
      throw new Error('deckId and slot are required');
    }

    console.log(`Auto-completing card ${slot} for deck ${deckId}`);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const isRussian = language === 'ru';

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check and deduct SPORE balance
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('spore_balance')
      .eq('user_id', user.id)
      .single();

    const sporeBalance = subscription?.spore_balance || 0;
    if (sporeBalance < COST) {
      return new Response(
        JSON.stringify({
          success: false,
          error: isRussian ? 'Недостаточно SPORE' : 'Not enough SPORE',
          needSpores: true
        }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Deduct SPORE
    await supabase
      .from('user_subscriptions')
      .update({ spore_balance: sporeBalance - COST })
      .eq('user_id', user.id);

    // Get context from card 1 (if not card 1 itself)
    let contextData = '';
    if (slot > 1) {
      const { data: card1 } = await supabase
        .from('deck_cards')
        .select('card_data')
        .eq('deck_id', deckId)
        .eq('card_slot', 1)
        .single();

      if (card1?.card_data) {
        contextData = `\n\nProduct context from Card 1:\n${JSON.stringify(card1.card_data, null, 2)}`;
      }
    }

    const cardConfig = CARD_PROMPTS[slot];
    if (!cardConfig) {
      throw new Error(`No configuration for slot ${slot}`);
    }

    const systemPrompt = isRussian
      ? 'Ты эксперт по бизнес-стратегии. Генерируй качественный, конкретный контент для стратегических карточек. Отвечай ТОЛЬКО валидным JSON объектом с полями на РУССКОМ языке.'
      : 'You are a business strategy expert. Generate high-quality, specific content for strategy cards. Respond ONLY with a valid JSON object.';

    const userPrompt = isRussian
      ? `${cardConfig.prompt}${contextData}\n\nСгенерируй контент для всех полей: ${cardConfig.fields.join(', ')}\n\nВерни JSON объект с этими полями, все значения на РУССКОМ языке. Пример:\n{"field1": "значение", "field2": "значение"}`
      : `${cardConfig.prompt}${contextData}\n\nGenerate content for all fields: ${cardConfig.fields.join(', ')}\n\nReturn a JSON object with these fields. Example:\n{"field1": "value", "field2": "value"}`;

    console.log('Calling AI API...');

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
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    console.log('AI response:', content);

    // Parse JSON from response
    let cardData: Record<string, any>;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cardData = JSON.parse(jsonMatch[0]);
      } else {
        cardData = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Failed to parse AI response');
    }

    console.log('Generated card data:', cardData);

    return new Response(
      JSON.stringify({ success: true, cardData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in auto-complete-single-card:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate card content'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
