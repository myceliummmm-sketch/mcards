import { motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PersistentWalletBannerProps {
  onSync: () => void;
  onDismiss: () => void;
}

export function PersistentWalletBanner({ onSync, onDismiss }: PersistentWalletBannerProps) {
  return (
    <motion.div 
      className="fixed bottom-4 left-4 right-4 z-50 max-w-lg mx-auto"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
    >
      <div className="flex items-center gap-3 p-4 rounded-xl backdrop-blur-xl bg-amber-900/80 border border-amber-500/30 shadow-lg">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
        
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium">
            Identity not secured
          </p>
          <p className="text-amber-200/70 text-xs">
            50 Spores at risk. Save to wallet now.
          </p>
        </div>

        <Button
          onClick={onSync}
          size="sm"
          className="bg-amber-500 hover:bg-amber-600 text-black font-bold flex-shrink-0"
        >
          Save
        </Button>

        <button
          onClick={onDismiss}
          className="p-1 text-white/50 hover:text-white transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
