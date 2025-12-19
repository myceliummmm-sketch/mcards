import { cn } from '@/lib/utils';
import type { CardPhase } from '@/data/cardDefinitions';

import visionIcon from '@/assets/icons/vision.png';
import researchIcon from '@/assets/icons/research.png';
import buildIcon from '@/assets/icons/build.png';
import growIcon from '@/assets/icons/grow.png';
import pivotIcon from '@/assets/icons/pivot.png';

const PHASE_ICONS: Record<CardPhase, string> = {
  idea: visionIcon,
  research: researchIcon,
  build: buildIcon,
  grow: growIcon,
  pivot: pivotIcon,
};

interface PhaseIconProps {
  phase: CardPhase;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES = {
  xs: 'w-4 h-4',
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
};

export const PhaseIcon = ({ phase, size = 'md', className }: PhaseIconProps) => {
  return (
    <img
      src={PHASE_ICONS[phase]}
      alt={`${phase} phase`}
      className={cn(SIZE_CLASSES[size], 'object-contain', className)}
    />
  );
};
