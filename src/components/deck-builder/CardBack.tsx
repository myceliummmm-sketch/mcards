import { Button } from '@/components/ui/button';
import type { CardDefinition } from '@/data/cardDefinitions';
import { getCharacterById } from '@/data/teamCharacters';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Sparkles } from 'lucide-react';

interface CardBackProps {
  definition: CardDefinition;
  content?: any;
  onEdit: () => void;
}

export const CardBack = ({ definition, content, onEdit }: CardBackProps) => {
  const character = getCharacterById(definition.aiHelpers[0]);

  return (
    <div className="w-full h-full p-6 flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <div className="text-sm font-bold text-muted-foreground mb-2">
          #{definition.slot} · {definition.title}
        </div>
        <p className="text-xs text-muted-foreground">
          {definition.coreQuestion}
        </p>
      </div>

      {/* Content preview or placeholder */}
      <div className="flex-1 overflow-y-auto mb-4">
        {content && Object.keys(content).length > 0 ? (
          <div className="space-y-2">
            {Object.entries(content).map(([key, value]) => (
              <div key={key} className="text-sm">
                <div className="font-medium text-foreground capitalize">
                  {key.replace(/_/g, ' ')}:
                </div>
                <div className="text-muted-foreground mt-1">
                  {String(value)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-sm text-muted-foreground">
              No content yet. Click Edit to fill this card.
            </p>
          </div>
        )}
      </div>

      {/* AI Helper tip */}
      {character && (
        <div className="mb-4 p-3 bg-muted/50 rounded-lg border border-border">
          <div className="flex items-start gap-2">
            <Avatar 
              className="w-6 h-6 border shrink-0" 
              style={{ borderColor: character.color }}
            >
              <AvatarImage src={character.avatar} alt={character.name} />
              <AvatarFallback style={{ backgroundColor: `${character.color}20`, color: character.color }}>
                {character.emoji}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="text-xs font-medium text-foreground mb-1">
                {character.name} says:
              </div>
              <div className="text-xs text-muted-foreground italic">
                "{character.signaturePhrases[Math.floor(Math.random() * character.signaturePhrases.length)]}"
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Craft Button */}
      <Button
        onClick={onEdit}
        className="w-full gap-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105"
        size="lg"
      >
        <Sparkles className="w-4 h-4" />
        ✨ Craft Card
      </Button>
    </div>
  );
};
