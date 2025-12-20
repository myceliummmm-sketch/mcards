import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface OnboardingStepProps {
  children: ReactNode;
  isMobile?: boolean;
}

export const OnboardingStep = ({ children, isMobile = false }: OnboardingStepProps) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-4",
        isMobile ? "min-h-[calc(100dvh-120px)] pb-safe-bottom" : "min-h-[60vh]"
      )}
    >
      {children}
    </div>
  );
};
