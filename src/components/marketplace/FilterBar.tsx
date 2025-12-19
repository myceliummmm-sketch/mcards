import { Filter, SortAsc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { INDUSTRY_CATEGORIES, SORT_OPTIONS, Rarity } from '@/data/rarityConfig';
import { useTranslation } from '@/hooks/useTranslation';

interface FilterBarProps {
  selectedPhases: string[];
  selectedRarities: Rarity[];
  selectedIndustries: string[];
  sortBy: string;
  gapFillerMode: boolean;
  showOwned: boolean;
  hasRecommendations?: boolean;
  onPhaseToggle: (phase: string) => void;
  onRarityToggle: (rarity: Rarity) => void;
  onIndustryChange: (industry: string) => void;
  onSortChange: (sort: string) => void;
  onGapFillerToggle: () => void;
  onShowOwnedToggle: () => void;
  onClearFilters: () => void;
}

export const FilterBar = ({
  selectedPhases,
  selectedRarities,
  selectedIndustries,
  sortBy,
  gapFillerMode,
  showOwned,
  hasRecommendations = false,
  onPhaseToggle,
  onRarityToggle,
  onIndustryChange,
  onSortChange,
  onGapFillerToggle,
  onShowOwnedToggle,
  onClearFilters,
}: FilterBarProps) => {
  const { t } = useTranslation();
  const phases = ['idea', 'research', 'build', 'grow'];
  const rarities: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

  const hasActiveFilters =
    selectedPhases.length > 0 ||
    selectedRarities.length > 0 ||
    selectedIndustries.length > 0 ||
    gapFillerMode ||
    !showOwned;

  return (
    <div className="space-y-4 p-4 bg-card/50 backdrop-blur-sm border border-border rounded-lg">
      {/* Main Filters Row */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-muted-foreground" />
          <span className="text-sm font-medium">{t('marketplace.filters')}</span>
        </div>

        {/* Phase Filter */}
        <div className="flex gap-2">
          {phases.map((phase) => (
            <Badge
              key={phase}
              variant={selectedPhases.includes(phase) ? 'default' : 'outline'}
              className="cursor-pointer hover:scale-105 transition-transform"
              onClick={() => onPhaseToggle(phase)}
            >
              {phase === 'idea' && '💡'}
              {phase === 'research' && '🔬'}
              {phase === 'build' && '🔧'}
              {phase === 'grow' && '🚀'}
              {' '}
              {t(`phases.${phase}`)}
            </Badge>
          ))}
        </div>

        <div className="h-6 w-px bg-border" />

        {/* Rarity Filter */}
        <div className="flex gap-2">
          {rarities.map((rarity) => (
            <Badge
              key={rarity}
              variant={selectedRarities.includes(rarity) ? 'default' : 'outline'}
              className="cursor-pointer hover:scale-105 transition-transform capitalize"
              onClick={() => onRarityToggle(rarity)}
            >
              {rarity}
            </Badge>
          ))}
        </div>

        <div className="h-6 w-px bg-border" />

        {/* Industry Filter */}
        <Select value={selectedIndustries[0] || 'all'} onValueChange={onIndustryChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('marketplace.allIndustries')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('marketplace.allIndustries')}</SelectItem>
            {INDUSTRY_CATEGORIES.map((industry) => (
              <SelectItem key={industry} value={industry}>
                {industry}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <SortAsc size={18} className="text-muted-foreground" />
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {hasRecommendations && (
                <SelectItem value="recommended">✨ {t('marketplace.recommended')}</SelectItem>
              )}
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            {t('marketplace.clearAll')}
          </Button>
        )}
      </div>

      {/* Special Modes Row */}
      <div className="flex gap-6 items-center pt-2 border-t border-border">
        <div className="flex items-center gap-3">
          <Switch checked={gapFillerMode} onCheckedChange={onGapFillerToggle} id="gap-mode" />
          <Label htmlFor="gap-mode" className="cursor-pointer flex items-center gap-2">
            <span className="text-cyan-400">✨</span>
            {t('marketplace.gapFillerMode')}
            <span className="text-xs text-muted-foreground">{t('marketplace.gapFillerDesc')}</span>
          </Label>
        </div>

        <div className="flex items-center gap-3">
          <Switch checked={showOwned} onCheckedChange={onShowOwnedToggle} id="show-owned" />
          <Label htmlFor="show-owned" className="cursor-pointer">
            {t('marketplace.showOwnedCards')}
          </Label>
        </div>
      </div>
    </div>
  );
};