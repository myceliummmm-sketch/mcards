import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Share2, Activity } from 'lucide-react';
import { PhaseSection } from '@/components/deck-builder/PhaseSection';
import { TeamPanel } from '@/components/deck-builder/TeamPanel';
import { XPProgressBar } from '@/components/deck-builder/XPProgressBar';
import { CardEditor } from '@/components/deck-builder/CardEditor';
import { CollaboratorManager } from '@/components/deck-builder/review/CollaboratorManager';
import { DeckHealthDashboard } from '@/components/deck-builder/health/DeckHealthDashboard';
import { useDeckCards } from '@/hooks/useDeckCards';
import { getCardBySlot, CARD_DEFINITIONS } from '@/data/cardDefinitions';
import { motion } from 'framer-motion';
import type { Database } from '@/integrations/supabase/types';

type Deck = Database['public']['Tables']['decks']['Row'];

export default function DeckBuilder() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [healthDashboardOpen, setHealthDashboardOpen] = useState(false);
  const { cards, saveCard, getCardBySlot: getDeckCard, getFilledCardsCount } = useDeckCards(deckId || '');

  useEffect(() => {
    const fetchDeck = async () => {
      if (!deckId) return;

      const { data, error } = await supabase
        .from('decks')
        .select('*')
        .eq('id', deckId)
        .single();

      if (error) {
        console.error('Error fetching deck:', error);
        navigate('/dashboard');
        return;
      }

      setDeck(data);
      setLoading(false);
    };

    fetchDeck();
  }, [deckId, navigate]);

  const handleEditCard = (slot: number) => {
    setEditingSlot(slot);
  };

  const handleCloseEditor = () => {
    setEditingSlot(null);
  };

  const handleSaveCard = async (data: any, imageUrl?: string, evaluation?: any) => {
    if (!editingSlot) return;
    
    const cardDefinition = getCardBySlot(editingSlot);
    if (!cardDefinition) return;

    // Merge all data together
    const fullData = {
      ...data,
      ...(imageUrl && { card_image_url: imageUrl }),
      ...(evaluation && { evaluation })
    };

    await saveCard(editingSlot, cardDefinition.cardType, fullData);
  };

  const handleGeneratePrompt = () => {
    // TODO: Generate prompt in Sprint 4
    console.log('Generate prompt');
  };

  const editingCardDefinition = editingSlot ? getCardBySlot(editingSlot) : null;
  const editingCardData = editingSlot ? getDeckCard(editingSlot) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading deck...</p>
        </div>
      </div>
    );
  }

  if (!deck) return null;

  const filledCards = getFilledCardsCount();
  const totalCards = 22;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {/* Sticky header */}
        <motion.div 
          className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border shadow-lg"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 100 }}
        >
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/dashboard')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
                <div>
                  <h1 className="text-3xl font-display font-bold text-foreground">
                    {deck.title}
                  </h1>
                  {deck.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {deck.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2"
                  onClick={() => setHealthDashboardOpen(true)}
                >
                  <Activity className="w-4 h-4" />
                  Deck Health
                </Button>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="lg" className="gap-2">
                      <Share2 className="w-4 h-4" />
                      Share
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Share Deck</DialogTitle>
                    </DialogHeader>
                    {deckId && <CollaboratorManager deckId={deckId} />}
                  </DialogContent>
                </Dialog>

                <Button
                  size="lg"
                  onClick={handleGeneratePrompt}
                  disabled={filledCards < totalCards}
                  className="gap-2"
                >
                  <span>⚡</span>
                  Generate Prompt
                </Button>
              </div>
            </div>

            <XPProgressBar current={filledCards} total={totalCards} />
          </div>
        </motion.div>

        {/* Card phases */}
        <div className="container mx-auto px-6 py-8">
          <motion.div
            className="space-y-6"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.2 }
              }
            }}
          >
            <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}>
              <PhaseSection phase="vision" cards={cards} onEditCard={handleEditCard} />
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}>
              <PhaseSection phase="research" cards={cards} onEditCard={handleEditCard} />
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}>
              <PhaseSection phase="build" cards={cards} onEditCard={handleEditCard} />
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}>
              <PhaseSection phase="grow" cards={cards} onEditCard={handleEditCard} />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* AI Team sidebar */}
      <TeamPanel />

      {/* Card Editor Modal */}
      {editingCardDefinition && (
        <CardEditor
          isOpen={editingSlot !== null}
          onClose={handleCloseEditor}
          definition={editingCardDefinition}
          initialData={editingCardData?.card_data || {}}
          cardImageUrl={(editingCardData?.card_data as any)?.card_image_url}
          evaluation={(editingCardData?.card_data as any)?.evaluation}
          cardId={editingCardData?.id}
          onSave={handleSaveCard}
        />
      )}

      {/* Deck Health Dashboard */}
      {deckId && (
        <DeckHealthDashboard
          deckId={deckId}
          isOpen={healthDashboardOpen}
          onClose={() => setHealthDashboardOpen(false)}
        />
      )}
    </div>
  );
}
