import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Sparkles, Zap, Wand2, MessageSquare } from 'lucide-react';
import { AIHelperHint } from './AIHelperHint';
import { DynamicFormField } from './DynamicFormField';
import { EvaluationMatrix } from './EvaluationMatrix';
import { CardReveal } from './CardReveal';
import { triggerForgeConfetti } from './ForgeConfetti';
import { CardCraftingWizard } from './crafting/CardCraftingWizard';
import { CardComments } from './review/CardComments';
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
  cardId?: string;
  onSave: (data: any, imageUrl?: string, evaluation?: any) => Promise<void>;
}

export const CardEditor = ({ isOpen, onClose, definition, initialData, cardImageUrl, evaluation, cardId, onSave }: CardEditorProps) => {
  const [formData, setFormData] = useState<any>(initialData || {});
  const [isSaving, setIsSaving] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(cardImageUrl);
  const [currentEvaluation, setCurrentEvaluation] = useState(evaluation);
  const [forgingStage, setForgingStage] = useState<'idle' | 'forging' | 'revealing' | 'complete'>('idle');
  const [loadingStage, setLoadingStage] = useState<'idle' | 'channeling' | 'summoning' | 'evaluating'>('idle');
  const [wizardMode, setWizardMode] = useState(true); // Default to wizard mode for new cards
  const { toast } = useToast();

  // Update form data when initialData changes
  useEffect(() => {
    setFormData(initialData || {});
    setCurrentImageUrl(cardImageUrl);
    setCurrentEvaluation(evaluation);
    // If card already has data, default to quick edit mode
    const hasExistingData = initialData && Object.keys(initialData).length > 0;
    setWizardMode(!hasExistingData);
  }, [initialData, cardImageUrl, evaluation]);

  // Auto-save debounced
  useEffect(() => {
    if (!formData || Object.keys(formData).length === 0) return;
    if (forgingStage !== 'idle') return; // Skip auto-save during forge

    const timer = setTimeout(() => {
      handleSave(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData, forgingStage]);

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSave = async (silent = false, autoMagic = false) => {
    setIsSaving(true);
    try {
      let finalImageUrl = currentImageUrl;
      let finalEvaluation = currentEvaluation;

      // If this is a "Forge Card" click (autoMagic=true), do the full magical flow
      if (autoMagic && requiredFieldsFilled) {
        setForgingStage('forging');
        
        // Step 1: Generate image if not present
        if (!currentImageUrl) {
          setLoadingStage('channeling');
          toast({
            title: '✨ Channeling creative energy...',
            description: 'Crafting your card\'s visual identity.',
          });
          
          const contentSummary = Object.values(formData)
            .filter(v => v && typeof v === 'string')
            .slice(0, 3)
            .join('. ')
            .substring(0, 200);

          setLoadingStage('summoning');
          const { data: imageData, error: imageError } = await supabase.functions.invoke('generate-card-image', {
            body: { 
              cardType: definition.title, 
              cardContent: contentSummary,
              phase: definition.phase 
            }
          });

          if (!imageError && imageData?.imageUrl) {
            finalImageUrl = imageData.imageUrl;
            setCurrentImageUrl(imageData.imageUrl);
          }
        }

        // Step 2: Generate evaluation if not present
        if (!currentEvaluation) {
          setLoadingStage('evaluating');
          toast({
            title: '🔮 The team is reviewing...',
            description: 'Evaluating your card\'s potential.',
          });

          const { data: evalData, error: evalError } = await supabase.functions.invoke('evaluate-card', {
            body: {
              cardType: definition.title,
              cardContent: formData,
              cardDefinition: {
                coreQuestion: definition.coreQuestion,
                formula: definition.formula
              }
            }
          });

          if (evalError) {
            console.error('Evaluation error:', evalError);
            toast({
              title: '⚠️ Evaluation unavailable',
              description: 'Card forged but team evaluation couldn\'t be generated.',
              variant: 'destructive'
            });
          } else if (evalData?.evaluation) {
            finalEvaluation = evalData.evaluation;
            setCurrentEvaluation(evalData.evaluation);
          }
        }

        // Trigger reveal animation
        setForgingStage('revealing');
        
        // Wait for flip animation to complete, then trigger confetti
        setTimeout(() => {
          triggerForgeConfetti();
          setForgingStage('complete');
          
          toast({
            title: '✨ Card forged successfully!',
            description: finalEvaluation 
              ? `Overall score: ${finalEvaluation.overall}/10` 
              : 'Your card has been crafted.',
          });
        }, 1200);
      }

      // Save everything together
      await onSave(formData, finalImageUrl, finalEvaluation);
      
      if (!silent && !autoMagic) {
        toast({
          title: '✨ Card saved',
          description: 'Your changes have been saved.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error forging card',
        description: 'There was an error saving your changes. Please try again.',
        variant: 'destructive',
      });
      setForgingStage('idle');
      setLoadingStage('idle');
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
        <SheetHeader className="px-6 py-4 border-b border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
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
                variant="ghost"
                size="sm"
                onClick={() => setWizardMode(!wizardMode)}
                className="gap-2"
              >
                <Wand2 className="w-4 h-4" />
                {wizardMode ? 'Quick Edit' : 'Wizard Mode'}
              </Button>
            </div>
            {!wizardMode && (
              <Button
                size="sm"
                onClick={() => handleSave(false, true)}
                disabled={isSaving || !requiredFieldsFilled}
                className="gap-2 bg-primary/90 hover:bg-primary shadow-lg shadow-primary/20"
              >
                {isSaving ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    Forging magic...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Forge Card
                  </>
                )}
              </Button>
            )}
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
          <Tabs defaultValue="edit" className="w-full">
            <div className="px-6 pt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="edit">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Edit Card
                </TabsTrigger>
                <TabsTrigger value="reviews">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Reviews
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="edit" className="px-6 py-6 space-y-6">
              {wizardMode ? (
                /* Wizard Mode */
                <CardCraftingWizard
                  definition={definition}
                  initialData={formData}
                  onChange={setFormData}
                  onForge={() => handleSave(false, true)}
                  isForging={isSaving}
                />
              ) : (
                /* Quick Edit Mode */
                <>
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

            {/* Magical Card Reveal or Preview */}
            {forgingStage !== 'idle' ? (
              <CardReveal
                isRevealing={forgingStage === 'revealing' || forgingStage === 'complete'}
                imageUrl={currentImageUrl}
                evaluation={currentEvaluation}
                loadingStage={loadingStage}
              />
            ) : currentImageUrl ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden rounded-lg border border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5"
              >
                <img 
                  src={currentImageUrl} 
                  alt="Card artwork"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <div className="absolute bottom-3 left-3 text-xs font-bold text-primary">
                  ✨ CARD VISUAL
                </div>
              </motion.div>
            ) : null}

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
              </>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="px-6 py-6">
              {cardId ? (
                <CardComments cardId={cardId} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Save this card first to enable comments and reviews
                </div>
              )}
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
