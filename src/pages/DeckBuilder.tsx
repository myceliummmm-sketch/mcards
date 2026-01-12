import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Share2, Activity, Settings, Pencil, Check, X } from 'lucide-react';
import { PhaseSection } from '@/components/deck-builder/PhaseSection';
import { ResearchPhaseSection } from '@/components/deck-builder/research/ResearchPhaseSection';
import { BuildPhaseSection } from '@/components/deck-builder/build/BuildPhaseSection';
import { TeamPanel } from '@/components/deck-builder/TeamPanel';
import { XPProgressBar } from '@/components/deck-builder/XPProgressBar';
import { CardEditor } from '@/components/deck-builder/CardEditor';
import { CollaboratorManager } from '@/components/deck-builder/review/CollaboratorManager';
import { DeckHealthDashboard } from '@/components/deck-builder/health/DeckHealthDashboard';
import { TeamChatDrawer } from '@/components/deck-builder/chat/TeamChatDrawer';
import { GroupChatDrawer } from '@/components/deck-builder/chat/GroupChatDrawer';
import { InsightsSection } from '@/components/deck-builder/InsightsSection';
import { MobileDeckFlow } from '@/components/mobile/MobileDeckFlow';
import { useIsMobile } from '@/hooks/use-mobile';

import { SporeWallet } from '@/components/paywall/SporeWallet';
import { SubscriptionBadge } from '@/components/paywall/SubscriptionBadge';
import { useDeckCards } from '@/hooks/useDeckCards';
import { useTeamChat } from '@/hooks/useTeamChat';
import { useGroupChat } from '@/hooks/useGroupChat';
import { useSubscription } from '@/hooks/useSubscription';
import { useTranslation } from '@/hooks/useTranslation';
import { getCardBySlot, CARD_DEFINITIONS } from '@/data/cardDefinitions';
import { motion } from 'framer-motion';
import type { Database } from '@/integrations/supabase/types';
import { useAutoCompleteVision } from '@/hooks/useAutoCompleteVision';
import { toast } from 'sonner';
import { isValidCardSlot, type CardSlot } from '@/types/cardData';

type Deck = Database['public']['Tables']['decks']['Row'];

export default function DeckBuilder() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, language } = useTranslation();
  const isMobile = useIsMobile();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [healthDashboardOpen, setHealthDashboardOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [aiGeneratingSlots, setAiGeneratingSlots] = useState<number[]>([]);
  const { cards, saveCard, getCardBySlot: getDeckCard, getFilledCardsCount, refetch: refetchCards, updateCardImage } = useDeckCards(deckId || '');
  const { canAccessPhase, sporeBalance, refetch: refetchSubscription } = useSubscription();
  const { isActive: autoCompleteActive, isComplete: autoCompleteIsComplete, cardProgress, startAutoComplete, dismiss: dismissAutoComplete } = useAutoCompleteVision(deckId || '', refetchCards);
  
  // Team chat hook (single character)
  const {
    activeCharacter,
    messages: chatMessages,
    isStreaming: isChatStreaming,
    isOpen: isChatOpen,
    isCrystallizing: isChatCrystallizing,
    expandingMessageId: chatExpandingMessageId,
    openChat,
    closeChat,
    sendMessage: sendChatMessage,
    expandMessage: expandChatMessage,
    crystallizeConversation: crystallizeChatConversation,
  } = useTeamChat({ deckId: deckId || '', cards });

  // Group chat hook (multiple characters)
  const {
    selectedCharacters: groupSelectedCharacters,
    messages: groupMessages,
    isStreaming: isGroupStreaming,
    currentResponder,
    isOpen: isGroupChatOpen,
    isCrystallizing: isGroupCrystallizing,
    expandingMessageId: groupExpandingMessageId,
    toggleCharacter: toggleGroupCharacter,
    addCharacter: addGroupCharacter,
    removeCharacter: removeGroupCharacter,
    openGroupChat,
    closeGroupChat,
    sendMessage: sendGroupMessage,
    crystallizeConversation: crystallizeGroupConversation,
    expandMessage: expandGroupMessage,
  } = useGroupChat({ deckId: deckId || '', cards });

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

  // Handle ?slot=N query parameter from Vision flow - restore on page refresh
  useEffect(() => {
    if (!loading && deck) {
      const slotParam = searchParams.get('slot');
      // Only set editingSlot if not already set (prevents resetting on re-renders)
      if (slotParam && editingSlot === null) {
        const slot = parseInt(slotParam, 10);
        if (isValidCardSlot(slot)) {
          setEditingSlot(slot);
          // Don't delete the param immediately - keep it for potential refresh
        }
      }
    }
  }, [loading, deck, searchParams, editingSlot]);

  const handleEditCard = (slot: number) => {
    setEditingSlot(slot);
    // Add slot to URL so it persists on refresh
    setSearchParams({ slot: slot.toString() }, { replace: true });
  };

  const handleCloseEditor = () => {
    setEditingSlot(null);
    // Remove slot from URL when closing editor
    searchParams.delete('slot');
    setSearchParams(searchParams, { replace: true });
  };

  const handleSaveCard = async (data: any, imageUrl?: string, evaluation?: any, silent?: boolean) => {
    if (!editingSlot) return;
    
    const cardDefinition = getCardBySlot(editingSlot);
    if (!cardDefinition) return;

    // Validate slot before saving
    if (!isValidCardSlot(editingSlot)) return;
    
    // Save card data to dedicated columns (not nested in card_data)
    // Pass silent flag to prevent duplicate toasts when CardEditor handles its own
    await saveCard(editingSlot as CardSlot, cardDefinition.cardType, data, imageUrl, evaluation, silent);
  };

  const handleSaveTitle = async () => {
    if (!deck || !editedTitle.trim()) return;
    
    const { error } = await supabase
      .from('decks')
      .update({ title: editedTitle.trim() })
      .eq('id', deck.id);
    
    if (error) {
      toast.error('Ошибка сохранения');
      return;
    }
    
    setDeck({ ...deck, title: editedTitle.trim() });
    setIsEditingTitle(false);
    toast.success('Название обновлено');
  };

  const handleCancelEdit = () => {
    setEditedTitle(deck?.title || '');
    setIsEditingTitle(false);
  };

  const handleStartEdit = () => {
    setEditedTitle(deck?.title || '');
    setIsEditingTitle(true);
  };

  // AI single card auto-complete - uses existing auto-complete-vision with singleSlot parameter
  const handleAISingleCard = async (slot: number) => {
    console.log('🎯 handleAISingleCard called for slot:', slot);

    if (!deckId || aiGeneratingSlots.includes(slot)) {
      console.log('❌ Blocked: deckId missing or slot already generating');
      return;
    }

    // Check if card 1 is filled (required for context)
    const card1 = cards.find(c => c.card_slot === 1);
    if (!card1?.card_data || Object.keys(card1.card_data as object).length === 0) {
      toast.error(language === 'ru' ? 'Сначала заполните карточку #1' : 'Please fill card #1 first');
      return;
    }

    if (sporeBalance < 10) {
      toast.error(t('autoComplete.notEnoughSpores'));
      return;
    }

    setAiGeneratingSlots(prev => [...prev, slot]);
    toast.info(`✨ AI генерирует карточку #${slot}...`);

    try {
      // Call auto-complete-vision with singleSlot parameter
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auto-complete-vision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          deckId,
          singleSlot: slot,
          language
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate');
      }

      // Handle SSE stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

          for (const line of lines) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'complete' && data.slot === slot) {
                await refetchCards();
                await refetchSubscription();
                toast.success(`✅ Карточка #${slot} сгенерирована!`);
              } else if (data.type === 'error') {
                throw new Error(data.error || 'Generation failed');
              }
            } catch (parseError) {
              // Skip non-JSON lines
            }
          }
        }
      }
    } catch (error) {
      console.error('AI single card error:', error);
      toast.error(error instanceof Error ? error.message : 'Ошибка генерации');
    } finally {
      setAiGeneratingSlots(prev => prev.filter(s => s !== slot));
    }
  };

  const editingCardDefinition = editingSlot ? getCardBySlot(editingSlot) : null;
  const editingCardData = editingSlot ? getDeckCard(editingSlot) : null;

  const filledCards = getFilledCardsCount();
  const totalCards = 20; // Fixed: 5 Vision + 5 Research + 5 Build + 5 Grow = 20 cards


  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('deckBuilder.loadingDeck')}</p>
        </div>
      </div>
    );
  }

  if (!deck) return null;

  // Функция для обновления данных карты
  const handleMobileCardUpdate = async (cardId: string, data: Record<string, any>) => {
    const card = cards.find(c => c.id === cardId);
    if (!card || !isValidCardSlot(card.card_slot)) return;
    await saveCard(card.card_slot as CardSlot, card.card_type, data);
  };

  // Функция для ковки карты (мобильная версия)
  const handleMobileForgeCard = async (cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;
    // Trigger forge via existing mechanism
    setEditingSlot(card.card_slot);
  };

  // Функция для переименования колоды
  const handleRenameDeck = async (newTitle: string) => {
    const { error } = await supabase
      .from('decks')
      .update({ title: newTitle })
      .eq('id', deck.id);

    if (!error) {
      setDeck({ ...deck, title: newTitle });
    }
  };

  // Mobile version
  if (isMobile) {
    return (
      <MobileDeckFlow
        deckId={deck.id}
        deckTitle={deck.title}
        cards={cards}
        onCardUpdate={handleMobileCardUpdate}
        onForgeCard={handleMobileForgeCard}
        onRenameDeck={handleRenameDeck}
        onRefetchCards={refetchCards}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* AI Team sidebar - Left side for collaborative feel */}
      <TeamPanel 
        activeCharacterId={activeCharacter || undefined}
        onCharacterClick={openChat}
        selectedGroupCharacters={groupSelectedCharacters}
        onToggleGroupCharacter={toggleGroupCharacter}
        onStartGroupChat={openGroupChat}
        currentPhase={filledCards < 5 ? 'idea' : filledCards < 11 ? 'research' : filledCards < 17 ? 'build' : filledCards < 22 ? 'grow' : 'pivot'}
        filledCards={filledCards}
        totalCards={totalCards}
        cards={cards}
        autoCompleteActive={autoCompleteActive}
        autoCompleteProgress={cardProgress}
        autoCompleteComplete={autoCompleteIsComplete}
        onDismissAutoComplete={dismissAutoComplete}
      />

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
                  {t('deckBuilder.backToDashboard')}
                </Button>
                <div>
                  {isEditingTitle ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="text-2xl font-display font-bold h-10 w-64"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveTitle();
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                      />
                      <Button size="icon" variant="ghost" onClick={handleSaveTitle}>
                        <Check className="w-4 h-4 text-green-500" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={handleCancelEdit}>
                        <X className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group">
                      <h1 className="text-3xl font-display font-bold text-foreground">
                        {deck.title}
                      </h1>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={handleStartEdit}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  {deck.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {deck.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <SporeWallet />
                <SubscriptionBadge />
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/settings')}
                >
                  <Settings className="w-5 h-5" />
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2"
                  onClick={() => setHealthDashboardOpen(true)}
                >
                  <Activity className="w-4 h-4" />
                  {t('deckBuilder.deckHealth')}
                </Button>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="lg" className="gap-2">
                      <Share2 className="w-4 h-4" />
                      {t('common.share')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{t('deckBuilder.shareDeck')}</DialogTitle>
                    </DialogHeader>
                    {deckId && <CollaboratorManager deckId={deckId} />}
                  </DialogContent>
                </Dialog>
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
              <PhaseSection
                phase="idea"
                cards={cards}
                onEditCard={handleEditCard}
                deckId={deckId || ''}
                onAutoComplete={() => {
                  const card1 = cards.find(c => c.card_slot === 1);
                  if (card1?.card_data) startAutoComplete(card1.card_data as Record<string, any>);
                }}
                sporeBalance={sporeBalance}
                generatingSlots={[...cardProgress.filter(p => p.status === 'generating').map(p => p.slot), ...aiGeneratingSlots]}
                onUpdateCardImage={updateCardImage}
                onAISingleCard={handleAISingleCard}
              />
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}>
              <ResearchPhaseSection deckId={deckId || ''} visionCards={cards.filter(c => c.card_slot >= 1 && c.card_slot <= 5)} onRefresh={refetchCards} />
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}>
              <BuildPhaseSection 
                deckId={deckId || ''}
                cards={cards} 
                onEditCard={handleEditCard}
                onRefresh={refetchCards}
                locked={!canAccessPhase('build')}
                visionCards={cards.filter(c => c.card_slot >= 1 && c.card_slot <= 5)}
                researchCards={cards.filter(c => c.card_slot >= 6 && c.card_slot <= 10)}
              />
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}>
              <PhaseSection
                phase="grow"
                cards={cards}
                onEditCard={handleEditCard}
                deckId={deckId || ''}
                locked={!canAccessPhase('grow')}
                sporeBalance={sporeBalance}
                generatingSlots={aiGeneratingSlots}
                onAISingleCard={handleAISingleCard}
              />
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}>
              <PhaseSection
                phase="pivot"
                cards={cards}
                onEditCard={handleEditCard}
                deckId={deckId || ''}
                locked={!canAccessPhase('pivot')}
                sporeBalance={sporeBalance}
                generatingSlots={aiGeneratingSlots}
                onAISingleCard={handleAISingleCard}
              />
            </motion.div>
            
            {/* Crystallized Insights Section */}
            <motion.div variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}>
              <InsightsSection deckId={deckId || ''} />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Single Character Chat Drawer */}
      <TeamChatDrawer
        isOpen={isChatOpen}
        onClose={closeChat}
        characterId={activeCharacter}
        messages={chatMessages}
        isStreaming={isChatStreaming}
        onSendMessage={sendChatMessage}
        onCrystallize={crystallizeChatConversation}
        isCrystallizing={isChatCrystallizing}
        onExpandMessage={expandChatMessage}
        expandingMessageId={chatExpandingMessageId}
      />

      {/* Group Chat Drawer */}
      <GroupChatDrawer
        isOpen={isGroupChatOpen}
        onClose={closeGroupChat}
        selectedCharacters={groupSelectedCharacters}
        messages={groupMessages}
        isStreaming={isGroupStreaming}
        currentResponder={currentResponder}
        onSendMessage={sendGroupMessage}
        onAddCharacter={addGroupCharacter}
        onRemoveCharacter={removeGroupCharacter}
        onCrystallize={crystallizeGroupConversation}
        isCrystallizing={isGroupCrystallizing}
        onExpandMessage={expandGroupMessage}
        expandingMessageId={groupExpandingMessageId}
      />

      {/* Card Editor Modal */}
      {editingCardDefinition && (
        <CardEditor
          isOpen={editingSlot !== null}
          onClose={handleCloseEditor}
          definition={editingCardDefinition}
          initialData={editingCardData?.card_data || {}}
          cardImageUrl={editingCardData?.card_image_url || undefined}
          evaluation={editingCardData?.evaluation || undefined}
          cardId={editingCardData?.id}
          onSave={handleSaveCard}
          deckId={deckId}
        />
      )}

      {/* Deck Health Dashboard */}
      {deckId && (
        <DeckHealthDashboard
          deckId={deckId}
          cards={cards}
          isOpen={healthDashboardOpen}
          onClose={() => setHealthDashboardOpen(false)}
        />
      )}


    </div>
  );
}
