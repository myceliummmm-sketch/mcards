import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gem, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { InsightCard } from './InsightCard';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import type { Database } from '@/integrations/supabase/types';

type DeckCard = Database['public']['Tables']['deck_cards']['Row'];

interface InsightCardData {
  title: string;
  insight: string;
  topic: string;
  phase?: string;
  crystallizedAt?: string;
}

const PHASES = ['all', 'vision', 'research', 'build', 'grow'] as const;
type Phase = typeof PHASES[number];

const PHASE_LABELS: Record<Phase, string> = {
  all: 'All',
  vision: 'Vision',
  research: 'Research',
  build: 'Build',
  grow: 'Grow',
};

interface InsightsSectionProps {
  deckId: string;
  className?: string;
}

export const InsightsSection = ({ deckId, className }: InsightsSectionProps) => {
  const [insights, setInsights] = useState<DeckCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhase, setSelectedPhase] = useState<Phase>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<DeckCard | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Fetch insights
  useEffect(() => {
    const fetchInsights = async () => {
      const { data, error } = await supabase
        .from('deck_cards')
        .select('*')
        .eq('deck_id', deckId)
        .eq('is_insight', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setInsights(data);
      }
      setLoading(false);
    };

    fetchInsights();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`insights-${deckId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deck_cards',
          filter: `deck_id=eq.${deckId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' && (payload.new as DeckCard).is_insight) {
            setInsights(prev => [payload.new as DeckCard, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [deckId]);

  // Filter insights
  const filteredInsights = useMemo(() => {
    return insights.filter(insight => {
      const data = insight.card_data as unknown as InsightCardData;
      if (!data) return false;
      
      // Phase filter
      if (selectedPhase !== 'all' && data.phase !== selectedPhase) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          data.title?.toLowerCase().includes(query) ||
          data.insight?.toLowerCase().includes(query) ||
          data.topic?.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [insights, selectedPhase, searchQuery]);

  const VISIBLE_CARDS = 5;
  const cardWidth = 168; // 160px card + 8px gap
  const maxScroll = Math.max(0, (filteredInsights.length - VISIBLE_CARDS) * cardWidth);

  const handleScrollLeft = () => {
    setScrollPosition(Math.max(0, scrollPosition - cardWidth * 2));
  };

  const handleScrollRight = () => {
    setScrollPosition(Math.min(maxScroll, scrollPosition + cardWidth * 2));
  };

  if (loading) {
    return (
      <div className={cn('p-6 rounded-xl bg-muted/30 border border-border', className)}>
        <div className="flex items-center gap-3 mb-4">
          <Gem className="w-5 h-5 text-secondary animate-pulse" />
          <span className="text-muted-foreground">Loading insights...</span>
        </div>
      </div>
    );
  }

  if (insights.length === 0) {
    return null; // Don't show section if no insights yet
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative p-6 rounded-xl overflow-hidden',
        'bg-gradient-to-br from-violet-950/40 via-background to-teal-950/40',
        'border border-violet-500/20',
        className
      )}
    >
      {/* Background crystalline pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
          <defs>
            <linearGradient id="crystalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity="0.5" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <polygon points="0,0 100,50 50,100 0,80" fill="url(#crystalGrad)" />
          <polygon points="300,0 400,30 400,100 350,80 320,40" fill="url(#crystalGrad)" />
          <polygon points="150,150 200,120 250,160 220,200 160,200" fill="url(#crystalGrad)" />
        </svg>
      </div>

      {/* Header */}
      <div className="relative flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Gem className="w-6 h-6 text-secondary" />
            <div className="absolute inset-0 animate-pulse">
              <Gem className="w-6 h-6 text-secondary blur-md" />
            </div>
          </div>
          <h3 className="text-lg font-display font-bold text-foreground">
            Crystallized Insights
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-secondary/20 text-secondary text-xs font-medium">
            {insights.length}
          </span>
        </div>

        {/* Search toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowSearch(!showSearch)}
          className={cn(showSearch && 'bg-muted')}
        >
          {showSearch ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
        </Button>
      </div>

      {/* Search input */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4"
          >
            <Input
              placeholder="Search insights..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-muted/50 border-border"
              autoFocus
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase filters */}
      <div className="flex gap-2 mb-4">
        {PHASES.map((phase) => (
          <Button
            key={phase}
            variant={selectedPhase === phase ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedPhase(phase)}
            className={cn(
              'text-xs',
              selectedPhase === phase && 'bg-secondary hover:bg-secondary/90'
            )}
          >
            {PHASE_LABELS[phase]}
          </Button>
        ))}
      </div>

      {/* Cards carousel */}
      <div className="relative">
        {/* Left scroll button */}
        {scrollPosition > 0 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm shadow-lg"
            onClick={handleScrollLeft}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        )}

        {/* Cards container */}
        <div className="overflow-hidden">
          <motion.div
            className="flex gap-2"
            animate={{ x: -scrollPosition }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {filteredInsights.map((insight, index) => {
              const data = insight.card_data as unknown as InsightCardData;
              if (!data) return null;
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedInsight(insight)}
                >
                  <InsightCard
                    data={data}
                    imageUrl={insight.card_image_url}
                    className="flex-shrink-0"
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Right scroll button */}
        {scrollPosition < maxScroll && filteredInsights.length > VISIBLE_CARDS && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm shadow-lg"
            onClick={handleScrollRight}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Empty state */}
      {filteredInsights.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Gem className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No insights match your filters</p>
        </div>
      )}

      {/* Insight detail dialog */}
      <Dialog open={!!selectedInsight} onOpenChange={(open) => !open && setSelectedInsight(null)}>
        <DialogContent className="max-w-md bg-gradient-to-br from-violet-950/90 via-background to-teal-950/90 border-violet-500/30">
          {selectedInsight && (() => {
            const insightData = selectedInsight.card_data as unknown as InsightCardData;
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="font-display text-xl">
                    {insightData?.title || 'Insight'}
                  </DialogTitle>
                </DialogHeader>
                
                {selectedInsight.card_image_url && (
                  <div className="relative rounded-lg overflow-hidden h-48">
                    <img 
                      src={selectedInsight.card_image_url} 
                      alt="Insight visualization"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  </div>
                )}

                <div className="space-y-4">
                  <p className="text-foreground leading-relaxed">
                    {insightData?.insight}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="px-2 py-1 rounded bg-secondary/20 text-secondary capitalize">
                      {insightData?.topic}
                    </span>
                    {insightData?.phase && (
                      <span className="px-2 py-1 rounded bg-muted capitalize">
                        {insightData.phase}
                      </span>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
