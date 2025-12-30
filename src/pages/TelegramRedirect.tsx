import { useEffect } from "react";

const TelegramRedirect = () => {
  useEffect(() => {
    window.location.href = "https://t.me/mDAOsists";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <p>Redirecting to Telegram...</p>
    </div>
  );
};

export default TelegramRedirect;
