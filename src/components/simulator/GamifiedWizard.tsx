import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code, Briefcase, Skull, Flame, Mail, X, Gamepad2, Landmark, Heart, Bot, Check, Rocket, Palette, Megaphone, Zap, Sparkles, Bitcoin, ShoppingCart, GraduationCap, Cloud } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useStartupSimulator } from "@/hooks/useStartupSimulator";
import { useTranslation } from "@/hooks/useTranslation";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { InterestArena, UserClass } from "@/services/simulatorService";

// Typewriter effect hook
const useTypewriter = (text: string, speed: number = 50, startTyping: boolean = true) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!startTyping) return;
    setDisplayedText("");
    setIsComplete(false);
    
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1));
        i++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, startTyping]);

  return { displayedText, isComplete };
};

// Neon button component
const NeonButton = ({ children, onClick, disabled, className = "" }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; className?: string }) => (
  <motion.button
    onClick={onClick}
    disabled={disabled}
    className={`
      relative px-8 py-4 font-pixel text-sm uppercase tracking-wider
      bg-black/60 border-2 border-[#39FF14] text-[#39FF14]
      shadow-[0_0_20px_rgba(57,255,20,0.3),inset_0_0_20px_rgba(57,255,20,0.1)]
      hover:shadow-[0_0_40px_rgba(57,255,20,0.6),inset_0_0_30px_rgba(57,255,20,0.2)]
      hover:bg-[#39FF14]/10 transition-all duration-300
      disabled:opacity-50 disabled:cursor-not-allowed
      ${className}
    `}
    whileHover={disabled ? {} : { scale: 1.05 }}
    whileTap={disabled ? {} : { scale: 0.95 }}
  >
    {children}
  </motion.button>
);

// Glass panel component
const GlassPanel = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`
    bg-black/40 backdrop-blur-xl border border-[#39FF14]/30
    rounded-xl shadow-[0_0_30px_rgba(57,255,20,0.1)]
    ${className}
  `}>
    {children}
  </div>
);

// Selection card component
const SelectionCard = ({ 
  icon: Icon, 
  title, 
  subtitle, 
  onClick 
}: { 
  icon: React.ElementType; 
  title: string; 
  subtitle: string; 
  onClick: () => void;
}) => (
  <motion.div
    onClick={onClick}
    className="
      cursor-pointer p-3 bg-black/50 backdrop-blur-xl
      border-2 border-[#39FF14]/40 rounded-xl
      hover:border-[#39FF14] hover:shadow-[0_0_40px_rgba(57,255,20,0.4)]
      transition-all duration-300
    "
    whileHover={{ scale: 1.05, y: -5 }}
    whileTap={{ scale: 0.98 }}
  >
    <Icon className="w-10 h-10 mx-auto mb-2 text-[#39FF14]" />
    <h3 className="font-pixel text-xs text-[#39FF14] mb-1 text-center">{title}</h3>
    <p className="text-white/60 text-[10px] text-center line-clamp-2">{subtitle}</p>
  </motion.div>
);

// Mini selection card for interests (4 in a grid)
const InterestCard = ({ 
  icon: Icon, 
  label, 
  onClick 
}: { 
  icon: React.ElementType; 
  label: string; 
  onClick: () => void;
}) => (
  <motion.div
    onClick={onClick}
    className="
      cursor-pointer p-2 bg-black/50 backdrop-blur-xl
      border-2 border-[#39FF14]/40 rounded-lg
      hover:border-[#39FF14] hover:shadow-[0_0_30px_rgba(57,255,20,0.4)]
      transition-all duration-300 flex flex-col items-center gap-1
    "
    whileHover={{ scale: 1.08 }}
    whileTap={{ scale: 0.95 }}
  >
    <Icon className="w-6 h-6 text-[#39FF14]" />
    <span className="font-pixel text-[8px] text-[#39FF14] text-center leading-tight">{label}</span>
  </motion.div>
);

// 3D Flip card for result with AI-generated image
const FlipCard = ({ 
  title, 
  imageUrl,
  isFlipped 
}: { 
  title: string; 
  imageUrl?: string;
  isFlipped: boolean; 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="perspective-1000 w-56 h-72 mx-auto">
      <motion.div
        className="relative w-full h-full"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front - Loading */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-[#39FF14]/20 to-black/80 
          border-2 border-[#39FF14] rounded-xl flex items-center justify-center"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="text-center p-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#39FF14]/20 
              border-2 border-[#39FF14] flex items-center justify-center">
              <span className="font-pixel text-3xl text-[#39FF14]">?</span>
            </div>
            <p className="font-pixel text-[#39FF14] text-sm">GENERATING...</p>
          </div>
        </div>
        
        {/* Back - Result with AI Image */}
        <div 
          className="absolute inset-0 rounded-xl overflow-hidden
          border-2 border-[#39FF14] 
          shadow-[0_0_60px_rgba(57,255,20,0.5)]"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          {/* AI Generated Image or Loading State */}
          {imageUrl ? (
            <>
              <img 
                src={imageUrl} 
                alt={title}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
              />
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-[#39FF14]/20 to-black/80 animate-pulse" />
              )}
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#39FF14]/20 to-black/80 animate-pulse" />
          )}
          
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          
          {/* Title overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
            <h2 className="font-pixel text-lg text-[#39FF14] mb-2 leading-relaxed 
              drop-shadow-[0_0_10px_rgba(0,0,0,0.9)]">
              {title}
            </h2>
            <p className="text-white/60 text-xs uppercase tracking-wider">Your Vision Card</p>
          </div>
          
          {/* Glow effect on top-left */}
          <div className="absolute top-4 left-4">
            <Flame className="w-6 h-6 text-[#39FF14] drop-shadow-[0_0_10px_rgba(57,255,20,0.8)]" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Email capture modal with working logic
const EmailModal = ({ 
  isOpen, 
  onClose,
  simulatorContext,
  cardTitle,
  t,
  language
}: { 
  isOpen: boolean; 
  onClose: () => void;
  simulatorContext?: { userClass?: string; interest?: string; difficulty?: string };
  cardTitle?: string;
  t: (key: string) => string;
  language: string;
}) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Please enter a valid email");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Save lead to database
      await supabase.from("leads").insert({
        email: normalizedEmail,
        source: "simulator_game",
        quiz_blocker: simulatorContext?.userClass || 'coder',
        quiz_score: simulatorContext?.difficulty === 'god' ? 85 : 65
      });

      // Send personalized simulator email
      await supabase.functions.invoke('send-simulator-email', {
        body: {
          email: normalizedEmail,
          userClass: simulatorContext?.userClass || 'coder',
          interest: simulatorContext?.interest || 'ai',
          difficulty: simulatorContext?.difficulty || 'hard',
          cardTitle: cardTitle || 'Your Startup Vision',
          language: language
        }
      });

      setIsSuccess(true);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartBuilding = () => {
    // Save context for after auth
    if (simulatorContext) {
      localStorage.setItem('simulator_context', JSON.stringify({
        ...simulatorContext,
        timestamp: Date.now()
      }));
    }
    navigate('/auth');
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <GlassPanel className="relative z-10 p-8 max-w-md w-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
        
        {!isSuccess ? (
          <>
            <Mail className="w-12 h-12 mx-auto mb-4 text-[#39FF14]" />
            <h3 className="font-pixel text-xl text-[#39FF14] text-center mb-2">
              {t('simulator.unlockFullDeck')}
            </h3>
            <p className="text-white/60 text-center mb-6 text-sm">
              {t('simulator.getCards')}
            </p>
            
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-black/50 border-[#39FF14]/50 text-white mb-2
                focus:border-[#39FF14] focus:ring-[#39FF14]/20"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            
            {error && <p className="text-red-400 text-xs mb-4">{error}</p>}
            
            <NeonButton onClick={handleSubmit} disabled={isLoading} className="w-full">
              {isLoading ? t('simulator.sending') : t('simulator.sendMyDeck')}
            </NeonButton>
          </>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#39FF14]/20 border-2 border-[#39FF14] flex items-center justify-center">
              <Check className="w-8 h-8 text-[#39FF14]" />
            </div>
            <h3 className="font-pixel text-xl text-[#39FF14] text-center mb-2">
              {t('simulator.deckSent')}
            </h3>
            <p className="text-white/60 text-center mb-6 text-sm">
              {t('simulator.checkInbox')}
            </p>
            
            <div className="border-t border-[#39FF14]/30 pt-6 mt-4">
              <div className="flex items-center gap-2 mb-4">
                <Rocket className="w-5 h-5 text-[#39FF14]" />
                <span className="font-pixel text-sm text-[#39FF14]">{t('simulator.buildItNow')}</span>
              </div>
              <p className="text-white/60 text-xs mb-4">
                {t('simulator.createAccount')}
              </p>
              
              <NeonButton onClick={handleStartBuilding} className="w-full mb-3">
                {t('simulator.startBuildingFree')}
              </NeonButton>
              
              <button 
                onClick={onClose}
                className="w-full text-white/40 hover:text-white/60 text-xs py-2 transition-colors"
              >
                {t('simulator.maybeLater')}
              </button>
            </div>
          </>
        )}
      </GlassPanel>
    </motion.div>
  );
};

interface GamifiedWizardProps {
  trackEvent?: (eventType: string, metadata?: Record<string, unknown>) => void;
}

export const GamifiedWizard = ({ trackEvent }: GamifiedWizardProps) => {
  const { t, language } = useTranslation();
  const { state, actions } = useStartupSimulator(language);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [cardFlipped, setCardFlipped] = useState(false);

  // Hacking terminal text - extended to match image generation time
  const hackingLines = [
    "> Initializing neural network...",
    "> Scanning market trends...",
    "> Analyzing competitor data...",
    "> Generating unique value proposition...",
    "> Hacking visual cortex...",
    "> Rendering low-poly universe...",
    "> Compiling startup DNA...",
    "> SUCCESS: Vision generated!"
  ];
  
  const hackingText = hackingLines.join("\n");
  const { displayedText, isComplete } = useTypewriter(
    hackingText, 
    35, // Fast terminal (~8 lines × ~30 chars × 35ms ≈ 8s)
    state.step === "hacking"
  );

  // Auto-flip card when result is ready
  useEffect(() => {
    if (state.step === "result" && state.result) {
      trackEvent?.('result_view', { 
        title: state.result.title,
        class: state.selections.userClass,
        interest: state.selections.interest
      });
      const timer = setTimeout(() => setCardFlipped(true), 800);
      return () => clearTimeout(timer);
    }
  }, [state.step, state.result, state.selections, trackEvent]);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div className="fixed inset-0 overflow-y-auto">
      {/* Background image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/beach-background.png')" }}
      />
      
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black/50" />
      
      {/* Scanlines effect */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)"
        }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-full flex flex-col items-center justify-center p-4 sm:p-6 py-8">
        <AnimatePresence mode="wait">
          {/* HERO SCREEN */}
          {state.step === "hero" && (
            <motion.div
              key="hero"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="text-center"
            >
              <GlassPanel className="p-8 mb-8">
                <h1 className="font-pixel text-2xl md:text-3xl text-[#39FF14] mb-4 leading-relaxed">
                  STARTUP<br />SIMULATOR
                </h1>
                <p className="text-white/60 text-sm mb-2">v2.0</p>
                <div className="w-16 h-1 mx-auto bg-[#39FF14] rounded-full" />
              </GlassPanel>
              
              <NeonButton onClick={() => actions.nextStep("class")}>
                {t('simulator.pressStart')}
              </NeonButton>
            </motion.div>
          )}

          {/* CLASS SELECTION */}
          {state.step === "class" && (
            <motion.div
              key="class"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full max-w-md"
            >
              <h2 className="font-pixel text-sm text-[#39FF14] text-center mb-4">
                {t('simulator.chooseClass')}
              </h2>
              
              <div className="grid grid-cols-2 gap-3">
                <SelectionCard icon={Code} title={t('simulator.coder')} subtitle={t('simulator.coderSub')} onClick={() => { trackEvent?.('class_select', { class: 'coder' }); actions.selectClass("coder"); }} />
                <SelectionCard icon={Briefcase} title={t('simulator.founder')} subtitle={t('simulator.founderSub')} onClick={() => { trackEvent?.('class_select', { class: 'founder' }); actions.selectClass("founder"); }} />
                <SelectionCard icon={Palette} title={t('simulator.designer')} subtitle={t('simulator.designerSub')} onClick={() => { trackEvent?.('class_select', { class: 'designer' }); actions.selectClass("designer"); }} />
                <SelectionCard icon={Megaphone} title={t('simulator.marketer')} subtitle={t('simulator.marketerSub')} onClick={() => { trackEvent?.('class_select', { class: 'marketer' }); actions.selectClass("marketer"); }} />
                <SelectionCard icon={Zap} title={t('simulator.hustler')} subtitle={t('simulator.hustlerSub')} onClick={() => { trackEvent?.('class_select', { class: 'hustler' }); actions.selectClass("hustler"); }} />
                <SelectionCard icon={Sparkles} title={t('simulator.dreamer')} subtitle={t('simulator.dreamerSub')} onClick={() => { trackEvent?.('class_select', { class: 'dreamer' }); actions.selectClass("dreamer"); }} />
              </div>
            </motion.div>
          )}

          {/* INTEREST SELECTION - NEW STEP */}
          {state.step === "interest" && (
            <motion.div
              key="interest"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full max-w-md"
            >
              <h2 className="font-pixel text-sm text-[#39FF14] text-center mb-4">
                {t('simulator.yourArena')}
              </h2>
              
              <div className="grid grid-cols-2 gap-2">
                <InterestCard icon={Gamepad2} label={t('simulator.gaming')} onClick={() => { trackEvent?.('interest_select', { interest: 'gaming' }); actions.selectInterest("gaming"); }} />
                <InterestCard icon={Landmark} label={t('simulator.fintech')} onClick={() => { trackEvent?.('interest_select', { interest: 'fintech' }); actions.selectInterest("fintech"); }} />
                <InterestCard icon={Heart} label={t('simulator.health')} onClick={() => { trackEvent?.('interest_select', { interest: 'health' }); actions.selectInterest("health"); }} />
                <InterestCard icon={Bot} label={t('simulator.ai')} onClick={() => { trackEvent?.('interest_select', { interest: 'ai' }); actions.selectInterest("ai"); }} />
                <InterestCard icon={Bitcoin} label={t('simulator.crypto')} onClick={() => { trackEvent?.('interest_select', { interest: 'crypto' }); actions.selectInterest("crypto"); }} />
                <InterestCard icon={ShoppingCart} label={t('simulator.ecommerce')} onClick={() => { trackEvent?.('interest_select', { interest: 'ecommerce' }); actions.selectInterest("ecommerce"); }} />
                <InterestCard icon={GraduationCap} label={t('simulator.education')} onClick={() => { trackEvent?.('interest_select', { interest: 'education' }); actions.selectInterest("education"); }} />
                <InterestCard icon={Cloud} label={t('simulator.saas')} onClick={() => { trackEvent?.('interest_select', { interest: 'saas' }); actions.selectInterest("saas"); }} />
              </div>
            </motion.div>
          )}

          {/* DIFFICULTY SELECTION */}
          {state.step === "difficulty" && (
            <motion.div
              key="difficulty"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full max-w-md"
            >
              <h2 className="font-pixel text-sm text-[#39FF14] text-center mb-4">
                {t('simulator.selectDifficulty')}
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <SelectionCard icon={Skull} title={t('simulator.hard')} subtitle={t('simulator.hardSub')} onClick={() => { trackEvent?.('difficulty_select', { difficulty: 'hard' }); actions.selectDifficulty("hard"); }} />
                <SelectionCard icon={Flame} title={t('simulator.godMode')} subtitle={t('simulator.godModeSub')} onClick={() => { trackEvent?.('difficulty_select', { difficulty: 'god' }); actions.selectDifficulty("god"); }} />
              </div>
            </motion.div>
          )}

          {/* HACKING TERMINAL */}
          {state.step === "hacking" && (
            <motion.div
              key="hacking"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full max-w-md"
            >
              <GlassPanel className="p-6 font-mono">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#39FF14]/30">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-2 text-[#39FF14]/60 text-xs">terminal</span>
                </div>
                
                <pre className="text-[#39FF14] text-sm whitespace-pre-wrap min-h-[200px]">
                  {displayedText}
                  {!isComplete && <span className="animate-pulse">▊</span>}
                </pre>
              </GlassPanel>
            </motion.div>
          )}

          {/* RESULT SCREEN */}
          {state.step === "result" && state.result && (
            <motion.div
              key="result"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full max-w-md text-center pb-8"
            >
              <h2 className="font-pixel text-base sm:text-lg text-[#39FF14] mb-4 sm:mb-6">
                {t('simulator.yourStartup')}
              </h2>
              
              <FlipCard 
                title={state.result.title} 
                imageUrl={state.result.imageUrl}
                isFlipped={cardFlipped} 
              />
              
              {/* Card content details */}
              {cardFlipped && state.result.cardContent && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-4 sm:mt-6"
                >
                  <GlassPanel className="p-3 sm:p-4 text-left text-xs sm:text-sm">
                    <p className="text-[#39FF14]/90 mb-2">
                      <span className="text-white/40 text-xs uppercase">Vision: </span>
                      {state.result.cardContent.vision_statement}
                    </p>
                    <p className="text-[#39FF14]/90 mb-2">
                      <span className="text-white/40 text-xs uppercase">Unlocks: </span>
                      {state.result.cardContent.what_becomes_possible}
                    </p>
                    <p className="text-[#39FF14]/90">
                      <span className="text-white/40 text-xs uppercase">For: </span>
                      {state.result.cardContent.who_benefits}
                    </p>
                  </GlassPanel>
                </motion.div>
              )}
              
              {/* CTA Button - always visible */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: cardFlipped ? 1 : 0 }}
                transition={{ delay: 0.8 }}
                className="mt-4 sm:mt-6 pb-4"
              >
                <NeonButton onClick={() => setShowEmailModal(true)} className="text-xs sm:text-sm px-4 sm:px-8 py-3 sm:py-4">
                  {t('simulator.unlockFullDeck')}
                </NeonButton>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Email Modal */}
      <AnimatePresence>
        {showEmailModal && (
          <EmailModal 
            isOpen={showEmailModal} 
            onClose={() => setShowEmailModal(false)}
            simulatorContext={{
              userClass: state.selections.userClass,
              interest: state.selections.interest,
              difficulty: state.selections.difficulty
            }}
            cardTitle={state.result?.title}
            t={t}
            language={language}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
