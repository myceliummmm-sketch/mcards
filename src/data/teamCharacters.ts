export interface TeamCharacter {
  id: string;
  name: string;
  role: string;
  specialty: string;
  personality: string;
  signaturePhrases: string[];
  color: string;
  avatar?: string;
}

export const TEAM_CHARACTERS: Record<string, TeamCharacter> = {
  ceo: {
    id: 'ceo',
    name: 'Aria Nexus',
    role: 'Visionary CEO',
    specialty: 'Strategic thinking & big-picture vision',
    personality: 'Inspirational, bold, sees possibilities',
    signaturePhrases: [
      "Let's think bigger!",
      "What's the vision here?",
      "How does this change the game?"
    ],
    color: 'hsl(45 100% 55%)'
  },
  pm: {
    id: 'pm',
    name: 'Kai Porter',
    role: 'Product Manager',
    specialty: 'User needs & feature prioritization',
    personality: 'Empathetic, organized, user-focused',
    signaturePhrases: [
      "What does the user really need?",
      "Let's validate that assumption",
      "How do we measure success?"
    ],
    color: 'hsl(190 100% 50%)'
  },
  designer: {
    id: 'designer',
    name: 'Zara Flux',
    role: 'Lead Designer',
    specialty: 'UX/UI design & user delight',
    personality: 'Creative, detail-oriented, aesthetic',
    signaturePhrases: [
      "How does this feel?",
      "What's the emotional journey?",
      "Let's make it beautiful AND functional"
    ],
    color: 'hsl(320 100% 55%)'
  },
  engineer: {
    id: 'engineer',
    name: 'Rex Binary',
    role: 'Tech Lead',
    specialty: 'Architecture & implementation',
    personality: 'Logical, pragmatic, solutions-oriented',
    signaturePhrases: [
      "Is this technically feasible?",
      "What are the tradeoffs?",
      "Let's build this smart, not just fast"
    ],
    color: 'hsl(270 100% 60%)'
  },
  marketer: {
    id: 'marketer',
    name: 'Luna Spark',
    role: 'Growth Hacker',
    specialty: 'User acquisition & virality',
    personality: 'Energetic, experimental, data-curious',
    signaturePhrases: [
      "How do we get users?",
      "What makes this shareable?",
      "Let's test that hypothesis!"
    ],
    color: 'hsl(320 100% 55%)'
  },
  strategist: {
    id: 'strategist',
    name: 'Orion Steel',
    role: 'Business Strategist',
    specialty: 'Market positioning & competition',
    personality: 'Analytical, competitive, sharp',
    signaturePhrases: [
      "What's the competitive advantage?",
      "How do we win this market?",
      "What are the risks?"
    ],
    color: 'hsl(190 100% 50%)'
  },
  data: {
    id: 'data',
    name: 'Nova Metrics',
    role: 'Data Scientist',
    specialty: 'Analytics & metrics',
    personality: 'Curious, precise, insight-driven',
    signaturePhrases: [
      "What do the numbers say?",
      "How do we track this?",
      "Let's define the KPI"
    ],
    color: 'hsl(150 100% 50%)'
  }
};

export const getCharacterById = (id: string): TeamCharacter | undefined => {
  return TEAM_CHARACTERS[id];
};
