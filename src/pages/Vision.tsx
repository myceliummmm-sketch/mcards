import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Vision = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("Connecting to Syndicate...");

  useEffect(() => {
    const initVisionFlow = async () => {
      try {
        const tg = window.Telegram?.WebApp;
        if (tg) {
          tg.ready();
          tg.expand();
        }

        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          localStorage.setItem("post_auth_redirect", "/vision" + window.location.search);
          setStatus("Redirecting to login...");
          navigate("/auth");
          return;
        }

        setStatus("Finding your deck...");

        const { data: existingDecks } = await supabase
          .from("decks")
          .select("id, title")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(1);

        let deckId: string;

        if (existingDecks && existingDecks.length > 0) {
          deckId = existingDecks[0].id;
          setStatus("Opening your deck...");
        } else {
          setStatus("Creating your Vision deck...");
          const blocker = searchParams.get("blocker") || "unknown";

          const { data: newDeck, error } = await supabase
            .from("decks")
            .insert({
              title: "My Vision",
              description: `Created from Telegram. Blocker: ${blocker}`,
              user_id: session.user.id,
            })
            .select()
            .single();

          if (error) throw error;
          deckId = newDeck.id;

          await supabase
            .from("profiles")
            .update({ onboarding_completed: true, onboarding_step: "vision_started" })
            .eq("id", session.user.id);
        }

        setStatus("Opening Vision Card...");
        navigate(`/deck/${deckId}?slot=5`);

      } catch (error: any) {
        console.error("Vision flow error:", error);
        setStatus(`Error: ${error.message}`);
        setTimeout(() => navigate("/dashboard"), 2000);
      }
    };

    initVisionFlow();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
        <p className="text-lg text-muted-foreground">{status}</p>
      </div>
    </div>
  );
};

export default Vision;
