import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Check, X, Shield, Edit, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface Invitation {
  id: string;
  deck_id: string;
  inviter_id: string;
  invitee_email: string;
  responded_at: string | null;
  role: string;
  status: string;
  created_at: string;
  decks?: {
    title: string;
  };
  profiles?: {
    username: string | null;
  };
}

export const InvitationNotifications = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { language } = useLanguage();

  useEffect(() => {
    fetchPendingInvitations();
  }, []);

  const fetchPendingInvitations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return;

    const { data, error } = await supabase
      .from('deck_invitations')
      .select(`
        *,
        decks:deck_id (
          title
        )
      `)
      .eq('invitee_email', user.email.toLowerCase())
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching invitations:', error);
      return;
    }

    if (data && data.length > 0) {
      // Fetch inviter profiles separately
      const inviterIds = [...new Set(data.map(d => d.inviter_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', inviterIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      const enrichedData = data.map(inv => ({
        ...inv,
        profiles: profileMap.get(inv.inviter_id) || { username: null }
      }));
      
      setInvitations(enrichedData as Invitation[]);
      setIsOpen(true);
    }
  };

  const handleResponse = async (invitationId: string, accept: boolean) => {
    setIsLoading(invitationId);
    
    try {
      const invitation = invitations.find(inv => inv.id === invitationId);
      if (!invitation) return;

      // Update invitation status
      const { error: updateError } = await supabase
        .from('deck_invitations')
        .update({
          status: accept ? 'accepted' : 'declined',
          responded_at: new Date().toISOString(),
        })
        .eq('id', invitationId);

      if (updateError) throw updateError;

      // If accepted, add as collaborator
      if (accept) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { error: collabError } = await supabase
          .from('deck_collaborators')
          .insert([{
            deck_id: invitation.deck_id,
            user_id: user.id,
            role: invitation.role as 'reviewer' | 'editor',
          }]);

        if (collabError) throw collabError;

        toast({
          title: language === 'ru' ? 'Приглашение принято!' : 'Invitation accepted!',
          description: language === 'ru' 
            ? `Теперь у вас есть доступ к колоде "${invitation.decks?.title}"`
            : `You now have access to "${invitation.decks?.title}"`,
        });
      } else {
        toast({
          title: language === 'ru' ? 'Приглашение отклонено' : 'Invitation declined',
        });
      }

      // Remove from local state
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      
      if (invitations.length <= 1) {
        setIsOpen(false);
      }
    } catch (error: any) {
      console.error('Error responding to invitation:', error);
      toast({
        title: language === 'ru' ? 'Ошибка' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(null);
    }
  };

  const roleLabels = {
    reviewer: language === 'ru' ? 'Рецензент' : 'Reviewer',
    editor: language === 'ru' ? 'Редактор' : 'Editor',
  };

  if (invitations.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            {language === 'ru' ? 'Приглашения к совместной работе' : 'Collaboration Invitations'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <AnimatePresence mode="popLayout">
            {invitations.map((invitation) => (
              <motion.div
                key={invitation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="p-4 bg-secondary/10 border border-border rounded-lg space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="font-medium text-foreground">
                      {invitation.decks?.title || 'Unknown Deck'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {language === 'ru' ? 'От' : 'From'}: @{invitation.profiles?.username || 'Unknown'}
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className="flex items-center gap-1"
                  >
                    {invitation.role === 'editor' ? (
                      <Edit className="w-3 h-3" />
                    ) : (
                      <Shield className="w-3 h-3" />
                    )}
                    {roleLabels[invitation.role]}
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleResponse(invitation.id, true)}
                    disabled={isLoading === invitation.id}
                    className="flex-1"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    {language === 'ru' ? 'Принять' : 'Accept'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResponse(invitation.id, false)}
                    disabled={isLoading === invitation.id}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-1" />
                    {language === 'ru' ? 'Отклонить' : 'Decline'}
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {invitations.length > 1 && (
            <p className="text-xs text-center text-muted-foreground">
              {language === 'ru' 
                ? `У вас ${invitations.length} приглашений`
                : `You have ${invitations.length} invitations`}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
