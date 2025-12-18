import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Email templates for each step
const EMAIL_TEMPLATES = {
  2: {
    subject: "Your AI Team is Still Waiting 🤖",
    getHtml: (blocker: string) => `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #e5e5e5; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; }
    h1 { color: #22c55e; font-size: 24px; }
    p { line-height: 1.6; color: #a3a3a3; }
    .highlight { background: linear-gradient(135deg, #22c55e20, #16a34a20); border: 1px solid #22c55e40; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .cta { display: inline-block; background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
    .team-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 20px 0; }
    .avatar { width: 50px; height: 50px; border-radius: 50%; background: #262626; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #262626; font-size: 12px; color: #737373; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Your AI Advisory Team Misses You</h1>
    <p>Two days ago, you discovered that <strong>${blocker}</strong> might be your biggest startup challenge.</p>
    
    <div class="highlight">
      <p style="margin: 0; color: #e5e5e5;">💡 <strong>Quick reminder:</strong> Your personalized team of 7 AI advisors is ready to help you overcome this blocker with actionable strategies.</p>
    </div>
    
    <p>Each advisor brings unique expertise to tackle your specific challenges:</p>
    <ul style="color: #a3a3a3;">
      <li>🎯 Phoenix will help clarify your vision</li>
      <li>📊 Prisma will analyze your market</li>
      <li>⚡ Zen will plan your execution</li>
      <li>🛡️ Ever will assess your risks</li>
      <li>💡 Techpriest will guide your tech decisions</li>
      <li>🌟 Virgilia will strategize your growth</li>
      <li>☠️ Toxic will challenge your assumptions</li>
    </ul>
    
    <a href="https://mycelium.lovable.app" class="cta">Start Building Your Deck →</a>
    
    <div class="footer">
      <p>You're receiving this because you took our startup validation quiz.</p>
      <p>© 2024 Mycelium. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
  },
  3: {
    subject: "Ready to Build? Your First Card Awaits ⚡",
    getHtml: (blocker: string) => `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #e5e5e5; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; }
    h1 { color: #22c55e; font-size: 24px; }
    p { line-height: 1.6; color: #a3a3a3; }
    .steps { background: #111; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .step { display: flex; align-items: flex-start; gap: 12px; padding: 10px 0; border-bottom: 1px solid #262626; }
    .step:last-child { border-bottom: none; }
    .step-num { background: #22c55e; color: black; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; flex-shrink: 0; }
    .cta { display: inline-block; background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #262626; font-size: 12px; color: #737373; }
  </style>
</head>
<body>
  <div class="container">
    <h1>15 Minutes to Clarity</h1>
    <p>Your ${blocker} challenge won't solve itself. But with Mycelium, you can start making progress in just 15 minutes.</p>
    
    <div class="steps">
      <div class="step">
        <span class="step-num">1</span>
        <div>
          <strong style="color: #e5e5e5;">Sign Up</strong>
          <p style="margin: 4px 0 0; font-size: 14px;">Create your free account in seconds</p>
        </div>
      </div>
      <div class="step">
        <span class="step-num">2</span>
        <div>
          <strong style="color: #e5e5e5;">Create Your First Card</strong>
          <p style="margin: 4px 0 0; font-size: 14px;">Start with your Problem card - it's the foundation</p>
        </div>
      </div>
      <div class="step">
        <span class="step-num">3</span>
        <div>
          <strong style="color: #e5e5e5;">Get AI Feedback</strong>
          <p style="margin: 4px 0 0; font-size: 14px;">Your AI team will evaluate and guide you</p>
        </div>
      </div>
    </div>
    
    <p><strong style="color: #e5e5e5;">The best part?</strong> You don't need to have all the answers. Your AI team will help you discover them.</p>
    
    <a href="https://mycelium.lovable.app/auth" class="cta">Create My First Card →</a>
    
    <div class="footer">
      <p>You're receiving this because you took our startup validation quiz.</p>
      <p>© 2024 Mycelium. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
  },
  4: {
    subject: "Last Chance: Your AI Team Awaits 🚀",
    getHtml: (blocker: string) => `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #e5e5e5; padding: 40px 20px; }
    .container { max-width: 600px; margin: 0 auto; }
    h1 { color: #f97316; font-size: 24px; }
    p { line-height: 1.6; color: #a3a3a3; }
    .urgency { background: linear-gradient(135deg, #f9731620, #ea580c20); border: 1px solid #f9731640; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .stat { text-align: center; padding: 20px; background: #111; border-radius: 8px; margin: 10px 0; }
    .stat-num { font-size: 36px; font-weight: bold; color: #22c55e; }
    .cta { display: inline-block; background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #262626; font-size: 12px; color: #737373; }
  </style>
</head>
<body>
  <div class="container">
    <h1>A Week Has Passed...</h1>
    <p>Seven days ago, you discovered your biggest startup blocker: <strong style="color: #f97316;">${blocker}</strong>.</p>
    
    <div class="urgency">
      <p style="margin: 0; color: #e5e5e5;">⏰ <strong>Think about it:</strong> In the time since you took the quiz, you could have already validated your idea with your AI team. What's holding you back?</p>
    </div>
    
    <div class="stat">
      <div class="stat-num">87%</div>
      <p style="margin: 5px 0 0; color: #a3a3a3;">of founders who use Mycelium identify critical flaws before wasting months of effort</p>
    </div>
    
    <p>Your personalized AI advisory team is still waiting. They've been configured based on your quiz results to help you specifically with ${blocker}.</p>
    
    <p><strong style="color: #e5e5e5;">This is our last reminder.</strong> After this, we'll assume you've found another path. But if you're still stuck, your team is one click away.</p>
    
    <a href="https://mycelium.lovable.app/auth" class="cta">Meet My AI Team Now →</a>
    
    <div class="footer">
      <p>You're receiving this because you took our startup validation quiz.</p>
      <p>This is the final email in our sequence. We won't email again unless you sign up.</p>
      <p>© 2024 Mycelium. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
  },
};

// Calculate which step a lead should be at based on days since signup
function calculateStep(createdAt: string): number {
  const daysSinceSignup = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysSinceSignup >= 7) return 4; // Day 7: Last Chance
  if (daysSinceSignup >= 5) return 3; // Day 5: Ready to Build
  if (daysSinceSignup >= 2) return 2; // Day 2: Team Waiting
  return 1; // Day 0: Initial playbook (already sent)
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get all leads
    const { data: leads, error: leadsError } = await supabaseAdmin
      .from("leads")
      .select("*")
      .order("created_at", { ascending: true });

    if (leadsError) throw leadsError;

    // Get existing sequence logs
    const { data: existingLogs, error: logsError } = await supabaseAdmin
      .from("email_sequence_logs")
      .select("*");

    if (logsError) throw logsError;

    const existingByEmail = new Map(
      (existingLogs || []).map((log) => [log.lead_email, log])
    );

    let processed = 0;
    let emailsSent = 0;

    for (const lead of leads || []) {
      const expectedStep = calculateStep(lead.created_at);
      const existing = existingByEmail.get(lead.email);
      
      // Skip if already at or past this step
      if (existing && existing.sequence_step >= expectedStep) {
        continue;
      }

      // Skip step 1 (initial playbook - handled by quiz)
      if (expectedStep === 1) {
        continue;
      }

      const template = EMAIL_TEMPLATES[expectedStep as keyof typeof EMAIL_TEMPLATES];
      if (!template) continue;

      const blocker = lead.quiz_blocker || "your startup challenge";

      // Send the email
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Mycelium <onboarding@resend.dev>",
            to: [lead.email],
            subject: template.subject,
            html: template.getHtml(blocker),
          }),
        });

        if (response.ok) {
          emailsSent++;
          
          // Update or create sequence log
          if (existing) {
            await supabaseAdmin
              .from("email_sequence_logs")
              .update({
                sequence_step: expectedStep,
                status: "sent",
                sent_at: new Date().toISOString(),
                next_send_at: expectedStep < 4 
                  ? new Date(Date.now() + (expectedStep === 2 ? 3 : 2) * 24 * 60 * 60 * 1000).toISOString()
                  : null,
              })
              .eq("id", existing.id);
          } else {
            await supabaseAdmin
              .from("email_sequence_logs")
              .insert({
                lead_email: lead.email,
                sequence_step: expectedStep,
                status: "sent",
                sent_at: new Date().toISOString(),
                next_send_at: expectedStep < 4
                  ? new Date(Date.now() + (expectedStep === 2 ? 3 : 2) * 24 * 60 * 60 * 1000).toISOString()
                  : null,
              });
          }
          
          console.log(`Sent step ${expectedStep} email to ${lead.email}`);
        } else {
          const errorData = await response.json();
          console.error(`Failed to send to ${lead.email}:`, errorData);
          
          // Log the failure
          if (existing) {
            await supabaseAdmin
              .from("email_sequence_logs")
              .update({ status: "failed" })
              .eq("id", existing.id);
          } else {
            await supabaseAdmin
              .from("email_sequence_logs")
              .insert({
                lead_email: lead.email,
                sequence_step: expectedStep,
                status: "failed",
              });
          }
        }
      } catch (sendErr) {
        console.error(`Error sending to ${lead.email}:`, sendErr);
      }

      processed++;
      
      // Rate limit: 100ms between emails
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(`Sequence check complete: ${processed} processed, ${emailsSent} sent`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed, 
        emailsSent,
        message: `Processed ${processed} leads, sent ${emailsSent} emails`
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Sequence check error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
