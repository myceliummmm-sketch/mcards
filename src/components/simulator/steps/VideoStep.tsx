import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface VideoStepProps {
  onComplete: () => void;
}

export function VideoStep({ onComplete }: VideoStepProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(console.error);
    }
  }, []);

  const handleVideoEnd = () => {
    onComplete();
  };

  const handleVideoClick = () => {
    // Allow skipping by clicking
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      onClick={handleVideoClick}
    >
      <video
        ref={videoRef}
        src="/videos/chest-opening.mp4"
        className="w-full h-full object-contain"
        onEnded={handleVideoEnd}
        playsInline
        muted
      />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 text-white/50 text-sm"
      >
        Нажми, чтобы пропустить
      </motion.p>
    </motion.div>
  );
}
