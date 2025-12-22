import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

type Variant = 'A' | 'B';

interface ABTestContext {
  variant: Variant | null;
  sessionId: string | null;
  resetTest: () => void;
  trackEvent: (eventType: string, metadata?: Record<string, unknown>) => void;
}

// Generate a unique session ID
const generateSessionId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

// Get or create session ID from localStorage
const getSessionId = (): string => {
  const existing = localStorage.getItem('ab_session_id');
  if (existing) return existing;
  
  const newId = generateSessionId();
  localStorage.setItem('ab_session_id', newId);
  return newId;
};

export const useABTest = (): ABTestContext => {
  const [variant, setVariant] = useState<Variant | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const hasTrackedPageLoad = useRef(false);
  const pageLoadStart = useRef(performance.now());

  // Track event to database
  const trackEvent = useCallback(async (
    eventType: string, 
    metadata?: Record<string, unknown>
  ) => {
    const currentSessionId = localStorage.getItem('ab_session_id');
    const currentVariant = localStorage.getItem('ab_test_variant');
    
    if (!currentSessionId || !currentVariant) return;

    try {
      // Use type assertion since the table was just created and types aren't regenerated yet
      await (supabase.from('ab_test_events') as any).insert({
        session_id: currentSessionId,
        variant: currentVariant,
        event_type: eventType,
        page_load_time_ms: eventType === 'page_load' 
          ? Math.round(performance.now() - pageLoadStart.current) 
          : null,
        metadata: metadata || {}
      });
    } catch (error) {
      // Silently fail - analytics shouldn't break the app
      console.debug('AB tracking error:', error);
    }
  }, []);

  useEffect(() => {
    // Initialize session ID
    const sid = getSessionId();
    setSessionId(sid);

    // Initialize or retrieve variant
    const savedVariant = localStorage.getItem('ab_test_variant') as Variant | null;
    
    if (savedVariant) {
      setVariant(savedVariant);
    } else {
      const newVariant = Math.random() < 0.5 ? 'A' : 'B';
      localStorage.setItem('ab_test_variant', newVariant);
      setVariant(newVariant);
    }

    // Track page load only once per session
    const hasTracked = sessionStorage.getItem('ab_page_load_tracked');
    if (!hasTracked && !hasTrackedPageLoad.current) {
      hasTrackedPageLoad.current = true;
      sessionStorage.setItem('ab_page_load_tracked', 'true');
      
      // Wait for DOM to be ready to get accurate timing
      requestAnimationFrame(() => {
        trackEvent('page_load');
      });
    }
  }, [trackEvent]);

  const resetTest = useCallback(() => {
    localStorage.removeItem('ab_test_variant');
    localStorage.removeItem('ab_session_id');
    sessionStorage.removeItem('ab_page_load_tracked');
    window.location.reload();
  }, []);

  return { variant, sessionId, resetTest, trackEvent };
};
