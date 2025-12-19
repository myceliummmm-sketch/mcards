import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (open) {
      generatePrompt();
    }
  }, [open, cards]);

  const getCardData = (slot: number) => {
    const card = cards.find(c => c.card_slot === slot);
    return card?.card_data as Record<string, any> || {};
  };

  const generatePrompt = () => {
    // Vision data
    const v1 = getCardData(1); // Product
    const v2 = getCardData(2); // Problem
    const v3 = getCardData(3); // Audience
    const v4 = getCardData(4); // Value
    const v5 = getCardData(5); // Vision

    // Build data
    const b1 = getCardData(11); // Features
    const b2 = getCardData(12); // User Path
    const b3 = getCardData(13); // Screens
    const b4 = getCardData(14); // Style
    const b5 = getCardData(15); // Summary

    const isRu = language === 'ru';

    // Extract features list
    const features = b1.features || b1.selectedFeatures || [];
    const featuresText = Array.isArray(features) 
      ? features.map((f: any) => `- ${typeof f === 'string' ? f : f.name || f.title}`).join('\n')
      : '';

    // Extract screens
    const screens = b3.screens || [];
    const screensText = Array.isArray(screens)
      ? screens.map((s: any, i: number) => 
          `${i + 1}. ${typeof s === 'string' ? s : s.name || s.title}\n   ${s.description || s.elements?.join(', ') || ''}`
        ).join('\n')
      : '';

    // Extract user path
    const userPath = b2.steps || b2.path || [];
    const pathText = Array.isArray(userPath)
      ? userPath.map((p: any) => typeof p === 'string' ? p : p.name || p.step).join(' → ')
      : '';

    // Extract style
    const theme = b4.theme || b4.colorScheme || 'dark';
    const mood = b4.mood || b4.style || 'premium';
    const reference = b4.reference || b4.inspiration || '';
    const colors = b4.colors || {};

    // Generate the prompt
    const generatedPrompt = isRu ? `
Создай веб-приложение "${v1.productName || v1.name || deckTitle}".

## СУТЬ
${v2.problem || v2.painPoint || 'Решает проблему пользователей'} для ${v3.targetAudience || v3.audience || 'целевой аудитории'}.

## УНИКАЛЬНОСТЬ
${v4.uniqueValue || v4.valueProposition || 'Уникальное ценностное предложение'}

## ФИЧИ
${featuresText || '- Регистрация и авторизация\n- Основной функционал\n- Профиль пользователя'}

## ЭКРАНЫ
${screensText || '1. Онбординг\n2. Главный экран\n3. Профиль'}

## ПУТЬ ПОЛЬЗОВАТЕЛЯ
${pathText || 'Вход → Онбординг → Основной функционал → Результат'}

## СТИЛЬ
- Тема: ${theme === 'dark' ? 'Тёмная' : theme === 'light' ? 'Светлая' : theme}
- Настроение: ${mood}
- Референс: ${reference || 'Современный минимализм'}
- Основной цвет: ${colors.primary || 'Фиолетовый'}
- Акцент: ${colors.accent || 'Золотой'}

## ТЕХНИЧЕСКИЕ ТРЕБОВАНИЯ
- React + TypeScript + Tailwind CSS
- Supabase для базы данных и аутентификации
- Адаптивный дизайн (mobile-first)
- Анимации с Framer Motion

## ВИДЕНИЕ ПРОДУКТА
${v5.vision || v5.futureVision || 'Масштабируемое решение с потенциалом роста'}
`.trim() : `
Create a web application "${v1.productName || v1.name || deckTitle}".

## ESSENCE
${v2.problem || v2.painPoint || 'Solves user problems'} for ${v3.targetAudience || v3.audience || 'target audience'}.

## UNIQUENESS
${v4.uniqueValue || v4.valueProposition || 'Unique value proposition'}

## FEATURES
${featuresText || '- Registration and authentication\n- Core functionality\n- User profile'}

## SCREENS
${screensText || '1. Onboarding\n2. Main screen\n3. Profile'}

## USER PATH
${pathText || 'Entry → Onboarding → Core functionality → Result'}

## STYLE
- Theme: ${theme}
- Mood: ${mood}
- Reference: ${reference || 'Modern minimalism'}
- Primary color: ${colors.primary || 'Purple'}
- Accent: ${colors.accent || 'Gold'}

## TECHNICAL REQUIREMENTS
- React + TypeScript + Tailwind CSS
- Supabase for database and authentication
- Responsive design (mobile-first)
- Animations with Framer Motion

## PRODUCT VISION
${v5.vision || v5.futureVision || 'Scalable solution with growth potential'}
`.trim();

    setPrompt(generatedPrompt);
  };

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

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Preview */}
          <ScrollArea className="flex-1 border rounded-lg bg-muted/30">
            <pre className="p-4 text-sm whitespace-pre-wrap font-mono text-foreground/90">
              {prompt}
            </pre>
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
