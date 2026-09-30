'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { sounds } from '@/lib/sound';

export function SoundToggle() {
  const [isMuted, setIsMuted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsMuted(sounds.isMuted());
  }, []);

  const handleToggle = () => {
    const newState = sounds.toggleMute();
    setIsMuted(newState);
  };

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] opacity-50" />
    );
  }

  return (
    <button
      onClick={handleToggle}
      title={isMuted ? 'Activar Efectos de Sonido Gamer' : 'Silenciar Efectos de Sonido'}
      className={`relative w-9 h-9 rounded-xl border transition-all duration-300 flex items-center justify-center cursor-pointer ${
        isMuted
          ? 'bg-[var(--bg-card)] border-[var(--border-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-red-500/30'
          : 'bg-[var(--bg-card)] border-[var(--border-card)] text-emerald-500 dark:text-emerald-400 hover:border-emerald-500/50 shadow-sm'
      }`}
    >
      {isMuted ? (
        <VolumeX className="w-4 h-4 transition-transform duration-300 hover:scale-110" />
      ) : (
        <Volume2 className="w-4 h-4 transition-transform duration-300 hover:scale-110" />
      )}
    </button>
  );
}
