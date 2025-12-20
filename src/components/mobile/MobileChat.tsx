import { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { getCharacterById, TEAM_CHARACTERS } from '@/data/teamCharacters';
import type { Database } from '@/integrations/supabase/types';

type DeckCard = Database['public']['Tables']['deck_cards']['Row'];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  characterId?: string;
}

interface MobileChatProps {
  deckId: string;
  cards: DeckCard[];
  onClose: () => void;
}

export function MobileChat({ deckId, cards, onClose }: MobileChatProps) {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState('evergreen');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get available characters (simplified for mobile)
  const characters = TEAM_CHARACTERS.slice(0, 4); // First 4 characters

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Build deck context
  const buildDeckContext = () => {
    const filledCards = cards.filter(card => {
      const data = card.card_data as Record<string, any> | null;
      return data && Object.keys(data).some(k => k !== 'completed' && data[k]);
    });

    if (filledCards.length === 0) return 'No cards filled yet.';

    return filledCards.map(card => {
      const data = card.card_data as Record<string, any>;
      return `Card ${card.card_slot} (${card.card_type}): ${JSON.stringify(data)}`;
    }).join('\n');
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/team-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            characterId: selectedCharacter,
            messages: [...messages, userMessage].map(m => ({
              role: m.role,
              content: m.content,
            })),
            deckContext: buildDeckContext(),
            language,
          }),
        }
      );

      if (!response.ok) throw new Error('Chat failed');
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      const assistantId = `assistant-${Date.now()}`;

      // Add empty assistant message
      setMessages(prev => [...prev, {
        id: assistantId,
        role: 'assistant',
        content: '',
        characterId: selectedCharacter,
      }]);

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId
                    ? { ...m, content: assistantContent }
                    : m
                )
              );
            }
          } catch {
            // Ignore parse errors
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: t('mobileFlow.chat.error') || 'Sorry, something went wrong. Please try again.',
        characterId: selectedCharacter,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const character = getCharacterById(selectedCharacter, language);

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{character?.emoji}</span>
          <div>
            <div className="font-medium">{character?.name}</div>
            <div className="text-xs text-muted-foreground">{character?.role}</div>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Character selector */}
      <div className="flex gap-2 p-3 border-b overflow-x-auto">
        {characters.map(char => {
          const charData = getCharacterById(char.id, language);
          return (
            <button
              key={char.id}
              onClick={() => setSelectedCharacter(char.id)}
              className={`flex-shrink-0 px-3 py-2 rounded-full text-sm flex items-center gap-2 transition-colors ${
                selectedCharacter === char.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              <span>{charData?.emoji}</span>
              <span>{charData?.name}</span>
            </button>
          );
        })}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            {t('mobileFlow.chat.placeholder') || 'Ask your AI team anything about your idea...'}
          </div>
        )}

        {messages.map(msg => {
          const msgChar = msg.characterId ? getCharacterById(msg.characterId, language) : null;

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  {msgChar?.emoji || '🤖'}
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {msg.content || (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('mobileFlow.chat.inputPlaceholder') || 'Type a message...'}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          disabled={isLoading}
          className="flex-1"
        />
        <Button
          onClick={sendMessage}
          disabled={!input.trim() || isLoading}
          size="icon"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
