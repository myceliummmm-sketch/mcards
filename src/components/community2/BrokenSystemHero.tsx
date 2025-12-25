import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { ExternalLink, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import passportMockup from "@/assets/passport-mockup.png";
import { useState, useEffect } from "react";

interface BrokenSystemHeroProps {
  onActivateExit: () => void;
  memberCount: number | null;
}

export const BrokenSystemHero = ({ onActivateExit, memberCount }: BrokenSystemHeroProps) => {
  const { t } = useTranslation();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Parallax effect for passport mockup
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen relative flex flex-col items-center justify-center p-6 overflow-hidden"
    >
      {/* Video Background with dark overlay */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-30"
        >
          <source src="/videos/chest-opening.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black" />
      </div>

      {/* Scanline effect */}
      <div className="absolute inset-0 z-10 pointer-events-none opacity-10">
        <div 
          className="w-full h-full"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.03) 2px, rgba(0,255,0,0.03) 4px)'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-20 max-w-4xl mx-auto text-center">
        {/* Glitch Headline */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-4"
        >
          <h1 className="text-5xl md:text-7xl font-black glitch-text" data-text={t('brokenSystem.hero.headline1')}>
            {t('brokenSystem.hero.headline1')}
          </h1>
          <h2 className="text-4xl md:text-6xl font-bold text-[#00FF00] mt-2">
            {t('brokenSystem.hero.headline2')}
          </h2>
        </motion.div>

        {/* Subheadline */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8"
      >
        {t('brokenSystem.hero.subheadline').replace('{count}', memberCount?.toLocaleString() || '2,847')}
      </motion.p>

        {/* 3D Passport Mockup */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, type: "spring" }}
          className="relative w-64 h-80 mx-auto mb-10"
          style={{
            transform: `perspective(1000px) rotateY(${mousePosition.x}deg) rotateX(${-mousePosition.y}deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#00FF00]/20 to-transparent blur-2xl" />
          <img
            src={passportMockup}
            alt="Sovereign Passport"
            className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(0,255,0,0.4)]"
          />
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button
            onClick={onActivateExit}
            size="lg"
            className="bg-[#00FF00] hover:bg-[#00CC00] text-black font-bold text-lg px-8 py-6 rounded-full shadow-[0_0_30px_rgba(0,255,0,0.5)] hover:shadow-[0_0_50px_rgba(0,255,0,0.7)] transition-all"
          >
            <Zap className="w-5 h-5 mr-2" />
            {t('brokenSystem.hero.cta')}
          </Button>

          <Button
            variant="ghost"
            size="lg"
            className="text-gray-400 hover:text-[#00FF00] hover:bg-[#00FF00]/10"
            onClick={() => window.open('https://t.me/mycelium_network', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            {t('brokenSystem.hero.secondaryCta')}
          </Button>
        </motion.div>
      </div>

      {/* Glitch CSS */}
      <style>{`
        .glitch-text {
          position: relative;
          color: white;
          animation: glitch 2s infinite;
        }
        
        .glitch-text::before,
        .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        
        .glitch-text::before {
          left: 2px;
          text-shadow: -2px 0 #ff0000;
          clip: rect(24px, 550px, 90px, 0);
          animation: glitch-anim-1 2s infinite linear alternate-reverse;
        }
        
        .glitch-text::after {
          left: -2px;
          text-shadow: -2px 0 #00ff00;
          clip: rect(85px, 550px, 140px, 0);
          animation: glitch-anim-2 2s infinite linear alternate-reverse;
        }
        
        @keyframes glitch {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
        }
        
        @keyframes glitch-anim-1 {
          0% { clip: rect(30px, 9999px, 10px, 0); }
          25% { clip: rect(15px, 9999px, 80px, 0); }
          50% { clip: rect(50px, 9999px, 25px, 0); }
          75% { clip: rect(70px, 9999px, 5px, 0); }
          100% { clip: rect(25px, 9999px, 55px, 0); }
        }
        
        @keyframes glitch-anim-2 {
          0% { clip: rect(65px, 9999px, 100px, 0); }
          25% { clip: rect(5px, 9999px, 45px, 0); }
          50% { clip: rect(80px, 9999px, 35px, 0); }
          75% { clip: rect(25px, 9999px, 90px, 0); }
          100% { clip: rect(45px, 9999px, 15px, 0); }
        }
      `}</style>
    </motion.div>
  );
};
