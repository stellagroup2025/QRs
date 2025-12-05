import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      this.logger.warn('⚠️  RESEND_API_KEY not configured. Email sending will be disabled.');
      this.resend = null;
    } else {
      this.resend = new Resend(apiKey);
      this.logger.log('✅ Resend email service initialized');
    }
  }

  /**
   * Envía un email usando Resend
   */
  async sendEmail(params: {
    to: string | string[];
    subject: string;
    html: string;
    from?: string;
    replyTo?: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.resend) {
      this.logger.warn('Email sending skipped - Resend not configured');
      return {
        success: false,
        error: 'Email service not configured. Set RESEND_API_KEY environment variable.',
      };
    }

    try {
      const from = params.from || process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

      this.logger.log(`Sending email to: ${JSON.stringify(params.to)}`);

      const { data, error } = await this.resend.emails.send({
        from,
        to: params.to,
        subject: params.subject,
        html: params.html,
        replyTo: params.replyTo,
      });

      if (error) {
        this.logger.error('Error sending email:', error);
        return {
          success: false,
          error: error.message || 'Unknown error',
        };
      }

      this.logger.log(`Email sent successfully. ID: ${data.id}`);
      return {
        success: true,
        messageId: data.id,
      };
    } catch (error) {
      this.logger.error('Exception sending email:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Envía un email a múltiples destinatarios (envío masivo)
   * Resend permite hasta 100 destinatarios por llamada
   */
  async sendBulkEmails(params: {
    recipients: Array<{ email: string; name: string }>;
    subject: string;
    html: string;
    from?: string;
    batchSize?: number;
  }): Promise<{
    success: boolean;
    sent: number;
    failed: number;
    errors: Array<{ email: string; error: string }>;
  }> {
    if (!this.resend) {
      this.logger.warn('Bulk email sending skipped - Resend not configured');
      return {
        success: false,
        sent: 0,
        failed: params.recipients.length,
        errors: params.recipients.map((r) => ({
          email: r.email,
          error: 'Email service not configured',
        })),
      };
    }

    const batchSize = params.batchSize || 100; // Resend límite por llamada
    const errors: Array<{ email: string; error: string }> = [];
    let sent = 0;

    // Dividir en lotes
    for (let i = 0; i < params.recipients.length; i += batchSize) {
      const batch = params.recipients.slice(i, i + batchSize);

      this.logger.log(`Sending batch ${Math.floor(i / batchSize) + 1} (${batch.length} emails)`);

      // Enviar cada email del lote
      for (const recipient of batch) {
        const htmlPersonalizado = params.html.replace(/\{\{nombre\}\}/g, recipient.name);

        const result = await this.sendEmail({
          to: recipient.email,
          subject: params.subject,
          html: htmlPersonalizado,
          from: params.from,
        });

        if (result.success) {
          sent++;
        } else {
          errors.push({
            email: recipient.email,
            error: result.error,
          });
        }

        // Pequeña pausa entre emails para no saturar la API
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    const failed = params.recipients.length - sent;

    this.logger.log(`Bulk email completed: ${sent} sent, ${failed} failed`);

    return {
      success: failed === 0,
      sent,
      failed,
      errors,
    };
  }

  /**
   * Envía email de agradecimiento después de una compra
   */
  async sendPurchaseThankYouEmail(params: {
    clienteEmail: string;
    clienteNombre: string;
    tiendaNombre: string;
    importeCompra: number;
    puntosGanados: number;
    sellosGanados?: number;
    programaSelloNombre?: string;
    sellosActuales?: number;
    sellosObjetivo?: number;
  }): Promise<{ success: boolean; error?: string }> {
    const {
      clienteEmail,
      clienteNombre,
      tiendaNombre,
      importeCompra,
      puntosGanados,
      sellosGanados,
      programaSelloNombre,
      sellosActuales,
      sellosObjetivo,
    } = params;

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>¡Gracias por tu compra!</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                ¡Gracias por tu compra!
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Hola <strong>${clienteNombre}</strong>,
              </p>

              <p style="margin: 0 0 30px; color: #666666; font-size: 16px; line-height: 1.6;">
                Queremos agradecerte por tu visita a <strong>${tiendaNombre}</strong>. Tu compra de <strong>${importeCompra.toFixed(2)}€</strong> ha sido registrada exitosamente.
              </p>

              <!-- Rewards Box -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f8f9fa; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 15px; color: #333333; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                      🎁 Recompensas obtenidas
                    </p>

                    <div style="margin-bottom: 12px;">
                      <span style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600;">
                        +${puntosGanados} puntos
                      </span>
                    </div>

                    ${sellosGanados && programaSelloNombre ? `
                    <div style="margin-top: 12px;">
                      <span style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600;">
                        +${sellosGanados} sello${sellosGanados > 1 ? 's' : ''} en "${programaSelloNombre}"
                      </span>
                    </div>
                    ${sellosActuales !== undefined && sellosObjetivo ? `
                    <p style="margin: 12px 0 0; color: #666666; font-size: 13px;">
                      Llevas <strong>${sellosActuales} de ${sellosObjetivo} sellos</strong>
                    </p>
                    ` : ''}
                    ` : ''}
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 20px; color: #666666; font-size: 14px; line-height: 1.6;">
                Sigue acumulando puntos${sellosGanados ? ' y sellos' : ''} en cada visita para obtener recompensas exclusivas.
              </p>

              <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6;">
                ¡Te esperamos pronto en ${tiendaNombre}!
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #999999; font-size: 12px; line-height: 1.5;">
                Este es un correo automático, por favor no respondas a este mensaje.
              </p>
              <p style="margin: 10px 0 0; color: #999999; font-size: 12px;">
                ${tiendaNombre} • Sistema de fidelización
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    return this.sendEmail({
      to: clienteEmail,
      subject: `¡Gracias por tu compra en ${tiendaNombre}! 🎉`,
      html,
    });
  }
}
