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
    const { cardType, currentField, previousAnswers, cardDefinition, language = 'en' } = await req.json();
    
    console.log('Generating suggestions for field:', currentField, 'in card type:', cardType, 'language:', language);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const isRussian = language === 'ru';

    // Build context from previous answers
    const context = Object.entries(previousAnswers || {})
      .filter(([_, value]) => value)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    // Get field metadata
    const field = cardDefinition?.formFields?.find((f: any) => f.name === currentField);
    const fieldLabel = field?.label || currentField;
    const fieldPlaceholder = field?.placeholder || '';

    // Build localized prompt
    const prompt = isRussian 
      ? `Ты помогаешь пользователю заполнить карточку "${cardType}" для его стратегии бизнеса.

Текущее поле для заполнения: ${typeof fieldLabel === 'object' ? fieldLabel.ru || fieldLabel.en : fieldLabel}
${fieldPlaceholder ? `Подсказка: ${typeof fieldPlaceholder === 'object' ? fieldPlaceholder.ru || fieldPlaceholder.en : fieldPlaceholder}` : ''}

Контекст из предыдущих ответов:
${context || 'Предыдущих ответов пока нет'}

Сгенерируй 3 разнообразных, качественных предложения для этого поля. Каждое предложение должно:
- Быть конкретным и применимым
- Соответствовать предыдущим ответам
- Отличаться по тону/подходу (например, формальное, неформальное, креативное)
- Быть кратким, но полным

Верни ТОЛЬКО JSON массив из 3 строк на РУССКОМ языке, ничего больше. Пример формата:
["предложение 1", "предложение 2", "предложение 3"]`
      : `You are helping a user fill out a ${cardType} card for their business strategy deck.

Current field to fill: ${typeof fieldLabel === 'object' ? fieldLabel.en : fieldLabel}
${fieldPlaceholder ? `Placeholder hint: ${typeof fieldPlaceholder === 'object' ? fieldPlaceholder.en : fieldPlaceholder}` : ''}

Context from previous answers:
${context || 'No previous answers yet'}

Generate 3 diverse, high-quality suggestions for this field. Each suggestion should:
- Be specific and actionable
- Maintain consistency with previous answers
- Vary in tone/approach (e.g., one formal, one casual, one creative)
- Be concise but complete

Return ONLY a JSON array of 3 strings, nothing else. Example format:
["suggestion 1", "suggestion 2", "suggestion 3"]`;

    const systemPrompt = isRussian
      ? 'Ты эксперт по бизнес-стратегии, помогающий пользователям создавать убедительные стратегические карточки. Всегда возвращай валидный JSON массив ровно из 3 предложений НА РУССКОМ ЯЗЫКЕ.'
      : 'You are a business strategy expert helping users craft compelling strategy cards. Always return valid JSON arrays of exactly 3 suggestions.';

    console.log('Sending request to Lovable AI...');

    // Retry logic for transient errors
    let response: Response | null = null;
    let lastError: string = '';
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: prompt }
            ],
            temperature: 0.8,
          }),
        });

        if (response.ok) break;
        
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: isRussian ? 'Превышен лимит запросов. Попробуйте позже.' : 'Rate limit exceeded. Please try again in a moment.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: isRussian ? 'Лимит AI исчерпан. Пополните баланс.' : 'AI usage limit reached. Please add credits to your workspace.' }),
            { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // For 503 or other transient errors, retry
        if (response.status === 503 || response.status >= 500) {
          lastError = `AI Gateway error: ${response.status}`;
          console.log(`Attempt ${attempt} failed with ${response.status}, retrying...`);
          await new Promise(r => setTimeout(r, 1000 * attempt)); // Exponential backoff
          continue;
        }
        
        const errorText = await response.text();
        console.error('AI Gateway error:', response.status, errorText);
        throw new Error(`AI Gateway error: ${response.status}`);
      } catch (fetchError) {
        lastError = fetchError instanceof Error ? fetchError.message : 'Network error';
        console.log(`Attempt ${attempt} failed: ${lastError}, retrying...`);
        await new Promise(r => setTimeout(r, 1000 * attempt));
      }
    }

    if (!response || !response.ok) {
      console.error('All retry attempts failed:', lastError);
      // Return fallback suggestions
      const fallbackSuggestions = isRussian
        ? [
            'Введите конкретное, применимое описание',
            'Опишите ключевую выгоду или результат',
            'Сфокусируйтесь на потребностях целевой аудитории'
          ]
        : [
            'Enter a specific, actionable description',
            'Describe the key benefit or outcome',
            'Focus on your target audience needs'
          ];
      return new Response(
        JSON.stringify({ suggestions: fallbackSuggestions }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Full AI response:', JSON.stringify(data, null, 2));
    
    // Handle different response formats
    let content = data.choices?.[0]?.message?.content;
    
    // Some models return tool_calls instead of content
    if (!content && data.choices?.[0]?.message?.tool_calls) {
      const toolCall = data.choices[0].message.tool_calls[0];
      if (toolCall?.function?.arguments) {
        content = toolCall.function.arguments;
      }
    }
    
    // Handle refusal or empty responses
    if (!content) {
      console.error('No content found in response. Full data:', JSON.stringify(data));
      // Return fallback suggestions
      const fallbackSuggestions = isRussian
        ? [
            'Введите конкретное, применимое описание',
            'Опишите ключевую выгоду или результат',
            'Сфокусируйтесь на потребностях целевой аудитории'
          ]
        : [
            'Enter a specific, actionable description',
            'Describe the key benefit or outcome',
            'Focus on your target audience needs'
          ];
      return new Response(
        JSON.stringify({ suggestions: fallbackSuggestions }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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