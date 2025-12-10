import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

interface WelcomeBackOverlayProps {
  username: string;
  deckCount: number;
  lastDeckName?: string;
  lastActivity?: string;
  isVisible: boolean;
  onDismiss: () => void;
}

export const WelcomeBackOverlay = ({
  username,
  deckCount,
  lastDeckName,
  lastActivity,
  isVisible,
  onDismiss,
}: WelcomeBackOverlayProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm cursor-pointer"
          onClick={onDismiss}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25,
              delay: 0.1 
            }}
            className="relative text-center p-8 max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated sparkle icon */}
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 15,
                delay: 0.2 
              }}
              className="mb-6 inline-flex"
            >
              <div className="p-4 rounded-full bg-primary/20 border border-primary/30">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
            </motion.div>

            {/* Welcome text */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-foreground mb-2"
            >
              Welcome back, {username}!
            </motion.h1>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-2 mt-4"
            >
              <p className="text-muted-foreground">
                You have{" "}
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-primary font-semibold"
                >
                  {deckCount}
                </motion.span>{" "}
                active {deckCount === 1 ? "project" : "projects"}
              </p>
              
              {lastDeckName && lastActivity && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-sm text-muted-foreground/80"
                >
                  Last worked on: <span className="text-foreground">{lastDeckName}</span>
                  <br />
                  <span className="text-xs">{lastActivity}</span>
                </motion.p>
              )}
            </motion.div>

            {/* Dismiss hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.8 }}
              className="text-xs text-muted-foreground mt-6"
            >
              Click anywhere to continue
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
