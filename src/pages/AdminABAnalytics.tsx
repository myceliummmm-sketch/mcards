import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Users, MousePointer, Clock, TrendingUp, Mail, Gift, Play, Calendar, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface ABStats {
  variant: string;
  total_sessions: number;
  page_loads: number;
  cta_clicks: number;
  quiz_starts: number;
  quiz_completes: number;
  avg_load_time_ms: number;
  email_submits: number;
  chest_opens: number;
  video_plays: number;
  telegram_clicks: number;
  first_event_at: string | null;
}

// All expected current variants
const CURRENT_VARIANTS = ['empire', 'community', 'classic'] as const;

const variantNames: Record<string, string> = {
  empire: "Empire Builder (60%)",
  community: "Community Page (25%)", 
  classic: "Classic Landing (15%)",
  A: "Legacy A",
  B: "Legacy B"
};

const variantColors: Record<string, string> = {
  empire: "border-l-amber-500",
  community: "border-l-emerald-500",
  classic: "border-l-blue-500",
  A: "border-l-purple-500",
  B: "border-l-pink-500"
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

  const calcConversion = (num: number, denom: number) => {
    if (denom === 0) return "0%";
    return ((num / denom) * 100).toFixed(1) + "%";
  };

  // Normalize current variants - always show all 3, even with 0 data
  const currentStats: ABStats[] = CURRENT_VARIANTS.map(variant => {
    const existing = stats.find(s => s.variant === variant);
    return existing || {
      variant,
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
      first_event_at: null
    };
  });

  // Legacy variants (only show if they have data)
  const legacyStats = stats.filter(s => ['A', 'B'].includes(s.variant));

  const StatCard = ({ stat }: { stat: ABStats }) => (
    <Card className={`border-l-4 ${variantColors[stat.variant] || 'border-l-gray-500'}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>{variantNames[stat.variant] || stat.variant}</span>
          <span className="text-sm font-normal text-muted-foreground">
            {stat.variant}
          </span>
        </CardTitle>
        {stat.first_event_at && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Since {format(new Date(stat.first_event_at), 'MMM d, HH:mm')}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{stat.total_sessions}</p>
              <p className="text-xs text-muted-foreground">Sessions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{stat.page_loads}</p>
              <p className="text-xs text-muted-foreground">Page Loads</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <MousePointer className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{stat.cta_clicks}</p>
              <p className="text-xs text-muted-foreground">CTA Clicks</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{Math.round(stat.avg_load_time_ms)}ms</p>
              <p className="text-xs text-muted-foreground">Avg Load</p>
            </div>
          </div>
        </div>

        {/* Empire-specific metrics */}
        {stat.variant === 'empire' && (
          <div className="space-y-4 pt-2 border-t">
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center gap-1 p-2 bg-amber-500/10 rounded-lg">
                <Mail className="h-4 w-4 text-amber-500" />
                <p className="text-xl font-bold">{stat.email_submits}</p>
                <p className="text-xs text-muted-foreground">Emails</p>
              </div>
              <div className="flex flex-col items-center gap-1 p-2 bg-amber-500/10 rounded-lg">
                <Gift className="h-4 w-4 text-amber-500" />
                <p className="text-xl font-bold">{stat.chest_opens}</p>
                <p className="text-xs text-muted-foreground">Chests</p>
              </div>
              <div className="flex flex-col items-center gap-1 p-2 bg-amber-500/10 rounded-lg">
                <Play className="h-4 w-4 text-amber-500" />
                <p className="text-xl font-bold">{stat.video_plays}</p>
                <p className="text-xs text-muted-foreground">Videos</p>
              </div>
            </div>
          </div>
        )}

        {/* Community-specific metrics */}
        {stat.variant === 'community' && (
          <div className="space-y-4 pt-2 border-t">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col items-center gap-1 p-2 bg-emerald-500/10 rounded-lg">
                <Mail className="h-4 w-4 text-emerald-500" />
                <p className="text-xl font-bold">{stat.email_submits}</p>
                <p className="text-xs text-muted-foreground">Emails</p>
              </div>
              <div className="flex flex-col items-center gap-1 p-2 bg-emerald-500/10 rounded-lg">
                <MessageCircle className="h-4 w-4 text-emerald-500" />
                <p className="text-xl font-bold">{stat.telegram_clicks}</p>
                <p className="text-xs text-muted-foreground">TG Clicks</p>
              </div>
            </div>
          </div>
        )}

        <div className="pt-2 border-t space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Click Rate</span>
            <span className="font-medium">{calcConversion(stat.cta_clicks, stat.page_loads)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Quiz Start Rate</span>
            <span className="font-medium">{calcConversion(stat.quiz_starts, stat.page_loads)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Quiz Complete Rate</span>
            <span className="font-medium">{calcConversion(stat.quiz_completes, stat.quiz_starts)}</span>
          </div>
          {stat.variant === 'empire' && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Email Conversion</span>
              <span className="font-medium text-amber-500">
                {calcConversion(stat.email_submits, stat.page_loads)}
              </span>
            </div>
          )}
          {stat.variant === 'community' && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Email Conversion</span>
                <span className="font-medium text-emerald-500">
                  {calcConversion(stat.email_submits, stat.page_loads)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">TG Click Rate</span>
                <span className="font-medium text-emerald-500">
                  {calcConversion(stat.telegram_clicks, stat.page_loads)}
                </span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">A/B Test Analytics</h1>
              <p className="text-muted-foreground">Traffic split: Empire 50% / Community 25% / Classic 25%</p>
            </div>
          </div>
          <Button variant="outline" onClick={fetchStats} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {error && (
          <Card className="border-destructive bg-destructive/10">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Current Variants - Always show all 3 */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Current Traffic Split</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {currentStats.map(stat => (
              <StatCard key={stat.variant} stat={stat} />
            ))}
          </div>
        </div>

        {/* Legacy Variants - Only show if data exists */}
        {legacyStats.length > 0 && (
          <div className="pt-6 border-t">
            <h2 className="text-lg font-semibold mb-4 text-muted-foreground">Legacy A/B Test Data</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {legacyStats.map(stat => (
                <StatCard key={stat.variant} stat={stat} />
              ))}
            </div>
          </div>
        )}

        {!loading && stats.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              Пока нет данных. События начнут появляться после посещений сайта.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminABAnalytics;
