import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { PASSPORT_QUIZ_QUESTIONS, type ArchetypeKey } from "@/data/passportQuizData";

interface SystemQuizProps {
  onComplete: (answers: ArchetypeKey[]) => void;
}

export const SystemQuiz = ({ onComplete }: SystemQuizProps) => {
  const { t } = useTranslation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<ArchetypeKey[]>([]);

  const handleAnswer = (archetype: ArchetypeKey) => {
    const newAnswers = [...answers, archetype];
    setAnswers(newAnswers);

    if (currentQuestion < PASSPORT_QUIZ_QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(prev => prev + 1);
      }, 300);
    } else {
      setTimeout(() => {
        onComplete(newAnswers);
      }, 500);
    }
  };

  const progress = ((currentQuestion + 1) / PASSPORT_QUIZ_QUESTIONS.length) * 100;
  const question = PASSPORT_QUIZ_QUESTIONS[currentQuestion];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative"
    >
      {/* Grid background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: 'linear-gradient(#00FF00 1px, transparent 1px), linear-gradient(90deg, #00FF00 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Intro message */}
      <motion.p
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[#00FF00]/70 text-sm font-mono mb-8 tracking-wider"
      >
        {t('brokenSystem.quiz.intro')}
      </motion.p>

      {/* Heartbeat Progress Bar */}
      <div className="w-full max-w-md mb-12 relative">
        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#00FF00] relative"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          >
            {/* Heartbeat pulse effect */}
            <motion.div
              className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#00FF00] rounded-full"
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(0, 255, 0, 0.7)',
                  '0 0 0 10px rgba(0, 255, 0, 0)',
                  '0 0 0 0 rgba(0, 255, 0, 0)',
                ],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500 font-mono">
          <span>{t('brokenSystem.quiz.step').replace('{current}', String(currentQuestion + 1)).replace('{total}', String(PASSPORT_QUIZ_QUESTIONS.length))}</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-lg"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">
            {question.question}
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {question.options.map((option, index) => (
              <motion.button
                key={index}
                onClick={() => handleAnswer(option.archetype)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, borderColor: '#00FF00' }}
                whileTap={{ scale: 0.98 }}
                className="p-6 bg-gray-900/50 border border-gray-700 rounded-xl hover:border-[#00FF00] hover:bg-[#00FF00]/5 transition-all group"
              >
                <span className="text-3xl mb-3 block">{option.icon}</span>
                <span className="text-white font-medium group-hover:text-[#00FF00] transition-colors">
                  {option.label}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};
