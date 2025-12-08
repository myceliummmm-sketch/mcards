import { useState } from 'react';
import { TEAM_CHARACTERS } from '@/data/teamCharacters';
import { CharacterCard } from './CharacterCard';
import { CharacterSelector } from './chat/CharacterSelector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Users } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useTranslation } from '@/hooks/useTranslation';
import { UpgradeModal } from '@/components/paywall/UpgradeModal';
import aiTeamIcon from '@/assets/icons/ai-team.png';

interface TeamPanelProps {
  activeCharacterId?: string;
  onCharacterClick?: (characterId: string) => void;
  // Group chat props
  selectedGroupCharacters?: string[];
  onToggleGroupCharacter?: (characterId: string) => void;
  onStartGroupChat?: () => void;
}

export const TeamPanel = ({ 
  activeCharacterId, 
  onCharacterClick,
  selectedGroupCharacters = [],
  onToggleGroupCharacter,
  onStartGroupChat,
}: TeamPanelProps) => {
  const [mode, setMode] = useState<'single' | 'group'>('single');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { canUseAdvisor } = useSubscription();
  const { t } = useTranslation();
  const characters = Object.values(TEAM_CHARACTERS);

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

  return (
    <>
      <div className="w-80 p-6 bg-card/50 backdrop-blur-sm border-r border-border overflow-y-auto">
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
            <p className="text-sm text-muted-foreground mb-4">
              {t('deckBuilder.clickToChat')}
            </p>
            <div className="space-y-3">
              {characters.map((character) => (
                <CharacterCard
                  key={character.id}
                  character={character}
                  isActive={character.id === activeCharacterId}
                  isLocked={!canUseAdvisor(character.id)}
                  onClick={() => handleCharacterClick(character.id)}
                />
              ))}
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
