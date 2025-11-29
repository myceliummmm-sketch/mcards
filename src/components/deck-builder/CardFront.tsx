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
    <div className="relative w-full h-full overflow-hidden group">
      {/* Full-bleed background: Crystal image or animated gradient */}
      <div className="absolute inset-0">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt="Crystal specimen"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={`w-full h-full ${getEmptyGradient()}`} />
        )}
      </div>

      {/* Top gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-transparent" />
      
      {/* Bottom gradient overlay for content */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

      {/* Content layer */}
      <div className="relative w-full h-full p-4 flex flex-col">
        {/* Top section: Phase badge & Status */}
        <div className="flex items-start justify-between mb-auto">
          {/* Phase badge */}
          <div className="backdrop-blur-md bg-black/40 border border-white/20 rounded-lg px-3 py-2 flex items-center gap-2">
            <span className="text-lg">{getPhaseEmoji()}</span>
            <span className="text-xs font-display font-bold text-white uppercase tracking-wider drop-shadow-lg">
              {definition.phase} · #{definition.slot}
            </span>
          </div>
          
          {/* Status badge */}
          <div className={`backdrop-blur-md rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide border ${
            isInsight ? 'bg-purple-500/30 border-purple-400/50 text-purple-200' :
            isComplete ? 'bg-green-500/30 border-green-400/50 text-green-200' :
            preview ? 'bg-yellow-500/30 border-yellow-400/50 text-yellow-200' :
            'bg-gray-500/30 border-gray-400/50 text-gray-200'
          }`}>
            {getStatusIcon()} {getStatusLabel()}
          </div>
        </div>

        {/* Bottom section: Card info */}
        <div className="space-y-3">
          {/* Title & Core Question */}
          <div className="backdrop-blur-md bg-black/50 border border-white/10 rounded-lg p-4">
            <h3 className="text-lg font-display font-bold text-white mb-2 drop-shadow-lg">
              {definition.title}
            </h3>
            <p className="text-sm text-white/90 italic drop-shadow-lg">
              {definition.coreQuestion}
            </p>
          </div>

          {/* Preview content (if any) */}
          {preview && (
            <div className="backdrop-blur-md bg-blue-500/20 border border-blue-400/30 rounded-lg p-3">
              <p className="text-xs text-blue-100 drop-shadow-lg">
                {preview.substring(0, 100)}...
              </p>
            </div>
          )}

          {/* AI Character badge */}
          {character && (
            <div className="backdrop-blur-md bg-black/40 border border-white/10 rounded-lg p-3 flex items-center gap-3">
              <Avatar 
                className="w-10 h-10 border-2 ring-2 ring-white/20" 
                style={{ borderColor: character.color }}
              >
                <AvatarImage src={character.avatar} alt={character.name} />
                <AvatarFallback style={{ backgroundColor: `${character.color}20`, color: character.color }}>
                  {character.emoji}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-white/60 uppercase tracking-wider font-medium drop-shadow">
                  AI Researcher
                </div>
                <div className="text-sm font-semibold text-white truncate drop-shadow-lg">
                  {character.name}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};