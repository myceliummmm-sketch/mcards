import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTrafficVariant } from "@/hooks/useTrafficVariant";
import { MobileLanding } from "@/components/landing/MobileLanding";
import { GamifiedWizard } from "./GamifiedWizard";
import { EmpireBuilder } from "./EmpireBuilder";
import { DesktopLanding } from "./DesktopLanding";

export const LandingPageSplitter = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { variant, resetTest, trackEvent } = useTrafficVariant();
  const isDev = import.meta.env.DEV;

  // Handle community redirect
  useEffect(() => {
    if (isMobile && variant === 'community') {
      navigate('/community', { replace: true });
    }
  }, [isMobile, variant, navigate]);

  // 1. DESKTOP GUARD: Always show old landing on desktop
  if (!isMobile) {
    return <DesktopLanding />;
  }

  // 2. Loading state while variant is determined
  if (!variant) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 3. Community redirect handled by useEffect above
  if (variant === 'community') {
    return null;
  }

  // 4. MOBILE TRAFFIC SPLIT:
  // Empire (60%) -> New Empire Builder with chest video
  if (variant === 'empire') {
    return (
      <>
        <EmpireBuilder trackEvent={trackEvent} />
        {isDev && (
          <button
            onClick={resetTest}
            className="fixed bottom-4 right-4 z-50 px-3 py-1 text-xs 
              bg-black/50 text-white/60 rounded-full border border-white/20"
          >
            Reset (Empire)
          </button>
        )}
      </>
    );
  }

  // Classic (15%) -> Old simulator
  return (
    <>
      <GamifiedWizard trackEvent={trackEvent} />
      {isDev && (
        <button
          onClick={resetTest}
          className="fixed bottom-4 right-4 z-50 px-3 py-1 text-xs 
            bg-black/50 text-white/60 rounded-full border border-white/20"
        >
          Reset (Classic)
        </button>
      )}
    </>
  );
};
