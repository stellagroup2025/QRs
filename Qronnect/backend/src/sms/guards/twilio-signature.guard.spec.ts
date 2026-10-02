import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { TwilioSignatureGuard } from './twilio-signature.guard';
import { getExpectedTwilioSignature } from 'twilio/lib/webhooks/webhooks';

describe('TwilioSignatureGuard', () => {
  const authToken = 'test-auth-token';
  const body = { AccountSid: 'AC123', From: '+34600000000', Body: 'STOP', MessageSid: 'SM1' };
  const path = '/api/sms/webhook/inbound';
  const publicUrl = 'https://backend.example.com';

  const buildGuard = (
    token: string | null = authToken,
    publicBackendUrl: string | null = publicUrl,
  ) => {
    const config = { get: jest.fn().mockReturnValue(publicBackendUrl ?? undefined) };
    const smsService = { getAuthTokenForAccount: jest.fn().mockResolvedValue(token) };
    return new TwilioSignatureGuard(config as any, smsService as any);
  };

  const buildContext = (
    signature: string | undefined,
    requestBody: Record<string, string> = body,
  ) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          headers: signature ? { 'x-twilio-signature': signature } : {},
          body: requestBody,
          originalUrl: path,
          protocol: 'http',
          get: () => 'internal-host:3001',
        }),
      }),
    }) as unknown as ExecutionContext;

  const sign = (url: string, params: Record<string, string>) =>
    getExpectedTwilioSignature(authToken, url, params);

  it('acepta una firma válida', async () => {
    const signature = sign(`${publicUrl}${path}`, body);
    await expect(buildGuard().canActivate(buildContext(signature))).resolves.toBe(true);
  });

  it('rechaza peticiones sin firma', async () => {
    await expect(buildGuard().canActivate(buildContext(undefined))).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('rechaza una firma de un cuerpo manipulado', async () => {
    const signature = sign(`${publicUrl}${path}`, body);
    const tampered = { ...body, From: '+34611111111' };
    await expect(buildGuard().canActivate(buildContext(signature, tampered))).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('rechaza cuentas de Twilio desconocidas', async () => {
    const signature = sign(`${publicUrl}${path}`, body);
    await expect(buildGuard(null).canActivate(buildContext(signature))).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('usa el host de la petición si no hay PUBLIC_BACKEND_URL', async () => {
    const signature = sign(`http://internal-host:3001${path}`, body);
    await expect(buildGuard(authToken, null).canActivate(buildContext(signature))).resolves.toBe(
      true,
    );
  });
});
