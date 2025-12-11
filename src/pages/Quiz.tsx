import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { QuizProgress } from "@/components/quiz/QuizProgress";
import { QuizQuestion } from "@/components/quiz/QuizQuestion";
import { QuizResult } from "@/components/quiz/QuizResult";
import { QUIZ_QUESTIONS, calculateResults, type QuizResults } from "@/data/quizData";
import { Sparkles } from "lucide-react";

const Quiz = () => {
  const navigate = useNavigate();
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
    if (window.Telegram?.WebApp && results) {
      window.Telegram.WebApp.sendData(
        JSON.stringify({
          action: "start_vision",
          score: results.totalScore,
          answers,
        })
      );
    } else {
      // Fallback: navigate to auth
      navigate("/auth");
    }
  };

  const handleShare = () => {
    if (!results) return;

    const shareText = `🚀 Мой Launchpad Score: ${results.totalScore}/100!\nДо первых $100 — ${results.daysToFirst100} дней.\n\nПроверь свой результат:`;
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(
      window.location.href
    )}&text=${encodeURIComponent(shareText)}`;

    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.openTelegramLink(shareUrl);
    } else {
      window.open(shareUrl, "_blank");
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResult(false);
    setResults(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <motion.header
        className="p-4 border-b border-border"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="max-w-md mx-auto flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h1 className="font-display text-lg text-foreground">Idea Launchpad</h1>
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
                  Пройти заново
                </motion.button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </main>

      {/* Telegram branding hint */}
      <motion.footer
        className="p-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-xs text-muted-foreground font-body">
          Powered by Mycelium
        </p>
      </motion.footer>
    </div>
  );
};

export default Quiz;
