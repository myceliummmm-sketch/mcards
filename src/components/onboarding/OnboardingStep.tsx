import { ReactNode } from "react";

interface OnboardingStepProps {
  children: ReactNode;
}

export const OnboardingStep = ({ children }: OnboardingStepProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      {children}
    </div>
  );
};
