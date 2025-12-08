import { useState, useCallback } from 'react';
import { TEAM_CHARACTERS, getCharacterById } from '@/data/teamCharacters';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type DeckCard = Database['public']['Tables']['deck_cards']['Row'];

export interface GroupChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  characterId?: string;
  timestamp: Date;
}

interface UseGroupChatProps {
  deckId: string;
  cards: DeckCard[];
}

export const useGroupChat = ({ deckId, cards }: UseGroupChatProps) => {
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const [messages, setMessages] = useState<GroupChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentResponder, setCurrentResponder] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isCrystallizing, setIsCrystallizing] = useState(false);
  const [expandingMessageId, setExpandingMessageId] = useState<string | null>(null);

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

  // Toggle character selection
  const toggleCharacter = useCallback((characterId: string) => {
    setSelectedCharacters(prev => {
      if (prev.includes(characterId)) {
        return prev.filter(id => id !== characterId);
      }
      return [...prev, characterId];
    });
  }, []);

  // Add character to group
  const addCharacter = useCallback((characterId: string) => {
    if (!selectedCharacters.includes(characterId)) {
      setSelectedCharacters(prev => [...prev, characterId]);
      
      // If chat is already open, add greeting from new character
      if (isOpen) {
        const character = getCharacterById(characterId);
        if (character) {
          const greeting: GroupChatMessage = {
            id: `greeting-${characterId}-${Date.now()}`,
            role: 'assistant',
            content: `*joins the meeting* ${character.signaturePhrases[0]} What have I missed?`,
            characterId,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, greeting]);
        }
      }
    }
  }, [selectedCharacters, isOpen]);

  // Remove character from group
  const removeCharacter = useCallback((characterId: string) => {
    setSelectedCharacters(prev => prev.filter(id => id !== characterId));
  }, []);

  // Open group chat with selected characters
  const openGroupChat = useCallback(() => {
    if (selectedCharacters.length < 2) return;

    setIsOpen(true);
    
    // Add greetings from all selected characters
    const greetings: GroupChatMessage[] = selectedCharacters.map((charId, index) => {
      const character = getCharacterById(charId);
      if (!character) return null;
      
      const greetingVariants = [
        `Hello everyone! ${character.tagline}`,
        `Great to be here. ${character.signaturePhrases[0]}`,
        `Looking forward to this discussion. ${character.tagline}`,
      ];
      
      return {
        id: `greeting-${charId}-${Date.now()}-${index}`,
        role: 'assistant' as const,
        content: greetingVariants[index % greetingVariants.length],
        characterId: charId,
        timestamp: new Date(Date.now() + index * 100),
      };
    }).filter(Boolean) as GroupChatMessage[];

    setMessages(greetings);
  }, [selectedCharacters]);

  // Close group chat
  const closeGroupChat = useCallback(() => {
    setIsOpen(false);
    setMessages([]);
    setCurrentResponder(null);
  }, []);

  // Reset selection
  const resetSelection = useCallback(() => {
    setSelectedCharacters([]);
    setMessages([]);
    setIsOpen(false);
    setCurrentResponder(null);
  }, []);

  // Send a message and get responses from all characters in sequence
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isStreaming || selectedCharacters.length === 0) return;

    const userMessage: GroupChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsStreaming(true);

    const deckContext = buildDeckContext();

    // Get responses from each character sequentially
    for (const characterId of selectedCharacters) {
      setCurrentResponder(characterId);

      // Build conversation history including other characters' responses
      const conversationMessages = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.characterId 
          ? `[${getCharacterById(m.characterId)?.name || 'Unknown'}]: ${m.content}`
          : m.content,
      }));

      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/team-group-chat`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({
              characterId,
              otherCharacterIds: selectedCharacters.filter(id => id !== characterId),
              messages: conversationMessages,
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
        const assistantId = `assistant-${characterId}-${Date.now()}`;

        // Add empty assistant message
        setMessages(prev => [...prev, {
          id: assistantId,
          role: 'assistant',
          content: '',
          characterId,
          timestamp: new Date(),
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

        // Update messages state with the final response for next iteration
        const finalMessage: GroupChatMessage = {
          id: assistantId,
          role: 'assistant',
          content: assistantContent,
          characterId,
          timestamp: new Date(),
        };
        
        // Small delay between characters for natural feel
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`Chat error for ${characterId}:`, error);
        setMessages(prev => [...prev, {
          id: `error-${characterId}-${Date.now()}`,
          role: 'assistant',
          content: `Sorry, I encountered an error. Please try again.`,
          characterId,
          timestamp: new Date(),
        }]);
      }
    }

    setIsStreaming(false);
    setCurrentResponder(null);
  }, [selectedCharacters, messages, isStreaming, buildDeckContext]);

  // Crystallize conversation into insight card
  const crystallizeConversation = useCallback(async () => {
    if (messages.length < 3 || isCrystallizing) return;

    setIsCrystallizing(true);
    try {
      const formattedMessages = messages.map(m => ({
        role: m.role,
        content: m.content,
        characterName: m.characterId ? getCharacterById(m.characterId)?.name : undefined
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

      if (!response.ok) {
        throw new Error('Failed to crystallize insight');
      }

      const data = await response.json();
      toast.success('✨ Insight crystallized!', {
        description: data.title
      });
    } catch (error) {
      console.error('Crystallize error:', error);
      toast.error('Failed to crystallize insight');
    } finally {
      setIsCrystallizing(false);
    }
  }, [messages, deckId, isCrystallizing]);

  // Expand a message with more detail
  const expandMessage = useCallback(async (messageId: string, characterId: string, originalContent: string) => {
    if (isStreaming || expandingMessageId) return;
    
    setExpandingMessageId(messageId);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/team-group-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            characterId,
            otherCharacterIds: [],
            messages: [
              { role: 'assistant', content: originalContent },
              { role: 'user', content: 'Can you expand on that with more detail?' }
            ],
            deckContext: buildDeckContext(),
            responseMode: 'detailed',
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to expand');
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let expandedContent = originalContent + '\n\n---\n\n';
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

  return {
    selectedCharacters,
    messages,
    isStreaming,
    currentResponder,
    isOpen,
    isCrystallizing,
    expandingMessageId,
    toggleCharacter,
    addCharacter,
    removeCharacter,
    openGroupChat,
    closeGroupChat,
    resetSelection,
    sendMessage,
    crystallizeConversation,
    expandMessage,
  };
};
