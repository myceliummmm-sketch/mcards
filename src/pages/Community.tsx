import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, Rocket, Unlock, Users, CheckCircle, Loader2, ArrowLeft, Link2 } from "lucide-react";
import { LanguageSwitcher } from "@/components/landing/LanguageSwitcher";
import LegalFooter from "@/components/landing/LegalFooter";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import myceliumNetworkGif from "@/assets/mycelium-network.gif";
const BASE_MEMBER_COUNT = 137;
const Community = () => {
  const {
    t
  } = useTranslation();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [memberCount, setMemberCount] = useState<number | null>(null);
  useEffect(() => {
    const fetchMemberCount = async () => {
      const {
        count,
        error
      } = await supabase.from('leads').select('*', {
        count: 'exact',
        head: true
      });
      if (!error && count !== null) {
        setMemberCount(BASE_MEMBER_COUNT + count);
      }
    };
    fetchMemberCount();
  }, []);
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
      const {
        error
      } = await supabase.from('leads').insert({
        email: email.trim().toLowerCase(),
        source: 'community_mycelium_network'
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
        setMemberCount(prev => prev !== null ? prev + 1 : null);
        toast.success(t('community.cta.success'));
      }
    } catch (error) {
      console.error('Error submitting lead:', error);
      toast.error(t('community.cta.error'));
    } finally {
      setIsLoading(false);
    }
  };
  const points = [{
    icon: DollarSign,
    text: t('community.about.point1')
  }, {
    icon: Rocket,
    text: t('community.about.point2')
  }, {
    icon: Unlock,
    text: t('community.about.point3')
  }, {
    icon: Users,
    text: t('community.about.point4')
  }];
  const tribePoints = [{
    icon: Users,
    text: t('community.tribe.circle')
  }, {
    icon: Link2,
    text: t('community.tribe.connections')
  }, {
    icon: Globe,
    text: t('community.tribe.global')
  }];
  return <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">{t('common.back')}</span>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Hero with GIF background */}
      <section className="relative pt-20 pb-8 px-4 min-h-[85vh] flex flex-col items-center justify-center">
        {/* GIF as background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/60 to-background z-10" />
          <img src={myceliumNetworkGif} alt="" className="w-full h-full object-cover opacity-30 scale-125" />
        </div>

        {/* Content */}
        <div className="relative z-20 container mx-auto max-w-2xl text-center">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6
        }}>
            {/* Headlines */}
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-4 leading-tight">
              <span className="text-foreground">{t('community.hero.title')}</span>
              <br />
              <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                {t('community.hero.titleHighlight')}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg mx-auto">
              {t('community.hero.subtitle')}
            </p>

            {/* CTA Form */}
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6,
            delay: 0.2
          }} className="bg-card/80 backdrop-blur-sm border border-primary/30 rounded-2xl p-6 md:p-8 max-w-md mx-auto">
              {isSuccess ? <motion.div initial={{
              opacity: 0,
              scale: 0.9
            }} animate={{
              opacity: 1,
              scale: 1
            }} className="text-center py-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
                    <CheckCircle className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-display font-bold mb-2">
                    {t('community.cta.successTitle')}
                  </h3>
                  <p className="text-muted-foreground">
                    {t('community.cta.successMessage')}
                  </p>
                </motion.div> : <>
                  <h2 className="text-xl md:text-2xl font-display font-bold mb-2">
                    {t('community.cta.title')}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('community.cta.subtitle')}
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-3">
                    <Input type="email" placeholder={t('community.cta.placeholder')} value={email} onChange={e => setEmail(e.target.value)} className="h-12 bg-background/80 border-border/50 text-center text-lg" disabled={isLoading} />
                    <Button type="submit" size="lg" className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90" disabled={isLoading}>
                      {isLoading ? <>
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          {t('common.loading')}
                        </> : t('community.cta.button')}
                    </Button>
                  </form>
                </>}
            </motion.div>

            {/* Tribe Badge */}
            <motion.div initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} transition={{
            duration: 0.6,
            delay: 0.4
          }} className="mt-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary">
                
                {memberCount !== null ? `🌐 ${memberCount} ${t('community.tribe.badgeSuffix')}` : t('community.tribe.badge')}
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Tribe Points */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tribePoints.map((point, index) => <motion.div key={index} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.4,
            delay: index * 0.1
          }} className="flex flex-col items-center text-center p-4 rounded-xl bg-card/30 border border-border/20">
                <div className="p-3 rounded-full bg-primary/10 mb-3">
                  <point.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-foreground/80 text-sm font-medium">{point.text}</p>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* Money-focused Points */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="space-y-4">
            {points.map((point, index) => <motion.div key={index} initial={{
            opacity: 0,
            x: -20
          }} whileInView={{
            opacity: 1,
            x: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.4,
            delay: index * 0.1
          }} className="flex items-center gap-4 p-5 rounded-xl bg-card/50 border border-border/30 hover:border-primary/30 transition-colors">
                <div className="p-3 rounded-xl bg-primary/10">
                  <point.icon className="h-6 w-6 text-primary" />
                </div>
                <p className="text-foreground font-medium text-lg">{point.text}</p>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* About Section - Quote */}
      <section className="py-12 px-4 pb-24">
        <div className="container mx-auto max-w-2xl">
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.6
        }} className="text-center">
            <blockquote className="text-xl md:text-2xl font-display text-foreground/80 italic mb-4">
              {t('community.about.quote')}
            </blockquote>
            <p className="text-muted-foreground max-w-lg mx-auto">
              {t('community.about.text')}
            </p>
          </motion.div>
        </div>
      </section>

      <LegalFooter />
    </div>;
};
export default Community;