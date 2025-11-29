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
      {/* Full-bleed background: Crystal image (blurred) or gradient */}
      <div className="absolute inset-0">
        {content?.card_image_url ? (
          <img 
            src={content.card_image_url} 
            alt="Crystal specimen"
            className="w-full h-full object-cover blur-sm"
          />
        ) : (
          <div className={`w-full h-full ${getEmptyGradient()}`} />
        )}
      </div>

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content layer */}
      <div className="relative w-full h-full p-4 flex flex-col">
        {/* Header */}
        <div className="backdrop-blur-md bg-black/40 border border-white/20 rounded-lg px-4 py-2 mb-3 flex items-center gap-2">
          <span className="text-lg">{getPhaseEmoji()}</span>
          <span className="text-xs font-display font-bold text-white uppercase tracking-wider">
            #{definition.slot} · {definition.title}
          </span>
        </div>

        {/* Core question box */}
        <div className="backdrop-blur-md bg-black/50 border border-white/20 rounded-lg p-3 mb-3">
          <div className="text-[10px] font-mono text-white/60 uppercase tracking-wide mb-1">
            RESEARCH QUESTION
          </div>
          <p className="text-xs text-white italic">
            {definition.coreQuestion}
          </p>
        </div>

        {/* Content data or placeholder */}
        <div className="flex-1 overflow-y-auto mb-3 backdrop-blur-md bg-black/40 border border-white/10 rounded-lg p-3">
          {content && Object.keys(content).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(content)
                .filter(([key]) => !['id', 'deck_id', 'card_slot', 'card_type', 'card_image_url', 'is_insight', 'evaluation', 'created_at', 'updated_at', 'last_evaluated_at'].includes(key))
                .map(([key, value]) => (
                  <div key={key} className="bg-white/10 border border-white/20 rounded p-2">
                    <div className="text-[10px] text-white/70 uppercase mb-1 font-medium tracking-wider">
                      {key.replace(/_/g, ' ')}:
                    </div>
                    <div className="text-xs text-white">
                      {String(value)}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center">
              <div className="text-4xl mb-2 text-white/40">◆</div>
              <p className="text-xs text-white/60 font-mono">
                NO DATA RECORDED
              </p>
              <p className="text-xs text-white/50 mt-1">
                Click below to begin documentation
              </p>
            </div>
          )}
        </div>

        {/* AI Helper annotation */}
        {character && (
          <div className="backdrop-blur-md bg-blue-500/20 border border-blue-400/30 rounded-lg p-3 mb-3">
            <p className="text-xs text-blue-100 italic">
              ✎ Research note from {character.name}: "{character.signaturePhrases[Math.floor(Math.random() * character.signaturePhrases.length)]}"
            </p>
          </div>
        )}

        {/* Craft Button - synthwave accent */}
        <Button
          onClick={onEdit}
          className="w-full gap-2 bg-gradient-to-r from-[#FF6B9D] to-[#B388FF] hover:from-[#FF6B9D]/90 hover:to-[#B388FF]/90 text-white shadow-lg transition-all hover:scale-105 font-display uppercase tracking-wide text-sm"
          size="lg"
        >
          <Sparkles className="w-4 h-4" />
          Document Specimen
        </Button>
      </div>
    </div>
  );
};