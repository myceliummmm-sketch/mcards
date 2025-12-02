import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Crown, 
  User, 
  LogOut, 
  CreditCard, 
  Coins,
  Calendar,
  Sparkles,
  Loader2
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UpgradeModal } from '@/components/paywall/UpgradeModal';
import { STRIPE_CONFIG } from '@/data/subscriptionConfig';

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { tier, isPro, sporeBalance, subscription, loading } = useSubscription();
  const [user, setUser] = useState<any>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const handleManageBilling = async () => {
    setLoadingPortal(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to manage billing",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to open billing portal",
        variant: "destructive",
      });
    } finally {
      setLoadingPortal(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        </div>

        {/* Account Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account
            </CardTitle>
            <CardDescription>Manage your account settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Email</div>
                <div className="font-medium">{user?.email || 'Loading...'}</div>
              </div>
            </div>
            <Separator />
            <Button variant="outline" onClick={handleSignOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>

        {/* Subscription Section */}
        <Card className={isPro ? 'border-primary/50' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isPro ? <Crown className="h-5 w-5 text-primary" /> : <Sparkles className="h-5 w-5" />}
              Subscription
            </CardTitle>
            <CardDescription>Manage your subscription plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {/* Current Plan */}
                <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Current Plan</div>
                    <Badge className={isPro 
                      ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground' 
                      : 'bg-secondary text-secondary-foreground'
                    }>
                      {isPro ? (
                        <><Crown className="h-3 w-3 mr-1" /> PRO</>
                      ) : (
                        <><User className="h-3 w-3 mr-1" /> FREE</>
                      )}
                    </Badge>
                  </div>

                  {isPro && (
                    <>
                      <Separator />
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Renews:</span>
                        <span className="font-medium">{formatDate(subscription?.expiresAt)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-medium">${STRIPE_CONFIG.pro.price_usd}/month</span>
                      </div>
                    </>
                  )}
                </div>

                {/* SPORE Balance */}
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Coins className="h-5 w-5 text-primary" />
                      <span className="font-medium">SPORE Balance</span>
                    </div>
                    <div className="text-xl font-bold text-foreground">{sporeBalance}</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Use SPORE to purchase cards on the marketplace
                  </p>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  {isPro ? (
                    <Button 
                      onClick={handleManageBilling} 
                      className="w-full gap-2"
                      disabled={loadingPortal}
                    >
                      {loadingPortal ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CreditCard className="h-4 w-4" />
                      )}
                      Manage Billing
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => setShowUpgradeModal(true)} 
                      className="w-full gap-2"
                    >
                      <Crown className="h-4 w-4" />
                      Upgrade to Pro - ${STRIPE_CONFIG.pro.price_usd}/month
                    </Button>
                  )}
                </div>

                {/* Pro Features List */}
                {!isPro && (
                  <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
                    <h4 className="font-medium text-sm mb-2">Pro includes:</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>✓ All 4 business phases (Vision, Research, Build, Grow)</li>
                      <li>✓ All 7 AI team advisors</li>
                      <li>✓ Up to 5 projects</li>
                      <li>✓ Marketplace access</li>
                      <li>✓ 200 SPORE monthly</li>
                    </ul>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <UpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />
    </div>
  );
}
