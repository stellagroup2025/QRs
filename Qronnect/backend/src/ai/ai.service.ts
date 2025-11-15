import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { GeminiService } from './gemini.service';
import { KpiAnalysisRequestDto } from './dto/kpi-analysis-request.dto';
import { PromoIdeasRequestDto } from './dto/promo-ideas-request.dto';
import { EmailCampaignRequestDto } from './dto/email-campaign-request.dto';
import { PlanAccionRequestDto } from './dto/plan-accion-request.dto';

/**
 * Servicio de IA que integra la lógica de negocio con Gemini
 *
 * Responsabilidades:
 * - Calcular KPIs agregados desde Supabase
 * - Preparar datos optimizados para enviar a Gemini
 * - Coordinar entre la BD y el servicio de IA
 */
@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly supabase: SupabaseService,
    private readonly gemini: GeminiService,
  ) {}

  /**
   * Genera análisis de KPIs con IA
   *
   * IMPORTANTE: Multi-tenant - solo datos de la tienda especificada
   */
  async analyzeKpis(tiendaId: string, requestDto: KpiAnalysisRequestDto) {
    const client = this.supabase.getAdminClient();

    // Calcular fechas del período
    const now = new Date();
    const fromDate = requestDto.fromDate
      ? new Date(requestDto.fromDate)
      : new Date(now.getFullYear(), now.getMonth(), 1); // Inicio del mes actual

    const toDate = requestDto.toDate ? new Date(requestDto.toDate) : now;

    // Ajustar toDate al final del día (23:59:59.999 UTC) para incluir todas las compras del día
    const toDateEndOfDay = new Date(toDate);
    toDateEndOfDay.setUTCHours(23, 59, 59, 999);

    this.logger.log(
      `[AI KPI ANALYSIS] Calculando KPIs para tienda ${tiendaId} del ${fromDate.toISOString()} al ${toDateEndOfDay.toISOString()}`,
    );

    // 1. Obtener datos de la tienda INCLUYENDO config_ia
    const { data: tienda, error: tiendaError } = await client
      .from('tiendas')
      .select('nombre, config_ia')
      .eq('id', tiendaId)
      .single();

    if (tiendaError) {
      this.logger.error('[AI KPI ANALYSIS] Error obteniendo tienda:', tiendaError);
      throw new Error(`Error al obtener datos de la tienda: ${tiendaError.message}`);
    }

    if (!tienda) {
      this.logger.error('[AI KPI ANALYSIS] Tienda no encontrada con ID:', tiendaId);
      throw new Error('Tienda no encontrada');
    }

    const nombreTienda = tienda.nombre || 'tu negocio';
    const configIA = tienda.config_ia || {};

    // 2. Calcular KPIs del período
    // COMPRAS del período (usando toDateEndOfDay para incluir todo el día)
    const { data: compras, error: comprasError } = await client
      .from('compras')
      .select('importe, id_cliente')
      .eq('id_tienda', tiendaId)
      .gte('fecha', fromDate.toISOString())
      .lte('fecha', toDateEndOfDay.toISOString());

    if (comprasError) {
      this.logger.error('[AI KPI ANALYSIS] Error obteniendo compras:', comprasError);
      throw new Error('Error al obtener datos de compras');
    }

    // KPIs básicos de ventas
    const ventasTotales = compras?.reduce((sum, c) => sum + c.importe, 0) || 0;
    const numeroTickets = compras?.length || 0;
    const ticketMedio = numeroTickets > 0 ? ventasTotales / numeroTickets : 0;

    // Clientes únicos que compraron en el período
    const clientesUnicos = new Set(compras?.map((c) => c.id_cliente) || []);
    const clientesActivos = clientesUnicos.size;

    // 3. Clientes nuevos vs recurrentes en el período
    // Clientes nuevos: primera compra en este período (usando toDateEndOfDay)
    const { data: clientesNuevosData } = await client
      .from('clientes')
      .select('id')
      .eq('id_tienda', tiendaId)
      .gte('creado_en', fromDate.toISOString())
      .lte('creado_en', toDateEndOfDay.toISOString());

    const clientesNuevos = clientesNuevosData?.length || 0;
    const clientesRecurrentes = clientesActivos - clientesNuevos;

    // 4. Tasa de retención (opcional, requiere datos históricos)
    // Por simplicidad, lo calculamos como % de clientes que volvieron a comprar
    let tasaRetencion = 0;
    if (numeroTickets > 1) {
      // Clientes que hicieron más de una compra en el período
      const comprasPorCliente = new Map<string, number>();
      compras?.forEach((c) => {
        comprasPorCliente.set(c.id_cliente, (comprasPorCliente.get(c.id_cliente) || 0) + 1);
      });
      const clientesRecurrentesPeriodo = Array.from(comprasPorCliente.values()).filter(
        (count) => count > 1,
      ).length;
      tasaRetencion = (clientesRecurrentesPeriodo / clientesActivos) * 100;
    }

    // Preparar objeto KPIs para enviar a Gemini
    const kpis = {
      ventasTotales,
      numeroTickets,
      ticketMedio,
      clientesNuevos,
      clientesRecurrentes,
      clientesActivos,
      tasaRetencion,
      periodoInicio: fromDate.toLocaleDateString('es-ES'),
      periodoFin: toDate.toLocaleDateString('es-ES'),
    };

    this.logger.log('[AI KPI ANALYSIS] KPIs calculados:', kpis);

    // Obtener sector desde config_ia
    const sector = configIA.tipo_negocio || 'comercio';

    // Construir contexto enriquecido
    const contextoIA = this.construirContextoIA(configIA);

    this.logger.log(`[AI KPI ANALYSIS] Usando sector: ${sector}`);
    this.logger.log(`[AI KPI ANALYSIS] Contexto enriquecido: ${contextoIA ? 'SÍ' : 'NO'}`);

    // Llamar a Gemini para generar el análisis con contexto enriquecido
    const analysis = await this.gemini.generateKpiAnalysis({
      kpis,
      sector,
      tiendaNombre: nombreTienda,
      contexto: contextoIA, // Agregar contexto adicional
    });

    return {
      ...analysis,
      kpis, // Incluir también los números brutos para referencia
      periodo: {
        inicio: fromDate.toISOString(),
        fin: toDate.toISOString(),
      },
    };
  }

  /**
   * Genera ideas de promociones con IA
   *
   * Usa datos agregados de la tienda para proponer promociones relevantes
   */
  async generatePromoIdeas(tiendaId: string, requestDto: PromoIdeasRequestDto) {
    const client = this.supabase.getAdminClient();

    this.logger.log(`[AI PROMO IDEAS] Generando ideas para tienda ${tiendaId}`);

    // Obtener datos de la tienda INCLUYENDO config_ia
    const { data: tienda, error: tiendaError } = await client
      .from('tiendas')
      .select('nombre, config_ia')
      .eq('id', tiendaId)
      .single();

    if (tiendaError || !tienda) {
      this.logger.error('[AI PROMO IDEAS] Error o tienda no encontrada:', tiendaError);
      throw new Error('Tienda no encontrada');
    }

    const nombreTienda = tienda.nombre || 'tu negocio';
    const configIA = tienda.config_ia || {};

    // Si no se proporciona ticketMedio o frecuenciaVisitas, calcularlos
    let ticketMedio = requestDto.ticketMedio;
    let frecuenciaVisitas = requestDto.frecuenciaVisitas;

    if (!ticketMedio || !frecuenciaVisitas) {
      // Calcular últimos 90 días para obtener promedios actuales
      const fecha90DiasAtras = new Date();
      fecha90DiasAtras.setDate(fecha90DiasAtras.getDate() - 90);

      const { data: compras } = await client
        .from('compras')
        .select('importe, id_cliente, fecha')
        .eq('id_tienda', tiendaId)
        .gte('fecha', fecha90DiasAtras.toISOString());

      if (compras && compras.length > 0) {
        // Calcular ticket medio si no se proporcionó
        if (!ticketMedio) {
          const totalVentas = compras.reduce((sum, c) => sum + c.importe, 0);
          ticketMedio = totalVentas / compras.length;
        }

        // Calcular frecuencia de visitas si no se proporcionó
        if (!frecuenciaVisitas) {
          const clientesUnicos = new Set(compras.map((c) => c.id_cliente));
          const numeroClientes = clientesUnicos.size;
          if (numeroClientes > 0) {
            // Compras totales / clientes únicos = visitas promedio en 90 días
            // Convertir a visitas por mes: (compras / clientes) * (30 / 90)
            frecuenciaVisitas = compras.length / numeroClientes / 3;
          } else {
            frecuenciaVisitas = 1; // Valor por defecto
          }
        }
      } else {
        // Valores por defecto si no hay datos
        ticketMedio = ticketMedio || 25;
        frecuenciaVisitas = frecuenciaVisitas || 2;
      }
    }

    // Construir contexto enriquecido usando config_ia
    const contextoEnriquecido = this.construirContextoIA(configIA, requestDto.contexto);

    // Obtener sector desde config_ia o del request
    const sector = configIA.tipo_negocio || requestDto.sector || 'comercio local';

    this.logger.log(`[AI PROMO IDEAS] Usando sector: ${sector}`);
    this.logger.log(`[AI PROMO IDEAS] Contexto enriquecido: ${contextoEnriquecido ? 'SÍ' : 'NO'}`);

    // Llamar a Gemini con los datos enriquecidos
    const ideas = await this.gemini.generatePromoIdeas({
      sector,
      ticketMedio,
      frecuenciaVisitas,
      objetivo: requestDto.objetivo,
      contexto: contextoEnriquecido,
    });

    return ideas;
  }

  /**
   * Genera ideas de campaña de email con IA
   *
   * NO hace la segmentación aquí - el frontend o el caller ya debe pasar
   * la descripción del segmento calculada previamente
   */
  async generateEmailCampaignIdeas(tiendaId: string, requestDto: EmailCampaignRequestDto) {
    const client = this.supabase.getAdminClient();

    this.logger.log(`[AI EMAIL CAMPAIGN] Generando campaña para tienda ${tiendaId}`);

    // Obtener datos de la tienda
    const { data: tienda, error: tiendaError } = await client
      .from('tiendas')
      .select('nombre')
      .eq('id', tiendaId)
      .single();

    if (tiendaError || !tienda) {
      this.logger.error('[AI EMAIL CAMPAIGN] Error o tienda no encontrada:', tiendaError);
      throw new Error('Tienda no encontrada');
    }

    const nombreTienda = tienda.nombre || 'tu negocio';

    // Llamar a Gemini para generar la campaña
    const campaign = await this.gemini.generateEmailCampaignIdeas({
      segmentoDescripcion: requestDto.segmentoDescripcion,
      sector: requestDto.sector || 'comercio local',
      objetivo: requestDto.objetivo,
      tono: requestDto.tono,
      nombreTienda,
    });

    return campaign;
  }

  /**
   * Genera un plan de acción detallado para una recomendación
   *
   * Evalúa qué acciones concretas se pueden tomar desde el sistema
   * (crear promoción, crear campaña de email, o ambas)
   */
  async generatePlanAccion(tiendaId: string, requestDto: PlanAccionRequestDto) {
    const client = this.supabase.getAdminClient();

    this.logger.log(`[AI PLAN ACCION] Generando plan de acción para tienda ${tiendaId}`);

    // Obtener datos de la tienda
    const { data: tienda, error: tiendaError } = await client
      .from('tiendas')
      .select('nombre')
      .eq('id', tiendaId)
      .single();

    if (tiendaError || !tienda) {
      this.logger.error('[AI PLAN ACCION] Error o tienda no encontrada:', tiendaError);
      throw new Error('Tienda no encontrada');
    }

    const nombreTienda = tienda.nombre || 'tu negocio';

    // Obtener datos agregados para contextualizar mejor las acciones
    const fecha30DiasAtras = new Date();
    fecha30DiasAtras.setDate(fecha30DiasAtras.getDate() - 30);

    const { data: compras } = await client
      .from('compras')
      .select('importe, id_cliente')
      .eq('id_tienda', tiendaId)
      .gte('fecha', fecha30DiasAtras.toISOString());

    const totalVentas = compras?.reduce((sum, c) => sum + c.importe, 0) || 0;
    const ticketMedio = compras?.length > 0 ? totalVentas / compras.length : 0;
    const clientesUnicos = new Set(compras?.map((c) => c.id_cliente) || []).size;

    // Llamar a Gemini para generar el plan de acción
    const plan = await this.gemini.generatePlanAccion({
      recomendacion: requestDto.recomendacion,
      contexto: requestDto.contexto,
      tipo_accion: requestDto.tipo_accion,
      nombreTienda,
      ticketMedio,
      clientesActivos: clientesUnicos,
    });

    return plan;
  }

  /**
   * Construye un contexto enriquecido para la IA usando la configuración guardada
   *
   * @param configIA - Configuración de IA de la tienda desde config_ia
   * @param contextoAdicional - Contexto adicional pasado en el request
   * @returns String formateado con toda la información de contexto
   */
  private construirContextoIA(configIA: any, contextoAdicional?: string): string {
    if (!configIA || Object.keys(configIA).length === 0) {
      return contextoAdicional || '';
    }

    const partes: string[] = [];

    // Tipo de negocio
    if (configIA.tipo_negocio) {
      partes.push(`Tipo de negocio: ${configIA.tipo_negocio}`);
    }

    // Público objetivo
    if (configIA.publico_objetivo) {
      const pub = configIA.publico_objetivo;
      const detalles: string[] = [];

      if (pub.edad_min || pub.edad_max) {
        detalles.push(`Edad: ${pub.edad_min || '?'}-${pub.edad_max || '?'} años`);
      }

      if (pub.generos && pub.generos.length > 0) {
        detalles.push(`Género: ${pub.generos.join(', ')}`);
      }

      if (pub.intereses && pub.intereses.length > 0) {
        detalles.push(`Intereses: ${pub.intereses.join(', ')}`);
      }

      if (detalles.length > 0) {
        partes.push(`Público objetivo: ${detalles.join('; ')}`);
      }
    }

    // Valores de marca
    if (configIA.valores_marca && configIA.valores_marca.length > 0) {
      partes.push(`Valores de marca: ${configIA.valores_marca.join(', ')}`);
    }

    // Tono de comunicación
    if (configIA.tono_comunicacion) {
      partes.push(`Tono de comunicación: ${configIA.tono_comunicacion}`);
    }

    // Productos principales
    if (configIA.productos_principales && configIA.productos_principales.length > 0) {
      partes.push(`Productos/servicios principales: ${configIA.productos_principales.join(', ')}`);
    }

    // Rango de precios
    if (configIA.rango_precios) {
      partes.push(`Rango de precios: ${configIA.rango_precios}`);
    }

    // Ubicación
    if (configIA.ubicacion) {
      const ub = configIA.ubicacion;
      const ubicacionParts: string[] = [];

      if (ub.barrio) ubicacionParts.push(ub.barrio);
      if (ub.ciudad) ubicacionParts.push(ub.ciudad);

      if (ubicacionParts.length > 0) {
        partes.push(`Ubicación: ${ubicacionParts.join(', ')}`);

        if (ub.referencias_locales) {
          partes.push('(Usar referencias locales en las comunicaciones)');
        }
      }
    }

    // Promociones recurrentes
    if (configIA.promociones_recurrentes && configIA.promociones_recurrentes.length > 0) {
      partes.push(`Promociones recurrentes: ${configIA.promociones_recurrentes.join('; ')}`);
    }

    // Slogan
    if (configIA.slogan) {
      partes.push(`Slogan: "${configIA.slogan}"`);
    }

    // Hashtags
    if (configIA.hashtags && configIA.hashtags.length > 0) {
      partes.push(`Hashtags habituales: ${configIA.hashtags.join(' ')}`);
    }

    // Agregar contexto adicional si existe
    if (contextoAdicional) {
      partes.push(`\nContexto adicional: ${contextoAdicional}`);
    }

    return partes.join('\n');
  }
}
