import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RESEARCH_SLOTS = [6, 7, 8, 9, 10];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { action, deckId, cardSlot } = await req.json();

    // Verify deck ownership
    const { data: deck, error: deckError } = await supabase
      .from('decks')
      .select('*')
      .eq('id', deckId)
      .eq('user_id', user.id)
      .single();

    if (deckError || !deck) {
      return new Response(JSON.stringify({ error: 'Deck not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    switch (action) {
      case 'check_readiness': {
        // Check if all 5 vision cards are complete
        const { data: visionCards } = await supabase
          .from('deck_cards')
          .select('*')
          .eq('deck_id', deckId)
          .in('card_slot', [1, 2, 3, 4, 5]);

        const completedVisionCards = (visionCards || []).filter(card => {
          const data = card.card_data as Record<string, any>;
          return data && Object.keys(data).length > 0;
        });

        const isReady = completedVisionCards.length >= 5;

        // Get or create research session
        let { data: session } = await supabase
          .from('research_sessions')
          .select('*')
          .eq('deck_id', deckId)
          .maybeSingle();

        if (!session && isReady) {
          const { data: newSession } = await supabase
            .from('research_sessions')
            .insert({
              deck_id: deckId,
              current_card_slot: 6,
              status: 'locked'
            })
            .select()
            .single();
          session = newSession;
        }

        // Get existing research results
        const { data: results } = await supabase
          .from('research_results')
          .select('*')
          .eq('deck_id', deckId)
          .order('card_slot', { ascending: true });

        return new Response(JSON.stringify({
          isReady,
          completedVisionCards: completedVisionCards.length,
          session,
          results: results || []
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'get_status': {
        const { data: session } = await supabase
          .from('research_sessions')
          .select('*')
          .eq('deck_id', deckId)
          .maybeSingle();

        const { data: results } = await supabase
          .from('research_results')
          .select('*')
          .eq('deck_id', deckId)
          .order('card_slot', { ascending: true });

        // Determine which cards are unlocked
        const acceptedSlots = (results || [])
          .filter(r => r.status === 'accepted')
          .map(r => r.card_slot);

        const currentUnlockedSlot = acceptedSlots.length === 0 
          ? 6 
          : Math.min(Math.max(...acceptedSlots) + 1, 10);

        return new Response(JSON.stringify({
          session,
          results: results || [],
          currentUnlockedSlot,
          acceptedCount: acceptedSlots.length,
          totalCards: 5
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'can_research': {
        // Check if card can be researched (previous cards accepted)
        const { data: results } = await supabase
          .from('research_results')
          .select('*')
          .eq('deck_id', deckId)
          .lt('card_slot', cardSlot)
          .order('card_slot', { ascending: true });

        const previousSlots = RESEARCH_SLOTS.filter(s => s < cardSlot);
        const allPreviousAccepted = previousSlots.every(slot => 
          results?.some(r => r.card_slot === slot && r.status === 'accepted')
        );

        // First card (slot 6) is always available if vision is complete
        const canResearch = cardSlot === 6 || allPreviousAccepted;

        return new Response(JSON.stringify({ canResearch }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'accept_research': {
        // Accept the research result for a card
        const { data: result, error: updateError } = await supabase
          .from('research_results')
          .update({
            status: 'accepted',
            accepted_at: new Date().toISOString()
          })
          .eq('deck_id', deckId)
          .eq('card_slot', cardSlot)
          .select()
          .single();

        if (updateError) {
          return new Response(JSON.stringify({ error: updateError.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Update session progress
        const nextSlot = cardSlot < 10 ? cardSlot + 1 : cardSlot;
        await supabase
          .from('research_sessions')
          .update({
            current_card_slot: nextSlot,
            ...(cardSlot === 10 ? { completed_at: new Date().toISOString() } : {})
          })
          .eq('deck_id', deckId);

        // Also update the deck_cards table with the research data
        const cardTypeMap: Record<number, string> = {
          6: 'market_map',
          7: 'competitor_analysis',
          8: 'user_insights',
          9: 'risk_assessment',
          10: 'opportunity_score'
        };

        await supabase
          .from('deck_cards')
          .upsert({
            deck_id: deckId,
            card_slot: cardSlot,
            card_type: cardTypeMap[cardSlot] || 'research',
            card_data: result.findings,
            evaluation: {
              overallScore: result.rarity_scores?.final_score || 0,
              rarity: result.final_rarity,
              team_comments: result.team_comments
            }
          }, {
            onConflict: 'deck_id,card_slot'
          });

        return new Response(JSON.stringify({
          success: true,
          result,
          nextSlot
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (error: any) {
    console.error('Error in research-orchestrator:', error);
    return new Response(JSON.stringify({ error: error?.message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});