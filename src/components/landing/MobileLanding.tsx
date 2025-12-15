import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { MobileHero } from "./MobileHero";

export const MobileLanding = () => {
  const navigate = useNavigate();
  const { language, setLanguage } = useTranslation();

  useEffect(() => {
    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-[100dvh] bg-background relative overflow-hidden">
      {/* Language Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLanguage(language === 'en' ? 'ru' : 'en')}
          className="gap-1 text-muted-foreground"
        >
          <Globe className="h-4 w-4" />
          {language === 'en' ? 'RU' : 'EN'}
        </Button>
      </div>

      {/* Hero Section */}
      <MobileHero />
    </div>
  );
};
