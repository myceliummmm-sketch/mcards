import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SimulatorEmailRequest {
  email: string;
  userClass: string;
  interest: string;
  difficulty: string;
  cardTitle: string;
  cardContent?: string;
  language: string;
}

const classIcons: Record<string, string> = {
  coder: "💻",
  founder: "💼",
  designer: "🎨",
  marketer: "📣",
  hustler: "⚡",
  dreamer: "✨",
};

const arenaIcons: Record<string, string> = {
  gaming: "🎮",
  fintech: "🏛️",
  health: "❤️",
  ai: "🤖",
  crypto: "₿",
  ecommerce: "🛒",
  education: "🎓",
  saas: "☁️",
};

const getTranslations = (language: string) => {
  const translations: Record<string, Record<string, string>> = {
    en: {
      subject: "🎴 Your Startup Vision Card is Ready",
      simulationComplete: "SIMULATION COMPLETE",
      playerStats: "PLAYER STATS",
      class: "Class",
      arena: "Arena",
      mode: "Mode",
      hardMode: "HARD MODE",
      godMode: "GOD MODE",
      yourCard: "YOUR STARTUP CARD HAS BEEN FORGED",
      visionCard: "Vision Card",
      aiTeam: "YOUR AI TEAM AWAITS",
      everDesc: "Idea Spark — finds the opportunity in chaos",
      prismaDesc: "Strategic Oracle — sees all market dimensions",
      toxicDesc: "Risk Analyst — kills bad ideas before they kill you",
      zenDesc: "Focus Master — cuts distractions mercilessly",
      techDesc: "Stack Architect — builds what scales",
      phoenixDesc: "Growth Hacker — resurrects failed experiments",
      virgiliaDesc: "Story Weaver — makes people care",
      enterGame: "ENTER THE GAME",
      cta: "Build your full deck. Ship in 14 days.",
      ctaButton: "START BUILDING NOW",
      footer: "You received this because you played the Startup Simulator on Mycelium.gg",
    },
    ru: {
      subject: "🎴 Твоя карта стартапа готова",
      simulationComplete: "СИМУЛЯЦИЯ ЗАВЕРШЕНА",
      playerStats: "ХАРАКТЕРИСТИКИ ИГРОКА",
      class: "Класс",
      arena: "Арена",
      mode: "Режим",
      hardMode: "ХАРД МОД",
      godMode: "GOD МОД",
      yourCard: "ТВОЯ КАРТА СТАРТАПА СОЗДАНА",
      visionCard: "Карта Видения",
      aiTeam: "ТВОЯ AI-КОМАНДА ЖДЁТ",
      everDesc: "Искра Идей — находит возможности в хаосе",
      prismaDesc: "Стратегический Оракул — видит все измерения рынка",
      toxicDesc: "Риск-Аналитик — убивает плохие идеи до того, как они убьют тебя",
      zenDesc: "Мастер Фокуса — безжалостно отсекает отвлечения",
      techDesc: "Архитектор Стека — строит то, что масштабируется",
      phoenixDesc: "Growth-Хакер — воскрешает провалившиеся эксперименты",
      virgiliaDesc: "Ткач Историй — заставляет людей сопереживать",
      enterGame: "ВОЙТИ В ИГРУ",
      cta: "Собери полную колоду. Запустись за 14 дней.",
      ctaButton: "НАЧАТЬ СТРОИТЬ",
      footer: "Ты получил это письмо, потому что играл в Симулятор Стартапов на Mycelium.gg",
    },
    es: {
      subject: "🎴 Tu Carta de Visión de Startup está Lista",
      simulationComplete: "SIMULACIÓN COMPLETA",
      playerStats: "ESTADÍSTICAS DEL JUGADOR",
      class: "Clase",
      arena: "Arena",
      mode: "Modo",
      hardMode: "MODO DIFÍCIL",
      godMode: "MODO DIOS",
      yourCard: "TU CARTA DE STARTUP HA SIDO FORJADA",
      visionCard: "Carta de Visión",
      aiTeam: "TU EQUIPO DE IA TE ESPERA",
      everDesc: "Chispa de Ideas — encuentra oportunidades en el caos",
      prismaDesc: "Oráculo Estratégico — ve todas las dimensiones del mercado",
      toxicDesc: "Analista de Riesgos — mata las malas ideas antes de que te maten",
      zenDesc: "Maestro del Enfoque — elimina distracciones sin piedad",
      techDesc: "Arquitecto del Stack — construye lo que escala",
      phoenixDesc: "Growth Hacker — resucita experimentos fallidos",
      virgiliaDesc: "Tejedora de Historias — hace que la gente se interese",
      enterGame: "ENTRAR AL JUEGO",
      cta: "Construye tu mazo completo. Lanza en 14 días.",
      ctaButton: "EMPEZAR A CONSTRUIR",
      footer: "Recibiste esto porque jugaste el Simulador de Startups en Mycelium.gg",
    },
  };
  return translations[language] || translations.en;
};

const generateEmailHTML = (data: SimulatorEmailRequest) => {
  const t = getTranslations(data.language);
  const classIcon = classIcons[data.userClass] || "🚀";
  const arenaIcon = arenaIcons[data.interest] || "🌐";
  const difficultyText = data.difficulty === "god" ? t.godMode : t.hardMode;
  const difficultyEmoji = data.difficulty === "god" ? "💀" : "🔥";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.simulationComplete}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Orbitron:wght@400;700&display=swap');
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background: linear-gradient(180deg, #111 0%, #0a0a0a 100%); border: 2px solid #39FF14; border-radius: 16px; overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 32px; text-align: center; border-bottom: 1px solid #39FF1440;">
              <div style="font-family: 'Press Start 2P', monospace; font-size: 12px; color: #39FF14; letter-spacing: 2px; margin-bottom: 8px;">🍄 MYCELIUM</div>
              <div style="font-family: 'Orbitron', sans-serif; font-size: 24px; color: #39FF14; font-weight: 700; text-shadow: 0 0 20px #39FF1480;">${t.simulationComplete}</div>
            </td>
          </tr>
          
          <!-- Player Stats -->
          <tr>
            <td style="padding: 24px 32px;">
              <div style="font-family: monospace; color: #39FF14; margin-bottom: 16px; font-size: 14px;">&gt; ${t.playerStats}:</div>
              <table width="100%" cellpadding="8" cellspacing="0" style="background: #000; border-radius: 8px; border: 1px solid #39FF1440;">
                <tr>
                  <td style="color: #666; font-family: monospace; padding-left: 16px;">├─ ${t.class}:</td>
                  <td style="color: #39FF14; font-family: 'Orbitron', monospace; font-weight: bold;">${classIcon} ${data.userClass.toUpperCase()}</td>
                </tr>
                <tr>
                  <td style="color: #666; font-family: monospace; padding-left: 16px;">├─ ${t.arena}:</td>
                  <td style="color: #39FF14; font-family: 'Orbitron', monospace; font-weight: bold;">${arenaIcon} ${data.interest.toUpperCase()}</td>
                </tr>
                <tr>
                  <td style="color: #666; font-family: monospace; padding-left: 16px;">└─ ${t.mode}:</td>
                  <td style="color: #39FF14; font-family: 'Orbitron', monospace; font-weight: bold;">${difficultyEmoji} ${difficultyText}</td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Startup Card -->
          <tr>
            <td style="padding: 24px 32px;">
              <div style="font-family: monospace; color: #39FF14; margin-bottom: 16px; font-size: 14px;">&gt; ${t.yourCard}:</div>
              <div style="background: linear-gradient(135deg, #39FF1420 0%, #00000080 100%); border: 2px solid #39FF14; border-radius: 12px; padding: 24px; text-align: center;">
                <div style="font-size: 32px; margin-bottom: 12px;">🎴</div>
                <div style="font-family: 'Orbitron', sans-serif; font-size: 18px; color: #39FF14; font-weight: bold; margin-bottom: 8px; line-height: 1.4;">
                  ${data.cardTitle}
                </div>
                <div style="font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 2px;">${t.visionCard}</div>
              </div>
            </td>
          </tr>
          
          <!-- AI Team -->
          <tr>
            <td style="padding: 24px 32px;">
              <div style="font-family: monospace; color: #39FF14; margin-bottom: 16px; font-size: 14px;">&gt; ${t.aiTeam}:</div>
              <table width="100%" cellpadding="6" cellspacing="0" style="font-family: monospace; font-size: 12px;">
                <tr><td style="color: #39FF14;">🌱 Ever Green</td><td style="color: #888;">— ${t.everDesc}</td></tr>
                <tr><td style="color: #39FF14;">🔮 Prisma</td><td style="color: #888;">— ${t.prismaDesc}</td></tr>
                <tr><td style="color: #39FF14;">☢️ Toxic</td><td style="color: #888;">— ${t.toxicDesc}</td></tr>
                <tr><td style="color: #39FF14;">🧘 Zen</td><td style="color: #888;">— ${t.zenDesc}</td></tr>
                <tr><td style="color: #39FF14;">⚙️ Tech Priest</td><td style="color: #888;">— ${t.techDesc}</td></tr>
                <tr><td style="color: #39FF14;">🔥 Phoenix</td><td style="color: #888;">— ${t.phoenixDesc}</td></tr>
                <tr><td style="color: #39FF14;">📖 Virgilia</td><td style="color: #888;">— ${t.virgiliaDesc}</td></tr>
              </table>
            </td>
          </tr>
          
          <!-- CTA -->
          <tr>
            <td style="padding: 32px; text-align: center; background: linear-gradient(180deg, #39FF1410 0%, #0a0a0a 100%);">
              <div style="font-family: 'Orbitron', sans-serif; font-size: 16px; color: #39FF14; margin-bottom: 8px; font-weight: bold;">${t.enterGame}</div>
              <div style="color: #888; font-size: 14px; margin-bottom: 24px;">${t.cta}</div>
              <a href="https://cards.mycelium.gg/auth" 
                 style="display: inline-block; padding: 16px 32px; background: #39FF14; color: #000; font-family: 'Orbitron', sans-serif; font-weight: bold; text-decoration: none; border-radius: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                ${t.ctaButton}
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; text-align: center; border-top: 1px solid #39FF1420;">
              <div style="color: #444; font-size: 11px;">${t.footer}</div>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: SimulatorEmailRequest = await req.json();
    console.log("Sending simulator email to:", data.email);
    console.log("Simulator context:", { userClass: data.userClass, interest: data.interest, difficulty: data.difficulty });

    const t = getTranslations(data.language);
    const html = generateEmailHTML(data);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Mycelium <hello@mycelium.gg>",
        to: [data.email],
        subject: t.subject,
        html: html,
      }),
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.error("Resend API error:", errorData);
      throw new Error(`Resend API error: ${errorData}`);
    }

    const emailResponse = await res.json();
    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error sending simulator email:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
