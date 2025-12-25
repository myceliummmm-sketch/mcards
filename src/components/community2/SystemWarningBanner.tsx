import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { AlertTriangle, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SystemWarningBannerProps {
  onSync: () => void;
}

export const SystemWarningBanner = ({ onSync }: SystemWarningBannerProps) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-red-900/90 border-b border-red-500/50 backdrop-blur-sm"
    >
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
          <div>
            <p className="text-white font-medium text-sm md:text-base">
              {t('brokenSystem.warning.title')}
            </p>
            <p className="text-red-300 text-xs md:text-sm hidden sm:block">
              {t('brokenSystem.warning.subtitle')}
            </p>
          </div>
        </div>

        <Button
          onClick={onSync}
          size="sm"
          className="bg-white hover:bg-gray-100 text-red-900 font-semibold shrink-0"
        >
          <Wallet className="w-4 h-4 mr-2" />
          {t('brokenSystem.warning.cta')}
        </Button>
      </div>
    </motion.div>
  );
};
