import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const painAreaLabels: Record<string, Record<string, string>> = {
  en: {
    money: 'finances and money',
    time: 'time and productivity',
    services: 'services and utilities',
    health: 'health and fitness',
    education: 'learning and development',
    home: 'home and daily life',
  },
  ru: {
    money: 'финансы и деньги',
    time: 'время и продуктивность',
    services: 'сервисы и услуги',
    health: 'здоровье и фитнес',
    education: 'обучение и развитие',
    home: 'быт и дом',
  },
  es: {
    money: 'finanzas y dinero',
    time: 'tiempo y productividad',
    services: 'servicios y utilidades',
    health: 'salud y fitness',
    education: 'aprendizaje y desarrollo',
    home: 'hogar y vida diaria',
  },
};

const fallbackIdeas: Record<string, Array<{ name: string; analogy: string; tagline: string }>> = {
  en: [
    { name: 'SmartSolver', analogy: 'Uber for problem-solving', tagline: 'AI assistant for your tasks' },
    { name: 'TimeHack', analogy: 'Notion for time', tagline: 'Manage time like a pro' },
    { name: 'EasyFix', analogy: 'Airbnb for services', tagline: 'Find a solution in a minute' },
  ],
  ru: [
    { name: 'SmartSolver', analogy: 'Uber для решения проблем', tagline: 'AI помощник для твоих задач' },
    { name: 'TimeHack', analogy: 'Notion для времени', tagline: 'Управляй временем как профи' },
    { name: 'EasyFix', analogy: 'Airbnb для услуг', tagline: 'Найди решение за минуту' },
  ],
  es: [
    { name: 'SmartSolver', analogy: 'Uber para resolver problemas', tagline: 'Asistente de IA para tus tareas' },
    { name: 'TimeHack', analogy: 'Notion para el tiempo', tagline: 'Gestiona el tiempo como un profesional' },
    { name: 'EasyFix', analogy: 'Airbnb para servicios', tagline: 'Encuentra una solución en un minuto' },
  ],
};

const languageNames: Record<string, string> = {
  en: 'English',
  ru: 'Russian',
  es: 'Spanish',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { painArea, specificPain, language = 'en' } = await req.json();
    
    // Normalize language to supported options
    const lang = ['en', 'ru', 'es'].includes(language) ? language : 'en';
    const areaLabels = painAreaLabels[lang] || painAreaLabels['en'];
    const areaLabel = areaLabels[painArea] || painArea;
    const langName = languageNames[lang] || 'English';

    console.log(`Generating ideas for painArea: ${painArea}, specificPain: ${specificPain}, language: ${lang}`);

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
            content: `You are a startup idea generator. Generate exactly 3 startup ideas based on user pain points. Return JSON only, no markdown. Format: {"ideas":[{"name":"StartupName","analogy":"Uber for X","tagline":"One sentence pitch"}]}`
          },
          {
            role: 'user',
            content: `Pain area: ${areaLabel}. Specific pain: ${specificPain}. Generate 3 creative startup ideas in ${langName}. The analogy and tagline should be in ${langName}.`
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
    
    console.log('AI response content:', content);
    
    // Parse JSON from response
    let ideas;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        ideas = JSON.parse(jsonMatch[0]).ideas;
      }
    } catch (parseErr) {
      console.error('Failed to parse AI response:', content, parseErr);
    }

    // Fallback ideas if parsing fails
    if (!ideas || !Array.isArray(ideas)) {
      console.log('Using fallback ideas for language:', lang);
      ideas = fallbackIdeas[lang] || fallbackIdeas['en'];
    }

    return new Response(JSON.stringify({ ideas }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
