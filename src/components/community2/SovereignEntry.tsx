import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, Lock } from "lucide-react";

interface SovereignEntryProps {
  onComplete: (name: string) => void;
}

export const SovereignEntry = ({ onComplete }: SovereignEntryProps) => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [typedText, setTypedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  const fullText = `${t('brokenSystem.identity.title')} ${t('brokenSystem.identity.subtitle')}`;

  // Typewriter effect
  useEffect(() => {
    if (typedText.length < fullText.length) {
      const timeout = setTimeout(() => {
        setTypedText(fullText.slice(0, typedText.length + 1));
      }, 30);
      return () => clearTimeout(timeout);
    } else {
      setIsTyping(false);
    }
  }, [typedText, fullText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onComplete(name.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative"
    >
      {/* Terminal grid background */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: 'linear-gradient(#00FF00 1px, transparent 1px), linear-gradient(90deg, #00FF00 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-md w-full">
        {/* Shield Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-20 h-20 mx-auto mb-8 rounded-full bg-[#00FF00]/10 flex items-center justify-center border border-[#00FF00]/30"
        >
          <Shield className="w-10 h-10 text-[#00FF00]" />
        </motion.div>

        {/* Terminal Message with Typewriter Effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-900/80 border border-[#00FF00]/30 rounded-lg p-4 mb-8 font-mono text-sm"
        >
          <div className="flex items-center gap-2 mb-2 text-[#00FF00]/50">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-2">system.terminal</span>
          </div>
          <p className="text-[#00FF00]">
            {typedText}
            {isTyping && <span className="animate-pulse">▌</span>}
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="relative">
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('brokenSystem.identity.inputPlaceholder')}
              className="w-full bg-black border-2 border-gray-700 focus:border-[#00FF00] rounded-lg px-4 py-4 text-lg text-white placeholder:text-gray-500 transition-colors"
              autoFocus
            />
            <div className="absolute inset-0 rounded-lg pointer-events-none border border-[#00FF00]/20 shadow-[0_0_15px_rgba(0,255,0,0.1)]" />
          </div>

          <Button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-[#00FF00] hover:bg-[#00CC00] text-black font-bold text-lg py-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,255,0,0.3)] hover:shadow-[0_0_30px_rgba(0,255,0,0.5)] transition-all"
          >
            <Lock className="w-5 h-5 mr-2" />
            {t('brokenSystem.identity.cta')}
          </Button>

          <p className="text-center text-[#00FF00]/70 text-sm font-mono">
            🍄 {t('brokenSystem.identity.sporeBonus')}
          </p>
        </motion.form>
      </div>
    </motion.div>
  );
};
