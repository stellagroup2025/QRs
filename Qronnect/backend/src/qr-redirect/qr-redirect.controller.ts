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

      // Registrar escaneo en analytics
      await this.qrRedirectService.registrarEscaneo({
        idQr: redirectInfo.id_qr,
        idTienda: redirectInfo.id_tienda,
        userAgent,
        referer,
        ip,
        urlDestino: redirectInfo.url_destino,
      });

      // Siempre redirigir a la página intermedia del frontend
      // El frontend se encargará de verificar si es superadmin (localStorage)
      // y redirigir al destino apropiado
      return res.redirect(302, `https://www.qronnect.es/qr/${hash}`);
    } catch (error) {
      // Si el QR no existe, redirigir a página intermedia que mostrará error
      return res.redirect(302, `https://www.qronnect.es/qr/${hash}`);
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
