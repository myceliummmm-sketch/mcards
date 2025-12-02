import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, LogOut, Loader2, Sparkles } from "lucide-react";
import { DeckCard } from "@/components/DeckCard";
import { CreateDeckDialog } from "@/components/CreateDeckDialog";
import { SporeWallet } from "@/components/paywall/SporeWallet";
import { SubscriptionBadge } from "@/components/paywall/SubscriptionBadge";
import { UpgradeModal } from "@/components/paywall/UpgradeModal";
import { useSubscription } from "@/hooks/useSubscription";

interface Deck {
  id: string;
  title: string;
  description: string | null;
  theme: string | null;
  created_at: string;
  card_count: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [username, setUsername] = useState("");
  const { projectLimit, isPro } = useSubscription();

  useEffect(() => {
    checkAuth();
    fetchDecks();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    // Fetch username
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", session.user.id)
      .single();

    if (profile) {
      setUsername(profile.username || session.user.email?.split("@")[0] || "User");
    }
  };

  const fetchDecks = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Fetch decks with card count
      const { data: decksData, error } = await supabase
        .from("decks")
        .select(`
          id,
          title,
          description,
          theme,
          created_at,
          deck_cards(count)
        `)
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedDecks = decksData.map((deck: any) => ({
        ...deck,
        card_count: deck.deck_cards[0]?.count || 0,
      }));

      setDecks(formattedDecks);
    } catch (error: any) {
      toast({
        title: "Error loading decks",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleDeckCreated = () => {
    fetchDecks();
    setIsCreateDialogOpen(false);
  };

  const handleDeleteDeck = async (deckId: string) => {
    try {
      const { error } = await supabase
        .from("decks")
        .delete()
        .eq("id", deckId);

      if (error) throw error;

      toast({
        title: "Deck deleted",
        description: "Your deck has been removed.",
      });

      fetchDecks();
    } catch (error: any) {
      toast({
        title: "Error deleting deck",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-card/50 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-glow">Mycelium Cards</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {username}!</p>
          </div>
          <div className="flex items-center gap-3">
            <SporeWallet />
            <SubscriptionBadge />
            <Button variant="outline" onClick={() => navigate('/marketplace')}>
              🛒 Marketplace
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-display font-bold mb-2">My Decks</h2>
            <p className="text-muted-foreground">
              {decks.length}/{projectLimit} decks used
              {!isPro && decks.length >= projectLimit && (
                <span className="text-primary ml-2">• Upgrade for more</span>
              )}
            </p>
          </div>
          {decks.length >= projectLimit && !isPro ? (
            <Button onClick={() => setIsUpgradeModalOpen(true)} className="gap-2">
              <Sparkles className="h-5 w-5" />
              Upgrade to Create More
            </Button>
          ) : (
            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
              <Plus className="h-5 w-5" />
              New Deck
            </Button>
          )}
        </div>

        {/* Decks grid */}
        {decks.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-block p-6 rounded-full bg-muted/50 mb-4">
              <Plus className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-display font-semibold mb-2">No decks yet</h3>
            <p className="text-muted-foreground mb-6">Create your first deck to get started</p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
              <Plus className="h-5 w-5" />
              Create Your First Deck
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.map((deck) => (
              <DeckCard
                key={deck.id}
                deck={deck}
                onDelete={handleDeleteDeck}
              />
            ))}
          </div>
        )}
      </main>

      <CreateDeckDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onDeckCreated={handleDeckCreated}
      />

      <UpgradeModal
        open={isUpgradeModalOpen}
        onOpenChange={setIsUpgradeModalOpen}
      />
    </div>
  );
};

export default Dashboard;
