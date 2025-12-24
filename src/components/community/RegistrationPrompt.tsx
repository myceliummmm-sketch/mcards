import { motion } from 'framer-motion';
import { UserPlus, Zap, Shield, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

interface RegistrationPromptProps {
  founderName: string;
  problemCardCount: number;
  onContinueAsGuest: () => void;
}

export function RegistrationPrompt({ 
  founderName, 
  problemCardCount,
  onContinueAsGuest 
}: RegistrationPromptProps) {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const t = {
    en: {
      title: "Save Your Progress",
      subtitle: "Create an account to permanently save your Problem Cards and unlock more features.",
      cardsSaved: "{count} Problem Card(s) ready to save",
      benefit1: "Save cards permanently across devices",
      benefit2: "Access AI Research & Validation tools",
      benefit3: "Earn Spores and trade in Marketplace",
      createAccount: "CREATE ACCOUNT",
      continueGuest: "Continue as guest",
      guestWarning: "Guest data is stored locally and may be lost",
      welcomeBack: "Welcome, {name}!",
    },
    ru: {
      title: "Сохраните ваш прогресс",
      subtitle: "Создайте аккаунт для постоянного сохранения ваших Problem Cards и разблокировки новых функций.",
      cardsSaved: "{count} Problem Card(s) готово к сохранению",
      benefit1: "Сохраняйте карточки навсегда на всех устройствах",
      benefit2: "Доступ к AI-исследованиям и валидации",
      benefit3: "Зарабатывайте Spores и торгуйте на маркетплейсе",
      createAccount: "СОЗДАТЬ АККАУНТ",
      continueGuest: "Продолжить как гость",
      guestWarning: "Гостевые данные хранятся локально и могут быть потеряны",
      welcomeBack: "Добро пожаловать, {name}!",
    },
  };

  const text = t[language as keyof typeof t] || t.en;

  const handleCreateAccount = () => {
    // Store return URL to come back after auth
    localStorage.setItem('auth_return_url', '/community');
    navigate('/auth');
  };

  const benefits = [
    { icon: Shield, text: text.benefit1 },
    { icon: Zap, text: text.benefit2 },
    { icon: UserPlus, text: text.benefit3 },
  ];

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-[#0D1117] px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            <UserPlus className="w-10 h-10 text-white" />
          </motion.div>

          <h1 className="text-3xl font-bold text-white mb-3">{text.title}</h1>
          <p className="text-white/60">{text.subtitle}</p>
        </motion.div>

        {/* Cards saved indicator */}
        <motion.div
          className="mb-6 p-4 rounded-xl bg-[#2E7D32]/10 border border-[#2E7D32]/30 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-[#2E7D32] font-semibold">
            {text.cardsSaved.replace('{count}', String(problemCardCount))}
          </span>
        </motion.div>

        {/* Benefits */}
        <motion.div
          className="space-y-4 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {benefits.map((benefit, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            >
              <div className="w-10 h-10 rounded-full bg-[#2E7D32]/20 flex items-center justify-center flex-shrink-0">
                <benefit.icon className="w-5 h-5 text-[#2E7D32]" />
              </div>
              <span className="text-white/80">{benefit.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Button
            onClick={handleCreateAccount}
            size="lg"
            className="w-full bg-[#2E7D32] hover:bg-[#1B5E20] text-white border-2 border-[#2E7D32] shadow-[4px_4px_0_rgba(46,125,50,0.5)] hover:shadow-[2px_2px_0_rgba(46,125,50,0.5)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all min-h-14 text-lg font-bold"
          >
            {text.createAccount}
            <ChevronRight className="ml-2 w-5 h-5" />
          </Button>

          <div className="text-center">
            <button
              onClick={onContinueAsGuest}
              className="text-white/40 hover:text-white/60 text-sm transition-colors"
            >
              {text.continueGuest}
            </button>
            <p className="text-white/30 text-xs mt-1">{text.guestWarning}</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
