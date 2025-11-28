import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Lightbulb, CheckCircle, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface CardCommentsProps {
  cardId: string;
}

interface Comment {
  id: string;
  content: string;
  comment_type: 'comment' | 'suggestion' | 'approval';
  field_name: string | null;
  is_resolved: boolean;
  created_at: string;
  author_id: string;
  profiles: {
    username: string | null;
  };
}

export const CardComments = ({ cardId }: CardCommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState<'comment' | 'suggestion' | 'approval'>('comment');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchComments();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`card-comments-${cardId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'card_comments',
          filter: `card_id=eq.${cardId}`,
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cardId]);

  const fetchComments = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('card_comments')
      .select(`
        *,
        profiles:author_id (
          username
        )
      `)
      .eq('card_id', cardId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: 'Failed to load comments',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    setComments(data || []);
    setIsLoading(false);
  };

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('card_comments').insert({
        card_id: cardId,
        author_id: user.id,
        content: newComment.trim(),
        comment_type: commentType,
      });

      if (error) throw error;

      toast({
        title: 'Comment added!',
        description: 'Your feedback has been shared',
      });

      setNewComment('');
      setCommentType('comment');
    } catch (error: any) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Failed to add comment',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolve = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('card_comments')
        .update({ is_resolved: true })
        .eq('id', commentId);

      if (error) throw error;

      toast({
        title: 'Comment resolved',
        description: 'Marked as addressed',
      });
    } catch (error: any) {
      console.error('Error resolving comment:', error);
      toast({
        title: 'Failed to resolve comment',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getCommentIcon = (type: string) => {
    switch (type) {
      case 'suggestion':
        return <Lightbulb className="w-4 h-4 text-accent" />;
      case 'approval':
        return <CheckCircle className="w-4 h-4 text-secondary" />;
      default:
        return <MessageSquare className="w-4 h-4 text-primary" />;
    }
  };

  const getCommentBadge = (type: string) => {
    switch (type) {
      case 'suggestion':
        return 'Suggestion';
      case 'approval':
        return 'Approval';
      default:
        return 'Comment';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            Reviews & Comments
          </h3>
        </div>
        <div className="text-sm text-muted-foreground">
          {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
        </div>
      </div>

      {/* Comments List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="p-4 bg-muted/50 animate-pulse rounded-lg h-24" />
          ))}
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg border ${
                comment.is_resolved
                  ? 'bg-muted/30 border-border/50 opacity-60'
                  : 'bg-background border-border'
              }`}
            >
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs">
                    {comment.profiles?.username?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        @{comment.profiles?.username || 'Unknown'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getCommentIcon(comment.comment_type)}
                      <span className="text-xs font-medium">
                        {getCommentBadge(comment.comment_type)}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-foreground">{comment.content}</p>

                  {comment.field_name && (
                    <div className="text-xs text-muted-foreground">
                      Field: <span className="font-medium">{comment.field_name}</span>
                    </div>
                  )}

                  {!comment.is_resolved && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleResolve(comment.id)}
                      className="h-7 text-xs"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No comments yet. Be the first to leave feedback!
        </div>
      )}

      {/* Add Comment */}
      <div className="space-y-3 p-4 bg-secondary/5 border border-secondary/20 rounded-lg">
        <Textarea
          placeholder="Add a comment, suggestion, or approval..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[100px]"
        />

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {(['comment', 'suggestion', 'approval'] as const).map((type) => (
              <Button
                key={type}
                type="button"
                variant={commentType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCommentType(type)}
                className="text-xs"
              >
                {getCommentIcon(type)}
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!newComment.trim() || isSubmitting}
            size="sm"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                Post
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};