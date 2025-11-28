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
}

export const CardFront = ({ 
  definition, 
  isEmpty, 
  isComplete, 
  isInsight,
  preview 
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

  return (
    <div className="w-full h-full p-6 flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="text-sm font-bold text-muted-foreground">
            #{definition.slot}
          </div>
          <div className="flex items-center gap-2 text-xs font-medium">
            <span>{getStatusIcon()}</span>
            <span className={
              isInsight ? 'text-status-insight' :
              isComplete ? 'text-status-complete' :
              preview ? 'text-status-in-progress' :
              'text-status-empty'
            }>
              {getStatusLabel()}
            </span>
          </div>
        </div>
        
        <h3 className="text-2xl font-display font-bold text-foreground mb-2">
          {definition.title}
        </h3>
        <p className="text-sm text-muted-foreground">
          {definition.coreQuestion}
        </p>
      </div>

      {/* Preview content (if any) */}
      {preview && (
        <motion.div
          className="flex-1 my-4 p-4 bg-muted/30 rounded-lg border border-border/50 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-sm text-foreground/60 line-clamp-3">
            {preview}
          </p>
        </motion.div>
      )}

      {/* AI Character badge */}
      {character && (
        <div className="flex items-center gap-2 mt-4">
          <Avatar 
            className="w-8 h-8 border-2" 
            style={{ borderColor: character.color }}
          >
            <AvatarImage src={character.avatar} alt={character.name} />
            <AvatarFallback style={{ backgroundColor: `${character.color}20`, color: character.color }}>
              {character.emoji}
            </AvatarFallback>
          </Avatar>
          <div className="text-xs text-muted-foreground">
            {character.name}
          </div>
        </div>
      )}
    </div>
  );
};
