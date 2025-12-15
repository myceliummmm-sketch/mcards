import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { OnboardingStep } from "@/components/onboarding/OnboardingStep";
import { TeamShowcase } from "@/components/onboarding/TeamShowcase";
import myceliumCardsHero from "@/assets/mycelium-cards-hero.png";

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("username, onboarding_completed")
        .eq("id", session.user.id)
        .single();

      if (profile?.onboarding_completed) {
        navigate("/dashboard");
        return;
      }

      setUsername(profile?.username || session.user.email?.split("@")[0] || "Explorer");
    };

    fetchUser();
  }, [navigate]);

  const handleSkip = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", session.user.id);

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      toast({
        title: "Project name required",
        description: "Please enter a name for your project",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Create the deck
      const { data: deck, error: deckError } = await supabase
        .from("decks")
        .insert({
          title: projectName.trim(),
          description: projectDescription.trim() || null,
          user_id: session.user.id,
        })
        .select()
        .single();

      if (deckError) throw deckError;

      // Mark onboarding as completed
      await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", session.user.id);

      toast({
        title: "Project created!",
        description: "Let's start building your strategy deck",
      });

      navigate(`/deck/${deck.id}`);
    } catch (error: any) {
      toast({
        title: "Error creating project",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && currentStep < 2) {
      e.preventDefault();
      nextStep();
    } else if (e.key === "Escape") {
      handleSkip();
    }
  };

  const steps = [
    // Step 1: Welcome
    <OnboardingStep key="welcome">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <motion.div 
          className="relative inline-block mb-6"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <img 
            src={myceliumCardsHero} 
            alt="Mycelium Cards" 
            className="w-48 h-auto mx-auto"
          />
          <div className="absolute inset-0 bg-primary/20 blur-3xl -z-10 scale-150 animate-pulse" />
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-glow">
          Welcome, {username}!
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto mb-8">
          Your AI-powered team is ready to help you build and validate your next big project.
        </p>
        <Button onClick={nextStep} size="lg" className="gap-2">
          Meet Your Team <ArrowRight className="w-5 h-5" />
        </Button>
      </motion.div>
    </OnboardingStep>,

    // Step 2: Meet the Team
    <OnboardingStep key="team">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-3 text-glow">
          Meet Your AI Team
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Each specialist brings unique insights to help your project succeed.
        </p>
        <TeamShowcase />
        <Button onClick={nextStep} size="lg" className="gap-2 mt-8">
          Start Building <ArrowRight className="w-5 h-5" />
        </Button>
      </motion.div>
    </OnboardingStep>,

    // Step 3: Create Project
    <OnboardingStep key="create">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-3 text-glow">
            Name Your Project
          </h2>
          <p className="text-muted-foreground">
            What are you building? We'll create your first strategy deck.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="projectName">Project Name</Label>
            <Input
              id="projectName"
              type="text"
              placeholder="My Game-Changing Idea"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              disabled={isLoading}
              autoFocus
              className="h-12 text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectDescription" className="flex items-center gap-2">
              Description <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Textarea
              id="projectDescription"
              placeholder="What problem does your project solve?"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              disabled={isLoading}
              rows={3}
              className="resize-none"
            />
          </div>

          <Button
            onClick={handleCreateProject}
            size="lg"
            className="w-full gap-2 mt-4"
            disabled={isLoading || !projectName.trim()}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Create & Start Building <ArrowRight className="w-5 h-5" />
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </OnboardingStep>,
  ];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted relative overflow-hidden"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => (
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

      {/* Skip button */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-20"
        onClick={handleSkip}
        disabled={isLoading}
      >
        Skip <X className="w-4 h-4 ml-1" />
      </Button>

      {/* Step content */}
      <div className="relative z-10 w-full max-w-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {steps[currentStep]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {[0, 1, 2].map((step) => (
          <button
            key={step}
            onClick={() => step < currentStep && setCurrentStep(step)}
            disabled={step > currentStep}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              step === currentStep
                ? "bg-primary w-8"
                : step < currentStep
                ? "bg-primary/50 hover:bg-primary/70 cursor-pointer"
                : "bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Onboarding;
