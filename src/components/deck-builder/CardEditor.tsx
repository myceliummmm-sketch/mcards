import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Save, Sparkles } from 'lucide-react';
import { AIHelperHint } from './AIHelperHint';
import { DynamicFormField } from './DynamicFormField';
import type { CardDefinition } from '@/data/cardDefinitions';
import { useToast } from '@/hooks/use-toast';

interface CardEditorProps {
  isOpen: boolean;
  onClose: () => void;
  definition: CardDefinition;
  initialData?: any;
  onSave: (data: any) => Promise<void>;
}

export const CardEditor = ({ isOpen, onClose, definition, initialData, onSave }: CardEditorProps) => {
  const [formData, setFormData] = useState<any>(initialData || {});
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Update form data when initialData changes
  useEffect(() => {
    setFormData(initialData || {});
  }, [initialData]);

  // Auto-save debounced
  useEffect(() => {
    if (!formData || Object.keys(formData).length === 0) return;

    const timer = setTimeout(() => {
      handleSave(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData]);

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSave = async (silent = false) => {
    setIsSaving(true);
    try {
      await onSave(formData);
      if (!silent) {
        toast({
          title: 'Card saved',
          description: 'Your changes have been saved successfully.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error saving card',
        description: 'There was an error saving your changes. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const requiredFieldsFilled = definition.fields
    .filter(f => f.required)
    .every(f => {
      const value = formData[f.name];
      return value !== undefined && value !== null && value !== '';
    });

  const primaryHelper = definition.aiHelpers[0];
  const secondaryHelper = definition.aiHelpers[1] || definition.aiHelpers[0];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0">
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b border-border bg-card/95 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Deck
            </Button>
            <Button
              size="sm"
              onClick={() => handleSave(false)}
              disabled={isSaving || !requiredFieldsFilled}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              Save
            </Button>
          </div>
          
          <SheetTitle className="text-left mt-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-display">
                CARD #{definition.slot}: {definition.title}
              </span>
              {definition.cardType === 'insight' ? (
                <span className="text-sm bg-status-insight/20 text-status-insight px-2 py-1 rounded">
                  🔷 INSIGHT
                </span>
              ) : (
                <span className="text-sm bg-muted text-muted-foreground px-2 py-1 rounded">
                  🔲 TEMPLATE
                </span>
              )}
            </div>
            <div className="text-sm text-muted-foreground mt-2 font-normal">
              {definition.coreQuestion}
            </div>
          </SheetTitle>
        </SheetHeader>

        {/* Content */}
        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="px-6 py-6 space-y-6">
            {/* Formula & Example */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-primary/5 border border-primary/20 rounded-lg"
            >
              <div className="text-xs font-bold text-primary mb-1">FORMULA</div>
              <div className="text-sm text-foreground font-mono">{definition.formula}</div>
              {definition.example && (
                <>
                  <div className="text-xs font-bold text-secondary mt-3 mb-1">EXAMPLE</div>
                  <div className="text-sm text-muted-foreground italic">{definition.example}</div>
                </>
              )}
            </motion.div>

            {/* Primary AI Helper Hint */}
            <AIHelperHint characterId={primaryHelper} type="encouraging" />

            {/* Form Fields */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              {definition.fields.map((field, index) => (
                <motion.div
                  key={field.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <DynamicFormField
                    field={field}
                    value={formData[field.name]}
                    onChange={(value) => handleFieldChange(field.name, value)}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Secondary AI Helper Hint (Challenging) */}
            {secondaryHelper && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="border-t border-border pt-6 mt-6">
                  <AIHelperHint characterId={secondaryHelper} type="challenging" />
                </div>
              </motion.div>
            )}

            {/* Marketplace CTA (Future) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                variant="outline"
                className="w-full gap-2"
                disabled
              >
                <Sparkles className="w-4 h-4" />
                Find similar insights in Marketplace
                <span className="text-xs text-muted-foreground ml-2">(Coming soon)</span>
              </Button>
            </motion.div>

            {/* Validation Status */}
            {!requiredFieldsFilled && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                Please fill in all required fields (marked with *)
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
