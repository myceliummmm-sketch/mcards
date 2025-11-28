import { Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PriceTagProps {
  price: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PriceTag = ({ price, className, size = 'md' }: PriceTagProps) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg font-bold',
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20,
  };

  return (
    <div className={cn('inline-flex items-center gap-1.5 text-yellow-400', sizeClasses[size], className)}>
      <Coins size={iconSizes[size]} className="text-yellow-500" />
      <span className="text-glow">{price.toLocaleString()}</span>
      <span className="text-muted-foreground text-xs">credits</span>
    </div>
  );
};
