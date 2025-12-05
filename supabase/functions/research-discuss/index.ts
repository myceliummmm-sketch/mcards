import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const CHARACTER_PROMPTS: Record<string, string> = {
  evergreen: "You are Ever Green, a visionary CEO. You focus on strategic vision and big-picture thinking. Respond thoughtfully and strategically.",
  prisma: "You are Prisma, a Product Manager obsessed with user needs. Focus on practical implications and user impact. Ask clarifying questions when needed.",
  toxic: "You are Toxic, a Red Team Security Lead. Be skeptical and challenge assumptions. Point out risks and weaknesses directly but constructively.",
  phoenix: "You are Phoenix, a CMO focused on growth and market positioning. Think about competitive advantage and go-to-market implications.",
  techpriest: "You are Tech Priest, the CTO. Focus on technical feasibility and implementation considerations. Use clear analogies.",
  zen: "You are Zen, focused on team dynamics and sustainable growth. Bring empathy and consider the human factors.",
  virgilia: "You are Virgilia, a Visual Storyteller. Focus on how insights can be communicated effectively and emotionally."
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { deckId, cardSlot, message, characterId } = await req.json();

    // Verify deck ownership
    const { data: deck, error: deckError } = await supabase
      .from('decks')
      .select('*')
      .eq('id', deckId)
      .eq('user_id', user.id)
      .single();

    if (deckError || !deck) {
      return new Response(JSON.stringify({ error: 'Deck not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get the research result for context
    const { data: researchResult } = await supabase
      .from('research_results')
      .select('*')
      .eq('deck_id', deckId)
      .eq('card_slot', cardSlot)
      .single();

    if (!researchResult) {
      return new Response(JSON.stringify({ error: 'No research result found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const characterPrompt = CHARACTER_PROMPTS[characterId] || CHARACTER_PROMPTS.evergreen;

    const discussionPrompt = `${characterPrompt}

You are discussing research findings with a founder. Here's the context:

RESEARCH FINDINGS:
${JSON.stringify(researchResult.findings, null, 2)}

QUALITY SCORES:
${JSON.stringify(researchResult.rarity_scores, null, 2)}

PREVIOUS TEAM COMMENTS:
${JSON.stringify(researchResult.team_comments, null, 2)}

USER'S QUESTION/COMMENT:
${message}

Respond in your character's voice. Be helpful but stay in character. Keep your response concise (2-4 sentences). If the user has a valid point, acknowledge it. If they're missing something, gently point it out.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'user', content: discussionPrompt }
        ]
      })
    });

    if (!aiResponse.ok) {
      throw new Error('AI response failed');
    }

    const aiData = await aiResponse.json();
    const response = aiData.choices[0].message.content;

    return new Response(JSON.stringify({
      characterId,
      response
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Error in research-discuss:', error);
    return new Response(JSON.stringify({ error: error?.message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});