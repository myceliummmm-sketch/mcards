import { motion } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import type { ChatMessage as ChatMessageType } from '@/hooks/useTeamChat';
import type { TeamCharacter } from '@/data/teamCharacters';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: ChatMessageType;
  character: TeamCharacter;
}

export const ChatMessage = ({ message, character }: ChatMessageProps) => {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex gap-3',
        isUser && 'flex-row-reverse'
      )}
    >
      {/* Avatar */}
      {!isUser && (
        <Avatar 
          className="w-8 h-8 border-2 shrink-0" 
          style={{ borderColor: character.color }}
        >
          <AvatarImage src={character.avatar} alt={character.name} />
          <AvatarFallback 
            className="text-xs"
            style={{ backgroundColor: `${character.color}20` }}
          >
            {character.emoji}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message bubble */}
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-muted text-foreground rounded-bl-md'
        )}
        style={!isUser ? { 
          borderLeft: `3px solid ${character.color}`,
        } : undefined}
      >
        {/* Render message with line breaks */}
        <div className="whitespace-pre-wrap break-words">
          {message.content || (
            <span className="animate-pulse">...</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
