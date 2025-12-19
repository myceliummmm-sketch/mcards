import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Sparkles, ArrowRight, Star, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Insight, RARITY_COLORS, calculateRarity, Rarity } from '@/types/research';

interface ResearchCompletionScreenProps {
  results: { resonated: boolean; insight: Insight }[];
  onContinue: () => void;
}

export function ResearchCompletionScreen({ 
  results, 
  onContinue 
}: ResearchCompletionScreenProps) {
  const resonatedCount = results.filter(r => r.resonated).length;
  const totalInsights = results.length;
  const resonanceRate = (resonatedCount / totalInsights) * 100;
  
  // Calculate average score of resonated insights
  const resonatedInsights = results.filter(r => r.resonated);
  const averageScore = resonatedInsights.length > 0
    ? resonatedInsights.reduce((sum, r) => sum + r.insight.score, 0) / resonatedInsights.length
    : 0;
  
  const finalRarity = calculateRarity(averageScore);
  const rarityColor = RARITY_COLORS[finalRarity];
  const rarityLabel = finalRarity.charAt(0).toUpperCase() + finalRarity.slice(1);

  // Group by Vision card
  const visionCardStats = [1, 2, 3, 4, 5].map(slot => {
    const slotResults = results.filter(r => r.insight.visionCardSlot === slot);
    const resonated = slotResults.filter(r => r.resonated).length;
    return { slot, total: slotResults.length, resonated };
  });

  // Determine verdict based on resonance rate
  const getVerdict = () => {
    if (resonanceRate >= 80) return { text: 'GO! 🚀', color: 'text-green-400', desc: 'Отличная валидация! Двигайся вперёд.' };
    if (resonanceRate >= 60) return { text: 'CONDITIONAL GO ⚡', color: 'text-yellow-400', desc: 'Хорошо, но есть что доработать.' };
    if (resonanceRate >= 40) return { text: 'PIVOT 🔄', color: 'text-orange-400', desc: 'Нужно пересмотреть подход.' };
    return { text: 'STOP ✋', color: 'text-red-400', desc: 'Идея требует серьёзной переработки.' };
  };

  const verdict = getVerdict();

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ 
              backgroundColor: rarityColor.bg,
              boxShadow: `0 0 40px ${rarityColor.glow}`,
            }}
          >
            <Trophy className="w-10 h-10" style={{ color: rarityColor.primary }} />
          </motion.div>
          
          <h1 className="text-3xl font-bold mb-2">Research Complete!</h1>
          <p className="text-muted-foreground">
            🌲 Ever Green подводит итоги
          </p>
        </motion.div>

        {/* Main Stats Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl p-6 mb-6 border-2"
          style={{ 
            backgroundColor: rarityColor.bg,
            borderColor: rarityColor.primary,
            boxShadow: `0 0 30px ${rarityColor.glow}`,
          }}
        >
          {/* Verdict */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: 'spring' }}
              className={`text-4xl font-black ${verdict.color}`}
            >
              {verdict.text}
            </motion.div>
            <p className="text-sm text-muted-foreground mt-2">{verdict.desc}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 rounded-lg bg-black/20">
              <div className="text-3xl font-bold text-green-400">
                {resonatedCount}
              </div>
              <div className="text-xs text-muted-foreground">
                Резонирует
              </div>
            </div>
            <div className="text-center p-3 rounded-lg bg-black/20">
              <div className="text-3xl font-bold text-muted-foreground">
                {totalInsights - resonatedCount}
              </div>
              <div className="text-xs text-muted-foreground">
                Не резонирует
              </div>
            </div>
            <div className="text-center p-3 rounded-lg bg-black/20">
              <div className="text-3xl font-bold" style={{ color: rarityColor.primary }}>
                {resonanceRate.toFixed(0)}%
              </div>
              <div className="text-xs text-muted-foreground">
                Резонанс
              </div>
            </div>
          </div>

          {/* Average Score & Rarity */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-black/30">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" style={{ color: rarityColor.primary }} />
              <span className="font-bold" style={{ color: rarityColor.primary }}>
                {rarityLabel}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="font-bold">
                {averageScore.toFixed(1)}/10
              </span>
            </div>
          </div>
        </motion.div>

        {/* Vision Cards Breakdown */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            По Vision картам:
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {visionCardStats.map(({ slot, total, resonated }) => (
              <motion.div
                key={slot}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6 + slot * 0.1 }}
                className={`p-3 rounded-lg text-center ${
                  resonated >= 2 
                    ? 'bg-green-500/20 border border-green-500/30' 
                    : resonated >= 1
                      ? 'bg-yellow-500/20 border border-yellow-500/30'
                      : 'bg-red-500/20 border border-red-500/30'
                }`}
              >
                <div className="text-xs font-medium mb-1">V-0{slot}</div>
                <div className="text-lg font-bold">
                  {resonated}/{total}
                </div>
                {resonated === total && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8 + slot * 0.1 }}
                  >
                    <TrendingUp className="w-4 h-4 mx-auto text-green-400 mt-1" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Continue Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold"
            onClick={onContinue}
          >
            Продолжить
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
