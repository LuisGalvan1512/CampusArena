'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface IconProps {
  className?: string;
  size?: number;
  animated?: boolean;
}

/**
 * Architectural Corner Crosshair Tick (+) for sober hardware/broadcast frames
 */
export function CornerCrosshair({ className = 'w-3 h-3 text-[#F4F2ED]/30' }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" fill="none" className={className} aria-hidden="true">
      <path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
    </svg>
  );
}

/**
 * Animated Live Audio/Broadcast Telemetry Waveform
 */
export function LiveWaveformIcon({ className = 'w-5 h-4 text-[#D9232E]' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 16" fill="none" className={className} aria-hidden="true">
      {[
        { x: 2, h1: 4, h2: 14, d: 0.7 },
        { x: 7, h1: 12, h2: 4, d: 0.55 },
        { x: 12, h1: 6, h2: 15, d: 0.8 },
        { x: 17, h1: 14, h2: 5, d: 0.6 },
        { x: 22, h1: 5, h2: 12, d: 0.75 },
      ].map((bar, i) => (
        <motion.line
          key={i}
          x1={bar.x}
          x2={bar.x}
          y1={8 - bar.h1 / 2}
          y2={8 + bar.h1 / 2}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="square"
          animate={{
            y1: [8 - bar.h1 / 2, 8 - bar.h2 / 2, 8 - bar.h1 / 2],
            y2: [8 + bar.h1 / 2, 8 + bar.h2 / 2, 8 + bar.h1 / 2],
          }}
          transition={{
            duration: bar.d,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </svg>
  );
}

/**
 * Animated Tactical Reticle / Radar SVG for Banners and Headers
 */
export function TacticalRadarSVG({ className = 'w-24 h-24 text-[#F4F2ED]/15' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} aria-hidden="true">
      <circle cx="60" cy="60" r="54" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
      <circle cx="60" cy="60" r="36" stroke="currentColor" strokeWidth="1" strokeOpacity="0.6" />
      <circle cx="60" cy="60" r="16" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
      <line x1="60" y1="0" x2="60" y2="120" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.4" />
      <line x1="0" y1="60" x2="120" y2="60" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.4" />
      <motion.g
         style={{ originX: '60px', originY: '60px' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
      >
        <line x1="60" y1="60" x2="60" y2="6" stroke="#D9232E" strokeWidth="1.5" strokeOpacity="0.75" />
        <circle cx="60" cy="24" r="2.5" fill="#D9232E" />
      </motion.g>
    </svg>
  );
}

/**
 * Championship Aegis / Monolith Trophy Icon
 */
export function AegisTrophyIcon({ className = 'w-6 h-6', animated = true }: IconProps) {
  return (
    <svg viewBox="0 0 28 28" fill="none" className={className} aria-hidden="true">
      <path
        d="M14 2L24 6.5V13.5C24 20.1 19.7 24.6 14 26.5C8.3 24.6 4 20.1 4 13.5V6.5L14 2Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="miter"
      />
      <path
        d="M14 6.5L19.5 9V13.5C19.5 17.6 17.1 20.4 14 21.8C10.9 20.4 8.5 17.6 8.5 13.5V9L14 6.5Z"
        stroke="#D9232E"
        strokeWidth="1.4"
      />
      {animated ? (
        <motion.path
          d="M14 10.5L15.8 14H12.2L14 10.5Z"
          fill="currentColor"
          animate={{ opacity: [0.5, 1, 0.5], scale: [0.95, 1.08, 0.95] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      ) : (
        <path d="M14 10.5L15.8 14H12.2L14 10.5Z" fill="currentColor" />
      )}
    </svg>
  );
}

/**
 * Interactive Tournament Bracket Tree Icon
 */
export function BracketTreeIcon({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="2" y="3" width="6" height="4" stroke="currentColor" strokeWidth="1.6" />
      <rect x="2" y="10" width="6" height="4" stroke="currentColor" strokeWidth="1.6" />
      <rect x="2" y="17" width="6" height="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 5H12V12H8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 8.5H16" stroke="#D9232E" strokeWidth="1.8" />
      <rect x="16" y="6.5" width="6" height="4" stroke="#D9232E" strokeWidth="1.6" />
      <path d="M8 19H16" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
    </svg>
  );
}

/**
 * Organizer Command Shield Icon
 */
export function CommandConsoleIcon({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="2" y="3" width="20" height="18" stroke="currentColor" strokeWidth="1.6" />
      <line x1="2" y1="8" x2="22" y2="8" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="5.5" cy="5.5" r="1" fill="#D9232E" />
      <circle cx="8.5" cy="5.5" r="1" fill="currentColor" />
      <path d="M6 13L9 15.5L6 18" stroke="#D9232E" strokeWidth="1.6" strokeLinecap="square" />
      <line x1="11" y1="18" x2="17" y2="18" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

/**
 * Custom Discipline Vector Emblem for each of the 7 official games
 */
export function GameDisciplineEmblem({
  gameCode,
  code,
  className = 'w-6 h-6',
}: {
  gameCode?: string;
  code?: string;
  className?: string;
}) {
  const resolvedCode = gameCode || code || '';
  switch (resolvedCode) {
    case 'DOTA_2':
      // Ancient Three-Lane Monolith Crest
      return (
        <svg viewBox="0 0 28 28" fill="none" className={className} aria-hidden="true">
          <rect x="3" y="3" width="22" height="22" stroke="currentColor" strokeWidth="1.8" />
          <path d="M7 21L21 7" stroke="#D9232E" strokeWidth="2.6" strokeLinecap="square" />
          <rect x="7" y="7" width="4.5" height="4.5" fill="currentColor" />
          <rect x="16.5" y="16.5" width="4.5" height="4.5" fill="currentColor" />
        </svg>
      );
    case 'CLASH_ROYALE':
      // Imperial Dual-Blade Crown Crest
      return (
        <svg viewBox="0 0 28 28" fill="none" className={className} aria-hidden="true">
          <path
            d="M4 20L6.5 9L11.5 14L14 7L16.5 14L21.5 9L24 20H4Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="miter"
          />
          <line x1="4" y1="23" x2="24" y2="23" stroke="#D9232E" strokeWidth="2" />
        </svg>
      );
    case 'BRAWL_STARS':
      // Tactical Star Crest
      return (
        <svg viewBox="0 0 28 28" fill="none" className={className} aria-hidden="true">
          <path
            d="M14 3L17.2 10.2L25 11.1L19.2 16.4L20.8 24L14 20.1L7.2 24L8.8 16.4L3 11.1L10.8 10.2L14 3Z"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <circle cx="14" cy="14.5" r="2.5" fill="#D9232E" />
        </svg>
      );
    case 'LEFT_4_DEAD_2':
      // Tactical Crosshair Reticle
      return (
        <svg viewBox="0 0 28 28" fill="none" className={className} aria-hidden="true">
          <circle cx="14" cy="14" r="9" stroke="currentColor" strokeWidth="1.75" />
          <line x1="14" y1="2" x2="14" y2="8" stroke="#D9232E" strokeWidth="2" />
          <line x1="14" y1="20" x2="14" y2="26" stroke="#D9232E" strokeWidth="2" />
          <line x1="2" y1="14" x2="8" y2="14" stroke="#D9232E" strokeWidth="2" />
          <line x1="20" y1="14" x2="26" y2="14" stroke="#D9232E" strokeWidth="2" />
          <circle cx="14" cy="14" r="2" fill="currentColor" />
        </svg>
      );
    case 'SMASH_ULTIMATE':
      // Iconic Asymmetric Cross Sphere
      return (
        <svg viewBox="0 0 28 28" fill="none" className={className} aria-hidden="true">
          <circle cx="14" cy="14" r="10.5" stroke="currentColor" strokeWidth="1.8" />
          <line x1="10.5" y1="3.8" x2="10.5" y2="24.2" stroke="#D9232E" strokeWidth="2.8" />
          <line x1="3.8" y1="16.5" x2="24.2" y2="16.5" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    case 'EFOOTBALL':
      // Tactical Pitch Hexagon
      return (
        <svg viewBox="0 0 28 28" fill="none" className={className} aria-hidden="true">
          <polygon
            points="14,2.5 24,8.2 24,19.8 14,25.5 4,19.8 4,8.2"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <polygon
            points="14,8.5 19,11.5 19,16.5 14,19.5 9,16.5 9,11.5"
            stroke="#D9232E"
            strokeWidth="1.5"
          />
        </svg>
      );
    case 'FORTNITE':
    default:
      // Storm Compass Diamond
      return (
        <svg viewBox="0 0 28 28" fill="none" className={className} aria-hidden="true">
          <rect
            x="14"
            y="3"
            width="15.5"
            height="15.5"
            transform="rotate(45 14 3)"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <circle cx="14" cy="14" r="3" fill="#D9232E" />
        </svg>
      );
  }
}
