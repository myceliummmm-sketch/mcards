import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ARCHETYPE_DATA, ArchetypeKey, generatePassportNumber } from '@/data/passportQuizData';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import passportMockup from '@/assets/passport-mockup.png';

interface PassportRevealProps {
  founderName: string;
  archetype: ArchetypeKey;
  onContinue: () => void;
}

export function PassportReveal({ founderName, archetype, onContinue }: PassportRevealProps) {
  const [passportNumber] = useState(() => generatePassportNumber());
  const [revealed, setRevealed] = useState(false);
  const archetypeData = ARCHETYPE_DATA[archetype];

  useEffect(() => {
    // Delay reveal animation
    const timer = setTimeout(() => {
      setRevealed(true);
      
      // Fire confetti with teal/primary colors
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: [archetypeData.color, 'hsl(190, 100%, 50%)', '#ffffff']
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [archetypeData.color]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0D1117] px-4 py-6">
      {/* Main content - centered and takes available space */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-2xl text-center">
          {/* Reveal animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
            animate={{ 
              opacity: revealed ? 1 : 0, 
              scale: revealed ? 1 : 0.8,
              rotateY: revealed ? 0 : -90
            }}
            transition={{ 
              duration: 0.8, 
              type: "spring",
              stiffness: 100
            }}
          >
            {/* Passport card - reduced size */}
            <div className="relative mx-auto mb-6 max-w-xs">
              {/* Glow effect */}
              <div 
                className="absolute inset-0 blur-3xl rounded-3xl scale-110 opacity-50"
                style={{ backgroundColor: archetypeData.color }}
              />
              
              {/* Passport image */}
              <div className="relative z-10">
                <img 
                  src={passportMockup} 
                  alt="Your Mycelium Passport" 
                  className="w-full drop-shadow-2xl"
                />
                
                {/* Overlay with user data */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 20 }}
                    transition={{ delay: 0.5 }}
                    className="bg-black/60 backdrop-blur-sm rounded-xl p-4 mt-12"
                  >
                    <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Founder</p>
                    <h3 className="text-xl font-bold text-white mb-2">{founderName}</h3>
                    
                    <div 
                      className="inline-block px-3 py-1.5 rounded-full text-xs font-bold mb-2"
                      style={{ 
                        backgroundColor: `${archetypeData.color}20`,
                        color: archetypeData.color,
                        border: `1px solid ${archetypeData.color}40`
                      }}
                    >
                      {archetypeData.title}
                    </div>
                    
                    <p className="text-white/40 text-xs">
                      {passportNumber}
                    </p>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Archetype info - compact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 20 }}
              transition={{ delay: 0.8 }}
              className="mb-6"
            >
              <p className="text-lg text-white/80 mb-1">
                {archetypeData.description}
              </p>
              <p 
                className="text-sm font-semibold"
                style={{ color: archetypeData.color }}
              >
                Trait: {archetypeData.trait}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Continue button - fixed at bottom, always visible */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 20 }}
        transition={{ delay: 1 }}
        className="w-full max-w-md mx-auto pb-4"
      >
        <Button
          onClick={onContinue}
          size="lg"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-primary shadow-[4px_4px_0_hsl(var(--primary)/0.5)] hover:shadow-[2px_2px_0_hsl(var(--primary)/0.5)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all min-h-14 text-lg font-bold"
        >
          CONTINUE
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </motion.div>
    </div>
  );
}
