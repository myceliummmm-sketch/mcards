import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { ARCHETYPE_DATA, type ArchetypeKey } from "@/data/passportQuizData";
import { Plus, RotateCcw, Rocket, Clock, Target } from "lucide-react";

interface ProblemCardData {
  id: string;
  answers: number[];
  ai_analysis: {
    problemStatement: string;
    keyInsight: string;
    riskFactor: string;
    firstStep: string;
  } | null;
  created_at: string;
}

interface NetworkDashboardProps {
  founderName: string;
  archetype: ArchetypeKey;
  passportNumber: string;
  problemCards: ProblemCardData[];
  onStartProjectSeed: () => void;
  onReset: () => void;
}

export const NetworkDashboard = ({
  founderName,
  archetype,
  passportNumber,
  problemCards,
  onStartProjectSeed,
  onReset,
}: NetworkDashboardProps) => {
  const { t } = useTranslation();
  const archetypeData = ARCHETYPE_DATA[archetype];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-black p-6 relative"
    >
      {/* Grid background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: 'linear-gradient(#00FF00 1px, transparent 1px), linear-gradient(90deg, #00FF00 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ 
                backgroundColor: `${archetypeData.color}20`,
                border: `2px solid ${archetypeData.color}`
              }}
            >
              <span className="text-xl">🌿</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{founderName}</h1>
              <p className="text-sm text-gray-400 font-mono">{passportNumber}</p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-gray-500 hover:text-red-400 hover:bg-red-400/10"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {t('brokenSystem.dashboard.reset')}
          </Button>
        </div>

        {/* Main Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            {t('brokenSystem.dashboard.headline')}
          </h2>
          <p className="text-gray-400 mb-6">
            {t('brokenSystem.dashboard.subheadline')}
          </p>

          <Button
            onClick={onStartProjectSeed}
            size="lg"
            className="bg-[#00FF00] hover:bg-[#00CC00] text-black font-bold px-8 py-6 rounded-xl shadow-[0_0_20px_rgba(0,255,0,0.3)] hover:shadow-[0_0_30px_rgba(0,255,0,0.5)] transition-all"
          >
            <Rocket className="w-5 h-5 mr-2" />
            {t('brokenSystem.dashboard.startProject')}
          </Button>
        </motion.div>

        {/* Problem Cards Grid */}
        {problemCards.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {t('brokenSystem.dashboard.yourProjects')}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onStartProjectSeed}
                className="text-[#00FF00] hover:bg-[#00FF00]/10"
              >
                <Plus className="w-4 h-4 mr-1" />
                {t('brokenSystem.dashboard.newProject')}
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {problemCards.map((card, index) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 hover:border-[#00FF00]/30 transition-colors"
                >
                  {card.ai_analysis ? (
                    <>
                      <div className="flex items-start gap-3 mb-3">
                        <Target className="w-5 h-5 text-[#00FF00] mt-0.5" />
                        <p className="text-white font-medium line-clamp-2">
                          {card.ai_analysis.problemStatement}
                        </p>
                      </div>
                      <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                        {card.ai_analysis.keyInsight}
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-400">{t('brokenSystem.dashboard.analyzing')}</p>
                  )}
                  
                  <div className="flex items-center text-gray-500 text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(card.created_at).toLocaleDateString()}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {problemCards.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center py-12 border border-dashed border-gray-700 rounded-2xl"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
              <Target className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-500 mb-4">{t('brokenSystem.dashboard.noProjects')}</p>
            <Button
              onClick={onStartProjectSeed}
              variant="outline"
              className="border-[#00FF00]/30 text-[#00FF00] hover:bg-[#00FF00]/10"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('brokenSystem.dashboard.createFirst')}
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
