import { useIsMobile } from "@/hooks/use-mobile";
import { useABTest } from "@/hooks/useABTest";
import { MobileLanding } from "@/components/landing/MobileLanding";
import { GamifiedWizard } from "./GamifiedWizard";
import { DesktopLanding } from "./DesktopLanding";

export const LandingPageSplitter = () => {
  const isMobile = useIsMobile();
  const { variant, resetTest, trackEvent } = useABTest();
  const isDev = import.meta.env.DEV;

  // 1. DESKTOP GUARD: Always show old landing on desktop
  if (!isMobile) {
    return <DesktopLanding />;
  }

  // 2. MOBILE TEST:
  // Variant B -> Game
  if (variant === 'B') {
    return (
      <>
        <GamifiedWizard trackEvent={trackEvent} />
        {isDev && (
          <button
            onClick={resetTest}
            className="fixed bottom-4 right-4 z-50 px-3 py-1 text-xs 
              bg-black/50 text-white/60 rounded-full border border-white/20"
          >
            Reset A/B (B)
          </button>
        )}
      </>
    );
  }

  // Variant A -> Old landing
  return (
    <>
      <MobileLanding trackEvent={trackEvent} />
      {isDev && (
        <button
          onClick={resetTest}
          className="fixed bottom-4 right-4 z-50 px-3 py-1 text-xs 
            bg-black/50 text-white/60 rounded-full border border-white/20"
        >
          Reset A/B (A)
        </button>
      )}
    </>
  );
};
