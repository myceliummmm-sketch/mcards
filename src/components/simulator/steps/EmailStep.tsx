import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { InterviewData, SelectedPath } from '@/hooks/useInterviewWizard';

interface EmailStepProps {
  data: InterviewData;
  selectedPath: SelectedPath;
  onComplete: (email: string) => void;
}

export function EmailStep({ data, selectedPath, onComplete }: EmailStepProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !email.includes('@')) {
      toast.error('Введи корректный email');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.from('leads').insert([{
        email: email.trim(),
        source: 'interview_wizard',
        interview_data: {
          branch: data.branch,
          projectName: data.projectName,
          analogyTemplate: data.analogyTemplate,
          analogyNiche: data.analogyNiche,
          targetAudience: data.targetAudience,
          painArea: data.painArea,
          specificPain: data.specificPain,
          selectedIdea: data.selectedIdea,
          motivation: data.motivation,
          painDetails: data.painDetails,
          experience: data.experience,
        },
        founder_fit_score: data.founderFitScore,
        card_rarity: data.cardRarity,
        selected_path: selectedPath,
      }]);

      if (error) {
        if (error.code === '23505') {
          // Duplicate email - still proceed
          toast.info('Этот email уже зарегистрирован');
        } else {
          throw error;
        }
      }

      toast.success('🎉 500 Spores добавлены!');
      onComplete(email);
    } catch (err) {
      console.error('Error saving lead:', err);
      toast.error('Произошла ошибка. Попробуй ещё раз.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed inset-x-0 bottom-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50 rounded-t-3xl p-6 pb-safe"
    >
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-6"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-amber-500 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            Получи 500 Spores и сохрани стратегию
          </h3>
          <p className="text-muted-foreground text-sm">
            Введи email, чтобы мы отправили тебе твою Vision Card
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="pl-12 h-14 text-lg bg-background/50 border-primary/30 focus:border-primary"
              autoFocus
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            disabled={!email.trim() || isLoading}
            className="w-full h-14 text-lg bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Сохраняем...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                CLAIM 500 SPORES
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Нажимая кнопку, ты соглашаешься с условиями использования
          </p>
        </form>
      </div>
    </motion.div>
  );
}
