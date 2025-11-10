import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { Tenant } from '../tenant/decorators/tenant.decorator';
import { TenantContext } from '../tenant/entities/tenant-context.entity';
import { KpiAnalysisRequestDto } from './dto/kpi-analysis-request.dto';
import { PromoIdeasRequestDto } from './dto/promo-ideas-request.dto';
import { EmailCampaignRequestDto } from './dto/email-campaign-request.dto';

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
  constructor(private readonly aiService: AiService) {}

  /**
   * POST /api/admin/ai/kpi-summary
   *
   * Genera un análisis inteligente de los KPIs del negocio
   *
   * Funcionalidad:
   * 1. Calcula KPIs agregados de la tienda (ventas, tickets, clientes, etc.)
   * 2. Envía resumen optimizado a Gemini (NO datos personales brutos)
   * 3. Devuelve análisis en lenguaje natural con insights y recomendaciones
   *
   * MULTI-TENANT: Solo analiza datos de la tienda del admin autenticado
   */
  @Post('kpi-summary')
  @ApiOperation({
    summary: 'Análisis de KPIs con IA',
    description: 'Genera un resumen ejecutivo y recomendaciones basadas en los KPIs de la tienda usando Google Gemini',
  })
  @ApiResponse({
    status: 200,
    description: 'Análisis generado exitosamente',
    schema: {
      example: {
        summary: 'Las ventas han subido un 12% respecto al mes pasado. El ticket medio se mantiene estable en 45€.',
        highlights: [
          'Incremento del 15% en clientes recurrentes',
          'Los martes y jueves son los días de mayor afluencia',
          'El ticket medio es 10% superior a la media del sector'
        ],
        recommendations: [
          'Lanza una campaña de reactivación para clientes inactivos de más de 60 días',
          'Aprovecha los días de baja afluencia con promociones especiales',
          'Considera implementar un programa de referidos para los clientes recurrentes'
        ],
        kpis: {
          ventasTotales: 4521.50,
          numeroTickets: 98,
          ticketMedio: 46.13,
          clientesNuevos: 12,
          clientesRecurrentes: 35,
          clientesActivos: 47
        },
        periodo: {
          inicio: '2025-10-01T00:00:00Z',
          fin: '2025-10-31T23:59:59Z'
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado - requiere autenticación de admin' })
  @ApiResponse({ status: 500, description: 'Error al generar análisis (ej: GEMINI_API_KEY no configurada)' })
  async analyzeKpis(
    @Tenant() tenant: TenantContext,
    @Body() requestDto: KpiAnalysisRequestDto,
  ) {
    // MULTI-TENANT: tenant.id asegura que solo se analicen datos de esta tienda
    return this.aiService.analyzeKpis(tenant.id, requestDto);
  }

  /**
   * POST /api/admin/ai/promo-ideas
   *
   * Genera ideas de promociones adaptadas al sector del negocio
   *
   * Funcionalidad:
   * 1. Obtiene datos agregados del negocio (sector, ticket medio, frecuencia)
   * 2. Envía contexto optimizado a Gemini
   * 3. Recibe ideas de promociones prácticas y adaptadas al sector
   * 4. Incluye mensajes para WhatsApp y carteles
   *
   * MULTI-TENANT: Usa datos solo de la tienda autenticada
   */
  @Post('promo-ideas')
  @ApiOperation({
    summary: 'Generación de ideas de promociones con IA',
    description: 'Genera ideas creativas de promociones adaptadas al sector del negocio y objetivos específicos',
  })
  @ApiResponse({
    status: 200,
    description: 'Ideas de promociones generadas',
    schema: {
      example: {
        ideas: [
          {
            titulo: '2x1 en cortes de cabello los martes',
            descripcion: 'Ofrece un corte gratis por cada corte pagado los martes entre 10:00 y 14:00',
            condiciones: 'Válido solo los martes de 10:00 a 14:00. Ambos servicios deben ser del mismo valor o menor.',
            mensajeWhatsApp: '🎉 ¡2x1 en cortes todos los martes! Trae a un amigo y ambos se cortan al precio de uno. Reserva ya',
            textoCartel: '¡MARTES 2X1!\nDos cortes al precio de uno\n10:00 - 14:00',
            estimadoImpacto: 'Puede incrementar visitas los martes en 40-60% y atraer nuevos clientes por referidos'
          }
        ]
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async generatePromoIdeas(
    @Tenant() tenant: TenantContext,
    @Body() requestDto: PromoIdeasRequestDto,
  ) {
    return this.aiService.generatePromoIdeas(tenant.id, requestDto);
  }

  /**
   * POST /api/admin/ai/email-campaigns
   *
   * Genera contenido para campañas de email segmentadas
   *
   * Funcionalidad:
   * 1. Recibe descripción del segmento (calculado previamente en frontend o backend)
   * 2. NO hace segmentación SQL aquí - solo genera contenido basado en descripción
   * 3. Devuelve asuntos, cuerpos de email, CTAs y variantes A/B
   * 4. Personalizable con variables {{nombre}}, etc.
   *
   * IMPORTANTE: La segmentación de clientes debe hacerse ANTES de llamar a este endpoint.
   * Este endpoint solo genera el contenido del email, no selecciona destinatarios.
   *
   * MULTI-TENANT: Contexto de tienda usado para personalización
   */
  @Post('email-campaigns')
  @ApiOperation({
    summary: 'Generación de campañas de email con IA',
    description: 'Genera contenido de email marketing (asuntos, cuerpos, CTAs) basado en segmento de clientes',
  })
  @ApiResponse({
    status: 200,
    description: 'Campaña de email generada',
    schema: {
      example: {
        asuntos: [
          '{{nombre}}, te echamos de menos en [Nombre Tienda]',
          '¡Tenemos algo especial para ti, {{nombre}}!',
          'Vuelve y disfruta de un 20% de descuento'
        ],
        cuerpos: [
          {
            variante: 'A',
            contenido: 'Hola {{nombre}},\n\nHa pasado un tiempo desde tu última visita y te echamos de menos...',
            cta: '¡Reserva tu cita ahora y obtén 20% de descuento!'
          },
          {
            variante: 'B',
            contenido: 'Hola {{nombre}},\n\n¿Sabías que tenemos nuevos servicios que te encantarán?...',
            cta: 'Descubre lo nuevo - 20% OFF en tu próxima visita'
          }
        ],
        consejos: [
          'Envía el email un martes o miércoles a media mañana para mejor tasa de apertura',
          'Prueba ambas variantes con el 50% del segmento cada una para ver cuál funciona mejor',
          'Personaliza el descuento según el ticket medio del segmento'
        ]
      }
    }
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async generateEmailCampaign(
    @Tenant() tenant: TenantContext,
    @Body() requestDto: EmailCampaignRequestDto,
  ) {
    return this.aiService.generateEmailCampaignIdeas(tenant.id, requestDto);
  }
}
