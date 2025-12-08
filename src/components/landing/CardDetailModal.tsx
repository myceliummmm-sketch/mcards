import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, ImageIcon } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DemoCard, PHASE_COLORS, PHASE_ACCENT } from '@/data/demoCardData';

interface CardDetailModalProps {
  card: DemoCard | null;
  imageUrl?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const CardDetailModal = ({ 
  card, 
  imageUrl,
  isOpen, 
  onClose 
}: CardDetailModalProps) => {
  const navigate = useNavigate();

  if (!card) return null;

  const getRarityLabel = (score: number) => {
    if (score >= 90) return { label: 'Legendary', color: 'text-amber-400 bg-amber-500/20 border-amber-500/40' };
    if (score >= 80) return { label: 'Epic', color: 'text-purple-400 bg-purple-500/20 border-purple-500/40' };
    if (score >= 70) return { label: 'Rare', color: 'text-blue-400 bg-blue-500/20 border-blue-500/40' };
    return { label: 'Common', color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40' };
  };

  const rarity = getRarityLabel(card.evaluation.score);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card/95 backdrop-blur-xl border-white/10 p-0 overflow-hidden">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white/80 hover:text-white bg-black/40 rounded-full p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Card Image Section */}
          <div className="relative w-full md:w-2/5 h-48 md:h-auto">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={card.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${PHASE_COLORS[card.phase]}`}>
                <ImageIcon className="w-16 h-16 text-muted-foreground/50" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/80 md:block hidden" />
            <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent md:hidden" />
            
            {/* Rarity Badge */}
            <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-lg border ${rarity.color} backdrop-blur-sm`}>
              <span className="text-sm font-bold">{rarity.label}</span>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 p-6 space-y-5">
            <div>
              <span className={`text-xs uppercase tracking-wider ${PHASE_ACCENT[card.phase]}`}>
                {card.phase} Phase · Slot {card.slot}
              </span>
              <h2 className="text-2xl font-bold text-foreground mt-1">{card.title} Card</h2>
            </div>

            <div className={`p-4 rounded-lg bg-gradient-to-br ${PHASE_COLORS[card.phase]} border border-white/10`}>
              <p className="text-base font-medium text-foreground mb-3">
                "{card.content.headline}"
              </p>
              <ul className="space-y-2">
                {card.content.details.map((detail, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                    <span className={PHASE_ACCENT[card.phase]}>•</span>
                    {detail}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-background/50 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <img 
                  src={card.evaluation.avatar} 
                  alt={card.evaluation.character}
                  className="w-10 h-10 rounded-full border-2 border-primary/50"
                />
                <div className="flex-1">
                  <p className="font-bold text-foreground text-sm">{card.evaluation.character}'s Take</p>
                  <p className="text-xs text-muted-foreground">AI Evaluation</p>
                </div>
                <div className={`text-2xl font-bold ${rarity.color.split(' ')[0]}`}>
                  {card.evaluation.score}
                </div>
              </div>
              <p className="text-sm text-foreground/80 italic">
                "{card.evaluation.feedback}"
              </p>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={() => navigate('/auth')}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                Create Your Own Deck
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                onClick={onClose}
                className="border-white/20"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
