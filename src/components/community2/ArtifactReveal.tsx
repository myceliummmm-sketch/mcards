import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { ARCHETYPE_DATA, type ArchetypeKey } from "@/data/passportQuizData";
import { Wallet, ArrowRight, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

interface ArtifactRevealProps {
  founderName: string;
  archetype: ArchetypeKey;
  passportNumber: string;
  onContinue: () => void;
  onSkipWallet: () => void;
}

export const ArtifactReveal = ({ 
  founderName, 
  archetype, 
  passportNumber,
  onContinue,
  onSkipWallet
}: ArtifactRevealProps) => {
  const { t } = useTranslation();
  const [isFlipped, setIsFlipped] = useState(false);
  const [sporeCount, setSporeCount] = useState(0);
  const archetypeData = ARCHETYPE_DATA[archetype];

  // Card flip animation
  useEffect(() => {
    const flipTimeout = setTimeout(() => {
      setIsFlipped(true);
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00FF00', '#00CC00', '#008800']
      });
    }, 800);

    return () => clearTimeout(flipTimeout);
  }, []);

  // Spore counter animation
  useEffect(() => {
    if (!isFlipped) return;

    const interval = setInterval(() => {
      setSporeCount(prev => {
        if (prev >= 50) {
          clearInterval(interval);
          return 50;
        }
        return prev + 1;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [isFlipped]);

  const handleAddToWallet = () => {
    onContinue();
  };

  const handleSkip = () => {
    onSkipWallet();
    onContinue();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden"
    >
      {/* Radial glow background */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(0, 255, 0, 0.1) 0%, transparent 50%)'
        }}
      />

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-8"
      >
        <p className="text-[#00FF00] font-mono text-sm tracking-widest mb-2">
          {t('brokenSystem.reveal.issued')}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-white">
          {t('brokenSystem.reveal.welcome')}
        </h1>
      </motion.div>

      {/* Flip Card Container */}
      <div className="relative w-72 h-96 mb-8 perspective-1000">
        <motion.div
          className="absolute inset-0 w-full h-full"
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.8, type: "spring" }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Back of card (shown first) */}
          <div 
            className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 flex items-center justify-center backface-hidden"
          >
            <div className="text-center">
              <Sparkles className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 font-mono">Processing...</p>
            </div>
          </div>

          {/* Front of card (passport) */}
          <div 
            className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden backface-hidden"
            style={{ transform: 'rotateY(180deg)' }}
          >
            <div 
              className="w-full h-full p-6 flex flex-col"
              style={{
                background: `linear-gradient(135deg, ${archetypeData.color}20 0%, black 50%, ${archetypeData.color}10 100%)`,
                border: `2px solid ${archetypeData.color}`,
                boxShadow: `0 0 30px ${archetypeData.color}40`
              }}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs text-gray-400 font-mono">{t('brokenSystem.reveal.sovereignNode')}</p>
                  <p className="text-xs text-gray-500 font-mono">{passportNumber}</p>
                </div>
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${archetypeData.color}30` }}
                >
                  <span className="text-xl">🌿</span>
                </div>
              </div>

              {/* Name */}
              <div className="flex-1 flex flex-col justify-center">
                <h2 className="text-2xl font-bold text-white mb-2">{founderName}</h2>
                <p 
                  className="text-lg font-semibold"
                  style={{ color: archetypeData.color }}
                >
                  {archetypeData.title}
                </p>
                <p className="text-sm text-gray-400 mt-1">{archetypeData.trait}</p>
              </div>

              {/* Spore Balance */}
              <div className="mt-auto">
                <div className="bg-black/50 rounded-lg p-3 border border-[#00FF00]/30">
                  <p className="text-xs text-gray-400 mb-1">{t('brokenSystem.reveal.balance')}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🍄</span>
                    <span className="text-2xl font-bold text-[#00FF00] font-mono">
                      {sporeCount}
                    </span>
                    <span className="text-gray-500 text-sm">SPORES</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* CTAs */}
      <AnimatePresence>
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col gap-3 w-full max-w-xs"
          >
            <Button
              onClick={handleAddToWallet}
              className="w-full bg-[#00FF00] hover:bg-[#00CC00] text-black font-bold py-6 rounded-xl shadow-[0_0_20px_rgba(0,255,0,0.3)]"
            >
              <Wallet className="w-5 h-5 mr-2" />
              {t('brokenSystem.reveal.addToWallet')}
            </Button>

            <Button
              onClick={handleSkip}
              variant="ghost"
              className="text-gray-400 hover:text-white hover:bg-white/5"
            >
              {t('brokenSystem.reveal.skipWallet')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backface hidden style */}
      <style>{`
        .backface-hidden {
          backface-visibility: hidden;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </motion.div>
  );
};
