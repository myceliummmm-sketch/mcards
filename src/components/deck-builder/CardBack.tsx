import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { CardDefinition } from '@/data/cardDefinitions';
import { Sparkles } from 'lucide-react';

interface CardBackProps {
  definition: CardDefinition;
  content?: any;
  onEdit: () => void;
}

export const CardBack = ({ 
  definition, 
  content, 
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

      {/* Dark overlay for button visibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70" />

      {/* Single centered button */}
      <div className="relative w-full h-full flex items-center justify-center p-6">
        <Button
          onClick={onEdit}
          size="lg"
          className="gap-2 bg-gradient-to-r from-[#FF6B9D] to-[#B388FF] hover:from-[#FF6B9D]/90 hover:to-[#B388FF]/90 text-white shadow-2xl transition-all hover:scale-105 font-display uppercase tracking-wide text-sm px-8 py-6 backdrop-blur-sm border-2 border-white/20"
        >
          <Sparkles className="w-5 h-5" />
          Open Card
        </Button>
      </div>
    </div>
  );
};