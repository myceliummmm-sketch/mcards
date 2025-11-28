import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, ShoppingBag, Heart, TrendingUp, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface MarketplaceHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeView: string;
  onViewChange: (view: string) => void;
  ownedCount: number;
  favoritesCount: number;
  sellingCount: number;
}

export const MarketplaceHeader = ({
  searchQuery,
  onSearchChange,
  activeView,
  onViewChange,
  ownedCount,
  favoritesCount,
  sellingCount,
}: MarketplaceHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-glow">Insight Marketplace</h1>
            <p className="text-muted-foreground">
              Discover and trade powerful cards from the community
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm">
            💰 2,450 credits
          </Badge>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search
          size={20}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Search cards by title, industry, or creator..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-12 text-base"
        />
      </div>

      {/* View Tabs */}
      <Tabs value={activeView} onValueChange={onViewChange}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="browse" className="flex items-center gap-2">
            <ShoppingBag size={16} />
            Browse
          </TabsTrigger>
          <TabsTrigger value="collection" className="flex items-center gap-2">
            <Package size={16} />
            My Collection
            {ownedCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {ownedCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="selling" className="flex items-center gap-2">
            <TrendingUp size={16} />
            Selling
            {sellingCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {sellingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="favorites" className="flex items-center gap-2">
            <Heart size={16} />
            Favorites
            {favoritesCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {favoritesCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};
