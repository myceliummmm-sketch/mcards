import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BroadcastRequest {
  subject: string;
  htmlContent: string;
  testMode?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subject, htmlContent, testMode = false }: BroadcastRequest = await req.json();

    if (!subject || !htmlContent) {
      throw new Error("Subject and htmlContent are required");
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: leads, error: fetchError } = await supabaseAdmin
      .from("leads")
      .select("email, quiz_blocker, quiz_score")
      .order("created_at", { ascending: false });

    if (fetchError) {
      throw new Error(`Failed to fetch leads: ${fetchError.message}`);
    }

    if (!leads || leads.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No leads found", sent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Found ${leads.length} leads to email`);

    const recipients = testMode ? [leads[0]] : leads;
    
    const results = {
      total: recipients.length,
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const lead of recipients) {
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
            subject: subject,
            html: htmlContent,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          results.failed++;
          results.errors.push(`${lead.email}: ${errorData.message || response.statusText}`);
          console.error(`Failed to send to ${lead.email}:`, errorData);
        } else {
          results.sent++;
          console.log(`Sent to ${lead.email}`);
        }

        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (err: any) {
        results.failed++;
        results.errors.push(`${lead.email}: ${err.message}`);
      }
    }

    console.log(`Broadcast complete: ${results.sent} sent, ${results.failed} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Sent ${results.sent}/${results.total} emails`,
        results 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Broadcast error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
