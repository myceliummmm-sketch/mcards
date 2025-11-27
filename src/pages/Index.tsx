import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Users } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full opacity-20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Hero section */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-8 relative">
            <Sparkles className="w-20 h-20 text-primary animate-pulse mx-auto" />
            <div className="absolute inset-0 w-20 h-20 bg-primary blur-2xl opacity-50 animate-pulse mx-auto" />
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 text-glow">
            Mycelium Cards
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Build your product vision with 22 powerful cards. 
            From concept to reality, one deck at a time.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="text-lg gap-2 hover:scale-105 transition-transform"
            >
              <Zap className="h-5 w-5" />
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/auth")}
              className="text-lg"
            >
              Sign In
            </Button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="p-6 rounded-lg bg-card/50 border border-border/50 backdrop-blur-sm card-shine hover:border-primary/50 transition-all">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-2">22 Card System</h3>
              <p className="text-muted-foreground">
                Structured framework covering Vision, Research, Build, and Grow phases
              </p>
            </div>

            <div className="p-6 rounded-lg bg-card/50 border border-border/50 backdrop-blur-sm card-shine hover:border-primary/50 transition-all">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4 mx-auto">
                <Users className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-2">AI Characters</h3>
              <p className="text-muted-foreground">
                Virtual team of 7 unique personas to guide your product journey
              </p>
            </div>

            <div className="p-6 rounded-lg bg-card/50 border border-border/50 backdrop-blur-sm card-shine hover:border-primary/50 transition-all">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4 mx-auto">
                <Zap className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-2">Smart Prompts</h3>
              <p className="text-muted-foreground">
                Generate powerful product prompts from your completed deck
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
