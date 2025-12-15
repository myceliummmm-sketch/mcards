export interface QuizOption {
  icon: string;
  labelKey: string;
  points: number;
  blocker?: string | null;
}

export interface QuizQuestion {
  questionKey: string;
  options: QuizOption[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    questionKey: "quiz.questions.q1",
    options: [
      { icon: "💡", labelKey: "quiz.options.q1_o1", points: 30, blocker: null },
      { icon: "🤔", labelKey: "quiz.options.q1_o2", points: 20, blocker: null },
      { icon: "🔍", labelKey: "quiz.options.q1_o3", points: 10, blocker: "fear_of_choice" },
    ],
  },
  {
    questionKey: "quiz.questions.q2",
    options: [
      { icon: "⏰", labelKey: "quiz.options.q2_o1", points: 15, blocker: null },
      { icon: "📅", labelKey: "quiz.options.q2_o2", points: 25, blocker: null },
      { icon: "🚀", labelKey: "quiz.options.q2_o3", points: 30, blocker: null },
    ],
  },
  {
    questionKey: "quiz.questions.q3",
    options: [
      { icon: "🌱", labelKey: "quiz.options.q3_o1", points: 10, blocker: null },
      { icon: "🔄", labelKey: "quiz.options.q3_o2", points: 20, blocker: "fear_of_repeat" },
      { icon: "⭐", labelKey: "quiz.options.q3_o3", points: 30, blocker: null },
    ],
  },
  {
    questionKey: "quiz.questions.q4",
    options: [
      { icon: "⚡", labelKey: "quiz.options.q4_o1", points: 25, blocker: null },
      { icon: "⚖️", labelKey: "quiz.options.q4_o2", points: 15, blocker: null },
      { icon: "💎", labelKey: "quiz.options.q4_o3", points: 10, blocker: "perfectionism" },
    ],
  },
];

export const BLOCKER_KEYS: Record<string, { titleKey: string; descriptionKey: string }> = {
  fear_of_choice: {
    titleKey: "quiz.blockers.fear_of_choice.title",
    descriptionKey: "quiz.blockers.fear_of_choice.description",
  },
  fear_of_repeat: {
    titleKey: "quiz.blockers.fear_of_repeat.title",
    descriptionKey: "quiz.blockers.fear_of_repeat.description",
  },
  perfectionism: {
    titleKey: "quiz.blockers.perfectionism.title",
    descriptionKey: "quiz.blockers.perfectionism.description",
  },
  start_paralysis: {
    titleKey: "quiz.blockers.start_paralysis.title",
    descriptionKey: "quiz.blockers.start_paralysis.description",
  },
};

export interface QuizResults {
  totalScore: number;
  daysToFirst100: number;
  blocker: string;
  visionDays: number;
  researchDays: number;
  buildDays: number;
}

export const VIDEO_BY_BLOCKER: Record<string, string> = {
  fear_of_choice: "/videos/prisma_blocker.mp4",
  start_paralysis: "/videos/ever_blocker.mp4",
  fear_of_repeat: "/videos/toxic_blocker.mp4",
  perfectionism: "/videos/techpriest_blocker.mp4",
};

export const CHARACTER_BY_BLOCKER: Record<string, string> = {
  fear_of_choice: "prisma",
  start_paralysis: "evergreen",
  fear_of_repeat: "toxic",
  perfectionism: "techpriest",
};

export const getVideoUrl = (score: number, blocker: string): string => {
  if (score >= 80) {
    return "/videos/phoenix_success.mp4";
  }
  return VIDEO_BY_BLOCKER[blocker] || "/videos/ever_blocker.mp4";
};

export const calculateResults = (answers: number[]): QuizResults => {
  const totalScore = QUIZ_QUESTIONS.reduce(
    (sum, q, i) => sum + q.options[answers[i]].points,
    0
  );

  const daysToFirst100 = Math.max(7, Math.round(21 - totalScore / 10));

  let blocker = "start_paralysis";
  if (answers[0] === 2) blocker = "fear_of_choice";
  else if (answers[2] === 1) blocker = "fear_of_repeat";
  else if (answers[3] === 2) blocker = "perfectionism";

  const visionDays = answers[0] === 0 ? 1 : answers[0] === 1 ? 2 : 3;
  const researchDays = 3;
  const buildDays = Math.max(1, daysToFirst100 - visionDays - researchDays - 1);

  return { totalScore, daysToFirst100, blocker, visionDays, researchDays, buildDays };
};
