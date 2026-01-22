import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Rocket, Users, Sparkles, Bot, TrendingUp, Shuffle, HelpCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

import everAvatar from "@/assets/avatars/ever.png";
import prismaAvatar from "@/assets/avatars/prisma.png";
import phoenixAvatar from "@/assets/avatars/phoenix.png";
import techpriestAvatar from "@/assets/avatars/techpriest.png";
import toxicAvatar from "@/assets/avatars/toxic.png";
import zenAvatar from "@/assets/avatars/zen.png";

const TELEGRAM_BOT_URL = "https://t.me/mdao_community_bot";

// Analytics helper
const generateSessionId = (): string => {
  return `tg2-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

const getOrCreateSessionId = (): string => {
  const key = 'tg2_session_id';
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;
  
  const newId = generateSessionId();
  sessionStorage.setItem(key, newId);
  return newId;
};

type ScreenState = 'question' | 'bot-joke' | 'landing';

const teamMembers = [
  { name: "Ever", role: "Визионер", avatar: everAvatar },
  { name: "Prisma", role: "Аналитик", avatar: prismaAvatar },
  { name: "Phoenix", role: "Маркетолог", avatar: phoenixAvatar },
  { name: "Tech Priest", role: "Техлид", avatar: techpriestAvatar },
  { name: "Toxic", role: "Критик", avatar: toxicAvatar },
  { name: "Zen", role: "Продакт", avatar: zenAvatar },
];

const benefits = [
  {
    icon: Bot,
    title: "AI-команда из 6 экспертов",
    description: "Бесплатный CEO, CTO, маркетолог — все роли для твоего стартапа",
  },
  {
    icon: TrendingUp,
    title: "От идеи до первых $1K",
    description: "Пошаговый путь с валидацией каждого этапа",
  },
  {
    icon: Users,
    title: "Живое комьюнити",
    description: "Поддержка и обратная связь от таких же как ты",
  },
];

const questionOptions = [
  { id: 'bot', text: 'Я бот 🤖', icon: Bot, action: 'bot-joke' as const },
  { id: 'project', text: 'Хочу сделать свой проект', icon: Rocket, action: 'landing' as const },
  { id: 'random', text: 'Ыыы не знаю, просто кликнул', icon: Shuffle, action: 'landing' as const },
  { id: 'curious', text: 'Интересно что тут', icon: HelpCircle, action: 'landing' as const },
];

// Question Screen Component
const QuestionScreen = ({ 
  onAnswer, 
  trackEvent 
}: { 
  onAnswer: (screen: ScreenState) => void;
  trackEvent: (eventType: string, metadata?: Record<string, unknown>) => void;
}) => {
  const handleAnswer = (option: typeof questionOptions[0]) => {
    trackEvent('tg2_answer_selected', { 
      answer_id: option.id, 
      answer_text: option.text,
      next_screen: option.action 
    });
    onAnswer(option.action);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="text-5xl mb-6"
        >
          👋
        </motion.div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Зачем ты кликнул?
        </h1>
      </motion.div>

      <div className="w-full max-w-sm space-y-3">
        {questionOptions.map((option, index) => (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleAnswer(option)}
            className="w-full group"
          >
            <Card className="bg-card/80 backdrop-blur-sm border-2 border-border/50 hover:border-primary/60 transition-all duration-300 overflow-hidden">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300 shrink-0">
                  <option.icon className="h-5 w-5" />
                </div>
                <span className="text-foreground font-medium text-left">
                  {option.text}
                </span>
              </CardContent>
            </Card>
          </motion.button>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 text-sm text-muted-foreground text-center"
      >
        Выбери честно, мы не осуждаем 😉
      </motion.p>
    </div>
  );
};

// Bot Joke Screen Component
const BotJokeScreen = ({ 
  trackEvent 
}: { 
  trackEvent: (eventType: string, metadata?: Record<string, unknown>) => void;
}) => {
  const handleTelegramClick = () => {
    trackEvent('tg2_telegram_click', { source: 'bot_joke_screen' });
  };
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="text-7xl mb-6"
      >
        😄
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl md:text-3xl font-bold text-foreground text-center mb-3"
      >
        Отличная шутка!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-lg text-muted-foreground text-center mb-8 max-w-xs"
      >
        Теперь попробуй пошутить тут 👇
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-sm"
      >
        <Button
          asChild
          size="lg"
          className="w-full text-lg py-6 shadow-[4px_4px_0_0_hsl(var(--primary)/0.3)] hover:shadow-[2px_2px_0_0_hsl(var(--primary)/0.3)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          onClick={handleTelegramClick}
        >
          <a href={TELEGRAM_BOT_URL} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="mr-2 h-5 w-5" />
            Войти в Telegram
            <Bot className="ml-2 h-5 w-5" />
          </a>
        </Button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-4 text-sm text-muted-foreground text-center max-w-xs"
      >
        Там такие же как ты, кто шутит про ботов 🤖
      </motion.p>
    </div>
  );
};

// Landing Screen Component (existing content)
const LandingScreen = ({ 
  trackEvent 
}: { 
  trackEvent: (eventType: string, metadata?: Record<string, unknown>) => void;
}) => {
  const handleTelegramClick = () => {
    trackEvent('tg2_telegram_click', { source: 'landing_screen' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative px-4 pt-12 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md mx-auto"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6"
          >
            <Sparkles className="h-4 w-4" />
            <span>342 разработчика уже строят свои проекты</span>
          </motion.div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            Хочешь превратить{" "}
            <span className="text-primary">идею в продукт</span>?
          </h1>

          <p className="text-muted-foreground text-lg">
            Ты только что посмотрел видео о пет-проектах. Теперь давай сделаем твой.
          </p>
        </motion.div>

        {/* CTA Button - Primary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Button
            asChild
            size="lg"
            className="w-full text-lg py-6 shadow-[4px_4px_0_0_hsl(var(--primary)/0.3)] hover:shadow-[2px_2px_0_0_hsl(var(--primary)/0.3)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            onClick={handleTelegramClick}
          >
            <a href={TELEGRAM_BOT_URL} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 h-5 w-5" />
              Войти в Telegram
              <Rocket className="ml-2 h-5 w-5" />
            </a>
          </Button>

          <p className="mt-3 text-sm text-muted-foreground">
            Бесплатно • Без обязательств • 2 минуты до старта
          </p>
        </motion.div>
      </section>

      {/* Benefits Section */}
      <section className="px-4 pb-8">
        <div className="max-w-md mx-auto space-y-3">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardContent className="flex items-start gap-4 p-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                    <benefit.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">{benefit.title}</h3>
                    <p className="text-muted-foreground text-sm">{benefit.description}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="px-4 pb-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="max-w-md mx-auto"
        >
          <p className="text-center text-sm text-muted-foreground mb-4">
            Твоя AI-команда:
          </p>
          <div className="flex justify-center gap-2 flex-wrap">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.7 + index * 0.05 }}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/30 bg-card">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs text-muted-foreground">{member.role}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
};

// Main Component
const TelegramBotRedirect = () => {
  const [screen, setScreen] = useState<ScreenState>('question');
  const sessionId = useRef(getOrCreateSessionId());
  const hasTrackedPageLoad = useRef(false);
  const pageLoadStart = useRef(performance.now());

  const trackEvent = useCallback(async (
    eventType: string, 
    metadata?: Record<string, unknown>
  ) => {
    try {
      await (supabase.from('ab_test_events') as any).insert({
        session_id: sessionId.current,
        variant: 'tg2',
        event_type: eventType,
        page_load_time_ms: eventType === 'tg2_page_load' 
          ? Math.round(performance.now() - pageLoadStart.current) 
          : null,
        metadata: metadata || {}
      });
    } catch (error) {
      console.debug('TG2 tracking error:', error);
    }
  }, []);

  // Track page load on mount
  useEffect(() => {
    if (!hasTrackedPageLoad.current) {
      hasTrackedPageLoad.current = true;
      trackEvent('tg2_page_load');
    }
  }, [trackEvent]);

  return (
    <AnimatePresence mode="wait">
      {screen === 'question' && (
        <motion.div
          key="question"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.3 }}
        >
          <QuestionScreen onAnswer={setScreen} trackEvent={trackEvent} />
        </motion.div>
      )}

      {screen === 'bot-joke' && (
        <motion.div
          key="bot-joke"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <BotJokeScreen trackEvent={trackEvent} />
        </motion.div>
      )}

      {screen === 'landing' && (
        <motion.div
          key="landing"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <LandingScreen trackEvent={trackEvent} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TelegramBotRedirect;
