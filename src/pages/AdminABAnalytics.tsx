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

const variantNames: Record<string, string> = {
  'community': 'Community Page (25%)',
  'empire': 'Empire Builder (60%)',
  'classic': 'Classic Simulator (15%)',
  // Legacy variants
  'A': 'Legacy: MobileLanding',
  'B': 'Legacy: GamifiedWizard',
};

const variantColors: Record<string, string> = {
  'community': 'bg-purple-500',
  'empire': 'bg-green-500',
  'classic': 'bg-blue-500',
  'A': 'bg-gray-400',
  'B': 'bg-gray-400',
};

const AdminABAnalytics = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<ABStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('get-ab-stats');

      if (fnError) throw fnError;
      
      setStats(data?.stats || []);
    } catch (err) {
      setError('Ошибка загрузки данных. Попробуйте обновить страницу.');
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

  // Sort stats: new variants first, then legacy
  const sortedStats = [...stats].sort((a, b) => {
    const order = ['empire', 'community', 'classic', 'A', 'B'];
    return order.indexOf(a.variant) - order.indexOf(b.variant);
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
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

        {/* Traffic Split Info */}
        <Card className="mb-6 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-500" />
                Community: 25%
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500" />
                Empire Builder: 60%
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                Classic: 15%
              </span>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="mb-6 border-destructive">
            <CardContent className="pt-6 text-destructive">{error}</CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedStats.map((stat) => (
            <Card key={stat.variant} className="border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${variantColors[stat.variant] || 'bg-gray-400'}`} />
                  <span className="text-base">
                    {variantNames[stat.variant] || `Variant ${stat.variant}`}
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
