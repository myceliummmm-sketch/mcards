import { Button } from '@/components/ui/button';
import type { CardDefinition } from '@/data/cardDefinitions';
import { getCharacterById } from '@/data/teamCharacters';

interface CardBackProps {
  definition: CardDefinition;
  content?: any;
  onEdit: () => void;
}

export const CardBack = ({ definition, content, onEdit }: CardBackProps) => {
  const character = getCharacterById(definition.aiHelper);

  return (
    <div className="w-full h-full p-6 flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <div className="text-sm font-bold text-muted-foreground mb-2">
          #{definition.slot} · {definition.title}
        </div>
        <p className="text-xs text-muted-foreground">
          {definition.description}
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
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border shrink-0"
              style={{
                borderColor: character.color,
                backgroundColor: `${character.color}20`,
                color: character.color
              }}
            >
              {character.name.charAt(0)}
            </div>
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

      {/* Edit button */}
      <Button
        onClick={onEdit}
        className="w-full"
        size="lg"
      >
        ✏️ Edit Card
      </Button>
    </div>
  );
};
