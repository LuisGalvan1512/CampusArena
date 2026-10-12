/**
 * Registration window helpers.
 *
 * El estado guardado en BD (`status`) lo cambia el organizador a mano, pero las
 * fechas `registration_open_at` / `registration_close_at` mandan sobre la
 * disponibilidad real de las inscripciones. Estas utilidades derivan el estado
 * efectivo sin escribir en la base de datos (no requieren cron ni scheduler):
 *
 *  - PUBLISHED / REGISTRATION_OPEN antes de la apertura  -> PUBLISHED (próximamente)
 *  - PUBLISHED / REGISTRATION_OPEN dentro de la ventana  -> REGISTRATION_OPEN
 *  - PUBLISHED / REGISTRATION_OPEN después del cierre    -> REGISTRATION_CLOSED
 *  - Cualquier otro estado (DRAFT, CLOSED manual, IN_PROGRESS...) se respeta tal cual.
 */

export interface RegistrationWindowInput {
  status: string;
  registration_open_at: Date;
  registration_close_at: Date;
}

const WINDOW_MANAGED_STATUSES = ['PUBLISHED', 'REGISTRATION_OPEN'];

export function getEffectiveStatus(
  tournament: RegistrationWindowInput,
  now: Date = new Date(),
): string {
  if (!WINDOW_MANAGED_STATUSES.includes(tournament.status)) {
    return tournament.status;
  }

  const current = now.getTime();
  if (current < tournament.registration_open_at.getTime()) return 'PUBLISHED';
  if (current <= tournament.registration_close_at.getTime()) return 'REGISTRATION_OPEN';
  return 'REGISTRATION_CLOSED';
}

/** Formatea una fecha en hora de Lima, p. ej. "12 de octubre, 05:00 a. m." */
export function formatLimaDateTime(date: Date): string {
  return date.toLocaleString('es-PE', {
    timeZone: 'America/Lima',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}
