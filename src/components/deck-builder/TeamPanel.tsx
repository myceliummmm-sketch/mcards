import { useState, useEffect } from 'react';
import { TEAM_CHARACTERS } from '@/data/teamCharacters';
import { CharacterCard } from './CharacterCard';
import { CharacterSelector } from './chat/CharacterSelector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Users, Sparkles, Check, Loader2, Clock } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useTranslation } from '@/hooks/useTranslation';
import { UpgradeModal } from '@/components/paywall/UpgradeModal';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import aiTeamIcon from '@/assets/icons/ai-team.png';
import type { Database } from '@/integrations/supabase/types';

type DeckCard = Database['public']['Tables']['deck_cards']['Row'];

interface CardProgress {
  slot: number;
  title: string;
  status: 'pending' | 'generating' | 'complete';
  characterId?: string;
}

interface TeamPanelProps {
  activeCharacterId?: string;
  onCharacterClick?: (characterId: string) => void;
  // Group chat props
  selectedGroupCharacters?: string[];
  onToggleGroupCharacter?: (characterId: string) => void;
  onStartGroupChat?: () => void;
  // Context props
  currentPhase?: string;
  filledCards?: number;
  totalCards?: number;
  cards?: DeckCard[];
  // Auto-complete progress
  autoCompleteActive?: boolean;
  autoCompleteProgress?: CardProgress[];
  autoCompleteComplete?: boolean;
  onDismissAutoComplete?: () => void;
}

export const TeamPanel = ({ 
  activeCharacterId, 
  onCharacterClick,
  selectedGroupCharacters = [],
  onToggleGroupCharacter,
  onStartGroupChat,
  currentPhase = 'idea',
  filledCards = 0,
  totalCards = 22,
  cards = [],
  autoCompleteActive = false,
  autoCompleteProgress = [],
  autoCompleteComplete = false,
  onDismissAutoComplete,
}: TeamPanelProps) => {
  const [mode, setMode] = useState<'single' | 'group'>('single');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [hiddenCompletedCards, setHiddenCompletedCards] = useState<Set<number>>(new Set());
  const { canUseAdvisor } = useSubscription();
  const { t } = useTranslation();
  const characters = Object.values(TEAM_CHARACTERS);

  // Auto-hide completed badges after 2 seconds
  useEffect(() => {
    autoCompleteProgress.forEach((card) => {
      if (card.status === 'complete' && !hiddenCompletedCards.has(card.slot)) {
        const timer = setTimeout(() => {
          setHiddenCompletedCards(prev => new Set([...prev, card.slot]));
        }, 2000);
        return () => clearTimeout(timer);
      }
    });
  }, [autoCompleteProgress, hiddenCompletedCards]);

  const handleCharacterClick = (characterId: string) => {
    if (!canUseAdvisor(characterId)) {
      setShowUpgradeModal(true);
      return;
    }
    onCharacterClick?.(characterId);
  };

  const handleToggleGroupCharacter = (characterId: string) => {
    if (!canUseAdvisor(characterId)) {
      setShowUpgradeModal(true);
      return;
    }
    onToggleGroupCharacter?.(characterId);
  };

  const completedCount = autoCompleteProgress.filter(p => p.status === 'complete').length;
  const totalCount = autoCompleteProgress.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const getStatusIcon = (status: CardProgress['status']) => {
    switch (status) {
      case 'complete':
        return <Check className="w-4 h-4 text-green-400" />;
      case 'generating':
        return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getCharacterAvatar = (characterId?: string) => {
    if (!characterId) return null;
    const char = TEAM_CHARACTERS[characterId as keyof typeof TEAM_CHARACTERS];
    return char?.avatar;
  };

  // Get stage label for display
  const getStageLabel = (stage?: string) => {
    switch (stage) {
      case 'content': return '📝 Пишу контент...';
      case 'image': return '🎨 Создаю картинку...';
      case 'evaluation': return '⭐ Оцениваю...';
      default: return 'Генерация...';
    }
  };

  return (
    <>
      <div className="w-80 p-6 bg-card/50 backdrop-blur-sm border-r border-border overflow-y-auto overflow-x-hidden">

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <img src={aiTeamIcon} alt="AI Team" className="w-8 h-8 object-contain" />
            <h2 className="text-xl font-bold text-foreground">{t('deckBuilder.aiTeam')}</h2>
          </div>
        </div>

        <Tabs value={mode} onValueChange={(v) => setMode(v as 'single' | 'group')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="single" className="gap-1.5 text-xs">
              <MessageCircle className="w-3.5 h-3.5" />
              {t('deckBuilder.singleChat')}
            </TabsTrigger>
            <TabsTrigger value="group" className="gap-1.5 text-xs">
              <Users className="w-3.5 h-3.5" />
              {t('deckBuilder.teamMeeting')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="mt-0">
            {/* Auto-Complete status message - компактно */}
            <AnimatePresence>
              {autoCompleteActive && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-3 p-3 bg-gradient-to-r from-primary/20 to-accent/10 border border-primary/30 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      <Sparkles className="w-4 h-4 text-primary" />
                    </motion.div>
                    <span className="text-sm font-medium text-foreground flex-1">
                      {autoCompleteComplete ? '🎉 Карточки готовы!' : '🧠 Команда брейнштормит...'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {completedCount}/{totalCount}
                    </span>
                  </div>
                  <Progress value={progressPercent} className="h-1 mt-2" />
                  
                  {autoCompleteComplete && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={onDismissAutoComplete}
                      className="w-full mt-2 py-1.5 bg-primary/20 text-primary rounded-md text-xs font-medium hover:bg-primary/30 transition-colors"
                    >
                      ✨ Супер!
                    </motion.button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <p className="text-sm text-muted-foreground mb-4">
              {autoCompleteActive ? 'Смотри кто сейчас работает:' : t('deckBuilder.clickToChat')}
            </p>
            <div className="space-y-3 overflow-hidden">
              {characters.map((character) => {
                // Check if this character is currently working
                const workingCard = autoCompleteProgress.find(
                  p => p.characterId === character.id && p.status === 'generating'
                );
                const completedCard = autoCompleteProgress.find(
                  p => p.characterId === character.id && p.status === 'complete'
                );
                const pendingCard = autoCompleteProgress.find(
                  p => p.characterId === character.id && p.status === 'pending'
                );

                return (
                  <motion.div
                    key={character.id}
                    animate={workingCard ? { 
                      boxShadow: ['0 0 0 0 hsl(var(--primary)/0.4)', '0 0 15px 3px hsl(var(--primary)/0.6)', '0 0 0 0 hsl(var(--primary)/0.4)']
                    } : {}}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="relative"
                  >
                    <CharacterCard
                      character={character}
                      isActive={character.id === activeCharacterId || !!workingCard}
                      isLocked={!canUseAdvisor(character.id)}
                      onClick={() => handleCharacterClick(character.id)}
                    />
                    {/* Working indicator */}
                    {workingCard && (
                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="absolute -right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-primary text-primary-foreground px-2 py-1 rounded-full text-[10px] font-medium"
                      >
                        <Loader2 className="w-3 h-3 animate-spin" />
                        {workingCard.title}
                      </motion.div>
                    )}
                    {/* Completed indicator - fades out after 2 seconds */}
                    <AnimatePresence>
                      {completedCard && !workingCard && !hiddenCompletedCards.has(completedCard.slot) && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="absolute -right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-full text-[10px] font-medium"
                        >
                          <Check className="w-3 h-3" />
                          Done
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {/* Pending indicator */}
                    {pendingCard && !workingCard && !completedCard && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        className="absolute -right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-muted text-muted-foreground px-2 py-1 rounded-full text-[10px]"
                      >
                        <Clock className="w-3 h-3" />
                        Ждёт
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="group" className="mt-0">
            <CharacterSelector
              selectedCharacters={selectedGroupCharacters}
              onToggleCharacter={handleToggleGroupCharacter}
              onStartMeeting={onStartGroupChat || (() => {})}
              canUseAdvisor={canUseAdvisor}
            />
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
          <div className="text-xs text-muted-foreground">
            <strong>💡 {t('deckBuilder.proTip')}</strong> {mode === 'single' 
              ? t('deckBuilder.proTipSingle')
              : t('deckBuilder.proTipGroup')}
          </div>
        </div>
      </div>

      <UpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />
    </>
  );
};
