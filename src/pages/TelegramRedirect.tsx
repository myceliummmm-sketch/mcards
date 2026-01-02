import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

const TELEGRAM_CHANNEL_URL = "https://t.me/mDAOsists";

const TelegramRedirect = () => {
  const [showManualLink, setShowManualLink] = useState(false);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    
    if (tg?.openTelegramLink) {
      tg.openTelegramLink(TELEGRAM_CHANNEL_URL);
      return;
    }

    window.location.href = TELEGRAM_CHANNEL_URL;
    
    const timer = setTimeout(() => {
      setShowManualLink(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-foreground">
      {showManualLink ? (
        <>
          <p className="text-muted-foreground">Нажмите кнопку для перехода:</p>
          <Button asChild size="lg">
            <a href={TELEGRAM_CHANNEL_URL} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Открыть Telegram канал
            </a>
          </Button>
        </>
      ) : (
        <p>Redirecting to Telegram...</p>
      )}
    </div>
  );
};

export default TelegramRedirect;
