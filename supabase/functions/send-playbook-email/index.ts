import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Character data for personalization
const CHARACTERS: Record<string, { name: string; emoji: string; title: string; color: string; avatar: string }> = {
  start_paralysis: {
    name: "Ever Green",
    emoji: "🌱",
    title: "The Eternal Optimist",
    color: "#22c55e",
    avatar: "ever.png",
  },
  perfectionism: {
    name: "Tech Priest",
    emoji: "⚙️",
    title: "The Systems Architect",
    color: "#8b5cf6",
    avatar: "techpriest.png",
  },
  fear_of_choice: {
    name: "Prisma",
    emoji: "🔮",
    title: "The Strategic Oracle",
    color: "#ec4899",
    avatar: "prisma.png",
  },
  fear_of_repeat: {
    name: "Toxic",
    emoji: "☢️",
    title: "The Risk Analyst",
    color: "#eab308",
    avatar: "toxic.png",
  },
  resource_anxiety: {
    name: "Zen",
    emoji: "🧘",
    title: "The Mindful Mentor",
    color: "#06b6d4",
    avatar: "zen.png",
  },
  impostor_syndrome: {
    name: "Phoenix",
    emoji: "🔥",
    title: "The Comeback Coach",
    color: "#f97316",
    avatar: "phoenix.png",
  },
};

// AI Team members for display
const AI_TEAM = [
  { name: "Ever Green", emoji: "🌱", role: "Idea Spark", avatar: "ever.png", color: "#22c55e" },
  { name: "Prisma", emoji: "🔮", role: "Strategic Oracle", avatar: "prisma.png", color: "#ec4899" },
  { name: "Toxic", emoji: "☢️", role: "Risk Analyst", avatar: "toxic.png", color: "#eab308" },
  { name: "Phoenix", emoji: "🔥", role: "Comeback Coach", avatar: "phoenix.png", color: "#f97316" },
  { name: "Tech Priest", emoji: "⚙️", role: "Systems Architect", avatar: "techpriest.png", color: "#8b5cf6" },
  { name: "Virgilia", emoji: "👁️", role: "Guide & Mentor", avatar: "virgilia.png", color: "#6366f1" },
  { name: "Zen", emoji: "🧘", role: "Mindful Balance", avatar: "zen.png", color: "#06b6d4" },
];

// Playbook content by blocker type
const PLAYBOOK_CONTENT: Record<string, { title: string; intro: string; steps: { title: string; content: string }[]; callToAction: string }> = {
  start_paralysis: {
    title: "The 72-Hour Launch Framework",
    intro: "You're not stuck because your idea isn't good enough. You're stuck because you're trying to solve everything at once.",
    steps: [
      {
        title: "Hour 1-4: Define Your Minimum Testable Idea",
        content: "Strip your idea down to ONE problem and ONE solution. Write it in one sentence: 'I help [WHO] do [WHAT] when [SITUATION].'",
      },
      {
        title: "Hour 5-24: Build the Simplest Version",
        content: "No code needed. Create a landing page, a Google Form, or even a WhatsApp group. The goal is to describe your solution, not build it.",
      },
      {
        title: "Hour 25-72: Get 5 Real Reactions",
        content: "Share with 5 people who fit your target audience. Don't ask 'would you use this?' Ask 'what would you pay for this?' or 'what's stopping you from solving this problem today?'",
      },
    ],
    callToAction: "Start your first card in Mycelium and let our AI team help you clarify your one-sentence idea.",
  },
  perfectionism: {
    title: "The MVP Mindset Shift",
    intro: "Your perfectionism isn't a flaw—it's a superpower. But right now, it's pointed in the wrong direction.",
    steps: [
      {
        title: "Reframe Quality",
        content: "The highest quality thing you can build is something that SOLVES A REAL PROBLEM. A polished product nobody wants is lower quality than an ugly prototype that changes lives.",
      },
      {
        title: "Set Version Numbers",
        content: "You're building v0.1, not v1.0. Give yourself permission to ship something imperfect by labeling it clearly. 'This is our early alpha' sets expectations.",
      },
      {
        title: "Define Done for THIS Week",
        content: "Instead of a perfect end goal, define what 'good enough for this week' looks like. Ship that. Then improve next week.",
      },
    ],
    callToAction: "Use Mycelium's card system to break your grand vision into shippable weekly milestones.",
  },
  fear_of_choice: {
    title: "The Decision Clarity Matrix",
    intro: "You're not afraid of making the wrong choice. You're afraid of closing doors. Here's how to choose without regret.",
    steps: [
      {
        title: "The 10-10-10 Test",
        content: "How will you feel about this decision in 10 minutes? 10 months? 10 years? Most decisions that feel huge today are reversible tomorrow.",
      },
      {
        title: "Minimum Viable Commitment",
        content: "Instead of choosing forever, choose for 30 days. 'I'll focus on B2B for 30 days, then reassess.' Time-boxing removes the pressure of permanent decisions.",
      },
      {
        title: "Two-Way Door Decisions",
        content: "Ask: Can I undo this? Most startup decisions are two-way doors. You can walk back through. Only treat one-way doors (large investments, legal commitments) as serious.",
      },
    ],
    callToAction: "Let Mycelium's AI advisors help you map out your options and identify which decisions are actually reversible.",
  },
  fear_of_repeat: {
    title: "The Failure Immunity Protocol",
    intro: "Your past failure isn't a curse—it's data. The founders who succeed aren't luckier; they're better at extracting lessons.",
    steps: [
      {
        title: "The Failure Autopsy",
        content: "Write down what actually killed your last venture. Not 'it failed' but the specific moment or decision. Was it timing? Team? Market? Be ruthlessly specific.",
      },
      {
        title: "Build the Anti-Pattern",
        content: "Whatever killed you last time, build the opposite into your DNA this time. If you ran out of money, start with revenue. If you built too much, validate first.",
      },
      {
        title: "The Pre-Mortem",
        content: "Before you start, imagine this venture failed. What would be the reason? Now build systems to prevent that specific failure.",
      },
    ],
    callToAction: "Use Mycelium to document your lessons and let our AI advisors help you spot patterns you might miss.",
  },
  resource_anxiety: {
    title: "The Bootstrap Reality Check",
    intro: "You don't need as much as you think. Most successful startups started with less than you have right now.",
    steps: [
      {
        title: "The Ramen Numbers",
        content: "Calculate your actual survival minimum. How many months can you sustain yourself while building? Most founders overestimate their needs by 3x.",
      },
      {
        title: "Revenue-First Thinking",
        content: "Instead of 'how do I fund this?' ask 'how can I get paid while building this?' Pre-sales, consulting in your space, or building for a paying first customer.",
      },
      {
        title: "The $1,000 Test",
        content: "Can you test your core idea for under $100? If not, you're overcomplicating it. Every big startup started with a version that cost almost nothing to test.",
      },
    ],
    callToAction: "Map out your minimum viable budget with Mycelium and discover creative paths to early revenue.",
  },
  impostor_syndrome: {
    title: "The Credibility Blueprint",
    intro: "Impostor syndrome isn't a sign you're unqualified. It's a sign you're pushing into new territory. That's exactly where founders should be.",
    steps: [
      {
        title: "Document Your Unique Edge",
        content: "What experiences, perspectives, or skills do you have that others in this space don't? Your 'imposter' feeling often comes from comparing yourself to experts in ONE dimension while ignoring your unique combination.",
      },
      {
        title: "Build in Public",
        content: "Share your journey, not your expertise. 'I'm learning X' is more relatable than 'I'm an expert in X.' Your audience grows with you.",
      },
      {
        title: "The Credentials Shortcut",
        content: "Borrow credibility through association. Interview experts, partner with established players, get testimonials from early users. You don't need to be the expert; you need access to experts.",
      },
    ],
    callToAction: "Let Mycelium help you articulate your unique founder advantage and build your credibility story.",
  },
};

// Get translations
function getTranslations(language: string) {
  const isRussian = language === 'ru';
  const isSpanish = language === 'es';

  return {
    greeting: isSpanish 
      ? `Hola, fundador 👋` 
      : isRussian 
      ? `Привет, основатель 👋` 
      : `Hey there, founder 👋`,
    scoreLabel: isSpanish
      ? `Tu puntuación del quiz`
      : isRussian
      ? `Ваш результат теста`
      : `Your quiz score`,
    daysLabel: isSpanish
      ? `Días proyectados hasta tus primeros $1,000`
      : isRussian
      ? `Прогнозируемые дни до первых $1,000`
      : `Projected days to your first $1,000`,
    daysUnit: isSpanish ? `días` : isRussian ? `дней` : `days`,
    advisorTitle: isSpanish
      ? `Tu asesor IA personal`
      : isRussian
      ? `Ваш персональный AI-советник`
      : `Your Personal AI Advisor`,
    checklistTitle: isSpanish
      ? `📋 Tu checklist de lanzamiento de 5 pasos`
      : isRussian
      ? `📋 Ваш 5-шаговый чек-лист запуска`
      : `📋 Your 5-Step Launch Checklist`,
    checklist: isSpanish
      ? [
          { emoji: "🎯", text: "Define tu único problema (hoy)" },
          { emoji: "📝", text: "Crea tu primera carta (15 min)" },
          { emoji: "💬", text: "Obtén retroalimentación del equipo IA (instantáneo)" },
          { emoji: "🧪", text: "Prueba con 5 personas reales (48 horas)" },
          { emoji: "💰", text: "Lanza y obtén tus primeros $1,000 (14 días)" },
        ]
      : isRussian
      ? [
          { emoji: "🎯", text: "Определите одну проблему (сегодня)" },
          { emoji: "📝", text: "Создайте первую карточку (15 мин)" },
          { emoji: "💬", text: "Получите отзыв AI-команды (мгновенно)" },
          { emoji: "🧪", text: "Протестируйте с 5 реальными людьми (48 часов)" },
          { emoji: "💰", text: "Запуск и первые $1,000 (14 дней)" },
        ]
      : [
          { emoji: "🎯", text: "Define Your One Problem (today)" },
          { emoji: "📝", text: "Create Your First Card (15 min)" },
          { emoji: "💬", text: "Get AI Team Feedback (instant)" },
          { emoji: "🧪", text: "Test With 5 Real People (48 hours)" },
          { emoji: "💰", text: "Launch & Get First $1,000 (14 days)" },
        ],
    meetTeamTitle: isSpanish
      ? `👥 Conoce a tu equipo IA`
      : isRussian
      ? `👥 Познакомьтесь с вашей AI-командой`
      : `👥 Meet Your AI Team`,
    meetTeamSubtitle: isSpanish
      ? `7 asesores especializados listos para guiarte`
      : isRussian
      ? `7 специализированных советников готовы помочь вам`
      : `7 specialized advisors ready to guide you`,
    whyWorksTitle: isSpanish
      ? `¿Por qué funciona Mycelium?`
      : isRussian
      ? `Почему Mycelium работает?`
      : `Why Mycelium Works`,
    whyWorks: isSpanish
      ? [
          { icon: "🧠", title: "Equipo IA curado por humanos", desc: "7 asesores especializados, cada uno entrenado con la sabiduría de miles de fundadores." },
          { icon: "🎴", title: "Sistema de validación de 21 cartas", desc: "Cartas estructuradas te guían desde la idea inicial hasta los ingresos en 14 días." },
          { icon: "📈", title: "Responsabilidad integrada", desc: "Rastrea cada paso. Sabe exactamente dónde estás en el camino a $1,000." },
        ]
      : isRussian
      ? [
          { icon: "🧠", title: "AI-команда под руководством людей", desc: "7 специализированных советников, каждый обучен на мудрости тысяч основателей." },
          { icon: "🎴", title: "Система валидации из 21 карты", desc: "Структурированные карты ведут вас от идеи к доходу за 14 дней." },
          { icon: "📈", title: "Встроенная ответственность", desc: "Отслеживайте каждый шаг. Точно знайте, где вы на пути к $1,000." },
        ]
      : [
          { icon: "🧠", title: "Human-Curated AI Team", desc: "7 specialized advisors, each trained on startup wisdom from thousands of founders." },
          { icon: "🎴", title: "21-Card Validation System", desc: "Structured cards guide you from raw idea to revenue in 14 days." },
          { icon: "📈", title: "Built-in Accountability", desc: "Track every step. Know exactly where you are on the path to $1,000." },
        ],
    ctaMain: isSpanish
      ? `Conoce a tu equipo IA y comienza ahora`
      : isRussian
      ? `Познакомьтесь с AI-командой и начните сейчас`
      : `Meet Your AI Team & Start Now`,
    ctaSubtext: isSpanish
      ? `Tu hoja de ruta personalizada te espera`
      : isRussian
      ? `Ваша персональная дорожная карта ждёт вас`
      : `Your personalized roadmap is waiting`,
    footer: isSpanish
      ? `Construido con 💚 por el equipo de Mycelium`
      : isRussian
      ? `Создано с 💚 командой Mycelium`
      : `Built with 💚 by the Mycelium team`,
  };
}

// Generate HTML email
function generatePlaybookEmail(
  email: string,
  blocker: string,
  score: number,
  language: string = 'en'
): string {
  const character = CHARACTERS[blocker] || CHARACTERS.start_paralysis;
  const playbook = PLAYBOOK_CONTENT[blocker] || PLAYBOOK_CONTENT.start_paralysis;
  const t = getTranslations(language);
  
  // Calculate projected days to first $1000 (inverse relationship with score)
  const daysTo1000 = Math.max(7, Math.round(60 - (score * 0.4)));
  
  const baseUrl = "https://mycelium.gg";
  const avatarBaseUrl = "https://mycelium.gg/avatars";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${playbook.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a; color: #e5e5e5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
          
          <!-- Header -->
          <tr>
            <td style="text-align: center; padding-bottom: 30px;">
              <h1 style="margin: 0; font-size: 28px; color: #22c55e;">🍄 Mycelium</h1>
              <p style="margin: 10px 0 0; color: #737373; font-size: 14px;">Your AI-Powered Startup Playbook</p>
            </td>
          </tr>
          
          <!-- Greeting -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a1a 0%, #0d1f0d 100%); border-radius: 16px; padding: 30px; margin-bottom: 20px;">
              <p style="margin: 0 0 15px; font-size: 18px;">${t.greeting}</p>
              <p style="margin: 0 0 10px; color: #a3a3a3;">${t.scoreLabel}: <strong style="color: #22c55e;">${score}/100</strong></p>
              <p style="margin: 0; color: #a3a3a3;">${t.daysLabel}: <strong style="color: #22c55e;">${daysTo1000} ${t.daysUnit}</strong></p>
            </td>
          </tr>
          
          <!-- Spacer -->
          <tr><td style="height: 20px;"></td></tr>
          
          <!-- Character Card -->
          <tr>
            <td style="background: #1a1a1a; border-radius: 16px; padding: 25px; border-left: 4px solid ${character.color};">
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td width="70" style="vertical-align: top;">
                    <img src="${avatarBaseUrl}/${character.avatar}" alt="${character.name}" width="60" height="60" style="border-radius: 50%; border: 2px solid ${character.color};" />
                  </td>
                  <td style="vertical-align: top; padding-left: 15px;">
                    <p style="margin: 0 0 5px; color: #737373; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">${t.advisorTitle}</p>
                    <h2 style="margin: 0 0 5px; font-size: 22px; color: #ffffff;">
                      ${character.emoji} ${character.name}
                    </h2>
                    <p style="margin: 0; color: ${character.color}; font-size: 14px;">${character.title}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Spacer -->
          <tr><td style="height: 20px;"></td></tr>
          
          <!-- Playbook Content (3 Personalized Steps) -->
          <tr>
            <td style="background: #1a1a1a; border-radius: 16px; padding: 30px;">
              <h2 style="margin: 0 0 15px; font-size: 22px; color: #22c55e;">${playbook.title}</h2>
              <p style="margin: 0 0 25px; color: #a3a3a3; line-height: 1.6;">${playbook.intro}</p>
              
              ${playbook.steps.map((step, index) => `
                <div style="margin-bottom: 25px; padding-left: 20px; border-left: 2px solid #333;">
                  <h3 style="margin: 0 0 10px; font-size: 16px; color: #ffffff;">
                    <span style="color: #22c55e;">${index + 1}.</span> ${step.title}
                  </h3>
                  <p style="margin: 0; color: #a3a3a3; line-height: 1.6; font-size: 14px;">${step.content}</p>
                </div>
              `).join('')}
              
              <div style="background: #0d1f0d; border-radius: 12px; padding: 20px; margin-top: 25px;">
                <p style="margin: 0; color: #a3a3a3; font-size: 14px;">💡 ${playbook.callToAction}</p>
              </div>
            </td>
          </tr>
          
          <!-- Spacer -->
          <tr><td style="height: 20px;"></td></tr>
          
          <!-- 5-Step Checklist -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a1a 0%, #1a0d1f 100%); border-radius: 16px; padding: 30px;">
              <h2 style="margin: 0 0 20px; font-size: 20px; color: #ffffff;">${t.checklistTitle}</h2>
              
              ${t.checklist.map((item, index) => `
                <div style="display: flex; align-items: center; margin-bottom: 15px; padding: 12px 15px; background: rgba(255,255,255,0.05); border-radius: 10px;">
                  <span style="font-size: 20px; margin-right: 12px;">${item.emoji}</span>
                  <span style="color: #e5e5e5; font-size: 14px;"><strong>${index + 1}.</strong> ${item.text}</span>
                </div>
              `).join('')}
            </td>
          </tr>
          
          <!-- Spacer -->
          <tr><td style="height: 20px;"></td></tr>
          
          <!-- Meet Your AI Team -->
          <tr>
            <td style="background: #1a1a1a; border-radius: 16px; padding: 30px;">
              <h2 style="margin: 0 0 5px; font-size: 20px; color: #ffffff; text-align: center;">${t.meetTeamTitle}</h2>
              <p style="margin: 0 0 25px; color: #737373; font-size: 14px; text-align: center;">${t.meetTeamSubtitle}</p>
              
              <!-- Avatar Row -->
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  ${AI_TEAM.map(member => `
                    <td style="text-align: center; padding: 0 3px;">
                      <img src="${avatarBaseUrl}/${member.avatar}" alt="${member.name}" width="50" height="50" style="border-radius: 50%; border: 2px solid ${member.color};" />
                    </td>
                  `).join('')}
                </tr>
                <tr>
                  ${AI_TEAM.map(member => `
                    <td style="text-align: center; padding-top: 8px;">
                      <p style="margin: 0; font-size: 10px; color: #a3a3a3;">${member.emoji}</p>
                      <p style="margin: 2px 0 0; font-size: 9px; color: #737373;">${member.name.split(' ')[0]}</p>
                    </td>
                  `).join('')}
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Spacer -->
          <tr><td style="height: 20px;"></td></tr>
          
          <!-- Why Mycelium Works -->
          <tr>
            <td style="background: linear-gradient(135deg, #0d1f0d 0%, #1a1a1a 100%); border-radius: 16px; padding: 30px;">
              <h2 style="margin: 0 0 25px; font-size: 20px; color: #22c55e; text-align: center;">${t.whyWorksTitle}</h2>
              
              ${t.whyWorks.map(item => `
                <div style="margin-bottom: 20px; padding: 15px; background: rgba(34, 197, 94, 0.1); border-radius: 12px; border-left: 3px solid #22c55e;">
                  <h3 style="margin: 0 0 8px; font-size: 16px; color: #ffffff;">
                    ${item.icon} ${item.title}
                  </h3>
                  <p style="margin: 0; color: #a3a3a3; font-size: 13px; line-height: 1.5;">${item.desc}</p>
                </div>
              `).join('')}
            </td>
          </tr>
          
          <!-- Spacer -->
          <tr><td style="height: 25px;"></td></tr>
          
          <!-- Main CTA -->
          <tr>
            <td style="text-align: center; padding: 30px; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border-radius: 16px;">
              <p style="margin: 0 0 15px; color: #0a0a0a; font-size: 14px;">${t.ctaSubtext}</p>
              <a href="${baseUrl}/auth" style="display: inline-block; background: #0a0a0a; color: #22c55e; padding: 16px 32px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 16px;">
                ${t.ctaMain} →
              </a>
            </td>
          </tr>
          
          <!-- Spacer -->
          <tr><td style="height: 30px;"></td></tr>
          
          <!-- Footer -->
          <tr>
            <td style="text-align: center; padding: 20px;">
              <p style="margin: 0 0 10px; color: #525252; font-size: 12px;">${t.footer}</p>
              <p style="margin: 0; color: #404040; font-size: 11px;">
                <a href="${baseUrl}" style="color: #525252;">mycelium.lovable.app</a>
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

interface PlaybookEmailRequest {
  email: string;
  blocker: string;
  score: number;
  language?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, blocker, score, language = 'en' }: PlaybookEmailRequest = await req.json();
    
    console.log(`Sending playbook email to ${email} for blocker: ${blocker}, score: ${score}, language: ${language}`);

    if (!email || !blocker) {
      throw new Error("Missing required fields: email and blocker");
    }

    const html = generatePlaybookEmail(email, blocker, score, language);
    const playbook = PLAYBOOK_CONTENT[blocker] || PLAYBOOK_CONTENT.start_paralysis;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Mycelium <team@mycelium.gg>",
        to: [email],
        subject: `🍄 Your Playbook: ${playbook.title}`,
        html,
      }),
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.error("Resend API error:", errorData);
      throw new Error(`Resend API error: ${errorData}`);
    }

    const data = await res.json();
    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-playbook-email:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
