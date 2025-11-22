import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { OnboardingService } from './onboarding.service';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { Tenant } from '../tenant/decorators/tenant.decorator';
import { ActualizarProgresoDto } from './dto/actualizar-progreso.dto';
import { OmitirPasoDto } from './dto/omitir-paso.dto';
import { ProgresoResponseDto } from './dto/progreso-response.dto';
import { PlantillaResponseDto } from './dto/plantilla-response.dto';

@ApiTags('Onboarding')
@Controller('onboarding')
export class OnboardingController {
  private readonly logger = new Logger(OnboardingController.name);

  constructor(private readonly onboardingService: OnboardingService) {}

  // ============================================================
  // ENDPOINTS DE PROGRESO
  // ============================================================

  @Get('progreso')
  @UseGuards(AdminAuthGuard)
  @ApiOperation({
    summary: 'Obtener progreso del onboarding',
    description: 'Obtiene el estado actual del wizard de onboarding de la tienda',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer {access_token}',
    required: true,
  })
  @ApiHeader({
    name: 'X-Tenant-Domain',
    description: 'Dominio del tenant',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Progreso obtenido correctamente',
    type: ProgresoResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Progreso no encontrado' })
  async getProgreso(@Tenant('id') tenantId: string): Promise<ProgresoResponseDto> {
    this.logger.log(`GET /onboarding/progreso - Tenant: ${tenantId}`);
    return this.onboardingService.getProgreso(tenantId);
  }

  @Put('progreso')
  @UseGuards(AdminAuthGuard)
  @ApiOperation({
    summary: 'Actualizar progreso del onboarding',
    description: 'Marca un paso como completado y actualiza los datos del wizard',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer {access_token}',
    required: true,
  })
  @ApiHeader({
    name: 'X-Tenant-Domain',
    description: 'Dominio del tenant',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Progreso actualizado correctamente',
    schema: {
      example: {
        paso_actual: 2,
        porcentaje_completado: 20,
        completado: false,
      },
    },
  })
  async actualizarProgreso(
    @Tenant('id') tenantId: string,
    @Body() body: ActualizarProgresoDto,
  ) {
    this.logger.log(`PUT /onboarding/progreso - Tenant: ${tenantId}, Paso: ${body.paso}`);
    return this.onboardingService.actualizarProgreso(tenantId, body.paso, body.data);
  }

  @Post('progreso/omitir')
  @UseGuards(AdminAuthGuard)
  @ApiOperation({
    summary: 'Omitir un paso del onboarding',
    description: 'Permite al usuario omitir un paso opcional del wizard',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer {access_token}',
    required: true,
  })
  @ApiHeader({
    name: 'X-Tenant-Domain',
    description: 'Dominio del tenant',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Paso omitido correctamente',
    schema: { example: { mensaje: 'Paso omitido correctamente' } },
  })
  async omitirPaso(@Tenant('id') tenantId: string, @Body() body: OmitirPasoDto) {
    this.logger.log(`POST /onboarding/progreso/omitir - Tenant: ${tenantId}, Paso: ${body.paso}`);
    await this.onboardingService.omitirPaso(tenantId, body.paso);
    return { mensaje: 'Paso omitido correctamente' };
  }

  @Post('progreso/reiniciar')
  @UseGuards(AdminAuthGuard)
  @ApiOperation({
    summary: 'Reiniciar onboarding (solo para testing)',
    description: 'Reinicia el progreso del onboarding a 0%',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer {access_token}',
    required: true,
  })
  @ApiHeader({
    name: 'X-Tenant-Domain',
    description: 'Dominio del tenant',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Progreso reiniciado correctamente',
    schema: { example: { mensaje: 'Progreso reiniciado correctamente' } },
  })
  async reiniciarProgreso(@Tenant('id') tenantId: string) {
    this.logger.warn(`POST /onboarding/progreso/reiniciar - Tenant: ${tenantId}`);
    await this.onboardingService.reiniciarProgreso(tenantId);
    return { mensaje: 'Progreso reiniciado correctamente' };
  }

  // ============================================================
  // ENDPOINTS DE PLANTILLAS
  // ============================================================

  @Get('plantillas')
  @UseGuards(AdminAuthGuard)
  @ApiOperation({
    summary: 'Obtener plantillas de promociones',
    description: 'Lista todas las plantillas disponibles, opcionalmente filtradas',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer {access_token}',
    required: true,
  })
  @ApiQuery({
    name: 'categoria',
    required: false,
    description: 'Filtrar por categoría (bienvenida, cumpleanos, recuperacion, vip, flash)',
  })
  @ApiQuery({
    name: 'tipo_negocio',
    required: false,
    description: 'Filtrar por tipo de negocio (cafeteria, restaurante, spa, retail)',
  })
  @ApiResponse({
    status: 200,
    description: 'Plantillas obtenidas correctamente',
    type: [PlantillaResponseDto],
  })
  async getPlantillas(
    @Query('categoria') categoria?: string,
    @Query('tipo_negocio') tipoNegocio?: string,
  ): Promise<PlantillaResponseDto[]> {
    this.logger.log(
      `GET /onboarding/plantillas - Categoría: ${categoria || 'todas'}, Tipo: ${tipoNegocio || 'todos'}`,
    );
    return this.onboardingService.getPlantillas(categoria, tipoNegocio);
  }

  @Get('plantillas/:id')
  @UseGuards(AdminAuthGuard)
  @ApiOperation({
    summary: 'Obtener plantilla por ID',
    description: 'Obtiene los detalles completos de una plantilla específica',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer {access_token}',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Plantilla obtenida correctamente',
    type: PlantillaResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Plantilla no encontrada' })
  async getPlantillaById(@Param('id') id: string): Promise<PlantillaResponseDto> {
    this.logger.log(`GET /onboarding/plantillas/${id}`);
    return this.onboardingService.getPlantillaById(id);
  }

  @Post('plantillas/:id/usar')
  @UseGuards(AdminAuthGuard)
  @ApiOperation({
    summary: 'Marcar plantilla como usada',
    description: 'Incrementa el contador de usos de una plantilla (para analytics)',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer {access_token}',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Contador incrementado correctamente',
    schema: { example: { mensaje: 'Plantilla marcada como usada' } },
  })
  async usarPlantilla(@Param('id') id: string) {
    this.logger.log(`POST /onboarding/plantillas/${id}/usar`);
    await this.onboardingService.incrementarUsoPlantilla(id);
    return { mensaje: 'Plantilla marcada como usada' };
  }

  // ============================================================
  // ENDPOINTS DE ANALYTICS (SOLO SUPERADMIN)
  // ============================================================

  @Get('analytics')
  @UseGuards(AdminAuthGuard)
  @ApiOperation({
    summary: 'Obtener analytics de onboarding (superadmin)',
    description: 'Métricas agregadas de todos los onboardings',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer {access_token}',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Analytics obtenidos correctamente',
    schema: {
      example: {
        total_onboardings: 50,
        completados: 45,
        incompletos: 5,
        tasa_completacion: 90.0,
        tiempo_promedio_segundos: 180,
        paso_1_completados: 50,
        paso_2_completados: 48,
        paso_3_completados: 47,
        paso_4_completados: 46,
        paso_5_completados: 45,
        abandono_paso_1: 0,
        abandono_paso_2: 2,
        abandono_paso_3: 1,
        abandono_paso_4: 1,
        abandono_paso_5: 1,
      },
    },
  })
  async getAnalytics() {
    this.logger.log(`GET /onboarding/analytics`);
    return this.onboardingService.getAnalytics();
  }
}
