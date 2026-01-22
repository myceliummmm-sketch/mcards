import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ABStats {
  variant: string;
  total_sessions: number;
  page_loads: number;
  cta_clicks: number;
  quiz_starts: number;
  quiz_completes: number;
  avg_load_time_ms: number;
  // New metrics for Empire Builder
  email_submits: number;
  chest_opens: number;
  video_plays: number;
  // Community metrics
  telegram_clicks: number;
  // TG2 metrics
  tg2_page_loads: number;
  tg2_answer_bot: number;
  tg2_answer_project: number;
  tg2_answer_random: number;
  tg2_answer_curious: number;
  tg2_telegram_clicks: number;
  first_event_at: string | null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use service role to bypass RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log('Fetching A/B test events...');

    // Get all events - no limit to ensure we capture all data
    // Supabase default limit is 1000, so we need to paginate or increase
    let allData: any[] = [];
    let offset = 0;
    const batchSize = 1000;
    
    while (true) {
      const { data: batch, error: batchError } = await supabase
        .from('ab_test_events')
        .select('*')
        .order('created_at', { ascending: true })
        .range(offset, offset + batchSize - 1);
      
      if (batchError) {
        console.error('Database error:', batchError);
        throw batchError;
      }
      
      if (!batch || batch.length === 0) break;
      
      allData = allData.concat(batch);
      offset += batchSize;
      
      // Safety limit to prevent infinite loops
      if (offset > 100000) break;
    }
    
    const data = allData;

    console.log(`Found ${data?.length || 0} events`);

    // Aggregate stats
    const aggregated: Record<string, ABStats> = {};
    const sessions: Record<string, Set<string>> = {};

    (data || []).forEach((event: any) => {
      const v = event.variant;
      
      if (!aggregated[v]) {
        aggregated[v] = {
          variant: v,
          total_sessions: 0,
          page_loads: 0,
          cta_clicks: 0,
          quiz_starts: 0,
          quiz_completes: 0,
          avg_load_time_ms: 0,
          email_submits: 0,
          chest_opens: 0,
          video_plays: 0,
          telegram_clicks: 0,
          tg2_page_loads: 0,
          tg2_answer_bot: 0,
          tg2_answer_project: 0,
          tg2_answer_random: 0,
          tg2_answer_curious: 0,
          tg2_telegram_clicks: 0,
          first_event_at: null
        };
        sessions[v] = new Set();
      }
      
      // Track first event
      if (!aggregated[v].first_event_at) {
        aggregated[v].first_event_at = event.created_at;
      }
      
      sessions[v].add(event.session_id);
      
      // Count event types
      switch (event.event_type) {
        case 'page_load':
          aggregated[v].page_loads++;
          if (event.page_load_time_ms) {
            aggregated[v].avg_load_time_ms += event.page_load_time_ms;
          }
          break;
        case 'cta_click':
          aggregated[v].cta_clicks++;
          break;
        case 'quiz_start':
          aggregated[v].quiz_starts++;
          break;
        case 'quiz_complete':
          aggregated[v].quiz_completes++;
          break;
        case 'email_submit':
          aggregated[v].email_submits++;
          break;
        case 'chest_open':
          aggregated[v].chest_opens++;
          break;
        case 'video_play':
          aggregated[v].video_plays++;
          break;
        case 'telegram_link_click':
          aggregated[v].telegram_clicks++;
          break;
        case 'tg2_page_load':
          aggregated[v].tg2_page_loads++;
          if (event.page_load_time_ms) {
            aggregated[v].avg_load_time_ms += event.page_load_time_ms;
          }
          break;
        case 'tg2_answer_selected':
          // Track which answer was selected
          const answerId = event.metadata?.answer_id;
          if (answerId === 'bot') aggregated[v].tg2_answer_bot++;
          else if (answerId === 'project') aggregated[v].tg2_answer_project++;
          else if (answerId === 'random') aggregated[v].tg2_answer_random++;
          else if (answerId === 'curious') aggregated[v].tg2_answer_curious++;
          break;
        case 'tg2_telegram_click':
          aggregated[v].tg2_telegram_clicks++;
          break;
      }
    });

    // Finalize averages and session counts
    Object.keys(aggregated).forEach(v => {
      aggregated[v].total_sessions = sessions[v]?.size || 0;
      const totalLoads = aggregated[v].page_loads + aggregated[v].tg2_page_loads;
      if (totalLoads > 0) {
        aggregated[v].avg_load_time_ms = Math.round(aggregated[v].avg_load_time_ms / totalLoads);
      }
    });

    const stats = Object.values(aggregated);
    console.log('Aggregated stats:', JSON.stringify(stats, null, 2));

    return new Response(JSON.stringify({ stats }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in get-ab-stats:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
