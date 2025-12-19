import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  X, 
  Rocket, 
  TrendingUp,
  Users, 
  Swords, 
  Lightbulb, 
  AlertTriangle,
  Quote,
  TreePine,
  Sparkles,
  RefreshCw,
  Target,
  Crown,
  BarChart3,
  Flame,
  Share2,
  Mail,
  MessageCircle,
  Send,
  Copy,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RARITY_COLORS, Rarity } from '@/types/research';

interface ResearchReportModalProps {
  open: boolean;
  onClose: () => void;
  deckId: string;
  initialData?: ReportData | null;
}

interface ReportData {
  productName?: string;
  productSummary?: string;
  verdict?: {
    rarity: Rarity;
    score: number;
    resonatedCount: number;
    totalCount: number;
  };
  metrics?: {
    marketSize?: string;
    marketGrowth?: string;
    marketLeader?: string;
    leaderName?: string;
  };
  opportunity?: string;
  audience?: {
    demographics?: string;
    psychographics?: string;
    channels?: string;
    spending?: string;
  };
  competitors?: {
    competitor1?: string;
    competitor2?: string;
    competitor3?: string;
  };
  quote?: {
    text?: string;
    source?: string;
  };
  risks?: string[];
  whyNow?: string[];
  recommendation?: string;
}

export function ResearchReportModal({ open, onClose, deckId, initialData }: ResearchReportModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSavedReport, setHasSavedReport] = useState(false);
  const { toast } = useToast();

  // Load saved report on open
  useEffect(() => {
    if (open && deckId) {
      loadSavedReport();
    }
  }, [open, deckId]);

  const loadSavedReport = async () => {
    // For now, just generate a new report since research_reports table doesn't exist yet
    if (!reportData) {
      generateReport();
    }
  };

  const saveReport = async (data: ReportData) => {
    // Report saving disabled until research_reports table is created
    setHasSavedReport(true);
    console.log('Report generated (saving disabled):', data);
  };

  const generateReport = async () => {
    setReportData(null);
    setIsLoading(true);
    setError(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Требуется авторизация');
      }

      const response = await supabase.functions.invoke('generate-research-report', {
        body: { deckId }
      });

      if (response.error) throw response.error;
      
      setReportData(response.data);
      // Save the generated report
      await saveReport(response.data);
    } catch (err: any) {
      console.error('Failed to generate report:', err);
      setError(err.message || 'Не удалось сгенерировать отчёт');
      toast({
        title: 'Ошибка',
        description: err.message || 'Не удалось сгенерировать отчёт',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getShareText = () => {
    if (!reportData) return '';
    const score = reportData.verdict?.score?.toFixed(1) || '0';
    const rarity = reportData.verdict?.rarity?.toUpperCase() || 'COMMON';
    return `📊 ${reportData.productName} - Research Report\n\n🎯 Оценка: ${score}/10 (${rarity})\n📈 Рынок: ${reportData.metrics?.marketSize || 'N/A'}\n🚀 Рост: ${reportData.metrics?.marketGrowth || 'N/A'}\n\n${reportData.productSummary || ''}\n\nСоздано в Mycelium`;
  };

  const handleShare = async (platform: 'native' | 'email' | 'telegram' | 'whatsapp' | 'copy') => {
    const text = getShareText();
    const title = `${reportData?.productName || 'Research'} - Mycelium Report`;

    switch (platform) {
      case 'native':
        if (navigator.share) {
          try {
            await navigator.share({ title, text });
            toast({ title: '✅ Отправлено!' });
          } catch (err) {
            if ((err as Error).name !== 'AbortError') {
              console.error('Share failed:', err);
            }
          }
        }
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text)}`);
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`);
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
        break;
      case 'copy':
        await navigator.clipboard.writeText(text);
        toast({ title: '📋 Скопировано!', description: 'Текст отчёта в буфере обмена' });
        break;
    }
  };

  const colors = reportData?.verdict?.rarity ? RARITY_COLORS[reportData.verdict.rarity] : RARITY_COLORS.common;

  // Safe values with defaults
  const safeMetrics = {
    marketSize: reportData?.metrics?.marketSize || 'N/A',
    marketGrowth: reportData?.metrics?.marketGrowth || 'N/A',
    marketLeader: reportData?.metrics?.marketLeader || 'N/A',
    leaderName: reportData?.metrics?.leaderName || 'Лидер',
  };
  
  const safeAudience = {
    demographics: reportData?.audience?.demographics || 'Не определено',
    psychographics: reportData?.audience?.psychographics || 'Не определено',
    channels: reportData?.audience?.channels || 'Не определено',
    spending: reportData?.audience?.spending || 'Не определено',
  };
  
  const safeCompetitors = {
    competitor1: reportData?.competitors?.competitor1 || 'Конкурент 1',
    competitor2: reportData?.competitors?.competitor2 || 'Конкурент 2',
    competitor3: reportData?.competitors?.competitor3 || 'Конкурент 3',
  };
  
  const safeQuote = {
    text: reportData?.quote?.text || 'Нет цитаты',
    source: reportData?.quote?.source || 'Источник неизвестен',
  };
  
  const safeRisks = reportData?.risks?.length ? reportData.risks : ['Риски не определены'];
  const safeWhyNow = reportData?.whyNow?.length ? reportData.whyNow : ['Тренды не определены'];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 bg-[#0D1117] border-primary/20">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0D1117]/95 backdrop-blur border-b border-border/30 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xl">🍄</span>
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-white">MYCELIUM RESEARCH REPORT</h2>
              <p className="text-xs text-[#8B949E]">Premium Startup Analysis</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={generateReport}
              disabled={isLoading}
              className="border-primary/30 hover:bg-primary/10"
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
              Перегенерировать
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={isLoading || !reportData}
                  className="border-primary/30 hover:bg-primary/10"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Поделиться
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#1C2128] border-border/50">
                {typeof navigator !== 'undefined' && navigator.share && (
                  <DropdownMenuItem onClick={() => handleShare('native')} className="cursor-pointer">
                    <Share2 className="w-4 h-4 mr-2" />
                    Поделиться...
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => handleShare('telegram')} className="cursor-pointer">
                  <Send className="w-4 h-4 mr-2" />
                  Telegram
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare('whatsapp')} className="cursor-pointer">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare('email')} className="cursor-pointer">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare('copy')} className="cursor-pointer">
                  <Copy className="w-4 h-4 mr-2" />
                  Копировать текст
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-white/10">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-32"
              >
                <motion.div
                  animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                  transition={{ 
                    rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
                    scale: { duration: 1, repeat: Infinity }
                  }}
                  className="relative"
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-purple-500/30 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-primary" />
                  </div>
                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                </motion.div>
                <p className="mt-6 text-white font-medium">Создаём ваш отчёт...</p>
                <p className="text-xs text-[#8B949E] mt-2">AI анализирует данные исследований</p>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20 px-6"
              >
                <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
                <p className="text-destructive text-lg mb-2">Ошибка генерации</p>
                <p className="text-[#8B949E] mb-6">{error}</p>
                <Button onClick={generateReport} className="bg-primary hover:bg-primary/80">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Попробовать снова
                </Button>
              </motion.div>
            ) : reportData ? (
              <motion.div
                key="report"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Beautiful HTML Report */}
                <div 
                  className="relative p-6 bg-gradient-to-br from-[#0D1117] via-[#161B22] to-[#0D1117] overflow-hidden"
                >
                  {/* Animated stars background */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white/30 rounded-full"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                          opacity: [0.2, 0.8, 0.2],
                          scale: [1, 1.5, 1],
                        }}
                        transition={{
                          duration: 2 + Math.random() * 2,
                          repeat: Infinity,
                          delay: Math.random() * 2,
                        }}
                      />
                    ))}
                  </div>

                  {/* Header */}
                  <div className="text-center mb-8 relative z-10">
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                        <TreePine className="w-6 h-6 text-emerald-400" />
                      </div>
                    </div>
                    <p className="text-[10px] tracking-[0.3em] text-[#8B949E] uppercase mb-2">
                      MYCELIUM RESEARCH REPORT
                    </p>
                    <h1 className="text-4xl font-display font-bold text-white mb-3">
                      {reportData.productName || 'Research Report'}
                    </h1>
                    <p className="text-[#8B949E] max-w-lg mx-auto text-sm">
                      {reportData.productSummary || 'Анализ стартапа'}
                    </p>
                  </div>

                  {/* Verdict Circle */}
                  {reportData.verdict && (
                    <div className="flex justify-center mb-8">
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="relative"
                      >
                        <div 
                          className="w-32 h-32 rounded-full flex flex-col items-center justify-center border-4"
                          style={{ 
                            borderColor: colors.primary,
                            boxShadow: `0 0 40px ${colors.glow}, 0 0 80px ${colors.glow}40`,
                            background: `radial-gradient(circle at center, ${colors.bg}40, transparent 70%)`,
                          }}
                        >
                          <span 
                            className="text-xs uppercase tracking-wider font-bold"
                            style={{ color: colors.primary }}
                          >
                            {reportData.verdict.rarity}
                          </span>
                          <span className="text-5xl font-bold text-white">
                            {reportData.verdict.score?.toFixed(1) || '0'}
                          </span>
                          <span className="text-[10px] text-[#8B949E]">
                            {reportData.verdict.resonatedCount || 0}/{reportData.verdict.totalCount || 0} резонирует
                          </span>
                        </div>
                      </motion.div>
                    </div>
                  )}

                  {/* Metrics Cards */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                      { label: 'РЫНОК', sublabel: 'размер ниши', value: safeMetrics.marketSize, icon: BarChart3, color: 'text-cyan-400' },
                      { label: 'РОСТ', sublabel: 'ежегодно', value: safeMetrics.marketGrowth, icon: TrendingUp, color: 'text-cyan-400' },
                      { label: 'ЛИДЕР', sublabel: safeMetrics.leaderName, value: safeMetrics.marketLeader, icon: Crown, color: 'text-cyan-400' },
                    ].map((metric, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-[#1C2128] rounded-xl p-4 border border-[#30363D] relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <p className="text-[10px] text-[#8B949E] tracking-wider mb-1">{metric.label}</p>
                        <p className={cn("text-3xl font-bold", metric.color)}>{metric.value}</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-[10px] text-[#8B949E]">{metric.sublabel}</p>
                          <metric.icon className="w-4 h-4 text-[#8B949E]" />
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Opportunity */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-[#1C2128] rounded-xl p-4 border-l-4 border-[#E85D75] mb-6"
                    style={{ boxShadow: '0 0 20px rgba(232, 93, 117, 0.1)' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-[#E85D75]" />
                      <span className="text-sm font-bold text-[#E85D75]">ВОЗМОЖНОСТЬ</span>
                    </div>
                    <p className="text-white text-sm leading-relaxed">
                      {reportData.opportunity || 'Возможность не определена'}
                    </p>
                  </motion.div>

                  {/* Audience & Competitors */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {/* Audience */}
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-[#1C2128] rounded-xl p-4 border border-primary/30"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-sm">💎</span>
                          </div>
                          <div>
                            <span className="text-sm font-bold text-primary">АУДИТОРИЯ с Prisma</span>
                            <p className="text-[10px] text-[#8B949E]">@Prisma</p>
                          </div>
                        </div>
                        <Quote className="w-5 h-5 text-primary/30" />
                      </div>
                      <ul className="space-y-2 text-sm text-[#C9D1D9]">
                        <li>• {safeAudience.demographics}</li>
                        <li>• {safeAudience.psychographics}</li>
                        <li>• {safeAudience.channels}</li>
                        <li>• {safeAudience.spending}</li>
                      </ul>
                    </motion.div>

                    {/* Competitors */}
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-[#1C2128] rounded-xl p-4 border border-orange-500/30"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                            <span className="text-sm">☢️</span>
                          </div>
                          <div>
                            <span className="text-sm font-bold text-orange-500">КОНКУРЕНТЫ с Toxic</span>
                            <p className="text-[10px] text-[#8B949E]">@Toxic</p>
                          </div>
                        </div>
                        <Quote className="w-5 h-5 text-orange-500/30" />
                      </div>
                      <ul className="space-y-2 text-sm text-[#C9D1D9]">
                        <li>• {safeCompetitors.competitor1}</li>
                        <li>• {safeCompetitors.competitor2}</li>
                        <li>• {safeCompetitors.competitor3}</li>
                        <li className="text-primary font-medium">= Твоё окно</li>
                      </ul>
                    </motion.div>
                  </div>

                  {/* Risks & Why Now */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {/* Risks */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="bg-[#1C2128] rounded-xl p-4 border border-orange-500/20"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                          </div>
                          <div>
                            <span className="text-sm font-bold text-orange-500">РИСКИ</span>
                            <p className="text-[10px] text-[#8B949E]">@Toxic</p>
                          </div>
                        </div>
                        <Quote className="w-5 h-5 text-orange-500/30" />
                      </div>
                      <ul className="space-y-2 text-sm text-[#C9D1D9]">
                        {safeRisks.slice(0, 3).map((risk, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-orange-500">•</span>
                            <span>{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>

                    {/* Why Now */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="bg-[#1C2128] rounded-xl p-4 border border-[#E85D75]/20"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#E85D75]/10 flex items-center justify-center">
                            <Flame className="w-4 h-4 text-[#E85D75]" />
                          </div>
                          <div>
                            <span className="text-sm font-bold text-[#E85D75]">ПОЧЕМУ СЕЙЧАС</span>
                            <p className="text-[10px] text-[#8B949E]">@Phoenix</p>
                          </div>
                        </div>
                        <Quote className="w-5 h-5 text-[#E85D75]/30" />
                      </div>
                      <ul className="space-y-2 text-sm text-[#C9D1D9]">
                        {safeWhyNow.slice(0, 3).map((trend, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-[#E85D75]">•</span>
                            <span>{trend}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  </div>

                  {/* Recommendation */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl p-5 border border-emerald-500/30 mb-6"
                    style={{ boxShadow: '0 0 30px rgba(16, 185, 129, 0.1)' }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <TreePine className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-bold text-emerald-400">РЕКОМЕНДАЦИЯ EVER GREEN</span>
                        </div>
                        <p className="text-white text-sm leading-relaxed">
                          {reportData.recommendation || 'Рекомендуется продолжить разработку и тестирование гипотез.'}
                        </p>
                        <p className="text-[10px] text-[#8B949E] mt-2">@EverGreen</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* CTA Button */}
                  <div className="flex justify-center">
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/30 px-8"
                      onClick={onClose}
                    >
                      <Rocket className="w-5 h-5 mr-2" />
                      Перейти к BUILD
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}