'use client';

import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface HolographicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  enableTilt?: boolean;
}

export function HolographicCard({
  children,
  className = '',
  glowColor = 'rgba(230, 57, 70, 0.35)',
  enableTilt = true,
  ...props
}: HolographicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse position relative to card (-0.5 to 0.5)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for rotation
  const springConfig = { damping: 20, stiffness: 220 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), springConfig);

  // Glare position
  const glareX = useTransform(mouseX, [-0.5, 0.5], ['0%', '100%']);
  const glareY = useTransform(mouseY, [-0.5, 0.5], ['0%', '100%']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !enableTilt) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const x = (e.clientX - rect.left) / width - 0.5;
    const y = (e.clientY - rect.top) / height - 0.5;

    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      style={{ perspective: 1000 }}
      className="inline-block w-full"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX: enableTilt ? rotateX : 0,
          rotateY: enableTilt ? rotateY : 0,
          transformStyle: 'preserve-3d',
        }}
        className={`relative overflow-hidden rounded-2xl arena-card transition-shadow duration-300 ${className}`}
        {...(props as any)}
      >
        {/* Holographic metallic rainbow shimmer overlay */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-20 mix-blend-color-dodge transition-opacity duration-300"
          style={{
            opacity: isHovered ? 0.35 : 0,
            background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.8) 0%, rgba(255,215,0,0.3) 25%, rgba(230,57,70,0.3) 50%, rgba(69,123,157,0.3) 75%, transparent 100%)`,
          }}
        />

        {/* Dynamic Specular Glare light sheen */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
          style={{
            opacity: isHovered ? 0.2 : 0,
            background: `radial-gradient(circle at ${glareX} ${glareY}, white 10%, transparent 60%)`,
          }}
        />

        {/* Ambient colored edge glow */}
        <div
          className="pointer-events-none absolute -inset-1 z-0 rounded-2xl opacity-0 transition-opacity duration-500 blur-xl"
          style={{
            background: glowColor,
            opacity: isHovered ? 0.45 : 0,
          }}
        />

        <div className="relative z-10 h-full w-full">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
