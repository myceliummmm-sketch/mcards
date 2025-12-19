import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, CheckCircle, Loader2 } from 'lucide-react';
import { type CardDefinition, getLocalizedText } from '@/data/cardDefinitions';
import { ResearchResult } from '@/hooks/useResearch';
import { useLanguage } from '@/contexts/LanguageContext';
import { RARITY_CONFIG, Rarity } from '@/data/rarityConfig';
import { DiscussionDrawer } from './DiscussionDrawer';
import { ResearchCardDetailModal } from './ResearchCardDetailModal';
import { PhaseIcon } from '../PhaseIcon';
import { RarityBadge } from '@/components/marketplace/RarityBadge';

interface ResearchCardProps {
  definition: CardDefinition;
  result?: ResearchResult;
  isUnlocked: boolean;
  isResearching: boolean;
  isGeneratingImages?: boolean;
  onStartResearch: () => void;
  onAccept: () => void;
  onDiscuss: (message: string, characterId: string) => Promise<string | null>;
  onReResearch?: () => void;
  deckId: string;
  cardImageUrl?: string;
  isAccepting?: boolean;
}

// Default rarity scores for safe fallback - support both key formats
const DEFAULT_RARITY_SCORES = {
  depth: 0,
  relevance: 0,
  actionability: 0,
  uniqueness: 0,
  source_quality: 0,
  actuality: 0,
  final_score: 0
};

export function ResearchCard({
  definition,
  result,
  isUnlocked,
  isResearching,
  isGeneratingImages = false,
  onStartResearch,
  onAccept,
  onDiscuss,
  onReResearch,
  deckId,
  cardImageUrl,
  isAccepting = false
}: ResearchCardProps) {
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { language } = useLanguage();

  const status = result?.status || 'locked';
  const rarity = (result?.final_rarity as Rarity) || 'common';
  const rarityConfig = RARITY_CONFIG[rarity] || RARITY_CONFIG.common;
  
  // Debug: log result data
  console.log(`ResearchCard ${definition.slot}: status=${status}, hasResult=${!!result}, hasFindings=${!!result?.findings}, imageUrl=${!!cardImageUrl}`);
  
  // Use prop directly - parent handles realtime updates
  const imageUrl = cardImageUrl || null;
  // Show loading when researching OR when accepted but no image yet OR when isGeneratingImages is true and no image
  const isLoadingImage = isResearching || (status === 'accepted' && !imageUrl) || (isGeneratingImages && !imageUrl);

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
    if (!isUnlocked) return { icon: Lock, text: language === 'ru' ? 'Заблокировано' : 'Locked', color: 'text-muted-foreground' };
    if (isResearching || isLoadingImage) return { icon: Loader2, text: language === 'ru' ? 'Генерация...' : 'Generating...', color: 'text-primary animate-spin' };
    if (status === 'ready') return { icon: CheckCircle, text: language === 'ru' ? 'Готово' : 'Ready', color: 'text-green-500' };
    if (status === 'accepted') return { icon: CheckCircle, text: language === 'ru' ? 'Принято' : 'Accepted', color: 'text-primary' };
    return { icon: Loader2, text: language === 'ru' ? 'Ожидание...' : 'Waiting...', color: 'text-muted-foreground' };
  };

  const statusDisplay = getStatusDisplay();
  const StatusIcon = statusDisplay.icon;

  // Safe AI helpers with fallback
  const safeAiHelpers = definition?.aiHelpers && Array.isArray(definition.aiHelpers) 
    ? definition.aiHelpers 
    : ['evergreen'];

  // Handle card click - open modal when ready, accepted, or has image
  const handleCardClick = () => {
    if (status === 'ready' || status === 'accepted' || imageUrl) {
      setShowDetailModal(true);
    }
  };

  return (
    <>
      <motion.div
        className={`relative w-full aspect-[3/4] rounded-xl overflow-hidden cursor-pointer
          ${!isUnlocked ? 'opacity-60' : ''}
          ${(status === 'accepted' || imageUrl) ? `border-2 ${rarityConfig.borderStyle}` : 'border border-border'}
        `}
        style={{
          boxShadow: (status === 'accepted' || imageUrl) ? rarityConfig.glow : 'none'
        }}
        whileHover={isUnlocked ? { scale: 1.02 } : {}}
        onClick={handleCardClick}
      >
        {/* Card Front - Always visible */}
        <div className={`absolute inset-0 flex flex-col`}>
          {/* Background Image or Loading/Empty State */}
          {imageUrl ? (
            <div className="absolute inset-0">
              <img 
                src={imageUrl} 
                alt={getLocalizedText(definition.title, language)}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>
          ) : isLoadingImage ? (
            /* Image Generation Loading State */
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
              <div className="absolute inset-0 card-empty-grid" />
              <div className="absolute inset-0 phase-glow-research animate-pulse" />
              
              <div className="relative z-10 flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center backdrop-blur-sm">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
                <span className="text-[10px] text-primary/80 font-mono tracking-[0.2em] uppercase animate-pulse">
                  {isResearching 
                    ? (language === 'ru' ? 'ИССЛЕДУЕМ...' : 'RESEARCHING...') 
                    : (language === 'ru' ? 'ГЕНЕРАЦИЯ...' : 'GENERATING...')}
                </span>
              </div>
              
              <div className="absolute inset-0 card-empty-scanlines pointer-events-none" />
            </div>
          ) : (
            /* Cyberpunk Empty Card State - same as Vision */
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {/* Dark cyberpunk base */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
              
              {/* Animated grid mesh */}
              <div className="absolute inset-0 card-empty-grid" />
              
              {/* Phase-colored radial glow - research phase */}
              <div className="absolute inset-0 phase-glow-research" />
              
              {/* Center orb with phase icon */}
              <div className="relative z-10 flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/20 flex items-center justify-center orb-pulse backdrop-blur-sm">
                  <PhaseIcon phase="research" size="lg" className="opacity-60" />
                </div>
                <span className="text-[10px] text-white/40 font-mono tracking-[0.2em] uppercase">
                  {language === 'ru' ? 'ОЖИДАЕТ FORGE' : 'AWAITING FORGE'}
                </span>
              </div>
              
              {/* Scanlines overlay */}
              <div className="absolute inset-0 card-empty-scanlines pointer-events-none" />
            </div>
          )}

          {/* Content */}
          <div className="relative z-10 flex flex-col h-full">
            {/* Header badge - top left: #06, #07, etc. like Vision */}
            <div className="absolute top-2 left-2 backdrop-blur-md bg-black/40 border border-white/30 rounded px-2 py-1">
              <span className="text-xs font-mono text-white font-bold">
                #{definition.slot.toString().padStart(2, '0')}
              </span>
            </div>
            
            {/* Rarity badge with score - top right (like Vision) */}
            {safeRarityScores && (status === 'ready' || status === 'accepted' || imageUrl) ? (
              <div className="absolute top-2 right-2 flex items-center gap-1.5">
                <div className="backdrop-blur-md bg-black/40 border border-white/30 rounded px-2 py-1">
                  <span className="text-xs font-bold text-white">
                    {safeRarityScores.final_score?.toFixed?.(1) || '?'}
                  </span>
                </div>
                <RarityBadge rarity={rarity} />
              </div>
            ) : imageUrl ? (
              /* Show rarity badge only when there's an image but no scores */
              <div className="absolute top-2 right-2">
                <RarityBadge rarity={rarity} />
              </div>
            ) : (
              /* Status icon when not ready */
              <div className="absolute top-2 right-2">
                <StatusIcon className={`w-5 h-5 ${statusDisplay.color}`} />
              </div>
            )}

            {/* Glassmorphism Card Title Overlay - bottom (simplified like Vision) */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg px-4 py-2 shadow-lg">
                <span className="text-white/90 text-sm font-semibold tracking-widest uppercase">
                  {getLocalizedText(definition.title, language)}
                </span>
              </div>
            </div>

            {/* Center Content Area - only show lock for locked cards */}
            {!imageUrl && !isLoadingImage && !isUnlocked && (
              <div className="flex-1 flex flex-col justify-center items-center p-4">
                <div className="text-center">
                  <Lock className="w-8 h-8 text-white/40 mx-auto mb-2" />
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Detail Modal */}
      <ResearchCardDetailModal
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        definition={definition}
        result={result ? {
          status: result.status,
          final_rarity: result.final_rarity,
          rarity_scores: safeRarityScores,
          findings: safeFindings,
          team_comments: safeTeamComments,
          verdict: result.verdict
        } : undefined}
        imageUrl={imageUrl}
        onAccept={onAccept}
        onDiscuss={() => setShowDiscussion(true)}
        onReResearch={onReResearch}
        isAccepting={isAccepting}
        isReResearching={isResearching}
      />

      <DiscussionDrawer
        open={showDiscussion}
        onOpenChange={setShowDiscussion}
        cardTitle={getLocalizedText(definition.title, language)}
        evaluators={safeAiHelpers}
        onSendMessage={onDiscuss}
      />
    </>
  );
}