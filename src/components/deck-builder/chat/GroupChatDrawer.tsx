import { useRef, useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { X, Plus, Users, Sparkles } from 'lucide-react';
import { ChatInput } from './ChatInput';
import { GroupChatMessage } from './GroupChatMessage';
import { TEAM_CHARACTERS, getCharacterById } from '@/data/teamCharacters';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { GroupChatMessage as GroupChatMessageType } from '@/hooks/useGroupChat';

interface GroupChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCharacters: string[];
  messages: GroupChatMessageType[];
  isStreaming: boolean;
  currentResponder: string | null;
  onSendMessage: (content: string) => void;
  onAddCharacter: (characterId: string) => void;
  onRemoveCharacter: (characterId: string) => void;
  onCrystallize?: () => Promise<void>;
  isCrystallizing?: boolean;
  onExpandMessage?: (messageId: string, characterId: string, content: string) => void;
  expandingMessageId?: string | null;
}

export const GroupChatDrawer = ({
  isOpen,
  onClose,
  selectedCharacters,
  messages,
  isStreaming,
  currentResponder,
  onSendMessage,
  onAddCharacter,
  onRemoveCharacter,
  onCrystallize,
  isCrystallizing,
  onExpandMessage,
  expandingMessageId,
}: GroupChatDrawerProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const currentResponderCharacter = currentResponder ? getCharacterById(currentResponder) : null;
  const availableToAdd = Object.values(TEAM_CHARACTERS).filter(
    c => !selectedCharacters.includes(c.id)
  );

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent 
        side="left" 
        className="w-full sm:w-[600px] p-0 flex flex-col"
      >
        <SheetHeader className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <SheetTitle>Team Meeting</SheetTitle>
            </div>
            
            {/* Crystallize button */}
            {onCrystallize && messages.length >= 3 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCrystallize}
                disabled={isCrystallizing || isStreaming}
                className={cn(
                  'gap-2 text-secondary hover:text-secondary hover:bg-secondary/10',
                  'transition-all duration-300',
                  messages.length >= 3 && !isCrystallizing && 'animate-pulse'
                )}
              >
                <Sparkles className="w-4 h-4" />
                {isCrystallizing ? 'Crystallizing...' : 'Crystallize'}
              </Button>
            )}
          </div>
          
          {/* Selected characters avatars */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {selectedCharacters.map((charId) => {
              const character = getCharacterById(charId);
              if (!character) return null;
              
              return (
                <div key={charId} className="relative group">
                  <Avatar 
                    className="h-10 w-10 transition-transform group-hover:scale-105"
                    style={{ boxShadow: `0 0 0 2px ${character.color}` }}
                  >
                    <AvatarImage src={character.avatar} alt={character.name} />
                    <AvatarFallback style={{ backgroundColor: character.color }}>
                      {character.emoji}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={() => onRemoveCharacter(charId)}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    disabled={selectedCharacters.length <= 2}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
            
            {/* Add character button */}
            {availableToAdd.length > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-10 w-10 rounded-full"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2" align="start">
                  <div className="text-xs text-muted-foreground mb-2 px-2">
                    Add to meeting
                  </div>
                  {availableToAdd.map((character) => (
                    <button
                      key={character.id}
                      onClick={() => onAddCharacter(character.id)}
                      className="flex items-center gap-2 w-full p-2 rounded-md hover:bg-muted transition-colors text-left"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={character.avatar} alt={character.name} />
                        <AvatarFallback style={{ backgroundColor: character.color }}>
                          {character.emoji}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{character.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {character.role}
                        </div>
                      </div>
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
            )}
          </div>
        </SheetHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <GroupChatMessage
                key={message.id}
                content={message.content}
                characterId={message.characterId}
                isUser={message.role === 'user'}
                isStreaming={isStreaming && message.characterId === currentResponder && !message.content}
                onExpand={message.characterId && onExpandMessage 
                  ? () => onExpandMessage(message.id, message.characterId!, message.content)
                  : undefined
                }
                isExpanding={expandingMessageId === message.id}
              />
            ))}
            
            {/* Typing indicator */}
            {isStreaming && currentResponderCharacter && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={currentResponderCharacter.avatar} alt={currentResponderCharacter.name} />
                  <AvatarFallback style={{ backgroundColor: currentResponderCharacter.color }}>
                    {currentResponderCharacter.emoji}
                  </AvatarFallback>
                </Avatar>
                <span>{currentResponderCharacter.name} is typing...</span>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <ChatInput
            onSend={onSendMessage}
            disabled={isStreaming}
            placeholder="Ask the team something..."
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};
