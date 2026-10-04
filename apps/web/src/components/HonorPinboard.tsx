'use client';

import React from 'react';
import { HonorPinId, HONOR_PINS, HonorPin } from '@/lib/profile-customization';

interface HonorPinboardProps {
  pinnedPins: HonorPinId[];
  onTogglePin?: (id: HonorPinId) => void;
  isEditing?: boolean;
}

export function HonorPinboard({
  pinnedPins = [],
  onTogglePin,
  isEditing = false,
}: HonorPinboardProps) {
  const activePins = pinnedPins
    .map((id) => HONOR_PINS.find((p) => p.id === id))
    .filter(Boolean) as HonorPin[];

  if (activePins.length === 0 && !isEditing) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
        <span>Vitrina de Pines</span>
        <span>{activePins.length} / 3 fijados</span>
      </div>

      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[var(--bg-arena)]/90 border border-[var(--border-card)] backdrop-blur-md">
        {activePins.map((pin) => (
          <div
            key={pin.id}
            title={`${pin.name} — ${pin.description}`}
            className="group/pin relative flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-white/20 transition-all cursor-default shadow-sm hover:scale-105"
          >
            <span className="text-sm">{pin.icon}</span>
            <span className="text-[11px] font-bold text-[var(--text-primary)] whitespace-nowrap">
              {pin.name}
            </span>
            {pin.rarity === 'LEGENDARY' && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            )}
          </div>
        ))}

        {Array.from({ length: Math.max(0, 3 - activePins.length) }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="flex items-center justify-center w-8 h-7 rounded-xl border border-dashed border-[var(--border-card)] text-[var(--text-muted)] text-[10px]"
            title="Espacio de pin disponible"
          >
            +
          </div>
        ))}
      </div>
    </div>
  );
}
