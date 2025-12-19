import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Edit, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { type CardDefinition, getLocalizedText } from '@/data/cardDefinitions';
import { useTranslation } from '@/hooks/useTranslation';

interface SummaryReviewProps {
  definition: CardDefinition;
  formData: Record<string, any>;
  onEdit: (fieldIndex: number) => void;
  onForge: () => void;
  isForging: boolean;
  hasExistingCard?: boolean;
}

export const SummaryReview = ({ definition, formData, onEdit, onForge, isForging, hasExistingCard = false }: SummaryReviewProps) => {
  const { t, language } = useTranslation();
  
  const filledFields = definition.fields.filter(f => {
    const value = formData[f.name];
    return value !== undefined && value !== null && value !== '';
  });

  const requiredFieldsFilled = definition.fields
    .filter(f => f.required)
    .every(f => {
      const value = formData[f.name];
      return value !== undefined && value !== null && value !== '';
    });

  const missingRequired = definition.fields.filter(f => {
    if (!f.required) return false;
    const value = formData[f.name];
    return !value || value === '';
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
        </motion.div>
        <h2 className="text-3xl font-display font-bold text-foreground">
          {t('wizard.reviewCard')}
        </h2>
        <p className="text-muted-foreground">
          {getLocalizedText(definition.title, language)} • Slot #{definition.slot}
        </p>
      </div>

      {/* Status Banner */}
      <div className={`
        p-4 rounded-lg border-2 flex items-center gap-3
        ${requiredFieldsFilled 
          ? 'bg-secondary/10 border-secondary' 
          : 'bg-destructive/10 border-destructive'
        }
      `}>
        {requiredFieldsFilled ? (
          <>
            <CheckCircle2 className="w-6 h-6 text-secondary shrink-0" />
            <div>
              <div className="font-bold text-foreground">{t('wizard.readyToForge')}</div>
              <div className="text-sm text-muted-foreground">
                {filledFields.length} {t('wizard.fieldsCompleted')}
              </div>
            </div>
          </>
        ) : (
          <>
            <AlertCircle className="w-6 h-6 text-destructive shrink-0" />
            <div>
              <div className="font-bold text-foreground">{t('wizard.missingRequired')}</div>
              <div className="text-sm text-muted-foreground">
                {missingRequired.length} {t('wizard.requiredNeedAttention')}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Field Summary */}
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-3">
          {definition.fields.map((field, index) => {
            const value = formData[field.name];
            const isFilled = value !== undefined && value !== null && value !== '';
            const isMissing = field.required && !isFilled;

            return (
              <motion.div
                key={field.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  p-4 rounded-lg border bg-card
                  ${isMissing ? 'border-destructive' : 'border-border'}
                `}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-sm text-foreground">
                        {getLocalizedText(field.label, language)}
                      </span>
                      {field.required && (
                        <span className="text-xs text-destructive">*</span>
                      )}
                      {isFilled && !isMissing && (
                        <CheckCircle2 className="w-4 h-4 text-secondary" />
                      )}
                    </div>
                    {isFilled ? (
                      <div className="text-sm text-muted-foreground break-words">
                        {String(value).length > 150 
                          ? `${String(value).substring(0, 150)}...` 
                          : String(value)
                        }
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground italic">
                        {field.required ? t('wizard.required') : t('wizard.optional')}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(index)}
                    className="shrink-0"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Missing Fields Warning */}
      {!requiredFieldsFilled && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="text-sm text-destructive font-medium mb-1">
            {t('wizard.missingRequiredFields')}
          </div>
          <ul className="text-sm text-muted-foreground list-disc list-inside">
            {missingRequired.map(f => (
              <li key={f.name}>{getLocalizedText(f.label, language)}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Forge Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onForge}
              disabled={!requiredFieldsFilled || isForging}
              className="w-full h-14 text-lg gap-3 shadow-lg"
              size="lg"
            >
              {isForging ? (
                <>
                  <Sparkles className="w-5 h-5 animate-spin" />
                  {t('wizard.forgingMagic')}
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  {hasExistingCard ? t('wizard.reforgeCard') : t('wizard.forgeThisCard')}
                </>
              )}
            </Button>
          </TooltipTrigger>
          {hasExistingCard && (
            <TooltipContent side="top" className="max-w-xs text-center">
              <p>{t('wizard.reforgeCardTooltip')}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </motion.div>
  );
};