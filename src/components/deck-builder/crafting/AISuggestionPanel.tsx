import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { CardDefinition } from '@/data/cardDefinitions';

interface AISuggestionPanelProps {
  cardType: string;
  currentField: string;
  previousAnswers: Record<string, any>;
  cardDefinition: CardDefinition;
  onSelectSuggestion: (suggestion: string) => void;
}

export const AISuggestionPanel = ({
  cardType,
  currentField,
  previousAnswers,
  cardDefinition,
  onSelectSuggestion,
}: AISuggestionPanelProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const generateSuggestions = async () => {
    setIsLoading(true);
    setIsVisible(true);

    try {
      const { data, error } = await supabase.functions.invoke('suggest-card-field', {
        body: {
          cardType,
          currentField,
          previousAnswers,
          cardDefinition,
        },
      });

      if (error) throw error;

      if (data?.suggestions && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions);
        toast({
          title: '✨ Suggestions generated!',
          description: 'Click any suggestion to use it',
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('Error generating suggestions:', error);
      toast({
        title: 'Failed to generate suggestions',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
      setIsVisible(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    onSelectSuggestion(suggestion);
    toast({
      title: 'Suggestion applied!',
      description: 'Feel free to edit it further',
    });
  };

  return (
    <div className="space-y-3">
      {/* Generate Button */}
      {!isVisible && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={generateSuggestions}
          disabled={isLoading}
          className="w-full border-primary/30 hover:bg-primary/5 hover:border-primary/50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              AI Suggest
            </>
          )}
        </Button>
      )}

      {/* Suggestions Panel */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3 overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Sparkles className="w-4 h-4" />
                AI Suggestions
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={generateSuggestions}
                disabled={isLoading}
                className="h-7 text-xs"
              >
                {isLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3" />
                    Regenerate
                  </>
                )}
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-20 bg-muted/50 animate-pulse rounded-lg border border-border"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <motion.button
                    key={index}
                    type="button"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="w-full p-3 text-left bg-secondary/5 hover:bg-secondary/10 border border-secondary/20 hover:border-secondary/40 rounded-lg transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {index + 1}
                      </div>
                      <p className="flex-1 text-sm text-foreground group-hover:text-primary transition-colors">
                        {suggestion}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};