import { TEAM_CHARACTERS, type TeamCharacter } from '@/data/teamCharacters';
import { CharacterCard } from './CharacterCard';

interface TeamPanelProps {
  activeCharacterId?: string;
}

export const TeamPanel = ({ activeCharacterId }: TeamPanelProps) => {
  const characters = Object.values(TEAM_CHARACTERS);

  return (
    <div className="w-80 p-6 bg-card/50 backdrop-blur-sm border-l border-border overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground mb-2">🤖 AI Team</h2>
        <p className="text-sm text-muted-foreground">
          Your squad of AI experts ready to help
        </p>
      </div>
      
      <div className="space-y-3">
        {characters.map((character) => (
          <CharacterCard
            key={character.id}
            character={character}
            isActive={character.id === activeCharacterId}
          />
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
        <div className="text-xs text-muted-foreground">
          <strong>💡 Pro Tip:</strong> Hover over cards to see which team member can help with that section!
        </div>
      </div>
    </div>
  );
};
