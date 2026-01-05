import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Lightbulb, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import { type FormFieldConfig, type CardDefinition, getLocalizedText } from '@/data/cardDefinitions';
import { type FieldGuidance, getLocalizedGuidanceText } from '@/data/fieldHints';
import { AISuggestionPanel } from './AISuggestionPanel';
import { useTranslation } from '@/hooks/useTranslation';

interface WizardStepProps {
  field: FormFieldConfig;
  guidance: FieldGuidance;
  value: any;
  onChange: (value: any) => void;
  isComplete: boolean;
  cardType: string;
  cardDefinition: CardDefinition;
  previousAnswers: Record<string, any>;
  onAIAutoComplete?: () => void;
  isAIGenerating?: boolean;
}

export const WizardStep = ({
  field,
  guidance,
  value,
  onChange,
  isComplete,
  cardType,
  cardDefinition,
  previousAnswers,
  onAIAutoComplete,
  isAIGenerating = false
}: WizardStepProps) => {
  const isFilled = value !== undefined && value !== null && value !== '';
  const { t, language } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Question Title */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-2xl font-bold text-foreground flex-1">
            {getLocalizedGuidanceText(guidance.questionTitle, language)}
          </h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* AI Auto-Complete Button */}
            {onAIAutoComplete && (
              <Button
                onClick={onAIAutoComplete}
                disabled={isAIGenerating}
                size="sm"
                className="gap-1.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/20 border border-violet-400/30"
              >
                {isAIGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>AI</span>
                <span className="text-xs opacity-80">10🍄</span>
              </Button>
            )}
            {isComplete && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 text-secondary"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-medium">{t('wizard.complete')}</span>
              </motion.div>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {getLocalizedText(field.label, language)} {field.required && <span className="text-destructive">*</span>}
        </p>
      </div>

      {/* Input Field */}
      <div className="space-y-3">
        {field.type === 'text' && (
          <Textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={getLocalizedText(field.placeholder, language)}
            rows={3}
            className={`text-lg transition-all resize-none ${
              !isFilled && field.required 
                ? 'border-primary/60 shadow-[0_0_15px_hsl(var(--primary)/0.3)] animate-pulse' 
                : ''
            }`}
          />
        )}
        {field.type === 'textarea' && (
          <Textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={getLocalizedText(field.placeholder, language)}
            className={`min-h-[150px] text-base transition-all ${
              !isFilled && field.required 
                ? 'border-primary/60 shadow-[0_0_15px_hsl(var(--primary)/0.3)] animate-pulse' 
                : ''
            }`}
          />
        )}
        {field.type === 'select' && field.options && (
          <Select value={value || ''} onValueChange={onChange}>
            <SelectTrigger className={`h-12 text-lg transition-all ${
              !isFilled && field.required 
                ? 'border-primary/60 shadow-[0_0_15px_hsl(var(--primary)/0.3)] animate-pulse' 
                : ''
            }`}>
              <SelectValue placeholder={t('wizard.selectOption')} />
            </SelectTrigger>
            <SelectContent>
              {field.options.map(option => (
                <SelectItem key={typeof option === 'string' ? option : option.en} value={typeof option === 'string' ? option : option.en}>
                  {getLocalizedText(option, language)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* AI Suggestions */}
        {(field.type === 'text' || field.type === 'textarea') && (
          <AISuggestionPanel
            cardType={cardType}
            currentField={field.name}
            previousAnswers={previousAnswers}
            cardDefinition={cardDefinition}
            onSelectSuggestion={onChange}
          />
        )}
      </div>

      {/* Guidance Cards Grid - 3 columns */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-3"
      >
        {/* Hints Card */}
        <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl h-full">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Lightbulb className="w-4 h-4" />
            <span className="font-semibold text-xs uppercase">{t('wizard.hints')}</span>
          </div>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            {guidance.hints.slice(0, 3).map((hint, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-primary mt-0.5 flex-shrink-0">•</span>
                <span className="line-clamp-2">{getLocalizedGuidanceText(hint, language)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Example Card */}
        <div className="p-3 bg-secondary/10 border border-secondary/20 rounded-xl h-full">
          <div className="text-xs font-bold text-secondary mb-2">📝 {t('wizard.example')}</div>
          <div className="text-xs text-foreground italic line-clamp-4">
            "{getLocalizedGuidanceText(guidance.example, language)}"
          </div>
        </div>

        {/* Validation Tip Card - Always visible, highlighted when filled */}
        <div className={`p-3 rounded-xl h-full transition-all duration-300 ${
          isFilled 
            ? 'bg-accent/10 border border-accent/30' 
            : 'bg-muted/5 border border-muted/20 opacity-60'
        }`}>
          <div className="text-xs font-bold mb-2">
            {isFilled ? '✨' : '💭'} {t('wizard.goodAnswer')}
          </div>
          <div className="text-xs text-muted-foreground line-clamp-4">
            {getLocalizedGuidanceText(guidance.validationTip, language)}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};