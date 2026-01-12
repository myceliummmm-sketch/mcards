import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Sparkles, Zap, Wand2, MessageSquare, Languages } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AIHelperHint } from './AIHelperHint';
import { DynamicFormField } from './DynamicFormField';
import { EvaluationMatrix } from './EvaluationMatrix';
import { CardReveal } from './CardReveal';
import { triggerForgeConfetti } from './ForgeConfetti';
import { CardCraftingWizard } from './crafting/CardCraftingWizard';
import { CardComments } from './review/CardComments';
import { ForgeRevealOverlay } from './ForgeRevealOverlay';
import { type CardDefinition, getLocalizedText } from '@/data/cardDefinitions';
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
  deckId?: string;
  onSave: (data: any, imageUrl?: string, evaluation?: any, silent?: boolean) => Promise<void>;
}

export const CardEditor = ({ isOpen, onClose, definition, initialData, cardImageUrl, evaluation, cardId, deckId, onSave }: CardEditorProps) => {
  const [formData, setFormData] = useState<any>(initialData || {});
  const [isSaving, setIsSaving] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(cardImageUrl);
  const [currentEvaluation, setCurrentEvaluation] = useState(evaluation);
  const [forgingStage, setForgingStage] = useState<'idle' | 'forging' | 'revealing' | 'complete'>('idle');
  const [loadingStage, setLoadingStage] = useState<'idle' | 'channeling' | 'summoning' | 'evaluating'>('idle');
  const [isTranslating, setIsTranslating] = useState(false);
  const [wizardMode, setWizardMode] = useState(true);
  const { toast } = useToast();
  const { t, language } = useTranslation();

  // === SAVE-ORIGIN TRACKING to prevent wizard reset on refetch ===
  // Stable card identifier to detect card switches vs refetches
  const editorKeyRef = useRef<string>('');
  const ignoreNextPropSyncRef = useRef(false);
  const lastLocalSaveRef = useRef<string>('');
  const wizardModeInitializedRef = useRef(false);
  
  // Generate stable key for this card editing session
  const currentEditorKey = `${deckId ?? 'no-deck'}:${definition.slot}`;

  // Sync image and evaluation when props change
  useEffect(() => {
    setCurrentImageUrl(cardImageUrl);
  }, [cardImageUrl]);

  useEffect(() => {
    setCurrentEvaluation(evaluation);
  }, [evaluation]);

  // Check if content appears to be in English
  const isContentEnglish = (): boolean => {
    const englishWords = ['the', 'and', 'is', 'are', 'this', 'that', 'with', 'for', 'they', 'their', 'have', 'has'];
    const allText = Object.values(formData).filter(v => typeof v === 'string').join(' ').toLowerCase();
    const matchCount = englishWords.filter(word => allText.includes(` ${word} `)).length;
    return matchCount >= 3;
  };

  // Translate all card content to Russian
  const handleTranslateCard = async () => {
    if (!formData || Object.keys(formData).length === 0) return;
    
    setIsTranslating(true);
    toast({
      title: '🌐 Перевод карточки...',
      description: 'AI переводит содержимое на русский',
    });

    try {
      const translatedData: Record<string, any> = { ...formData };
      const fieldsToTranslate = Object.entries(formData).filter(
        ([_, value]) => typeof value === 'string' && value.length > 20
      );

      for (const [fieldName, fieldValue] of fieldsToTranslate) {
        const { data, error } = await supabase.functions.invoke('translate-text', {
          body: { text: fieldValue as string, targetLanguage: 'ru' }
        });

        if (!error && data?.translatedText) {
          translatedData[fieldName] = data.translatedText;
        }
      }

      setFormData(translatedData);
      await onSave(translatedData, currentImageUrl, currentEvaluation, true);

      toast({
        title: '✅ Перевод завершён!',
        description: 'Карточка переведена на русский язык',
      });
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: 'Ошибка перевода',
        description: 'Не удалось перевести карточку',
        variant: 'destructive',
      });
    } finally {
      setIsTranslating(false);
    }
  };

  // === MAIN SYNC EFFECT: Handle card switch vs refetch of same card ===
  useEffect(() => {
    const isCardSwitch = editorKeyRef.current !== currentEditorKey;
    const initialDataStr = JSON.stringify(initialData || {});
    
    // Case 1: Card switched - do a full reset
    if (isCardSwitch) {
      editorKeyRef.current = currentEditorKey;
      setFormData(initialData || {});
      setCurrentImageUrl(cardImageUrl);
      setCurrentEvaluation(evaluation);
      
      // Only initialize wizardMode on card switch
      const hasExistingData = initialData && Object.keys(initialData).length > 0;
      setWizardMode(!hasExistingData);
      wizardModeInitializedRef.current = true;
      
      // Reset save tracking for new card
      ignoreNextPropSyncRef.current = false;
      lastLocalSaveRef.current = '';
      return;
    }
    
    // Case 2: Same card - check if we should ignore this update (our own save bounced back)
    if (ignoreNextPropSyncRef.current) {
      // Check if this is the data we just saved
      if (initialDataStr === lastLocalSaveRef.current) {
        ignoreNextPropSyncRef.current = false;
        // Just sync image/evaluation, keep formData untouched
        setCurrentImageUrl(cardImageUrl);
        setCurrentEvaluation(evaluation);
        return;
      }
    }
    
    // Case 3: Same card, external update - check if data is semantically same
    const currentFormDataStr = JSON.stringify(formData || {});
    if (initialDataStr === currentFormDataStr) {
      // Data is same, just sync image/evaluation
      setCurrentImageUrl(cardImageUrl);
      setCurrentEvaluation(evaluation);
      return;
    }
    
    // Case 4: Genuine external update - sync all (rare case, e.g., collaborator edit)
    setFormData(initialData || {});
    setCurrentImageUrl(cardImageUrl);
    setCurrentEvaluation(evaluation);
    // Don't touch wizardMode for same-card updates
  }, [initialData, cardImageUrl, evaluation, currentEditorKey]);

  // Auto-translate on open if language is Russian and content is English
  useEffect(() => {
    if (!isOpen || !initialData || Object.keys(initialData).length === 0) return;
    if (language !== 'ru' || isTranslating) return;
    
    // Check if content is in English
    const englishWords = ['the', 'and', 'is', 'are', 'this', 'that', 'with', 'for', 'they', 'their', 'have', 'has'];
    const allText = Object.values(initialData).filter(v => typeof v === 'string').join(' ').toLowerCase();
    const matchCount = englishWords.filter(word => allText.includes(` ${word} `)).length;
    const needsTranslation = matchCount >= 3;
    
    if (needsTranslation) {
      // Delay to avoid race conditions
      const timer = setTimeout(() => {
        handleTranslateCard();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, language, initialData]);

  // Removed auto-save effect - it was causing infinite loops and card data corruption
  // Cards are saved when user explicitly clicks "Forge" or when wizard calls onSave

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
                cardType: getLocalizedText(definition.title, language),
                cardContent: dataToUse,
                cardDefinition: {
                  coreQuestion: getLocalizedText(definition.coreQuestion, language),
                  formula: getLocalizedText(definition.formula, language)
                },
                language
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

      // === SET SAVE-ORIGIN TRACKING before calling onSave ===
      // This prevents the sync effect from resetting formData when the saved data bounces back
      lastLocalSaveRef.current = JSON.stringify(dataToUse);
      ignoreNextPropSyncRef.current = true;
      
      // Always pass silent=true since CardEditor handles its own toasts
      await onSave(dataToUse, finalImageUrl, finalEvaluation, true);
      
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
      <SheetContent side="right" className="w-full sm:w-1/2 sm:max-w-none p-0">
        <SheetHeader className="px-6 py-4 border-b border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5 backdrop-blur-sm">
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
          
          <SheetTitle className="text-left mt-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
              <span className="text-2xl font-display bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                #{definition.slot}: {getLocalizedText(definition.title, language)}
              </span>
            </div>
            <div className="text-sm text-muted-foreground mt-2 font-normal">
              {getLocalizedText(definition.coreQuestion, language)}
            </div>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)]">
          {/* Card Image at Top - Same as Research stage */}
          {currentImageUrl && forgingStage === 'idle' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-video overflow-hidden border-b border-primary/20"
            >
              <img 
                src={currentImageUrl} 
                alt="Card artwork"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 text-xs font-bold text-primary backdrop-blur-sm bg-background/50 px-2 py-1 rounded">
                ✨ {t('cardEditor.cardVisual')}
              </div>
            </motion.div>
          )}

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
              {/* Score Display - Only when evaluation exists */}
              {currentEvaluation?.overall && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-lg"
                >
                  <span className="text-3xl">📊</span>
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      {currentEvaluation.overall.toFixed(1)}/10
                    </div>
                    <div className="text-xs text-muted-foreground uppercase font-mono">{t('cardEditor.score')}</div>
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
                  deckId={deckId}
                  hasExistingCard={!!(currentImageUrl || currentEvaluation)}
                />
              ) : (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-primary/5 border border-primary/20 rounded-lg"
                  >
                    <div className="text-xs font-bold text-primary mb-1">{t('cardEditor.formula')}</div>
                    <div className="text-sm text-foreground font-mono">{getLocalizedText(definition.formula, language)}</div>
                    {definition.example && (
                      <>
                        <div className="text-xs font-bold text-secondary mt-3 mb-1">{t('cardEditor.example')}</div>
                        <div className="text-sm text-muted-foreground italic">{getLocalizedText(definition.example, language)}</div>
                      </>
                    )}
                  </motion.div>

                  <AIHelperHint characterId={primaryHelper} type="encouraging" />

                  {forgingStage !== 'idle' && (
                    <CardReveal
                      isRevealing={forgingStage === 'revealing' || forgingStage === 'complete'}
                      imageUrl={currentImageUrl}
                      evaluation={currentEvaluation}
                      loadingStage={loadingStage}
                      cardTitle={getLocalizedText(definition.title, language)}
                      cardType={definition.cardType === 'insight' ? t('cardEditor.insight') : t('cardEditor.template')}
                      cardData={formData}
                    />
                  )}

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
                    <div className="mt-8">
                      <EvaluationMatrix evaluation={currentEvaluation} />
                    </div>
                  )}

                  {/* Auto-translation indicator */}
                  {isTranslating && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-3 bg-primary/10 border border-primary/20 rounded-lg flex items-center gap-2"
                    >
                      <Languages className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-sm text-primary">Автоматический перевод на русский...</span>
                    </motion.div>
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

                  {/* Forge Card Button at bottom */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="pt-6"
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="lg"
                            onClick={() => handleSave(false, true)}
                            disabled={isSaving || !requiredFieldsFilled}
                            className="w-full gap-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg shadow-primary/30 text-lg py-6"
                          >
                            {isSaving ? (
                              <>
                                <Sparkles className="w-5 h-5 animate-spin" />
                                {t('cardEditor.forgingMagic')}
                              </>
                            ) : (
                              <>
                                <Zap className="w-5 h-5" />
                                {(cardImageUrl || evaluation) ? t('cardEditor.reforgeCard') : t('cardEditor.forgeCard')}
                              </>
                            )}
                          </Button>
                        </TooltipTrigger>
                        {(cardImageUrl || evaluation) && (
                          <TooltipContent side="top" className="max-w-xs text-center">
                            <p>{t('cardEditor.reforgeCardTooltip')}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </motion.div>
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
          cardTitle={getLocalizedText(definition.title, language)}
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