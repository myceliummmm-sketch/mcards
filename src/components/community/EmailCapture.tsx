import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface EmailCaptureProps {
  passportId: string;
  onComplete: (email: string) => void;
  onSkip: () => void;
}

export function EmailCapture({ passportId, onComplete, onSkip }: EmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { language } = useLanguage();

  // Auto-recovery: if passportId is empty on mount, skip with warning
  useEffect(() => {
    if (!passportId || passportId.length < 10) {
      console.error('EmailCapture mounted with invalid passportId:', passportId);
      toast.error(language === 'ru' ? 'Ошибка: перезапустите процесс создания паспорта' : 'Error: Please restart the passport flow');
      onSkip();
    }
  }, []);

  const t = {
    en: {
      title: "Secure Your Passport",
      subtitle: "Enter your email to save your Digital Passport and receive exclusive updates from the Mycelium Network.",
      placeholder: "your@email.com",
      cta: "SAVE MY PASSPORT",
      skip: "Skip for now",
      skipWarning: "You can add email later from your dashboard",
      invalidEmail: "Please enter a valid email",
      success: "Passport secured!",
      error: "Something went wrong. Please try again.",
      benefit1: "Recover your passport on any device",
      benefit2: "Get exclusive network updates",
      benefit3: "Early access to new features",
    },
    ru: {
      title: "Защитите свой паспорт",
      subtitle: "Введите email для сохранения вашего Цифрового Паспорта и получения эксклюзивных обновлений от Mycelium Network.",
      placeholder: "ваш@email.com",
      cta: "СОХРАНИТЬ МОЙ ПАСПОРТ",
      skip: "Пропустить",
      skipWarning: "Вы сможете добавить email позже из дашборда",
      invalidEmail: "Пожалуйста, введите корректный email",
      success: "Паспорт защищён!",
      error: "Что-то пошло не так. Попробуйте ещё раз.",
      benefit1: "Восстановите паспорт на любом устройстве",
      benefit2: "Получайте эксклюзивные обновления",
      benefit3: "Ранний доступ к новым функциям",
    },
  };

  const text = t[language as keyof typeof t] || t.en;

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      toast.error(text.invalidEmail);
      return;
    }

    // Validate passportId before proceeding
    if (!passportId || passportId.length < 10) {
      console.error('Invalid or missing passportId:', passportId);
      toast.error(text.error);
      return;
    }

    setIsSubmitting(true);

    try {
      // Update passport with email
      const { error: updateError } = await supabase
        .from('passports')
        .update({ email })
        .eq('id', passportId);

      if (updateError) throw updateError;

      // Also save to leads for marketing
      await supabase.from('leads').insert({
        email,
        source: 'portal_passport',
      });

      toast.success(text.success);
      onComplete(email);
    } catch (error) {
      console.error('Error saving email:', error);
      toast.error(text.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-[#0D1117] px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#2E7D32]/20 flex items-center justify-center"
        >
          <Mail className="w-10 h-10 text-[#2E7D32]" />
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-3xl font-bold text-white mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {text.title}
        </motion.h1>

        <motion.p
          className="text-white/60 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {text.subtitle}
        </motion.p>

        {/* Benefits */}
        <motion.div
          className="space-y-3 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[text.benefit1, text.benefit2, text.benefit3].map((benefit, i) => (
            <div key={i} className="flex items-center gap-3 text-left">
              <div className="w-6 h-6 rounded-full bg-[#2E7D32]/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-3 h-3 text-[#2E7D32]" />
              </div>
              <span className="text-white/70 text-sm">{benefit}</span>
            </div>
          ))}
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={text.placeholder}
            className="h-14 bg-white/5 border-white/10 text-white placeholder:text-white/40 text-center text-lg"
            disabled={isSubmitting}
          />

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="w-full bg-[#2E7D32] hover:bg-[#1B5E20] text-white border-2 border-[#2E7D32] shadow-[4px_4px_0_rgba(46,125,50,0.5)] hover:shadow-[2px_2px_0_rgba(46,125,50,0.5)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all min-h-14 text-lg font-bold"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {text.cta}
                <ArrowRight className="ml-2 w-5 h-5" />
              </>
            )}
          </Button>
        </motion.form>

        {/* Skip button */}
        <motion.div
          className="mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <button
            onClick={onSkip}
            className="text-white/40 hover:text-white/60 text-sm transition-colors"
          >
            {text.skip}
          </button>
          <p className="text-white/30 text-xs mt-1">{text.skipWarning}</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
