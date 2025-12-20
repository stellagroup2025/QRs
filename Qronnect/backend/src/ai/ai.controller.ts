import { Controller, Post, Get, Body, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { AiUsageService } from './ai-usage.service';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { Tenant } from '../tenant/decorators/tenant.decorator';
import { TenantContext } from '../tenant/entities/tenant-context.entity';
import { KpiAnalysisRequestDto } from './dto/kpi-analysis-request.dto';
import { PromoIdeasRequestDto } from './dto/promo-ideas-request.dto';
import { EmailCampaignRequestDto } from './dto/email-campaign-request.dto';
import { PlanAccionRequestDto } from './dto/plan-accion-request.dto';
import { ResumenLimitesIADto, LimiteExcedidoResponseDto } from './dto/ai-usage-response.dto';

/**
 * Controlador de IA para funcionalidades con Google Gemini
 *
 * IMPORTANTE - SEGURIDAD Y MULTI-TENANT:
 * - Todos los endpoints requieren autenticación de admin (@UseGuards(AdminAuthGuard))
 * - El tenantId se obtiene automáticamente del contexto (@Tenant())
 * - Los datos se filtran siempre por tienda (multi-tenant garantizado)
 *
 * LÍMITES DE USO:
 * - Cada función de IA tiene límites semanales según el plan de la tienda
 * - Plan básico/demo: 1 promoción, 1 campaña, 1 análisis KPI por semana
 * - Plan starter: 3 promociones, 3 campañas, 5 análisis por semana
 * - Plan business: 10 promociones, 10 campañas, 20 análisis por semana
 * - Plan enterprise: Ilimitado
 */
@ApiTags('AI')
@Controller('admin/ai')
@UseGuards(AdminAuthGuard)
@ApiBearerAuth('JWT')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly aiUsageService: AiUsageService,
  ) {}

  /**
   * Obtiene el resumen de límites de uso de IA para la tienda
   */
  @Get('limites')
  @ApiOperation({ summary: 'Obtener resumen de límites de uso de IA' })
  @ApiResponse({ status: 200, description: 'Resumen de límites obtenido', type: ResumenLimitesIADto })
  async getLimites(@Tenant() tenant: TenantContext): Promise<ResumenLimitesIADto> {
    try {
      return await this.aiUsageService.obtenerResumenLimites(tenant.id);
    } catch (error) {
      console.error('[AI CONTROLLER] Error in getLimites:', error);
      throw new HttpException(
        error.message || 'Error obteniendo límites de IA',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('kpi-summary')
  @ApiOperation({ summary: 'Análisis de KPIs con IA' })
  @ApiResponse({ status: 200, description: 'Análisis generado exitosamente' })
  @ApiResponse({ status: 403, description: 'Límite semanal alcanzado', type: LimiteExcedidoResponseDto })
  @ApiResponse({ status: 500, description: 'Error al generar análisis' })
  async analyzeKpis(@Tenant() tenant: TenantContext, @Body() requestDto: KpiAnalysisRequestDto) {
    try {
      // Verificar límite antes de ejecutar
      await this.aiUsageService.verificarYLanzarSiNoDisponible(tenant.id, 'analisis_kpi');

      // Ejecutar análisis
      const result = await this.aiService.analyzeKpis(tenant.id, requestDto);

      // Registrar uso exitoso
      await this.aiUsageService.registrarUso(tenant.id, 'analisis_kpi');

      // Obtener límites actualizados para incluir en la respuesta
      const limites = await this.aiUsageService.verificarLimite(tenant.id, 'analisis_kpi');

      return {
        ...result,
        _limites: limites,
      };
    } catch (error) {
      console.error('[AI CONTROLLER] Error in analyzeKpis:', error);

      // Propagar errores de límite como ForbiddenException
      if (error.status === HttpStatus.FORBIDDEN) {
        throw error;
      }

      throw new HttpException(
        error.message || 'Error generando análisis de KPIs',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('promo-ideas')
  @ApiOperation({ summary: 'Generación de ideas de promociones con IA' })
  @ApiResponse({ status: 200, description: 'Ideas generadas exitosamente' })
  @ApiResponse({ status: 403, description: 'Límite semanal alcanzado', type: LimiteExcedidoResponseDto })
  async generatePromoIdeas(
    @Tenant() tenant: TenantContext,
    @Body() requestDto: PromoIdeasRequestDto,
  ) {
    try {
      // Verificar límite antes de ejecutar
      await this.aiUsageService.verificarYLanzarSiNoDisponible(tenant.id, 'promocion_ia');

      // Ejecutar generación
      const result = await this.aiService.generatePromoIdeas(tenant.id, requestDto);

      // Registrar uso exitoso
      await this.aiUsageService.registrarUso(tenant.id, 'promocion_ia');

      // Obtener límites actualizados para incluir en la respuesta
      const limites = await this.aiUsageService.verificarLimite(tenant.id, 'promocion_ia');

      return {
        ...result,
        _limites: limites,
      };
    } catch (error) {
      console.error('[AI CONTROLLER] Error in generatePromoIdeas:', error);

      if (error.status === HttpStatus.FORBIDDEN) {
        throw error;
      }

      throw new HttpException(
        error.message || 'Error generando ideas de promoción',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('email-campaigns')
  @ApiOperation({ summary: 'Generación de campañas de email con IA' })
  @ApiResponse({ status: 200, description: 'Campaña generada exitosamente' })
  @ApiResponse({ status: 403, description: 'Límite semanal alcanzado', type: LimiteExcedidoResponseDto })
  async generateEmailCampaign(
    @Tenant() tenant: TenantContext,
    @Body() requestDto: EmailCampaignRequestDto,
  ) {
    try {
      // Verificar límite antes de ejecutar
      await this.aiUsageService.verificarYLanzarSiNoDisponible(tenant.id, 'campana_ia');

      // Ejecutar generación
      const result = await this.aiService.generateEmailCampaignIdeas(tenant.id, requestDto);

      // Registrar uso exitoso
      await this.aiUsageService.registrarUso(tenant.id, 'campana_ia');

      // Obtener límites actualizados para incluir en la respuesta
      const limites = await this.aiUsageService.verificarLimite(tenant.id, 'campana_ia');

      return {
        ...result,
        _limites: limites,
      };
    } catch (error) {
      console.error('[AI CONTROLLER] Error in generateEmailCampaign:', error);

      if (error.status === HttpStatus.FORBIDDEN) {
        throw error;
      }

      throw new HttpException(
        error.message || 'Error generando campaña de email',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('plan-accion')
  @ApiOperation({ summary: 'Plan de acción para una recomendación' })
  @ApiResponse({ status: 200, description: 'Plan generado exitosamente' })
  @ApiResponse({ status: 403, description: 'Límite semanal alcanzado', type: LimiteExcedidoResponseDto })
  async generatePlanAccion(
    @Tenant() tenant: TenantContext,
    @Body() requestDto: PlanAccionRequestDto,
  ) {
    try {
      // Plan de acción cuenta como uso de promoción
      await this.aiUsageService.verificarYLanzarSiNoDisponible(tenant.id, 'promocion_ia');

      // Ejecutar generación
      const result = await this.aiService.generatePlanAccion(tenant.id, requestDto);

      // Registrar uso exitoso
      await this.aiUsageService.registrarUso(tenant.id, 'promocion_ia');

      // Obtener límites actualizados para incluir en la respuesta
      const limites = await this.aiUsageService.verificarLimite(tenant.id, 'promocion_ia');

      return {
        ...result,
        _limites: limites,
      };
    } catch (error) {
      console.error('[AI CONTROLLER] Error in generatePlanAccion:', error);

      if (error.status === HttpStatus.FORBIDDEN) {
        throw error;
      }

      throw new HttpException(
        error.message || 'Error generando plan de acción',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
