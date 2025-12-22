import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ABStats {
  variant: string;
  total_sessions: number;
  page_loads: number;
  cta_clicks: number;
  quiz_starts: number;
  quiz_completes: number;
  avg_load_time_ms: number;
}

const AdminABAnalytics = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<ABStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Query aggregated stats - this requires service role, so we do it client-side with raw query
      const { data, error: queryError } = await (supabase.from('ab_test_events') as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5000);

      if (queryError) throw queryError;

      // Aggregate client-side since we can't use service_role from browser
      const aggregated: Record<string, ABStats> = {};
      const sessions: Record<string, Set<string>> = { A: new Set(), B: new Set() };

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
        }
        
        sessions[v]?.add(event.session_id);
        
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

      // Finalize aggregation
      Object.keys(aggregated).forEach(v => {
        aggregated[v].total_sessions = sessions[v]?.size || 0;
        if (aggregated[v].page_loads > 0) {
          aggregated[v].avg_load_time_ms = Math.round(aggregated[v].avg_load_time_ms / aggregated[v].page_loads);
        }
      });

      setStats(Object.values(aggregated));
    } catch (err) {
      setError('Нет доступа к данным. Нужно быть залогиненным как админ.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const calcConversion = (clicks: number, loads: number) => {
    if (loads === 0) return '0%';
    return ((clicks / loads) * 100).toFixed(1) + '%';
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">A/B Test Analytics</h1>
          <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {error && (
          <Card className="mb-6 border-destructive">
            <CardContent className="pt-6 text-destructive">{error}</CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stats.map((stat) => (
            <Card key={stat.variant} className="border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${stat.variant === 'A' ? 'bg-blue-500' : 'bg-green-500'}`} />
                  Variant {stat.variant}
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({stat.variant === 'A' ? 'MobileLanding' : 'GamifiedWizard'})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sessions</span>
                  <span className="font-mono">{stat.total_sessions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Page Loads</span>
                  <span className="font-mono">{stat.page_loads}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CTA Clicks</span>
                  <span className="font-mono">{stat.cta_clicks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CTA Conversion</span>
                  <span className="font-mono font-bold text-primary">
                    {calcConversion(stat.cta_clicks, stat.page_loads)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quiz Starts</span>
                  <span className="font-mono">{stat.quiz_starts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quiz Completes</span>
                  <span className="font-mono">{stat.quiz_completes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Load Time</span>
                  <span className="font-mono">{stat.avg_load_time_ms}ms</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {stats.length === 0 && !loading && !error && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Пока нет данных. События начнут появляться после посещений сайта.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminABAnalytics;
