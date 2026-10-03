import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SmsService } from '../sms.service';
import { validateRequest } from 'twilio';

/**
 * Verifica la cabecera X-Twilio-Signature de los webhooks de Twilio
 *
 * Sin esta comprobación cualquiera podría llamar a los webhooks públicos y, por ejemplo,
 * dar de baja de SMS a cualquier número de teléfono.
 *
 * La firma se calcula con el auth token de la cuenta que envía el webhook (AccountSid):
 * la cuenta global de Qronnect o la cuenta propia de una tienda.
 *
 * La URL firmada es la URL pública a la que llama Twilio. Si el backend está detrás de
 * un proxy que la reescribe, configura PUBLIC_BACKEND_URL con el origen público, sin /api
 * (ej: https://qronnect-backend.onrender.com).
 */
@Injectable()
export class TwilioSignatureGuard implements CanActivate {
  constructor(
    private readonly config: ConfigService,
    private readonly smsService: SmsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const signature = request.headers['x-twilio-signature'];
    if (!signature || typeof signature !== 'string') {
      throw new ForbiddenException('Firma de Twilio ausente');
    }

    const params = request.body ?? {};
    const authToken = await this.smsService.getAuthTokenForAccount(params.AccountSid);
    if (!authToken) {
      throw new ForbiddenException('Cuenta de Twilio desconocida');
    }

    const publicBackendUrl = this.config.get<string>('PUBLIC_BACKEND_URL')?.replace(/\/+$/, '');
    const baseUrl = publicBackendUrl || `${request.protocol}://${request.get('host')}`;
    const url = `${baseUrl}${request.originalUrl}`;

    if (!validateRequest(authToken, signature, url, params)) {
      throw new ForbiddenException('Firma de Twilio inválida');
    }

    return true;
  }
}
