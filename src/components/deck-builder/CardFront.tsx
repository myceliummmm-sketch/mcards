import { motion } from 'framer-motion';
import type { CardDefinition } from '@/data/cardDefinitions';
import { getCharacterById } from '@/data/teamCharacters';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface CardFrontProps {
  definition: CardDefinition;
  isEmpty: boolean;
  isComplete: boolean;
  isInsight: boolean;
  preview?: string;
  imageUrl?: string;
}

export const CardFront = ({ 
  definition, 
  isEmpty, 
  isComplete, 
  isInsight,
  preview,
  imageUrl
}: CardFrontProps) => {
  const character = getCharacterById(definition.aiHelpers[0]);
  
  const getStatusIcon = () => {
    if (isInsight) return '🔷';
    if (isComplete) return '✅';
    if (preview) return '🟡';
    return '⭕';
  };

  const getStatusLabel = () => {
    if (isInsight) return 'Insight';
    if (isComplete) return 'Complete';
    if (preview) return 'In Progress';
    return 'Empty';
  };

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
      {/* Specimen frame with crystal or empty state */}
      <div className="relative w-full h-full p-4 flex flex-col">
        {/* Chrome beveled tab header */}
        <div className="chrome-tab px-4 py-2 rounded-t-lg mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getPhaseEmoji()}</span>
            <span className="text-xs font-display font-bold text-slate-800 uppercase tracking-wider">
              #{definition.slot} · {definition.phase}
            </span>
          </div>
          
          {/* Status stamp */}
          <div className={`cert-stamp text-[10px] px-2 py-1 ${
            isInsight ? 'stamp-classified' :
            isComplete ? 'stamp-verified' :
            'stamp-draft'
          }`}>
            {getStatusLabel()}
          </div>
        </div>

        {/* Title card with technical styling */}
        <div className="bg-slate-900/5 border-2 border-slate-700 rounded-lg p-3 mb-3">
          <h3 className="text-base font-display font-bold text-slate-900 mb-1">
            {definition.title}
          </h3>
          <p className="text-xs text-slate-600 italic">
            {definition.coreQuestion}
          </p>
        </div>

        {/* Crystal specimen frame */}
        <div className="flex-1 relative mb-3">
          <div className="specimen-frame w-full h-full rounded-lg overflow-hidden bg-slate-100">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt="Crystal specimen diagram"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`w-full h-full ${getEmptyGradient()} flex items-center justify-center`}>
                <div className="text-center text-slate-400">
                  <div className="text-4xl mb-2">◆</div>
                  <div className="text-xs font-mono">SPECIMEN PENDING</div>
                </div>
              </div>
            )}
          </div>
          
          {/* Figure label */}
          <div className="absolute -top-2 left-4 bg-field-guide-paper px-2">
            <span className="text-[10px] font-mono text-slate-600">FIG. {definition.slot}</span>
          </div>
        </div>

        {/* Preview content annotation (if any) */}
        {preview && (
          <div className="handwritten text-xs text-blue-700 mb-3 pl-2 border-l-2 border-blue-300">
            ✎ {preview.substring(0, 80)}...
          </div>
        )}

        {/* AI Character badge - technical style */}
        {character && (
          <div className="flex items-center gap-2 bg-slate-900/5 border border-slate-300 rounded px-3 py-2 mb-3">
            <Avatar 
              className="w-7 h-7 border-2" 
              style={{ borderColor: character.color }}
            >
              <AvatarImage src={character.avatar} alt={character.name} />
              <AvatarFallback style={{ backgroundColor: `${character.color}20`, color: character.color }}>
                {character.emoji}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-mono text-slate-600 uppercase tracking-wide">
                AI RESEARCHER
              </div>
              <div className="text-xs font-medium text-slate-900 truncate">
                {character.name}
              </div>
            </div>
          </div>
        )}

        {/* Page number */}
        <div className="page-number text-right">
          {definition.slot}/22
        </div>
      </div>
    </div>
  );
};