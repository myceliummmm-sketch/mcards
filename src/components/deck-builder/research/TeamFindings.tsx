import { getCharacterById } from '@/data/teamCharacters';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface RarityScores {
  depth: number;
  actionability: number;
  uniqueness: number;
  source_quality: number;
  final_score: number;
}

interface TeamFindingsProps {
  findings: Record<string, any> | null;
  teamComments: Array<{
    characterId: string;
    comment: string;
    sentiment: string;
  }> | null;
  rarityScores: RarityScores | null;
  verdict?: string | null;
}

export function TeamFindings({ findings, teamComments, rarityScores, verdict }: TeamFindingsProps) {
  const scoreLabels = [
    { key: 'depth', label: 'Depth' },
    { key: 'actionability', label: 'Actionable' },
    { key: 'uniqueness', label: 'Unique' },
    { key: 'source_quality', label: 'Sources' }
  ];

  const getVerdictColor = (v: string) => {
    switch (v?.toUpperCase()) {
      case 'GO': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'CONDITIONAL_GO': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'PIVOT': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'STOP': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  // Early return if no rarity scores available
  if (!rarityScores) {
    return (
      <div className="space-y-3 text-xs">
        {verdict && (
          <div className="text-center mb-4">
            <Badge className={`text-lg px-4 py-2 ${getVerdictColor(verdict)}`}>
              {verdict.replace('_', ' ')}
            </Badge>
          </div>
        )}
        <p className="text-center text-muted-foreground">Research data loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 text-xs">
      {/* Verdict (if present - for Opportunity Score card) */}
      {verdict && (
        <div className="text-center mb-4">
          <Badge className={`text-lg px-4 py-2 ${getVerdictColor(verdict)}`}>
            {verdict.replace('_', ' ')}
          </Badge>
        </div>
      )}

      {/* Quality Scores */}
      <div className="space-y-1.5">
        <h4 className="font-semibold text-foreground text-xs">Quality Scores</h4>
        {scoreLabels.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-2">
            <span className="w-16 text-muted-foreground">{label}</span>
            <Progress 
              value={((rarityScores[key as keyof RarityScores] as number) || 0) * 10} 
              className="h-1.5 flex-1"
            />
            <span className="w-6 text-right text-foreground">
              {rarityScores[key as keyof RarityScores] || 0}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-2 pt-1 border-t border-border/50">
          <span className="w-16 font-medium text-foreground">Total</span>
          <Progress 
            value={(rarityScores.final_score || 0) * 10} 
            className="h-2 flex-1"
          />
          <span className="w-6 text-right font-bold text-primary">
            {rarityScores.final_score?.toFixed(1) || 0}
          </span>
        </div>
      </div>

      {/* Key Findings Summary */}
      {findings && Object.keys(findings).length > 0 && (
        <div className="space-y-1.5">
          <h4 className="font-semibold text-foreground text-xs">Key Findings</h4>
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {Object.entries(findings).slice(0, 3).map(([key, value]) => (
              <div key={key} className="text-muted-foreground">
                <span className="font-medium text-foreground capitalize">
                  {key.replace(/_/g, ' ')}:
                </span>{' '}
                {typeof value === 'string' 
                  ? value.substring(0, 80) + (value.length > 80 ? '...' : '')
                  : JSON.stringify(value).substring(0, 80)
                }
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team Comments */}
      {teamComments && teamComments.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground text-xs">Team Analysis</h4>
          {teamComments.map((tc, idx) => {
            const character = getCharacterById(tc.characterId);
            return (
              <div 
                key={idx} 
                className={`flex gap-2 p-2 rounded-lg ${
                  tc.sentiment === 'critical' 
                    ? 'bg-orange-500/10 border border-orange-500/20' 
                    : 'bg-muted/50'
                }`}
              >
                <Avatar className="w-6 h-6 flex-shrink-0">
                  {character?.avatar && (
                    <AvatarImage src={character.avatar} alt={character.name} />
                  )}
                  <AvatarFallback className="text-xs">
                    {character?.emoji || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="font-medium text-foreground">
                      {character?.name || 'Unknown'}
                    </span>
                    {tc.sentiment === 'critical' && (
                      <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 text-orange-400 border-orange-400/50">
                        Critical
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground leading-tight">
                    {tc.comment}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
