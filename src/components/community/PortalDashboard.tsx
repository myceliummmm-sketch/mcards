import { useState } from 'react';
import { motion } from 'framer-motion';
import { Rocket, User, Sparkles, Lightbulb, ArrowRight, Plus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ARCHETYPE_DATA, ArchetypeKey } from '@/data/passportQuizData';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

interface PortalDashboardProps {
  founderName: string;
  archetype: ArchetypeKey;
  passportNumber: string;
  problemCards?: ProblemCardData[];
  onStartProjectSeed: () => void;
  onReset?: () => void;
}

export function PortalDashboard({ 
  founderName, 
  archetype, 
  passportNumber,
  problemCards = [],
  onStartProjectSeed,
  onReset
}: PortalDashboardProps) {
  const archetypeData = ARCHETYPE_DATA[archetype];
  const { language } = useLanguage();

  const t = {
    en: {
      welcome: "Welcome,",
      subtitle: "Your journey in the Mycelium Network begins now",
      passportId: "Passport ID",
      trait: "Trait",
      projects: "Projects",
      spores: "Spores",
      startProject: "Start Your First Project",
      startProjectDesc: "Plant your first project seed. Our AI Council will analyze your idea and help you validate it before you build.",
      feature1: "60-second problem discovery",
      feature2: "AI-powered market analysis",
      feature3: "Get your Problem Card v1.0",
      cta: "START MY FIRST PROJECT",
      ctaNew: "START NEW PROJECT",
      cardsCreated: "Cards Created",
      researchDone: "Research Done",
      networkRank: "Network Rank",
      yourProjects: "Your Problem Cards",
      newCard: "+ New Card",
      analysisPending: "Analysis pending...",
      resetTitle: "Reset Portal?",
      resetDescription: "This will clear all your data and start fresh. Your passport and problem cards will be deleted. This action cannot be undone.",
      resetConfirm: "Yes, Reset Everything",
      resetCancel: "Cancel",
    },
    ru: {
      welcome: "Добро пожаловать,",
      subtitle: "Ваше путешествие в Mycelium Network начинается",
      passportId: "ID Паспорта",
      trait: "Черта",
      projects: "Проекты",
      spores: "Споры",
      startProject: "Начните свой первый проект",
      startProjectDesc: "Посадите семя первого проекта. Наш AI Council проанализирует вашу идею и поможет валидировать её перед созданием.",
      feature1: "60-секундное исследование проблемы",
      feature2: "AI-анализ рынка",
      feature3: "Получите вашу Problem Card v1.0",
      cta: "НАЧАТЬ ПЕРВЫЙ ПРОЕКТ",
      ctaNew: "НАЧАТЬ НОВЫЙ ПРОЕКТ",
      cardsCreated: "Карточек создано",
      researchDone: "Исследований",
      networkRank: "Ранг в сети",
      yourProjects: "Ваши Problem Cards",
      newCard: "+ Новая карта",
      analysisPending: "Анализ в процессе...",
      resetTitle: "Сбросить портал?",
      resetDescription: "Это удалит все ваши данные и начнёт заново. Ваш паспорт и карточки проблем будут удалены. Это действие нельзя отменить.",
      resetConfirm: "Да, сбросить всё",
      resetCancel: "Отмена",
    },
  };

  const text = t[language as keyof typeof t] || t.en;

  return (
    <div className="min-h-screen bg-[#0D1117] px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header with Reset button */}
        <motion.div 
          className="text-center mb-12 relative"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Reset button in top-right */}
          {onReset && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button 
                  className="absolute top-0 right-0 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/40 hover:text-white/70 transition-colors"
                  title="Reset Portal"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-[#0D1117] border-white/10">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">{text.resetTitle}</AlertDialogTitle>
                  <AlertDialogDescription className="text-white/60">
                    {text.resetDescription}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                    {text.resetCancel}
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={onReset}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {text.resetConfirm}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {text.welcome} {founderName}
          </h1>
          <p className="text-white/60">{text.subtitle}</p>
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
                <span className="text-white/50">{text.passportId}</span>
                <span className="text-white font-mono">{passportNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">{text.trait}</span>
                <span className="text-white">{archetypeData.trait}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">{text.projects}</span>
                <span className="text-white">{problemCards.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">{text.spores}</span>
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
              <h3 className="text-xl font-bold text-white">
                {problemCards.length === 0 ? text.startProject : text.yourProjects}
              </h3>
            </div>

            {problemCards.length === 0 ? (
              <>
                <p className="text-white/60 mb-6">
                  {text.startProjectDesc}
                </p>

                <ul className="space-y-2 mb-6 text-sm">
                  <li className="flex items-center gap-2 text-white/70">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" />
                    {text.feature1}
                  </li>
                  <li className="flex items-center gap-2 text-white/70">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" />
                    {text.feature2}
                  </li>
                  <li className="flex items-center gap-2 text-white/70">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#2E7D32]" />
                    {text.feature3}
                  </li>
                </ul>

                <Button
                  onClick={onStartProjectSeed}
                  size="lg"
                  className="w-full bg-[#2E7D32] hover:bg-[#1B5E20] text-white border-2 border-[#2E7D32] shadow-[4px_4px_0_rgba(46,125,50,0.5)] hover:shadow-[2px_2px_0_rgba(46,125,50,0.5)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all min-h-14 text-lg font-bold"
                >
                  <Rocket className="mr-2 w-5 h-5" />
                  {text.cta}
                </Button>
              </>
            ) : (
              <>
                {/* Show saved problem cards */}
                <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                  {problemCards.slice(0, 3).map((card, index) => (
                    <motion.div
                      key={card.id}
                      className="p-3 rounded-xl bg-white/5 border border-white/10"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#2E7D32]/20 flex items-center justify-center flex-shrink-0">
                          <Lightbulb className="w-4 h-4 text-[#2E7D32]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          {card.ai_analysis ? (
                            <p className="text-white/80 text-sm line-clamp-2">
                              {card.ai_analysis.problemStatement}
                            </p>
                          ) : (
                            <p className="text-white/50 text-sm">{text.analysisPending}</p>
                          )}
                          <p className="text-white/40 text-xs mt-1">
                            {new Date(card.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-white/30 flex-shrink-0" />
                      </div>
                    </motion.div>
                  ))}
                </div>

                <Button
                  onClick={onStartProjectSeed}
                  size="lg"
                  className="w-full bg-[#2E7D32] hover:bg-[#1B5E20] text-white border-2 border-[#2E7D32] shadow-[4px_4px_0_rgba(46,125,50,0.5)] hover:shadow-[2px_2px_0_rgba(46,125,50,0.5)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all min-h-12 text-base font-bold"
                >
                  <Plus className="mr-2 w-4 h-4" />
                  {text.ctaNew}
                </Button>
              </>
            )}
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
            <p className="text-2xl font-bold text-white">{problemCards.length}</p>
            <p className="text-xs text-white/50">{text.cardsCreated}</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
            <p className="text-2xl font-bold text-white">0</p>
            <p className="text-xs text-white/50">{text.researchDone}</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
            <p className="text-2xl font-bold text-[#2E7D32]">1</p>
            <p className="text-xs text-white/50">{text.networkRank}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}