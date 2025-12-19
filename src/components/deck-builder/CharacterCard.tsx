import { motion } from 'framer-motion';
import type { TeamCharacter } from '@/data/teamCharacters';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Lock, Crown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface CharacterCardProps {
  character: TeamCharacter;
  isActive?: boolean;
  isLocked?: boolean;
  onClick?: () => void;
}

export const CharacterCard = ({ character, isActive = false, isLocked = false, onClick }: CharacterCardProps) => {
  const { language } = useLanguage();
  
  return (
    <motion.div
      className={`relative p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer group ${
        isLocked
          ? 'border-border bg-muted/30 opacity-70'
          : isActive
            ? 'border-primary bg-primary/10 shadow-lg'
            : 'border-border bg-card hover:border-primary/50 hover:bg-muted/50'
      }`}
      whileHover={{ scale: isLocked ? 1 : 1.02, y: isLocked ? 0 : -2 }}
      whileTap={{ scale: isLocked ? 1 : 0.98 }}
      animate={isActive && !isLocked ? { y: [0, -5, 0] } : {}}
      transition={isActive && !isLocked ? { repeat: Infinity, duration: 2 } : { duration: 0.2 }}
      onClick={onClick}
    >
      {/* PRO Badge for locked characters */}
      {isLocked && (
        <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs gap-1">
          <Crown className="w-3 h-3" />
          PRO
        </Badge>
      )}

      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar 
            className={`w-12 h-12 border-2 ${isLocked ? 'grayscale' : ''}`}
            style={{ borderColor: isLocked ? 'hsl(var(--muted-foreground))' : character.color }}
          >
            <AvatarImage src={character.avatar} alt={character.name} />
            <AvatarFallback style={{ backgroundColor: `${character.color}20` }}>
              {character.emoji}
            </AvatarFallback>
          </Avatar>
          {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-full">
              <Lock className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className={`font-bold truncate ${isLocked ? 'text-muted-foreground' : 'text-foreground'}`}>
            {character.name}
          </div>
          <div className="text-xs text-muted-foreground truncate">{character.role}</div>
        </div>
      </div>

      {/* Chat indicator or Unlock prompt */}
      <motion.div
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        initial={false}
      >
        {isLocked ? (
          <div className="px-2 py-1 rounded text-xs bg-primary/10 text-primary font-medium">
            {language === 'ru' ? 'Разблокировать' : 'Unlock'}
          </div>
        ) : (
          <div 
            className="p-1.5 rounded-full bg-background/80 border border-border"
            style={{ color: character.color }}
          >
            <MessageCircle className="w-3.5 h-3.5" />
          </div>
        )}
      </motion.div>

      {isActive && !isLocked && (
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
