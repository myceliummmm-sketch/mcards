import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, Target, Lightbulb } from 'lucide-react';
import { RecommendationCard } from './RecommendationCard';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { MarketplaceCard } from '@/data/mockMarketplaceData';

interface Recommendation {
  cardId: string;
  score: number;
  reasons: string[];
  category: 'gap_filler' | 'content_match' | 'related';
}

interface DeckAnalysis {
  primaryIndustry: string;
  mainThemes: string[];
  keywords: string[];
  targetAudience: string;
  gapPhases: string[];
  completionScore: number;
  filledCards: number;
  totalCards: number;
}

interface RecommendationSidebarProps {
  recommendations: Recommendation[];
  deckAnalysis: DeckAnalysis | null;
  marketplaceCards: MarketplaceCard[];
  isLoading: boolean;
  onRefresh: () => void;
  onCardView: (card: MarketplaceCard) => void;
}

export function RecommendationSidebar({
  recommendations,
  deckAnalysis,
  marketplaceCards,
  isLoading,
  onRefresh,
  onCardView
}: RecommendationSidebarProps) {
  const gapFillers = recommendations.filter(r => r.category === 'gap_filler');
  const contentMatches = recommendations.filter(r => r.category === 'content_match');
  const related = recommendations.filter(r => r.category === 'related');

  const getCardById = (id: string) => marketplaceCards.find(c => c.id === id);

  return (
    <Card className="w-80 flex-shrink-0 sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="w-5 h-5 text-primary" />
          Smart Recommendations
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {deckAnalysis && (
          <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              🧠 Your Deck Analysis
            </h3>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-muted-foreground">Industry:</span>{' '}
                <span className="font-medium">{deckAnalysis.primaryIndustry}</span>
              </div>
              {deckAnalysis.mainThemes.length > 0 && (
                <div>
                  <span className="text-muted-foreground">Themes:</span>{' '}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {deckAnalysis.mainThemes.map((theme, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {theme}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Completion:</span>
                <Progress value={deckAnalysis.completionScore} className="mt-1" />
                <span className="text-xs text-muted-foreground">
                  {deckAnalysis.filledCards}/{deckAnalysis.totalCards} cards
                </span>
              </div>
            </div>
          </div>
        )}

        {gapFillers.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-green-500" />
              Gap Fillers ({gapFillers.length})
            </h3>
            {gapFillers.map((rec) => {
              const card = getCardById(rec.cardId);
              if (!card) return null;
              return (
                <RecommendationCard
                  key={rec.cardId}
                  cardTitle={card.title}
                  matchScore={rec.score}
                  reasons={rec.reasons}
                  category={rec.category}
                  onView={() => onCardView(card)}
                />
              );
            })}
          </div>
        )}

        {contentMatches.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              💡 Content Matches ({contentMatches.length})
            </h3>
            {contentMatches.map((rec) => {
              const card = getCardById(rec.cardId);
              if (!card) return null;
              return (
                <RecommendationCard
                  key={rec.cardId}
                  cardTitle={card.title}
                  matchScore={rec.score}
                  reasons={rec.reasons}
                  category={rec.category}
                  onView={() => onCardView(card)}
                />
              );
            })}
          </div>
        )}

        {related.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-purple-500" />
              Related Insights ({related.length})
            </h3>
            {related.slice(0, 3).map((rec) => {
              const card = getCardById(rec.cardId);
              if (!card) return null;
              return (
                <RecommendationCard
                  key={rec.cardId}
                  cardTitle={card.title}
                  matchScore={rec.score}
                  reasons={rec.reasons}
                  category={rec.category}
                  onView={() => onCardView(card)}
                />
              );
            })}
          </div>
        )}

        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Recommendations
        </Button>
      </CardContent>
    </Card>
  );
}
