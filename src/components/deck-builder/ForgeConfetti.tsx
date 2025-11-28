import confetti from 'canvas-confetti';

export const triggerForgeConfetti = () => {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { 
    startVelocity: 30, 
    spread: 360, 
    ticks: 60, 
    zIndex: 9999,
    colors: ['#00f5d4', '#9b5de5', '#f5a623', '#ffffff', '#00d9ff']
  };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  // First burst - center explosion
  confetti({
    ...defaults,
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6, x: 0.5 },
  });

  // Side bursts for extra magic
  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 }
    });
    confetti({
      ...defaults,
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 }
    });
  }, 200);

  // Star shapes for mystical effect
  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 40,
      shapes: ['star'],
      scalar: 1.2,
      origin: { y: 0.5, x: 0.5 }
    });
  }, 400);

  // Continuous small bursts
  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      clearInterval(interval);
      return;
    }

    const particleCount = 50 * (timeLeft / duration);
    
    confetti({
      ...defaults,
      particleCount,
      origin: { 
        x: randomInRange(0.1, 0.9), 
        y: randomInRange(0.3, 0.7) 
      }
    });
  }, 250);
};
