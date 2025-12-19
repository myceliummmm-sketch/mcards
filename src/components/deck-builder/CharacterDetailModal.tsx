import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, Sparkles, Target, Quote, Lightbulb } from 'lucide-react';
import { getCharacterById, type TeamCharacter } from '@/data/teamCharacters';

interface CharacterDetailModalProps {
  characterId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onStartChat?: (characterId: string) => void;
  isLocked?: boolean;
}

export const CharacterDetailModal = ({ 
  characterId, 
  isOpen, 
  onClose, 
  onStartChat,
  isLocked = false 
}: CharacterDetailModalProps) => {
  const character = characterId ? getCharacterById(characterId) : null;

  if (!character) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-card border-2" style={{ borderColor: character.color }}>
        {/* Hero Header */}
        <div 
          className="relative p-8 pb-20"
          style={{ 
            background: `linear-gradient(135deg, ${character.color}30 0%, ${character.color}10 50%, transparent 100%)` 
          }}
        >
          {/* Decorative glow */}
          <div 
            className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-30"
            style={{ backgroundColor: character.color }}
          />
          
          <div className="relative flex items-start gap-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <Avatar 
                className="w-28 h-28 border-4 shadow-xl"
                style={{ borderColor: character.color }}
              >
                <AvatarImage src={character.avatar} alt={character.name} />
                <AvatarFallback 
                  className="text-4xl"
                  style={{ backgroundColor: `${character.color}40` }}
                >
                  {character.emoji}
                </AvatarFallback>
              </Avatar>
            </motion.div>
            
            <div className="flex-1">
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-display font-bold text-foreground">
                    {character.name}
                  </h2>
                  <span className="text-3xl">{character.emoji}</span>
                </div>
                <Badge 
                  variant="outline" 
                  className="text-sm px-3 py-1"
                  style={{ borderColor: character.color, color: character.color }}
                >
                  {character.role}
                </Badge>
              </motion.div>
              
              <motion.p
                className="mt-4 text-lg text-foreground/90 leading-relaxed"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {character.tagline}
              </motion.p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 pt-4 space-y-6">
          {/* Specialty */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border"
          >
            <Target className="w-5 h-5 mt-0.5" style={{ color: character.color }} />
            <div>
              <h4 className="font-semibold text-foreground mb-1">Specialty</h4>
              <p className="text-muted-foreground">{character.specialty}</p>
            </div>
          </motion.div>

          {/* Personality */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border"
          >
            <Lightbulb className="w-5 h-5 mt-0.5" style={{ color: character.color }} />
            <div>
              <h4 className="font-semibold text-foreground mb-1">Personality</h4>
              <p className="text-muted-foreground leading-relaxed">{character.personality}</p>
            </div>
          </motion.div>

          {/* Signature Phrases */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Quote className="w-4 h-4" style={{ color: character.color }} />
              <h4 className="font-semibold text-foreground">Signature Phrases</h4>
            </div>
            <div className="space-y-2">
              {character.signaturePhrases.map((phrase, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="p-3 rounded-lg border-l-4 bg-muted/30"
                  style={{ borderLeftColor: character.color }}
                >
                  <p className="text-foreground italic">"{phrase}"</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="pt-4"
          >
            <Button
              size="lg"
              className="w-full gap-2 text-lg"
              style={{ 
                background: `linear-gradient(135deg, ${character.color} 0%, ${character.color}cc 100%)`,
              }}
              onClick={() => {
                if (onStartChat && characterId) {
                  onClose();
                  onStartChat(characterId);
                }
              }}
              disabled={isLocked}
            >
              {isLocked ? (
                <>
                  <Sparkles className="w-5 h-5" />
                  Unlock with PRO
                </>
              ) : (
                <>
                  <MessageCircle className="w-5 h-5" />
                  Start Conversation with {character.name}
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
