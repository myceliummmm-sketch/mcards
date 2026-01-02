import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { AIIdea } from '@/hooks/useInterviewWizard';
import { useTranslation } from '@/hooks/useTranslation';

interface AIIdeasStepProps {
  painArea: string;
  specificPain: string;
  onSelect: (idea: AIIdea) => void;
  onBack: () => void;
  generatedIdeas: AIIdea[];
  onIdeasGenerated: (ideas: AIIdea[]) => void;
  regenerationCount: number;
  onRegenerate: () => void;
}

export function AIIdeasStep({
  painArea,
  specificPain,
  onSelect,
  onBack,
  generatedIdeas,
  onIdeasGenerated,
  regenerationCount,
  onRegenerate,
}: AIIdeasStepProps) {
  const { language, t } = useTranslation();
  const [isLoading, setIsLoading] = useState(generatedIdeas.length === 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (generatedIdeas.length === 0) {
      generateIdeas();
    }
  }, []);

  const generateIdeas = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-interview-ideas', {
        body: { painArea, specificPain, language },
      });

      if (error) throw error;

      if (data?.ideas && Array.isArray(data.ideas)) {
        onIdeasGenerated(data.ideas);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error generating ideas:', err);
      setError(t('simulator.interview.aiIdeas.errorGenerating'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    if (regenerationCount < 3) {
      onRegenerate();
      generateIdeas();
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center px-4 py-12"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-violet-500 flex items-center justify-center mb-4"
        >
          <Sparkles className="w-8 h-8 text-white" />
        </motion.div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          {t('simulator.interview.aiIdeas.generating')}
        </h2>
        <p className="text-muted-foreground text-center">
          {t('simulator.interview.aiIdeas.analyzingMarket')}
        </p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center px-4 py-8"
      >
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={generateIdeas} className="mb-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          {t('simulator.interview.aiIdeas.tryAgain')}
        </Button>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('simulator.interview.aiIdeas.back')}
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex flex-col items-center px-4 w-full max-w-md mx-auto"
    >
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-foreground mb-2 text-center"
      >
        {t('simulator.interview.aiIdeas.whatIFound')}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-muted-foreground mb-6 text-center"
      >
        {t('simulator.interview.aiIdeas.chooseIdea')}
      </motion.p>

      <div className="space-y-3 w-full mb-4">
        <AnimatePresence mode="popLayout">
          {generatedIdeas.map((idea, index) => (
            <motion.button
              key={`${idea.name}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onSelect(idea)}
              className="w-full p-4 rounded-xl bg-gradient-to-r from-background/80 to-background/50 border border-border/50 hover:border-primary/50 hover:from-primary/10 hover:to-violet-500/10 transition-all hover:scale-[1.02] active:scale-[0.98] text-left"
            >
              <p className="font-bold text-foreground text-lg mb-1">{idea.name}</p>
              <p className="text-primary text-sm mb-2">{idea.analogy}</p>
              <p className="text-muted-foreground text-sm">{idea.tagline}</p>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex gap-3 w-full">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('simulator.interview.aiIdeas.back')}
        </Button>
        {regenerationCount < 3 && (
          <Button
            variant="outline"
            onClick={handleRegenerate}
            className="flex-1"
            disabled={isLoading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('simulator.interview.aiIdeas.otherIdeas')} ({3 - regenerationCount})
          </Button>
        )}
      </div>
    </motion.div>
  );
}
