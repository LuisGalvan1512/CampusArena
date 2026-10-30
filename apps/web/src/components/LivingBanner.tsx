'use client';

import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { CornerCrosshair, TacticalRadarSVG } from '@/components/EsportsIcons';

interface LivingBannerProps {
  imageSrc: string;
  fallbackSrc?: string;
  videoSrc?: string;
  alt?: string;
  heightClassName?: string;
  minHeightClass?: string;
  overlayVariant?: 'stadium' | 'editorial' | 'console';
  showRadar?: boolean;
  telemetryTag?: string;
  children?: React.ReactNode;
}

export function LivingBanner({
  imageSrc,
  fallbackSrc = '/assets/banner_stadium_tunnel.jpg',
  videoSrc,
  alt = 'Campus Arena Banner',
  heightClassName = 'min-h-[420px] sm:min-h-[520px]',
  minHeightClass,
  overlayVariant = 'stadium',
  showRadar = true,
  telemetryTag,
  children,
}: LivingBannerProps) {
  const effectiveHeight = minHeightClass || heightClassName;
  const containerRef = useRef<HTMLDivElement>(null);
  const [imgSrc, setImgSrc] = useState(imageSrc || fallbackSrc);
  const shouldReduceMotion = useReducedMotion();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 120, damping: 28 });
  const springY = useSpring(mouseY, { stiffness: 120, damping: 28 });

  const translateX = useTransform(springX, [-0.5, 0.5], [14, -14]);
  const translateY = useTransform(springY, [-0.5, 0.5], [10, -10]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || shouldReduceMotion) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(nx);
    mouseY.set(ny);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full overflow-hidden bg-[#09090B] border border-[#F4F2ED]/[0.1] rounded-sm ${effectiveHeight}`}
    >
      {/* Top & Bottom Architectural Hairline Accents */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#F4F2ED]/25 to-transparent z-20 pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-[#D9232E] via-[#C5A059]/40 to-transparent z-20 pointer-events-none" />

      {/* Corner Architectural Crosshairs */}
      <div className="absolute top-3 left-3 z-20 pointer-events-none">
        <CornerCrosshair />
      </div>
      <div className="absolute top-3 right-3 z-20 pointer-events-none">
        <CornerCrosshair />
      </div>
      <div className="absolute bottom-3 left-3 z-20 pointer-events-none">
        <CornerCrosshair />
      </div>
      <div className="absolute bottom-3 right-3 z-20 pointer-events-none">
        <CornerCrosshair />
      </div>

      {/* Living Ken Burns + Mouse Parallax Image Layer */}
      <motion.div
        style={{
          x: shouldReduceMotion ? 0 : translateX,
          y: shouldReduceMotion ? 0 : translateY,
        }}
        className="absolute inset-[-4%] pointer-events-none"
      >
        <motion.img
          src={imgSrc}
          alt={alt}
          onError={() => {
            if (imgSrc !== fallbackSrc) setImgSrc(fallbackSrc);
          }}
          animate={
            shouldReduceMotion
              ? {}
              : {
                  scale: [1.02, 1.09, 1.03],
                  x: [0, -14, 8, 0],
                  y: [0, -6, 4, 0],
                }
          }
          transition={{
            duration: 24,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-full h-full object-cover object-center opacity-70 contrast-[1.06] saturate-[0.88]"
        />

        {videoSrc && (
          <video
            autoPlay
            loop
            muted
            playsInline
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-screen"
          >
            <source src={videoSrc} type="video/webm" />
          </video>
        )}
      </motion.div>

      {/* Animated Atmospheric Light Sweep */}
      {!shouldReduceMotion && (
        <motion.div
          aria-hidden="true"
          animate={{ x: ['-120%', '220%'] }}
          transition={{ duration: 9, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
          className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-[#F4F2ED]/[0.045] to-transparent skew-x-[-20deg] pointer-events-none z-10"
        />
      )}

      {/* Sober Architectural Gradient Overlays (No AI Neon) */}
      {overlayVariant === 'stadium' && (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-[#070709] via-[#070709]/80 to-[#070709]/25 pointer-events-none z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-[#070709]/35 to-black/30 pointer-events-none z-10" />
        </>
      )}
      {overlayVariant === 'editorial' && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-[#070709]/65 to-[#070709]/20 pointer-events-none z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070709]/90 via-[#070709]/45 to-transparent pointer-events-none z-10" />
        </>
      )}
      {overlayVariant === 'console' && (
        <>
          <div className="absolute inset-0 bg-[#070709]/70 pointer-events-none z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#070709] via-[#070709]/75 to-transparent pointer-events-none z-10" />
        </>
      )}

      {/* Subtle Warm Tungsten & Restrained Crimson Directional Glow */}
      <div
        aria-hidden="true"
        className="absolute -bottom-24 left-12 w-96 h-48 bg-[#D9232E]/15 blur-[90px] pointer-events-none z-10"
      />
      <div
        aria-hidden="true"
        className="absolute -top-24 right-20 w-96 h-48 bg-[#C5A059]/10 blur-[100px] pointer-events-none z-10"
      />

      {/* Optional Rotating Tactical Radar Vector */}
      {showRadar && (
        <div className="hidden lg:block absolute top-6 right-8 z-10 pointer-events-none opacity-65">
          <TacticalRadarSVG className="w-28 h-28 text-[#F4F2ED]/15" />
        </div>
      )}

      {/* Optional Telemetry Tag */}
      {telemetryTag && (
        <div className="hidden sm:flex items-center gap-2 absolute top-4 right-8 z-20 font-mono text-[10px] uppercase tracking-[0.22em] text-[#A3A19A] pointer-events-none">
          <span className="w-1.5 h-1.5 bg-[#D9232E] inline-block" />
          <span>{telemetryTag}</span>
        </div>
      )}

      {/* Main Content Container */}
      <div className="relative z-20 w-full h-full">{children}</div>
    </div>
  );
}
