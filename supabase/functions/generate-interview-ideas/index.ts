import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const painAreaLabels: Record<string, string> = {
  money: 'финансы и деньги',
  time: 'время и продуктивность',
  services: 'сервисы и услуги',
  health: 'здоровье и фитнес',
  education: 'обучение и развитие',
  home: 'быт и дом',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { painArea, specificPain } = await req.json();
    const areaLabel = painAreaLabels[painArea] || painArea;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a startup idea generator. Generate exactly 3 startup ideas based on user pain points. Return JSON only, no markdown. Format: {"ideas":[{"name":"StartupName","analogy":"Uber для X","tagline":"One sentence pitch"}]}`
          },
          {
            role: 'user',
            content: `Pain area: ${areaLabel}. Specific pain: ${specificPain}. Generate 3 creative startup ideas in Russian.`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('AI error:', response.status, errText);
      throw new Error('AI generation failed');
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || '';
    
    // Parse JSON from response
    let ideas;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        ideas = JSON.parse(jsonMatch[0]).ideas;
      }
    } catch {
      console.error('Failed to parse AI response:', content);
    }

    // Fallback ideas if parsing fails
    if (!ideas || !Array.isArray(ideas)) {
      ideas = [
        { name: 'SmartSolver', analogy: 'Uber для решения проблем', tagline: 'AI помощник для твоих задач' },
        { name: 'TimeHack', analogy: 'Notion для времени', tagline: 'Управляй временем как профи' },
        { name: 'EasyFix', analogy: 'Airbnb для услуг', tagline: 'Найди решение за минуту' },
      ];
    }

    return new Response(JSON.stringify({ ideas }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
