import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PROJECT_SEED_QUESTIONS } from '@/data/passportQuizData';

interface ProjectSeedQuizProps {
  onComplete: (answers: number[]) => void;
  onTrackEvent?: (event: string, metadata?: Record<string, unknown>) => void;
}

export function ProjectSeedQuiz({ onComplete, onTrackEvent }: ProjectSeedQuizProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const currentQuestion = PROJECT_SEED_QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / PROJECT_SEED_QUESTIONS.length) * 100;

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    onTrackEvent?.(`project_seed_step_${currentStep + 1}`, { 
      category: currentQuestion.category,
      value: currentQuestion.options[optionIndex].value 
    });

    if (currentStep < PROJECT_SEED_QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 300);
    } else {
      setTimeout(() => {
        onComplete(newAnswers);
      }, 300);
    }
  };

  const categoryLabels = {
    target: '🎯 Target',
    pain: '💢 Pain',
    enemy: '⚔️ Enemy',
    timing: '⏰ Timing'
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D1117] px-4">
      <div className="w-full max-w-2xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-white/50 mb-2">
            <span>{categoryLabels[currentQuestion.category]}</span>
            <span>Step {currentStep + 1} of {PROJECT_SEED_QUESTIONS.length}</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-[#2E7D32]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
              {currentQuestion.question}
            </h2>

            {/* Options */}
            <div className={`grid grid-cols-1 ${currentQuestion.options.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-4`}>
              {currentQuestion.options.map((option, index) => (
                <motion.button
                  key={option.label}
                  onClick={() => handleAnswer(index)}
                  className="group relative p-6 rounded-xl backdrop-blur-xl bg-white/5 border-2 border-white/10 hover:border-[#2E7D32] hover:bg-[#2E7D32]/10 transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex flex-col items-center text-center gap-3">
                    <span className="text-4xl">{option.icon}</span>
                    <span className="text-lg font-semibold text-white group-hover:text-[#2E7D32] transition-colors">
                      {option.label}
                    </span>
                  </div>

                  {/* Hover glow */}
                  <div className="absolute inset-0 rounded-xl bg-[#2E7D32]/0 group-hover:bg-[#2E7D32]/5 transition-colors" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Previous answers */}
        {answers.length > 0 && (
          <motion.div 
            className="flex justify-center gap-2 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {answers.map((answerIndex, stepIndex) => (
              <div 
                key={stepIndex}
                className="w-8 h-8 rounded-full bg-[#2E7D32]/20 flex items-center justify-center text-sm"
              >
                {PROJECT_SEED_QUESTIONS[stepIndex].options[answerIndex].icon}
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
