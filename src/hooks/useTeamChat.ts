import { useState, useCallback } from 'react';
import { CHARACTER_SPEECH_PROFILES } from '@/data/characterPrompts';
import type { Database } from '@/integrations/supabase/types';

type DeckCard = Database['public']['Tables']['deck_cards']['Row'];

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  characterId?: string;
  timestamp: Date;
}

interface UseTeamChatProps {
  deckId: string;
  cards: DeckCard[];
}

export const useTeamChat = ({ deckId, cards }: UseTeamChatProps) => {
  const [activeCharacter, setActiveCharacter] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Build deck context from cards
  const buildDeckContext = useCallback(() => {
    if (!cards || cards.length === 0) {
      return 'No cards have been filled yet.';
    }

    const filledCards = cards.filter(card => {
      const data = card.card_data as Record<string, any> | null;
      return data && Object.keys(data).length > 0;
    });

    if (filledCards.length === 0) {
      return 'No cards have been filled yet.';
    }

    return filledCards.map(card => {
      const data = card.card_data as Record<string, any>;
      const evaluation = card.evaluation as { overall?: number } | null;
      
      let summary = `**${card.card_type}** (Slot ${card.card_slot})`;
      
      // Extract key content
      const content = data.summary || data.description || data.content || data.statement || data.name;
      if (content) {
        summary += `\n  Content: ${content}`;
      }
      
      if (evaluation?.overall) {
        summary += `\n  Score: ${evaluation.overall}/100`;
      }
      
      return summary;
    }).join('\n\n');
  }, [cards]);

  // Open chat with a character
  const openChat = useCallback((characterId: string) => {
    const profile = CHARACTER_SPEECH_PROFILES[characterId];
    if (!profile) return;

    setActiveCharacter(characterId);
    setIsOpen(true);
    
    // Add greeting message
    setMessages([{
      id: `greeting-${Date.now()}`,
      role: 'assistant',
      content: profile.greeting,
      characterId,
      timestamp: new Date(),
    }]);
  }, []);

  // Close chat
  const closeChat = useCallback(() => {
    setIsOpen(false);
    setActiveCharacter(null);
    setMessages([]);
  }, []);

  // Send a message
  const sendMessage = useCallback(async (content: string) => {
    if (!activeCharacter || !content.trim() || isStreaming) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsStreaming(true);

    // Prepare messages for API (excluding greeting metadata)
    const apiMessages = [...messages, userMessage].map(m => ({
      role: m.role,
      content: m.content,
    }));

    const deckContext = buildDeckContext();

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
            characterId: activeCharacter,
            messages: apiMessages,
            deckContext,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      // Stream the response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      const assistantId = `assistant-${Date.now()}`;

      // Add empty assistant message
      setMessages(prev => [...prev, {
        id: assistantId,
        role: 'assistant',
        content: '',
        characterId: activeCharacter,
        timestamp: new Date(),
      }]);

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process line by line
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
            // Incomplete JSON, put back and wait
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      // Final flush
      if (buffer.trim()) {
        for (let raw of buffer.split('\n')) {
          if (!raw || raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
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
          } catch { /* ignore */ }
        }
      }

    } catch (error) {
      console.error('Chat error:', error);
      // Add error message
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        characterId: activeCharacter,
        timestamp: new Date(),
      }]);
    } finally {
      setIsStreaming(false);
    }
  }, [activeCharacter, messages, isStreaming, buildDeckContext]);

  return {
    activeCharacter,
    messages,
    isStreaming,
    isOpen,
    openChat,
    closeChat,
    sendMessage,
  };
};
