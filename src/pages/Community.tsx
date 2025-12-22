import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";
import { Users, Brain, Building2, CheckCircle, Loader2, ArrowLeft } from "lucide-react";
import { LanguageSwitcher } from "@/components/landing/LanguageSwitcher";
import LegalFooter from "@/components/landing/LegalFooter";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import myceliumNetworkGif from "@/assets/mycelium-network.gif";

const Community = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      toast.error(t('community.cta.invalidEmail'));
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('leads')
        .insert({
          email: email.trim().toLowerCase(),
          source: 'community_insight_buro'
        });

      if (error) {
        if (error.code === '23505') {
          toast.success(t('community.cta.alreadySubscribed'));
          setIsSuccess(true);
        } else {
          throw error;
        }
      } else {
        setIsSuccess(true);
        toast.success(t('community.cta.success'));
      }
    } catch (error) {
      console.error('Error submitting lead:', error);
      toast.error(t('community.cta.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const points = [
    { icon: Users, text: t('community.about.point1') },
    { icon: Brain, text: t('community.about.point2') },
    { icon: Building2, text: t('community.about.point3') },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back</span>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center text-center"
          >
            {/* GIF with glow */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
              <motion.img
                src={myceliumNetworkGif}
                alt="Mycelium Network"
                className="relative w-64 h-64 md:w-80 md:h-80 object-contain rounded-2xl"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
            </div>

            {/* Headlines */}
            <h1 className="text-3xl md:text-5xl font-display font-bold mb-4">
              <span className="text-foreground">{t('community.hero.title')}</span>
              <br />
              <span className="text-primary">{t('community.hero.titleHighlight')}</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground italic max-w-xl">
              {t('community.hero.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-card/50 border border-border/50 rounded-2xl p-6 md:p-10"
          >
            {/* Quote */}
            <blockquote className="text-xl md:text-2xl font-display text-center mb-6 text-foreground/90">
              {t('community.about.quote')}
            </blockquote>

            {/* Description */}
            <p className="text-muted-foreground text-center mb-8 leading-relaxed">
              {t('community.about.text')}
            </p>

            {/* Points */}
            <div className="space-y-4">
              {points.map((point, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-xl bg-background/50 border border-border/30"
                >
                  <div className="p-2 rounded-lg bg-primary/10">
                    <point.icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-foreground/90 leading-relaxed">{point.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 px-4 pb-24">
        <div className="container mx-auto max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-b from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-6 md:p-10"
          >
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-display font-bold mb-2">
                  {t('community.cta.successTitle')}
                </h3>
                <p className="text-muted-foreground">
                  {t('community.cta.successMessage')}
                </p>
              </motion.div>
            ) : (
              <>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-center mb-3">
                  {t('community.cta.title')}
                </h2>
                <p className="text-muted-foreground text-center mb-6">
                  {t('community.cta.subtitle')}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    type="email"
                    placeholder={t('community.cta.placeholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 bg-background/80 border-border/50 text-center text-lg"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-12 text-lg font-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        {t('common.loading')}
                      </>
                    ) : (
                      t('community.cta.button')
                    )}
                  </Button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      </section>

      <LegalFooter />
    </div>
  );
};

export default Community;
