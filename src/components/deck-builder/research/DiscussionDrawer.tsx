import { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getCharacterById } from '@/data/teamCharacters';
import { Send, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'character';
  characterId?: string;
  content: string;
}

interface DiscussionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardTitle: string;
  evaluators: string[];
  onSendMessage: (message: string, characterId: string) => Promise<string | null>;
}

export function DiscussionDrawer({
  open,
  onOpenChange,
  cardTitle,
  evaluators,
  onSendMessage
}: DiscussionDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState(evaluators[0] || 'evergreen');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await onSendMessage(input, selectedCharacter);
      
      if (response) {
        const characterMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'character',
          characterId: selectedCharacter,
          content: response
        };
        setMessages(prev => [...prev, characterMessage]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="border-b border-border">
          <DrawerTitle>Discuss: {cardTitle}</DrawerTitle>
          
          {/* Character selector */}
          <div className="flex gap-2 mt-2">
            {evaluators.map(charId => {
              const char = getCharacterById(charId);
              return (
                <button
                  key={charId}
                  onClick={() => setSelectedCharacter(charId)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs transition-colors
                    ${selectedCharacter === charId 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted hover:bg-muted/80'
                    }`}
                >
                  <Avatar className="w-4 h-4">
                    {char?.avatar && <AvatarImage src={char.avatar} />}
                    <AvatarFallback className="text-[8px]">{char?.emoji}</AvatarFallback>
                  </Avatar>
                  {char?.name}
                </button>
              );
            })}
          </div>
        </DrawerHeader>

        <div className="flex flex-col h-[60vh]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-center text-muted-foreground text-sm">
                Ask questions about the research findings or share your thoughts.
              </p>
            )}
            
            {messages.map(msg => {
              const char = msg.characterId ? getCharacterById(msg.characterId) : null;
              
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {msg.role === 'character' && char && (
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={char.avatar} />
                      <AvatarFallback>{char.emoji}</AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {msg.role === 'character' && char && (
                      <p className="text-xs font-medium mb-1" style={{ color: char.color }}>
                        {char.name}
                      </p>
                    )}
                    {msg.content}
                  </div>
                </div>
              );
            })}
            
            {isLoading && (
              <div className="flex gap-2">
                <Avatar className="w-8 h-8">
                  {getCharacterById(selectedCharacter)?.avatar && (
                    <AvatarImage src={getCharacterById(selectedCharacter)?.avatar} />
                  )}
                  <AvatarFallback>
                    {getCharacterById(selectedCharacter)?.emoji}
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted px-3 py-2 rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question or share feedback..."
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={isLoading}
              />
              <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}