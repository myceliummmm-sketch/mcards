import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getCharacterById } from '@/data/teamCharacters';
import { Send, Loader2, X } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

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
  presenterCharacterId?: string; // The character who presented this insight
  onSendMessage: (message: string, characterId: string) => Promise<string | null>;
  onReject?: () => void; // Called when user decides to reject after discussion
}

export function DiscussionDrawer({
  open,
  onOpenChange,
  cardTitle,
  evaluators,
  presenterCharacterId,
  onSendMessage,
  onReject
}: DiscussionDrawerProps) {
  const { t, language } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Use presenter as default, fallback to first evaluator
  const safeEvaluators = evaluators && evaluators.length > 0 ? evaluators : ['evergreen'];
  const defaultCharacter = presenterCharacterId && safeEvaluators.includes(presenterCharacterId) 
    ? presenterCharacterId 
    : safeEvaluators[0];
  const [selectedCharacter, setSelectedCharacter] = useState(defaultCharacter);

  // Reset to presenter when drawer opens with new insight
  useEffect(() => {
    if (open && presenterCharacterId && safeEvaluators.includes(presenterCharacterId)) {
      setSelectedCharacter(presenterCharacterId);
    } else if (safeEvaluators.length > 0 && !safeEvaluators.includes(selectedCharacter)) {
      setSelectedCharacter(safeEvaluators[0]);
    }
  }, [open, presenterCharacterId, safeEvaluators, selectedCharacter]);

  // When drawer opens, get initial comment from character about their insight
  useEffect(() => {
    if (open && messages.length === 0) {
      setInput('');
      // Get character's initial comment about their insight
      setIsLoading(true);
      const initialMessage = language === 'ru'
        ? 'Расскажи подробнее про этот инсайт - почему ты считаешь это важным?'
        : 'Tell me more about this insight - why do you think this is important?';
      
      onSendMessage(initialMessage, selectedCharacter)
        .then(response => {
          if (response) {
            const characterMessage: Message = {
              id: Date.now().toString(),
              role: 'character',
              characterId: selectedCharacter,
              content: response
            };
            setMessages([characterMessage]);
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [open]);

  // Reset messages when cardTitle changes
  useEffect(() => {
    if (!open) {
      setMessages([]);
    }
  }, [cardTitle]);

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

  const selectedChar = getCharacterById(selectedCharacter, language);

  const placeholderText = language === 'ru' 
    ? 'Задай вопрос или поделись мнением...' 
    : 'Ask a question or share feedback...';
  
  const emptyText = language === 'ru'
    ? 'Обсуди инсайт с командой или задай вопросы.'
    : 'Discuss the insight with the team or ask questions.';

  const rejectButtonText = language === 'ru'
    ? 'Не резонирует'
    : 'Does not resonate';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:w-[500px] sm:max-w-[500px] flex flex-col p-0">
        <SheetHeader className="p-4 border-b border-border">
          <SheetTitle className="text-left pr-8">
            {language === 'ru' ? 'Обсуждение' : 'Discussion'}: {cardTitle}
          </SheetTitle>
          
          {/* Character selector */}
          <div className="flex gap-2 mt-2 flex-wrap">
            {safeEvaluators.map(charId => {
              const char = getCharacterById(charId, language);
              if (!char) return null;
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
                    {char.avatar && <AvatarImage src={char.avatar} />}
                    <AvatarFallback className="text-[8px]">{char.emoji}</AvatarFallback>
                  </Avatar>
                  {char.name}
                </button>
              );
            })}
          </div>
        </SheetHeader>

        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-8">
                {emptyText}
              </p>
            )}
            
            {messages.map(msg => {
              const char = msg.characterId ? getCharacterById(msg.characterId, language) : null;
              
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
            
            {isLoading && selectedChar && (
              <div className="flex gap-2">
                <Avatar className="w-8 h-8">
                  {selectedChar.avatar && (
                    <AvatarImage src={selectedChar.avatar} />
                  )}
                  <AvatarFallback>
                    {selectedChar.emoji}
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted px-3 py-2 rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border space-y-3">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={placeholderText}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={isLoading}
              />
              <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Reject button */}
            {onReject && (
              <Button
                variant="outline"
                className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
                onClick={onReject}
              >
                <X className="w-4 h-4 mr-2" />
                {rejectButtonText}
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}