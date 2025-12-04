import { Crown, User, Diamond } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';

export function SubscriptionBadge() {
  const { tier, loading } = useSubscription();

  if (loading) {
    return null;
  }

  if (tier === 'ultra') {
    return (
      <Badge className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white gap-1 border-0">
        <Diamond className="h-3 w-3" />
        ULTRA
      </Badge>
    );
  }

  if (tier === 'pro') {
    return (
      <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground gap-1">
        <Crown className="h-3 w-3" />
        PRO
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="gap-1">
      <User className="h-3 w-3" />
      FREE
    </Badge>
  );
}