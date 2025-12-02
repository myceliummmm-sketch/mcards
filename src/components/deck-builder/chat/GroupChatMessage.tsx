import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getCharacterById } from '@/data/teamCharacters';
import { cn } from '@/lib/utils';

interface GroupChatMessageProps {
  content: string;
  characterId?: string;
  isUser: boolean;
  isStreaming?: boolean;
}

export const GroupChatMessage = ({
  content,
  characterId,
  isUser,
  isStreaming,
}: GroupChatMessageProps) => {
  const character = characterId ? getCharacterById(characterId) : null;

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-2">
          <p className="text-sm whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <Avatar 
        className="h-8 w-8 shrink-0" 
        style={{ 
          boxShadow: `0 0 0 2px ${character?.color || 'hsl(var(--border))'}`
        }}
      >
        {character?.avatar ? (
          <AvatarImage src={character.avatar} alt={character.name} />
        ) : (
          <AvatarFallback style={{ backgroundColor: character?.color }}>
            {character?.emoji || '🤖'}
          </AvatarFallback>
        )}
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span 
            className="text-xs font-semibold"
            style={{ color: character?.color }}
          >
            {character?.name || 'AI'}
          </span>
          <span className="text-xs text-muted-foreground">
            {character?.role}
          </span>
        </div>
        <div 
          className={cn(
            "bg-muted/50 rounded-2xl rounded-tl-md px-4 py-2 border-l-2",
            isStreaming && "animate-pulse"
          )}
          style={{ borderLeftColor: character?.color }}
        >
          <p className="text-sm whitespace-pre-wrap">
            {content || (isStreaming ? '...' : '')}
          </p>
        </div>
      </div>
    </div>
  );
};
