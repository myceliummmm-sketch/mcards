import { motion } from 'framer-motion';
import { Rocket, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ARCHETYPE_DATA, ArchetypeKey } from '@/data/passportQuizData';

interface PortalDashboardProps {
  founderName: string;
  archetype: ArchetypeKey;
  passportNumber: string;
  onStartProjectSeed: () => void;
}

export function PortalDashboard({ 
  founderName, 
  archetype, 
  passportNumber,
  onStartProjectSeed 
}: PortalDashboardProps) {
  const archetypeData = ARCHETYPE_DATA[archetype];

  return (
    <div className="min-h-screen bg-[#0D1117] px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Welcome, {founderName}
          </h1>
          <p className="text-white/60">Your journey in the Mycelium Network begins now</p>
        </motion.div>

        {/* Dashboard grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Passport card */}
          <motion.div 
            className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${archetypeData.color}20` }}
              >
                <User className="w-7 h-7" style={{ color: archetypeData.color }} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{founderName}</h3>
                <p 
                  className="text-sm font-medium"
                  style={{ color: archetypeData.color }}
                >
                  {archetypeData.title}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-white/50">Passport ID</span>
                <span className="text-white font-mono">{passportNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Trait</span>
                <span className="text-white">{archetypeData.trait}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Projects</span>
                <span className="text-white">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Spores</span>
                <span className="text-[#2E7D32] font-bold">50 🍄</span>
              </div>
            </div>
          </motion.div>

          {/* Start project card */}
          <motion.div 
            className="p-6 rounded-2xl bg-gradient-to-br from-[#2E7D32]/20 to-[#1B5E20]/20 border border-[#2E7D32]/30"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-[#2E7D32]" />
              <h3 className="text-xl font-bold text-white">Start Your First Project</h3>
            </div>

            <p className="text-white/60 mb-6">
              Plant your first project seed. Our AI Council will analyze your idea and help you 
              validate it before you build.
            </p>

            <ul className="space-y-2 mb-6 text-sm">
              <li className="flex items-center gap-2 text-white/70">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" />
                60-second problem discovery
              </li>
              <li className="flex items-center gap-2 text-white/70">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" />
                AI-powered market analysis
              </li>
              <li className="flex items-center gap-2 text-white/70">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" />
                Get your Problem Card v1.0
              </li>
            </ul>

            <Button
              onClick={onStartProjectSeed}
              size="lg"
              className="w-full bg-[#2E7D32] hover:bg-[#1B5E20] text-white border-2 border-[#2E7D32] shadow-[4px_4px_0_rgba(46,125,50,0.5)] hover:shadow-[2px_2px_0_rgba(46,125,50,0.5)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all min-h-14 text-lg font-bold"
            >
              <Rocket className="mr-2 w-5 h-5" />
              START MY FIRST PROJECT
            </Button>
          </motion.div>
        </div>

        {/* Quick stats */}
        <motion.div 
          className="grid grid-cols-3 gap-4 mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
            <p className="text-2xl font-bold text-white">0</p>
            <p className="text-xs text-white/50">Cards Created</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
            <p className="text-2xl font-bold text-white">0</p>
            <p className="text-xs text-white/50">Research Done</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
            <p className="text-2xl font-bold text-[#2E7D32]">1</p>
            <p className="text-xs text-white/50">Network Rank</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
