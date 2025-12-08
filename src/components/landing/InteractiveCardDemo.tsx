import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DEMO_CARDS, PHASE_COLORS, PHASE_GLOW, DemoCard } from '@/data/demoCardData';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const DemoCardComponent = ({ 
  card, 
  onSelect 
}: { 
  card: DemoCard; 
  onSelect: (card: DemoCard) => void;
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const getRarityColor = (score: number) => {
    if (score >= 90) return 'text-amber-400';
    if (score >= 80) return 'text-purple-400';
    if (score >= 70) return 'text-blue-400';
    return 'text-emerald-400';
  };

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
        {/* Front */}
        <div 
          className={`absolute inset-0 rounded-xl border border-white/10 bg-gradient-to-br ${PHASE_COLORS[card.phase]} backdrop-blur-sm p-4 flex flex-col shadow-2xl ${PHASE_GLOW[card.phase]}`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              {card.phase} · Slot {card.slot}
            </span>
            <Sparkles className="w-4 h-4 text-primary opacity-60" />
          </div>
          
          <h3 className="text-lg font-bold text-foreground mb-2">{card.title}</h3>
          
          <p className="text-sm text-foreground/90 font-medium mb-3 leading-tight">
            "{card.content.headline}"
          </p>
          
          <div className="flex-1 space-y-1.5">
            {card.content.details.map((detail, i) => (
              <p key={i} className="text-xs text-muted-foreground leading-snug">
                • {detail}
              </p>
            ))}
          </div>
          
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Hover to flip</span>
            <div className={`text-lg font-bold ${getRarityColor(card.evaluation.score)}`}>
              {card.evaluation.score}
            </div>
          </div>
        </div>

        {/* Back */}
        <div 
          className="absolute inset-0 rounded-xl border border-white/10 bg-gradient-to-br from-card/95 to-card backdrop-blur-sm p-4 flex flex-col shadow-2xl"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <img 
              src={card.evaluation.avatar} 
              alt={card.evaluation.character}
              className="w-10 h-10 rounded-full border-2 border-primary/50"
            />
            <div>
              <p className="text-sm font-bold text-foreground">{card.evaluation.character}</p>
              <p className="text-xs text-muted-foreground">AI Evaluator</p>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Card Score</span>
                <span className={`text-2xl font-bold ${getRarityColor(card.evaluation.score)}`}>
                  {card.evaluation.score}
                </span>
              </div>
              <div className="w-full h-2 bg-background/50 rounded-full overflow-hidden">
                <motion.div 
                  className={`h-full ${card.evaluation.score >= 90 ? 'bg-amber-400' : card.evaluation.score >= 80 ? 'bg-purple-400' : 'bg-blue-400'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${card.evaluation.score}%` }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                />
              </div>
            </div>
            
            <p className="text-sm text-foreground/80 italic leading-relaxed">
              "{card.evaluation.feedback}"
            </p>
          </div>
          
          <div className="mt-3 pt-3 border-t border-white/10">
            <span className="text-xs text-primary flex items-center gap-1">
              Click to explore <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const CardDetailModal = ({ 
  card, 
  isOpen, 
  onClose 
}: { 
  card: DemoCard | null; 
  isOpen: boolean; 
  onClose: () => void;
}) => {
  const navigate = useNavigate();

  if (!card) return null;

  const getRarityLabel = (score: number) => {
    if (score >= 90) return { label: 'Legendary', color: 'text-amber-400 bg-amber-500/20' };
    if (score >= 80) return { label: 'Epic', color: 'text-purple-400 bg-purple-500/20' };
    if (score >= 70) return { label: 'Rare', color: 'text-blue-400 bg-blue-500/20' };
    return { label: 'Common', color: 'text-emerald-400 bg-emerald-500/20' };
  };

  const rarity = getRarityLabel(card.evaluation.score);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-card/95 backdrop-blur-xl border-white/10">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${rarity.color}`}>
                {rarity.label}
              </span>
              <span className="text-xs text-muted-foreground uppercase">
                {card.phase} Phase · Slot {card.slot}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">{card.title} Card</h2>
          </div>

          <div className={`p-4 rounded-lg bg-gradient-to-br ${PHASE_COLORS[card.phase]} border border-white/10`}>
            <p className="text-lg font-medium text-foreground mb-4">
              "{card.content.headline}"
            </p>
            <ul className="space-y-2">
              {card.content.details.map((detail, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                  <span className="text-primary mt-1">•</span>
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
                className="w-12 h-12 rounded-full border-2 border-primary/50"
              />
              <div>
                <p className="font-bold text-foreground">{card.evaluation.character}'s Evaluation</p>
                <p className="text-sm text-muted-foreground">AI Squad Feedback</p>
              </div>
              <div className={`ml-auto text-3xl font-bold ${rarity.color.split(' ')[0]}`}>
                {card.evaluation.score}
              </div>
            </div>
            <p className="text-foreground/80 italic">
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
              Keep Exploring
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const InteractiveCardDemo = () => {
  const [selectedCard, setSelectedCard] = useState<DemoCard | null>(null);

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
      
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
            Hover to reveal AI evaluations. Click to explore the full card. 
            This is what founders use to validate before they build.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-6 mb-12">
          {DEMO_CARDS.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <DemoCardComponent card={card} onSelect={setSelectedCard} />
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
            isOpen={!!selectedCard} 
            onClose={() => setSelectedCard(null)} 
          />
        )}
      </AnimatePresence>
    </section>
  );
};
