import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, deckId, phase } = await req.json();

    if (!messages || messages.length < 2) {
      return new Response(
        JSON.stringify({ error: 'Need at least one exchange to crystallize' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build conversation summary for the AI
    const conversationText = messages
      .map((m: { role: string; content: string; characterName?: string }) => 
        m.characterName ? `[${m.characterName}]: ${m.content}` : `[User]: ${m.content}`
      )
      .join('\n');

    // Step 1: Extract insight with title using tool calling
    const extractResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert at distilling conversations into powerful, actionable insights. 
Extract the single most valuable insight from the conversation. Focus on:
- Key strategic decisions or pivots
- Unique market/customer insights
- Technical or product breakthroughs
- Important warnings or risks identified
- Innovative solutions proposed

Be punchy and direct. The insight should be memorable and actionable.`
          },
          {
            role: "user",
            content: `Extract the core insight from this team conversation:\n\n${conversationText}`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "save_insight",
              description: "Save a crystallized insight from the conversation",
              parameters: {
                type: "object",
                properties: {
                  title: {
                    type: "string",
                    description: "A punchy 2-5 word title for the insight"
                  },
                  insight: {
                    type: "string", 
                    description: "The core insight in 1-2 sentences. Be direct and actionable."
                  },
                  topic: {
                    type: "string",
                    description: "The main topic/category of this insight",
                    enum: ["strategy", "product", "market", "tech", "growth", "risk", "innovation", "customer"]
                  }
                },
                required: ["title", "insight", "topic"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "save_insight" } }
      }),
    });

    if (!extractResponse.ok) {
      console.error("AI extraction error:", extractResponse.status);
      throw new Error("Failed to extract insight");
    }

    const extractData = await extractResponse.json();
    const toolCall = extractData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      throw new Error("No insight extracted");
    }

    const { title, insight, topic } = JSON.parse(toolCall.function.arguments);

    // Step 2: Generate mineral/crystalline image
    console.log("Generating mineral image for insight:", title);
    
    const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: `Generate a beautiful, abstract mineral crystal formation. 
Style: Deep amethyst and teal gradient colors, geometric facets catching light, mystical glow.
The crystal should feel like a crystallized thought or captured moment of wisdom.
Subject matter hint: "${title}" - ${topic}
Ultra high resolution, 1:1 aspect ratio, dark moody background with soft ambient glow.`
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    let imageUrl = null;
    if (imageResponse.ok) {
      const imageData = await imageResponse.json();
      imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url || null;
      console.log("Image generated:", imageUrl ? "success" : "no image in response");
    } else {
      console.error("Image generation failed:", imageResponse.status);
    }

    // Step 3: Save to database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the next available negative slot for insights
    const { data: existingInsights } = await supabase
      .from('deck_cards')
      .select('card_slot')
      .eq('deck_id', deckId)
      .eq('is_insight', true)
      .order('card_slot', { ascending: true });

    const usedSlots = existingInsights?.map(c => c.card_slot) || [];
    let nextSlot = -1;
    while (usedSlots.includes(nextSlot)) {
      nextSlot--;
    }

    const cardData = {
      title,
      insight,
      topic,
      phase: phase || 'general',
      crystallizedAt: new Date().toISOString(),
      messageCount: messages.length
    };

    const { data: savedCard, error: saveError } = await supabase
      .from('deck_cards')
      .insert({
        deck_id: deckId,
        card_slot: nextSlot,
        card_type: 'Insight',
        card_data: cardData,
        card_image_url: imageUrl,
        is_insight: true
      })
      .select()
      .single();

    if (saveError) {
      console.error("Save error:", saveError);
      throw new Error("Failed to save insight card");
    }

    return new Response(
      JSON.stringify({
        success: true,
        card: savedCard,
        title,
        insight,
        topic,
        imageUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("crystallize-insight error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
