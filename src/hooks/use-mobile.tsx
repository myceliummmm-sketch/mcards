import * as React from "react";

const MOBILE_BREAKPOINT = 1024;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    // Check touch capability or user agent on initial render
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const mobileUA = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isNarrow = window.innerWidth < MOBILE_BREAKPOINT;
    return isNarrow || (hasTouch && mobileUA);
  });

  React.useEffect(() => {
    const checkMobile = () => {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const mobileUA = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isNarrow = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(isNarrow || (hasTouch && mobileUA));
    };

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    mql.addEventListener("change", checkMobile);
    checkMobile();
    return () => mql.removeEventListener("change", checkMobile);
  }, []);

  return isMobile;
}
