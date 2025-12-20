import { ReactNode } from "react";
import { motion, PanInfo } from "framer-motion";

interface SwipeableStepProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  canSwipeLeft?: boolean;
  canSwipeRight?: boolean;
}

const SWIPE_THRESHOLD = 50;

export const SwipeableStep = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  canSwipeLeft = true,
  canSwipeRight = true,
}: SwipeableStepProps) => {
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;
    
    // Determine if swipe was significant enough
    const swipeDistance = Math.abs(offset.x);
    const swipeVelocity = Math.abs(velocity.x);
    
    if (swipeDistance < SWIPE_THRESHOLD && swipeVelocity < 500) {
      return;
    }

    // Haptic feedback on mobile
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }

    if (offset.x < -SWIPE_THRESHOLD && canSwipeLeft) {
      onSwipeLeft?.();
    } else if (offset.x > SWIPE_THRESHOLD && canSwipeRight) {
      onSwipeRight?.();
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      className="touch-pan-y"
      whileDrag={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  );
};
