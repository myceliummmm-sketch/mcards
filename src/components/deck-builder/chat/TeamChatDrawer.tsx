import { useRef, useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles } from 'lucide-react';
import { getCharacterById } from '@/data/teamCharacters';
import { GroupChatMessage } from './GroupChatMessage';
import { ChatInput } from './ChatInput';
import { CharacterDetailModal } from '../CharacterDetailModal';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import type { ChatMessage as ChatMessageType } from '@/hooks/useTeamChat';

interface TeamChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  characterId: string | null;
  messages: ChatMessageType[];
  isStreaming: boolean;
  onSendMessage: (content: string) => void;
  onCrystallize?: () => Promise<void>;
  isCrystallizing?: boolean;
  onExpandMessage?: (messageId: string, characterId: string, content: string) => void;
  expandingMessageId?: string | null;
}

export const TeamChatDrawer = ({
  isOpen,
  onClose,
  characterId,
  messages,
  isStreaming,
  onSendMessage,
  onCrystallize,
  isCrystallizing,
  onExpandMessage,
  expandingMessageId,
}: TeamChatDrawerProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t, language } = useTranslation();
  const character = characterId ? getCharacterById(characterId, language) : null;
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!character) return null;

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()} modal={false}>
        <SheetContent 
          side="left" 
          className="w-full sm:w-[600px] p-0 flex flex-col bg-card border-r border-border"
          onInteractOutside={(e) => e.preventDefault()}
        >
          {/* Header */}
          <SheetHeader className="p-4 border-b border-border bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar 
                  className="w-12 h-12 border-2 cursor-pointer hover:scale-105 transition-transform" 
                  style={{ borderColor: character.color }}
                  onClick={() => setShowDetailModal(true)}
                >
                  <AvatarImage src={character.avatar} alt={character.name} />
                  <AvatarFallback style={{ backgroundColor: `${character.color}20` }}>
                    {character.emoji}
                  </AvatarFallback>
                </Avatar>
                <div 
                  className="flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setShowDetailModal(true)}
                >
                  <SheetTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                    {character.name}
                    <span className="text-sm font-normal text-muted-foreground">
                      {character.emoji}
                    </span>
                  </SheetTitle>
                  <p className="text-sm text-muted-foreground">{character.role}</p>
                </div>
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
                  {isCrystallizing ? t('deckBuilder.crystallizing') : t('deckBuilder.crystallize')}
                </Button>
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
                  isStreaming={isStreaming && message.role === 'assistant' && !message.content}
                  onExpand={message.characterId && onExpandMessage 
                    ? () => onExpandMessage(message.id, message.characterId!, message.content)
                    : undefined
                  }
                  isExpanding={expandingMessageId === message.id}
                  onAvatarClick={() => setShowDetailModal(true)}
                />
              ))}
              
              {/* Typing indicator */}
              {isStreaming && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Avatar className="w-6 h-6 border" style={{ borderColor: character.color }}>
                    <AvatarImage src={character.avatar} alt={character.name} />
                    <AvatarFallback className="text-xs">{character.emoji}</AvatarFallback>
                  </Avatar>
                  <span className="animate-pulse">{character.name} {t('deckBuilder.isTyping')}</span>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border bg-muted/30">
            <ChatInput
              onSend={onSendMessage}
              disabled={isStreaming}
              placeholder={`${t('deckBuilder.messageCharacter')} ${character.name}...`}
              characterColor={character.color}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Character Detail Modal */}
      <CharacterDetailModal
        characterId={characterId}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />
    </>
  );
};
