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

  const getPhaseEmoji = () => {
    const phase = definition.phase?.toLowerCase();
    if (phase === 'vision') return '🔮';
    if (phase === 'research') return '🔍';
    if (phase === 'build') return '🔧';
    if (phase === 'grow') return '🚀';
    return '📝';
  };

  const getEmptyGradient = () => {
    const phase = definition.phase?.toLowerCase();
    if (phase === 'vision') return 'card-empty-vision';
    if (phase === 'research') return 'card-empty-research';
    if (phase === 'build') return 'card-empty-build';
    if (phase === 'grow') return 'card-empty-grow';
    return 'card-empty-vision';
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background */}
      {content?.card_image_url ? (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-center blur-sm scale-110"
            style={{ backgroundImage: `url(${content.card_image_url})` }}
          />
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
        </>
      ) : (
        <div className={`absolute inset-0 ${getEmptyGradient()}`} />
      )}

      {/* Content */}
      <div className="relative w-full h-full p-6 flex flex-col">
        {/* Header */}
        <div className="glass-card px-3 py-1.5 rounded-lg flex items-center gap-2 mb-4 w-fit">
          <span className="text-base">{getPhaseEmoji()}</span>
          <span className="text-xs font-bold text-white uppercase tracking-wide">
            #{definition.slot} · {definition.title}
          </span>
        </div>

        <div className="glass-card p-3 rounded-xl mb-4">
          <p className="text-xs text-white/80 text-shadow">
            {definition.coreQuestion}
          </p>
        </div>

        {/* Content preview or placeholder */}
        <div className="flex-1 overflow-y-auto mb-4">
          {content && Object.keys(content).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(content)
                .filter(([key]) => !['id', 'deck_id', 'card_slot', 'card_type', 'card_image_url', 'is_insight', 'evaluation', 'created_at', 'updated_at', 'last_evaluated_at'].includes(key))
                .map(([key, value]) => (
                  <div key={key} className="glass-card p-3 rounded-lg">
                    <div className="text-xs font-semibold text-white/90 capitalize mb-1 text-shadow">
                      {key.replace(/_/g, ' ')}:
                    </div>
                    <div className="text-xs text-white/80 text-shadow">
                      {String(value)}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="glass-card p-8 rounded-xl text-center">
              <div className="text-4xl mb-3">📝</div>
              <p className="text-sm text-white/80 text-shadow">
                No content yet. Click below to craft this card.
              </p>
            </div>
          )}
        </div>

        {/* AI Helper tip */}
        {character && (
          <div className="glass-card p-3 rounded-lg mb-4">
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
                <div className="text-xs font-medium text-white mb-1 text-shadow">
                  {character.name} says:
                </div>
                <div className="text-xs text-white/80 italic text-shadow">
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
    </div>
  );
};