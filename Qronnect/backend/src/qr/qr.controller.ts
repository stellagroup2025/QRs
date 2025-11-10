import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { QrService } from './qr.service';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Tenant } from '../tenant/decorators/tenant.decorator';
import { AuthUser } from '../auth/entities/auth-user.entity';
import { QrResponseDto } from './dto/qr-response.dto';

/**
 * Controlador de endpoints para gestión de códigos QR de clientes
 */
@ApiTags('QR')
@ApiBearerAuth('JWT')
@UseGuards(SupabaseAuthGuard)
@Controller('clientes/me')
export class QrController {
  constructor(private readonly qrService: QrService) {}

  /**
   * GET /api/clientes/me/qr
   * Obtiene el código QR del cliente autenticado para la tienda actual
   * Si no existe, lo genera automáticamente
   */
  @Get('qr')
  @ApiOperation({
    summary: 'Obtener código QR del cliente',
    description:
      'Devuelve el código QR único del cliente para la tienda actual. ' +
      'Si no existe, lo genera automáticamente. MULTITENANCY: Cada tienda tiene su propio QR.',
  })
  @ApiResponse({ status: 200, description: 'Código QR del cliente', type: QrResponseDto })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado en esta tienda' })
  async getQr(
    @CurrentUser() user: AuthUser,
    @Tenant('id') tenantId: string,
  ): Promise<QrResponseDto> {
    return this.qrService.getOrCreateQr(user.id, tenantId);
  }
}
