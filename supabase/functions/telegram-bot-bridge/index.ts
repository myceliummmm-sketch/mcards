import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SyncUserPayload {
  telegram_id: number;
  telegram_username?: string;
  username?: string;
  first_name?: string;
  quiz_blocker?: string;
  assigned_character?: string;
  onboarding_step?: string;
  ref_code?: string;
}

interface GetProjectStatusPayload {
  telegram_id: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { action, payload } = await req.json();
    console.log(`[telegram-bot-bridge] Action: ${action}`, payload);

    // ============ ACTION: sync_user_status ============
    if (action === "sync_user_status") {
      const data = payload as SyncUserPayload;

      if (!data.telegram_id) {
        return new Response(
          JSON.stringify({ success: false, error: "telegram_id is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if user exists
      const { data: existingProfile, error: fetchError } = await supabaseAdmin
        .from("profiles")
        .select("id, telegram_id, username, quiz_blocker, assigned_character, onboarding_step")
        .eq("telegram_id", data.telegram_id)
        .maybeSingle();

      if (fetchError) {
        console.error("[telegram-bot-bridge] Fetch error:", fetchError);
        throw fetchError;
      }

      let userId: string;
      let isNew = false;

      if (!existingProfile) {
        // Create new profile with generated UUID
        const newId = crypto.randomUUID();
        const insertData: Record<string, unknown> = {
          id: newId,
          telegram_id: data.telegram_id,
          username: data.username || data.first_name || `tg_${data.telegram_id}`,
          telegram_username: data.telegram_username,
          quiz_blocker: data.quiz_blocker,
          assigned_character: data.assigned_character,
          onboarding_step: data.onboarding_step || "new",
        };

        const { error: insertError } = await supabaseAdmin
          .from("profiles")
          .insert(insertData);

        if (insertError) {
          console.error("[telegram-bot-bridge] Insert error:", insertError);
          throw insertError;
        }

        userId = newId;
        isNew = true;
        console.log(`[telegram-bot-bridge] Created new profile: ${userId}`);
      } else {
        // Update existing profile - only non-null fields
        const updateData: Record<string, unknown> = {};
        if (data.username) updateData.username = data.username;
        if (data.telegram_username) updateData.telegram_username = data.telegram_username;
        if (data.quiz_blocker) updateData.quiz_blocker = data.quiz_blocker;
        if (data.assigned_character) updateData.assigned_character = data.assigned_character;
        if (data.onboarding_step) updateData.onboarding_step = data.onboarding_step;

        if (Object.keys(updateData).length > 0) {
          updateData.updated_at = new Date().toISOString();

          const { error: updateError } = await supabaseAdmin
            .from("profiles")
            .update(updateData)
            .eq("id", existingProfile.id);

          if (updateError) {
            console.error("[telegram-bot-bridge] Update error:", updateError);
            throw updateError;
          }
        }

        userId = existingProfile.id;
        console.log(`[telegram-bot-bridge] Updated profile: ${userId}`);
      }

      // Fetch updated profile
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("telegram_id, telegram_username, quiz_blocker, assigned_character, onboarding_step")
        .eq("id", userId)
        .single();

      return new Response(
        JSON.stringify({ success: true, user_id: userId, is_new: isNew, profile }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============ ACTION: get_project_status ============
    if (action === "get_project_status") {
      const data = payload as GetProjectStatusPayload;

      if (!data.telegram_id) {
        return new Response(
          JSON.stringify({ success: false, error: "telegram_id is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get profile
      const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("id, quiz_blocker, assigned_character, onboarding_step")
        .eq("telegram_id", data.telegram_id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            has_passport: false, 
            vision_progress: 0,
            research_progress: 0,
            current_phase: "idea",
            deck_id: null,
            cards_summary: { vision: { filled: 0, total: 5 }, research: { filled: 0, total: 5 } }
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get first deck for this user
      const { data: deck } = await supabaseAdmin
        .from("decks")
        .select("id")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      let visionFilled = 0;
      let researchFilled = 0;

      if (deck) {
        // Get cards for this deck
        const { data: cards } = await supabaseAdmin
          .from("deck_cards")
          .select("card_slot, card_data")
          .eq("deck_id", deck.id);

        if (cards) {
          // Vision cards: slots 1-5
          visionFilled = cards.filter(c => 
            c.card_slot >= 1 && c.card_slot <= 5 && 
            c.card_data && Object.keys(c.card_data).length > 0
          ).length;

          // Research cards: slots 6-10
          researchFilled = cards.filter(c => 
            c.card_slot >= 6 && c.card_slot <= 10 && 
            c.card_data && Object.keys(c.card_data).length > 0
          ).length;
        }
      }

      const visionProgress = Math.round((visionFilled / 5) * 100);
      const researchProgress = Math.round((researchFilled / 5) * 100);

      // Determine current phase
      let currentPhase = "idea";
      if (researchFilled > 0) {
        currentPhase = "research";
      } else if (visionFilled >= 5) {
        currentPhase = "research"; // Ready for research
      }
      // Build/grow phases would need additional tracking

      return new Response(
        JSON.stringify({
          success: true,
          has_passport: !!profile.quiz_blocker,
          vision_progress: visionProgress,
          research_progress: researchProgress,
          current_phase: currentPhase,
          deck_id: deck?.id || null,
          cards_summary: {
            vision: { filled: visionFilled, total: 5 },
            research: { filled: researchFilled, total: 5 }
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============ ACTION: get_syndicate_pulse ============
    if (action === "get_syndicate_pulse") {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const yesterdayISO = yesterday.toISOString();

      // Active users (profiles updated in last 24h)
      const { count: activeUsers } = await supabaseAdmin
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("updated_at", yesterdayISO);

      // Cards created in last 24h
      const { count: cardsCreated } = await supabaseAdmin
        .from("deck_cards")
        .select("*", { count: "exact", head: true })
        .gte("created_at", yesterdayISO);

      // Projects (decks) started in last 24h
      const { count: projectsStarted } = await supabaseAdmin
        .from("decks")
        .select("*", { count: "exact", head: true })
        .gte("created_at", yesterdayISO);

      // Top blockers (aggregate from profiles)
      const { data: blockerData } = await supabaseAdmin
        .from("profiles")
        .select("quiz_blocker")
        .not("quiz_blocker", "is", null);

      const blockerCounts: Record<string, number> = {};
      blockerData?.forEach(p => {
        if (p.quiz_blocker) {
          blockerCounts[p.quiz_blocker] = (blockerCounts[p.quiz_blocker] || 0) + 1;
        }
      });

      const topBlockers = Object.entries(blockerCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return new Response(
        JSON.stringify({
          success: true,
          active_users_24h: activeUsers || 0,
          cards_created_24h: cardsCreated || 0,
          projects_started_24h: projectsStarted || 0,
          top_blockers: topBlockers,
          recent_milestones: [
            { type: "vision_complete", count: Math.floor((cardsCreated || 0) / 5), period: "24h" },
            { type: "new_projects", count: projectsStarted || 0, period: "24h" }
          ]
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Unknown action
    return new Response(
      JSON.stringify({ success: false, error: `Unknown action: ${action}` }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[telegram-bot-bridge] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
