import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowRight, X } from "lucide-react";
import { SwipeableStep } from "./SwipeableStep";
import { TeamShowcase } from "./TeamShowcase";
import { useLanguage } from "@/contexts/LanguageContext";
import myceliumCardsHero from "@/assets/mycelium-cards-hero.png";

interface MobileOnboardingProps {
  username: string;
  projectName: string;
  setProjectName: (name: string) => void;
  projectDescription: string;
  setProjectDescription: (desc: string) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  isLoading: boolean;
  handleSkip: () => void;
  handleCreateProject: () => void;
}

export const MobileOnboarding = ({
  username,
  projectName,
  setProjectName,
  projectDescription,
  setProjectDescription,
  currentStep,
  setCurrentStep,
  isLoading,
  handleSkip,
  handleCreateProject,
}: MobileOnboardingProps) => {
  const { t } = useLanguage();

  const nextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const steps = [
    // Step 1: Welcome
    <SwipeableStep
      key="welcome"
      onSwipeLeft={nextStep}
      canSwipeLeft={true}
      canSwipeRight={false}
    >
      <div className="flex flex-col items-center text-center px-6 min-h-[calc(100dvh-160px)] justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full"
        >
          <motion.div
            className="relative inline-block mb-6"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <img
              src={myceliumCardsHero}
              alt="Mycelium Cards"
              className="w-32 h-auto mx-auto"
            />
            <div className="absolute inset-0 bg-primary/20 blur-3xl -z-10 scale-150 animate-pulse" />
          </motion.div>

          <h1 className="text-3xl font-display font-bold mb-3 text-glow">
            {t('onboarding.welcome')}, {username}!
          </h1>
          <p className="text-base text-muted-foreground max-w-sm mx-auto mb-8">
            {t('onboarding.welcomeSubtitle')}
          </p>

          <Button
            onClick={nextStep}
            size="lg"
            className="gap-2 h-14 px-8 text-lg min-w-[200px]"
          >
            {t('onboarding.meetTeam')} <ArrowRight className="w-5 h-5" />
          </Button>

          <p className="text-xs text-muted-foreground mt-6 animate-pulse">
            {t('onboarding.swipeHint')}
          </p>
        </motion.div>
      </div>
    </SwipeableStep>,

    // Step 2: Meet the Team
    <SwipeableStep
      key="team"
      onSwipeLeft={nextStep}
      onSwipeRight={prevStep}
      canSwipeLeft={true}
      canSwipeRight={true}
    >
      <div className="flex flex-col items-center text-center px-4 min-h-[calc(100dvh-160px)] justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          <h2 className="text-2xl font-display font-bold mb-2 text-glow">
            {t('onboarding.meetYourTeam')}
          </h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            {t('onboarding.teamSubtitle')}
          </p>

          <TeamShowcase isMobile />

          <Button
            onClick={nextStep}
            size="lg"
            className="gap-2 h-14 px-8 text-lg min-w-[200px] mt-6"
          >
            {t('onboarding.startBuilding')} <ArrowRight className="w-5 h-5" />
          </Button>

          <p className="text-xs text-muted-foreground mt-4 animate-pulse">
            {t('onboarding.swipeHint')}
          </p>
        </motion.div>
      </div>
    </SwipeableStep>,

    // Step 3: Create Project
    <SwipeableStep
      key="create"
      onSwipeRight={prevStep}
      canSwipeLeft={false}
      canSwipeRight={true}
    >
      <div className="flex flex-col items-center px-4 min-h-[calc(100dvh-160px)] justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm mx-auto"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-display font-bold mb-2 text-glow">
              {t('onboarding.nameProject')}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t('onboarding.nameProjectSubtitle')}
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">{t('onboarding.projectName')}</Label>
              <Input
                id="projectName"
                type="text"
                placeholder={t('onboarding.projectNamePlaceholder')}
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                disabled={isLoading}
                autoFocus
                className="h-14 text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectDescription" className="flex items-center gap-2">
                {t('onboarding.description')}{" "}
                <span className="text-muted-foreground text-xs">
                  ({t('onboarding.optional')})
                </span>
              </Label>
              <Textarea
                id="projectDescription"
                placeholder={t('onboarding.descriptionPlaceholder')}
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                disabled={isLoading}
                rows={3}
                className="resize-none text-base"
              />
            </div>

            <Button
              onClick={handleCreateProject}
              size="lg"
              className="w-full gap-2 h-14 text-lg mt-4"
              disabled={isLoading || !projectName.trim()}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {t('onboarding.createAndStart')} <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </SwipeableStep>,
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-gradient-to-br from-background via-background to-muted relative overflow-hidden">
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary rounded-full opacity-20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Skip button - top right with safe area */}
      <div className="absolute top-4 right-4 z-20 pt-safe-top">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground h-11 px-4"
          onClick={handleSkip}
          disabled={isLoading}
        >
          {t('onboarding.skip')} <X className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Step content */}
      <div className="flex-1 relative z-10 w-full pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.25 }}
          >
            {steps[currentStep]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress dots - bottom with safe area */}
      <div className="pb-8 pb-safe-bottom flex justify-center gap-3 z-20">
        {[0, 1, 2].map((step) => (
          <button
            key={step}
            onClick={() => step < currentStep && setCurrentStep(step)}
            disabled={step > currentStep}
            className={`h-3 rounded-full transition-all duration-300 ${
              step === currentStep
                ? "bg-primary w-10"
                : step < currentStep
                ? "bg-primary/50 hover:bg-primary/70 cursor-pointer w-3"
                : "bg-muted-foreground/30 w-3"
            }`}
            aria-label={`Go to step ${step + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
