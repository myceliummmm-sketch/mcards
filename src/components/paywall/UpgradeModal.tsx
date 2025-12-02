import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Zap, Users, ShoppingBag, Coins } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { STRIPE_CONFIG } from '@/data/subscriptionConfig';

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
  'Priority AI responses',
];

export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      // Verify user is authenticated first
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please log in to upgrade your subscription.');
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout');
      
      if (error) throw error;
      if (!data?.url) throw new Error('No checkout URL received');

      window.open(data.url, '_blank');
      onOpenChange(false);
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-primary" />
            Upgrade to Pro
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Pro Plan Highlight */}
          <div className="rounded-xl border-2 border-primary bg-primary/5 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-sm font-medium rounded-bl-lg">
              RECOMMENDED
            </div>
            
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold">${STRIPE_CONFIG.pro.price_usd}</span>
              <span className="text-muted-foreground">/month</span>
            </div>

            <div className="space-y-3">
              {PRO_FEATURES.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <Button 
              onClick={handleUpgrade} 
              disabled={loading}
              className="w-full mt-6 bg-primary hover:bg-primary/90"
              size="lg"
            >
              {loading ? 'Opening checkout...' : 'Upgrade Now'}
            </Button>
          </div>

          {/* Free Plan Comparison */}
          <div className="rounded-lg border border-border p-4 opacity-60">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary">FREE</Badge>
              <span className="text-lg font-medium">Current Plan</span>
            </div>
            <div className="space-y-2">
              {FREE_FEATURES.map((feature, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-lg bg-muted/50">
              <Zap className="h-5 w-5 mx-auto mb-1 text-primary" />
              <div className="text-xs">Full Phases</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
              <div className="text-xs">7 AI Experts</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <Coins className="h-5 w-5 mx-auto mb-1 text-primary" />
              <div className="text-xs">200 SPORE</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
