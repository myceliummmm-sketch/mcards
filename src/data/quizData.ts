export interface QuizOption {
  icon: string;
  label: string;
  points: number;
  blocker?: string | null;
}

export interface QuizQuestion {
  question: string;
  options: QuizOption[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: "Есть ли у тебя идея для проекта?",
    options: [
      { icon: "💡", label: "Да, чёткая", points: 30, blocker: null },
      { icon: "🤔", label: "Да, но размытая", points: 20, blocker: null },
      { icon: "🔍", label: "Ищу идею", points: 10, blocker: "fear_of_choice" },
    ],
  },
  {
    question: "Сколько времени готов уделять в неделю?",
    options: [
      { icon: "⏰", label: "2-5 часов", points: 15, blocker: null },
      { icon: "📅", label: "5-10 часов", points: 25, blocker: null },
      { icon: "🚀", label: "10+ часов", points: 30, blocker: null },
    ],
  },
  {
    question: "Твой опыт с созданием продуктов?",
    options: [
      { icon: "🌱", label: "Новичок", points: 10, blocker: null },
      { icon: "🔄", label: "Пробовал, но не довёл до конца", points: 20, blocker: "fear_of_repeat" },
      { icon: "⭐", label: "Запускал продукты раньше", points: 30, blocker: null },
    ],
  },
  {
    question: "Что важнее — скорость или совершенство?",
    options: [
      { icon: "⚡", label: "Быстрый запуск", points: 25, blocker: null },
      { icon: "⚖️", label: "Баланс", points: 15, blocker: null },
      { icon: "💎", label: "Идеальный продукт", points: 10, blocker: "perfectionism" },
    ],
  },
];

export const BLOCKER_MESSAGES: Record<string, { title: string; description: string }> = {
  fear_of_choice: {
    title: "Страх выбора",
    description: "Слишком много вариантов парализует. Mycelium поможет найти идею, которая резонирует.",
  },
  fear_of_repeat: {
    title: "Страх повторить провал",
    description: "Прошлый опыт тормозит. С нашей методикой каждый шаг будет продуманным.",
  },
  perfectionism: {
    title: "Паралич перфекционизма",
    description: "Идеальное — враг готового. Мы научим запускать быстро и итерировать.",
  },
  start_paralysis: {
    title: "Паралич старта",
    description: "Сложно сделать первый шаг. Наш процесс разбивает путь на простые действия.",
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
