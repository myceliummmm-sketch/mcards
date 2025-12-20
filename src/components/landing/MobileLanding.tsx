import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MobileHero } from "./MobileHero";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { 
  MobileTeamSection, 
  MobileHowItWorks, 
  MobileSocialProof, 
  MobileBottomCTA 
} from "./MobileLandingSections";

export const MobileLanding = () => {
  const navigate = useNavigate();

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
    <div className="min-h-[100dvh] bg-background relative overflow-y-auto">
      {/* Language Dropdown */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      {/* Hero Section */}
      <MobileHero />

      {/* Team Section */}
      <MobileTeamSection />

      {/* How It Works */}
      <MobileHowItWorks />

      {/* Social Proof */}
      <MobileSocialProof />

      {/* Bottom CTA */}
      <MobileBottomCTA />
    </div>
  );
};
