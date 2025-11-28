import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lightbulb, CheckCircle2 } from 'lucide-react';
import type { FormFieldConfig, CardDefinition } from '@/data/cardDefinitions';
import type { FieldGuidance } from '@/data/fieldHints';
import { AISuggestionPanel } from './AISuggestionPanel';

interface WizardStepProps {
  field: FormFieldConfig;
  guidance: FieldGuidance;
  value: any;
  onChange: (value: any) => void;
  isComplete: boolean;
  cardType: string;
  cardDefinition: CardDefinition;
  previousAnswers: Record<string, any>;
}

export const WizardStep = ({ 
  field, 
  guidance, 
  value, 
  onChange, 
  isComplete,
  cardType,
  cardDefinition,
  previousAnswers 
}: WizardStepProps) => {
  const isFilled = value !== undefined && value !== null && value !== '';

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
        <div className="flex items-start justify-between">
          <h3 className="text-2xl font-bold text-foreground">
            {guidance.questionTitle}
          </h3>
          {isComplete && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2 text-secondary"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">Complete</span>
            </motion.div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {field.label} {field.required && <span className="text-destructive">*</span>}
        </p>
      </div>

      {/* Input Field */}
      <div className="space-y-3">
        {field.type === 'text' && (
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className="text-lg h-12"
          />
        )}
        {field.type === 'textarea' && (
          <Textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className="min-h-[150px] text-base"
          />
        )}
        {field.type === 'select' && field.options && (
          <Select value={value || ''} onValueChange={onChange}>
            <SelectTrigger className="h-12 text-lg">
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              {field.options.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
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

      {/* Hints Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-3"
      >
        <div className="flex items-center gap-2 text-primary">
          <Lightbulb className="w-5 h-5" />
          <span className="font-semibold text-sm">HINTS</span>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {guidance.hints.map((hint, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>{hint}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Example Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-4 bg-secondary/10 border border-secondary/20 rounded-lg"
      >
        <div className="text-xs font-bold text-secondary mb-2">EXAMPLE</div>
        <div className="text-sm text-foreground italic">"{guidance.example}"</div>
      </motion.div>

      {/* Validation Tip */}
      {isFilled && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 bg-accent/10 border border-accent/20 rounded-lg"
        >
          <div className="text-xs font-bold text-accent mb-1">✨ WHAT MAKES A GOOD ANSWER</div>
          <div className="text-sm text-muted-foreground">{guidance.validationTip}</div>
        </motion.div>
      )}
    </motion.div>
  );
};