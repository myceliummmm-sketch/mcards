import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLandingChat } from '@/hooks/useLandingChat';
import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import everAvatar from '@/assets/avatars/ever.png';

const CONVERSATION_STARTERS = {
  en: [
    "I have a startup idea but don't know where to start",
    "How do I validate my business idea?",
    "What makes a startup fail vs succeed?",
    "How does Mycelium help founders?",
  ],
  ru: [
    "У меня есть идея стартапа, но не знаю с чего начать",
    "Как проверить жизнеспособность бизнес-идеи?",
    "Почему одни стартапы выживают, а другие нет?",
    "Как Mycelium помогает основателям?",
  ],
  es: [
    "Tengo una idea de startup pero no sé por dónde empezar",
    "¿Cómo valido mi idea de negocio?",
    "¿Qué hace que una startup fracase o tenga éxito?",
    "¿Cómo ayuda Mycelium a los fundadores?",
  ],
};

interface EverChatWidgetProps {
  externalOpen?: boolean;
  onExternalOpenChange?: (open: boolean) => void;
}

export const EverChatWidget = ({ externalOpen, onExternalOpenChange }: EverChatWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { t, language } = useTranslation();
  const { messages, isStreaming, hasReachedLimit, messageCount, maxMessages, sendMessage } = useLandingChat(language as 'en' | 'ru' | 'es');
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync with external state
  useEffect(() => {
    if (externalOpen !== undefined) {
      setIsOpen(externalOpen);
    }
  }, [externalOpen]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    onExternalOpenChange?.(open);
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = () => {
    if (!inputValue.trim() || isStreaming || hasReachedLimit) return;
    sendMessage(inputValue);
    setInputValue('');
  };

  const handleStarterClick = (starter: string) => {
    if (isStreaming || hasReachedLimit) return;
    sendMessage(starter);
  };

  const starters = CONVERSATION_STARTERS[language as keyof typeof CONVERSATION_STARTERS] || CONVERSATION_STARTERS.en;
  const showStarters = messages.length === 1; // Only show greeting

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleOpenChange(true)}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-primary shadow-lg shadow-primary/30 flex items-center justify-center group"
          >
            <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
            <img 
              src={everAvatar} 
              alt="Ever Green" 
              className="w-12 h-12 rounded-full border-2 border-primary-foreground"
            />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
              <MessageCircle className="w-3 h-3 text-accent-foreground" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[550px] max-h-[calc(100vh-6rem)] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-border bg-muted/30">
              <div className="relative">
                <img 
                  src={everAvatar} 
                  alt="Ever Green" 
                  className="w-10 h-10 rounded-full border-2 border-primary"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-semibold text-sm">Ever Green</h3>
                <p className="text-xs text-muted-foreground">CEO / Visionary</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleOpenChange(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </motion.div>
                ))}

                {/* Typing indicator */}
                {isStreaming && messages[messages.length - 1]?.content === '' && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Conversation Starters */}
                {showStarters && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-2 pt-2"
                  >
                    <p className="text-xs text-muted-foreground text-center mb-3">
                      {language === 'es' ? 'O elige una pregunta:' : language === 'ru' ? 'Или выберите вопрос:' : 'Or pick a question:'}
                    </p>
                    {starters.map((starter, index) => (
                      <button
                        key={index}
                        onClick={() => handleStarterClick(starter)}
                        disabled={isStreaming}
                        className="w-full text-left px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted border border-border/50 hover:border-primary/30 text-sm text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
                      >
                        {starter}
                      </button>
                    ))}
                  </motion.div>
                )}

                {/* Limit Reached CTA */}
                {hasReachedLimit && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-primary/10 border border-primary/30 rounded-xl p-4 text-center"
                  >
                    <Sparkles className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium mb-1">
                      {language === 'es' ? '¿Te gusta la conversación?' : language === 'ru' ? 'Понравился разговор?' : 'Enjoying the conversation?'}
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      {language === 'es' 
                        ? 'Regístrate para seguir chateando con Ever y conocer a todo el equipo de asesores IA'
                        : language === 'ru' 
                        ? 'Зарегистрируйтесь, чтобы продолжить общение с Ever и встретить всю команду AI-советников'
                        : 'Sign up to continue chatting with Ever and meet the entire AI advisory team'}
                    </p>
                    <Button 
                      onClick={() => navigate('/auth')}
                      className="w-full gap-2"
                    >
                      {language === 'es' ? 'Empieza Gratis' : language === 'ru' ? 'Начать бесплатно' : 'Start Free'}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border bg-muted/20">
              {!hasReachedLimit ? (
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    placeholder={language === 'es' ? 'Escribe un mensaje...' : language === 'ru' ? 'Напишите сообщение...' : 'Type a message...'}
                    disabled={isStreaming}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSend} 
                    disabled={!inputValue.trim() || isStreaming}
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-center text-muted-foreground">
                  {language === 'es' 
                    ? `${messageCount}/${maxMessages} mensajes gratis usados`
                    : language === 'ru' 
                    ? `${messageCount}/${maxMessages} бесплатных сообщений использовано`
                    : `${messageCount}/${maxMessages} free messages used`}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
