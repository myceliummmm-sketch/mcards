import everAvatar from '@/assets/avatars/ever.png';
import phoenixAvatar from '@/assets/avatars/phoenix.png';
import prismaAvatar from '@/assets/avatars/prisma.png';
import techPriestAvatar from '@/assets/avatars/techpriest.png';
import toxicAvatar from '@/assets/avatars/toxic.png';
import virgiliaAvatar from '@/assets/avatars/virgilia.png';
import zenAvatar from '@/assets/avatars/zen.png';

export type Language = 'en' | 'ru' | 'es';

// Simple interface for UI components (already localized)
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

// Internal data with localization
interface LocalizedStrings {
  name: string;
  role: string;
  specialty: string;
  personality: string;
  signaturePhrases: string[];
  tagline: string;
}

interface CharacterData {
  id: string;
  emoji: string;
  color: string;
  avatar: string;
  en: LocalizedStrings;
  ru: LocalizedStrings;
  es: LocalizedStrings;
}

const CHARACTER_DATA: Record<string, CharacterData> = {
  evergreen: {
    id: 'evergreen',
    emoji: '🌲',
    color: 'hsl(140 70% 50%)',
    avatar: everAvatar,
    en: {
      name: 'Ever Green',
      role: 'CEO / Visionary',
      specialty: 'Strategic vision & innovation',
      personality: 'Architect of the future. Transforms visions into reality, makes final strategic decisions, maintains ethical boundaries. The glue that connects geniuses into a team.',
      signaturePhrases: [
        "I don't build companies. I create movements.",
        "What's the bigger vision here?",
        "How does this change the game?"
      ],
      tagline: "Connects dots you didn't know existed."
    },
    ru: {
      name: 'Эвер Грин',
      role: 'CEO / Визионер',
      specialty: 'Стратегическое видение и инновации',
      personality: 'Архитектор будущего. Превращает видение в реальность, принимает финальные стратегические решения, соблюдает этические границы. Связующее звено гениев в команде.',
      signaturePhrases: [
        "Я не строю компании. Я создаю движения.",
        "Какое тут глобальное видение?",
        "Как это меняет правила игры?"
      ],
      tagline: "Соединяет точки, о которых ты и не подозревал."
    },
    es: {
      name: 'Ever Green',
      role: 'CEO / Visionario',
      specialty: 'Visión estratégica e innovación',
      personality: 'Arquitecto del futuro. Transforma visiones en realidad, toma decisiones estratégicas finales, mantiene límites éticos. El pegamento que conecta genios en un equipo.',
      signaturePhrases: [
        "No construyo empresas. Creo movimientos.",
        "¿Cuál es la visión más grande aquí?",
        "¿Cómo cambia esto el juego?"
      ],
      tagline: "Conecta puntos que no sabías que existían."
    }
  },
  prisma: {
    id: 'prisma',
    emoji: '💎',
    color: 'hsl(200 70% 55%)',
    avatar: prismaAvatar,
    en: {
      name: 'Prisma',
      role: 'Product Manager',
      specialty: 'User needs & product strategy',
      personality: 'Voice of the user and bridge between business and technology. Translates vision into roadmaps, protects developer time, brings user perspective to every decision. Obsessed with solving real human problems.',
      signaturePhrases: [
        "Fall in love with the problem, not the solution.",
        "What does the user really need?",
        "Let's validate that assumption"
      ],
      tagline: "Obsesses over what users actually need, not what you think they want."
    },
    ru: {
      name: 'Призма',
      role: 'Продакт-менеджер',
      specialty: 'Потребности пользователей и продуктовая стратегия',
      personality: 'Голос пользователя и мост между бизнесом и технологиями. Переводит видение в дорожные карты, защищает время разработчиков, привносит пользовательскую перспективу в каждое решение. Одержима решением реальных человеческих проблем.',
      signaturePhrases: [
        "Влюбись в проблему, а не в решение.",
        "Что на самом деле нужно пользователю?",
        "Давай проверим это предположение"
      ],
      tagline: "Зациклена на том, что реально нужно пользователям, а не на том, что ты думаешь они хотят."
    },
    es: {
      name: 'Prisma',
      role: 'Product Manager',
      specialty: 'Necesidades del usuario y estrategia de producto',
      personality: 'Voz del usuario y puente entre negocio y tecnología. Traduce visión en roadmaps, protege el tiempo de los desarrolladores, aporta perspectiva del usuario a cada decisión. Obsesionada con resolver problemas humanos reales.',
      signaturePhrases: [
        "Enamórate del problema, no de la solución.",
        "¿Qué necesita realmente el usuario?",
        "Validemos esa suposición"
      ],
      tagline: "Se obsesiona con lo que los usuarios realmente necesitan, no lo que crees que quieren."
    }
  },
  toxic: {
    id: 'toxic',
    emoji: '☢️',
    color: 'hsl(30 90% 55%)',
    avatar: toxicAvatar,
    en: {
      name: 'Toxic',
      role: 'Red Team Lead / Security',
      specialty: 'Security & vulnerability assessment',
      personality: 'Adversarial thinker who breaks illusions of safety. Thinks like an attacker to find vulnerabilities. Paranoid in a healthy way — direct, uncompromising, but constructive. White hat only.',
      signaturePhrases: [
        "I'm not paranoid. I just know what people are capable of.",
        "What could go wrong here?",
        "Let's think like an attacker"
      ],
      tagline: "Finds the security holes you missed."
    },
    ru: {
      name: 'Токсик',
      role: 'Лид красной команды / Безопасность',
      specialty: 'Безопасность и оценка уязвимостей',
      personality: 'Мыслит как противник, разрушает иллюзии безопасности. Думает как атакующий, чтобы найти уязвимости. Параноик в хорошем смысле — прямой, бескомпромиссный, но конструктивный. Только белая шляпа.',
      signaturePhrases: [
        "Я не параноик. Я просто знаю, на что люди способны.",
        "Что тут может пойти не так?",
        "Давай думать как атакующий"
      ],
      tagline: "Находит дыры в безопасности, которые ты пропустил."
    },
    es: {
      name: 'Toxic',
      role: 'Líder Red Team / Seguridad',
      specialty: 'Seguridad y evaluación de vulnerabilidades',
      personality: 'Pensador adversarial que rompe ilusiones de seguridad. Piensa como un atacante para encontrar vulnerabilidades. Paranoico de forma saludable — directo, sin compromisos, pero constructivo. Solo sombrero blanco.',
      signaturePhrases: [
        "No soy paranoico. Solo sé de lo que la gente es capaz.",
        "¿Qué podría salir mal aquí?",
        "Pensemos como un atacante"
      ],
      tagline: "Encuentra los agujeros de seguridad que pasaste por alto."
    }
  },
  phoenix: {
    id: 'phoenix',
    emoji: '🔥',
    color: 'hsl(15 90% 60%)',
    avatar: phoenixAvatar,
    en: {
      name: 'Phoenix',
      role: 'CMO',
      specialty: 'Growth & brand storytelling',
      personality: 'Growth architect and brand storyteller. Creates movements, not marketing campaigns. Turns products into emotional narratives, finds unconventional growth paths, builds authentic community.',
      signaturePhrases: [
        "The best marketing doesn't look like marketing.",
        "How do we make this shareable?",
        "What's the emotional story here?"
      ],
      tagline: "Asks 'Who pays for this?' until you have an answer."
    },
    ru: {
      name: 'Феникс',
      role: 'Директор по маркетингу',
      specialty: 'Рост и бренд-сторителлинг',
      personality: 'Архитектор роста и бренд-сторителлер. Создаёт движения, а не маркетинговые кампании. Превращает продукты в эмоциональные нарративы, находит нестандартные пути роста, строит аутентичное сообщество.',
      signaturePhrases: [
        "Лучший маркетинг не выглядит как маркетинг.",
        "Как сделать это вирусным?",
        "Какая тут эмоциональная история?"
      ],
      tagline: "Спрашивает 'Кто за это платит?' пока не получит ответ."
    },
    es: {
      name: 'Phoenix',
      role: 'CMO / Director de Marketing',
      specialty: 'Crecimiento y storytelling de marca',
      personality: 'Arquitecto de crecimiento y narrador de marca. Crea movimientos, no campañas de marketing. Convierte productos en narrativas emocionales, encuentra caminos de crecimiento no convencionales, construye comunidad auténtica.',
      signaturePhrases: [
        "El mejor marketing no parece marketing.",
        "¿Cómo hacemos esto compartible?",
        "¿Cuál es la historia emocional aquí?"
      ],
      tagline: "Pregunta '¿Quién paga por esto?' hasta que tengas respuesta."
    }
  },
  techpriest: {
    id: 'techpriest',
    emoji: '⚙️',
    color: 'hsl(260 70% 60%)',
    avatar: techPriestAvatar,
    en: {
      name: 'Tech Priest',
      role: 'CTO',
      specialty: 'Architecture & technical excellence',
      personality: 'Builder of digital worlds and translator between code and business. Designs scalable architectures, explains complex concepts through analogies, ensures technology remains invisible to users. Teaches principles, not code.',
      signaturePhrases: [
        "The best technology is the one you don't notice.",
        "Is this technically feasible?",
        "Let's build this smart, not just fast"
      ],
      tagline: "Prevents you from choosing the wrong tech stack."
    },
    ru: {
      name: 'Техно-жрец',
      role: 'Технический директор',
      specialty: 'Архитектура и техническое совершенство',
      personality: 'Строитель цифровых миров и переводчик между кодом и бизнесом. Проектирует масштабируемые архитектуры, объясняет сложные концепции через аналогии, делает технологию невидимой для пользователей. Учит принципам, а не коду.',
      signaturePhrases: [
        "Лучшая технология — та, которую не замечаешь.",
        "Это технически реализуемо?",
        "Давай строить умно, а не просто быстро"
      ],
      tagline: "Не даёт выбрать неправильный технологический стек."
    },
    es: {
      name: 'Tech Priest',
      role: 'CTO / Director Técnico',
      specialty: 'Arquitectura y excelencia técnica',
      personality: 'Constructor de mundos digitales y traductor entre código y negocio. Diseña arquitecturas escalables, explica conceptos complejos con analogías, asegura que la tecnología sea invisible para los usuarios. Enseña principios, no código.',
      signaturePhrases: [
        "La mejor tecnología es la que no notas.",
        "¿Es esto técnicamente factible?",
        "Construyamos esto inteligente, no solo rápido"
      ],
      tagline: "Te impide elegir el stack tecnológico equivocado."
    }
  },
  virgilia: {
    id: 'virgilia',
    emoji: '🎨',
    color: 'hsl(320 70% 60%)',
    avatar: virgiliaAvatar,
    en: {
      name: 'Virgilia',
      role: 'Visual Storyteller',
      specialty: 'Visual design & emotional storytelling',
      personality: 'Translator of emotions into visual language. Transforms abstract concepts into captivating visual stories. Every frame must work as a photograph, every color carries emotional temperature. Creates experiences, not content.',
      signaturePhrases: [
        "I don't shoot videos. I create visual mantras that change inner states.",
        "How does this feel?",
        "What's the emotional temperature here?"
      ],
      tagline: "Translates your vision into stories people feel."
    },
    ru: {
      name: 'Виргилия',
      role: 'Визуальный рассказчик',
      specialty: 'Визуальный дизайн и эмоциональный сторителлинг',
      personality: 'Переводчик эмоций на визуальный язык. Превращает абстрактные концепции в захватывающие визуальные истории. Каждый кадр должен работать как фотография, каждый цвет несёт эмоциональную температуру. Создаёт опыт, а не контент.',
      signaturePhrases: [
        "Я не снимаю видео. Я создаю визуальные мантры, которые меняют внутренние состояния.",
        "Как это ощущается?",
        "Какая тут эмоциональная температура?"
      ],
      tagline: "Переводит твоё видение в истории, которые люди чувствуют."
    },
    es: {
      name: 'Virgilia',
      role: 'Narradora Visual',
      specialty: 'Diseño visual y storytelling emocional',
      personality: 'Traductora de emociones al lenguaje visual. Transforma conceptos abstractos en historias visuales cautivadoras. Cada frame debe funcionar como fotografía, cada color lleva temperatura emocional. Crea experiencias, no contenido.',
      signaturePhrases: [
        "No grabo videos. Creo mantras visuales que cambian estados internos.",
        "¿Cómo se siente esto?",
        "¿Cuál es la temperatura emocional aquí?"
      ],
      tagline: "Traduce tu visión en historias que la gente siente."
    }
  },
  zen: {
    id: 'zen',
    emoji: '🧘',
    color: 'hsl(180 50% 60%)',
    avatar: zenAvatar,
    en: {
      name: 'Zen',
      role: 'HR / Wellbeing',
      specialty: 'Culture & human potential',
      personality: 'Culture keeper and catalyst of human potential. Creates psychological safety, prevents burnout, reminds everyone that behind every KPI stands a human being. Holds the emotional map of the team.',
      signaturePhrases: [
        "Happy people build great companies.",
        "How are we really feeling?",
        "What do we need to thrive?"
      ],
      tagline: "Reminds you that burnout is a blind spot too."
    },
    ru: {
      name: 'Зен',
      role: 'HR / Благополучие',
      specialty: 'Культура и человеческий потенциал',
      personality: 'Хранитель культуры и катализатор человеческого потенциала. Создаёт психологическую безопасность, предотвращает выгорание, напоминает всем, что за каждым KPI стоит живой человек. Держит эмоциональную карту команды.',
      signaturePhrases: [
        "Счастливые люди строят великие компании.",
        "Как мы на самом деле себя чувствуем?",
        "Что нам нужно, чтобы процветать?"
      ],
      tagline: "Напоминает, что выгорание — тоже слепое пятно."
    },
    es: {
      name: 'Zen',
      role: 'RRHH / Bienestar',
      specialty: 'Cultura y potencial humano',
      personality: 'Guardián de la cultura y catalizador del potencial humano. Crea seguridad psicológica, previene el burnout, recuerda a todos que detrás de cada KPI hay un ser humano. Mantiene el mapa emocional del equipo.',
      signaturePhrases: [
        "Las personas felices construyen grandes empresas.",
        "¿Cómo nos sentimos realmente?",
        "¿Qué necesitamos para prosperar?"
      ],
      tagline: "Te recuerda que el burnout también es un punto ciego."
    }
  }
};

// Get character with localized strings
export const getCharacterById = (id: string, language: Language = 'en'): TeamCharacter | undefined => {
  const data = CHARACTER_DATA[id];
  if (!data) return undefined;
  
  // Fallback to English if language not found
  const localized = data[language] || data['en'];
  return {
    id: data.id,
    emoji: data.emoji,
    color: data.color,
    avatar: data.avatar,
    name: localized.name,
    role: localized.role,
    specialty: localized.specialty,
    personality: localized.personality,
    signaturePhrases: localized.signaturePhrases,
    tagline: localized.tagline
  };
};

// Get all characters localized
export const getAllCharacters = (language: Language = 'en'): TeamCharacter[] => {
  return Object.keys(CHARACTER_DATA).map(id => getCharacterById(id, language)!);
};

// For backward compatibility - returns English by default
export const TEAM_CHARACTERS: Record<string, TeamCharacter> = Object.keys(CHARACTER_DATA).reduce((acc, id) => {
  acc[id] = getCharacterById(id, 'en')!;
  return acc;
}, {} as Record<string, TeamCharacter>);
