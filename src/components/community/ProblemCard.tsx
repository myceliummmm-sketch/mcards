import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PROJECT_SEED_QUESTIONS } from '@/data/passportQuizData';

interface ProblemCardProps {
  answers: number[];
  founderName: string;
  onViewDashboard: () => void;
  onStartAnother: () => void;
}

export function ProblemCard({ 
  answers, 
  founderName,
  onViewDashboard,
  onStartAnother 
}: ProblemCardProps) {
  const [isGenerating, setIsGenerating] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate generation progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsGenerating(false), 500);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  // Get selected options
  const getSelectedOption = (stepIndex: number) => {
    const question = PROJECT_SEED_QUESTIONS[stepIndex];
    return question.options[answers[stepIndex]];
  };

  const target = getSelectedOption(0);
  const pain = getSelectedOption(1);
  const enemy = getSelectedOption(2);
  const timing = getSelectedOption(3);

  if (isGenerating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D1117] px-4">
        <motion.div 
          className="w-full max-w-md text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-20 h-20 mx-auto mb-8 rounded-full bg-[#2E7D32]/20 border-2 border-[#2E7D32] flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-10 h-10 text-[#2E7D32]" />
          </motion.div>

          <h2 className="text-2xl font-bold text-white mb-4">
            Generating Problem Specification...
          </h2>

          <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-4">
            <motion.div 
              className="h-full bg-[#2E7D32]"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          <p className="text-white/50 text-sm">
            Your AI Council (Ever & Toxic) is analyzing your input...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D1117] px-4 py-12">
      <motion.div 
        className="w-full max-w-lg"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Card */}
        <div className="relative">
          {/* Glow */}
          <div className="absolute inset-0 blur-3xl bg-[#2E7D32]/20 rounded-3xl" />
          
          {/* Card content */}
          <div className="relative backdrop-blur-xl bg-white/5 border-2 border-[#2E7D32]/40 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-[#2E7D32]/20 px-6 py-4 border-b border-[#2E7D32]/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#2E7D32] text-xs font-bold uppercase tracking-wider">Problem Card</p>
                  <p className="text-white font-bold">v1.0</p>
                </div>
                <div className="text-right">
                  <p className="text-white/50 text-xs">Created by</p>
                  <p className="text-white font-medium">{founderName}</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Target */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-white/50 text-xs uppercase tracking-wider mb-1">🎯 Target Audience</p>
                <p className="text-white font-semibold flex items-center gap-2">
                  <span>{target.icon}</span>
                  {target.label}
                </p>
              </div>

              {/* Pain */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-white/50 text-xs uppercase tracking-wider mb-1">💢 Core Pain</p>
                <p className="text-white font-semibold flex items-center gap-2">
                  <span>{pain.icon}</span>
                  {pain.label}
                </p>
              </div>

              {/* Enemy */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-white/50 text-xs uppercase tracking-wider mb-1">⚔️ Why Solutions Fail</p>
                <p className="text-white font-semibold flex items-center gap-2">
                  <span>{enemy.icon}</span>
                  {enemy.label}
                </p>
              </div>

              {/* Timing */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-white/50 text-xs uppercase tracking-wider mb-1">⏰ Why Now</p>
                <p className="text-white font-semibold flex items-center gap-2">
                  <span>{timing.icon}</span>
                  {timing.label}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-white/5 border-t border-white/10">
              <p className="text-white/50 text-xs text-center">
                🤖 AI Council is preparing deeper analysis...
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Button
            onClick={onViewDashboard}
            size="lg"
            className="flex-1 bg-[#2E7D32] hover:bg-[#1B5E20] text-white border-2 border-[#2E7D32] shadow-[4px_4px_0_rgba(46,125,50,0.5)] hover:shadow-[2px_2px_0_rgba(46,125,50,0.5)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all min-h-12 font-bold"
          >
            View Dashboard
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>

          <Button
            onClick={onStartAnother}
            variant="outline"
            size="lg"
            className="border-2 border-white/20 text-white hover:bg-white/10 min-h-12"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
