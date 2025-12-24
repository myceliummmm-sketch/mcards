// Passport Quiz - 4 questions to determine archetype
export interface PassportQuizOption {
  icon: string;
  label: string;
  archetype: 'IGNITER' | 'SEEKER' | 'GUARDIAN' | 'CULTIVATOR';
}

export interface PassportQuizQuestion {
  question: string;
  options: PassportQuizOption[];
}

export const PASSPORT_QUIZ_QUESTIONS: PassportQuizQuestion[] = [
  {
    question: "What drives you most?",
    options: [
      { icon: "🔥", label: "Making Impact", archetype: "IGNITER" },
      { icon: "🔍", label: "Finding Answers", archetype: "SEEKER" },
      { icon: "🛡", label: "Building Safety", archetype: "GUARDIAN" },
      { icon: "🌱", label: "Growing Systems", archetype: "CULTIVATOR" }
    ]
  },
  {
    question: "How do you approach problems?",
    options: [
      { icon: "⚡", label: "Move fast, break things", archetype: "IGNITER" },
      { icon: "🧩", label: "Research deeply first", archetype: "SEEKER" },
      { icon: "🔒", label: "Secure foundations", archetype: "GUARDIAN" },
      { icon: "🌿", label: "Organic evolution", archetype: "CULTIVATOR" }
    ]
  },
  {
    question: "What's your superpower?",
    options: [
      { icon: "💥", label: "Starting revolutions", archetype: "IGNITER" },
      { icon: "🔮", label: "Seeing patterns", archetype: "SEEKER" },
      { icon: "⚔️", label: "Protecting assets", archetype: "GUARDIAN" },
      { icon: "🤝", label: "Growing networks", archetype: "CULTIVATOR" }
    ]
  },
  {
    question: "Your ideal outcome?",
    options: [
      { icon: "🚀", label: "Change the world", archetype: "IGNITER" },
      { icon: "💡", label: "Discover truth", archetype: "SEEKER" },
      { icon: "🏰", label: "Build fortress", archetype: "GUARDIAN" },
      { icon: "🌳", label: "Create ecosystem", archetype: "CULTIVATOR" }
    ]
  }
];

// Project Seed Quiz - Problem Discovery
export interface ProjectSeedOption {
  icon: string;
  label: string;
  value: string;
}

export interface ProjectSeedQuestion {
  question: string;
  category: 'target' | 'pain' | 'enemy' | 'timing';
  options: ProjectSeedOption[];
}

export const PROJECT_SEED_QUESTIONS: ProjectSeedQuestion[] = [
  {
    question: "Who are you building for?",
    category: 'target',
    options: [
      { icon: "🌍", label: "Sovereign Individuals", value: "sovereign" },
      { icon: "💻", label: "Digital Nomads", value: "nomads" },
      { icon: "🛡", label: "DAOs/Communities", value: "daos" },
      { icon: "👤", label: "Niche Users", value: "niche" }
    ]
  },
  {
    question: "What is their biggest struggle?",
    category: 'pain',
    options: [
      { icon: "⏳", label: "Wasted Time/Money", value: "waste" },
      { icon: "⛓", label: "Lack of Freedom", value: "freedom" },
      { icon: "🧩", label: "High Complexity", value: "complexity" },
      { icon: "📉", label: "Inefficiency", value: "inefficiency" }
    ]
  },
  {
    question: "Why do current solutions fail them?",
    category: 'enemy',
    options: [
      { icon: "🏛", label: "Too Centralized", value: "centralized" },
      { icon: "💰", label: "Too Expensive", value: "expensive" },
      { icon: "🤖", label: "Outdated Tech", value: "outdated" },
      { icon: "😴", label: "No Soul", value: "soulless" }
    ]
  },
  {
    question: "Why is now the perfect time?",
    category: 'timing',
    options: [
      { icon: "📈", label: "Emerging Trend", value: "trend" },
      { icon: "🔥", label: "Personal Pain", value: "pain" },
      { icon: "🛠", label: "Tech Breakthrough", value: "tech" }
    ]
  }
];

// Archetypes with colors and descriptions
export type ArchetypeKey = 'IGNITER' | 'SEEKER' | 'GUARDIAN' | 'CULTIVATOR';

export interface ArchetypeData {
  color: string;
  title: string;
  description: string;
  trait: string;
}

export const ARCHETYPE_DATA: Record<ArchetypeKey, ArchetypeData> = {
  IGNITER: { 
    color: "#FF6B35", 
    title: "THE IGNITER",
    description: "You light fires that spread. Your energy catalyzes movements.",
    trait: "Catalyst of Change"
  },
  SEEKER: { 
    color: "#4ECDC4", 
    title: "THE SEEKER",
    description: "You find paths others miss. Your curiosity unlocks doors.",
    trait: "Pattern Finder"
  },
  GUARDIAN: { 
    color: "#7B68EE", 
    title: "THE GUARDIAN",
    description: "You protect what matters. Your vigilance creates safety.",
    trait: "Shield Bearer"
  },
  CULTIVATOR: { 
    color: "#2E7D32", 
    title: "THE CULTIVATOR",
    description: "You grow ecosystems. Your patience builds empires.",
    trait: "System Gardener"
  }
};

// Helper to calculate dominant archetype from answers
export function calculateArchetype(answers: ArchetypeKey[]): ArchetypeKey {
  const counts: Record<ArchetypeKey, number> = {
    IGNITER: 0,
    SEEKER: 0,
    GUARDIAN: 0,
    CULTIVATOR: 0
  };
  
  answers.forEach(archetype => {
    counts[archetype]++;
  });
  
  let maxCount = 0;
  let dominant: ArchetypeKey = 'CULTIVATOR';
  
  (Object.keys(counts) as ArchetypeKey[]).forEach(key => {
    if (counts[key] > maxCount) {
      maxCount = counts[key];
      dominant = key;
    }
  });
  
  return dominant;
}

// Generate passport number
export function generatePassportNumber(): string {
  const prefix = 'MYC';
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  const random = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `${prefix}-${timestamp}-${random}`;
}
