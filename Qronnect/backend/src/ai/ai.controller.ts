import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { Tenant } from '../tenant/decorators/tenant.decorator';
import { TenantContext } from '../tenant/entities/tenant-context.entity';
import { KpiAnalysisRequestDto } from './dto/kpi-analysis-request.dto';
import { PromoIdeasRequestDto } from './dto/promo-ideas-request.dto';
import { EmailCampaignRequestDto } from './dto/email-campaign-request.dto';
import { PlanAccionRequestDto } from './dto/plan-accion-request.dto';

/**
 * Controlador de IA para funcionalidades con Google Gemini
 *
 * IMPORTANTE - SEGURIDAD Y MULTI-TENANT:
 * - Todos los endpoints requieren autenticación de admin (@UseGuards(AdminAuthGuard))
 * - El tenantId se obtiene automáticamente del contexto (@Tenant())
 * - Los datos se filtran siempre por tienda (multi-tenant garantizado)
 */
@ApiTags('AI')
@Controller('admin/ai')
@UseGuards(AdminAuthGuard)
@ApiBearerAuth('JWT')
export class AiController {
  constructor(private readonly aiService: AiService) { }

  @Post('kpi-summary')
  @ApiOperation({ summary: 'Análisis de KPIs con IA' })
  @ApiResponse({ status: 200, description: 'Análisis generado exitosamente' })
  @ApiResponse({ status: 500, description: 'Error al generar análisis' })
  async analyzeKpis(@Tenant() tenant: TenantContext, @Body() requestDto: KpiAnalysisRequestDto) {
    try {
      return await this.aiService.analyzeKpis(tenant.id, requestDto);
    } catch (error) {
      console.error('[AI CONTROLLER] Error in analyzeKpis:', error);
      throw new HttpException(
        error.message || 'Error generando análisis de KPIs',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('promo-ideas')
  @ApiOperation({ summary: 'Generación de ideas de promociones con IA' })
  async generatePromoIdeas(
    @Tenant() tenant: TenantContext,
    @Body() requestDto: PromoIdeasRequestDto,
  ) {
    try {
      return await this.aiService.generatePromoIdeas(tenant.id, requestDto);
    } catch (error) {
      console.error('[AI CONTROLLER] Error in generatePromoIdeas:', error);
      throw new HttpException(
        error.message || 'Error generando ideas de promoción',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('email-campaigns')
  @ApiOperation({ summary: 'Generación de campañas de email con IA' })
  async generateEmailCampaign(
    @Tenant() tenant: TenantContext,
    @Body() requestDto: EmailCampaignRequestDto,
  ) {
    try {
      return await this.aiService.generateEmailCampaignIdeas(tenant.id, requestDto);
    } catch (error) {
      console.error('[AI CONTROLLER] Error in generateEmailCampaign:', error);
      throw new HttpException(
        error.message || 'Error generando campaña de email',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('plan-accion')
  @ApiOperation({ summary: 'Plan de acción para una recomendación' })
  async generatePlanAccion(
    @Tenant() tenant: TenantContext,
    @Body() requestDto: PlanAccionRequestDto,
  ) {
    try {
      return await this.aiService.generatePlanAccion(tenant.id, requestDto);
    } catch (error) {
      console.error('[AI CONTROLLER] Error in generatePlanAccion:', error);
      throw new HttpException(
        error.message || 'Error generando plan de acción',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
