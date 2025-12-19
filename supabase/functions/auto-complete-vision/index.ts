import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Card definitions with prompts for EPIC quality content
const CARD_DEFINITIONS = [
  {
    slot: 2,
    id: 'problem',
    title: 'PROBLEM',
    characterId: 'evergreen',
    fields: ['who_suffers', 'pain_description', 'root_cause', 'pain_cost', 'data_source'],
    coreQuestion: 'What pain do you solve?',
    formula: 'Pain + Cause + Cost',
    prompt: `Generate an EXCEPTIONAL PROBLEM card. Be EXTREMELY specific and detailed:
- WHO exactly suffers? (specific demographics, job titles, situations)
- WHAT specific pain do they experience daily?
- WHY does this problem exist? (root cause analysis)
- WHAT is the real cost? (quantify: hours wasted, money lost, emotional toll)
- Include specific data or research to back claims

Make it compelling, evidence-based, and emotionally resonant.`
  },
  {
    slot: 3,
    id: 'audience',
    title: 'AUDIENCE', 
    characterId: 'prisma',
    fields: ['demographics', 'behaviors', 'goals', 'pain_points', 'purchase_triggers', 'active_hours'],
    coreQuestion: 'Who is your ideal customer?',
    formula: 'Demographics + Behaviors + Triggers',
    prompt: `Generate an EXCEPTIONAL AUDIENCE card. Create a vivid persona:
- Demographics: age range, income, location, profession, education
- Behaviors: daily habits, tools they use, communities they belong to
- Goals: what they're actively trying to achieve
- Pain points: specific frustrations they experience
- Purchase triggers: what makes them buy solutions
- Active hours: when they're most receptive

Be hyper-specific, not generic. Include psychographic details.`
  },
  {
    slot: 4,
    id: 'value',
    title: 'VALUE',
    characterId: 'phoenix',
    fields: ['current_alternative', 'alternative_cost', 'your_solution', 'your_price', 'roi_multiple'],
    coreQuestion: 'Why should they choose you?',
    formula: 'Alternative Cost vs Your Solution ROI',
    prompt: `Generate an EXCEPTIONAL VALUE card. Show compelling value:
- Current alternatives: what do people use now? (competitors, manual processes, workarounds)
- Alternative cost: in time, money, frustration (be specific with numbers)
- Your solution: what makes you unique and better? (specific features/benefits)
- Price positioning: competitive analysis
- ROI multiple: how much do they save/gain vs what they pay?

Show clear 10x value. Use numbers and comparisons.`
  },
  {
    slot: 5,
    id: 'vision',
    title: 'VISION',
    characterId: 'techpriest',
    fields: ['vision_statement', 'who_benefits', 'what_becomes_possible', 'barrier_removed'],
    coreQuestion: 'What world are you building?',
    formula: 'Future State + Beneficiaries + Barriers Removed',
    prompt: `Generate an EXCEPTIONAL VISION card. Paint an inspiring future:
- Vision statement: bold, memorable, 1-2 sentences about the world you're creating
- Who benefits: beyond direct users, who else wins?
- What becomes possible: new capabilities, freedoms, opportunities unlocked
- Barrier removed: what limitation no longer exists?

Make it inspirational yet achievable. Think 5-10 years ahead.`
  }
];

// Extract key product context from Card 1
interface ProductContext {
  productName: string;
  productType: string;
  mainFeature: string;
  targetUser: string;
  industry: string;
  rawContent: string;
}

function extractProductContext(card1Data: Record<string, any>): ProductContext {
  const rawContent = JSON.stringify(card1Data);
  const allText = Object.values(card1Data).filter(v => typeof v === 'string').join(' ').toLowerCase();
  
  // Extract product name (look for capitalized words or first field)
  const productName = card1Data.product_name || card1Data.name || card1Data.title || 
    (Object.values(card1Data)[0] as string)?.split(' ').slice(0, 2).join(' ') || 'the product';
  
  // Extract product type/category - look for specific keywords
  const typeKeywords = [
    'numerology', 'astrology', 'wellness', 'health', 'fitness', 'finance', 'fintech',
    'education', 'edtech', 'marketplace', 'saas', 'ecommerce', 'social', 'gaming',
    'ai', 'machine learning', 'analytics', 'crm', 'erp', 'hrtech', 'legaltech',
    'foodtech', 'proptech', 'insurtech', 'crypto', 'blockchain', 'nft', 'web3',
    'meditation', 'mindfulness', 'coaching', 'consulting', 'agency', 'platform',
    'app', 'tool', 'service', 'software', 'solution', 'system', 'network'
  ];
  
  let productType = 'solution';
  for (const keyword of typeKeywords) {
    if (allText.includes(keyword)) {
      productType = keyword;
      break;
    }
  }
  
  // Extract main feature - look for unique value propositions
  const mainFeature = card1Data.main_feature || card1Data.unique_value || 
    card1Data.core_feature || card1Data.description?.split('.')[0] || 
    `${productType} capabilities`;
  
  // Extract target user
  const targetUser = card1Data.target_audience || card1Data.target_user || 
    card1Data.for_whom || `people interested in ${productType}`;
  
  // Extract industry
  const industryKeywords = ['health', 'tech', 'finance', 'education', 'entertainment', 'retail', 'b2b', 'b2c'];
  let industry = 'technology';
  for (const ind of industryKeywords) {
    if (allText.includes(ind)) {
      industry = ind;
      break;
    }
  }
  
  return {
    productName,
    productType,
    mainFeature,
    targetUser,
    industry,
    rawContent
  };
}

// Validate generated content contains product keywords
function validateProductMentions(content: Record<string, string>, productContext: ProductContext): boolean {
  const contentText = Object.values(content).join(' ').toLowerCase();
  const productType = productContext.productType.toLowerCase();
  
  // Check if product type is mentioned at least once
  const mentions = (contentText.match(new RegExp(productType, 'gi')) || []).length;
  
  return mentions >= 1;
}

// Evaluation criteria
const CRITERIA = [
  { name: 'depth', description: 'How detailed and thorough is the content?', evaluator: 'techpriest' },
  { name: 'relevance', description: 'How connected is this to the project goals?', evaluator: 'prisma' },
  { name: 'credibility', description: 'Is it backed by evidence or data?', evaluator: 'toxic' },
  { name: 'actionability', description: 'How practical and actionable is it?', evaluator: 'prisma' },
  { name: 'impact', description: 'What is the potential effect on success?', evaluator: 'evergreen' },
  { name: 'clarity', description: 'How well articulated is the idea?', evaluator: 'virgilia' },
  { name: 'market_fit', description: 'How aligned with market realities?', evaluator: 'phoenix' }
];

// Image generation config
const PHASE_COLORS = {
  idea: { name: "mint green", hex: "#64FFDA" }
};

const CARD_TEMPLATES: Record<number, { name: string; template: string }> = {
  2: {
    name: 'PAIN POINT',
    template: `straight front view, flat mint green background #64FFDA, dark cracked low-poly geometric form floating in center, warm golden light beam from above touching the form and illuminating cracks with gold kintsugi effect, where light touches darkness begins transforming, visible fractures showing source of suffering, the wound becomes the guide, low-poly 3D style with visible facets, dramatic contrast, 8k render`
  },
  3: {
    name: 'TRUE USER',
    template: `straight front view, flat mint green background #64FFDA, vast field of countless dim particles fading into fog, one single glowing geometric form in sharp focus with coral inner light #FF6B9D, detailed silhouette representing the ideal user archetype, in infinity one resonates, low-poly 3D style with visible facets, 8k render`
  },
  4: {
    name: 'SUCCESS SIGNAL',
    template: `straight front view, flat mint green background #64FFDA, balance scale with two sides, left side massive dim form, right side small intensely luminescent geometric core, scale tips toward brighter smaller side, visible metrics and success indicators, true growth measured by intensity not size, low-poly 3D style with visible facets, 8k render`
  },
  5: {
    name: 'STRANGE GIFT',
    template: `straight front view, flat mint green background #64FFDA, grid of identical dim low-poly forms stretching into fog, one unique geometric mutation cracked open radiating new frequency spectrum, distinctive characteristic setting apart from others, nearby identical forms begin awakening, low-poly 3D style with visible facets, 8k render`
  }
};

const PROTECTION_SUFFIX = `--no text, letters, numbers, words, typography, writing, human faces, human figures, people, person, character, anime, cartoon, photorealistic, lens flare, god rays, smoke swirls, generic glow orbs, floating particles cliche, purple-blue nebula, abstract swooshes, stock imagery, corporate art, gradient mesh blobs, pastel colors, blurry edges, vaporwave`;

// Generate card content with AI - with product context emphasis
async function generateCardContent(
  productContext: ProductContext,
  cardDef: typeof CARD_DEFINITIONS[0],
  language: string,
  previousCardsContext: string,
  isRetry: boolean = false
): Promise<Record<string, string>> {
  const languageInstruction = language === 'ru' 
    ? 'ВАЖНО: Генерируй весь контент на РУССКОМ языке. Будь детальным и специфичным.'
    : 'Generate all content in English. Be detailed and specific.';

  const retryEmphasis = isRetry 
    ? `\n\n⚠️ CRITICAL RETRY: Previous generation was too generic. You MUST mention "${productContext.productType}" at least 3 times in your response. Be EXTREMELY specific to ${productContext.productType}, NOT generic ${productContext.industry}.`
    : '';

  const contextPrompt = `
=== PRODUCT ESSENCE (CRITICAL - FOLLOW THIS EXACTLY) ===
Product Name: ${productContext.productName}
Product Type: ${productContext.productType} <-- MENTION THIS IN EVERY FIELD!
Main Feature: ${productContext.mainFeature}
Target User: ${productContext.targetUser}
Industry: ${productContext.industry}

Raw Product Data:
${productContext.rawContent}

=== PREVIOUS CARDS ===
${previousCardsContext}

=== CRITICAL RULES ===
1. This is specifically about "${productContext.productType}" - NOT generic ${productContext.industry}
2. MUST mention "${productContext.productType}" at least 2-3 times in your content
3. Every pain point, benefit, or insight MUST relate directly to ${productContext.productType}
4. Use specific terminology related to ${productContext.productType}
5. DO NOT use generic phrases like "self-improvement" or "personal development" unless the product IS about that

Example of WRONG (too generic):
"People struggle with finding inner peace and self-understanding..."

Example of RIGHT (product-specific):
"People interested in ${productContext.productType} struggle to find accurate ${productContext.productType} analysis that goes beyond generic interpretations..."
${retryEmphasis}`;

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
          content: `You are an expert startup advisor generating EPIC quality card content for a ${productContext.productType} product.
${languageInstruction}

CRITICAL: You are writing about ${productContext.productType}, not generic ${productContext.industry}. 
Every piece of content must be SPECIFIC to ${productContext.productType}.
Mention "${productContext.productType}" explicitly in your responses.

Generate detailed, insightful, evidence-based content that demonstrates deep understanding of ${productContext.productType} market.
EPIC quality means: specific numbers, real examples for ${productContext.productType}, actionable insights, compelling narrative.
Return ONLY a valid JSON object with the required fields. Each field should be 2-4 sentences.`
        },
        {
          role: 'user',
          content: `${contextPrompt}

=== YOUR TASK ===
${cardDef.prompt}

REMEMBER: This is about ${productContext.productType}, not generic ${productContext.industry}!
Mention "${productContext.productType}" at least 2 times in your response.

Generate the ${cardDef.title} card content. Return a JSON object with these exact fields: ${cardDef.fields.join(', ')}`
        }
      ],
      tools: [
        {
          type: 'function',
          function: {
            name: 'generate_card_content',
            description: `Generate EPIC quality content for the ${cardDef.title} card about ${productContext.productType}`,
            parameters: {
              type: 'object',
              properties: cardDef.fields.reduce((acc, field) => ({
                ...acc,
                [field]: { type: 'string', description: `Detailed content for ${field} specific to ${productContext.productType} (2-4 sentences minimum)` }
              }), {}),
              required: cardDef.fields,
              additionalProperties: false
            }
          }
        }
      ],
      tool_choice: { type: 'function', function: { name: 'generate_card_content' } }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Content AI API error:', response.status, errorText);
    throw new Error(`Content AI API error: ${response.status}`);
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (toolCall?.function?.arguments) {
    return JSON.parse(toolCall.function.arguments);
  }

  const content = data.choices?.[0]?.message?.content;
  if (content) {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  }

  throw new Error('Failed to parse content AI response');
}

// Generate card image with AI - with retry logic
async function generateCardImage(cardSlot: number, maxRetries: number = 3): Promise<string> {
  const template = CARD_TEMPLATES[cardSlot];
  if (!template) {
    throw new Error(`No template for slot ${cardSlot}`);
  }

  const prompt = template.template + ' ' + PROTECTION_SUFFIX;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Image generation attempt ${attempt}/${maxRetries} for card ${cardSlot}`);
      
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-image-preview',
          messages: [{ role: 'user', content: prompt }],
          modalities: ['image', 'text']
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Image AI API error (attempt ${attempt}):`, response.status, errorText);
        lastError = new Error(`Image AI API error: ${response.status}`);
        
        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
        continue;
      }

      const data = await response.json();
      const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      
      if (!imageUrl) {
        console.error(`No image in response (attempt ${attempt})`);
        lastError = new Error('No image generated');
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
        continue;
      }

      console.log(`Image generated successfully for card ${cardSlot} on attempt ${attempt}`);
      return imageUrl;
      
    } catch (err) {
      console.error(`Image generation error (attempt ${attempt}):`, err);
      lastError = err instanceof Error ? err : new Error('Unknown error');
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  throw lastError || new Error('Failed to generate image after all retries');
}

// Evaluate card with AI team
async function evaluateCard(
  cardDef: typeof CARD_DEFINITIONS[0],
  cardContent: Record<string, string>,
  language: string = 'en'
): Promise<any> {
  const isRussian = language === 'ru';
  
  const promptIntro = isRussian
    ? `Ты команда ЭНТУЗИАСТНЫХ стартап-экспертов, оценивающих карточку "${cardDef.id}".
Эта карточка сгенерирована AI для ЭПИК качества, оценивай честно, но стремись к ВЫСОКИМ оценкам.`
    : `You are a team of ENTHUSIASTIC startup experts evaluating a "${cardDef.id}" card.
This card was generated by AI to be EPIC quality, so evaluate it fairly but aim for HIGH scores.`;

  const cardQuestionLabel = isRussian ? 'Вопрос карточки' : 'Card Question';
  const cardFormulaLabel = isRussian ? 'Формула карточки' : 'Card Formula';
  const cardContentLabel = isRussian ? 'Содержание карточки' : 'Card Content';

  const scoringGuidelines = isRussian
    ? `РУКОВОДСТВО ПО ОЦЕНКЕ ДЛЯ AI-СГЕНЕРИРОВАННОГО ЭПИК КОНТЕНТА:
- Это профессионально сгенерированный контент, оценивай честно
- Используй оценки 7-10 для хорошо детализированного контента
- 7-8: Хороший контент с чёткими деталями
- 9-10: Отличный контент со специфическими инсайтами`
    : `SCORING GUIDELINES FOR AI-GENERATED EPIC CONTENT:
- This is professionally generated content, score it fairly
- Use scores 7-10 for well-detailed content
- 7-8: Good content with clear details
- 9-10: Excellent content with specific insights`;

  const evaluateLabel = isRussian ? 'Оцени по 7 критериям' : 'Evaluate on these 7 criteria';
  const instructionLabel = isRussian
    ? 'Для каждого критерия укажи оценку (7-10) и краткое позитивное объяснение (1-2 предложения).'
    : 'For each criterion, provide a score (7-10) and a brief positive explanation (1-2 sentences).';
  const responseLabel = isRussian ? 'Ответь ТОЛЬКО валидным JSON' : 'Respond ONLY with valid JSON';
  const langInstruction = isRussian 
    ? 'ВАЖНО: Все объяснения ДОЛЖНЫ быть на РУССКОМ языке!' 
    : 'IMPORTANT: All explanations MUST be in ENGLISH!';

  const prompt = `${langInstruction}

${promptIntro}

${cardQuestionLabel}: ${cardDef.coreQuestion}
${cardFormulaLabel}: ${cardDef.formula}

${cardContentLabel}:
${JSON.stringify(cardContent, null, 2)}

${scoringGuidelines}

${evaluateLabel}:
${CRITERIA.map(c => `- ${c.name}: ${c.description} (Evaluator: ${c.evaluator})`).join('\n')}

${instructionLabel}

${responseLabel}:
{
  "depth": { "score": YOUR_SCORE, "explanation": "${isRussian ? 'Твоя оценка...' : 'Your evaluation...'}" },
  "relevance": { "score": YOUR_SCORE, "explanation": "${isRussian ? 'Твоя оценка...' : 'Your evaluation...'}" },
  "credibility": { "score": YOUR_SCORE, "explanation": "${isRussian ? 'Твоя оценка...' : 'Your evaluation...'}" },
  "actionability": { "score": YOUR_SCORE, "explanation": "${isRussian ? 'Твоя оценка...' : 'Your evaluation...'}" },
  "impact": { "score": YOUR_SCORE, "explanation": "${isRussian ? 'Твоя оценка...' : 'Your evaluation...'}" },
  "clarity": { "score": YOUR_SCORE, "explanation": "${isRussian ? 'Твоя оценка...' : 'Your evaluation...'}" },
  "market_fit": { "score": YOUR_SCORE, "explanation": "${isRussian ? 'Твоя оценка...' : 'Your evaluation...'}" }
}`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [{ role: 'user', content: prompt }]
    }),
  });

  if (!response.ok) {
    console.error('Evaluation AI API error:', response.status);
    throw new Error(`Evaluation AI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('No evaluation generated');
  }

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid evaluation format');
  }

  const evaluation = JSON.parse(jsonMatch[0]);

  // Add evaluator names
  const enrichedEvaluation: any = {};
  for (const criterion of CRITERIA) {
    if (evaluation[criterion.name]) {
      enrichedEvaluation[criterion.name] = {
        ...evaluation[criterion.name],
        evaluator: criterion.evaluator
      };
    }
  }

  // Calculate overall score
  const scores = Object.values(enrichedEvaluation).map((e: any) => e.score);
  const overall = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
  enrichedEvaluation.overall = Math.round(overall * 10) / 10;

  return enrichedEvaluation;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { deckId, card1Data, language = 'en', singleSlot } = await req.json();

    // For single card mode, we only need deckId and singleSlot
    if (!deckId) {
      return new Response(
        JSON.stringify({ error: 'Missing deckId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For batch mode, we need card1Data
    if (!singleSlot && !card1Data) {
      return new Response(
        JSON.stringify({ error: 'Missing card1Data for batch mode' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await createClient(
      SUPABASE_URL,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    ).auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine cost based on mode
    const isSingleMode = !!singleSlot;
    const COST = isSingleMode ? 10 : 40;

    // Check spore balance
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('spore_balance')
      .eq('user_id', user.id)
      .single();

    const sporeBalance = subscription?.spore_balance || 0;

    if (sporeBalance < COST) {
      return new Response(
        JSON.stringify({ error: 'Insufficient spores', required: COST, balance: sporeBalance }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Deduct spores
    await supabase
      .from('user_subscriptions')
      .update({ spore_balance: sporeBalance - COST })
      .eq('user_id', user.id);

    // Log transaction
    await supabase
      .from('spore_transactions')
      .insert({
        user_id: user.id,
        amount: -COST,
        transaction_type: 'purchase',
        description: isSingleMode ? `Auto-Complete Card #${singleSlot}` : 'Auto-Complete Vision (4 cards)',
        reference_id: deckId
      });

    // For single slot mode, fetch card1Data from database
    let actualCard1Data = card1Data;
    if (isSingleMode && !card1Data) {
      const { data: card1Row } = await supabase
        .from('deck_cards')
        .select('card_data')
        .eq('deck_id', deckId)
        .eq('card_slot', 1)
        .single();

      if (!card1Row?.card_data) {
        return new Response(
          JSON.stringify({ error: 'Card 1 must be filled first' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      actualCard1Data = card1Row.card_data;
    }

    // Determine which cards to generate
    const cardsToGenerate = isSingleMode
      ? CARD_DEFINITIONS.filter(c => c.slot === singleSlot)
      : CARD_DEFINITIONS;

    // Stream results back
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Extract product context from Card 1
        const productContext = extractProductContext(actualCard1Data);
        console.log('Extracted product context:', productContext);
        console.log('Mode:', isSingleMode ? `single card ${singleSlot}` : 'batch');

        let previousCardsContext = '';

        for (const cardDef of cardsToGenerate) {
          // Send progress update - generating content
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'progress',
            slot: cardDef.slot,
            status: 'generating',
            characterId: cardDef.characterId,
            stage: 'content'
          })}\n\n`));

          try {
            // Step 1: Generate content with validation
            console.log(`Generating content for card ${cardDef.slot}...`);
            let cardContent = await generateCardContent(productContext, cardDef, language, previousCardsContext, false);
            
            // Validate product mentions
            if (!validateProductMentions(cardContent, productContext)) {
              console.log(`Card ${cardDef.slot} validation failed, regenerating with emphasis...`);
              cardContent = await generateCardContent(productContext, cardDef, language, previousCardsContext, true);
            }
            console.log(`Content generated for card ${cardDef.slot}`);

            // Send progress update - generating image
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'progress',
              slot: cardDef.slot,
              status: 'generating',
              characterId: cardDef.characterId,
              stage: 'image'
            })}\n\n`));

            // Step 2: Generate image
            console.log(`Generating image for card ${cardDef.slot}...`);
            let imageUrl = null;
            try {
              imageUrl = await generateCardImage(cardDef.slot);
              console.log(`Image generated for card ${cardDef.slot}`);
            } catch (imgErr) {
              console.error(`Image generation failed for card ${cardDef.slot}:`, imgErr);
              // Continue without image
            }

            // Send progress update - evaluating
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'progress',
              slot: cardDef.slot,
              status: 'generating',
              characterId: cardDef.characterId,
              stage: 'evaluation'
            })}\n\n`));

            // Step 3: Evaluate card
            console.log(`Evaluating card ${cardDef.slot}...`);
            let evaluation = null;
            try {
              evaluation = await evaluateCard(cardDef, cardContent, language);
              console.log(`Evaluation complete for card ${cardDef.slot}, score: ${evaluation.overall}`);
            } catch (evalErr) {
              console.error(`Evaluation failed for card ${cardDef.slot}:`, evalErr);
              // Continue without evaluation
            }

            // Step 4: Save to database
            const { error: upsertError } = await supabase
              .from('deck_cards')
              .upsert({
                deck_id: deckId,
                card_slot: cardDef.slot,
                card_type: cardDef.id,
                card_data: cardContent,
                card_image_url: imageUrl,
                evaluation: evaluation,
                last_evaluated_at: evaluation ? new Date().toISOString() : null,
                updated_at: new Date().toISOString()
              }, {
                onConflict: 'deck_id,card_slot'
              });

            if (upsertError) {
              console.error(`Database save error for card ${cardDef.slot}:`, upsertError);
              throw upsertError;
            }

            // Update context for next card
            previousCardsContext += `\nCard ${cardDef.slot} (${cardDef.title}): ${JSON.stringify(cardContent)}`;

            // Send completion update
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'complete',
              slot: cardDef.slot,
              cardData: cardContent,
              imageUrl: imageUrl,
              evaluation: evaluation
            })}\n\n`));

          } catch (err) {
            console.error(`Error generating card ${cardDef.slot}:`, err);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'error',
              slot: cardDef.slot,
              error: err instanceof Error ? err.message : 'Unknown error'
            })}\n\n`));
          }
        }

        // Send final completion
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'finished'
        })}\n\n`));

        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    });

  } catch (err) {
    console.error('Auto-complete error:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
