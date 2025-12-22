import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type TrafficVariant = 'community' | 'empire' | 'classic';

interface TrafficVariantContext {
  variant: TrafficVariant | null;
  sessionId: string | null;
  resetTest: () => void;
  trackEvent: (eventType: string, metadata?: Record<string, unknown>) => void;
}

const generateSessionId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

const getSessionId = (): string => {
  const existing = localStorage.getItem('traffic_session_id');
  if (existing) return existing;
  
  const newId = generateSessionId();
  localStorage.setItem('traffic_session_id', newId);
  return newId;
};

// 25% community, 60% empire, 15% classic
const assignVariant = (): TrafficVariant => {
  const rand = Math.random();
  if (rand < 0.25) return 'community';
  if (rand < 0.85) return 'empire'; // 0.25 + 0.60 = 0.85
  return 'classic';
};

export const useTrafficVariant = (): TrafficVariantContext => {
  const [variant, setVariant] = useState<TrafficVariant | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const hasTrackedPageLoad = useRef(false);
  const pageLoadStart = useRef(performance.now());

  const trackEvent = useCallback(async (
    eventType: string, 
    metadata?: Record<string, unknown>
  ) => {
    const currentSessionId = localStorage.getItem('traffic_session_id');
    const currentVariant = localStorage.getItem('traffic_variant');
    
    if (!currentSessionId || !currentVariant) return;

    try {
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
      console.debug('Traffic tracking error:', error);
    }
  }, []);

  useEffect(() => {
    const sid = getSessionId();
    setSessionId(sid);

    const savedVariant = localStorage.getItem('traffic_variant');
    
    // Migrate old A/B variants to new system
    if (savedVariant && ['A', 'B'].includes(savedVariant)) {
      const newVariant = assignVariant();
      localStorage.setItem('traffic_variant', newVariant);
      localStorage.removeItem('traffic_session_id'); // Force new session
      const newSid = getSessionId();
      setSessionId(newSid);
      setVariant(newVariant);
    } else if (savedVariant && ['community', 'empire', 'classic'].includes(savedVariant)) {
      setVariant(savedVariant as TrafficVariant);
    } else {
      const newVariant = assignVariant();
      localStorage.setItem('traffic_variant', newVariant);
      setVariant(newVariant);
    }

    const hasTracked = sessionStorage.getItem('traffic_page_load_tracked');
    if (!hasTracked && !hasTrackedPageLoad.current) {
      hasTrackedPageLoad.current = true;
      sessionStorage.setItem('traffic_page_load_tracked', 'true');
      
      requestAnimationFrame(() => {
        trackEvent('page_load');
      });
    }
  }, [trackEvent]);

  const resetTest = useCallback(() => {
    localStorage.removeItem('traffic_variant');
    localStorage.removeItem('traffic_session_id');
    sessionStorage.removeItem('traffic_page_load_tracked');
    window.location.reload();
  }, []);

  return { variant, sessionId, resetTest, trackEvent };
};
