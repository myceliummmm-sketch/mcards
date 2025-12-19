import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { FormFieldConfig, LocalizedString } from '@/data/cardDefinitions';
import { getLocalizedText } from '@/data/cardDefinitions';
import { useLanguage } from '@/contexts/LanguageContext';

interface DynamicFormFieldProps {
  field: FormFieldConfig;
  value: any;
  onChange: (value: any) => void;
}

export const DynamicFormField = ({ field, value, onChange }: DynamicFormFieldProps) => {
  const { language } = useLanguage();
  const isFieldFilled = value !== undefined && value !== null && value !== '';
  const showGlow = !isFieldFilled && field.required;

  const label = getLocalizedText(field.label, language);
  const placeholder = field.placeholder ? getLocalizedText(field.placeholder, language) : '';

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground">
        {label}
        {field.required && <span className="text-destructive ml-1">*</span>}
        {isFieldFilled && !field.required && (
          <span className="ml-2 text-xs text-status-complete">✓</span>
        )}
      </Label>
      
      {field.type === 'text' && (
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`bg-background border-border focus:border-primary transition-all ${
            showGlow ? 'border-primary/60 shadow-[0_0_12px_hsl(var(--primary)/0.25)] animate-pulse' : ''
          }`}
        />
      )}

      {field.type === 'textarea' && (
        <Textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className={`bg-background border-border focus:border-primary resize-none transition-all ${
            showGlow ? 'border-primary/60 shadow-[0_0_12px_hsl(var(--primary)/0.25)] animate-pulse' : ''
          }`}
        />
      )}

      {field.type === 'select' && field.options && (
        <Select value={value || ''} onValueChange={onChange}>
          <SelectTrigger className={`bg-background border-border transition-all ${
            showGlow ? 'border-primary/60 shadow-[0_0_12px_hsl(var(--primary)/0.25)] animate-pulse' : ''
          }`}>
            <SelectValue placeholder={placeholder || (language === 'ru' ? 'Выберите опцию' : 'Select an option')} />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((option, idx) => {
              const optionValue = typeof option === 'string' ? option : getLocalizedText(option as LocalizedString, language);
              return (
                <SelectItem key={idx} value={optionValue}>
                  {optionValue}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};
