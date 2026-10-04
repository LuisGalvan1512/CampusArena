export async function fireCelebration() {
  if (typeof window === 'undefined') return;

  const confettiModule = await import('canvas-confetti');
  const confetti = confettiModule.default || confettiModule;

  // Multi-stage celebratory fireworks
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  function fire(particleRatio: number, opts: any) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    colors: ['#E63946', '#FFD166', '#06D6A0', '#118AB2'],
  });
  fire(0.2, {
    spread: 60,
    colors: ['#E63946', '#FF6B6B', '#4D96FF'],
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
    colors: ['#FFD700', '#FFA500', '#FF4500'],
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    colors: ['#FFFFFF', '#E63946', '#A8DADC'],
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
    colors: ['#E63946', '#457B9D', '#F1FAEE'],
  });
}
