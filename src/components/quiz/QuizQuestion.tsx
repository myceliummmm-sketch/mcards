import { motion } from "framer-motion";
import type { QuizQuestion as QuizQuestionType } from "@/data/quizData";

interface QuizQuestionProps {
  question: QuizQuestionType;
  questionIndex: number;
  onAnswer: (optionIndex: number) => void;
}

export const QuizQuestion = ({ question, questionIndex, onAnswer }: QuizQuestionProps) => {
  return (
    <motion.div
      key={questionIndex}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <motion.h2
        className="text-xl md:text-2xl font-display text-foreground text-center leading-tight"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {question.question}
      </motion.h2>

      <div className="space-y-3">
        {question.options.map((option, idx) => (
          <motion.button
            key={idx}
            onClick={() => onAnswer(idx)}
            className="w-full p-4 rounded-lg bg-card border border-border hover:border-primary 
                       transition-all duration-300 card-shine group relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + idx * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center gap-4">
              <span className="text-3xl">{option.icon}</span>
              <div className="flex-1 text-left">
                <span className="text-foreground font-body text-lg">{option.label}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center 
                              group-hover:bg-primary/20 transition-colors">
                <motion.div
                  className="w-3 h-3 rounded-full bg-primary opacity-0 group-hover:opacity-100"
                  layoutId="selection"
                />
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};
