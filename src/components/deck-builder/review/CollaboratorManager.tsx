import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Mail, X, Shield, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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

export const CollaboratorManager = ({ deckId }: CollaboratorManagerProps) => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'reviewer' | 'editor'>('reviewer');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCollaborators();
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

  const handleInvite = async () => {
    if (!email.trim()) {
      toast({
        title: 'Email required',
        description: 'Please enter an email address',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // First, find the user by email (in a real app, you'd have a backend endpoint for this)
      // For now, we'll show a message that invitations are pending
      toast({
        title: 'Invitation feature coming soon',
        description: 'Email invitations will be available in the next update',
      });

      setEmail('');
      setRole('reviewer');
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast({
        title: 'Failed to send invitation',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
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
        title: 'Collaborator removed',
        description: 'They will no longer have access to this deck',
      });

      fetchCollaborators();
    } catch (error: any) {
      console.error('Error removing collaborator:', error);
      toast({
        title: 'Failed to remove collaborator',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Invite Section */}
      <div className="p-4 bg-secondary/5 border border-secondary/20 rounded-lg space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <UserPlus className="w-4 h-4" />
          Invite Collaborators
        </div>

        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
          />
          <Select value={role} onValueChange={(v) => setRole(v as 'reviewer' | 'editor')}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="reviewer">
                <div className="flex items-center gap-2">
                  <Shield className="w-3 h-3" />
                  Reviewer
                </div>
              </SelectItem>
              <SelectItem value="editor">
                <div className="flex items-center gap-2">
                  <Edit className="w-3 h-3" />
                  Editor
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
            Invite
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Reviewers can view and comment. Editors can also modify cards.
        </p>
      </div>

      {/* Collaborators List */}
      {collaborators.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm font-semibold text-foreground">
            Current Collaborators ({collaborators.length})
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
                      {collab.role}
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