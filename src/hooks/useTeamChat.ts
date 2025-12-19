import { useState, useCallback, useEffect } from 'react';
import { CHARACTER_SPEECH_PROFILES } from '@/data/characterPrompts';
import { toast } from 'sonner';
import { getCharacterById } from '@/data/teamCharacters';
import { useLanguage } from '@/contexts/LanguageContext';
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

// Storage key for chat history
const getChatStorageKey = (deckId: string, characterId: string) => 
  `team-chat-${deckId}-${characterId}`;

// Save chat history to localStorage (keep last 24 hours)
const saveChatHistory = (deckId: string, characterId: string, messages: ChatMessage[]) => {
  try {
    const key = getChatStorageKey(deckId, characterId);
    const data = {
      messages: messages.map(m => ({
        ...m,
        timestamp: m.timestamp.toISOString()
      })),
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save chat history:', e);
  }
};

// Load chat history from localStorage
const loadChatHistory = (deckId: string, characterId: string): ChatMessage[] | null => {
  try {
    const key = getChatStorageKey(deckId, characterId);
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    
    const data = JSON.parse(stored);
    const savedAt = new Date(data.savedAt);
    const now = new Date();
    
    // Only keep history from last 24 hours
    const hoursDiff = (now.getTime() - savedAt.getTime()) / (1000 * 60 * 60);
    if (hoursDiff > 24) {
      localStorage.removeItem(key);
      return null;
    }
    
    return data.messages.map((m: any) => ({
      ...m,
      timestamp: new Date(m.timestamp)
    }));
  } catch (e) {
    console.error('Failed to load chat history:', e);
    return null;
  }
};

export const useTeamChat = ({ deckId, cards }: UseTeamChatProps) => {
  const { language } = useLanguage();
  const [activeCharacter, setActiveCharacter] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isCrystallizing, setIsCrystallizing] = useState(false);
  const [expandingMessageId, setExpandingMessageId] = useState<string | null>(null);

  // Save messages whenever they change
  useEffect(() => {
    if (activeCharacter && messages.length > 0) {
      saveChatHistory(deckId, activeCharacter, messages);
    }
  }, [deckId, activeCharacter, messages]);

  // Build FULL deck context from cards - include ALL fields
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
      const evaluation = card.evaluation as Record<string, any> | null;
      
      let summary = `=== CARD: ${card.card_type.toUpperCase()} (Slot #${card.card_slot}) ===\n`;
      
      // Include ALL card data fields
      Object.entries(data).forEach(([key, value]) => {
        if (value && key !== 'completed') {
          const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          summary += `${label}: ${value}\n`;
        }
      });
      
      // Include evaluation if available
      if (evaluation?.overall) {
        summary += `\nOverall Score: ${evaluation.overall}/10`;
        
        // Include individual scores if they exist
        const scoreFields = ['positioning', 'market_fit', 'credibility', 'actionability', 'messaging', 'clarity', 'impact'];
        scoreFields.forEach(field => {
          if (evaluation[field]?.score) {
            summary += `\n  - ${field}: ${evaluation[field].score}/10`;
            if (evaluation[field]?.explanation) {
              summary += ` (${evaluation[field].explanation.substring(0, 100)}...)`;
            }
          }
        });
      }
      
      return summary;
    }).join('\n\n');
  }, [cards]);

  // Open chat with a character - LOAD previous history
  const openChat = useCallback((characterId: string) => {
    const profile = CHARACTER_SPEECH_PROFILES[characterId];
    if (!profile) return;

    setActiveCharacter(characterId);
    setIsOpen(true);
    
    // Try to load previous chat history
    const savedHistory = loadChatHistory(deckId, characterId);
    
    if (savedHistory && savedHistory.length > 0) {
      // Resume previous conversation
      setMessages(savedHistory);
    } else {
      // Start fresh with greeting - use localized version
      const greetingText = profile.greeting[language] || profile.greeting.en;
      setMessages([{
        id: `greeting-${Date.now()}`,
        role: 'assistant',
        content: greetingText,
        characterId,
        timestamp: new Date(),
      }]);
    }
  }, [deckId, language]);

  // Close chat - DON'T clear messages, they're saved in localStorage
  const closeChat = useCallback(() => {
    setIsOpen(false);
    setActiveCharacter(null);
    // Don't clear messages - they're persisted in localStorage
  }, []);

  // Send a message
  const sendMessage = useCallback(async (content: string, responseMode?: 'concise' | 'detailed') => {
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
            responseMode,
            language,
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

  // Expand a message with more detail
  const expandMessage = useCallback(async (messageId: string, characterId: string, originalContent: string) => {
    if (isStreaming || expandingMessageId) return;
    
    setExpandingMessageId(messageId);
    
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
            characterId,
            messages: [
              { role: 'assistant', content: originalContent },
              { role: 'user', content: language === 'ru' ? 'Расскажи подробнее об этом.' : 'Can you expand on that with more detail?' }
            ],
            deckContext: buildDeckContext(),
            responseMode: 'detailed',
            language,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to expand');
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let expandedContent = originalContent + '\n\n---\n\n';
      let buffer = '';

      // Update the message as we stream
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
              expandedContent += delta;
              setMessages(prev => 
                prev.map(m => 
                  m.id === messageId 
                    ? { ...m, content: expandedContent }
                    : m
                )
              );
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error('Expand error:', error);
      toast.error('Failed to expand message');
    } finally {
      setExpandingMessageId(null);
    }
  }, [isStreaming, expandingMessageId, buildDeckContext]);

  // Crystallize conversation into insight
  const crystallizeConversation = useCallback(async () => {
    if (messages.length < 3) {
      toast.error('Need at least one exchange to crystallize');
      return;
    }
    
    if (isCrystallizing || !activeCharacter) {
      return;
    }

    setIsCrystallizing(true);
    
    toast.info('✨ Crystallizing insight...', {
      description: 'Creating a crystal from this conversation'
    });
    
    try {
      const formattedMessages = messages.map(m => ({
        role: m.role,
        content: m.content,
        characterName: m.characterId ? getCharacterById(m.characterId, language)?.name : undefined
      }));

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/crystallize-insight`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: formattedMessages,
            deckId,
            phase: 'general'
          }),
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to crystallize insight');
      }

      toast.success('✨ Insight crystallized!', {
        description: data.title || 'New insight card created'
      });
    } catch (error) {
      console.error('Crystallize error:', error);
      toast.error('Failed to crystallize', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsCrystallizing(false);
    }
  }, [messages, deckId, isCrystallizing, activeCharacter]);

  return {
    activeCharacter,
    messages,
    isStreaming,
    isOpen,
    isCrystallizing,
    expandingMessageId,
    openChat,
    closeChat,
    sendMessage,
    expandMessage,
    crystallizeConversation,
  };
};
