import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Search, CheckCircle, MessageCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardDefinition } from '@/data/cardDefinitions';
import { ResearchResult } from '@/hooks/useResearch';
import { RARITY_CONFIG, Rarity } from '@/data/rarityConfig';
import { TeamFindings } from './TeamFindings';
import { DiscussionDrawer } from './DiscussionDrawer';

interface ResearchCardProps {
  definition: CardDefinition;
  result?: ResearchResult;
  isUnlocked: boolean;
  isResearching: boolean;
  onStartResearch: () => void;
  onAccept: () => void;
  onDiscuss: (message: string, characterId: string) => Promise<string | null>;
  deckId: string;
}

// Default rarity scores for safe fallback
const DEFAULT_RARITY_SCORES = {
  depth: 0,
  actionability: 0,
  uniqueness: 0,
  source_quality: 0,
  final_score: 0
};

export function ResearchCard({
  definition,
  result,
  isUnlocked,
  isResearching,
  onStartResearch,
  onAccept,
  onDiscuss,
  deckId
}: ResearchCardProps) {
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const status = result?.status || 'locked';
  const rarity = (result?.final_rarity as Rarity) || 'common';
  const rarityConfig = RARITY_CONFIG[rarity] || RARITY_CONFIG.common;

  // Safe extraction of rarity scores
  const safeRarityScores = result?.rarity_scores 
    ? (typeof result.rarity_scores === 'object' ? result.rarity_scores as any : DEFAULT_RARITY_SCORES)
    : null;

  // Safe extraction of team comments
  const safeTeamComments = Array.isArray(result?.team_comments) 
    ? result.team_comments as Array<{ characterId: string; comment: string; sentiment: string }>
    : null;

  // Safe extraction of findings
  const safeFindings = result?.findings && typeof result.findings === 'object'
    ? result.findings as Record<string, any>
    : null;

  const getStatusDisplay = () => {
    if (!isUnlocked) return { icon: Lock, text: 'Locked', color: 'text-muted-foreground' };
    if (isResearching) return { icon: Loader2, text: 'Researching...', color: 'text-primary animate-spin' };
    if (status === 'ready') return { icon: CheckCircle, text: 'Ready', color: 'text-green-500' };
    if (status === 'accepted') return { icon: CheckCircle, text: 'Accepted', color: 'text-primary' };
    return { icon: Search, text: 'Start Research', color: 'text-muted-foreground' };
  };

  const statusDisplay = getStatusDisplay();
  const StatusIcon = statusDisplay.icon;

  // Safe AI helpers with fallback
  const safeAiHelpers = definition?.aiHelpers && Array.isArray(definition.aiHelpers) 
    ? definition.aiHelpers 
    : ['evergreen'];

  return (
    <>
      <motion.div
        className={`relative w-full aspect-[3/4] rounded-xl overflow-hidden cursor-pointer
          ${!isUnlocked ? 'opacity-60' : ''}
          ${status === 'accepted' ? `border-2 ${rarityConfig.borderStyle}` : 'border border-border'}
        `}
        style={{
          boxShadow: status === 'accepted' ? rarityConfig.glow : 'none'
        }}
        whileHover={isUnlocked ? { scale: 1.02 } : {}}
        onClick={() => {
          if (status === 'ready' || status === 'accepted') {
            setIsFlipped(!isFlipped);
          }
        }}
      >
        <AnimatePresence mode="wait">
          {!isFlipped ? (
            <motion.div
              key="front"
              className={`absolute inset-0 p-4 flex flex-col bg-gradient-to-br ${rarityConfig.bgGradient}`}
              initial={{ rotateY: 180, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: 180, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${rarityConfig.textColor} bg-background/50`}>
                  R-{definition.slot - 5}
                </span>
                <StatusIcon className={`w-4 h-4 ${statusDisplay.color}`} />
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-foreground mb-1">
                {definition.title}
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                {definition.coreQuestion}
              </p>

              {/* Content Area */}
              <div className="flex-1 flex flex-col justify-center items-center">
                {!isUnlocked && (
                  <div className="text-center">
                    <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Complete previous card first</p>
                  </div>
                )}

                {isUnlocked && status === 'locked' && !isResearching && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartResearch();
                    }}
                    className="gap-2"
                  >
                    <Search className="w-4 h-4" />
                    Start Research
                  </Button>
                )}

                {isResearching && (
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Team is researching...</p>
                    <p className="text-xs text-muted-foreground mt-1">This may take a moment</p>
                  </div>
                )}

                {status === 'ready' && (
                  <div className="text-center">
                    <p className="text-sm text-foreground mb-2">Research complete!</p>
                    <p className="text-xs text-muted-foreground">Click to view findings</p>
                  </div>
                )}

                {status === 'accepted' && (
                  <div className="text-center">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className={`text-sm font-medium ${rarityConfig.textColor}`}>
                      {rarityConfig.label} Card
                    </p>
                    <p className="text-xs text-muted-foreground">Click to review</p>
                  </div>
                )}
              </div>

              {/* Rarity indicator for ready/accepted */}
              {(status === 'ready' || status === 'accepted') && safeRarityScores && (
                <div className="mt-auto pt-2 border-t border-border/50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Quality Score</span>
                    <span className={rarityConfig?.textColor || 'text-muted-foreground'}>
                      {safeRarityScores.final_score?.toFixed?.(1) || '?'}/10
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="back"
              className={`absolute inset-0 p-4 flex flex-col bg-gradient-to-br ${rarityConfig.bgGradient} overflow-y-auto`}
              initial={{ rotateY: -180, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -180, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <TeamFindings
                findings={safeFindings}
                teamComments={safeTeamComments}
                rarityScores={safeRarityScores}
                verdict={result?.verdict || null}
              />

              {status === 'ready' && (
                <div className="mt-auto pt-3 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDiscussion(true);
                    }}
                  >
                    <MessageCircle className="w-3 h-3" />
                    Discuss
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAccept();
                    }}
                  >
                    <CheckCircle className="w-3 h-3" />
                    Take it!
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <DiscussionDrawer
        open={showDiscussion}
        onOpenChange={setShowDiscussion}
        cardTitle={definition.title}
        evaluators={safeAiHelpers}
        onSendMessage={onDiscuss}
      />
    </>
  );
}
