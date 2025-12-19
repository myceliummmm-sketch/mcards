import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Mail, X, Shield, Edit, Clock, Check, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';

interface CollaboratorManagerProps {
  deckId: string;
}

interface Collaborator {
  id: string;
  user_id: string;
  role: 'reviewer' | 'editor';
  invited_at: string;
  profiles: {
    username: string | null;
  };
}

interface Invitation {
  id: string;
  invitee_email: string;
  role: string;
  status: string;
  created_at: string;
}

export const CollaboratorManager = ({ deckId }: CollaboratorManagerProps) => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'reviewer' | 'editor'>('reviewer');
  const [isLoading, setIsLoading] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    fetchCollaborators();
    fetchInvitations();
  }, [deckId]);

  const fetchCollaborators = async () => {
    const { data, error } = await supabase
      .from('deck_collaborators')
      .select(`
        *,
        profiles:user_id (
          username
        )
      `)
      .eq('deck_id', deckId);

    if (error) {
      console.error('Error fetching collaborators:', error);
      return;
    }

    setCollaborators(data || []);
  };

  const fetchInvitations = async () => {
    const { data, error } = await supabase
      .from('deck_invitations')
      .select('*')
      .eq('deck_id', deckId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching invitations:', error);
      return;
    }

    setInvitations(data || []);
  };

  const handleInvite = async () => {
    if (!email.trim()) {
      toast({
        title: language === 'ru' ? 'Нужен email' : 'Email required',
        description: language === 'ru' ? 'Пожалуйста, введите email' : 'Please enter an email address',
        variant: 'destructive',
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: language === 'ru' ? 'Неверный формат' : 'Invalid format',
        description: language === 'ru' ? 'Введите корректный email адрес' : 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    // Check if already invited
    const existingInvite = invitations.find(
      inv => inv.invitee_email.toLowerCase() === email.toLowerCase() && inv.status === 'pending'
    );
    if (existingInvite) {
      toast({
        title: language === 'ru' ? 'Уже приглашён' : 'Already invited',
        description: language === 'ru' 
          ? 'Этот email уже имеет ожидающее приглашение'
          : 'This email already has a pending invitation',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get current user id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create invitation
      const { error } = await supabase
        .from('deck_invitations')
        .insert({
          deck_id: deckId,
          inviter_id: user.id,
          invitee_email: email.toLowerCase(),
          role: role,
        });

      if (error) throw error;

      toast({
        title: language === 'ru' ? 'Приглашение отправлено!' : 'Invitation sent!',
        description: language === 'ru' 
          ? `${email} получит уведомление при входе в систему`
          : `${email} will be notified when they log in`,
      });

      setEmail('');
      setRole('reviewer');
      fetchInvitations();
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast({
        title: language === 'ru' ? 'Ошибка отправки приглашения' : 'Failed to send invitation',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('deck_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;

      toast({
        title: language === 'ru' ? 'Приглашение отменено' : 'Invitation cancelled',
      });

      fetchInvitations();
    } catch (error: any) {
      console.error('Error cancelling invitation:', error);
      toast({
        title: language === 'ru' ? 'Ошибка отмены' : 'Failed to cancel',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleRemove = async (collaboratorId: string) => {
    try {
      const { error } = await supabase
        .from('deck_collaborators')
        .delete()
        .eq('id', collaboratorId);

      if (error) throw error;

      toast({
        title: language === 'ru' ? 'Участник удалён' : 'Collaborator removed',
        description: language === 'ru' 
          ? 'У него больше нет доступа к этой колоде'
          : 'They will no longer have access to this deck',
      });

      fetchCollaborators();
    } catch (error: any) {
      console.error('Error removing collaborator:', error);
      toast({
        title: language === 'ru' ? 'Ошибка удаления участника' : 'Failed to remove collaborator',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const roleLabels = {
    reviewer: language === 'ru' ? 'Рецензент' : 'Reviewer',
    editor: language === 'ru' ? 'Редактор' : 'Editor',
  };

  const statusLabels = {
    pending: language === 'ru' ? 'Ожидает' : 'Pending',
    accepted: language === 'ru' ? 'Принято' : 'Accepted',
    declined: language === 'ru' ? 'Отклонено' : 'Declined',
  };

  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Invite Section */}
      <div className="p-4 bg-secondary/5 border border-secondary/20 rounded-lg space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <UserPlus className="w-4 h-4" />
          {language === 'ru' ? 'Пригласить участников' : 'Invite Collaborators'}
        </div>

        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
          />
          <Select value={role} onValueChange={(v) => setRole(v as 'reviewer' | 'editor')}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="reviewer">
                <div className="flex items-center gap-2">
                  <Shield className="w-3 h-3" />
                  {roleLabels.reviewer}
                </div>
              </SelectItem>
              <SelectItem value="editor">
                <div className="flex items-center gap-2">
                  <Edit className="w-3 h-3" />
                  {roleLabels.editor}
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleInvite}
            disabled={isLoading}
            size="sm"
          >
            <Mail className="w-4 h-4" />
            {language === 'ru' ? 'Пригласить' : 'Invite'}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          {language === 'ru' 
            ? 'Рецензенты могут просматривать и комментировать. Редакторы также могут изменять карты.'
            : 'Reviewers can view and comment. Editors can also modify cards.'}
        </p>
      </div>

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            {language === 'ru' ? `Ожидающие приглашения (${pendingInvitations.length})` : `Pending Invitations (${pendingInvitations.length})`}
          </div>

          <div className="space-y-2">
            {pendingInvitations.map((invitation) => (
              <motion.div
                key={invitation.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs bg-amber-500/20 text-amber-600">
                      <Mail className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      {invitation.invitee_email}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        {invitation.role === 'editor' ? (
                          <Edit className="w-3 h-3" />
                        ) : (
                          <Shield className="w-3 h-3" />
                        )}
                        {roleLabels[invitation.role]}
                      </span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-amber-500/10 border-amber-500/30 text-amber-600">
                        {statusLabels.pending}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCancelInvitation(invitation.id)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Collaborators List */}
      {collaborators.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500" />
            {language === 'ru' ? `Участники (${collaborators.length})` : `Current Collaborators (${collaborators.length})`}
          </div>

          <div className="space-y-2">
            {collaborators.map((collab) => (
              <motion.div
                key={collab.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3 bg-background border border-border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs">
                      {collab.profiles?.username?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      @{collab.profiles?.username || 'Unknown'}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      {collab.role === 'editor' ? (
                        <Edit className="w-3 h-3" />
                      ) : (
                        <Shield className="w-3 h-3" />
                      )}
                      {roleLabels[collab.role]}
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(collab.id)}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
