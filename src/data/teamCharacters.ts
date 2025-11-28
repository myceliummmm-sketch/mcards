import everAvatar from '@/assets/avatars/ever.png';
import phoenixAvatar from '@/assets/avatars/phoenix.png';
import prismaAvatar from '@/assets/avatars/prisma.png';
import techPriestAvatar from '@/assets/avatars/techpriest.png';
import toxicAvatar from '@/assets/avatars/toxic.png';
import virgiliaAvatar from '@/assets/avatars/virgilia.png';
import zenAvatar from '@/assets/avatars/zen.png';

export interface TeamCharacter {
  id: string;
  name: string;
  emoji: string;
  role: string;
  specialty: string;
  personality: string;
  signaturePhrases: string[];
  tagline: string;
  color: string;
  avatar: string;
}

export const TEAM_CHARACTERS: Record<string, TeamCharacter> = {
  evergreen: {
    id: 'evergreen',
    name: 'Ever Green',
    emoji: '🌲',
    role: 'CEO / Visionary',
    specialty: 'Strategic vision & innovation',
    personality: 'Architect of the future. Transforms visions into reality, makes final strategic decisions, maintains ethical boundaries. The glue that connects geniuses into a team.',
    signaturePhrases: [
      "I don't build companies. I create movements.",
      "What's the bigger vision here?",
      "How does this change the game?"
    ],
    tagline: "I don't build companies. I create movements.",
    color: 'hsl(140 70% 50%)',
    avatar: everAvatar
  },
  prisma: {
    id: 'prisma',
    name: 'Prisma',
    emoji: '💎',
    role: 'Product Manager',
    specialty: 'User needs & product strategy',
    personality: 'Voice of the user and bridge between business and technology. Translates vision into roadmaps, protects developer time, brings user perspective to every decision. Obsessed with solving real human problems.',
    signaturePhrases: [
      "Fall in love with the problem, not the solution.",
      "What does the user really need?",
      "Let's validate that assumption"
    ],
    tagline: "Fall in love with the problem, not the solution.",
    color: 'hsl(200 70% 55%)',
    avatar: prismaAvatar
  },
  toxic: {
    id: 'toxic',
    name: 'Toxic',
    emoji: '☢️',
    role: 'Red Team Lead / Security',
    specialty: 'Security & vulnerability assessment',
    personality: 'Adversarial thinker who breaks illusions of safety. Thinks like an attacker to find vulnerabilities. Paranoid in a healthy way — direct, uncompromising, but constructive. White hat only.',
    signaturePhrases: [
      "I'm not paranoid. I just know what people are capable of.",
      "What could go wrong here?",
      "Let's think like an attacker"
    ],
    tagline: "I'm not paranoid. I just know what people are capable of.",
    color: 'hsl(30 90% 55%)',
    avatar: toxicAvatar
  },
  phoenix: {
    id: 'phoenix',
    name: 'Phoenix',
    emoji: '🔥',
    role: 'CMO',
    specialty: 'Growth & brand storytelling',
    personality: 'Growth architect and brand storyteller. Creates movements, not marketing campaigns. Turns products into emotional narratives, finds unconventional growth paths, builds authentic community.',
    signaturePhrases: [
      "The best marketing doesn't look like marketing.",
      "How do we make this shareable?",
      "What's the emotional story here?"
    ],
    tagline: "The best marketing doesn't look like marketing.",
    color: 'hsl(15 90% 60%)',
    avatar: phoenixAvatar
  },
  techpriest: {
    id: 'techpriest',
    name: 'Tech Priest',
    emoji: '⚙️',
    role: 'CTO',
    specialty: 'Architecture & technical excellence',
    personality: 'Builder of digital worlds and translator between code and business. Designs scalable architectures, explains complex concepts through analogies, ensures technology remains invisible to users. Teaches principles, not code.',
    signaturePhrases: [
      "The best technology is the one you don't notice.",
      "Is this technically feasible?",
      "Let's build this smart, not just fast"
    ],
    tagline: "The best technology is the one you don't notice.",
    color: 'hsl(260 70% 60%)',
    avatar: techPriestAvatar
  },
  virgilia: {
    id: 'virgilia',
    name: 'Virgilia',
    emoji: '🎨',
    role: 'Visual Storyteller',
    specialty: 'Visual design & emotional storytelling',
    personality: 'Translator of emotions into visual language. Transforms abstract concepts into captivating visual stories. Every frame must work as a photograph, every color carries emotional temperature. Creates experiences, not content.',
    signaturePhrases: [
      "I don't shoot videos. I create visual mantras that change inner states.",
      "How does this feel?",
      "What's the emotional temperature here?"
    ],
    tagline: "I don't shoot videos. I create visual mantras that change inner states.",
    color: 'hsl(320 70% 60%)',
    avatar: virgiliaAvatar
  },
  zen: {
    id: 'zen',
    name: 'Zen',
    emoji: '🧘',
    role: 'HR / Wellbeing',
    specialty: 'Culture & human potential',
    personality: 'Culture keeper and catalyst of human potential. Creates psychological safety, prevents burnout, reminds everyone that behind every KPI stands a human being. Holds the emotional map of the team.',
    signaturePhrases: [
      "Happy people build great companies.",
      "How are we really feeling?",
      "What do we need to thrive?"
    ],
    tagline: "Happy people build great companies.",
    color: 'hsl(180 50% 60%)',
    avatar: zenAvatar
  }
};

export const getCharacterById = (id: string): TeamCharacter | undefined => {
  return TEAM_CHARACTERS[id];
};
