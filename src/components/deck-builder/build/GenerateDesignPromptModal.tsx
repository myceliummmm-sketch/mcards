import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, Palette, CheckCircle2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type DeckCard = Database['public']['Tables']['deck_cards']['Row'];

interface GenerateDesignPromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deckTitle: string;
  cards: DeckCard[];
}

export const GenerateDesignPromptModal = ({
  open,
  onOpenChange,
  deckTitle,
  cards
}: GenerateDesignPromptModalProps) => {
  const { language } = useTranslation();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [prompt, setPrompt] = useState('');

  const getCardData = useCallback((slot: number): Record<string, string> => {
    const card = cards.find(c => c.card_slot === slot);
    return (card?.card_data as Record<string, string>) || {};
  }, [cards]);

  const generatePrompt = useCallback(() => {
    // Vision data
    const v1 = getCardData(1); // Product
    const v3 = getCardData(3); // Audience

    // Build data
    const b1 = getCardData(11); // Features
    const b3 = getCardData(13); // Screens
    const b4 = getCardData(14); // Style
    const b5 = getCardData(15); // Summary

    const isRu = language === 'ru';

    // Generate design-focused prompt
    const generatedPrompt = isRu ? `# Design Brief: ${b5.app_name || v1.product_name || deckTitle}

## Визуальное направление

### Тема и настроение
- **Тема:** ${b4.theme || 'Dark'}
- **Настроение:** ${b4.mood || 'Premium'}
- **Основной цвет:** ${b4.primary_color || 'Purple'}
- **Акцентный цвет:** ${b4.accent_color || 'Gold'}

### Референсы
${b4.reference_apps || 'Современный минималистичный дизайн'}

### Обоснование стиля
${b4.style_reasoning || 'Стиль подобран под целевую аудиторию'}

## Целевая аудитория
${v3.demographics || 'Целевая аудитория приложения'}

Поведение: ${v3.behaviors || 'Типичное поведение пользователей'}

## UI компоненты (из Features)

### Базовые элементы
${b1.basic_features || '- Формы авторизации\n- Навигация\n- Карточки данных'}

### Ключевые элементы
${b1.key_features || '- Уникальные UI компоненты'}

## Экраны для дизайна

### Онбординг
${b3.onboarding_screens || '1. Welcome\n2. How It Works\n3. Get Started'}

### Основные экраны
${b3.main_screens || '- Главный экран\n- Экран ввода'}

### Экраны результата
${b3.result_screens || '- Экран результата'}

### Вспомогательные
${b3.profile_screens || '- Профиль\n- Настройки'}

## UX заметки
${b3.ux_notes || 'Минималистичный интерфейс, фокус на скорости'}

## Формат приложения
${b5.app_format || 'Mobile App (iOS + Android)'}

---
*Создано в Mycelium Cards*
`.trim() : `# Design Brief: ${b5.app_name || v1.product_name || deckTitle}

## Visual Direction

### Theme & Mood
- **Theme:** ${b4.theme || 'Dark'}
- **Mood:** ${b4.mood || 'Premium'}
- **Primary Color:** ${b4.primary_color || 'Purple'}
- **Accent Color:** ${b4.accent_color || 'Gold'}

### References
${b4.reference_apps || 'Modern minimalist design'}

### Style Reasoning
${b4.style_reasoning || 'Style chosen to match target audience'}

## Target Audience
${v3.demographics || 'Target audience of the app'}

Behaviors: ${v3.behaviors || 'Typical user behaviors'}

## UI Components (from Features)

### Basic Elements
${b1.basic_features || '- Auth forms\n- Navigation\n- Data cards'}

### Key Elements
${b1.key_features || '- Unique UI components'}

## Screens to Design

### Onboarding
${b3.onboarding_screens || '1. Welcome\n2. How It Works\n3. Get Started'}

### Main Screens
${b3.main_screens || '- Home screen\n- Input screen'}

### Result Screens
${b3.result_screens || '- Result screen'}

### Supporting
${b3.profile_screens || '- Profile\n- Settings'}

## UX Notes
${b3.ux_notes || 'Minimal interface, focus on speed'}

## App Format
${b5.app_format || 'Mobile App (iOS + Android)'}

---
*Created with Mycelium Cards*
`.trim();

    setPrompt(generatedPrompt);
  }, [getCardData, language, deckTitle]);

  useEffect(() => {
    if (open) {
      generatePrompt();
    }
  }, [open, generatePrompt]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    toast({
      title: language === 'ru' ? '✅ Скопировано!' : '✅ Copied!',
      description: language === 'ru'
        ? 'Design промт скопирован в буфер обмена'
        : 'Design prompt copied to clipboard',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([prompt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deckTitle.replace(/\s+/g, '-')}-design-prompt.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: language === 'ru' ? '📥 Скачано!' : '📥 Downloaded!',
      description: language === 'ru'
        ? 'Файл с design промтом сохранён'
        : 'Design prompt file saved',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/30">
              <Palette className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <span className="text-xl">
                {language === 'ru' ? 'Design Промт' : 'Design Prompt'}
              </span>
              <p className="text-sm text-muted-foreground font-normal mt-0.5">
                {language === 'ru'
                  ? 'Визуальное направление для дизайнера или Figma AI'
                  : 'Visual direction for designer or Figma AI'}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Badge variant="outline" className="bg-pink-500/10 text-pink-400 border-pink-500/30">
            <Sparkles className="w-3 h-3 mr-1" />
            {language === 'ru' ? 'Стиль + Экраны' : 'Style + Screens'}
          </Badge>
          <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">
            {language === 'ru' ? 'Для Figma / Midjourney' : 'For Figma / Midjourney'}
          </Badge>
        </div>

        <ScrollArea className="flex-1 min-h-0 h-[50vh] border rounded-lg bg-muted/30">
          <div className="p-4">
            <motion.pre
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm whitespace-pre-wrap font-mono text-foreground/90 leading-relaxed"
            >
              {prompt}
            </motion.pre>
          </div>
        </ScrollArea>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-xs text-muted-foreground">
            {prompt.length.toLocaleString()} {language === 'ru' ? 'символов' : 'characters'}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownload} className="gap-2">
              <Download className="w-4 h-4" />
              {language === 'ru' ? 'Скачать .txt' : 'Download .txt'}
            </Button>
            <Button onClick={handleCopy} className="gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  {language === 'ru' ? 'Скопировано!' : 'Copied!'}
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  {language === 'ru' ? 'Копировать' : 'Copy'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
