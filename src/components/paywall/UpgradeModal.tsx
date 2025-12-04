import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Zap, Users, Coins, Diamond, Crown, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { STRIPE_CONFIG } from '@/data/subscriptionConfig';
import { cn } from '@/lib/utils';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FREE_FEATURES = [
  'Vision & Research phases (11 cards)',
  '1 project',
  '3 AI Advisors (Ever, Prisma, Phoenix)',
  'Browse Marketplace',
];

const PRO_FEATURES = [
  'All 4 phases including Build & Grow',
  '5 projects simultaneously',
  'All 7 AI Advisors',
  '200 SPORE monthly ($20 value)',
  'Sell cards on Marketplace',
];

const ULTRA_FEATURES = [
  'Everything in Pro',
  'PIVOT phase (4 cards)',
  '10 projects simultaneously',
  '500 SPORE monthly ($50 value)',
  'Pivot strategy tools',
  'Priority AI responses',
];

export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
  const [loading, setLoading] = useState<'pro' | 'ultra' | null>(null);

  const handleUpgrade = async (tier: 'pro' | 'ultra') => {
    setLoading(tier);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please log in to upgrade your subscription.');
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { tier }
      });
      
      if (error) throw error;
      if (!data?.url) throw new Error('No checkout URL received');

      window.open(data.url, '_blank');
      onOpenChange(false);
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-primary" />
            Upgrade Your Plan
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Plan Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pro Plan */}
            <div className="rounded-xl border-2 border-primary bg-primary/5 p-5 relative">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="h-5 w-5 text-primary" />
                <span className="font-bold text-lg">Pro</span>
              </div>
              
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold">${STRIPE_CONFIG.pro.price_usd}</span>
                <span className="text-muted-foreground text-sm">/month</span>
              </div>

              <div className="space-y-2 mb-5">
                {PRO_FEATURES.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <Button 
                onClick={() => handleUpgrade('pro')} 
                disabled={loading !== null}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {loading === 'pro' ? 'Opening...' : 'Get Pro'}
              </Button>
            </div>

            {/* Ultra Plan */}
            <div className="rounded-xl border-2 border-violet-500 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
                BEST VALUE
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <Diamond className="h-5 w-5 text-violet-400" />
                <span className="font-bold text-lg bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  Ultra
                </span>
              </div>
              
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  ${STRIPE_CONFIG.ultra.price_usd}
                </span>
                <span className="text-muted-foreground text-sm">/month</span>
              </div>

              <div className="space-y-2 mb-5">
                {ULTRA_FEATURES.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-violet-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <Button 
                onClick={() => handleUpgrade('ultra')} 
                disabled={loading !== null}
                className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white border-0"
              >
                {loading === 'ultra' ? 'Opening...' : 'Get Ultra'}
              </Button>
            </div>
          </div>

          {/* Free Plan Reference */}
          <div className="rounded-lg border border-border p-4 opacity-60">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary">FREE</Badge>
              <span className="text-sm font-medium">Current Plan</span>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              {FREE_FEATURES.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="h-3 w-3 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2 rounded-lg bg-muted/50">
              <Zap className="h-4 w-4 mx-auto mb-1 text-primary" />
              <div className="text-xs">Full Phases</div>
            </div>
            <div className="p-2 rounded-lg bg-muted/50">
              <Users className="h-4 w-4 mx-auto mb-1 text-primary" />
              <div className="text-xs">7 AI Experts</div>
            </div>
            <div className="p-2 rounded-lg bg-muted/50">
              <Coins className="h-4 w-4 mx-auto mb-1 text-primary" />
              <div className="text-xs">Monthly SPORE</div>
            </div>
            <div className="p-2 rounded-lg bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20">
              <RotateCcw className="h-4 w-4 mx-auto mb-1 text-violet-400" />
              <div className="text-xs text-violet-400">Pivot Tools</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}