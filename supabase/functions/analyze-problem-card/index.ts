import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PROJECT_SEED_OPTIONS = {
  target: [
    { icon: "🌍", label: "Sovereign Individuals", value: "sovereign" },
    { icon: "💻", label: "Digital Nomads", value: "nomads" },
    { icon: "🛡", label: "DAOs/Communities", value: "daos" },
    { icon: "👤", label: "Niche Users", value: "niche" }
  ],
  pain: [
    { icon: "⏳", label: "Wasted Time/Money", value: "waste" },
    { icon: "⛓", label: "Lack of Freedom", value: "freedom" },
    { icon: "🧩", label: "High Complexity", value: "complexity" },
    { icon: "📉", label: "Inefficiency", value: "inefficiency" }
  ],
  enemy: [
    { icon: "🏛", label: "Too Centralized", value: "centralized" },
    { icon: "💰", label: "Too Expensive", value: "expensive" },
    { icon: "🤖", label: "Outdated Tech", value: "outdated" },
    { icon: "😴", label: "No Soul", value: "soulless" }
  ],
  timing: [
    { icon: "📈", label: "Emerging Trend", value: "trend" },
    { icon: "🔥", label: "Personal Pain", value: "pain" },
    { icon: "🛠", label: "Tech Breakthrough", value: "tech" }
  ]
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { answers, founderName } = await req.json();
    
    if (!answers || answers.length !== 4) {
      return new Response(
        JSON.stringify({ error: 'Invalid answers array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const target = PROJECT_SEED_OPTIONS.target[answers[0]];
    const pain = PROJECT_SEED_OPTIONS.pain[answers[1]];
    const enemy = PROJECT_SEED_OPTIONS.enemy[answers[2]];
    const timing = PROJECT_SEED_OPTIONS.timing[answers[3]];

    const prompt = `You are an expert startup advisor. Analyze this problem specification and provide actionable insights.

PROBLEM SPECIFICATION:
- Target Audience: ${target.icon} ${target.label}
- Core Pain: ${pain.icon} ${pain.label}  
- Why Current Solutions Fail: ${enemy.icon} ${enemy.label}
- Why Now: ${timing.icon} ${timing.label}
- Founder: ${founderName}

Generate a structured analysis with:
1. PROBLEM STATEMENT (2-3 sentences defining the core problem)
2. KEY INSIGHT (1 unique insight about this problem space)
3. RISK FACTOR (1 main risk to watch out for)
4. FIRST STEP (1 concrete action to take this week)

Be concise, actionable, and specific. Avoid generic advice.`;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert startup advisor providing concise, actionable analysis.' },
          { role: 'user', content: prompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_problem",
              description: "Return structured problem analysis",
              parameters: {
                type: "object",
                properties: {
                  problemStatement: { 
                    type: "string",
                    description: "2-3 sentence problem definition"
                  },
                  keyInsight: { 
                    type: "string",
                    description: "1 unique insight about this space"
                  },
                  riskFactor: { 
                    type: "string",
                    description: "1 main risk to watch"
                  },
                  firstStep: { 
                    type: "string",
                    description: "1 concrete action for this week"
                  }
                },
                required: ["problemStatement", "keyInsight", "riskFactor", "firstStep"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "analyze_problem" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response:', JSON.stringify(data, null, 2));
    
    // Extract tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error('No tool call result in response');
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis,
        inputs: {
          target: target.label,
          pain: pain.label,
          enemy: enemy.label,
          timing: timing.label
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-problem-card:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
