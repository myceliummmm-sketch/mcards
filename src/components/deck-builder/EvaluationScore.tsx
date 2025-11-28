import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getCharacterById } from '@/data/teamCharacters';

interface EvaluationScoreProps {
  criterion: string;
  score: number;
  explanation: string;
  evaluator: string;
}

export const EvaluationScore = ({ criterion, score, explanation, evaluator }: EvaluationScoreProps) => {
  const character = getCharacterById(evaluator);
  
  if (!character) return null;

  // Calculate progress percentage and color
  const percentage = (score / 10) * 100;
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'hsl(180 70% 50%)'; // Cyan for high scores
    if (score >= 6) return 'hsl(140 50% 50%)'; // Green for medium
    return 'hsl(0 0% 50%)'; // Gray for low
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Avatar className="w-6 h-6 border" style={{ borderColor: character.color }}>
            <AvatarImage src={character.avatar} alt={character.name} />
            <AvatarFallback style={{ backgroundColor: `${character.color}20`, color: character.color }}>
              {character.emoji}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-foreground capitalize">
            {criterion.replace('_', ' ')}
          </span>
        </div>
        <span 
          className="text-lg font-bold font-mono"
          style={{ color: getScoreColor(score) }}
        >
          {score}/10
        </span>
      </div>
      
      <div className="mb-2 h-1.5 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full transition-all duration-500 ease-out"
          style={{ 
            width: `${percentage}%`,
            backgroundColor: getScoreColor(score)
          }}
        />
      </div>
      
      <p className="text-sm text-muted-foreground italic">
        "{explanation}"
      </p>
    </div>
  );
};
