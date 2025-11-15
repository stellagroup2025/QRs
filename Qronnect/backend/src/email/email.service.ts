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
}
