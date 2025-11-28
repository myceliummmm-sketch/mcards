import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { FormFieldConfig } from '@/data/cardDefinitions';

interface DynamicFormFieldProps {
  field: FormFieldConfig;
  value: any;
  onChange: (value: any) => void;
}

export const DynamicFormField = ({ field, value, onChange }: DynamicFormFieldProps) => {
  const isFieldFilled = value !== undefined && value !== null && value !== '';

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground">
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
        {isFieldFilled && !field.required && (
          <span className="ml-2 text-xs text-status-complete">✓</span>
        )}
      </Label>
      
      {field.type === 'text' && (
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="bg-background border-border focus:border-primary"
        />
      )}

      {field.type === 'textarea' && (
        <Textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={4}
          className="bg-background border-border focus:border-primary resize-none"
        />
      )}

      {field.type === 'select' && field.options && (
        <Select value={value || ''} onValueChange={onChange}>
          <SelectTrigger className="bg-background border-border">
            <SelectValue placeholder={field.placeholder || 'Select an option'} />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};
