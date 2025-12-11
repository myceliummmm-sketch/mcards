import { motion } from "framer-motion";

interface QuizProgressProps {
  current: number;
  total: number;
}

export const QuizProgress = ({ current, total }: QuizProgressProps) => {
  const progress = ((current + 1) / total) * 100;

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center text-sm text-muted-foreground font-body">
        <span>Вопрос {current + 1} из {total}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="xp-bar h-3">
        <motion.div
          className="xp-fill"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <div className="flex justify-between gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <motion.div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i <= current ? "bg-primary" : "bg-muted"
            }`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
          />
        ))}
      </div>
    </div>
  );
};
