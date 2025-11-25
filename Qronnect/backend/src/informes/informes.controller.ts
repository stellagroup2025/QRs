import { Controller, Post, Get, Put, Body, UseGuards, Param, Query } from '@nestjs/common';
import { InformesService } from './informes.service';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { Tenant } from '../tenant/decorators/tenant.decorator';
import { GenerarInformeDto } from './dto/generar-informe.dto';
import { EnviarInformeDto } from './dto/enviar-informe.dto';
import { ConfiguracionInformeDto } from './dto/configuracion-informe.dto';

/**
 * Controller de Informes Mensuales
 *
 * Endpoints protegidos con AdminAuthGuard para que solo admins de tienda puedan:
 * - Generar informes
 * - Ver configuración
 * - Actualizar configuración de envíos automáticos
 */
@Controller('api/admin/informes')
@UseGuards(AdminAuthGuard)
export class InformesController {
  constructor(private readonly informesService: InformesService) {}

  /**
   * POST /api/admin/informes/generar
   * Genera un informe mensual para la tienda
   */
  @Post('generar')
  async generarInforme(@Tenant() tiendaId: string, @Body() dto: GenerarInformeDto) {
    return this.informesService.generarInforme(tiendaId, dto);
  }

  /**
   * POST /api/admin/informes/enviar
   * Envía un informe por email
   */
  @Post('enviar')
  async enviarInforme(@Tenant() tiendaId: string, @Body() dto: EnviarInformeDto) {
    return this.informesService.enviarInforme(tiendaId, dto);
  }

  /**
   * GET /api/admin/informes
   * Lista los informes generados para la tienda
   */
  @Get()
  async listarInformes(@Tenant() tiendaId: string, @Query('limite') limite?: number) {
    return this.informesService.listarInformes(tiendaId, limite ? parseInt(limite.toString()) : 12);
  }

  /**
   * GET /api/admin/informes/configuracion
   * Obtiene la configuración de envíos automáticos
   */
  @Get('configuracion')
  async obtenerConfiguracion(@Tenant() tiendaId: string) {
    return this.informesService.obtenerConfiguracion(tiendaId);
  }

  /**
   * PUT /api/admin/informes/configuracion
   * Actualiza la configuración de envíos automáticos
   */
  @Put('configuracion')
  async configurarEnvioAutomatico(@Tenant() tiendaId: string, @Body() dto: ConfiguracionInformeDto) {
    return this.informesService.configurarEnvioAutomatico(tiendaId, dto);
  }
}
