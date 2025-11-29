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
    <div className="relative w-full h-full overflow-hidden">
      {/* Full-bleed background image or gradient */}
      {imageUrl ? (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
          {/* Top gradient overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
        </>
      ) : (
        <div className={`absolute inset-0 ${getEmptyGradient()}`} />
      )}

      {/* Content overlay */}
      <div className="relative w-full h-full p-6 flex flex-col justify-between">
        {/* Header with glassmorphism */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            {/* Phase and slot badge */}
            <div className="glass-card px-3 py-1.5 rounded-lg flex items-center gap-2">
              <span className="text-base">{getPhaseEmoji()}</span>
              <span className="text-xs font-bold text-white uppercase tracking-wide">
                #{definition.slot} · {definition.phase}
              </span>
            </div>

            {/* Status badge */}
            <div className="glass-card px-3 py-1.5 rounded-lg flex items-center gap-1.5">
              <span className="text-sm">{getStatusIcon()}</span>
              <span className={`text-xs font-medium ${
                isInsight ? 'text-status-insight' :
                isComplete ? 'text-status-complete' :
                preview ? 'text-status-in-progress' :
                'text-white/70'
              }`}>
                {getStatusLabel()}
              </span>
            </div>
          </div>

          {/* Title card */}
          <div className="glass-card p-4 rounded-xl">
            <h3 className="text-xl font-display font-bold text-white mb-1 text-shadow-strong">
              {definition.title}
            </h3>
            <p className="text-xs text-white/80 text-shadow">
              {definition.coreQuestion}
            </p>
          </div>
        </div>

        {/* Bottom section */}
        <div className="space-y-3">
          {/* Preview content (if any) */}
          {preview && (
            <motion.div
              className="glass-card p-4 rounded-xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <p className="text-sm text-white/90 line-clamp-3 text-shadow">
                {preview}
              </p>
            </motion.div>
          )}

          {/* AI Character badge */}
          {character && (
            <div className="glass-card px-3 py-2 rounded-lg flex items-center gap-3">
              <Avatar 
                className="w-8 h-8 border-2 shrink-0" 
                style={{ borderColor: character.color }}
              >
                <AvatarImage src={character.avatar} alt={character.name} />
                <AvatarFallback style={{ backgroundColor: `${character.color}20`, color: character.color }}>
                  {character.emoji}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-white text-shadow truncate">
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