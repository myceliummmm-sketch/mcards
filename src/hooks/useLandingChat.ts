import { useState, useCallback } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const GREETING = "Hey! I'm Ever Green, the visionary behind Mycelium. Got a startup idea brewing? I'm here to help you think bigger. What's on your mind?";

const MAX_FREE_MESSAGES = 5;

export const useLandingChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'greeting',
      role: 'assistant',
      content: GREETING,
      timestamp: new Date(),
    }
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [messageCount, setMessageCount] = useState(0);

  const hasReachedLimit = messageCount >= MAX_FREE_MESSAGES;

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isStreaming || hasReachedLimit) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsStreaming(true);
    setMessageCount(prev => prev + 1);

    const apiMessages = messages
      .filter(m => m.id !== 'greeting')
      .concat(userMessage)
      .map(m => ({ role: m.role, content: m.content }));

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
            characterId: 'evergreen',
            messages: apiMessages,
            deckContext: 'This is a landing page visitor exploring Mycelium for the first time. They might have a startup idea or be curious about how the platform works. Be welcoming and help them see the value of structured startup thinking.',
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      const assistantId = `assistant-${Date.now()}`;

      setMessages(prev => [...prev, {
        id: assistantId,
        role: 'assistant',
        content: '',
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

    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "Hmm, something went wrong on my end. Try again in a moment?",
        timestamp: new Date(),
      }]);
    } finally {
      setIsStreaming(false);
    }
  }, [messages, isStreaming, hasReachedLimit]);

  const resetChat = useCallback(() => {
    setMessages([{
      id: 'greeting',
      role: 'assistant',
      content: GREETING,
      timestamp: new Date(),
    }]);
    setMessageCount(0);
  }, []);

  return {
    messages,
    isStreaming,
    hasReachedLimit,
    messageCount,
    maxMessages: MAX_FREE_MESSAGES,
    sendMessage,
    resetChat,
  };
};
