import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getCharacterById } from '@/data/teamCharacters';

interface AIHelperHintProps {
  characterId: string;
  type?: 'encouraging' | 'challenging';
}

export const AIHelperHint = ({ characterId, type = 'encouraging' }: AIHelperHintProps) => {
  const character = getCharacterById(characterId);
  
  if (!character) return null;

  // Select random signature phrase
  const phrase = character.signaturePhrases[Math.floor(Math.random() * character.signaturePhrases.length)];

  return (
    <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-border">
      <div className="flex items-start gap-3">
        <Avatar 
          className="w-10 h-10 border-2 shrink-0" 
          style={{ borderColor: character.color }}
        >
          <AvatarImage src={character.avatar} alt={character.name} />
          <AvatarFallback style={{ backgroundColor: `${character.color}20`, color: character.color }}>
            {character.emoji}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="text-sm font-bold text-foreground mb-1">
            {character.name} - {character.role}
          </div>
          <div className="text-sm text-muted-foreground italic">
            "{phrase}"
          </div>
        </div>
      </div>
    </div>
  );
};
