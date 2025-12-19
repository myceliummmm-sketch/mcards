import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, MessageCircle, ArrowLeft, RefreshCw, XCircle } from 'lucide-react';
import { type CardDefinition, getLocalizedText } from '@/data/cardDefinitions';
import { useLanguage } from '@/contexts/LanguageContext';
import { RARITY_CONFIG, Rarity } from '@/data/rarityConfig';
import { TeamFindings } from './TeamFindings';


interface ResearchCardDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  definition: CardDefinition;
  result?: {
    status: string;
    final_rarity?: string;
    rarity_scores?: {
      relevance?: number;
      source_quality?: number;
      actuality?: number;
      actionability?: number;
      uniqueness?: number;
      final_score?: number;
      vision_ceiling?: number;
    };
    findings?: Record<string, any>;
    team_comments?: Array<{
      characterId: string;
      comment: string;
      sentiment: string;
    }>;
    verdict?: string | null;
  };
  imageUrl?: string | null;
  onAccept?: () => void;
  onDiscuss?: () => void;
  onReResearch?: () => void;
  isAccepting?: boolean;
  isReResearching?: boolean;
}

export function ResearchCardDetailModal({
  open,
  onOpenChange,
  definition,
  result,
  imageUrl,
  onAccept,
  onDiscuss,
  onReResearch,
  isAccepting = false,
  isReResearching = false
}: ResearchCardDetailModalProps) {
  const { language } = useLanguage();
  const status = result?.status || 'locked';
  const rarity = (result?.final_rarity as Rarity) || 'common';
  const rarityConfig = RARITY_CONFIG[rarity] || RARITY_CONFIG.common;
  
  // Card is effectively accepted if it has findings and image
  const isEffectivelyAccepted = status === 'accepted' || (result?.findings && imageUrl);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-1/2 sm:max-w-none p-0">
        <SheetHeader className="px-6 py-4 border-b border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="gap-2 hover:bg-primary/10"
            >
              <ArrowLeft className="w-4 h-4" />
              {language === 'ru' ? 'Вернуться к колоде' : 'Back to deck'}
            </Button>
          </div>
          
          <SheetTitle className="text-left mt-4">
            <div className="flex items-center gap-3">
              <Badge 
                className={`${rarityConfig.textColor} bg-opacity-20`}
                style={{ backgroundColor: `${rarityConfig.glow}20` }}
              >
                R-{definition.slot - 5}
              </Badge>
              <span className="text-2xl font-display bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {getLocalizedText(definition.title, language)}
              </span>
            </div>
            <div className="text-sm text-muted-foreground mt-2 font-normal">
              {getLocalizedText(definition.coreQuestion, language)}
            </div>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="p-6 space-y-6">
            {/* Large Card Image at Top */}
            {imageUrl && (
              <div className="relative aspect-video rounded-lg overflow-hidden border border-primary/20">
                <img 
                  src={imageUrl} 
                  alt={getLocalizedText(definition.title, language)}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 right-3">
                  <Badge className={`${rarityConfig.textColor} backdrop-blur-sm`}>
                    {rarityConfig.label}
                  </Badge>
                </div>
              </div>
            )}

            {/* Team Findings - shows insights, scores and team comments */}
            <TeamFindings 
              findings={result?.findings || null}
              teamComments={result?.team_comments || null}
              rarityScores={result?.rarity_scores as Record<string, number> || null}
              verdict={result?.verdict}
            />

            {/* Verdict badge */}
            {result?.verdict && (
              <div className="flex justify-center">
                <Badge className={`text-lg px-4 py-2 ${
                  result.verdict === 'go' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                  result.verdict === 'conditional_go' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                  result.verdict === 'pivot' ? 'bg-orange-500/20 text-orange-400 border-orange-500/50' :
                  'bg-red-500/20 text-red-400 border-red-500/50'
                }`}>
                  {result.verdict.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            )}

            {/* Actions for ready status (not yet accepted, no image) */}
            {status === 'ready' && !isEffectivelyAccepted && (
              <div className="space-y-3 pt-4 border-t border-border">
                {/* Main actions row */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => {
                      onOpenChange(false);
                      onDiscuss?.();
                    }}
                    disabled={isAccepting}
                  >
                    <MessageCircle className="w-4 h-4" />
                    {language === 'ru' ? 'Обсудить' : 'Discuss'}
                  </Button>
                  <Button
                    className="flex-1 gap-2"
                    onClick={() => {
                      onAccept?.();
                      onOpenChange(false);
                    }}
                    disabled={isAccepting || !result?.findings}
                  >
                    <CheckCircle className="w-4 h-4" />
                    {isAccepting 
                      ? (language === 'ru' ? 'Принятие...' : 'Accepting...') 
                      : (language === 'ru' ? 'Принять!' : 'Accept')}
                  </Button>
                </div>
                
                {/* Not resonating button */}
                <Button
                  variant="ghost"
                  className="w-full gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    onReResearch?.();
                  }}
                  disabled={isAccepting}
                >
                  <XCircle className="w-4 h-4" />
                  {language === 'ru' ? 'Не резонирует — найти другие инсайты' : 'Doesn\'t resonate — find other insights'}
                </Button>
              </div>
            )}

            {/* Re-research button for accepted cards (or effectively accepted) */}
            {isEffectivelyAccepted && onReResearch && (
              <div className="pt-4 border-t border-border">
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => {
                    onReResearch();
                    onOpenChange(false);
                  }}
                  disabled={isReResearching}
                >
                  <RefreshCw className={`w-4 h-4 ${isReResearching ? 'animate-spin' : ''}`} />
                  {isReResearching 
                    ? (language === 'ru' ? 'Исследование...' : 'Researching...') 
                    : (language === 'ru' ? 'Найти новые инсайты' : 'Find new insights')}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  {language === 'ru' 
                    ? 'AI найдёт 3 новых инсайта для этой карточки' 
                    : 'AI will find 3 new insights for this card'}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
