import { getAllCharacters } from '@/data/teamCharacters';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Lock, Crown } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface CharacterSelectorProps {
  selectedCharacters: string[];
  onToggleCharacter: (characterId: string) => void;
  onStartMeeting: () => void;
  canUseAdvisor?: (advisorId: string) => boolean;
}

export const CharacterSelector = ({
  selectedCharacters,
  onToggleCharacter,
  onStartMeeting,
  canUseAdvisor = () => true,
}: CharacterSelectorProps) => {
  const { t, language } = useTranslation();
  const characters = getAllCharacters(language);

  // Count only unlocked selected characters for the meeting
  const unlockedSelectedCount = selectedCharacters.filter(id => canUseAdvisor(id)).length;

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        {language === 'ru' 
          ? 'Выберите 2 или более членов команды для группового обсуждения'
          : 'Select 2 or more team members for a group discussion'}
      </div>
      
      <div className="grid gap-2">
        {characters.map((character) => {
          const isLocked = !canUseAdvisor(character.id);
          const isSelected = selectedCharacters.includes(character.id) && !isLocked;
          
          return (
            <button
              key={character.id}
              onClick={() => onToggleCharacter(character.id)}
              className={cn(
                "relative flex items-center gap-3 p-3 rounded-lg border transition-all text-left w-full overflow-hidden",
                isLocked
                  ? "border-border bg-muted/30 opacity-70"
                  : isSelected 
                    ? "border-primary bg-primary/10" 
                    : "border-border hover:border-muted-foreground/50 hover:bg-muted/30"
              )}
            >
              {isLocked ? (
                <div className="w-5 h-5 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                </div>
              ) : (
                <Checkbox 
                  checked={isSelected}
                  className="pointer-events-none"
                />
              )}
              <Avatar 
                className={cn("h-10 w-10", isLocked && "grayscale")}
                style={{ 
                  boxShadow: isSelected ? `0 0 0 2px ${character.color}` : 'none'
                }}
              >
                <AvatarImage src={character.avatar} alt={character.name} />
                <AvatarFallback style={{ backgroundColor: character.color }}>
                  {character.emoji}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn(
                    "font-medium text-sm whitespace-nowrap",
                    isLocked && "text-muted-foreground"
                  )}>
                    {character.name}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">{character.role}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {character.specialty}
                </p>
              </div>
              
              {isLocked && (
                <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs gap-1">
                  <Crown className="w-3 h-3" />
                  PRO
                </Badge>
              )}
            </button>
          );
        })}
      </div>

      <Button
        onClick={onStartMeeting}
        disabled={unlockedSelectedCount < 2}
        className="w-full"
        size="lg"
      >
        {unlockedSelectedCount < 2 
          ? (language === 'ru' 
              ? `Выберите ещё ${2 - unlockedSelectedCount}`
              : `Select ${2 - unlockedSelectedCount} more`)
          : (language === 'ru'
              ? `Начать встречу (${unlockedSelectedCount} участников)`
              : `Start Meeting (${unlockedSelectedCount} members)`)
        }
      </Button>
    </div>
  );
};
