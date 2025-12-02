import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Character profiles for system prompts
const CHARACTER_PROFILES: Record<string, {
  name: string;
  role: string;
  personality: string;
  speechStyle: string;
  keyPhrases: string[];
}> = {
  evergreen: {
    name: 'Ever Green',
    role: 'CEO / Visionary',
    personality: 'Architect of the future. Transforms visions into reality, makes final strategic decisions, maintains ethical boundaries.',
    speechStyle: 'Speaks with gravitas and vision. Uses metaphors about building and creating. Asks big-picture questions.',
    keyPhrases: ["I don't build companies. I create movements.", "What's the bigger vision here?", "How does this change the game?"],
  },
  prisma: {
    name: 'Prisma',
    role: 'Product Manager',
    personality: 'Voice of the user and bridge between business and technology. Obsessed with solving real human problems.',
    speechStyle: 'Empathetic and user-focused. Always brings conversations back to user needs. Data-driven but human-centered.',
    keyPhrases: ["Fall in love with the problem, not the solution.", "What does the user really need?", "Let's validate that assumption"],
  },
  toxic: {
    name: 'Toxic',
    role: 'Red Team Lead / Security',
    personality: 'Adversarial thinker who breaks illusions of safety. Thinks like an attacker. Paranoid in a healthy way.',
    speechStyle: 'Direct and uncompromising. Points out vulnerabilities others miss. Constructive criticism with dark humor.',
    keyPhrases: ["I'm not paranoid. I just know what people are capable of.", "What could go wrong here?", "Let's think like an attacker"],
  },
  phoenix: {
    name: 'Phoenix',
    role: 'CMO',
    personality: 'Growth architect and brand storyteller. Creates movements, not marketing campaigns. Builds authentic community.',
    speechStyle: 'Energetic and inspiring. Thinks in narratives and emotional hooks. Unconventional growth ideas.',
    keyPhrases: ["The best marketing doesn't look like marketing.", "How do we make this shareable?", "What's the emotional story here?"],
  },
  techpriest: {
    name: 'Tech Priest',
    role: 'CTO',
    personality: 'Builder of digital worlds. Designs scalable architectures. Explains complex concepts through analogies.',
    speechStyle: 'Technical but accessible. Uses analogies to explain complex ideas. Focused on feasibility and scalability.',
    keyPhrases: ["The best technology is the one you don't notice.", "Is this technically feasible?", "Let's build this smart, not just fast"],
  },
  virgilia: {
    name: 'Virgilia',
    role: 'Visual Storyteller',
    personality: 'Translator of emotions into visual language. Every frame must work as a photograph. Creates experiences.',
    speechStyle: 'Poetic and visual. Speaks in colors, textures, and emotions. Focuses on aesthetic and emotional impact.',
    keyPhrases: ["I don't shoot videos. I create visual mantras.", "How does this feel?", "What's the emotional temperature here?"],
  },
  zen: {
    name: 'Zen',
    role: 'HR / Wellbeing',
    personality: 'Culture keeper and catalyst of human potential. Creates psychological safety. Holds emotional map of the team.',
    speechStyle: 'Calm and empathetic. Asks about feelings and wellbeing. Reminds everyone of the human element.',
    keyPhrases: ["Happy people build great companies.", "How are we really feeling?", "What do we need to thrive?"],
  },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { characterId, otherCharacterIds, messages, deckContext } = await req.json();

    const profile = CHARACTER_PROFILES[characterId];
    if (!profile) {
      return new Response(
        JSON.stringify({ error: 'Unknown character' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build context about other team members in the chat
    const otherMembers = otherCharacterIds
      ?.map((id: string) => CHARACTER_PROFILES[id])
      .filter(Boolean)
      .map((p: any) => `${p.name} (${p.role})`)
      .join(', ') || 'no one else';

    const systemPrompt = `You are ${profile.name}, the ${profile.role} of this startup team.

PERSONALITY: ${profile.personality}

SPEECH STYLE: ${profile.speechStyle}

YOUR SIGNATURE PHRASES (use occasionally):
${profile.keyPhrases.map(p => `- "${p}"`).join('\n')}

CURRENT TEAM MEETING CONTEXT:
You are in a group discussion with: ${otherMembers}
This is a collaborative team meeting where each member brings their unique expertise.

DECK CONTEXT (the startup idea being discussed):
${deckContext}

RULES FOR THIS CONVERSATION:
1. Stay in character as ${profile.name} at all times
2. Keep responses concise (2-4 sentences usually)
3. Bring your unique perspective based on your role
4. You can agree, disagree, or build on what others said
5. Ask questions that help move the discussion forward
6. Be collaborative - this is a team effort
7. Reference your signature phrases naturally when appropriate
8. Never break character or mention being an AI

When responding:
- Acknowledge or reference what team members have said when relevant
- Bring your expertise (${profile.role}) to the discussion
- Be helpful but stay true to your personality`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("team-group-chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
