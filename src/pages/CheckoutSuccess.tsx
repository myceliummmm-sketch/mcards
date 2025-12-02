import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Crown, Sparkles, Users, Store, Coins } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function CheckoutSuccess() {
  const navigate = useNavigate();
  const { refetch, isPro, loading } = useSubscription();
  const [refreshing, setRefreshing] = useState(true);

  useEffect(() => {
    // Fire confetti on mount
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Refresh subscription status
    const refresh = async () => {
      setRefreshing(true);
      await refetch();
      setRefreshing(false);
    };
    refresh();
  }, [refetch]);

  const benefits = [
    { icon: Sparkles, label: 'All 4 Business Phases', description: 'Vision, Research, Build & Grow' },
    { icon: Users, label: 'Full AI Team Access', description: 'All 7 expert advisors' },
    { icon: Store, label: 'Marketplace Access', description: 'Buy & sell strategy cards' },
    { icon: Coins, label: '200 SPORE Monthly', description: 'For marketplace purchases' },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="border-primary/50 shadow-lg">
          <CardHeader className="text-center pb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto mb-4 w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center"
            >
              <CheckCircle className="w-12 h-12 text-primary" />
            </motion.div>
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Crown className="w-6 h-6 text-primary" />
              Welcome to Pro!
            </CardTitle>
            <CardDescription>
              Your subscription is now active
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {(refreshing || loading) && (
              <div className="text-center text-sm text-muted-foreground">
                Verifying subscription status...
              </div>
            )}

            {!refreshing && !loading && isPro && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center text-sm text-primary font-medium"
              >
                ✓ Pro subscription confirmed
              </motion.div>
            )}

            <div className="space-y-3">
              <h3 className="font-semibold text-foreground text-center">Your Pro Benefits</h3>
              <div className="grid gap-3">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border"
                  >
                    <div className="p-2 rounded-full bg-primary/10">
                      <benefit.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-sm text-foreground">{benefit.label}</div>
                      <div className="text-xs text-muted-foreground">{benefit.description}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <Button 
                onClick={() => navigate('/dashboard')} 
                className="w-full"
                size="lg"
              >
                Go to Dashboard
              </Button>
              <Button 
                onClick={() => navigate('/settings')} 
                variant="outline"
                className="w-full"
              >
                View Subscription Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
