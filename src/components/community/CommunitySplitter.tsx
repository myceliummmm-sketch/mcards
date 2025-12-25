import { useState, useEffect } from "react";
import { lazy, Suspense } from "react";

const Community = lazy(() => import("@/pages/Community"));
const Community2 = lazy(() => import("@/pages/Community2"));

const STORAGE_KEY = 'community_variant';

type CommunityVariant = 'v1' | 'v2';

const LoadingFallback = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

export const CommunitySplitter = () => {
  const [variant, setVariant] = useState<CommunityVariant | null>(null);

  useEffect(() => {
    // Check if user already has a variant assigned
    const stored = localStorage.getItem(STORAGE_KEY) as CommunityVariant | null;
    
    if (stored === 'v1' || stored === 'v2') {
      setVariant(stored);
    } else {
      // 50/50 split
      const newVariant: CommunityVariant = Math.random() < 0.5 ? 'v1' : 'v2';
      localStorage.setItem(STORAGE_KEY, newVariant);
      setVariant(newVariant);
    }
  }, []);

  if (!variant) {
    return <LoadingFallback />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      {variant === 'v1' ? <Community /> : <Community2 />}
    </Suspense>
  );
};

export default CommunitySplitter;
