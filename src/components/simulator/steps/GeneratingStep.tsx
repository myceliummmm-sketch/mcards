import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GeneratingStepProps {
  onComplete: () => void;
}

const hackingLines = [
  '> Analyzing Niche Profitability...',
  '> Finding Blue Ocean...',
  '> Calculating MRR...',
  '> Projecting Revenue Curve...',
  '> Generating Empire Blueprint...',
  '> SUCCESS: Your $10k/mo path is ready!',
];

export function GeneratingStep({ onComplete }: GeneratingStepProps) {
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (lineIndex < hackingLines.length - 1) {
      timeout = setTimeout(() => {
        setLineIndex((prev) => prev + 1);
      }, 600);
    } else {
      timeout = setTimeout(onComplete, 800);
    }

    return () => clearTimeout(timeout);
  }, [lineIndex, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center px-4 py-12 w-full max-w-md"
    >
      {/* Terminal Window */}
      <div className="w-full bg-black/80 border border-[#00FF00]/30 rounded-xl p-6 font-mono">
        {/* Terminal Header */}
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#00FF00]/20">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-xs text-white/40 ml-2">revenue_engine.exe</span>
        </div>

        {/* Terminal Content */}
        <div className="space-y-2 text-sm min-h-[180px]">
          {hackingLines.slice(0, lineIndex + 1).map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`${
                i === lineIndex 
                  ? 'text-[#00FF00]' 
                  : 'text-[#00FF00]/60'
              }`}
            >
              {line}
              {i === lineIndex && (
                <span className="animate-pulse">█</span>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Progress indicator */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-sm text-[#00FF00]/60 mt-6 font-mono"
      >
        Ever Green создаёт твой Vision Statement
      </motion.p>
    </motion.div>
  );
}
