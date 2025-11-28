import { motion } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getCharacterById } from '@/data/teamCharacters';

interface AIGuidePanelProps {
  characterId: string;
}

export const AIGuidePanel = ({ characterId }: AIGuidePanelProps) => {
  const character = getCharacterById(characterId);
  
  if (!character) return null;

  // Select a random signature phrase
  const phrase = character.signaturePhrases[Math.floor(Math.random() * character.signaturePhrases.length)];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 p-5 bg-gradient-to-r from-card to-card/50 rounded-lg border-2 shadow-lg"
      style={{ borderColor: character.color }}
    >
      <div className="flex items-start gap-4">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <Avatar 
            className="w-14 h-14 border-3 shrink-0 shadow-lg" 
            style={{ borderColor: character.color }}
          >
            <AvatarImage src={character.avatar} alt={character.name} />
            <AvatarFallback 
              style={{ 
                backgroundColor: `${character.color}20`, 
                color: character.color 
              }}
              className="text-2xl"
            >
              {character.emoji}
            </AvatarFallback>
          </Avatar>
        </motion.div>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground text-lg">
              {character.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {character.role}
            </span>
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-muted-foreground italic leading-relaxed"
          >
            "{phrase}"
          </motion.div>
          
          <div className="text-xs font-medium" style={{ color: character.color }}>
            {character.specialty}
          </div>
        </div>
      </div>
    </motion.div>
  );
};