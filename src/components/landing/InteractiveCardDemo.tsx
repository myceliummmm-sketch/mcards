import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ArrowRight, Loader2, ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DEMO_CARDS, PHASE_COLORS, PHASE_GLOW, PHASE_BORDER_COLORS, PHASE_ACCENT, DemoCard } from '@/data/demoCardData';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDemoCardImages } from '@/hooks/useDemoCardImages';

const DemoCardComponent = ({ 
  card, 
  imageUrl,
  isLoadingImage,
  onSelect,
  onGenerateImage
}: { 
  card: DemoCard; 
  imageUrl?: string;
  isLoadingImage: boolean;
  onSelect: (card: DemoCard) => void;
  onGenerateImage: () => void;
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const getRarityColor = (score: number) => {
    if (score >= 90) return 'text-amber-400';
    if (score >= 80) return 'text-purple-400';
    if (score >= 70) return 'text-blue-400';
    return 'text-emerald-400';
  };

  const getRarityGlow = (score: number) => {
    if (score >= 90) return 'shadow-amber-500/50';
    if (score >= 80) return 'shadow-purple-500/50';
    if (score >= 70) return 'shadow-blue-500/50';
    return 'shadow-emerald-500/50';
  };

  // Generate image on first render if not available
  useEffect(() => {
    if (!imageUrl && !isLoadingImage) {
      onGenerateImage();
    }
  }, [imageUrl, isLoadingImage, onGenerateImage]);

  return (
    <motion.div
      className="relative w-56 h-80 cursor-pointer perspective-1000"
      whileHover={{ scale: 1.05, y: -8 }}
      onHoverStart={() => setIsFlipped(true)}
      onHoverEnd={() => setIsFlipped(false)}
      onClick={() => onSelect(card)}
    >
      <motion.div
        className="relative w-full h-full transition-transform duration-500 transform-style-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front - AI Generated Image */}
        <div 
          className={`absolute inset-0 rounded-xl border-2 ${PHASE_BORDER_COLORS[card.phase]} overflow-hidden shadow-2xl ${PHASE_GLOW[card.phase]}`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Card Image */}
          <div className="absolute inset-0">
            {isLoadingImage ? (
              <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${PHASE_COLORS[card.phase]}`}>
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                  <span className="text-xs text-muted-foreground">Generating artwork...</span>
                </div>
              </div>
            ) : imageUrl ? (
              <img 
                src={imageUrl} 
                alt={card.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${PHASE_COLORS[card.phase]}`}>
                <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
              </div>
            )}
          </div>

          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          
          {/* Top Badge */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            <span className={`px-2 py-1 rounded-md text-xs font-mono uppercase tracking-wider bg-black/60 backdrop-blur-sm ${PHASE_ACCENT[card.phase]}`}>
              {card.phase}
            </span>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm ${getRarityColor(card.evaluation.score)}`}>
              <Sparkles className="w-3 h-3" />
              <span className="text-sm font-bold">{card.evaluation.score}</span>
            </div>
          </div>
          
          {/* Bottom Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-lg font-bold text-white mb-1">{card.title}</h3>
            <p className="text-sm text-white/80 line-clamp-2 leading-tight">
              "{card.content.headline}"
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-white/60">
              <span>Hover to flip</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Back - AI Evaluation */}
        <div 
          className={`absolute inset-0 rounded-xl border-2 ${PHASE_BORDER_COLORS[card.phase]} bg-gradient-to-br from-card/98 to-card backdrop-blur-sm p-4 flex flex-col shadow-2xl ${getRarityGlow(card.evaluation.score)}`}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {/* Evaluator Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <img 
                src={card.evaluation.avatar} 
                alt={card.evaluation.character}
                className="w-12 h-12 rounded-full border-2 border-primary/50"
              />
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                card.evaluation.score >= 90 ? 'bg-amber-500 text-black' :
                card.evaluation.score >= 80 ? 'bg-purple-500 text-white' :
                'bg-blue-500 text-white'
              }`}>
                ✓
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">{card.evaluation.character}</p>
              <p className="text-xs text-muted-foreground">AI Evaluator</p>
            </div>
          </div>
          
          {/* Score Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Card Score</span>
              <span className={`text-3xl font-bold ${getRarityColor(card.evaluation.score)}`}>
                {card.evaluation.score}
              </span>
            </div>
            <div className="w-full h-2 bg-background/50 rounded-full overflow-hidden">
              <motion.div 
                className={`h-full ${
                  card.evaluation.score >= 90 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' : 
                  card.evaluation.score >= 80 ? 'bg-gradient-to-r from-purple-500 to-pink-400' : 
                  'bg-gradient-to-r from-blue-500 to-cyan-400'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${card.evaluation.score}%` }}
                transition={{ delay: 0.3, duration: 0.5 }}
              />
            </div>
          </div>
          
          {/* Feedback */}
          <div className="flex-1">
            <p className="text-sm text-foreground/80 italic leading-relaxed">
              "{card.evaluation.feedback}"
            </p>
          </div>
          
          {/* Card Details */}
          <div className="mt-3 pt-3 border-t border-white/10 space-y-1">
            {card.content.details.slice(0, 2).map((detail, i) => (
              <p key={i} className="text-xs text-muted-foreground line-clamp-1">
                • {detail}
              </p>
            ))}
          </div>
          
          {/* CTA */}
          <div className="mt-3 pt-3 border-t border-white/10">
            <span className="text-xs text-primary flex items-center gap-1">
              Click for full details <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const CardDetailModal = ({ 
  card, 
  imageUrl,
  isOpen, 
  onClose 
}: { 
  card: DemoCard | null; 
  imageUrl?: string;
  isOpen: boolean; 
  onClose: () => void;
}) => {
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

export const InteractiveCardDemo = () => {
  const [selectedCard, setSelectedCard] = useState<DemoCard | null>(null);
  const { images, generateImageForCard, isCardLoading } = useDemoCardImages();

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
      
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            See a Deck in Action
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Each card features unique AI-generated artwork. Hover to reveal evaluations. 
            Click to explore. This is what founders use to validate before they build.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-6 mb-12">
          {DEMO_CARDS.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
            >
              <DemoCardComponent 
                card={card} 
                imageUrl={images[card.id]}
                isLoadingImage={isCardLoading(card.id)}
                onSelect={setSelectedCard}
                onGenerateImage={() => generateImageForCard(card.id)}
              />
            </motion.div>
          ))}
        </div>

        <motion.p 
          className="text-center text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          These cards are from a real founder deck. Your AI Squad will evaluate yours the same way.
        </motion.p>
      </div>

      <AnimatePresence>
        {selectedCard && (
          <CardDetailModal 
            card={selectedCard}
            imageUrl={images[selectedCard.id]}
            isOpen={!!selectedCard} 
            onClose={() => setSelectedCard(null)} 
          />
        )}
      </AnimatePresence>
    </section>
  );
};
