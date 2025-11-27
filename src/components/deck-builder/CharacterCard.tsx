import { motion } from 'framer-motion';
import type { TeamCharacter } from '@/data/teamCharacters';

interface CharacterCardProps {
  character: TeamCharacter;
  isActive?: boolean;
}

export const CharacterCard = ({ character, isActive = false }: CharacterCardProps) => {
  return (
    <motion.div
      className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${
        isActive
          ? 'border-primary bg-primary/10 shadow-lg'
          : 'border-border bg-card hover:border-primary/50'
      }`}
      whileHover={{ scale: 1.05, y: -5 }}
      animate={isActive ? { y: [0, -5, 0] } : {}}
      transition={isActive ? { repeat: Infinity, duration: 2 } : {}}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2"
          style={{
            borderColor: character.color,
            backgroundColor: `${character.color}20`
          }}
        >
          {character.name.charAt(0)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="font-bold text-foreground truncate">{character.name}</div>
          <div className="text-xs text-muted-foreground truncate">{character.role}</div>
        </div>
      </div>
      
      {isActive && (
        <motion.div
          className="mt-3 p-2 bg-background/80 rounded text-xs text-foreground italic border border-border"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          "{character.signaturePhrases[0]}"
        </motion.div>
      )}
    </motion.div>
  );
};
