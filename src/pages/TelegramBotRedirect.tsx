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

export default TelegramBotRedirect;
