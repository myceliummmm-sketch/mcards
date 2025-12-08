import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gem, Search, X, ChevronLeft, ChevronRight, Archive, ArchiveRestore, Trash2, MessageSquare, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { InsightCard } from './InsightCard';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type DeckCard = Database['public']['Tables']['deck_cards']['Row'];

interface InsightCardData {
  title: string;
  insight: string;
  topic: string;
  phase?: string;
  crystallizedAt?: string;
  messageCount?: number;
  sourceSummary?: string;
  archivedAt?: string;
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
  const [showArchived, setShowArchived] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<DeckCard | null>(null);
  const [insightToDelete, setInsightToDelete] = useState<DeckCard | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [sourceExpanded, setSourceExpanded] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
          } else if (payload.eventType === 'DELETE') {
            setInsights(prev => prev.filter(i => i.id !== (payload.old as { id: string }).id));
          } else if (payload.eventType === 'UPDATE' && (payload.new as DeckCard).is_insight) {
            setInsights(prev => prev.map(i => i.id === (payload.new as DeckCard).id ? payload.new as DeckCard : i));
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
      
      // Archive filter
      const isArchived = !!data.archivedAt;
      if (showArchived !== isArchived) return false;

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
  }, [insights, selectedPhase, searchQuery, showArchived]);

  const VISIBLE_CARDS = 5;
  const cardWidth = 168;
  const maxScroll = Math.max(0, (filteredInsights.length - VISIBLE_CARDS) * cardWidth);

  const handleScrollLeft = () => {
    setScrollPosition(Math.max(0, scrollPosition - cardWidth * 2));
  };

  const handleScrollRight = () => {
    setScrollPosition(Math.min(maxScroll, scrollPosition + cardWidth * 2));
  };

  const handleArchiveToggle = async (insight: DeckCard) => {
    const data = insight.card_data as unknown as InsightCardData;
    const isCurrentlyArchived = !!data.archivedAt;
    
    setIsArchiving(true);
    try {
      const updatedData = {
        ...data,
        archivedAt: isCurrentlyArchived ? undefined : new Date().toISOString()
      };

      const { error } = await supabase
        .from('deck_cards')
        .update({ card_data: updatedData as unknown as Database['public']['Tables']['deck_cards']['Update']['card_data'] })
        .eq('id', insight.id);

      if (error) throw error;

      setInsights(prev => prev.map(i => 
        i.id === insight.id 
          ? { ...i, card_data: updatedData as unknown as Database['public']['Tables']['deck_cards']['Row']['card_data'] }
          : i
      ));
      
      toast.success(isCurrentlyArchived ? 'Insight restored' : 'Insight archived');
      setSelectedInsight(null);
    } catch (error) {
      console.error('Archive error:', error);
      toast.error('Failed to update insight');
    } finally {
      setIsArchiving(false);
    }
  };

  const handleDelete = async () => {
    if (!insightToDelete) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('deck_cards')
        .delete()
        .eq('id', insightToDelete.id);

      if (error) throw error;

      setInsights(prev => prev.filter(i => i.id !== insightToDelete.id));
      toast.success('Insight deleted');
      setInsightToDelete(null);
      setSelectedInsight(null);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete insight');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  // Show empty state instead of hiding the entire section
  const showEmptyState = !loading && insights.length === 0;

  const selectedData = selectedInsight?.card_data as unknown as InsightCardData;
  const isSelectedArchived = !!selectedData?.archivedAt;

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
            {filteredInsights.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Archive toggle */}
          <Button
            variant={showArchived ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
            className="text-xs gap-1.5"
          >
            <Archive className="w-3.5 h-3.5" />
            {showArchived ? 'Archived' : 'Active'}
          </Button>

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
                  onClick={() => {
                    setSelectedInsight(insight);
                    setSourceExpanded(false);
                  }}
                >
                  <InsightCard
                    data={data}
                    imageUrl={insight.card_image_url}
                    className={cn('flex-shrink-0', data.archivedAt && 'opacity-60')}
                    isArchived={!!data.archivedAt}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </div>

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

      {/* Empty state - no insights at all */}
      {showEmptyState && (
        <div className="text-center py-12 text-muted-foreground">
          <div className="relative inline-block mb-4">
            <Gem className="w-12 h-12 text-secondary/50" />
            <div className="absolute inset-0 animate-pulse">
              <Gem className="w-12 h-12 text-secondary/30 blur-lg" />
            </div>
          </div>
          <h4 className="text-lg font-medium text-foreground mb-2">No crystallized insights yet</h4>
          <p className="text-sm max-w-sm mx-auto">
            Start a team chat and click ✨ <strong>Crystallize</strong> to capture your best ideas as permanent insight cards.
          </p>
        </div>
      )}

      {/* Empty filtered state - has insights but none match filters */}
      {!showEmptyState && filteredInsights.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Gem className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">
            {showArchived ? 'No archived insights' : 'No insights match your filters'}
          </p>
        </div>
      )}

      {/* Enhanced Insight Detail Modal */}
      <Dialog open={!!selectedInsight} onOpenChange={(open) => !open && setSelectedInsight(null)}>
        <DialogContent className="max-w-lg p-0 overflow-hidden bg-gradient-to-br from-violet-950/95 via-background to-teal-950/95 border-violet-500/30">
          {selectedInsight && selectedData && (
            <>
              {/* Header with image */}
              <div className="relative h-48">
                {selectedInsight.card_image_url ? (
                  <img 
                    src={selectedInsight.card_image_url} 
                    alt="Insight visualization"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-violet-600/30 to-teal-600/30" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                
                {/* Topic badge */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  {isSelectedArchived && (
                    <span className="px-2 py-1 rounded-full bg-muted/80 text-muted-foreground text-xs font-medium flex items-center gap-1">
                      <Archive className="w-3 h-3" /> Archived
                    </span>
                  )}
                  <span className="px-3 py-1 rounded-full bg-secondary/80 text-secondary-foreground text-xs font-medium uppercase tracking-wide backdrop-blur-sm">
                    {selectedData.topic}
                  </span>
                </div>

                {/* Phase badge */}
                {selectedData.phase && (
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-muted/80 text-muted-foreground text-xs font-medium capitalize backdrop-blur-sm">
                    {selectedData.phase}
                  </span>
                )}

                {/* Title overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <DialogHeader>
                    <DialogTitle className="font-display text-2xl text-foreground drop-shadow-lg">
                      {selectedData.title}
                    </DialogTitle>
                  </DialogHeader>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-5">
                {/* Core insight */}
                <p className="text-foreground text-lg leading-relaxed">
                  {selectedData.insight}
                </p>

                {/* Source context (collapsible) */}
                {selectedData.sourceSummary && (
                  <Collapsible open={sourceExpanded} onOpenChange={setSourceExpanded}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-between text-muted-foreground hover:text-foreground"
                      >
                        <span className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Source Context
                        </span>
                        <ChevronRight className={cn(
                          "w-4 h-4 transition-transform",
                          sourceExpanded && "rotate-90"
                        )} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="mt-2 p-4 rounded-lg bg-muted/30 border border-border/50">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {selectedData.sourceSummary}
                        </p>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Metadata */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/30">
                  {selectedData.messageCount && (
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                      {selectedData.messageCount} messages
                    </span>
                  )}
                  {selectedData.crystallizedAt && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(selectedData.crystallizedAt)}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleArchiveToggle(selectedInsight)}
                    disabled={isArchiving}
                    className="flex-1 gap-2"
                  >
                    {isSelectedArchived ? (
                      <>
                        <ArchiveRestore className="w-4 h-4" />
                        Restore
                      </>
                    ) : (
                      <>
                        <Archive className="w-4 h-4" />
                        Archive
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInsightToDelete(selectedInsight)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!insightToDelete} onOpenChange={(open) => !open && setInsightToDelete(null)}>
        <AlertDialogContent className="bg-background border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this insight?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The crystallized insight will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};