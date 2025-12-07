import { Controller, Get, Put, Body, UseGuards, Query, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { TiendasService } from './tiendas.service';
import { ConfigurarRegaloBienvenidaDto } from './dto/configurar-regalo-bienvenida.dto';
import { ConfigurarIADto } from './dto/configurar-ia.dto';
import { ConfigurarInfoTiendaDto } from './dto/configurar-info-tienda.dto';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { CurrentTienda } from '../auth/decorators/current-tienda.decorator';

@ApiTags('Tiendas - Configuración')
@ApiBearerAuth('JWT')
@Controller('tiendas')
@UseGuards(AdminAuthGuard)
export class TiendasController {
  constructor(private readonly tiendasService: TiendasService) { }

  @Get('branding')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Obtener configuración de branding de la tienda' })
  @ApiResponse({ status: 200, description: 'Branding obtenido' })
  getBranding(@CurrentTienda() tiendaId: string) {
    return this.tiendasService.getBranding(tiendaId);
  }

  @Put('config/branding')
  @ApiOperation({ summary: 'Actualizar configuración de branding de la tienda' })
  @ApiResponse({ status: 200, description: 'Branding actualizado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  updateBranding(
    @CurrentTienda() tiendaId: string,
    @Body() dto: { nombre_comercial?: string; color_primario?: string; color_secundario?: string; color_acento?: string; logo_url?: string },
  ) {
    return this.tiendasService.updateBranding(tiendaId, dto);
  }

  @Put('config/regalo-bienvenida')
  @ApiOperation({ summary: 'Configurar sistema de regalos de bienvenida' })
  @ApiResponse({ status: 200, description: 'Configuración actualizada' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  configurarRegaloBienvenida(
    @CurrentTienda() tiendaId: string,
    @Body() dto: ConfigurarRegaloBienvenidaDto,
  ) {
    return this.tiendasService.configurarRegaloBienvenida(tiendaId, dto);
  }

  @Get('config/regalo-bienvenida')
  @ApiOperation({ summary: 'Obtener configuración de regalos de bienvenida' })
  @ApiResponse({ status: 200, description: 'Configuración obtenida', type: ConfigurarRegaloBienvenidaDto })
  getConfiguracionRegaloBienvenida(@CurrentTienda() tiendaId: string) {
    return this.tiendasService.getConfiguracionRegaloBienvenida(tiendaId);
  }

  @Get('regalos-bienvenida/estadisticas')
  @ApiOperation({ summary: 'Obtener estadísticas de regalos otorgados' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas' })
  getEstadisticasRegalos(@CurrentTienda() tiendaId: string) {
    return this.tiendasService.getEstadisticasRegalos(tiendaId);
  }

  @Get('regalos-bienvenida/historial')
  @ApiOperation({ summary: 'Listar historial de regalos otorgados' })
  @ApiResponse({ status: 200, description: 'Historial obtenido' })
  listarRegalosOtorgados(
    @CurrentTienda() tiendaId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.tiendasService.listarRegalosOtorgados(
      tiendaId,
      limit ? parseInt(limit.toString()) : 50,
      offset ? parseInt(offset.toString()) : 0,
    );
  }

  @Put('config/ia')
  @ApiOperation({ summary: 'Configurar contexto de IA para generación de contenido' })
  @ApiResponse({ status: 200, description: 'Configuración actualizada' })
  configurarIA(
    @CurrentTienda() tiendaId: string,
    @Body() dto: ConfigurarIADto,
  ) {
    return this.tiendasService.configurarIA(tiendaId, dto);
  }

  @Get('config/ia')
  @ApiOperation({ summary: 'Obtener configuración de IA' })
  @ApiResponse({ status: 200, description: 'Configuración obtenida', type: ConfigurarIADto })
  getConfiguracionIA(@CurrentTienda() tiendaId: string) {
    return this.tiendasService.getConfiguracionIA(tiendaId);
  }

  @Put('config/info')
  @ApiOperation({ summary: 'Configurar información de la tienda (horarios, contacto, redes)' })
  @ApiResponse({ status: 200, description: 'Información actualizada' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  configurarInfoTienda(
    @CurrentTienda() tiendaId: string,
    @Body() dto: ConfigurarInfoTiendaDto,
  ) {
    return this.tiendasService.configurarInfoTienda(tiendaId, dto);
  }

  @Get('info')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Obtener información completa de la tienda (incluye estado abierto/cerrado)' })
  @ApiResponse({ status: 200, description: 'Información obtenida', type: ConfigurarInfoTiendaDto })
  getInfoTienda(@CurrentTienda() tiendaId: string) {
    return this.tiendasService.getInfoTienda(tiendaId);
  }
}
