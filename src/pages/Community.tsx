import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTrafficVariant } from "@/hooks/useTrafficVariant";
import { PortalHero } from "@/components/community/PortalHero";
import { PassportQuiz } from "@/components/community/PassportQuiz";
import { IdentityLock } from "@/components/community/IdentityLock";
import { PassportReveal } from "@/components/community/PassportReveal";
import { EmailCapture } from "@/components/community/EmailCapture";
import { WalletSync } from "@/components/community/WalletSync";
import { PortalDashboard } from "@/components/community/PortalDashboard";
import { ProjectSeedQuiz } from "@/components/community/ProjectSeedQuiz";
import { ProblemCard } from "@/components/community/ProblemCard";
import { RegistrationPrompt } from "@/components/community/RegistrationPrompt";
import { PersistentWalletBanner } from "@/components/community/PersistentWalletBanner";
import { ARCHETYPE_DATA, type ArchetypeKey } from "@/data/passportQuizData";

type PortalScreen = 
  | 'hero' 
  | 'quiz' 
  | 'identity' 
  | 'reveal' 
  | 'email-capture'
  | 'wallet' 
  | 'dashboard' 
  | 'project-seed' 
  | 'problem-card'
  | 'registration-prompt';

const BASE_MEMBER_COUNT = 137;

// LocalStorage keys
const STORAGE_KEYS = {
  screen: 'portal_screen',
  archetype: 'portal_archetype',
  founderName: 'portal_founder_name',
  passportNumber: 'portal_passport_number',
  passportId: 'portal_passport_id',
  userEmail: 'portal_user_email',
  skippedWallet: 'portal_skipped_wallet',
  projectSeedAnswers: 'portal_project_seed_answers',
  bannerDismissed: 'portal_banner_dismissed',
  problemCardIds: 'portal_problem_card_ids',
  hasShownRegistration: 'portal_has_shown_registration',
};

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

const Community = () => {
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

  const [userEmail, setUserEmail] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.userEmail) || '';
  });
  
  const [skippedWallet, setSkippedWallet] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.skippedWallet) === 'true';
  });
  
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.bannerDismissed) === 'true';
  });
  
  const [projectSeedAnswers, setProjectSeedAnswers] = useState<number[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.projectSeedAnswers);
    return saved ? JSON.parse(saved) : [];
  });

  const [problemCards, setProblemCards] = useState<ProblemCardData[]>([]);
  const [hasShownRegistration, setHasShownRegistration] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.hasShownRegistration) === 'true';
  });
  
  const [memberCount, setMemberCount] = useState<number | null>(null);

  // Track page load
  useEffect(() => {
    trackEvent('community_page_load');
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

  // Fetch saved problem cards when we have a passport ID
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
    localStorage.setItem(STORAGE_KEYS.userEmail, userEmail);
  }, [userEmail]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.skippedWallet, String(skippedWallet));
  }, [skippedWallet]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.bannerDismissed, String(bannerDismissed));
  }, [bannerDismissed]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.projectSeedAnswers, JSON.stringify(projectSeedAnswers));
  }, [projectSeedAnswers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.hasShownRegistration, String(hasShownRegistration));
  }, [hasShownRegistration]);

  // Generate passport number
  const generatePassportNumber = () => {
    const prefix = 'MYC';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp.slice(-4)}-${random}`;
  };

  // Create passport in database
  const createPassport = async (name: string, passportNum: string, archetypeVal: ArchetypeKey) => {
    try {
      const { data, error } = await supabase
        .from('passports')
        .insert({
          founder_name: name,
          archetype: archetypeVal,
          passport_number: passportNum,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating passport:', error);
        return null;
      }

      if (data) {
        setPassportId(data.id);
        return data.id;
      }
      return null;
    } catch (err) {
      console.error('Exception creating passport:', err);
      return null;
    }
  };

  // Save problem card to database
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
      // Refresh problem cards list
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
  const handleInitialize = () => {
    trackEvent('passport_initialized');
    setCurrentScreen('quiz');
  };

  const handleQuizComplete = (answers: ArchetypeKey[]) => {
    const selectedArchetype = calculateArchetype(answers);
    trackEvent(`passport_archetype_${selectedArchetype.toLowerCase()}`);
    setArchetype(selectedArchetype);
    setCurrentScreen('identity');
  };

  const handleIdentityLock = async (name: string) => {
    trackEvent('identity_locked');
    setFounderName(name);
    const newPassportNumber = generatePassportNumber();
    setPassportNumber(newPassportNumber);
    
    // Create passport in database
    const newPassportId = await createPassport(name, newPassportNumber, archetype);
    
    if (!newPassportId) {
      toast.error('Failed to create passport. Please try again.');
      return;
    }
    
    setCurrentScreen('reveal');
  };

  const handleRevealContinue = () => {
    // Go to email capture instead of wallet directly
    setCurrentScreen('email-capture');
  };

  const handleEmailComplete = (email: string) => {
    trackEvent('email_captured');
    setUserEmail(email);
    setCurrentScreen('wallet');
  };

  const handleEmailSkip = () => {
    trackEvent('email_skipped');
    setCurrentScreen('wallet');
  };

  const handleWalletSync = async () => {
    trackEvent('wallet_synced');
    setSkippedWallet(false);

    // Update passport with wallet sync status
    if (passportId) {
      await supabase
        .from('passports')
        .update({ wallet_synced: true })
        .eq('id', passportId);
    }

    setCurrentScreen('dashboard');
  };

  const handleWalletSkip = () => {
    trackEvent('wallet_skipped');
    setSkippedWallet(true);
    setCurrentScreen('dashboard');
  };

  const handleStartProjectSeed = () => {
    trackEvent('project_seed_started');
    setCurrentScreen('project-seed');
  };

  const handleProjectSeedComplete = (answers: number[]) => {
    trackEvent('problem_card_generated');
    setProjectSeedAnswers(answers);
    setCurrentScreen('problem-card');
  };

  const handleProblemCardComplete = async (analysis: ProblemCardData['ai_analysis']) => {
    // Save the problem card
    await saveProblemCard(projectSeedAnswers, analysis);

    // Show registration prompt only on first problem card creation
    if (!hasShownRegistration && problemCards.length === 0) {
      setHasShownRegistration(true);
      setCurrentScreen('registration-prompt');
    } else {
      setCurrentScreen('dashboard');
    }
  };

  const handleBackToDashboard = () => {
    setCurrentScreen('dashboard');
  };

  const handleStartNewProject = () => {
    setProjectSeedAnswers([]);
    setCurrentScreen('project-seed');
  };

  const handleSyncWallet = () => {
    setCurrentScreen('wallet');
  };

  const handleDismissBanner = () => {
    setBannerDismissed(true);
  };

  const handleContinueAsGuest = () => {
    setCurrentScreen('dashboard');
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <AnimatePresence mode="wait">
        {currentScreen === 'hero' && (
          <PortalHero
            key="hero"
            onInitialize={handleInitialize}
            memberCount={memberCount}
          />
        )}

        {currentScreen === 'quiz' && (
          <PassportQuiz
            key="quiz"
            onComplete={handleQuizComplete}
            onTrackEvent={trackEvent}
          />
        )}

        {currentScreen === 'identity' && (
          <IdentityLock
            key="identity"
            onComplete={handleIdentityLock}
          />
        )}

        {currentScreen === 'reveal' && (
          <PassportReveal
            key="reveal"
            founderName={founderName}
            archetype={archetype}
            onContinue={handleRevealContinue}
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

        {currentScreen === 'wallet' && (
          <WalletSync
            key="wallet"
            onSync={handleWalletSync}
            onSkip={handleWalletSkip}
          />
        )}

        {currentScreen === 'dashboard' && (
          <PortalDashboard
            key="dashboard"
            founderName={founderName}
            archetype={archetype}
            passportNumber={passportNumber}
            problemCards={problemCards}
            onStartProjectSeed={handleStartProjectSeed}
          />
        )}

        {currentScreen === 'project-seed' && (
          <ProjectSeedQuiz
            key="project-seed"
            onComplete={handleProjectSeedComplete}
            onTrackEvent={trackEvent}
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

        {currentScreen === 'registration-prompt' && (
          <RegistrationPrompt
            key="registration-prompt"
            founderName={founderName}
            problemCardCount={problemCards.length + 1}
            onContinueAsGuest={handleContinueAsGuest}
          />
        )}
      </AnimatePresence>

      {/* Persistent wallet banner */}
      {skippedWallet && !bannerDismissed && (currentScreen === 'dashboard' || currentScreen === 'problem-card') && (
        <PersistentWalletBanner onSync={handleSyncWallet} onDismiss={handleDismissBanner} />
      )}
    </div>
  );
};

export default Community;
