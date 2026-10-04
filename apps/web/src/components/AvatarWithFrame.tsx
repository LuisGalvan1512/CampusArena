'use client';

import React from 'react';
import { Crown, Sparkles, Zap, Flame } from 'lucide-react';
import { AvatarFrame, AVATAR_FRAMES } from '@/lib/profile-customization';

interface AvatarWithFrameProps {
  avatarUrl: string;
  frame?: AvatarFrame;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  alt?: string;
  className?: string;
  interactive?: boolean;
}

const SIZE_MAP = {
  sm: {
    container: 'w-10 h-10',
    img: 'w-10 h-10',
    crown: 'w-3.5 h-3.5 -top-2',
    iconSize: 'w-3 h-3',
  },
  md: {
    container: 'w-14 h-14',
    img: 'w-14 h-14',
    crown: 'w-4 h-4 -top-2.5',
    iconSize: 'w-3.5 h-3.5',
  },
  lg: {
    container: 'w-20 h-20 sm:w-24 sm:h-24',
    img: 'w-20 h-20 sm:w-24 sm:h-24',
    crown: 'w-6 h-6 -top-3.5',
    iconSize: 'w-4 h-4',
  },
  xl: {
    container: 'w-28 h-28 sm:w-32 sm:h-32',
    img: 'w-28 h-28 sm:w-32 sm:h-32',
    crown: 'w-8 h-8 -top-4',
    iconSize: 'w-5 h-5',
  },
};

export function AvatarWithFrame({
  avatarUrl,
  frame = 'none',
  size = 'md',
  alt = 'Avatar',
  className = '',
  interactive = false,
}: AvatarWithFrameProps) {
  const currentSize = SIZE_MAP[size] || SIZE_MAP.md;
  const frameConfig = AVATAR_FRAMES.find((f) => f.id === frame) || AVATAR_FRAMES[0];

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${currentSize.container} ${className}`}>
      
      {/* 1. Golden Crown Icon for 'golden_crown' frame */}
      {frame === 'golden_crown' && (
        <div className={`absolute ${currentSize.crown} left-1/2 -translate-x-1/2 z-20 pointer-events-none drop-shadow-[0_2px_8px_rgba(245,158,11,0.8)]`}>
          <div className="animate-bounce" style={{ animationDuration: '2.5s' }}>
            <Crown className="w-5 h-5 text-amber-400 fill-amber-300 drop-shadow-md" />
          </div>
        </div>
      )}

      {/* 2. Flame Particle Accent for 'crimson_flame' */}
      {frame === 'crimson_flame' && (
        <div className="absolute -top-1 -right-1 z-20 pointer-events-none animate-pulse">
          <Flame className="w-4 h-4 text-[#E63946] fill-[#E63946] drop-shadow-[0_0_8px_rgba(230,57,70,0.8)]" />
        </div>
      )}

      {/* 3. PCB Circuit Chip for 'pcb_circuit' */}
      {frame === 'pcb_circuit' && (
        <div className="absolute -bottom-1 -left-1 z-20 pointer-events-none">
          <div className="w-3.5 h-3.5 rounded-full bg-[#0E1424] border border-[#38BDF8] flex items-center justify-center shadow-[0_0_8px_rgba(56,189,248,0.8)]">
            <Zap className="w-2 h-2 text-[#38BDF8]" />
          </div>
        </div>
      )}

      {/* 4. Ambient Aura / Glow Behind the Frame */}
      {frame !== 'none' && (
        <div
          className="absolute -inset-1 rounded-full blur-md opacity-60 pointer-events-none transition-opacity duration-300"
          style={{ backgroundColor: frameConfig.glowColor }}
        />
      )}

      {/* Admin Brush Frame Image Overlay */}
      {frameConfig.imageFrameUrl && (
        <div className="absolute -inset-3.5 z-20 pointer-events-none select-none flex items-center justify-center">
          <img
            src={frameConfig.imageFrameUrl}
            alt=""
            className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(230,57,70,0.6)] drop-shadow-[0_0_2px_rgba(255,255,255,0.7)]"
          />
        </div>
      )}

      {/* 5. Animated Frame Wrapper */}
      <div
        className={`relative z-10 w-full h-full rounded-full overflow-hidden p-0.5 transition-all duration-300 ${
          frame === 'none'
            ? 'border-2 border-white/20'
            : frame === 'admin_brush'
            ? 'border-0 p-1'
            : frame === 'pcb_circuit'
            ? 'border-2 border-[#38BDF8] ring-2 ring-[#1E40AF]/70 shadow-[0_0_15px_rgba(56,189,248,0.4)]'
            : frame === 'crimson_flame'
            ? 'border-2 border-[#E63946] ring-2 ring-[#E63946]/50 shadow-[0_0_18px_rgba(230,57,70,0.5)]'
            : frame === 'neon_ring'
            ? 'border-2 border-[#A855F7] ring-2 ring-[#38BDF8]/40 shadow-[0_0_16px_rgba(168,85,247,0.45)]'
            : frame === 'golden_crown'
            ? 'border-2 border-amber-400 ring-2 ring-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.55)]'
            : frame === 'cyber_glitch'
            ? 'border-2 border-emerald-400 ring-2 ring-cyan-400/50 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
            : 'border-2 border-white/20'
        } ${interactive ? 'hover:scale-105 active:scale-95' : ''}`}
      >
        <img
          src={avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=TecsupFox'}
          alt={alt}
          onError={(e) => {
            if (e.currentTarget.getAttribute('data-failed') !== 'true') {
              e.currentTarget.setAttribute('data-failed', 'true');
              e.currentTarget.src = 'https://api.dicebear.com/7.x/bottts/svg?seed=TecsupFox';
            }
          }}
          className="w-full h-full object-cover rounded-full bg-[#0E1424]"
        />

        {/* Cyber glitch subtle scanline overlay */}
        {frame === 'cyber_glitch' && (
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-emerald-400/10 to-transparent opacity-60 mix-blend-overlay" />
        )}
      </div>

    </div>
  );
}
