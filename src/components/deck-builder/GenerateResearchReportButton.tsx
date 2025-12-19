import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, FileText, Loader2, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { triggerForgeConfetti } from './ForgeConfetti';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface GenerateResearchReportButtonProps {
  filledCount: number;
  totalCount: number;
  deckId: string;
  onOpenReport: (reportData: any) => void;
  disabled?: boolean;
}

// Sparkle particle component
const SparkleParticle = ({ delay, x }: { delay: number; x: number }) => (
  <motion.div
    className="absolute w-1 h-1 bg-cyan-300 rounded-full"
    initial={{ opacity: 0, y: 0, x }}
    animate={{
      opacity: [0, 1, 0],
      y: [-5, -20],
      x: [x, x + (Math.random() - 0.5) * 20],
    }}
    transition={{
      duration: 1.5,
      delay,
      repeat: Infinity,
      repeatDelay: Math.random() * 0.5,
    }}
  />
);

type ReportStatus = 'not_generated' | 'generating' | 'ready';

export const GenerateResearchReportButton = ({
  filledCount,
  totalCount,
  deckId,
  onOpenReport,
  disabled = false,
}: GenerateResearchReportButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [reportStatus, setReportStatus] = useState<ReportStatus>('not_generated');
  const [cachedReport, setCachedReport] = useState<any>(null);
  const { language } = useLanguage();
  const percentage = (filledCount / totalCount) * 100;
  const isAlmostReady = filledCount === totalCount - 1;
  const isReady = filledCount === totalCount;

  // Check for cached report on mount
  useEffect(() => {
    const storageKey = `research_report_${deckId}`;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Check if report is less than 24 hours old
        if (parsed.generatedAt && Date.now() - parsed.generatedAt < 86400000) {
          setCachedReport(parsed.data);
          setReportStatus('ready');
        }
      }
    } catch (e) {
      console.error('Failed to load cached report:', e);
    }
  }, [deckId]);

  const generateReport = async () => {
    setReportStatus('generating');
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Требуется авторизация');
      }

      const response = await supabase.functions.invoke('generate-research-report', {
        body: { deckId }
      });

      if (response.error) throw response.error;
      
      // Cache the report
      const storageKey = `research_report_${deckId}`;
      localStorage.setItem(storageKey, JSON.stringify({
        data: response.data,
        generatedAt: Date.now()
      }));
      
      setCachedReport(response.data);
      setReportStatus('ready');
      triggerForgeConfetti();
      
      toast.success(
        language === 'ru' ? '📊 Отчёт готов!' : '📊 Report ready!',
        { description: language === 'ru' ? 'Нажми чтобы открыть' : 'Click to open' }
      );
    } catch (err: any) {
      console.error('Failed to generate report:', err);
      setReportStatus('not_generated');
      toast.error(
        language === 'ru' ? 'Ошибка генерации' : 'Generation failed',
        { description: err.message }
      );
    }
  };

  const handleClick = () => {
    if (!isReady) {
      const remaining = totalCount - filledCount;
      toast.info(
        language === 'ru' 
          ? `Продолжай! Осталось ${remaining} карт${remaining > 1 ? 'ы' : 'а'}` 
          : `Keep researching! ${remaining} more card${remaining > 1 ? 's' : ''} to go`,
        {
          description: language === 'ru' 
            ? "Заверши все Research карты для генерации отчёта"
            : "Complete all Research cards to generate your report"
        }
      );
      return;
    }

    if (reportStatus === 'generating') {
      return; // Already generating
    }

    if (reportStatus === 'ready' && cachedReport) {
      // Open existing report
      onOpenReport(cachedReport);
      return;
    }

    // Generate new report
    generateReport();
  };

  // Generate sparkle positions
  const sparkles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    delay: i * 0.2,
    x: 10 + (i * 15),
  }));

  const getButtonText = () => {
    if (reportStatus === 'generating') {
      return language === 'ru' ? "Генерация..." : "Generating...";
    }
    if (reportStatus === 'ready') {
      return language === 'ru' ? "Открыть отчёт" : "Open Report";
    }
    if (isReady) {
      return language === 'ru' ? "Создать отчёт ✨" : "Generate Report ✨";
    }
    return language === 'ru' ? "Создать отчёт" : "Generate Report";
  };

  const getIcon = () => {
    if (reportStatus === 'generating') {
      return (
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <Loader2 className="w-4 h-4 text-cyan-400" />
        </motion.div>
      );
    }
    if (reportStatus === 'ready') {
      return (
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <Eye className="w-4 h-4 text-cyan-400" />
        </motion.div>
      );
    }
    if (isReady) {
      return (
        <motion.div
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
        >
          <FileText className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />
        </motion.div>
      );
    }
    return (
      <Sparkles className={cn(
        "w-4 h-4",
        isAlmostReady ? "text-cyan-400" : "text-muted-foreground"
      )} />
    );
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            onClick={handleClick}
            disabled={disabled || reportStatus === 'generating'}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
              "relative overflow-hidden rounded-xl px-6 py-3 font-semibold text-sm transition-all w-[260px]",
              "border-2 backdrop-blur-sm",
              reportStatus === 'ready'
                ? "border-emerald-400/80 shadow-lg shadow-emerald-400/30"
                : isReady 
                  ? "border-cyan-400/80 shadow-lg shadow-cyan-400/30" 
                  : isAlmostReady 
                    ? "border-cyan-400/60 shadow-md shadow-cyan-400/20"
                    : "border-muted-foreground/30",
              (disabled || reportStatus === 'generating') && "opacity-70 cursor-not-allowed"
            )}
            animate={(isReady && reportStatus !== 'generating') ? {
              scale: [1, 1.02, 1],
              boxShadow: reportStatus === 'ready' 
                ? [
                    "0 0 20px rgba(52, 211, 153, 0.3)",
                    "0 0 40px rgba(52, 211, 153, 0.5)",
                    "0 0 20px rgba(52, 211, 153, 0.3)",
                  ]
                : [
                    "0 0 20px rgba(34, 211, 238, 0.3)",
                    "0 0 40px rgba(34, 211, 238, 0.5)",
                    "0 0 20px rgba(34, 211, 238, 0.3)",
                  ],
            } : {}}
            transition={(isReady && reportStatus !== 'generating') ? { duration: 2, repeat: Infinity } : {}}
            whileHover={{ scale: reportStatus === 'generating' ? 1 : 1.05 }}
            whileTap={{ scale: reportStatus === 'generating' ? 1 : 0.98 }}
          >
            {/* Background gradient */}
            <div className={cn(
              "absolute inset-0",
              reportStatus === 'ready'
                ? "bg-gradient-to-br from-emerald-900/90 via-background/80 to-emerald-900/50"
                : "bg-gradient-to-br from-background/90 via-background/80 to-muted/50"
            )} />

            {/* Mana fill layer */}
            <motion.div
              className={cn(
                "absolute bottom-0 left-0 right-0",
                reportStatus === 'ready'
                  ? "bg-gradient-to-t from-emerald-500/60 via-emerald-400/40 to-emerald-300/20"
                  : isReady 
                    ? "bg-gradient-to-t from-cyan-500/60 via-cyan-400/40 to-cyan-300/20"
                    : isAlmostReady
                      ? "bg-gradient-to-t from-cyan-500/50 via-cyan-400/30 to-cyan-300/10"
                      : "bg-gradient-to-t from-cyan-600/40 via-cyan-500/20 to-transparent"
              )}
              initial={{ height: "0%" }}
              animate={{ height: reportStatus === 'ready' ? '100%' : `${percentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />

            {/* Wave effect on mana surface */}
            {percentage > 0 && reportStatus !== 'ready' && (
              <motion.div
                className="absolute left-0 right-0 h-2 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                style={{ bottom: `${percentage}%` }}
                animate={{ x: [-50, 50, -50] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
            )}

            {/* Sparkle particles */}
            <AnimatePresence>
              {(isAlmostReady || isReady) && reportStatus !== 'generating' && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {sparkles.map((sparkle) => (
                    <SparkleParticle key={sparkle.id} delay={sparkle.delay} x={sparkle.x} />
                  ))}
                </div>
              )}
            </AnimatePresence>

            {/* Shimmer for ready states */}
            {(isReady || reportStatus === 'ready') && reportStatus !== 'generating' && (
              <motion.div
                className={cn(
                  "absolute inset-0 bg-gradient-to-r",
                  reportStatus === 'ready'
                    ? "from-emerald-400/0 via-emerald-400/30 to-emerald-400/0"
                    : "from-cyan-400/0 via-cyan-400/30 to-cyan-400/0"
                )}
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            )}

            {/* Content */}
            <div className="relative flex items-center gap-2 z-10">
              {getIcon()}
              
              <span className={cn(
                "transition-colors whitespace-nowrap",
                reportStatus === 'ready'
                  ? "text-emerald-400 font-bold"
                  : isReady 
                    ? "text-cyan-400 font-bold" 
                    : isAlmostReady 
                      ? "text-cyan-400"
                      : "text-muted-foreground"
              )}>
                {getButtonText()}
              </span>

              {/* Progress indicator - hide when ready */}
              {reportStatus !== 'ready' && (
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  isReady 
                    ? "bg-cyan-400/20 text-cyan-400"
                    : isAlmostReady
                      ? "bg-cyan-400/20 text-cyan-400"
                      : "bg-muted text-muted-foreground"
                )}>
                  {filledCount}/{totalCount}
                </span>
              )}
            </div>

            {/* Almost ready badge */}
            <AnimatePresence>
              {isAlmostReady && reportStatus === 'not_generated' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute -top-2 -right-2 px-2 py-0.5 bg-cyan-400 text-cyan-950 text-xs font-bold rounded-full"
                >
                  {language === 'ru' ? 'Почти!' : 'Almost!'}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Ready badge when report exists */}
            <AnimatePresence>
              {reportStatus === 'ready' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="absolute -top-2 -right-2 px-2 py-0.5 bg-emerald-400 text-emerald-950 text-xs font-bold rounded-full"
                >
                  ✓
                </motion.div>
              )}
            </AnimatePresence>

            {/* Ready glow ring */}
            {(isReady || reportStatus === 'ready') && reportStatus !== 'generating' && (
              <motion.div
                className={cn(
                  "absolute inset-0 rounded-xl border-2",
                  reportStatus === 'ready' ? "border-emerald-400" : "border-cyan-400"
                )}
                animate={{
                  opacity: [0.5, 1, 0.5],
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </motion.button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className={cn(
          "max-w-[250px] p-3 bg-card",
          reportStatus === 'ready' ? "border-emerald-400/30" : "border-cyan-400/30"
        )}>
          <div className="text-center">
            <p className={cn(
              "text-sm font-semibold mb-1",
              reportStatus === 'ready' ? "text-emerald-400" : "text-cyan-400"
            )}>
              {reportStatus === 'ready' 
                ? (language === 'ru' ? '✓ Отчёт готов!' : '✓ Report ready!')
                : (language === 'ru' ? '📊 Получи Research Report!' : '📊 Get your Research Report!')}
            </p>
            <p className="text-xs text-muted-foreground">
              {reportStatus === 'ready'
                ? (language === 'ru' ? 'Нажми чтобы открыть аналитический отчёт' : 'Click to open your analytical report')
                : (language === 'ru' 
                    ? 'Заверши все Research карты — и получишь полный аналитический отчёт!'
                    : 'Complete all Research cards to get a comprehensive analytical report!')}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
