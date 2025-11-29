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
    <div className="relative w-full h-full overflow-hidden field-guide-paper">
      <div className="relative w-full h-full p-4 flex flex-col">
        {/* Chrome beveled tab header */}
        <div className="chrome-tab px-4 py-2 rounded-t-lg mb-3 flex items-center gap-2">
          <span className="text-lg">{getPhaseEmoji()}</span>
          <span className="text-xs font-display font-bold text-slate-800 uppercase tracking-wider">
            #{definition.slot} · {definition.title}
          </span>
        </div>

        {/* Core question box */}
        <div className="bg-slate-900/5 border border-slate-700 rounded-lg p-3 mb-3">
          <div className="text-[10px] font-mono text-slate-600 uppercase tracking-wide mb-1">
            RESEARCH QUESTION
          </div>
          <p className="text-xs text-slate-800 italic">
            {definition.coreQuestion}
          </p>
        </div>

        {/* Content data or placeholder */}
        <div className="flex-1 overflow-y-auto mb-3">
          {content && Object.keys(content).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(content)
                .filter(([key]) => !['id', 'deck_id', 'card_slot', 'card_type', 'card_image_url', 'is_insight', 'evaluation', 'created_at', 'updated_at', 'last_evaluated_at'].includes(key))
                .map(([key, value]) => (
                  <div key={key} className="bg-slate-50 border border-slate-300 rounded p-2">
                    <div className="technical-data text-slate-600 uppercase mb-1">
                      {key.replace(/_/g, ' ')}:
                    </div>
                    <div className="text-xs text-slate-900">
                      {String(value)}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
              <div className="text-4xl mb-2 text-slate-400">◆</div>
              <p className="text-xs text-slate-600 font-mono">
                NO DATA RECORDED
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Click below to begin documentation
              </p>
            </div>
          )}
        </div>

        {/* AI Helper annotation */}
        {character && (
          <div className="handwritten text-xs text-blue-700 mb-3 pl-3 border-l-2 border-blue-400">
            ✎ Research note from {character.name}: "{character.signaturePhrases[Math.floor(Math.random() * character.signaturePhrases.length)]}"
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

        {/* Page number */}
        <div className="page-number text-right mt-3">
          {definition.slot}/22
        </div>
      </div>
    </div>
  );
};