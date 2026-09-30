import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    const port = this.config.get<number>('SMTP_PORT', 587);
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      this.logger.log(`SMTP Mailer configurado en ${host}:${port}`);
    } else {
      this.logger.log('SMTP no configurado en .env; los correos se enviarán con entrega en consola/log.');
    }
  }

  /**
   * Sends the 6-digit OTP code with Tecsup Esports branded template.
   */
  async sendOtpEmail(
    email: string,
    code: string,
    firstName: string,
    deviceInfo: string,
    isNewUser: boolean
  ) {
    const subject = isNewUser
      ? `🎉 ¡Bienvenido a Campus Arena Tecsup! Código de activación: ${code}`
      : `🔐 Código de Seguridad Campus Arena Tecsup: ${code}`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #07080B; color: #FFFFFF; margin: 0; padding: 20px; }
    .container { max-width: 580px; margin: 0 auto; background-color: #15161E; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #E63946 0%, #1D3557 100%); padding: 30px 24px; text-align: center; }
    .logo-title { font-size: 24px; font-weight: 900; color: #FFFFFF; margin: 0; letter-spacing: 1px; }
    .subtitle { font-size: 13px; color: #A8DADC; margin-top: 6px; }
    .content { padding: 32px 24px; }
    .greeting { font-size: 18px; font-weight: bold; color: #FFFFFF; margin-bottom: 12px; }
    .text { font-size: 14px; color: #8E92A4; line-height: 1.6; margin-bottom: 24px; }
    .otp-box { background-color: #0B0C10; border: 2px dashed #E63946; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px; }
    .otp-code { font-family: 'Courier New', monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #E63946; }
    .device-info { background-color: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 12px 16px; font-size: 12px; color: #A8DADC; margin-bottom: 24px; }
    .footer { padding: 20px; text-align: center; font-size: 11px; color: #5A5E73; border-top: 1px solid rgba(255,255,255,0.05); }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; background-color: rgba(230,57,70,0.15); color: #E63946; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="logo-title">CAMPUS ARENA TECSUP</h1>
      <p class="subtitle">Plataforma Oficial de Esports Universitarios</p>
    </div>
    <div class="content">
      <span class="badge">${isNewUser ? '🎉 Registro Institucional' : '🛡️ Verificación de Dispositivo'}</span>
      <div class="greeting">¡Hola, ${firstName}!</div>
      
      <p class="text">
        ${
          isNewUser
            ? '¡Te damos la bienvenida a la plataforma oficial de torneos de Tecsup! Hemos creado tu cuenta de competidor institucional. Para confirmar tu dispositivo y completar el acceso, ingresa el siguiente código de seguridad:'
            : 'Se ha solicitado el inicio de sesión en tu cuenta institucional. Para verificar que eres tú y autorizar el acceso en este dispositivo, ingresa el siguiente código de 6 dígitos:'
        }
      </p>

      <div class="otp-box">
        <div style="font-size: 11px; color: #8E92A4; text-transform: uppercase; font-weight: bold; margin-bottom: 8px;">Tu Código de Verificación</div>
        <div class="otp-code">${code}</div>
      </div>

      <div class="device-info">
        <strong>Dispositivo detectado:</strong> ${deviceInfo}<br>
        <strong>Correo destinatario:</strong> ${email}
      </div>

      <p class="text" style="font-size: 12px; margin-bottom: 0;">
        ⏱️ <strong>Importante:</strong> Este código vencerá en <strong>10 minutos</strong> y solo puede ser utilizado una vez. Si tú no solicitaste este código, por favor ignora este mensaje.
      </p>
    </div>
    <div class="footer">
      Tecsup Sede Lima • Esports Engine &copy; 2026 Campus Arena. Todos los derechos reservados.
    </div>
  </div>
</body>
</html>
    `;

    return this.dispatchEmail(email, firstName, subject, htmlContent);
  }

  /**
   * Sends transactional email when an organizer approves a student's payment voucher.
   */
  async sendPaymentApprovedEmail(options: {
    email: string;
    firstName: string;
    tournamentName: string;
    amount: number | string;
    campusName?: string;
    hasSlot: boolean;
    slug?: string;
  }) {
    const { email, firstName, tournamentName, amount, campusName = 'Tecsup Lima', hasSlot, slug = '' } = options;
    const subject = hasSlot
      ? `🎉 ¡Inscripción Confirmada! Torneo "${tournamentName}" - Campus Arena`
      : `⏳ Cupo en Espera: Torneo "${tournamentName}" - Campus Arena`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #07080B; color: #FFFFFF; margin: 0; padding: 20px; }
    .container { max-width: 580px; margin: 0 auto; background-color: #15161E; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #10B981 0%, #1D3557 100%); padding: 30px 24px; text-align: center; }
    .logo-title { font-size: 24px; font-weight: 900; color: #FFFFFF; margin: 0; letter-spacing: 1px; }
    .subtitle { font-size: 13px; color: #A8DADC; margin-top: 6px; }
    .content { padding: 32px 24px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; background-color: rgba(16,185,129,0.15); color: #10B981; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 12px; border: 1px solid rgba(16,185,129,0.3); }
    .greeting { font-size: 18px; font-weight: bold; color: #FFFFFF; margin-bottom: 12px; }
    .text { font-size: 14px; color: #8E92A4; line-height: 1.6; margin-bottom: 20px; }
    .summary-box { background-color: #0B0C10; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; margin-bottom: 24px; }
    .summary-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 13px; }
    .summary-label { color: #8E92A4; }
    .summary-value { color: #FFFFFF; font-weight: bold; }
    .btn { display: inline-block; background-color: #E63946; color: #FFFFFF; text-decoration: none; font-weight: bold; font-size: 13px; padding: 12px 24px; border-radius: 8px; text-align: center; margin-top: 8px; }
    .footer { padding: 20px; text-align: center; font-size: 11px; color: #5A5E73; border-top: 1px solid rgba(255,255,255,0.05); }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="logo-title">CAMPUS ARENA TECSUP</h1>
      <p class="subtitle">Validación Oficial de Participación</p>
    </div>
    <div class="content">
      <span class="badge">${hasSlot ? '✅ Cupo Oficial Confirmado' : '⏳ Lista de Espera'}</span>
      <div class="greeting">¡Hola, ${firstName}!</div>
      <p class="text">
        ${hasSlot 
          ? `Tu comprobante de pago ha sido revisado y verificado por el comité organizador de <strong>${campusName}</strong>. Tu inscripción en <strong>${tournamentName}</strong> está 100% confirmada.`
          : `Tu comprobante para <strong>${tournamentName}</strong> fue verificado. El torneo ha alcanzado el límite de cupos directos y has quedado registrado con prioridad en la <strong>lista de espera</strong>.`}
      </p>
      <div class="summary-box">
        <div class="summary-row"><span class="summary-label">Torneo:</span><span class="summary-value">${tournamentName}</span></div>
        <div class="summary-row"><span class="summary-label">Monto Verificado:</span><span class="summary-value">S/ ${amount} PEN</span></div>
        <div class="summary-row"><span class="summary-label">Sede:</span><span class="summary-value">${campusName}</span></div>
        <div class="summary-row" style="border: none;"><span class="summary-label">Estado:</span><span class="summary-value" style="color: ${hasSlot ? '#10B981' : '#F59E0B'};">${hasSlot ? 'Confirmado' : 'En Espera'}</span></div>
      </div>
      <div style="text-align: center;">
        <a href="https://campusarena.tecsup.edu.pe/tournaments/${slug}" class="btn">Ver Mi Torneo y Llaves &rarr;</a>
      </div>
    </div>
    <div class="footer">
      Tecsup Sede Lima • Plataforma Oficial de Esports &copy; 2026 Campus Arena.
    </div>
  </div>
</body>
</html>
    `;

    return this.dispatchEmail(email, firstName, subject, htmlContent);
  }

  /**
   * Sends transactional email notifying a player that their match is ready.
   */
  async sendMatchReadyEmail(options: {
    email: string;
    firstName: string;
    tournamentName: string;
    roundName: string;
    opponentName: string;
    matchPosition: number;
    slug: string;
  }) {
    const { email, firstName, tournamentName, roundName, opponentName, matchPosition, slug } = options;
    const subject = `⚔️ ¡Tu partida está lista! ${roundName} vs ${opponentName} - Campus Arena`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #07080B; color: #FFFFFF; margin: 0; padding: 20px; }
    .container { max-width: 580px; margin: 0 auto; background-color: #15161E; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #E63946 0%, #1D3557 100%); padding: 30px 24px; text-align: center; }
    .logo-title { font-size: 24px; font-weight: 900; color: #FFFFFF; margin: 0; }
    .content { padding: 32px 24px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; background-color: rgba(230,57,70,0.15); color: #E63946; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 12px; }
    .greeting { font-size: 18px; font-weight: bold; color: #FFFFFF; margin-bottom: 12px; }
    .text { font-size: 14px; color: #8E92A4; line-height: 1.6; margin-bottom: 20px; }
    .match-box { background-color: #0B0C10; border: 2px dashed #E63946; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px; }
    .vs-text { font-size: 18px; font-weight: 900; color: #FFFFFF; }
    .btn { display: inline-block; background-color: #E63946; color: #FFFFFF; text-decoration: none; font-weight: bold; font-size: 13px; padding: 12px 24px; border-radius: 8px; }
    .footer { padding: 20px; text-align: center; font-size: 11px; color: #5A5E73; border-top: 1px solid rgba(255,255,255,0.05); }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="logo-title">CAMPUS ARENA TECSUP</h1>
    </div>
    <div class="content">
      <span class="badge">⚔️ Llamado a Partida Oficial</span>
      <div class="greeting">¡Prepárate, ${firstName}!</div>
      <p class="text">
        Se ha habilitado tu enfrentamiento en <strong>${tournamentName}</strong>. Preséntate con tu oponente y sigue las instrucciones de la sala oficial.
      </p>
      <div class="match-box">
        <div style="font-size: 11px; color: #8E92A4; text-transform: uppercase; margin-bottom: 8px;">${roundName} • Match #${matchPosition}</div>
        <div class="vs-text">${firstName} <span style="color: #E63946;">VS</span> ${opponentName}</div>
      </div>
      <div style="text-align: center;">
        <a href="https://campusarena.tecsup.edu.pe/tournaments/${slug}#bracket" class="btn">Entrar a la Sala / Ver Bracket &rarr;</a>
      </div>
    </div>
    <div class="footer">
      Tecsup Sede Lima • Plataforma Oficial de Esports &copy; 2026 Campus Arena.
    </div>
  </div>
</body>
</html>
    `;

    return this.dispatchEmail(email, firstName, subject, htmlContent);
  }

  /**
   * Internal dispatcher supporting Brevo REST API, Nodemailer SMTP, and console logging.
   */
  private async dispatchEmail(email: string, firstName: string, subject: string, htmlContent: string) {
    this.logger.log(`\n======================================================\n📨 [ENVÍO DE CORREO INSTITUCIONAL]\nDestinatario: ${email}\nAsunto: ${subject}\n======================================================\n`);

    const brevoApiKey = this.config.get<string>('BREVO_API_KEY');
    const senderEmail = this.config.get<string>('SMTP_FROM') || 'luis.galvan@tecsup.edu.pe';
    let sentSuccessfully = false;

    // 1. Try Brevo REST API first (fast and reliable over HTTPS)
    if (brevoApiKey) {
      try {
        const brevoPayload = {
          sender: { name: 'Campus Arena Tecsup', email: senderEmail },
          to: [{ email, name: firstName }],
          subject,
          htmlContent,
        };

        const res = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': brevoApiKey,
            'content-type': 'application/json',
          },
          body: JSON.stringify(brevoPayload),
        });

        const data = await res.json();
        if (res.ok) {
          this.logger.log(`✅ [Brevo API] Correo enviado exitosamente a ${email} (MessageId: ${data.messageId})`);
          sentSuccessfully = true;
        } else {
          this.logger.warn(`⚠️ [Brevo API Error]: ${JSON.stringify(data)}`);
        }
      } catch (err: any) {
        this.logger.error(`Error al enviar por Brevo REST API:`, err.message);
      }
    }

    // 2. Fallback to Nodemailer SMTP
    if (!sentSuccessfully && this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from: `"Campus Arena Tecsup" <${senderEmail}>`,
          to: email,
          subject,
          html: htmlContent,
        });
        this.logger.log(`✅ [SMTP] Correo enviado exitosamente a ${email} (MessageId: ${info.messageId})`);
      } catch (err: any) {
        this.logger.error(`Error al enviar correo vía SMTP a ${email}:`, err.message);
      }
    }
  }
}
