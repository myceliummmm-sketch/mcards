import { motion } from 'framer-motion';
import type { TeamCharacter } from '@/data/teamCharacters';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle } from 'lucide-react';

interface CharacterCardProps {
  character: TeamCharacter;
  isActive?: boolean;
  onClick?: () => void;
}

export const CharacterCard = ({ character, isActive = false, onClick }: CharacterCardProps) => {
  return (
    <motion.div
      className={`relative p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer group ${
        isActive
          ? 'border-primary bg-primary/10 shadow-lg'
          : 'border-border bg-card hover:border-primary/50 hover:bg-muted/50'
      }`}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      animate={isActive ? { y: [0, -5, 0] } : {}}
      transition={isActive ? { repeat: Infinity, duration: 2 } : { duration: 0.2 }}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <Avatar 
          className="w-12 h-12 border-2" 
          style={{ borderColor: character.color }}
        >
          <AvatarImage src={character.avatar} alt={character.name} />
          <AvatarFallback style={{ backgroundColor: `${character.color}20` }}>
            {character.emoji}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="font-bold text-foreground truncate">{character.name}</div>
          <div className="text-xs text-muted-foreground truncate">{character.role}</div>
        </div>
      </div>

      {/* Chat indicator */}
      <motion.div
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        initial={false}
      >
        <div 
          className="p-1.5 rounded-full bg-background/80 border border-border"
          style={{ color: character.color }}
        >
          <MessageCircle className="w-3.5 h-3.5" />
        </div>
      </motion.div>

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
