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

    const { data, error } = await supabase
      .from('ab_test_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10000);

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

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
          avg_load_time_ms: 0
        };
        sessions[v] = new Set();
      }
      
      sessions[v].add(event.session_id);
      
      if (event.event_type === 'page_load') {
        aggregated[v].page_loads++;
        if (event.page_load_time_ms) {
          aggregated[v].avg_load_time_ms += event.page_load_time_ms;
        }
      }
      if (event.event_type === 'cta_click') aggregated[v].cta_clicks++;
      if (event.event_type === 'quiz_start') aggregated[v].quiz_starts++;
      if (event.event_type === 'quiz_complete') aggregated[v].quiz_completes++;
    });

    // Finalize
    Object.keys(aggregated).forEach(v => {
      aggregated[v].total_sessions = sessions[v]?.size || 0;
      if (aggregated[v].page_loads > 0) {
        aggregated[v].avg_load_time_ms = Math.round(aggregated[v].avg_load_time_ms / aggregated[v].page_loads);
      }
    });

    const stats = Object.values(aggregated);
    console.log('Aggregated stats:', stats);

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
