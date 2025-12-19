import { getCharacterById } from '@/data/teamCharacters';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface RarityScores {
  [key: string]: number;
}

interface InsightData {
  insight: string;
  source: string;
  confidence: string;
  why_matters: string;
  score: number;
  rarity: string;
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

// Human-readable labels for insight types
const INSIGHT_TYPE_LABELS: Record<string, string> = {
  market_size: '📊 Размер рынка',
  market_growth: '📈 Рост рынка',
  market_leaders: '🏆 Лидеры рынка',
  direct_competitors: '🎯 Прямые конкуренты',
  competitor_weaknesses: '⚠️ Слабости конкурентов',
  empty_niche: '💡 Свободная ниша',
  pain_voice: '💬 Голос боли',
  pain_frequency: '📉 Частота проблемы',
  current_solutions: '🔧 Текущие решения',
  competitor_threat: '⚔️ Угроза конкурентов',
  market_barriers: '🚧 Барьеры входа',
  failure_cases: '❌ Провалы похожих',
  why_now: '⏰ Почему сейчас',
  scale_potential: '🚀 Потенциал роста',
  strategic_window: '🪟 Окно возможности',
};

// Keys to exclude from insights display
const EXCLUDED_INSIGHT_KEYS = ['key_insight', 'concerns', 'insights', 'resonated_count', 'total_count', 'resonance_rate'];

// Keys to exclude from scores display
const EXCLUDED_SCORE_KEYS = ['final_score', 'vision_ceiling'];

const SCORE_LABELS: Record<string, string> = {
  depth: 'Глубина',
  actionability: 'Применимость',
  uniqueness: 'Уникальность',
  source_quality: 'Источники',
  relevance: 'Релевантность',
  actuality: 'Актуальность',
};

// Map insight types to characters who present them
const INSIGHT_PRESENTERS: Record<string, string> = {
  market_size: 'phoenix',
  market_growth: 'phoenix',
  market_leaders: 'phoenix',
  direct_competitors: 'toxic',
  competitor_weaknesses: 'toxic',
  empty_niche: 'toxic',
  pain_voice: 'prisma',
  pain_frequency: 'prisma',
  current_solutions: 'prisma',
  competitor_threat: 'toxic',
  market_barriers: 'toxic',
  failure_cases: 'toxic',
  why_now: 'evergreen',
  scale_potential: 'evergreen',
  strategic_window: 'evergreen',
};

// Map score criteria to team members who evaluate them
const SCORE_EVALUATORS: Record<string, string> = {
  depth: 'phoenix',
  actionability: 'prisma',
  uniqueness: 'toxic',
  source_quality: 'evergreen',
  relevance: 'phoenix',
  actuality: 'evergreen',
};

// Get color based on score
const getScoreColor = (score: number): string => {
  if (score >= 8) return 'hsl(180 70% 50%)';
  if (score >= 6) return 'hsl(140 50% 50%)';
  return 'hsl(0 0% 50%)';
};

// Generate contextual explanations based on score
const getScoreExplanation = (key: string, score: number): string => {
  const explanations: Record<string, Record<string, string>> = {
    depth: {
      high: 'Глубокий анализ с детальной проработкой всех аспектов. Охвачены ключевые факторы и их взаимосвязи.',
      medium: 'Хороший уровень анализа, но некоторые аспекты требуют дополнительной проработки.',
      low: 'Поверхностный анализ. Рекомендуется углубить исследование.',
    },
    actionability: {
      high: 'Выводы легко применимы на практике. Четкие рекомендации для следующих шагов.',
      medium: 'Есть практические выводы, но некоторые требуют уточнения перед внедрением.',
      low: 'Сложно применить на практике. Нужна дополнительная проработка.',
    },
    uniqueness: {
      high: 'Уникальные инсайты, которые дают конкурентное преимущество. Редкие находки.',
      medium: 'Полезная информация, но частично доступна из других источников.',
      low: 'Общеизвестная информация без уникальной ценности.',
    },
    source_quality: {
      high: 'Надежные первичные источники. Данные верифицированы и актуальны.',
      medium: 'Источники достаточно надежны, но есть место для улучшения.',
      low: 'Качество источников под вопросом. Рекомендуется перепроверка.',
    },
    relevance: {
      high: 'Высокая релевантность для проекта. Прямо влияет на принятие решений.',
      medium: 'Релевантно, но не критично для немедленных действий.',
      low: 'Низкая релевантность. Косвенно связано с основными целями.',
    },
    actuality: {
      high: 'Актуальные данные, отражающие текущую ситуацию на рынке.',
      medium: 'Данные в основном актуальны, но некоторые требуют обновления.',
      low: 'Устаревшая информация. Необходимо обновление данных.',
    },
  };

  const level = score >= 8 ? 'high' : score >= 5 ? 'medium' : 'low';
  return explanations[key]?.[level] || 'Оценка исследовательских данных.';
};

export function TeamFindings({ findings, teamComments, rarityScores, verdict }: TeamFindingsProps) {
  const getVerdictColor = (v: string) => {
    switch (v?.toUpperCase()) {
      case 'GO': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'CONDITIONAL_GO': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'PIVOT': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'STOP': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case 'legendary': return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      case 'epic': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'rare': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  // Extract insights from findings object - support BOTH formats
  const extractedInsights: Array<{
    type: string;
    label: string;
    data: InsightData;
    presenter: string;
  }> = [];

  if (findings) {
    // Format 1: Simple string array - findings.insights is array of strings (deck_cards format)
    if (Array.isArray(findings.insights) && findings.insights.length > 0 && typeof findings.insights[0] === 'string') {
      findings.insights.forEach((insightText: string, idx: number) => {
        extractedInsights.push({
          type: `insight_${idx}`,
          label: `Инсайт ${idx + 1}`,
          data: {
            insight: insightText,
            source: '',
            confidence: 'medium',
            why_matters: '',
            score: 7,
            rarity: 'common',
          },
          presenter: 'evergreen',
        });
      });
    } 
    // Format 2: New InsightValidation format - findings.insights is array of objects
    else if (Array.isArray(findings.insights)) {
      findings.insights.forEach((insight: any, idx: number) => {
        extractedInsights.push({
          type: insight.type || `insight_${idx}`,
          label: INSIGHT_TYPE_LABELS[insight.type] || insight.type?.replace(/_/g, ' ') || `Инсайт ${idx + 1}`,
          data: {
            insight: insight.content || insight.text || '',
            source: insight.sourceUrl || insight.source || '',
            confidence: insight.score >= 7 ? 'high' : insight.score >= 4 ? 'medium' : 'low',
            why_matters: insight.whyMatters || '',
            score: insight.score || 5,
            rarity: insight.rarity || 'common',
          },
          presenter: insight.presenter || 'evergreen',
        });
      });
    } else {
      // Format 3: Old edge function format - findings.market_size, etc.
      Object.entries(findings).forEach(([key, value]) => {
        if (EXCLUDED_INSIGHT_KEYS.includes(key)) return;
        if (!value || typeof value !== 'object' || !(value as any).insight) return;
        
        extractedInsights.push({
          type: key,
          label: INSIGHT_TYPE_LABELS[key] || key.replace(/_/g, ' '),
          data: value as InsightData,
          presenter: INSIGHT_PRESENTERS[key] || 'evergreen',
        });
      });
    }
  }

  // Extract quality scores
  const scoreLabels = rarityScores 
    ? Object.keys(rarityScores)
        .filter(key => !EXCLUDED_SCORE_KEYS.includes(key))
        .map(key => ({
          key,
          label: SCORE_LABELS[key] || key.replace(/_/g, ' ')
        }))
    : [];

  return (
    <div className="space-y-4">
      {/* Verdict (if present - for Opportunity Score card) */}
      {verdict && (
        <div className="text-center mb-4">
          <Badge className={`text-lg px-4 py-2 ${getVerdictColor(verdict)}`}>
            {verdict.replace('_', ' ')}
          </Badge>
        </div>
      )}

      {/* Key Insight */}
      {findings?.key_insight && (
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-primary">✦</span>
            <span className="font-semibold text-sm text-foreground">Главный инсайт</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            {findings.key_insight}
          </p>
        </div>
      )}

      {/* Extracted Insights - max 3 */}
      {extractedInsights.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
            Найденные инсайты
            <Badge variant="outline" className="text-xs">
              {extractedInsights.length}/3
            </Badge>
          </h4>
          {extractedInsights.slice(0, 3).map((item, idx) => {
            const character = getCharacterById(item.presenter);
            return (
              <div 
                key={idx} 
                className="p-3 rounded-lg border bg-card/50 border-border/50"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    {character?.avatar && (
                      <AvatarImage src={character.avatar} alt={character.name} />
                    )}
                    <AvatarFallback className="text-xs bg-primary/20">
                      {character?.emoji || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium text-foreground text-sm">
                        {item.label}
                      </span>
                      <Badge className={`text-[10px] px-1.5 py-0 h-4 ${getRarityColor(item.data.rarity)}`}>
                        {item.data.rarity}
                      </Badge>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {item.data.score}/10
                      </span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed mb-2">
                      {item.data.insight}
                    </p>
                    {item.data.why_matters && (
                      <p className="text-xs text-muted-foreground italic mb-1">
                        💡 {item.data.why_matters}
                      </p>
                    )}
                    {item.data.source && (
                      <a 
                        href={item.data.source} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-primary/70 hover:text-primary hover:underline"
                      >
                        📎 {item.data.source.length > 50 
                          ? item.data.source.substring(0, 50) + '...' 
                          : item.data.source}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}


      {/* Concerns */}
      {findings?.concerns && findings.concerns.length > 0 && (
        <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
          <h4 className="font-semibold text-orange-400 text-sm mb-2">⚠️ Риски и опасения</h4>
          <ul className="space-y-1">
            {findings.concerns.map((concern: string, idx: number) => (
              <li key={idx} className="text-sm text-orange-200/80 flex items-start gap-2">
                <span className="text-orange-400">•</span>
                {concern}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Quality Scores - Detailed Team Evaluations */}
      {scoreLabels.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-mono font-bold text-primary uppercase tracking-wider">
              // МАТРИЦА ОЦЕНКИ
            </h4>
            {rarityScores?.final_score !== undefined && (
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-muted-foreground">Общий балл:</span>
                <span 
                  className="text-2xl font-bold font-mono"
                  style={{ color: getScoreColor(
                    typeof rarityScores.final_score === 'number' 
                      ? rarityScores.final_score 
                      : (rarityScores.final_score as any)?.score || 0
                  ) }}
                >
                  {(typeof rarityScores.final_score === 'number' 
                    ? rarityScores.final_score 
                    : (rarityScores.final_score as any)?.score || 0
                  ).toFixed(1)}/10
                </span>
              </div>
            )}
          </div>
          
          {scoreLabels.map(({ key, label }, idx) => {
            // Support both old format (number) and new format (object with score/explanation/evaluator)
            const scoreData = rarityScores?.[key];
            const isNewFormat = Boolean(scoreData && typeof scoreData === 'object' && 'score' in (scoreData as object));
            
            const score = isNewFormat ? (scoreData as any).score : (typeof scoreData === 'number' ? scoreData : 0);
            const evaluator = isNewFormat ? (scoreData as any).evaluator : SCORE_EVALUATORS[key] || 'evergreen';
            const explanation = isNewFormat 
              ? (scoreData as any).explanation 
              : getScoreExplanation(key, score);
            
            const character = getCharacterById(evaluator);
            const percentage = (score / 10) * 100;
            
            return (
              <div key={key} className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6 border" style={{ borderColor: character?.color || '#888' }}>
                      {character?.avatar && (
                        <AvatarImage src={character.avatar} alt={character?.name} />
                      )}
                      <AvatarFallback style={{ backgroundColor: `${character?.color || '#888'}20`, color: character?.color || '#888' }}>
                        {character?.emoji || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-foreground">{label}</span>
                  </div>
                  <span 
                    className="text-lg font-bold font-mono"
                    style={{ color: getScoreColor(score) }}
                  >
                    {score.toFixed(0)}/10
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
          })}
        </div>
      )}

      {/* Empty state */}
      {extractedInsights.length === 0 && (!teamComments || teamComments.length === 0) && (
        <div className="text-center py-6 text-muted-foreground">
          <p className="text-sm">Нет найденных инсайтов</p>
          <p className="text-xs mt-1">Запустите Research для поиска инсайтов</p>
        </div>
      )}
    </div>
  );
}
