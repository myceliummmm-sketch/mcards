import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, Rocket, CheckCircle2, Sparkles, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type DeckCard = Database['public']['Tables']['deck_cards']['Row'];

interface GenerateLovablePromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deckTitle: string;
  cards: DeckCard[];
}

export const GenerateLovablePromptModal = ({
  open,
  onOpenChange,
  deckTitle,
  cards
}: GenerateLovablePromptModalProps) => {
  const { language } = useTranslation();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [prompt, setPrompt] = useState('');

  // Get Vision cards (slots 1-5)
  const visionCards = cards.filter(c => c.card_slot >= 1 && c.card_slot <= 5);
  // Get Build cards (slots 11-15)
  const buildCards = cards.filter(c => c.card_slot >= 11 && c.card_slot <= 15);

  const getCardData = useCallback((slot: number): Record<string, string> => {
    const card = cards.find(c => c.card_slot === slot);
    return (card?.card_data as Record<string, string>) || {};
  }, [cards]);

  const generatePrompt = useCallback(() => {
    // Vision data (using actual field names from cardDefinitions.ts)
    const v1 = getCardData(1); // Product
    const v2 = getCardData(2); // Problem
    const v3 = getCardData(3); // Audience
    const v4 = getCardData(4); // Value
    const v5 = getCardData(5); // Vision

    // Research data
    const r3 = getCardData(8); // User Insights

    // Build data
    const b1 = getCardData(11); // Features
    const b2 = getCardData(12); // User Path
    const b3 = getCardData(13); // Screens
    const b4 = getCardData(14); // Style
    const b5 = getCardData(15); // Summary

    const isRu = language === 'ru';

    // Determine app format
    const appFormat = b5.app_format || 'Mobile App (iOS + Android)';
    const isMobile = appFormat.toLowerCase().includes('mobile');
    const isWeb = appFormat.toLowerCase().includes('web');

    // Generate the prompt following ТЗ v4.0 structure
    const generatedPrompt = isRu ? `# ${b5.app_name || v1.product_name || deckTitle}

## Формат
${appFormat}

## Описание
${b5.app_description || v1.one_liner || `${v1.product_name} — это ${v1.analogy} для ${v1.target_audience}`}

## Аудитория
**Персона:** ${v3.demographics || 'Целевая аудитория'}
**Боль:** ${v2.pain_description || 'Основная проблема пользователей'}
**Цитаты юзеров:** ${r3.user_quotes || r3.user_needs || 'Потребности пользователей'}

## Фичи

### Базовые (MVP)
${b1.basic_features || '- Регистрация и авторизация\n- Сохранение данных\n- Профиль пользователя'}

### Ключевые (отличие)
${b1.key_features || '- Уникальная функциональность из V-04'}

### Монетизация
${b1.monetization_features || 'Freemium модель'}

### Возврат юзеров
${b1.engagement_features || 'Push-уведомления, прогресс'}

## Путь юзера

1. **Entry:** ${b2.step_1_entry || 'Пользователь открывает приложение'}
2. **Input:** ${b2.step_2_input || 'Пользователь вводит данные'}
3. **Magic:** ${b2.step_3_magic || 'Момент "вау" — ключевая ценность'}
4. **Value:** ${b2.step_4_value || 'Пользователь получает результат'}
5. **Return:** ${b2.step_5_return || 'Пользователь возвращается'}

## Экраны

### Онбординг
${b3.onboarding_screens || '1. Welcome\n2. How It Works\n3. Get Started'}

### Основные
${b3.main_screens || '- Главный экран\n- Экран ввода\n- Экран обработки'}

### Результат
${b3.result_screens || '- Экран результата\n- Детали'}

### Вспомогательные
${b3.profile_screens || '- Профиль\n- Настройки'}

## Стиль

**Тема:** ${b4.theme || 'Dark'}
**Настроение:** ${b4.mood || 'Premium'}
**Основной цвет:** ${b4.primary_color || 'Purple'}
**Акцент:** ${b4.accent_color || 'Gold'}
**Референсы:** ${b4.reference_apps || 'Современный минималистичный дизайн'}

${b4.style_reasoning ? `**Обоснование:** ${b4.style_reasoning}` : ''}

## Tech Stack
${b5.tech_stack || `**Core:**
- ${isMobile ? 'React Native (iOS + Android)' : 'Next.js + React'}
- TypeScript + Tailwind CSS
- Supabase (база данных + аутентификация)

**Интеграции:**
- Framer Motion (анимации)
- ${b1.monetization_features?.includes('подписк') ? 'Stripe / RevenueCat (платежи)' : ''}
- ${b1.engagement_features?.includes('Push') ? 'Firebase / OneSignal (push)' : ''}`}

## UX заметки
${b3.ux_notes || 'Минимальный интерфейс, фокус на скорости'}

## Tech Validation
${b1.tech_validation || 'Всё реализуемо в Lovable / React Native'}
`.trim() : `# ${b5.app_name || v1.product_name || deckTitle}

## Format
${appFormat}

## Description
${b5.app_description || v1.one_liner || `${v1.product_name} is ${v1.analogy} for ${v1.target_audience}`}

## Audience
**Persona:** ${v3.demographics || 'Target audience'}
**Pain:** ${v2.pain_description || 'Main user problem'}
**User Quotes:** ${r3.user_quotes || r3.user_needs || 'User needs'}

## Features

### Basic (MVP)
${b1.basic_features || '- Registration and auth\n- Data persistence\n- User profile'}

### Key (differentiation)
${b1.key_features || '- Unique functionality from V-04'}

### Monetization
${b1.monetization_features || 'Freemium model'}

### User Return
${b1.engagement_features || 'Push notifications, progress tracking'}

## User Path

1. **Entry:** ${b2.step_1_entry || 'User opens the app'}
2. **Input:** ${b2.step_2_input || 'User provides data'}
3. **Magic:** ${b2.step_3_magic || 'The "wow" moment — key value'}
4. **Value:** ${b2.step_4_value || 'User receives result'}
5. **Return:** ${b2.step_5_return || 'User comes back'}

## Screens

### Onboarding
${b3.onboarding_screens || '1. Welcome\n2. How It Works\n3. Get Started'}

### Main
${b3.main_screens || '- Home screen\n- Input screen\n- Processing screen'}

### Result
${b3.result_screens || '- Result screen\n- Details'}

### Supporting
${b3.profile_screens || '- Profile\n- Settings'}

## Style

**Theme:** ${b4.theme || 'Dark'}
**Mood:** ${b4.mood || 'Premium'}
**Primary Color:** ${b4.primary_color || 'Purple'}
**Accent:** ${b4.accent_color || 'Gold'}
**References:** ${b4.reference_apps || 'Modern minimalist design'}

${b4.style_reasoning ? `**Reasoning:** ${b4.style_reasoning}` : ''}

## Tech Stack
${b5.tech_stack || `**Core:**
- ${isMobile ? 'React Native (iOS + Android)' : 'Next.js + React'}
- TypeScript + Tailwind CSS
- Supabase (database + auth)

**Integrations:**
- Framer Motion (animations)
- ${b1.monetization_features?.toLowerCase().includes('subscription') ? 'Stripe / RevenueCat (payments)' : ''}
- ${b1.engagement_features?.toLowerCase().includes('push') ? 'Firebase / OneSignal (push)' : ''}`}

## UX Notes
${b3.ux_notes || 'Minimal interface, focus on speed'}

## Tech Validation
${b1.tech_validation || 'Everything buildable in Lovable / React Native'}
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
        ? 'Промт скопирован в буфер обмена' 
        : 'Prompt copied to clipboard',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([prompt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deckTitle.replace(/\s+/g, '-')}-lovable-prompt.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: language === 'ru' ? '📥 Скачано!' : '📥 Downloaded!',
      description: language === 'ru' 
        ? 'Файл с промтом сохранён' 
        : 'Prompt file saved',
    });
  };

  const openInLovable = () => {
    // Copy prompt first
    navigator.clipboard.writeText(prompt);
    // Open Lovable
    window.open('https://lovable.dev/projects/create', '_blank');
    toast({
      title: language === 'ru' ? '🚀 Промт скопирован!' : '🚀 Prompt copied!',
      description: language === 'ru' 
        ? 'Вставьте его в новый проект Lovable' 
        : 'Paste it in a new Lovable project',
    });
  };

  const buildProgress = buildCards.filter(c => 
    c.card_data && Object.keys(c.card_data as object).length > 0
  ).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl">
                {language === 'ru' ? 'Lovable Промт' : 'Lovable Prompt'}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  <FileText className="w-3 h-3 mr-1" />
                  {language === 'ru' ? 'Готов к использованию' : 'Ready to use'}
                </Badge>
                <Badge 
                  variant={buildProgress === 5 ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  BUILD {buildProgress}/5
                </Badge>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-hidden flex flex-col gap-4">
          {/* Preview */}
          <ScrollArea className="flex-1 min-h-0 h-[50vh] border rounded-lg bg-muted/30">
            <div className="p-4">
              <pre className="text-sm whitespace-pre-wrap font-mono text-foreground/90">
                {prompt}
              </pre>
            </div>
          </ScrollArea>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 text-primary" />
              {language === 'ru' 
                ? 'Промт сгенерирован из Vision + BUILD карт' 
                : 'Prompt generated from Vision + BUILD cards'}
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                {language === 'ru' ? 'Скачать' : 'Download'}
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleCopy}>
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                    </motion.div>
                  )}
                </AnimatePresence>
                {copied 
                  ? (language === 'ru' ? 'Скопировано!' : 'Copied!') 
                  : (language === 'ru' ? 'Копировать' : 'Copy')}
              </Button>
              
              <Button onClick={openInLovable} className="gap-2 bg-gradient-to-r from-primary to-purple-600">
                <Rocket className="w-4 h-4" />
                {language === 'ru' ? 'Открыть в Lovable' : 'Open in Lovable'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
