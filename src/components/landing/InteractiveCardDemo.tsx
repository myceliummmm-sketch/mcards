import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Loader2, ImageIcon } from 'lucide-react';
import { DEMO_CARDS, PHASE_COLORS, PHASE_GLOW, PHASE_BORDER_COLORS, PHASE_ACCENT, DemoCard } from '@/data/demoCardData';
import { useDemoCardImages } from '@/hooks/useDemoCardImages';
import { CardDetailModal } from './CardDetailModal';

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
            Each card features unique custom artwork. Hover to reveal evaluations. 
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
