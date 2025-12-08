import { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { getCharacterById } from '@/data/teamCharacters';
import { cn } from '@/lib/utils';

interface GroupChatMessageProps {
  content: string;
  characterId?: string;
  isUser: boolean;
  isStreaming?: boolean;
  onExpand?: () => void;
  isExpanding?: boolean;
}

export const GroupChatMessage = ({
  content,
  characterId,
  isUser,
  isStreaming,
  onExpand,
  isExpanding,
}: GroupChatMessageProps) => {
  const [showExpand, setShowExpand] = useState(false);
  const character = characterId ? getCharacterById(characterId) : null;

  // Show expand button for short AI responses
  const isShortResponse = !isUser && content && content.length < 200 && content.split('.').length <= 2;

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
    <div 
      className="flex gap-3 group"
      onMouseEnter={() => setShowExpand(true)}
      onMouseLeave={() => setShowExpand(false)}
    >
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
            "bg-muted/50 rounded-2xl rounded-tl-md px-4 py-2 border-l-2 relative",
            isStreaming && "animate-pulse"
          )}
          style={{ borderLeftColor: character?.color }}
        >
          <p className="text-sm whitespace-pre-wrap">
            {content || (isStreaming ? '...' : '')}
          </p>
          
          {/* Expand button */}
          {isShortResponse && !isStreaming && onExpand && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onExpand}
              disabled={isExpanding}
              className={cn(
                'absolute -bottom-3 right-2 h-6 px-2 text-xs gap-1',
                'bg-muted hover:bg-muted/80 border border-border shadow-sm',
                'opacity-0 group-hover:opacity-100 transition-opacity'
              )}
            >
              {isExpanding ? (
                <span className="animate-pulse">Expanding...</span>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" />
                  Expand
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
