import { motion } from 'framer-motion';
import { ArrowRight, Users, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import passportMockup from '@/assets/passport-mockup.png';
import myceliumBg from '@/assets/mycelium-network.gif';

interface PortalHeroProps {
  memberCount: number | null;
  onInitialize: () => void;
}

export function PortalHero({ memberCount, onInitialize }: PortalHeroProps) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${myceliumBg})` }}
      />
      <div className="absolute inset-0 bg-[#0D1117]/70" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          {/* Left side - Text content */}
          <motion.div 
            className="flex-1 text-center lg:text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Member count badge */}
            {memberCount !== null && (
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2E7D32]/20 border border-[#2E7D32]/40 mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Users className="w-4 h-4 text-[#2E7D32]" />
              <span className="text-sm text-[#2E7D32] font-medium">
                {memberCount.toLocaleString()} founders already in
              </span>
            </motion.div>
            )}

            {/* Main headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
              THE SOLO GRIND
              <br />
              <span className="text-[#2E7D32]">IS DEAD.</span>
              <br />
              <span className="text-white/90">JOIN THE LIVING NETWORK.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-white/70 mb-8 max-w-xl">
              Get your Digital Passport. Unlock AI-powered research. 
              Build with a network that grows with you.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                onClick={onInitialize}
                size="lg"
                className="group bg-[#2E7D32] hover:bg-[#1B5E20] text-white border-2 border-[#2E7D32] shadow-[4px_4px_0_rgba(46,125,50,0.5)] hover:shadow-[2px_2px_0_rgba(46,125,50,0.5)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all min-h-14 text-lg font-bold"
              >
                INITIALIZE MY PASSPORT
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-2 border-white/20 text-white hover:bg-white/10 min-h-14"
              >
                <a 
                  href="https://t.me/myceliumnetwork" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  <Send className="mr-2 w-5 h-5" />
                  Join Telegram
                </a>
              </Button>
            </div>
          </motion.div>

          {/* Right side - Passport mockup */}
          <motion.div 
            className="flex-1 flex justify-center lg:justify-end"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              className="relative"
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 2, 0]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 blur-3xl bg-[#2E7D32]/30 rounded-3xl scale-110" />
              
              {/* Passport image */}
              <img 
                src={passportMockup} 
                alt="Mycelium Digital Passport" 
                className="relative z-10 w-full max-w-md lg:max-w-lg drop-shadow-2xl"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
          <div className="w-1 h-2 bg-white/50 rounded-full" />
        </div>
      </motion.div>
    </div>
  );
}
