import { Button } from '@/components/ui/button';
import type { CardDefinition } from '@/data/cardDefinitions';
import { Sparkles, Zap } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { TEAM_CHARACTERS } from '@/data/teamCharacters';

interface CardBackProps {
  definition: CardDefinition;
  content?: any;
  evaluation?: any;
  isEmpty?: boolean;
  onEdit: () => void;
}

const TeamRatingsPreview = ({ evaluation }: { evaluation: any }) => {
  // Map character IDs to the criteria they evaluate
  const characterToCriteria: Record<string, string | string[]> = {
    evergreen: 'impact',
    prisma: ['relevance', 'actionability'], // Prisma evaluates 2 criteria
    phoenix: 'market_fit',
    techpriest: 'depth',
    toxic: 'credibility',
    virgilia: 'clarity',
  };
  
  const characterIds = ['evergreen', 'prisma', 'phoenix', 'techpriest', 'toxic', 'virgilia'];
  
  const getScoreForCharacter = (charId: string): number => {
    const criteria = characterToCriteria[charId];
    if (!criteria) return 0;
    
    if (Array.isArray(criteria)) {
      // Average multiple criteria scores
      const scores = criteria
        .map(c => evaluation[c]?.score || 0)
        .filter(s => s > 0);
      return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    }
    
    return evaluation[criteria]?.score || 0;
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-cyan-500';
    if (score >= 5) return 'bg-green-500';
    return 'bg-muted';
  };

  return (
    <div className="backdrop-blur-md bg-black/40 border border-white/30 rounded-lg p-6">
      {/* Overall Score */}
      <div className="text-center mb-4">
        <div className="text-3xl font-bold text-white">{evaluation.overall}/10</div>
        <div className="text-sm text-white/70">Overall Score</div>
      </div>

      {/* Character Avatars Grid */}
      <div className="grid grid-cols-3 gap-3 justify-items-center">
        {characterIds.map((charId) => {
          const character = TEAM_CHARACTERS[charId];
          const score = getScoreForCharacter(charId);
          
          return (
            <div key={charId} className="flex flex-col items-center gap-1">
              <div className="relative">
                <Avatar className="w-10 h-10 border border-white/30">
                  <AvatarImage src={character.avatar} alt={character.name} />
                  <AvatarFallback className="text-sm">{character.emoji}</AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full ${getScoreColor(score)} border border-black/50 flex items-center justify-center text-[10px] font-bold text-white`}>
                  {score}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const CardBack = ({ 
  definition, 
  content,
  evaluation,
  isEmpty = false,
  onEdit
}: CardBackProps) => {
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
      {/* Full-bleed crystal image or gradient */}
      <div className="absolute inset-0">
        {content?.card_image_url ? (
          <img 
            src={content.card_image_url} 
            alt="Crystal specimen"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full ${getEmptyGradient()}`} />
        )}
      </div>

      {/* Dark overlay for visibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70" />

      {/* Content: Team Ratings + Button */}
      <div className="relative w-full h-full flex flex-col items-center justify-center gap-4 p-6">
        {/* Team Ratings Preview */}
        {evaluation && <TeamRatingsPreview evaluation={evaluation} />}

        {/* Dynamic Button */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          size="lg"
          className="gap-2 bg-gradient-to-r from-[#FF6B9D] to-[#B388FF] hover:from-[#FF6B9D]/90 hover:to-[#B388FF]/90 text-white shadow-2xl transition-all hover:scale-105 font-display uppercase tracking-wide text-sm px-8 py-6 backdrop-blur-sm border-2 border-white/20"
        >
          {isEmpty ? (
            <>
              <Zap className="w-5 h-5" />
              Forge Card
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Open Card
            </>
          )}
        </Button>
      </div>
    </div>
  );
};