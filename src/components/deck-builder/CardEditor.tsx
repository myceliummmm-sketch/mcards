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
import { ForgeRevealOverlay } from './ForgeRevealOverlay';
import type { CardDefinition } from '@/data/cardDefinitions';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

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
  const [wizardMode, setWizardMode] = useState(true);
  const { toast } = useToast();
  const { t, language } = useTranslation();

  useEffect(() => {
    setFormData(initialData || {});
    setCurrentImageUrl(cardImageUrl);
    setCurrentEvaluation(evaluation);
    const hasExistingData = initialData && Object.keys(initialData).length > 0;
    setWizardMode(!hasExistingData);
  }, [initialData, cardImageUrl, evaluation]);

  useEffect(() => {
    if (!formData || Object.keys(formData).length === 0) return;
    if (forgingStage !== 'idle') return;

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

  const handleSave = async (silent = false, autoMagic = false, formDataOverride?: Record<string, any>) => {
    const dataToUse = formDataOverride || formData;
    
    const requiredFieldsFilledNow = definition.fields
      .filter(f => f.required)
      .every(f => {
        const value = dataToUse[f.name];
        return value !== undefined && value !== null && value !== '';
      });
    
    setIsSaving(true);
    try {
      let finalImageUrl = currentImageUrl;
      let finalEvaluation = currentEvaluation;

      if (autoMagic && requiredFieldsFilledNow) {
        setForgingStage('forging');
        let hasErrors = false;
        
        if (!currentImageUrl) {
          try {
            setLoadingStage('channeling');
            toast({
              title: `✨ ${t('cardEditor.channeling')}`,
              description: t('cardEditor.channelingDesc'),
            });

            setLoadingStage('summoning');
            const { data: imageData, error: imageError } = await supabase.functions.invoke('generate-card-image', {
              body: { 
                cardSlot: definition.slot,
                cardContent: dataToUse
              }
            });

            if (imageError) {
              console.error('Image generation error:', imageError);
              toast({
                title: `⚠️ ${t('cardEditor.imageGenFailed')}`,
                description: t('cardEditor.imageGenFailedDesc'),
                variant: 'destructive'
              });
              hasErrors = true;
            } else if (imageData?.imageUrl) {
              finalImageUrl = imageData.imageUrl;
              setCurrentImageUrl(imageData.imageUrl);
            }
          } catch (err) {
            console.error('Image generation exception:', err);
            hasErrors = true;
          }
        }

        if (!currentEvaluation) {
          try {
            setLoadingStage('evaluating');
            toast({
              title: `🔮 ${t('cardEditor.evaluating')}`,
              description: t('cardEditor.evaluatingDesc'),
            });

            const { data: evalData, error: evalError } = await supabase.functions.invoke('evaluate-card', {
              body: {
                cardType: definition.title,
                cardContent: dataToUse,
                cardDefinition: {
                  coreQuestion: definition.coreQuestion,
                  formula: definition.formula
                }
              }
            });

            if (evalError) {
              console.error('Evaluation error:', evalError);
              toast({
                title: `⚠️ ${t('cardEditor.evalUnavailable')}`,
                description: t('cardEditor.evalUnavailableDesc'),
                variant: 'destructive'
              });
              hasErrors = true;
            } else if (evalData?.evaluation) {
              finalEvaluation = evalData.evaluation;
              setCurrentEvaluation(evalData.evaluation);
            }
          } catch (err) {
            console.error('Evaluation exception:', err);
            hasErrors = true;
          }
        }

        setForgingStage('revealing');
        
        setTimeout(() => {
          if (!hasErrors) {
            triggerForgeConfetti();
          }
          setForgingStage('complete');
          
          toast({
            title: hasErrors ? `⚠️ ${t('cardEditor.cardForgedWithIssues')}` : `✨ ${t('cardEditor.cardForged')}`,
            description: finalEvaluation 
              ? `${t('cardEditor.overallScore')}: ${finalEvaluation.overall}/10` 
              : hasErrors 
                ? t('cardEditor.errorSaving')
                : t('cardEditor.changesSaved'),
          });
        }, 1200);
      }

      await onSave(dataToUse, finalImageUrl, finalEvaluation);
      
      if (!silent && !autoMagic) {
        toast({
          title: `✨ ${t('cardEditor.cardSaved')}`,
          description: t('cardEditor.changesSaved'),
        });
      }
    } catch (error) {
      toast({
        title: t('cardEditor.errorForging'),
        description: t('cardEditor.errorSaving'),
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
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-3xl p-0">
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
                {t('cardEditor.returnToDeck')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setWizardMode(!wizardMode)}
                className="gap-2"
              >
                <Wand2 className="w-4 h-4" />
                {wizardMode ? t('cardEditor.quickEdit') : t('cardEditor.wizardMode')}
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
                    {t('cardEditor.forgingMagic')}
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    {t('cardEditor.forgeCard')}
                  </>
                )}
              </Button>
            )}
          </div>
          
          <SheetTitle className="text-left mt-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
              <span className="text-2xl font-display bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t('cardEditor.craftingCard')} #{definition.slot}: {definition.title}
              </span>
              {definition.cardType === 'insight' ? (
                <span className="text-sm bg-status-insight/20 text-status-insight px-2 py-1 rounded border border-status-insight/30">
                  🔷 {t('cardEditor.insight')}
                </span>
              ) : (
                <span className="text-sm bg-muted text-muted-foreground px-2 py-1 rounded border border-border">
                  🔲 {t('cardEditor.template')}
                </span>
              )}
            </div>
            <div className="text-sm text-muted-foreground mt-2 font-normal">
              {definition.coreQuestion}
            </div>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)]">
          <Tabs defaultValue="edit" className="w-full">
            <div className="px-6 pt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="edit">
                  <Sparkles className="w-4 h-4 mr-2" />
                  {t('cardEditor.editCard')}
                </TabsTrigger>
                <TabsTrigger value="reviews">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {t('cardEditor.reviews')}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="edit" className="px-6 py-6 space-y-6">
              {initialData && Object.keys(initialData).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-2 gap-3 p-4 bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⭐</span>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase font-mono">{t('cardEditor.xpEarned')}</div>
                      <div className="text-sm font-bold text-foreground">
                        {(() => {
                          let xp = 10;
                          if (currentEvaluation?.overall) xp += Math.round(currentEvaluation.overall);
                          return `${xp}/20`;
                        })()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📊</span>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase font-mono">{t('cardEditor.score')}</div>
                      <div className="text-sm font-bold text-foreground">
                        {currentEvaluation?.overall ? `${currentEvaluation.overall.toFixed(1)}/10` : t('cardEditor.notEvaluated')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📅</span>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase font-mono">{t('cardEditor.updated')}</div>
                      <div className="text-sm font-bold text-foreground">
                        {initialData?.updated_at ? format(new Date(initialData.updated_at), 'MMM d, yyyy') : t('cardEditor.never')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {initialData?.completed === true ? '✅' : Object.keys(initialData).length > 0 ? '⏳' : '⭕'}
                    </span>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase font-mono">{t('cardEditor.status')}</div>
                      <div className="text-sm font-bold text-foreground">
                        {initialData?.completed === true ? t('cardEditor.complete') : Object.keys(initialData).length > 0 ? t('cardEditor.inProgress') : t('cardEditor.empty')}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              {wizardMode ? (
                <CardCraftingWizard
                  definition={definition}
                  initialData={formData}
                  onChange={setFormData}
                  onForge={(wizardFormData) => handleSave(false, true, wizardFormData)}
                  isForging={isSaving}
                />
              ) : (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-primary/5 border border-primary/20 rounded-lg"
                  >
                    <div className="text-xs font-bold text-primary mb-1">{t('cardEditor.formula')}</div>
                    <div className="text-sm text-foreground font-mono">{definition.formula}</div>
                    {definition.example && (
                      <>
                        <div className="text-xs font-bold text-secondary mt-3 mb-1">{t('cardEditor.example')}</div>
                        <div className="text-sm text-muted-foreground italic">{definition.example}</div>
                      </>
                    )}
                  </motion.div>

                  <AIHelperHint characterId={primaryHelper} type="encouraging" />

                  {forgingStage !== 'idle' ? (
                    <CardReveal
                      isRevealing={forgingStage === 'revealing' || forgingStage === 'complete'}
                      imageUrl={currentImageUrl}
                      evaluation={currentEvaluation}
                      loadingStage={loadingStage}
                      cardTitle={definition.title}
                      cardType={definition.cardType === 'insight' ? t('cardEditor.insight') : t('cardEditor.template')}
                      cardData={formData}
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
                        ✨ {t('cardEditor.cardVisual')}
                      </div>
                    </motion.div>
                  ) : null}

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

                  {currentEvaluation && (
                    <EvaluationMatrix evaluation={currentEvaluation} />
                  )}

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
                      {t('common.search')} {t('dashboard.marketplace')}
                      <span className="text-xs text-muted-foreground ml-2">(Coming soon)</span>
                    </Button>
                  </motion.div>

                  {!requiredFieldsFilled && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                      {language === 'ru' ? 'Заполните все обязательные поля (отмечены *)' : 'Please fill in all required fields (marked with *)'}
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
                  {language === 'ru' ? 'Сначала сохраните карту, чтобы включить комментарии' : 'Save this card first to enable comments and reviews'}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </ScrollArea>

        <ForgeRevealOverlay
          isActive={forgingStage !== 'idle'}
          forgingStage={forgingStage}
          loadingStage={loadingStage}
          imageUrl={currentImageUrl}
          evaluation={currentEvaluation}
          cardTitle={definition.title}
          cardType={definition.cardType === 'insight' ? t('cardEditor.insight') : t('cardEditor.template')}
          cardData={formData}
          slot={definition.slot}
          onDismiss={() => {
            setForgingStage('idle');
            setLoadingStage('idle');
          }}
        />
      </SheetContent>
    </Sheet>
  );
};