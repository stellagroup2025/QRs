import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { GeminiService } from './gemini.service';
import { KpiAnalysisRequestDto } from './dto/kpi-analysis-request.dto';
import { PromoIdeasRequestDto } from './dto/promo-ideas-request.dto';
import { EmailCampaignRequestDto } from './dto/email-campaign-request.dto';

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
    const client = this.supabase.getClient();

    // Calcular fechas del período
    const now = new Date();
    const fromDate = requestDto.fromDate
      ? new Date(requestDto.fromDate)
      : new Date(now.getFullYear(), now.getMonth(), 1); // Inicio del mes actual

    const toDate = requestDto.toDate
      ? new Date(requestDto.toDate)
      : now;

    this.logger.log(`[AI KPI ANALYSIS] Calculando KPIs para tienda ${tiendaId} del ${fromDate.toISOString()} al ${toDate.toISOString()}`);

    // 1. Obtener datos de la tienda (solo nombre por ahora, sector y configuracion son opcionales)
    const { data: tienda, error: tiendaError } = await client
      .from('tiendas')
      .select('nombre')
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

    // 2. Calcular KPIs del período
    // COMPRAS del período
    const { data: compras, error: comprasError } = await client
      .from('compras')
      .select('importe, id_cliente')
      .eq('id_tienda', tiendaId)
      .gte('fecha', fromDate.toISOString())
      .lte('fecha', toDate.toISOString());

    if (comprasError) {
      this.logger.error('[AI KPI ANALYSIS] Error obteniendo compras:', comprasError);
      throw new Error('Error al obtener datos de compras');
    }

    // KPIs básicos de ventas
    const ventasTotales = compras?.reduce((sum, c) => sum + c.importe, 0) || 0;
    const numeroTickets = compras?.length || 0;
    const ticketMedio = numeroTickets > 0 ? ventasTotales / numeroTickets : 0;

    // Clientes únicos que compraron en el período
    const clientesUnicos = new Set(compras?.map(c => c.id_cliente) || []);
    const clientesActivos = clientesUnicos.size;

    // 3. Clientes nuevos vs recurrentes en el período
    // Clientes nuevos: primera compra en este período
    const { data: clientesNuevosData } = await client
      .from('clientes')
      .select('id')
      .eq('id_tienda', tiendaId)
      .gte('creado_en', fromDate.toISOString())
      .lte('creado_en', toDate.toISOString());

    const clientesNuevos = clientesNuevosData?.length || 0;
    const clientesRecurrentes = clientesActivos - clientesNuevos;

    // 4. Tasa de retención (opcional, requiere datos históricos)
    // Por simplicidad, lo calculamos como % de clientes que volvieron a comprar
    let tasaRetencion = 0;
    if (numeroTickets > 1) {
      // Clientes que hicieron más de una compra en el período
      const comprasPorCliente = new Map<string, number>();
      compras?.forEach(c => {
        comprasPorCliente.set(c.id_cliente, (comprasPorCliente.get(c.id_cliente) || 0) + 1);
      });
      const clientesRecurrentesPeriodo = Array.from(comprasPorCliente.values()).filter(count => count > 1).length;
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

    // Llamar a Gemini para generar el análisis
    const analysis = await this.gemini.generateKpiAnalysis({
      kpis,
      sector: 'comercio', // TODO: añadir campo sector a tiendas table
      tiendaNombre: nombreTienda,
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
    const client = this.supabase.getClient();

    this.logger.log(`[AI PROMO IDEAS] Generando ideas para tienda ${tiendaId}`);

    // Obtener datos de la tienda
    const { data: tienda, error: tiendaError } = await client
      .from('tiendas')
      .select('nombre')
      .eq('id', tiendaId)
      .single();

    if (tiendaError || !tienda) {
      this.logger.error('[AI PROMO IDEAS] Error o tienda no encontrada:', tiendaError);
      throw new Error('Tienda no encontrada');
    }

    const nombreTienda = tienda.nombre || 'tu negocio';

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
          const clientesUnicos = new Set(compras.map(c => c.id_cliente));
          const numeroClientes = clientesUnicos.size;
          if (numeroClientes > 0) {
            // Compras totales / clientes únicos = visitas promedio en 90 días
            // Convertir a visitas por mes: (compras / clientes) * (30 / 90)
            frecuenciaVisitas = (compras.length / numeroClientes) / 3;
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

    // Llamar a Gemini con los datos
    const ideas = await this.gemini.generatePromoIdeas({
      sector: requestDto.sector || 'comercio local',
      ticketMedio,
      frecuenciaVisitas,
      objetivo: requestDto.objetivo,
      contexto: requestDto.contexto,
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
    const client = this.supabase.getClient();

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
}
