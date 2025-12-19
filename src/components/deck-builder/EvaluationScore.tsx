import { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getCharacterById } from '@/data/teamCharacters';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

interface EvaluationScoreProps {
  criterion: string;
  score: number;
  explanation: string;
  evaluator: string;
}

const criterionTranslations: Record<string, { en: string; ru: string }> = {
  depth: { en: 'Depth', ru: 'Глубина' },
  relevance: { en: 'Relevance', ru: 'Релевантность' },
  credibility: { en: 'Credibility', ru: 'Достоверность' },
  actionability: { en: 'Actionability', ru: 'Применимость' },
  impact: { en: 'Impact', ru: 'Влияние' },
  clarity: { en: 'Clarity', ru: 'Ясность' },
  positioning: { en: 'Positioning', ru: 'Позиционирование' },
  market_fit: { en: 'Market Fit', ru: 'Соответствие рынку' },
  messaging: { en: 'Messaging', ru: 'Месседж' },
  uniqueness: { en: 'Uniqueness', ru: 'Уникальность' },
  feasibility: { en: 'Feasibility', ru: 'Реализуемость' },
  scalability: { en: 'Scalability', ru: 'Масштабируемость' },
};

// Check if text is primarily English
const isEnglishText = (text: string | undefined | null): boolean => {
  if (!text) return false;
  const englishWords = ['the', 'and', 'is', 'are', 'this', 'that', 'with', 'for', 'not', 'but', 'have', 'has', 'was', 'were', 'will', 'would', 'could', 'should', 'can', 'may', 'might'];
  const lowerText = text.toLowerCase();
  const matchCount = englishWords.filter(word => lowerText.includes(` ${word} `)).length;
  return matchCount >= 3;
};

// Translation cache to avoid repeated API calls
const translationCache: Record<string, string> = {};

export const EvaluationScore = ({ criterion, score, explanation, evaluator }: EvaluationScoreProps) => {
  const { language } = useLanguage();
  const safeExplanation = explanation || '';
  const [translatedExplanation, setTranslatedExplanation] = useState(safeExplanation);
  const [isTranslating, setIsTranslating] = useState(false);
  const character = getCharacterById(evaluator, language);
  
  useEffect(() => {
    const translateIfNeeded = async () => {
      // Only translate if language is Russian and text appears to be English
      if (language !== 'ru' || !isEnglishText(safeExplanation)) {
        setTranslatedExplanation(safeExplanation);
        return;
      }

      // Check cache first
      const cacheKey = `${safeExplanation.substring(0, 50)}`;
      if (translationCache[cacheKey]) {
        setTranslatedExplanation(translationCache[cacheKey]);
        return;
      }

      setIsTranslating(true);
      try {
        const { data, error } = await supabase.functions.invoke('translate-text', {
          body: { text: safeExplanation, targetLanguage: 'ru' }
        });

        if (!error && data?.translatedText) {
          translationCache[cacheKey] = data.translatedText;
          setTranslatedExplanation(data.translatedText);
        } else {
          setTranslatedExplanation(safeExplanation);
        }
      } catch (err) {
        console.error('Translation error:', err);
        setTranslatedExplanation(safeExplanation);
      } finally {
        setIsTranslating(false);
      }
    };

    translateIfNeeded();
  }, [safeExplanation, language]);

  if (!character) return null;

  // Calculate progress percentage and color
  const percentage = (score / 10) * 100;
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'hsl(180 70% 50%)';
    if (score >= 6) return 'hsl(140 50% 50%)';
    return 'hsl(0 0% 50%)';
  };

  const criterionLabel = criterionTranslations[criterion]?.[language] 
    || criterion.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8 border" style={{ borderColor: character.color }}>
            <AvatarImage src={character.avatar} alt={character.name} />
            <AvatarFallback style={{ backgroundColor: `${character.color}20`, color: character.color }}>
              {character.emoji}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold" style={{ color: character.color }}>
                {character.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {character.role}
              </span>
            </div>
            <span className="text-xs text-muted-foreground/70 truncate max-w-[200px]">
              {character.specialty}
            </span>
          </div>
        </div>
        <span
          className="text-lg font-bold font-mono"
          style={{ color: getScoreColor(score) }}
        >
          {score}/10
        </span>
      </div>
      
      <div className="mb-2 h-1.5 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full transition-all duration-500 ease-out"
          style={{ 
            width: `${percentage}%`,
            backgroundColor: getScoreColor(score)
          }}
        />
      </div>
      
      <p className={`text-sm text-muted-foreground italic ${isTranslating ? 'opacity-50' : ''}`}>
        "{translatedExplanation}"
        {isTranslating && <span className="ml-2 text-xs">⏳</span>}
      </p>
    </div>
  );
};
