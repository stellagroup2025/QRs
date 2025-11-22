import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExcludeEndpoint } from '@nestjs/swagger';
import { SmsService } from './sms.service';

/**
 * Controlador de webhooks de SMS (Twilio)
 * Estos endpoints son públicos y llamados por Twilio cuando hay respuestas de clientes
 */
@ApiTags('SMS Webhooks')
@Controller('sms/webhook')
export class SmsWebhookController {
  constructor(private readonly smsService: SmsService) {}

  /**
   * POST /api/sms/webhook/inbound
   * Webhook de Twilio para mensajes entrantes (respuestas de clientes)
   * Procesa respuestas STOP para dar de baja automáticamente
   */
  @Post('inbound')
  @ApiOperation({
    summary: 'Webhook para mensajes SMS entrantes (Twilio)',
    description:
      'Endpoint llamado por Twilio cuando un cliente responde a un SMS. ' +
      'Procesa automáticamente respuestas STOP, UNSUBSCRIBE, CANCEL, BAJA para dar de baja al cliente de SMS de marketing.',
  })
  @ApiResponse({
    status: 200,
    description: 'Mensaje procesado correctamente',
    schema: {
      type: 'object',
      properties: {
        mensaje: { type: 'string', example: 'Se dieron de baja 1 cliente(s) exitosamente' },
        procesado: { type: 'boolean', example: true },
      },
    },
  })
  @ApiExcludeEndpoint() // No mostrar en Swagger público (es un webhook interno)
  async handleInboundSms(
    @Body()
    twilioPayload: {
      From: string; // Número del cliente (formato E.164)
      To: string; // Número de destino (nuestra cuenta Twilio)
      Body: string; // Mensaje recibido
      MessageSid: string; // ID del mensaje en Twilio
      AccountSid?: string;
      NumMedia?: string;
    },
  ) {
    console.log('\n📨 [WEBHOOK TWILIO] Mensaje entrante recibido');
    console.log(`  - From: ${twilioPayload.From}`);
    console.log(`  - To: ${twilioPayload.To}`);
    console.log(`  - Body: ${twilioPayload.Body}`);
    console.log(`  - MessageSid: ${twilioPayload.MessageSid}`);

    // Procesar mensaje STOP
    const result = await this.smsService.procesarStopSms({
      From: twilioPayload.From,
      Body: twilioPayload.Body,
      MessageSid: twilioPayload.MessageSid,
    });

    console.log(`  - Resultado: ${result.mensaje}`);

    // Twilio espera una respuesta XML (TwiML) o un status 200
    // Si devolvemos JSON, Twilio lo acepta igualmente
    return result;
  }

  /**
   * POST /api/sms/webhook/status
   * Webhook de Twilio para actualizaciones de estado de mensajes
   * Útil para tracking de entregas, errores, etc.
   */
  @Post('status')
  @ApiOperation({
    summary: 'Webhook para actualizaciones de estado de SMS (Twilio)',
    description:
      'Endpoint llamado por Twilio para notificar cambios de estado de mensajes enviados ' +
      '(entregado, fallido, etc.). Útil para tracking y estadísticas.',
  })
  @ApiExcludeEndpoint()
  async handleStatusCallback(
    @Body()
    twilioPayload: {
      MessageSid: string;
      MessageStatus: string; // queued, sent, delivered, failed, etc.
      To: string;
      From: string;
      ErrorCode?: string;
      ErrorMessage?: string;
    },
  ) {
    console.log('\n📊 [WEBHOOK TWILIO] Actualización de estado');
    console.log(`  - MessageSid: ${twilioPayload.MessageSid}`);
    console.log(`  - Status: ${twilioPayload.MessageStatus}`);
    console.log(`  - To: ${twilioPayload.To}`);

    if (twilioPayload.ErrorCode) {
      console.error(`  ❌ Error: ${twilioPayload.ErrorCode} - ${twilioPayload.ErrorMessage}`);
    }

    // TODO: Aquí puedes actualizar la tabla sms_enviados con el estado real
    // Por ahora solo logueamos

    return {
      mensaje: 'Estado recibido',
      status: twilioPayload.MessageStatus,
    };
  }
}
