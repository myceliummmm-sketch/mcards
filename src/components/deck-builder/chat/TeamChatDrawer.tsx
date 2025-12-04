import { useRef, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TEAM_CHARACTERS } from '@/data/teamCharacters';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import type { ChatMessage as ChatMessageType } from '@/hooks/useTeamChat';

interface TeamChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  characterId: string | null;
  messages: ChatMessageType[];
  isStreaming: boolean;
  onSendMessage: (content: string) => void;
}

export const TeamChatDrawer = ({
  isOpen,
  onClose,
  characterId,
  messages,
  isStreaming,
  onSendMessage,
}: TeamChatDrawerProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const character = characterId ? TEAM_CHARACTERS[characterId] : null;

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!character) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent 
        side="left" 
        className="w-[400px] sm:w-[450px] p-0 flex flex-col bg-card border-r border-border"
      >
        {/* Header */}
        <SheetHeader className="p-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <Avatar 
              className="w-12 h-12 border-2" 
              style={{ borderColor: character.color }}
            >
              <AvatarImage src={character.avatar} alt={character.name} />
              <AvatarFallback style={{ backgroundColor: `${character.color}20` }}>
                {character.emoji}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <SheetTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                {character.name}
                <span className="text-sm font-normal text-muted-foreground">
                  {character.emoji}
                </span>
              </SheetTitle>
              <p className="text-sm text-muted-foreground">{character.role}</p>
            </div>
          </div>
        </SheetHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                character={character}
              />
            ))}
            
            {/* Typing indicator */}
            {isStreaming && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Avatar className="w-6 h-6 border" style={{ borderColor: character.color }}>
                  <AvatarImage src={character.avatar} alt={character.name} />
                  <AvatarFallback className="text-xs">{character.emoji}</AvatarFallback>
                </Avatar>
                <span className="animate-pulse">{character.name} is typing...</span>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-border bg-muted/30">
          <ChatInput
            onSend={onSendMessage}
            disabled={isStreaming}
            placeholder={`Message ${character.name}...`}
            characterColor={character.color}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};
