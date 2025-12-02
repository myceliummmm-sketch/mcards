import { TEAM_CHARACTERS } from '@/data/teamCharacters';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface CharacterSelectorProps {
  selectedCharacters: string[];
  onToggleCharacter: (characterId: string) => void;
  onStartMeeting: () => void;
}

export const CharacterSelector = ({
  selectedCharacters,
  onToggleCharacter,
  onStartMeeting,
}: CharacterSelectorProps) => {
  const characters = Object.values(TEAM_CHARACTERS);

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Select 2 or more team members for a group discussion
      </div>
      
      <div className="grid gap-2">
        {characters.map((character) => {
          const isSelected = selectedCharacters.includes(character.id);
          
          return (
            <button
              key={character.id}
              onClick={() => onToggleCharacter(character.id)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                isSelected 
                  ? "border-primary bg-primary/10" 
                  : "border-border hover:border-muted-foreground/50 hover:bg-muted/30"
              )}
            >
              <Checkbox 
                checked={isSelected}
                className="pointer-events-none"
              />
              <Avatar 
                className="h-10 w-10" 
                style={{ 
                  boxShadow: isSelected ? `0 0 0 2px ${character.color}` : 'none'
                }}
              >
                <AvatarImage src={character.avatar} alt={character.name} />
                <AvatarFallback style={{ backgroundColor: character.color }}>
                  {character.emoji}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{character.name}</span>
                  <span className="text-xs text-muted-foreground">{character.role}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {character.specialty}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <Button
        onClick={onStartMeeting}
        disabled={selectedCharacters.length < 2}
        className="w-full"
        size="lg"
      >
        {selectedCharacters.length < 2 
          ? `Select ${2 - selectedCharacters.length} more`
          : `Start Meeting (${selectedCharacters.length} members)`
        }
      </Button>
    </div>
  );
};
