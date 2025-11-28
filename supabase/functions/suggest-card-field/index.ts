import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cardType, currentField, previousAnswers, cardDefinition } = await req.json();
    
    console.log('Generating suggestions for field:', currentField, 'in card type:', cardType);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build context from previous answers
    const context = Object.entries(previousAnswers || {})
      .filter(([_, value]) => value)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    // Get field metadata
    const field = cardDefinition?.formFields?.find((f: any) => f.name === currentField);
    const fieldLabel = field?.label || currentField;
    const fieldPlaceholder = field?.placeholder || '';

    // Build prompt
    const prompt = `You are helping a user fill out a ${cardType} card for their business strategy deck.

Current field to fill: ${fieldLabel}
${fieldPlaceholder ? `Placeholder hint: ${fieldPlaceholder}` : ''}

Context from previous answers:
${context || 'No previous answers yet'}

Generate 3 diverse, high-quality suggestions for this field. Each suggestion should:
- Be specific and actionable
- Maintain consistency with previous answers
- Vary in tone/approach (e.g., one formal, one casual, one creative)
- Be concise but complete

Return ONLY a JSON array of 3 strings, nothing else. Example format:
["suggestion 1", "suggestion 2", "suggestion 3"]`;

    console.log('Sending request to Lovable AI...');

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
            content: 'You are a business strategy expert helping users craft compelling strategy cards. Always return valid JSON arrays of exactly 3 suggestions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI usage limit reached. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    console.log('Raw AI response:', content);

    // Parse the JSON response
    let suggestions: string[];
    try {
      // Try to extract JSON array from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        suggestions = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback: split by newlines and clean up
      suggestions = content
        .split('\n')
        .filter((line: string) => line.trim() && !line.startsWith('[') && !line.startsWith(']'))
        .map((line: string) => line.replace(/^["\-\d\.]\s*/, '').replace(/[",]*$/, ''))
        .filter((s: string) => s.length > 10)
        .slice(0, 3);
    }

    // Ensure we have exactly 3 suggestions
    if (!Array.isArray(suggestions) || suggestions.length < 1) {
      throw new Error('Invalid suggestions format');
    }

    // Trim to 3 suggestions max
    suggestions = suggestions.slice(0, 3);

    console.log('Generated suggestions:', suggestions);

    return new Response(
      JSON.stringify({ suggestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in suggest-card-field:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to generate suggestions',
        suggestions: [] 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});