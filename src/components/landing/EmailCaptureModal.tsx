import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizScore?: number;
  quizBlocker?: string;
  onSuccess?: () => void;
}

export const EmailCaptureModal = ({ 
  isOpen, 
  onClose, 
  quizScore, 
  quizBlocker,
  onSuccess 
}: EmailCaptureModalProps) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError(t("landing.mobile.email.invalidEmail"));
      return;
    }

    setIsLoading(true);

    try {
      const { error: insertError } = await supabase
        .from("leads")
        .insert({
          email: email.toLowerCase().trim(),
          source: "quiz_playbook",
          quiz_score: quizScore,
          quiz_blocker: quizBlocker,
        });

      if (insertError) {
        // Handle duplicate email gracefully
        if (insertError.code === "23505") {
          setIsSuccess(true);
          toast.success(t("landing.mobile.email.alreadySubscribed"));
        } else {
          throw insertError;
        }
      } else {
        setIsSuccess(true);
        toast.success(t("landing.mobile.email.success"));
      }

      onSuccess?.();
    } catch (err) {
      console.error("Error saving lead:", err);
      setError(t("landing.mobile.email.error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setError("");
    setIsSuccess(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <AnimatePresence mode="wait">
              {!isSuccess ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Header */}
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                      <Mail className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-display text-foreground mb-2">
                      {t("landing.mobile.email.title")}
                    </h3>
                    <p className="text-sm text-muted-foreground font-body">
                      {t("landing.mobile.email.subtitle")}
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Input
                        type="email"
                        placeholder={t("landing.mobile.email.placeholder")}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-12 text-base"
                        disabled={isLoading}
                      />
                      {error && (
                        <p className="text-sm text-destructive mt-2">{error}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 text-base font-display bg-gradient-to-r from-primary to-secondary"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        t("landing.mobile.email.cta")
                      )}
                    </Button>
                  </form>

                  <p className="text-xs text-muted-foreground text-center mt-4 font-body">
                    {t("landing.mobile.email.privacy")}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-4"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-status-complete/20 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-status-complete" />
                  </div>
                  <h3 className="text-xl font-display text-foreground mb-2">
                    {t("landing.mobile.email.successTitle")}
                  </h3>
                  <p className="text-sm text-muted-foreground font-body mb-6">
                    {t("landing.mobile.email.successMessage")}
                  </p>
                  <Button
                    onClick={handleClose}
                    variant="outline"
                    className="font-display"
                  >
                    {t("landing.mobile.email.close")}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
