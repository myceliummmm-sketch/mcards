import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Rocket, Users, Sparkles, Bot, TrendingUp } from "lucide-react";

import everAvatar from "@/assets/avatars/ever.png";
import prismaAvatar from "@/assets/avatars/prisma.png";
import phoenixAvatar from "@/assets/avatars/phoenix.png";
import techpriestAvatar from "@/assets/avatars/techpriest.png";
import toxicAvatar from "@/assets/avatars/toxic.png";
import zenAvatar from "@/assets/avatars/zen.png";

const TELEGRAM_BOT_URL = "https://t.me/mdao_community_bot";

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

const TelegramBotRedirect = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden flex flex-col">
      {/* Hero Section - Compact */}
      <section className="px-4 pt-6 pb-4 shrink-0">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-md mx-auto"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs mb-3"
          >
            <Sparkles className="h-3 w-3" />
            <span>342 разработчика уже строят проекты</span>
          </motion.div>

          <h1 className="text-2xl font-bold mb-2 leading-tight">
            Превратить <span className="text-primary">идею в продукт</span>?
          </h1>

          <p className="text-muted-foreground text-sm">
            Посмотрел видео о пет-проектах — теперь сделаем твой.
          </p>
        </motion.div>
      </section>

      {/* Team Avatars - Compact horizontal */}
      <section className="px-4 pb-3 shrink-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-md mx-auto"
        >
          <div className="flex justify-center items-center gap-1">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.25 + index * 0.03 }}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/30 bg-card -ml-2 first:ml-0"
              >
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))}
            <span className="ml-2 text-xs text-muted-foreground">← AI-команда</span>
          </div>
        </motion.div>
      </section>

      {/* Benefits - Compact inline */}
      <section className="px-4 pb-4 shrink-0">
        <div className="max-w-md mx-auto flex flex-wrap justify-center gap-2">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 + index * 0.05 }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-card/50 border border-border/50 text-xs"
            >
              <benefit.icon className="h-3.5 w-3.5 text-primary" />
              <span className="text-muted-foreground">{benefit.title}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section - Always visible */}
      <section className="px-4 mt-auto pb-8 pt-4 shrink-0">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-md mx-auto text-center"
        >
          <Button
            asChild
            size="lg"
            className="w-full text-lg py-6 shadow-[4px_4px_0_0_hsl(var(--primary)/0.3)] hover:shadow-[2px_2px_0_0_hsl(var(--primary)/0.3)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            <a href={TELEGRAM_BOT_URL} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 h-5 w-5" />
              Войти в Telegram
              <Rocket className="ml-2 h-5 w-5" />
            </a>
          </Button>

          <p className="mt-3 text-xs text-muted-foreground">
            Бесплатно • Без обязательств • 2 минуты до старта
          </p>
        </motion.div>
      </section>
    </div>
  );
};

export default TelegramBotRedirect;
