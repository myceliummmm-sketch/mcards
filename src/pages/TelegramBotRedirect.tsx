import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2 } from "lucide-react";

const TELEGRAM_BOT_URL = "https://t.me/mdao_community_bot";

const TelegramBotRedirect = () => {
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    
    if (tg?.openTelegramLink) {
      tg.openTelegramLink(TELEGRAM_BOT_URL);
      return;
    }

    const timer = setTimeout(() => {
      window.location.href = TELEGRAM_BOT_URL;
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-background text-foreground p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <p>Перенаправляем в Telegram...</p>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Если ничего не происходит, нажмите кнопку:
      </p>
      
      <Button asChild size="lg">
        <a href={TELEGRAM_BOT_URL} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="mr-2 h-4 w-4" />
          Открыть Telegram Bot
        </a>
      </Button>
    </div>
  );
};

export default TelegramBotRedirect;
