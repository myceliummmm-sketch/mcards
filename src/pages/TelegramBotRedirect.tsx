import { useEffect } from "react";

const TelegramBotRedirect = () => {
  useEffect(() => {
    window.location.href = "https://t.me/mdao_community_bot";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <p>Redirecting to Telegram Bot...</p>
    </div>
  );
};

export default TelegramBotRedirect;
