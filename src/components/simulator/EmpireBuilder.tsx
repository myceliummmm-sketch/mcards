import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Code, Briefcase, Skull, Rocket, Sparkles, Loader2 } from "lucide-react";

type UserClass = "hacker" | "hustler";
type CapitalLevel = "bootstrapper" | "investor";
type Step = "hero" | "class" | "capital" | "hacking" | "video" | "reveal" | "form";

interface EmpireBuilderProps {
  trackEvent?: (eventType: string, metadata?: Record<string, unknown>) => void;
}

export const EmpireBuilder = ({ trackEvent }: EmpireBuilderProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [step, setStep] = useState<Step>("hero");
  const [userClass, setUserClass] = useState<UserClass | null>(null);
  const [capitalLevel, setCapitalLevel] = useState<CapitalLevel | null>(null);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hackingLineIndex, setHackingLineIndex] = useState(0);
  const [slotsLeft] = useState(() => Math.floor(Math.random() * 200) + 700); // 700-900

  const hackingLines = [
    "> Analyzing Niche Profitability...",
    "> Finding Blue Ocean...",
    "> Calculating MRR...",
    "> Projecting Revenue Curve...",
    "> Generating Empire Blueprint...",
    "> SUCCESS: Your $10k/mo path is ready!"
  ];

  const handleStartClick = () => {
    trackEvent?.("empire_start_clicked");
    setStep("class");
  };

  const handleClassSelect = (cls: UserClass) => {
    setUserClass(cls);
    trackEvent?.("empire_class_selected", { class: cls });
    setStep("capital");
  };

  const handleCapitalSelect = (cap: CapitalLevel) => {
    setCapitalLevel(cap);
    trackEvent?.("empire_capital_selected", { capital: cap });
    setStep("hacking");
    runHackingAnimation();
  };

  const runHackingAnimation = () => {
    let index = 0;
    const interval = setInterval(() => {
      index++;
      setHackingLineIndex(index);
      if (index >= hackingLines.length - 1) {
        clearInterval(interval);
        setTimeout(() => setStep("video"), 800);
      }
    }, 600);
  };

  const handleVideoEnd = () => {
    setStep("reveal");
    trackEvent?.("empire_chest_opened");
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }

    setIsLoading(true);
    trackEvent?.("empire_email_submitted", { email });

    try {
      const { error } = await supabase.from("leads").insert({
        email,
        source: "empire_builder",
        quiz_blocker: userClass,
        quiz_score: capitalLevel === "investor" ? 80 : 40,
      });

      if (error) {
        if (error.code === "23505") {
          toast.success("Welcome back! Your empire awaits.");
        } else {
          throw error;
        }
      } else {
        toast.success("Spores claimed! Check your inbox.");
      }

      trackEvent?.("empire_lead_captured", { class: userClass, capital: capitalLevel });
      
      setTimeout(() => {
        navigate("/auth");
      }, 1500);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Beach Background - always visible except during video */}
      {step !== "video" && (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: "url('/images/beach-background.png')" }}
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />

      {/* Video Fullscreen - only during video step */}
      <AnimatePresence>
        {step === "video" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black"
          >
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              onEnded={handleVideoEnd}
              className="w-full h-full object-cover"
              src="/videos/chest-opening.mp4"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <AnimatePresence mode="wait">
          {/* HERO STEP */}
          {step === "hero" && (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center max-w-md"
            >
              {/* Status Bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-8 px-4 py-2 rounded-full bg-[#00FF00]/10 border border-[#00FF00]/30 inline-block"
              >
                <span className="text-[#00FF00] font-mono text-sm">
                  💰 POTENTIAL REVENUE: LOADING...
                </span>
              </motion.div>

              <h1 className="text-4xl font-bold mb-2 font-mono tracking-tight">
                <span className="text-[#00FF00]">EMPIRE</span> BUILDER
              </h1>
              <h2 className="text-xl font-bold text-orange-400 mb-4">
                REAL CASH MODE
              </h2>
              <p className="text-lg text-white/80 mb-2">
                Stop playing games. Start printing money.
              </p>
              <p className="text-sm text-white/60 mb-8">
                Your $1M Strategy in 30 seconds.
              </p>

              <Button
                onClick={handleStartClick}
                className="w-full py-6 text-lg font-bold bg-[#00FF00] hover:bg-[#00CC00] text-black rounded-xl shadow-[0_0_30px_rgba(0,255,0,0.3)]"
              >
                ⚡ BUILD MY EMPIRE
              </Button>
            </motion.div>
          )}

          {/* CLASS SELECTION STEP */}
          {step === "class" && (
            <motion.div
              key="class"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md px-4"
            >
              <h2 className="text-2xl font-bold text-center mb-2 font-mono">
                CHOOSE YOUR <span className="text-[#00FF00]">WEAPON</span>
              </h2>
              <p className="text-center text-white/60 mb-6 text-sm">
                What's your superpower?
              </p>

              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleClassSelect("hacker")}
                  className="w-full p-6 rounded-xl bg-gradient-to-r from-purple-900/40 to-purple-800/20 border border-purple-500/30 text-left hover:border-purple-400/60 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg bg-purple-600/30 flex items-center justify-center">
                      <Code className="w-7 h-7 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-purple-300">👾 THE HACKER</h3>
                      <p className="text-white/60 text-sm">I build code. Need sales.</p>
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleClassSelect("hustler")}
                  className="w-full p-6 rounded-xl bg-gradient-to-r from-amber-900/40 to-amber-800/20 border border-amber-500/30 text-left hover:border-amber-400/60 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg bg-amber-600/30 flex items-center justify-center">
                      <Briefcase className="w-7 h-7 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-amber-300">💼 THE HUSTLER</h3>
                      <p className="text-white/60 text-sm">I sell ice to Eskimos. Need product.</p>
                    </div>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* CAPITAL SELECTION STEP */}
          {step === "capital" && (
            <motion.div
              key="capital"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md px-4"
            >
              <h2 className="text-2xl font-bold text-center mb-2 font-mono">
                CAPITAL <span className="text-[#00FF00]">LEVEL</span>
              </h2>
              <p className="text-center text-white/60 mb-6 text-sm">
                What's your starting budget?
              </p>

              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCapitalSelect("bootstrapper")}
                  className="w-full p-6 rounded-xl bg-gradient-to-r from-red-900/40 to-red-800/20 border border-red-500/30 text-left hover:border-red-400/60 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg bg-red-600/30 flex items-center justify-center">
                      <Skull className="w-7 h-7 text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-red-300">💀 BOOTSTRAPPER</h3>
                      <p className="text-white/60 text-sm">$0 Budget. Maximum Grind.</p>
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCapitalSelect("investor")}
                  className="w-full p-6 rounded-xl bg-gradient-to-r from-emerald-900/40 to-emerald-800/20 border border-emerald-500/30 text-left hover:border-emerald-400/60 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg bg-emerald-600/30 flex items-center justify-center">
                      <Rocket className="w-7 h-7 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-emerald-300">🚀 INVESTOR BACKED</h3>
                      <p className="text-white/60 text-sm">Have capital. Need speed.</p>
                    </div>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* HACKING TERMINAL STEP */}
          {step === "hacking" && (
            <motion.div
              key="hacking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-md px-4"
            >
              <div className="bg-black/80 border border-[#00FF00]/30 rounded-xl p-6 font-mono">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#00FF00]/20">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-xs text-white/40 ml-2">empire_generator.exe</span>
                </div>

                <div className="space-y-2 text-sm">
                  {hackingLines.slice(0, hackingLineIndex + 1).map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`${
                        i === hackingLineIndex 
                          ? "text-[#00FF00]" 
                          : "text-[#00FF00]/60"
                      }`}
                    >
                      {line}
                      {i === hackingLineIndex && (
                        <span className="animate-pulse">█</span>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* REVEAL STEP - Spores + Card */}
          {step === "reveal" && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md px-4 text-center"
            >
              {/* Spores Explosion */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="mb-6"
              >
                <div className="relative inline-block">
                  <Sparkles className="w-16 h-16 text-yellow-400 animate-pulse" />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="absolute -top-2 -right-2 px-2 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full"
                  >
                    +500
                  </motion.div>
                </div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-3xl font-bold text-yellow-400 mb-2"
              >
                ✨ +500 GENESIS SPORES FOUND!
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-white/70 mb-2"
              >
                Rare asset detected. Value unknown.
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-orange-400 text-sm mb-6"
              >
                Genesis Batch: {slotsLeft}/1000 Slots Left
              </motion.p>

              {/* Strategy Card Preview */}
              <motion.div
                initial={{ opacity: 0, rotateY: 90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="bg-gradient-to-br from-[#00FF00]/20 to-black border border-[#00FF00]/40 rounded-xl p-6 mb-6"
              >
                <h3 className="text-lg font-bold text-[#00FF00] mb-2">
                  📈 Your Path to $10k/mo
                </h3>
                <p className="text-white/60 text-sm">
                  {userClass === "hacker" 
                    ? "Technical product with sales-led growth strategy"
                    : "Sales-first approach with lean product development"
                  }
                </p>
                <div className="mt-4 flex justify-center gap-2">
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">
                    {userClass === "hacker" ? "🔧 Tech" : "💬 Sales"}
                  </span>
                  <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded">
                    {capitalLevel === "bootstrapper" ? "💪 Lean" : "🚀 Fast"}
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 }}
              >
                <Button
                  onClick={() => setStep("form")}
                  className="w-full py-6 text-lg font-bold bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl shadow-[0_0_30px_rgba(234,179,8,0.3)]"
                >
                  💎 CLAIM MY SPORES
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* EMAIL FORM STEP */}
          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md px-4"
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">
                  <span className="text-[#00FF00]">CLAIM</span> YOUR REWARDS
                </h2>
                <p className="text-white/60 text-sm">
                  Enter email to bind these assets to your wallet.
                </p>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-6 text-lg bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl"
                  disabled={isLoading}
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-6 text-lg font-bold bg-[#00FF00] hover:bg-[#00CC00] text-black rounded-xl shadow-[0_0_30px_rgba(0,255,0,0.3)]"
                >
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    "CLAIM SPORES & SAVE EMPIRE PLAN"
                  )}
                </Button>

                <p className="text-center text-red-400 text-sm animate-pulse">
                  ⚠️ If you leave, they burn.
                </p>

                <p className="text-center text-white/40 text-xs">
                  Genesis Batch: {slotsLeft}/1000 Slots Left
                </p>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
