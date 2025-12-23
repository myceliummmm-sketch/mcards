import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { QuizProgress } from "@/components/quiz/QuizProgress";
import { QuizQuestion } from "@/components/quiz/QuizQuestion";
import { QuizResult } from "@/components/quiz/QuizResult";
import { PostQuizFork } from "@/components/landing/PostQuizFork";
import { EmailCaptureModal } from "@/components/landing/EmailCaptureModal";
import { QUIZ_QUESTIONS, calculateResults, type QuizResults } from "@/data/quizData";
import { Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { useTrafficVariant } from "@/hooks/useTrafficVariant";

const Quiz2 = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const isMobile = useIsMobile();
  const { trackEvent } = useTrafficVariant();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [showPostQuizFork, setShowPostQuizFork] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [results, setResults] = useState<QuizResults | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const hasTrackedStart = useRef(false);

  // Track quiz start on mount
  useEffect(() => {
    if (!hasTrackedStart.current) {
      hasTrackedStart.current = true;
      trackEvent('quiz_start');
    }
  }, [trackEvent]);

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 300);
    } else {
      const calculatedResults = calculateResults(newAnswers);
      setResults(calculatedResults);
      
      // Track quiz completion using new traffic variant system
      trackEvent('quiz_complete', { 
        score: calculatedResults.totalScore,
        blocker: calculatedResults.blocker,
        daysToFirst100: calculatedResults.daysToFirst100
      });
      
      setTimeout(() => {
        // On mobile, show the fork. On desktop, show result directly
        if (isMobile) {
          setShowPostQuizFork(true);
        } else {
          setShowResult(true);
        }
      }, 300);
    }
  };

  const handleStartVision = () => {
    navigate("/auth");
  };

  const handleGetPlaybook = () => {
    setShowEmailModal(true);
  };

  const handleStartBuilding = () => {
    navigate("/auth");
  };

  const handleEmailSuccess = () => {
    // Optionally navigate after email capture
  };

  const handleShare = async () => {
    if (!results || isSharing) return;
    
    setIsSharing(true);

    const shareText = t("quiz.shareText")
      .replace("{score}", String(results.totalScore))
      .replace("{days}", String(results.daysToFirst100));
    const quizUrl = window.location.origin + "/quiz2";

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Idea Launchpad Quiz",
          text: shareText,
          url: quizUrl,
        });
      } else {
        copyToClipboard(shareText + "\n" + quizUrl);
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        copyToClipboard(shareText + "\n" + quizUrl);
      }
    } finally {
      setTimeout(() => setIsSharing(false), 1000);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(t("quiz.copiedToClipboard"));
    }).catch(() => {
      toast.error("Failed to copy");
    });
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResult(false);
    setResults(null);
  };

  const toggleLanguage = () => {
    const langs: ('en' | 'ru' | 'es')[] = ['en', 'es', 'ru'];
    const currentIndex = langs.indexOf(language as 'en' | 'ru' | 'es');
    setLanguage(langs[(currentIndex + 1) % langs.length]);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <motion.header
        className="p-4 border-b border-border"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h1 className="font-display text-lg text-foreground">{t("quiz.title")}</h1>
          </div>
          <button
            onClick={toggleLanguage}
            className="px-3 py-1 text-sm font-body text-muted-foreground hover:text-foreground 
                       border border-border rounded-lg hover:border-primary transition-colors"
          >
            {language === "en" ? "🇲🇽 ES" : language === "es" ? "🇷🇺 RU" : "🇬🇧 EN"}
          </button>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-md mx-auto">
          <AnimatePresence mode="wait">
            {!showResult && !showPostQuizFork ? (
              <motion.div
                key="quiz"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                <QuizProgress
                  current={currentQuestion}
                  total={QUIZ_QUESTIONS.length}
                />

                <AnimatePresence mode="wait">
                  <QuizQuestion
                    key={currentQuestion}
                    question={QUIZ_QUESTIONS[currentQuestion]}
                    questionIndex={currentQuestion}
                    onAnswer={handleAnswer}
                  />
                </AnimatePresence>
              </motion.div>
            ) : showPostQuizFork && results ? (
              <motion.div
                key="fork"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <PostQuizFork
                  onGetPlaybook={handleGetPlaybook}
                  onStartBuilding={handleStartBuilding}
                  results={results}
                />

                <motion.button
                  onClick={handleRestart}
                  className="w-full mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors font-body"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  {t("quiz.restartQuiz")}
                </motion.button>
              </motion.div>
            ) : results ? (
              <motion.div
                key="result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <QuizResult
                  results={results}
                  answers={answers}
                  onGetPlaybook={handleGetPlaybook}
                  onStartBuilding={handleStartBuilding}
                  onShare={handleShare}
                />

                <motion.button
                  onClick={handleRestart}
                  className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors font-body"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                >
                  {t("quiz.restartQuiz")}
                </motion.button>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Email Capture Modal */}
          <EmailCaptureModal
            isOpen={showEmailModal}
            onClose={() => setShowEmailModal(false)}
            quizScore={results?.totalScore}
            quizBlocker={results?.blocker}
            onSuccess={handleEmailSuccess}
          />
        </div>
      </main>

      {/* Footer */}
      <motion.footer
        className="p-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-xs text-muted-foreground font-body">
          {t("quiz.poweredBy")}
        </p>
      </motion.footer>
    </div>
  );
};

export default Quiz2;
