'use client';

import { useEffect, useRef } from 'react';
import { sounds } from '@/lib/sound';

/**
 * GlobalButtonSound
 * Mounts a single document-level capture listener that fires whenever the user
 * clicks any <button> or element with role="button".
 * Uses a pre-loaded <audio> pool so the sound plays with minimal latency.
 * No CSS or visual properties are touched — purely audio side-effect.
 *
 * To exclude a button from this global sound, add data-no-sound to it:
 *   <button data-no-sound ...>
 */
export function GlobalButtonSound() {
  const poolRef = useRef<HTMLAudioElement[]>([]);
  const poolIndexRef = useRef(0);
  const POOL_SIZE = 4;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const pool: HTMLAudioElement[] = [];
    for (let i = 0; i < POOL_SIZE; i++) {
      const audio = new Audio('/sounds/button-click.mp3');
      audio.volume = 0.6;
      audio.preload = 'auto';
      pool.push(audio);
    }
    poolRef.current = pool;

    const handleClick = (e: MouseEvent) => {
      if (sounds.isMuted()) return;
      const target = e.target as Element | null;
      if (!target) return;

      const clickable = target.closest(
        'button, [role="button"], [type="submit"], [type="reset"]'
      );
      if (!clickable) return;

      // Skip buttons that handle their own sound (data-no-sound attribute)
      if (clickable.hasAttribute('data-no-sound')) return;

      const idx = poolIndexRef.current % POOL_SIZE;
      poolIndexRef.current++;
      const audio = poolRef.current[idx];
      if (!audio) return;

      audio.currentTime = 0;
      audio.play().catch(() => {});
    };

    document.addEventListener('click', handleClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleClick, { capture: true });
    };
  }, []);

  return null;
}
