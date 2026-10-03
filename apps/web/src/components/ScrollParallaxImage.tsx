'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

interface ScrollParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  scaleRange?: [number, number];
  yRange?: [number, number];
  fallbackSrc?: string;
  priority?: boolean;
}

export function ScrollParallaxImage({
  src,
  alt,
  className = '',
  containerClassName = '',
  scaleRange = [1.0, 1.08],
  yRange = [-10, 10],
  fallbackSrc = '/games/clash_royale_banner.jpg',
}: ScrollParallaxImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const scale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    shouldReduceMotion ? [1, 1, 1] : [scaleRange[0], scaleRange[1], scaleRange[0]]
  );

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    shouldReduceMotion ? [0, 0] : [yRange[0], yRange[1]]
  );

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${containerClassName}`}
    >
      <motion.img
        src={src}
        alt={alt}
        style={{
          scale: shouldReduceMotion ? 1 : scale,
          y: shouldReduceMotion ? 0 : y,
          willChange: 'transform',
        }}
        onError={(e) => {
          if (e.currentTarget.getAttribute('data-failed') !== 'true') {
            e.currentTarget.setAttribute('data-failed', 'true');
            e.currentTarget.src = fallbackSrc;
          }
        }}
        className={`w-full h-full object-cover object-center ${className}`}
      />
    </div>
  );
}
