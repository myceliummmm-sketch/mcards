import { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface ReviewBadgeProps {
  cardId: string;
}

export const ReviewBadge = ({ cardId }: ReviewBadgeProps) => {
  const [commentCount, setCommentCount] = useState(0);
  const [unresolvedCount, setUnresolvedCount] = useState(0);

  useEffect(() => {
    fetchCommentCounts();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`review-badge-${cardId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'card_comments',
          filter: `card_id=eq.${cardId}`,
        },
        () => {
          fetchCommentCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cardId]);

  const fetchCommentCounts = async () => {
    const { data: allComments } = await supabase
      .from('card_comments')
      .select('id, is_resolved')
      .eq('card_id', cardId);

    if (allComments) {
      setCommentCount(allComments.length);
      setUnresolvedCount(allComments.filter((c) => !c.is_resolved).length);
    }
  };

  if (commentCount === 0) return null;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="absolute top-2 right-2 z-10"
    >
      <div className="relative">
        <div className="flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-full text-xs font-semibold shadow-lg">
          <MessageSquare className="w-3 h-3" />
          {commentCount}
        </div>
        {unresolvedCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-[10px] font-bold"
          >
            {unresolvedCount}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};