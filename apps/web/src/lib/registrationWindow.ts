'use client';

import { useEffect, useState } from 'react';

/**
 * Registration window helpers (frontend mirror of the API rules).
 *
 * El estado guardado (`status`) lo cambia el organizador manualmente, pero las
 * fechas de apertura/cierre mandan sobre la disponibilidad real:
 *  - PUBLISHED / REGISTRATION_OPEN antes de abrir  -> PUBLISHED   ("Próximamente")
 *  - PUBLISHED / REGISTRATION_OPEN dentro de fecha -> REGISTRATION_OPEN
 *  - PUBLISHED / REGISTRATION_OPEN tras el cierre  -> REGISTRATION_CLOSED
 *  - Cualquier otro estado se respeta tal cual.
 * El servidor valida lo mismo, así que esto solo evita que el usuario llene el
 * formulario para enterarse al final de que estaba fuera de horario.
 */

export type TournamentStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'REGISTRATION_OPEN'
  | 'REGISTRATION_CLOSED'
  | 'IN_PROGRESS'
  | 'FINISHED'
  | 'CANCELLED';

export interface RegistrationWindowInput {
  status: string;
  registration_open_at?: string | null;
  registration_close_at?: string | null;
}

const WINDOW_MANAGED_STATUSES = ['PUBLISHED', 'REGISTRATION_OPEN'];

const toMs = (value?: string | null): number | null => {
  if (!value) return null;
  const ms = new Date(value).getTime();
  return Number.isNaN(ms) ? null : ms;
};

export function getEffectiveStatus(
  tournament: RegistrationWindowInput,
  nowMs: number = Date.now()
): TournamentStatus {
  if (!WINDOW_MANAGED_STATUSES.includes(tournament.status)) {
    return tournament.status as TournamentStatus;
  }

  const open = toMs(tournament.registration_open_at);
  const close = toMs(tournament.registration_close_at);

  if (open !== null && nowMs < open) return 'PUBLISHED';
  if (close !== null && nowMs > close) return 'REGISTRATION_CLOSED';
  return 'REGISTRATION_OPEN';
}

/** "2d 03h 15m" / "03h 15m 08s" / "15m 08s" */
export function formatCountdown(ms: number, withSeconds = true): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');

  if (days > 0) return `${days}d ${pad(hours)}h ${pad(minutes)}m`;
  if (hours > 0) return withSeconds ? `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s` : `${pad(hours)}h ${pad(minutes)}m`;
  return withSeconds ? `${pad(minutes)}m ${pad(seconds)}s` : `${pad(minutes)}m`;
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Devuelve la hora actual y se re-renderiza solo cuando hace falta:
 *  - `fine: true`  -> cada segundo mientras falte menos de 24h para algún límite
 *                     (para cuentas regresivas visibles).
 *  - `fine: false` -> como máximo cada minuto y exactamente en el límite
 *                     (para tarjetas, solo necesitan cambiar de estado a tiempo).
 * Deja de programar timers cuando todos los límites ya pasaron.
 */
export function useNowTick(
  deadlines: Array<string | null | undefined>,
  options: { fine?: boolean } = {}
): number {
  const { fine = false } = options;
  const [now, setNow] = useState<number>(() => Date.now());
  const key = deadlines.join('|');

  useEffect(() => {
    const times = key
      .split('|')
      .map((d) => toMs(d || null))
      .filter((d): d is number => d !== null);

    let timer: ReturnType<typeof setTimeout> | undefined;

    const tick = () => {
      const current = Date.now();
      setNow(current);

      const remaining = times.filter((t) => t > current).map((t) => t - current);
      if (remaining.length === 0) return;

      const nearest = Math.min(...remaining);
      let delay: number;
      if (fine && nearest <= ONE_DAY_MS) {
        delay = 1000;
      } else if (fine) {
        delay = Math.min(nearest - ONE_DAY_MS + 50, 60_000);
      } else {
        delay = Math.min(nearest + 50, 60_000);
      }
      timer = setTimeout(tick, delay);
    };

    tick();
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [key, fine]);

  return now;
}
