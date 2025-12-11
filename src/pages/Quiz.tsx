import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { QuizProgress } from "@/components/quiz/QuizProgress";
import { QuizQuestion } from "@/components/quiz/QuizQuestion";
import { QuizResult } from "@/components/quiz/QuizResult";
import { QUIZ_QUESTIONS, calculateResults, type QuizResults } from "@/data/quizData";
import { Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

const Quiz = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [results, setResults] = useState<QuizResults | null>(null);

  useEffect(() => {
    // Initialize Telegram Web App
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 300);
    } else {
      // Calculate results
      const calculatedResults = calculateResults(newAnswers);
      setResults(calculatedResults);
      setTimeout(() => {
        setShowResult(true);
      }, 300);
    }
  };

  const handleStartVision = () => {
    // Send data to Telegram if in Mini App context
    if (window.Telegram?.WebApp && results) {
      window.Telegram.WebApp.sendData(
        JSON.stringify({
          action: "start_vision",
          score: results.totalScore,
          answers,
        })
      );
    }
    // Always navigate to auth for registration
    navigate("/auth");
  };

  const handleShare = () => {
    if (!results) return;

    const shareText = t("quiz.shareText")
      .replace("{score}", String(results.totalScore))
      .replace("{days}", String(results.daysToFirst100));
    const quizUrl = window.location.origin + "/quiz";

    // Try Telegram first
    if (window.Telegram?.WebApp) {
      const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(quizUrl)}&text=${encodeURIComponent(shareText)}`;
      window.Telegram.WebApp.openTelegramLink(telegramShareUrl);
    }
    // Try Web Share API (modern browsers)
    else if (navigator.share) {
      navigator.share({
        title: "Idea Launchpad Quiz",
        text: shareText,
        url: quizUrl,
      }).catch(() => {
        // Fallback to copy to clipboard
        copyToClipboard(shareText + "\n" + quizUrl);
      });
    }
    // Final fallback: copy to clipboard
    else {
      copyToClipboard(shareText + "\n" + quizUrl);
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
    setLanguage(language === "en" ? "ru" : "en");
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
            {language === "en" ? "🇷🇺 RU" : "🇬🇧 EN"}
          </button>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-y-auto">
        <div className="max-w-md mx-auto">
          <AnimatePresence mode="wait">
            {!showResult ? (
              <motion.div
                key="quiz"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                {/* Progress */}
                <QuizProgress
                  current={currentQuestion}
                  total={QUIZ_QUESTIONS.length}
                />

                {/* Question */}
                <AnimatePresence mode="wait">
                  <QuizQuestion
                    key={currentQuestion}
                    question={QUIZ_QUESTIONS[currentQuestion]}
                    questionIndex={currentQuestion}
                    onAnswer={handleAnswer}
                  />
                </AnimatePresence>
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
                  onStartVision={handleStartVision}
                  onShare={handleShare}
                />

                {/* Restart button */}
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

export default Quiz;
