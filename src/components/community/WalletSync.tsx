import { motion } from 'framer-motion';
import { Smartphone, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WalletSyncProps {
  onSync: () => void;
  onSkip: () => void;
}

export function WalletSync({ onSync, onSkip }: WalletSyncProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D1117] px-4">
      <motion.div 
        className="w-full max-w-md text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Icon */}
        <motion.div 
          className="flex justify-center mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          <div className="w-20 h-20 rounded-full bg-[#2E7D32]/20 border-2 border-[#2E7D32] flex items-center justify-center">
            <Smartphone className="w-10 h-10 text-[#2E7D32]" />
          </div>
        </motion.div>

        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Secure Your Passport
        </h2>
        <p className="text-white/60 mb-8">
          Add to your wallet for quick access and push notifications when AI analyzes your projects.
        </p>

        {/* Benefits */}
        <div className="space-y-4 mb-8">
          <motion.div 
            className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="w-10 h-10 rounded-full bg-[#2E7D32]/20 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-[#2E7D32]" />
            </div>
            <div className="text-left">
              <p className="text-white font-medium">Instant Access</p>
              <p className="text-white/50 text-sm">One tap to open your passport anywhere</p>
            </div>
          </motion.div>

          <motion.div 
            className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="w-10 h-10 rounded-full bg-[#2E7D32]/20 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-[#2E7D32]" />
            </div>
            <div className="text-left">
              <p className="text-white font-medium">Real-time Updates</p>
              <p className="text-white/50 text-sm">Get notified when AI completes analysis</p>
            </div>
          </motion.div>
        </div>

        {/* Wallet buttons */}
        <div className="space-y-3 mb-6">
          <Button
            onClick={onSync}
            size="lg"
            className="w-full bg-black hover:bg-black/80 text-white border-2 border-white/20 min-h-14 text-lg font-medium"
          >
            <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Add to Apple Wallet
          </Button>

          <Button
            onClick={onSync}
            size="lg"
            className="w-full bg-white hover:bg-white/90 text-black border-2 border-white/20 min-h-14 text-lg font-medium"
          >
            <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 20.5v-17c0-.83.67-1.5 1.5-1.5h15c.83 0 1.5.67 1.5 1.5v17c0 .83-.67 1.5-1.5 1.5h-15c-.83 0-1.5-.67-1.5-1.5zm2-2h14v-13H5v13zm2-11h10v2H7v-2zm0 4h10v2H7v-2zm0 4h7v2H7v-2z"/>
            </svg>
            Add to Google Wallet
          </Button>
        </div>

        {/* Skip option */}
        <button
          onClick={onSkip}
          className="text-white/40 hover:text-white/60 text-sm transition-colors"
        >
          Skip for now
        </button>

        {/* Warning */}
        <motion.p 
          className="text-amber-500/80 text-xs mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          ⚠️ Skipping means you'll miss real-time notifications
        </motion.p>
      </motion.div>
    </div>
  );
}
