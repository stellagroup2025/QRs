import { Controller, Get, Param, Res, Headers, Ip } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { QrRedirectService, RedirectInfo } from './qr-redirect.service';

@ApiTags('QR Redirect - Redirección de QR Codes Genéricos')
@Controller('q')
export class QrRedirectController {
  constructor(private readonly qrRedirectService: QrRedirectService) {}

  @Get(':hash')
  @ApiOperation({
    summary: 'Redirige un QR code genérico a su destino asignado',
    description: `
      Endpoint público para redirección de QR codes pre-impresos.

      Flujo:
      1. Cliente escanea QR con URL: qronnect.es/q/{hash}
      2. Sistema busca el hash en la base de datos
      3. Si está asignado a una tienda → Redirige a {slug}.qronnect.es
      4. Si no está asignado → Redirige a qronnect.es (landing)
      5. Registra el escaneo en analytics
    `,
  })
  @ApiParam({
    name: 'hash',
    description: 'Hash único del QR code (10 caracteres alfanuméricos)',
    example: 'abc123XYZ9',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirección exitosa a la tienda o landing',
  })
  @ApiResponse({
    status: 404,
    description: 'QR code no encontrado',
  })
  async redirectQr(
    @Param('hash') hash: string,
    @Res() res: Response,
    @Headers('user-agent') userAgent: string,
    @Headers('referer') referer: string,
    @Headers('authorization') authorization: string,
    @Ip() ip: string,
  ) {
    try {
      // Obtener destino del QR
      const redirectInfo = await this.qrRedirectService.obtenerRedireccion(hash);

      // Si el QR NO está asignado (url_destino es qronnect.es)
      if (redirectInfo.url_destino === 'https://qronnect.es') {
        // Verificar si hay token de superadmin
        const isSuperAdmin = await this.checkSuperAdminToken(authorization);

        if (isSuperAdmin) {
          // Redirigir a página de asignación rápida
          return res.redirect(302, `https://www.qronnect.es/superadmin/asignar-qr?hash=${hash}`);
        }
      }

      // Registrar escaneo en analytics
      await this.qrRedirectService.registrarEscaneo({
        idQr: redirectInfo.id_qr,
        idTienda: redirectInfo.id_tienda,
        userAgent,
        referer,
        ip,
        urlDestino: redirectInfo.url_destino,
      });

      // Redirigir
      return res.redirect(302, redirectInfo.url_destino);
    } catch (error) {
      // Si el QR no existe, redirigir a landing
      return res.redirect(302, 'https://qronnect.es');
    }
  }

  // Método auxiliar para verificar token de superadmin
  private async checkSuperAdminToken(authHeader: string): Promise<boolean> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }

    try {
      const token = authHeader.substring(7);
      // Intentar decodificar como token de desarrollo
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
      return decoded.role === 'superadmin';
    } catch {
      return false;
    }
  }

  @Get(':hash/info')
  @ApiOperation({
    summary: 'Obtener información del QR sin redirigir (para debugging)',
  })
  @ApiResponse({
    status: 200,
    description: 'Información del QR code',
  })
  async getQrInfo(@Param('hash') hash: string): Promise<RedirectInfo> {
    return this.qrRedirectService.obtenerRedireccion(hash);
  }
}
