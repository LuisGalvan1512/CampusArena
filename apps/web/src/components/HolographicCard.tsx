'use client';

import React, { useRef, useState, useMemo, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { CardMaterial, CARD_MATERIALS } from '@/lib/profile-customization';

interface HolographicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  enableTilt?: boolean;
  material?: CardMaterial;
}

function HolographicCardComponent({
  children,
  className = '',
  glowColor,
  enableTilt = true,
  material = 'sapphire_glass',
  ...props
}: HolographicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const isTouchDevice = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      isTouchDevice.current = window.matchMedia('(hover: none)').matches || 'ontouchstart' in window;
    }
  }, []);

  const matConfig = useMemo(
    () => CARD_MATERIALS.find((m) => m.id === material) || CARD_MATERIALS[0],
    [material]
  );
  const effectiveGlow = glowColor || matConfig.glowColor;

  // Mouse position relative to card (-0.5 to 0.5)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for rotation
  const springConfig = { damping: 20, stiffness: 220 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), springConfig);

  // Glare position
  const glareX = useTransform(mouseX, [-0.5, 0.5], ['0%', '100%']);
  const glareY = useTransform(mouseY, [-0.5, 0.5], ['0%', '100%']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !enableTilt || isTouchDevice.current) return;
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
          willChange: isHovered ? 'transform' : 'auto',
          transform: 'translateZ(0)',
        }}
        className={`relative overflow-hidden rounded-3xl arena-card transition-all duration-300 border ${matConfig.borderClass} ${matConfig.cardClass} ${className}`}
        {...(props as any)}
      >
        {/* Specular Foil Shimmer Overlay based on chosen Material */}
        {material === 'sapphire_glass' && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-20 mix-blend-screen transition-opacity duration-300"
            style={{
              opacity: isHovered ? 0.45 : 0.1,
              background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(56,189,248,0.7) 0%, rgba(37,99,235,0.4) 30%, transparent 70%)`,
            }}
          />
        )}

        {material === 'rainbow_foil' && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-20 mix-blend-color-dodge transition-opacity duration-300"
            style={{
              opacity: isHovered ? 0.45 : 0.15,
              background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.9) 0%, rgba(255,215,0,0.4) 25%, rgba(230,57,70,0.35) 50%, rgba(69,123,157,0.35) 75%, transparent 100%)`,
            }}
          />
        )}

        {material === 'gold_24k' && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-20 mix-blend-screen transition-opacity duration-300"
            style={{
              opacity: isHovered ? 0.5 : 0.15,
              background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(254,240,138,0.8) 0%, rgba(245,158,11,0.5) 30%, rgba(180,83,9,0.2) 60%, transparent 80%)`,
            }}
          />
        )}

        {material === 'titanium' && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-20 mix-blend-overlay transition-opacity duration-300"
            style={{
              opacity: isHovered ? 0.35 : 0.1,
              background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.4) 0%, rgba(148,163,184,0.2) 35%, transparent 65%)`,
            }}
          />
        )}

        {material === 'stealth_carbon' && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-20 mix-blend-overlay transition-opacity duration-300"
            style={{
              opacity: isHovered ? 0.25 : 0.05,
              background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.2) 0%, rgba(51,65,85,0.3) 40%, transparent 70%)`,
            }}
          />
        )}

        {/* Steam Animated Neon Card Shimmer */}
        {material === 'steam_neon_shrine' && (
          <motion.div
            className="pointer-events-none absolute inset-0 z-20 mix-blend-color-dodge transition-opacity duration-300"
            style={{
              opacity: isHovered ? 0.35 : 0.1,
              background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(192,132,252,0.6) 0%, rgba(147,51,234,0.3) 40%, transparent 80%)`,
            }}
          />
        )}

        {/* Video Background Layer for Animated Card Materials */}
        {matConfig.videoUrl && (
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-3xl">
            <video
              src={matConfig.videoUrl}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="w-full h-full object-cover opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D13]/70 via-transparent to-[#0B0D13]/30" />
          </div>
        )}

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
          className="pointer-events-none absolute -inset-1 z-0 rounded-3xl opacity-0 transition-opacity duration-500 blur-xl"
          style={{
            background: effectiveGlow,
            opacity: isHovered ? 0.5 : 0,
          }}
        />

        <div className="relative z-10 h-full w-full">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

export const HolographicCard = React.memo(HolographicCardComponent);
