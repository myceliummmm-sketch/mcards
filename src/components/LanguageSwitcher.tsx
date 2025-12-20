import { Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Language } from '@/data/translations';

const languages: { code: Language; flag: string; name: string }[] = [
  { code: 'en', flag: '🇬🇧', name: 'English' },
  { code: 'ru', flag: '🇷🇺', name: 'Русский' },
  { code: 'es', flag: '🇪🇸', name: 'Español' },
];

interface LanguageSwitcherProps {
  variant?: 'default' | 'compact';
  className?: string;
}

export function LanguageSwitcher({ variant = 'default', className = '' }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();

  const currentLang = languages.find(l => l.code === language) || languages[0];

  if (variant === 'compact') {
    return (
      <Select value={language} onValueChange={(value: Language) => setLanguage(value)}>
        <SelectTrigger className={`w-auto gap-2 ${className}`}>
          <Globe className="h-4 w-4" />
          <span>{currentLang.flag}</span>
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <span className="flex items-center gap-2">
                {lang.flag} {lang.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Select value={language} onValueChange={(value: Language) => setLanguage(value)}>
      <SelectTrigger className={`w-full ${className}`}>
        <SelectValue>
          <span className="flex items-center gap-2">
            {currentLang.flag} {currentLang.name}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <span className="flex items-center gap-2">
              {lang.flag} {lang.name}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
