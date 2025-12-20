import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Mic, MicOff } from 'lucide-react';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useLanguage } from '@/contexts/LanguageContext';

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
  characterColor?: string;
}

export const ChatInput = ({
  onSend,
  disabled = false,
  placeholder = 'Type a message...',
  characterColor,
}: ChatInputProps) => {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { language } = useLanguage();

  // Voice input
  const voiceLang = language === 'ru' ? 'ru-RU' : language === 'es' ? 'es-ES' : 'en-US';
  const {
    isListening,
    isSupported,
    transcript,
    startListening,
    stopListening,
  } = useVoiceInput({ language: voiceLang, continuous: true });

  // Append transcript to value
  useEffect(() => {
    if (transcript) {
      setValue(prev => prev ? `${prev} ${transcript}` : transcript);
    }
  }, [transcript]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [value]);

  const handleSend = () => {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="relative flex gap-2 items-end">
      {/* Listening indicator */}
      {isListening && (
        <div className="absolute -top-6 left-0 text-xs text-red-500 animate-pulse flex items-center gap-1">
          <span className="w-2 h-2 bg-red-500 rounded-full" />
          {language === 'ru' ? 'Слушаю...' : language === 'es' ? 'Escuchando...' : 'Listening...'}
        </div>
      )}

      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="min-h-[44px] max-h-[120px] resize-none bg-background"
        rows={1}
      />

      {/* Voice input button */}
      {isSupported && (
        <Button
          size="icon"
          variant={isListening ? "destructive" : "outline"}
          onClick={handleVoiceToggle}
          disabled={disabled}
          className="shrink-0 h-[44px] w-[44px]"
          title={isListening ? 'Stop recording' : 'Start voice input'}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </Button>
      )}

      {/* Send button */}
      <Button
        size="icon"
        onClick={handleSend}
        disabled={!value.trim() || disabled}
        className="shrink-0 h-[44px] w-[44px]"
        style={characterColor ? {
          backgroundColor: characterColor,
          borderColor: characterColor,
        } : undefined}
      >
        <Send className="w-4 h-4" />
      </Button>
    </div>
  );
};
