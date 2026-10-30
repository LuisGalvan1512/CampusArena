/**
 * WhatsApp & Yape/Plin Checkout / Registration Coordination Helper
 * Implements Playbook Section 11.1 (Zero-commission WhatsApp order & Yape/Plin validation).
 */

export const OFFICIAL_TOURNAMENT_WHATSAPP_PHONE = '994058442'; // Luis Enrique Galvan Morales (Organización Campus Arena)

export interface OrderItem {
  qty: number;
  name: string;
  price: number;
}

export interface WhatsAppOrderPayload {
  clientName: string;
  items: OrderItem[];
  total: number;
  paymentMethod?: string;
}

/**
 * Standard structured order helper (Playbook Section 11.1)
 */
export function sendOrderToWhatsApp(
  phone: string,
  order: WhatsAppOrderPayload
): void {
  const cleanPhone = phone.replace(/\D/g, '');
  const fullPhone = cleanPhone.startsWith('51') ? cleanPhone : `51${cleanPhone}`;

  const text = `Hola, quiero confirmar mi pedido:
*Cliente:* ${order.clientName}
*Detalle:*
${order.items.map((i) => `- ${i.qty}x ${i.name} (S/. ${i.price.toFixed(2)})`).join('\n')}
*Total a pagar:* S/. ${order.total.toFixed(2)}
*Método de pago:* ${order.paymentMethod || 'Yape / Plin'} (Adjunto comprobante a continuación)`;

  const url = `https://wa.me/${fullPhone}?text=${encodeURIComponent(text)}`;
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

export interface TournamentWhatsAppPayload {
  tournamentName: string;
  competitorName: string;
  competitorEmail?: string;
  isTeamBased?: boolean;
  teamName?: string;
  entryFee: number;
  paymentReference?: string;
  paymentMethod?: string;
  phone?: string;
}

/**
 * Campus Arena specific helper for validating Yape/Plin tournament entry fees
 * or confirming registration directly with the tournament organizing committee.
 */
export function sendTournamentRegistrationToWhatsApp(
  payload: TournamentWhatsAppPayload
): void {
  const rawPhone = payload.phone || OFFICIAL_TOURNAMENT_WHATSAPP_PHONE;
  const cleanPhone = rawPhone.replace(/\D/g, '');
  const fullPhone = cleanPhone.startsWith('51') ? cleanPhone : `51${cleanPhone}`;

  const lines = [
    'Hola *Campus Arena Tecsup*, quiero validar mi inscripción oficial:',
    `*Torneo:* ${payload.tournamentName}`,
    `*Competidor / Capitán:* ${payload.competitorName}${payload.competitorEmail ? ` (${payload.competitorEmail})` : ''}`,
  ];

  if (payload.isTeamBased && payload.teamName) {
    lines.push(`*Escuadra:* ${payload.teamName}`);
  }

  lines.push(
    `*Monto de Inscripción:* ${payload.entryFee > 0 ? `S/. ${payload.entryFee.toFixed(2)}` : 'GRATIS (S/. 0.00)'}`
  );

  if (payload.entryFee > 0) {
    lines.push(`*Método de pago:* ${payload.paymentMethod || 'Yape / Plin'}`);
    if (payload.paymentReference) {
      lines.push(`*N° Operación / Referencia:* ${payload.paymentReference}`);
    }
    lines.push('_(Adjunto captura de comprobante Yape/Plin para validación inmediata)_');
  }

  const url = `https://wa.me/${fullPhone}?text=${encodeURIComponent(lines.join('\n'))}`;
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

