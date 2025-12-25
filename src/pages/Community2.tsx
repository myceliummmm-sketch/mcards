import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTrafficVariant } from "@/hooks/useTrafficVariant";
import { BrokenSystemHero } from "@/components/community2/BrokenSystemHero";
import { SystemQuiz } from "@/components/community2/SystemQuiz";
import { SovereignEntry } from "@/components/community2/SovereignEntry";
import { ArtifactReveal } from "@/components/community2/ArtifactReveal";
import { NetworkDashboard } from "@/components/community2/NetworkDashboard";
import { SystemWarningBanner } from "@/components/community2/SystemWarningBanner";
import { ProjectSeedQuiz } from "@/components/community/ProjectSeedQuiz";
import { ProblemCard } from "@/components/community/ProblemCard";
import { EmailCapture } from "@/components/community/EmailCapture";
import { ARCHETYPE_DATA, type ArchetypeKey } from "@/data/passportQuizData";

type PortalScreen = 
  | 'hero' 
  | 'quiz' 
  | 'identity' 
  | 'reveal' 
  | 'dashboard' 
  | 'email-capture'
  | 'project-seed' 
  | 'problem-card';

const BASE_MEMBER_COUNT = 2847;

// LocalStorage keys (separate from Community to avoid conflicts)
const STORAGE_KEYS = {
  screen: 'community2_screen',
  archetype: 'community2_archetype',
  founderName: 'community2_founder_name',
  passportNumber: 'community2_passport_number',
  passportId: 'community2_passport_id',
  skippedWallet: 'community2_skipped_wallet',
  projectSeedAnswers: 'community2_project_seed_answers',
  problemCardIds: 'community2_problem_card_ids',
  userEmail: 'community2_user_email',
};

// Screens that require a valid passportId
const SCREENS_REQUIRING_PASSPORT: PortalScreen[] = [
  'reveal', 'dashboard', 'email-capture', 'project-seed', 'problem-card'
];

// Calculate archetype from quiz answers
const calculateArchetype = (answers: ArchetypeKey[]): ArchetypeKey => {
  const counts: Record<ArchetypeKey, number> = {
    IGNITER: 0,
    SEEKER: 0,
    GUARDIAN: 0,
    CULTIVATOR: 0
  };
  
  answers.forEach(answer => {
    counts[answer]++;
  });
  
  let maxArchetype: ArchetypeKey = 'CULTIVATOR';
  let maxCount = 0;
  
  (Object.keys(counts) as ArchetypeKey[]).forEach(key => {
    if (counts[key] > maxCount) {
      maxCount = counts[key];
      maxArchetype = key;
    }
  });
  
  return maxArchetype;
};

interface ProblemCardData {
  id: string;
  answers: number[];
  ai_analysis: {
    problemStatement: string;
    keyInsight: string;
    riskFactor: string;
    firstStep: string;
  } | null;
  created_at: string;
}

const Community2 = () => {
  const { trackEvent } = useTrafficVariant();
  
  // Flow state
  const [currentScreen, setCurrentScreen] = useState<PortalScreen>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.screen);
    return (saved as PortalScreen) || 'hero';
  });
  
  // User data
  const [archetype, setArchetype] = useState<ArchetypeKey>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.archetype);
    return (saved as ArchetypeKey) || 'CULTIVATOR';
  });
  
  const [founderName, setFounderName] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.founderName) || '';
  });
  
  const [passportNumber, setPassportNumber] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.passportNumber) || '';
  });

  const [passportId, setPassportId] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.passportId) || '';
  });
  
  const [skippedWallet, setSkippedWallet] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.skippedWallet) === 'true';
  });
  
  const [projectSeedAnswers, setProjectSeedAnswers] = useState<number[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.projectSeedAnswers);
    return saved ? JSON.parse(saved) : [];
  });

  const [userEmail, setUserEmail] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.userEmail) || '';
  });

  const [problemCards, setProblemCards] = useState<ProblemCardData[]>([]);
  const [memberCount, setMemberCount] = useState<number | null>(null);

  // Data consistency check
  useEffect(() => {
    if (SCREENS_REQUIRING_PASSPORT.includes(currentScreen) && !passportId) {
      console.warn('Data inconsistency detected. Resetting to hero.');
      resetPortal();
    }
  }, []);

  // Reset portal
  const resetPortal = () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    
    setCurrentScreen('hero');
    setArchetype('CULTIVATOR');
    setFounderName('');
    setPassportNumber('');
    setPassportId('');
    setSkippedWallet(false);
    setProjectSeedAnswers([]);
    setUserEmail('');
    setProblemCards([]);
    
    toast.success('Portal reset successfully');
  };

  // Track page load
  useEffect(() => {
    trackEvent('community2_page_load');
  }, [trackEvent]);

  // Fetch member count
  useEffect(() => {
    const fetchMemberCount = async () => {
      const { data, error } = await supabase.rpc('get_leads_count');
      if (!error && data !== null) {
        setMemberCount(BASE_MEMBER_COUNT + data);
      }
    };
    fetchMemberCount();
  }, []);

  // Fetch problem cards
  useEffect(() => {
    const fetchProblemCards = async () => {
      if (!passportId) return;

      const { data, error } = await supabase
        .from('problem_cards')
        .select('*')
        .eq('passport_id', passportId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setProblemCards(data.map(card => ({
          id: card.id,
          answers: card.answers as number[],
          ai_analysis: card.ai_analysis as ProblemCardData['ai_analysis'],
          created_at: card.created_at,
        })));
      }
    };

    fetchProblemCards();
  }, [passportId]);

  // Persist state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.screen, currentScreen);
  }, [currentScreen]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.archetype, archetype);
  }, [archetype]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.founderName, founderName);
  }, [founderName]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.passportNumber, passportNumber);
  }, [passportNumber]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.passportId, passportId);
  }, [passportId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.skippedWallet, String(skippedWallet));
  }, [skippedWallet]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.projectSeedAnswers, JSON.stringify(projectSeedAnswers));
  }, [projectSeedAnswers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.userEmail, userEmail);
  }, [userEmail]);

  // Generate passport number
  const generatePassportNumber = () => {
    const prefix = 'SYS';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp.slice(-4)}-${random}`;
  };

  // Create passport
  const createPassport = async (name: string, passportNum: string, archetypeVal: ArchetypeKey) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-passport`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            founder_name: name,
            archetype: archetypeVal,
            passport_number: passportNum,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('Error creating passport:', data.error);
        return null;
      }

      if (data.id) {
        setPassportId(data.id);
        return data.id;
      }
      return null;
    } catch (err) {
      console.error('Exception creating passport:', err);
      return null;
    }
  };

  // Save problem card
  const saveProblemCard = async (answers: number[], analysis: ProblemCardData['ai_analysis']) => {
    if (!passportId) return null;

    const { data, error } = await supabase
      .from('problem_cards')
      .insert({
        passport_id: passportId,
        answers,
        ai_analysis: analysis,
      })
      .select('id')
      .single();

    if (!error && data) {
      const newCard: ProblemCardData = {
        id: data.id,
        answers,
        ai_analysis: analysis,
        created_at: new Date().toISOString(),
      };
      setProblemCards(prev => [newCard, ...prev]);
      return data.id;
    }
    return null;
  };

  // Screen handlers
  const handleActivateExit = () => {
    trackEvent('community2_exit_activated');
    setCurrentScreen('quiz');
  };

  const handleQuizComplete = (answers: ArchetypeKey[]) => {
    const selectedArchetype = calculateArchetype(answers);
    trackEvent(`community2_archetype_${selectedArchetype.toLowerCase()}`);
    setArchetype(selectedArchetype);
    setCurrentScreen('identity');
  };

  const handleIdentityLock = async (name: string) => {
    trackEvent('community2_identity_locked');
    setFounderName(name);
    const newPassportNumber = generatePassportNumber();
    setPassportNumber(newPassportNumber);
    
    const newPassportId = await createPassport(name, newPassportNumber, archetype);
    
    if (!newPassportId) {
      toast.error('Failed to create passport. Please try again.');
      return;
    }
    
    setCurrentScreen('reveal');
  };

  const handleRevealContinue = () => {
    setCurrentScreen('dashboard');
  };

  const handleWalletSync = async () => {
    trackEvent('community2_wallet_synced');
    setSkippedWallet(false);

    if (passportId) {
      await supabase
        .from('passports')
        .update({ wallet_synced: true })
        .eq('id', passportId);
    }
  };

  const handleStartProjectSeed = () => {
    trackEvent('community2_project_seed_started');
    // If no email yet, show email capture first
    if (!userEmail) {
      setCurrentScreen('email-capture');
    } else {
      setCurrentScreen('project-seed');
    }
  };

  const handleEmailComplete = (email: string) => {
    trackEvent('community2_email_captured');
    setUserEmail(email);
    setCurrentScreen('project-seed');
  };

  const handleEmailSkip = () => {
    trackEvent('community2_email_skipped');
    setCurrentScreen('project-seed');
  };

  const handleProjectSeedComplete = (answers: number[]) => {
    trackEvent('community2_problem_card_generated');
    setProjectSeedAnswers(answers);
    setCurrentScreen('problem-card');
  };

  const handleProblemCardComplete = (analysis: ProblemCardData['ai_analysis']) => {
    saveProblemCard(projectSeedAnswers, analysis);
  };

  const handleBackToDashboard = () => {
    setCurrentScreen('dashboard');
  };

  const handleStartNewProject = () => {
    setProjectSeedAnswers([]);
    // If email already captured, go directly to project-seed
    if (userEmail) {
      setCurrentScreen('project-seed');
    } else {
      setCurrentScreen('email-capture');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* System Warning Banner for skipped wallet */}
      {skippedWallet && currentScreen === 'dashboard' && (
        <SystemWarningBanner onSync={handleWalletSync} />
      )}

      <AnimatePresence mode="wait">
        {currentScreen === 'hero' && (
          <BrokenSystemHero
            key="hero"
            onActivateExit={handleActivateExit}
            memberCount={memberCount}
          />
        )}

        {currentScreen === 'quiz' && (
          <SystemQuiz
            key="quiz"
            onComplete={handleQuizComplete}
          />
        )}

        {currentScreen === 'identity' && (
          <SovereignEntry
            key="identity"
            onComplete={handleIdentityLock}
          />
        )}

        {currentScreen === 'reveal' && (
          <ArtifactReveal
            key="reveal"
            founderName={founderName}
            archetype={archetype}
            passportNumber={passportNumber}
            onContinue={handleRevealContinue}
            onSkipWallet={() => setSkippedWallet(true)}
          />
        )}

        {currentScreen === 'dashboard' && (
          <NetworkDashboard
            key="dashboard"
            founderName={founderName}
            archetype={archetype}
            passportNumber={passportNumber}
            problemCards={problemCards}
            onStartProjectSeed={handleStartProjectSeed}
            onReset={resetPortal}
          />
        )}

        {currentScreen === 'email-capture' && (
          <EmailCapture
            key="email-capture"
            passportId={passportId}
            onComplete={handleEmailComplete}
            onSkip={handleEmailSkip}
          />
        )}

        {currentScreen === 'project-seed' && (
          <ProjectSeedQuiz
            key="project-seed"
            onComplete={handleProjectSeedComplete}
          />
        )}

        {currentScreen === 'problem-card' && (
          <ProblemCard
            key="problem-card"
            answers={projectSeedAnswers}
            founderName={founderName}
            onViewDashboard={handleBackToDashboard}
            onStartAnother={handleStartNewProject}
            onCardComplete={handleProblemCardComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Community2;
