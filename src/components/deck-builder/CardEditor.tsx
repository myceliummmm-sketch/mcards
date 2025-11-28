import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Sparkles, Zap } from 'lucide-react';
import { AIHelperHint } from './AIHelperHint';
import { DynamicFormField } from './DynamicFormField';
import { CardImageGenerator } from './CardImageGenerator';
import { EvaluationMatrix } from './EvaluationMatrix';
import type { CardDefinition } from '@/data/cardDefinitions';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CardEditorProps {
  isOpen: boolean;
  onClose: () => void;
  definition: CardDefinition;
  initialData?: any;
  cardImageUrl?: string;
  evaluation?: any;
  onSave: (data: any, imageUrl?: string, evaluation?: any) => Promise<void>;
}

export const CardEditor = ({ isOpen, onClose, definition, initialData, cardImageUrl, evaluation, onSave }: CardEditorProps) => {
  const [formData, setFormData] = useState<any>(initialData || {});
  const [isSaving, setIsSaving] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(cardImageUrl);
  const [currentEvaluation, setCurrentEvaluation] = useState(evaluation);
  const { toast } = useToast();

  // Update form data when initialData changes
  useEffect(() => {
    setFormData(initialData || {});
    setCurrentImageUrl(cardImageUrl);
    setCurrentEvaluation(evaluation);
  }, [initialData, cardImageUrl, evaluation]);

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

  const handleSave = async (silent = false, skipEvaluation = false) => {
    setIsSaving(true);
    try {
      await onSave(formData, currentImageUrl, currentEvaluation);
      if (!silent) {
        toast({
          title: '✨ Card forged',
          description: 'Your card has been successfully crafted.',
        });
      }

      // Auto-evaluate if required fields are filled and evaluation doesn't exist
      if (!skipEvaluation && requiredFieldsFilled && !currentEvaluation) {
        await handleEvaluate();
      }
    } catch (error) {
      toast({
        title: 'Error forging card',
        description: 'There was an error saving your changes. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    try {
      const { data, error } = await supabase.functions.invoke('evaluate-card', {
        body: {
          cardType: definition.title,
          cardContent: formData,
          cardDefinition: {
            coreQuestion: definition.coreQuestion,
            formula: definition.formula
          }
        }
      });

      if (error) throw error;

      if (data?.evaluation) {
        setCurrentEvaluation(data.evaluation);
        await onSave(formData, currentImageUrl, data.evaluation);
        toast({
          title: '📊 Card evaluated',
          description: `Overall score: ${data.evaluation.overall}/10`,
        });
      }
    } catch (error) {
      console.error('Error evaluating card:', error);
      toast({
        title: 'Failed to evaluate',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleImageGenerated = async (imageUrl: string) => {
    setCurrentImageUrl(imageUrl);
    await onSave(formData, imageUrl, currentEvaluation);
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
        <SheetHeader className="px-6 py-4 border-b border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="gap-2 hover:bg-primary/10"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Deck
            </Button>
            <Button
              size="sm"
              onClick={() => handleSave(false, true)}
              disabled={isSaving || !requiredFieldsFilled}
              className="gap-2 bg-primary/90 hover:bg-primary shadow-lg shadow-primary/20"
            >
              <Zap className="w-4 h-4" />
              {isSaving ? 'Forging...' : 'Forge Card'}
            </Button>
          </div>
          
          <SheetTitle className="text-left mt-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
              <span className="text-2xl font-display bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                CRAFTING CARD #{definition.slot}: {definition.title}
              </span>
              {definition.cardType === 'insight' ? (
                <span className="text-sm bg-status-insight/20 text-status-insight px-2 py-1 rounded border border-status-insight/30">
                  🔷 INSIGHT
                </span>
              ) : (
                <span className="text-sm bg-muted text-muted-foreground px-2 py-1 rounded border border-border">
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

            {/* Card Image Generator */}
            <CardImageGenerator
              cardType={definition.title}
              cardContent={formData}
              phase={definition.phase}
              onImageGenerated={handleImageGenerated}
              currentImageUrl={currentImageUrl}
            />

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

            {/* Evaluation Matrix */}
            {currentEvaluation && (
              <EvaluationMatrix evaluation={currentEvaluation} />
            )}

            {/* Evaluate Button */}
            {requiredFieldsFilled && !currentEvaluation && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  onClick={handleEvaluate}
                  disabled={isEvaluating}
                  variant="outline"
                  className="w-full gap-2 bg-secondary/5 border-secondary/20 hover:bg-secondary/10"
                >
                  <Sparkles className="w-4 h-4" />
                  {isEvaluating ? 'Team is evaluating...' : 'Get Team Evaluation'}
                </Button>
              </motion.div>
            )}

            {/* Secondary AI Helper Hint (Challenging) */}
            {secondaryHelper && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
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
              transition={{ delay: 0.5 }}
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
