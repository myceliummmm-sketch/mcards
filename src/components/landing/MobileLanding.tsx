import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MobileHero } from "./MobileHero";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { LazySection } from "@/components/ui/lazy-section";
import LegalFooter from "@/components/landing/LegalFooter";
import { 
  MobileTeamSection, 
  MobileHowItWorks, 
  MobileSocialProof, 
  MobileBottomCTA 
} from "./MobileLandingSections";

export const MobileLanding = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-[100dvh] bg-background relative overflow-y-auto">
      <div className="absolute top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      <MobileHero />

      <LazySection minHeight="300px">
        <MobileTeamSection />
      </LazySection>

      <LazySection minHeight="400px">
        <MobileHowItWorks />
      </LazySection>

      <LazySection minHeight="200px">
        <MobileSocialProof />
      </LazySection>

      <LazySection minHeight="200px">
        <MobileBottomCTA />
      </LazySection>

      <LegalFooter />
    </div>
  );
};
