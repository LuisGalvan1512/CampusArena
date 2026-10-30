'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView, useSpring, useMotionValue } from 'framer-motion';

interface AnimatedCounterProps {
  target?: number;
  value?: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({
  target,
  value,
  suffix = '',
  prefix = '',
  duration = 1.5,
  className = '',
}: AnimatedCounterProps) {
  const resolvedTarget = target ?? value ?? 0;
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [displayValue, setDisplayValue] = useState(0);

  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, {
    stiffness: 80,
    damping: 20,
    duration: duration * 1000,
  });

  useEffect(() => {
    if (isInView) {
      motionValue.set(resolvedTarget);
    }
  }, [isInView, resolvedTarget, motionValue]);

  useEffect(() => {
    const unsubscribe = spring.on('change', (latest) => {
      setDisplayValue(Math.round(latest));
    });
    return unsubscribe;
  }, [spring]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}
