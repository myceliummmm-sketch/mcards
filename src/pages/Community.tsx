import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useTrafficVariant } from "@/hooks/useTrafficVariant";
import { PortalHero } from "@/components/community/PortalHero";
import { PassportQuiz } from "@/components/community/PassportQuiz";
import { IdentityLock } from "@/components/community/IdentityLock";
import { PassportReveal } from "@/components/community/PassportReveal";
import { WalletSync } from "@/components/community/WalletSync";
import { PortalDashboard } from "@/components/community/PortalDashboard";
import { ProjectSeedQuiz } from "@/components/community/ProjectSeedQuiz";
import { ProblemCard } from "@/components/community/ProblemCard";
import { PersistentWalletBanner } from "@/components/community/PersistentWalletBanner";
import { ARCHETYPE_DATA, type ArchetypeKey } from "@/data/passportQuizData";

type PortalScreen = 
  | 'hero' 
  | 'quiz' 
  | 'identity' 
  | 'reveal' 
  | 'wallet' 
  | 'dashboard' 
  | 'project-seed' 
  | 'problem-card';

const BASE_MEMBER_COUNT = 137;

// LocalStorage keys
const STORAGE_KEYS = {
  screen: 'portal_screen',
  archetype: 'portal_archetype',
  founderName: 'portal_founder_name',
  passportNumber: 'portal_passport_number',
  skippedWallet: 'portal_skipped_wallet',
  projectSeedAnswers: 'portal_project_seed_answers',
  bannerDismissed: 'portal_banner_dismissed',
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
    localStorage.setItem(STORAGE_KEYS.skippedWallet, String(skippedWallet));
  }, [skippedWallet]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.bannerDismissed, String(bannerDismissed));
  }, [bannerDismissed]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.projectSeedAnswers, JSON.stringify(projectSeedAnswers));
  }, [projectSeedAnswers]);

  // Generate passport number
  const generatePassportNumber = () => {
    const prefix = 'MYC';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp.slice(-4)}-${random}`;
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

  const handleIdentityLock = (name: string) => {
    trackEvent('identity_locked');
    setFounderName(name);
    const newPassportNumber = generatePassportNumber();
    setPassportNumber(newPassportNumber);
    setCurrentScreen('reveal');
  };

  const handleRevealContinue = () => {
    setCurrentScreen('wallet');
  };

  const handleWalletSync = () => {
    trackEvent('wallet_synced');
    setSkippedWallet(false);
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
