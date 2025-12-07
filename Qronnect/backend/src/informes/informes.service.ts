import { Injectable, Logger, Inject } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AiProvider } from '../ai/interfaces/ai-provider.interface';
import { EmailService } from '../email/email.service';
import { GenerarInformeDto, FormatoInforme } from './dto/generar-informe.dto';
import { EnviarInformeDto } from './dto/enviar-informe.dto';
import { ConfiguracionInformeDto } from './dto/configuracion-informe.dto';

/**
 * Servicio de Informes Mensuales con IA
 *
 * Responsabilidades:
 * - Calcular KPIs del mes
 * - Generar análisis con IA
 * - Comparar con meses anteriores
 * - Analizar impacto de promociones y campañas
 * - Generar plan de acción para próximo mes
 * - Enviar informes por email
 */
@Injectable()
export class InformesService {
  private readonly logger = new Logger(InformesService.name);

  constructor(
    private readonly supabase: SupabaseService,
    @Inject('AiProvider') private readonly aiProvider: AiProvider,
    private readonly emailService: EmailService,
  ) { }

  /**
   * Genera un informe mensual completo con análisis de IA
   */
  async generarInforme(tiendaId: string, dto: GenerarInformeDto) {
    const client = this.supabase.getAdminClient();

    // 1. Calcular período (por defecto: mes anterior)
    const now = new Date();
    const periodo_mes = dto.periodo_mes ?? (now.getMonth() === 0 ? 12 : now.getMonth());
    const periodo_anio = dto.periodo_anio ?? (now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear());

    this.logger.log(`[INFORME] Generando informe para tienda ${tiendaId}, período: ${periodo_mes}/${periodo_anio}`);

    // 2. Calcular fechas del mes
    const fromDate = new Date(periodo_anio, periodo_mes - 1, 1);
    const toDate = new Date(periodo_anio, periodo_mes, 0, 23, 59, 59, 999); // Último día del mes

    // 3. Obtener datos de la tienda
    const { data: tienda, error: tiendaError } = await client
      .from('tiendas')
      .select('nombre, config_ia, email, plan')
      .eq('id', tiendaId)
      .single();

    if (tiendaError || !tienda) {
      throw new Error(`Error al obtener tienda: ${tiendaError?.message || 'Tienda no encontrada'}`);
    }

    // 4. Calcular KPIs del mes
    const kpisDelMes = await this.calcularKPIsMes(tiendaId, fromDate, toDate);

    // 5. Obtener datos de meses anteriores para comparativa
    let comparativaAnterior = null;
    if (dto.incluir_comparativa) {
      comparativaAnterior = await this.calcularComparativa(tiendaId, fromDate);
    }

    // 6. Obtener promociones y campañas usadas en el mes
    const promocionesDelMes = await this.obtenerPromocionesDelMes(tiendaId, fromDate, toDate);
    const campanasDelMes = await this.obtenerCampanasDelMes(tiendaId, fromDate, toDate);

    // 7. Generar análisis con IA
    const analisisIA = await this.generarAnalisisIA(
      tienda,
      kpisDelMes,
      comparativaAnterior,
      promocionesDelMes,
      campanasDelMes,
      fromDate,
      toDate,
    );

    // 8. Generar plan para próximo mes (si se solicita)
    let planSiguienteMes = null;
    if (dto.incluir_plan_accion) {
      planSiguienteMes = await this.generarPlanSiguienteMes(
        tienda,
        kpisDelMes,
        analisisIA,
        promocionesDelMes,
        campanasDelMes,
      );
    }

    // 9. Guardar informe en BD
    const { data: informeGuardado, error: errorGuardar } = await client
      .from('informes_mensuales')
      .insert({
        id_tienda: tiendaId,
        periodo_mes,
        periodo_anio,
        datos_kpis: kpisDelMes,
        analisis_ia: analisisIA,
        comparativa_anterior: comparativaAnterior,
        promociones_usadas: { promociones: promocionesDelMes },
        campanas_usadas: { campanas: campanasDelMes },
        plan_siguiente_mes: planSiguienteMes,
        estado: 'generado',
      })
      .select()
      .single();

    if (errorGuardar) {
      // Si ya existe, actualizarlo
      const { data: informeActualizado, error: errorActualizar } = await client
        .from('informes_mensuales')
        .update({
          datos_kpis: kpisDelMes,
          analisis_ia: analisisIA,
          comparativa_anterior: comparativaAnterior,
          promociones_usadas: { promociones: promocionesDelMes },
          campanas_usadas: { campanas: campanasDelMes },
          plan_siguiente_mes: planSiguienteMes,
          fecha_generacion: new Date().toISOString(),
        })
        .eq('id_tienda', tiendaId)
        .eq('periodo_mes', periodo_mes)
        .eq('periodo_anio', periodo_anio)
        .select()
        .single();

      if (errorActualizar) {
        throw new Error(`Error al guardar informe: ${errorActualizar.message}`);
      }

      this.logger.log(`[INFORME] Informe actualizado: ${informeActualizado.id}`);
      return this.formatearRespuesta(informeActualizado, dto.formato);
    }

    this.logger.log(`[INFORME] Informe generado: ${informeGuardado.id}`);
    return this.formatearRespuesta(informeGuardado, dto.formato);
  }

  /**
   * Calcula KPIs del mes especificado
   */
  private async calcularKPIsMes(tiendaId: string, fromDate: Date, toDate: Date) {
    const client = this.supabase.getAdminClient();

    // Compras del mes
    const { data: compras } = await client
      .from('compras')
      .select('importe, id_cliente, puntos_otorgados')
      .eq('id_tienda', tiendaId)
      .gte('fecha', fromDate.toISOString())
      .lte('fecha', toDate.toISOString());

    // Clientes nuevos del mes
    const { data: clientesNuevos } = await client
      .from('clientes')
      .select('id')
      .eq('id_tienda', tiendaId)
      .gte('creado_en', fromDate.toISOString())
      .lte('creado_en', toDate.toISOString());

    // Clientes activos (compraron en el mes)
    const clientesUnicos = new Set(compras?.map((c) => c.id_cliente) || []);

    // Calcular métricas
    const ventasTotales = compras?.reduce((sum, c) => sum + parseFloat(c.importe.toString()), 0) || 0;
    const numeroTickets = compras?.length || 0;
    const ticketMedio = numeroTickets > 0 ? ventasTotales / numeroTickets : 0;
    const puntosOtorgados = compras?.reduce((sum, c) => sum + (c.puntos_otorgados || 0), 0) || 0;

    return {
      ventasTotales: parseFloat(ventasTotales.toFixed(2)),
      numeroTickets,
      ticketMedio: parseFloat(ticketMedio.toFixed(2)),
      clientesNuevos: clientesNuevos?.length || 0,
      clientesActivos: clientesUnicos.size,
      puntosOtorgados,
      periodoInicio: fromDate.toISOString().split('T')[0],
      periodoFin: toDate.toISOString().split('T')[0],
    };
  }

  /**
   * Calcula comparativa con mes anterior y mismo mes año anterior
   */
  private async calcularComparativa(tiendaId: string, mesActualInicio: Date) {
    // Mes anterior
    const mesAnteriorInicio = new Date(mesActualInicio);
    mesAnteriorInicio.setMonth(mesAnteriorInicio.getMonth() - 1);
    const mesAnteriorFin = new Date(mesActualInicio);
    mesAnteriorFin.setDate(0); // Último día del mes anterior
    mesAnteriorFin.setHours(23, 59, 59, 999);

    const kpisMesAnterior = await this.calcularKPIsMes(tiendaId, mesAnteriorInicio, mesAnteriorFin);

    // Mismo mes año anterior
    const mismoMesAnioAnteriorInicio = new Date(mesActualInicio);
    mismoMesAnioAnteriorInicio.setFullYear(mismoMesAnioAnteriorInicio.getFullYear() - 1);
    const mismoMesAnioAnteriorFin = new Date(mesActualInicio);
    mismoMesAnioAnteriorFin.setFullYear(mismoMesAnioAnteriorFin.getFullYear() - 1);
    mismoMesAnioAnteriorFin.setMonth(mismoMesAnioAnteriorFin.getMonth() + 1, 0);
    mismoMesAnioAnteriorFin.setHours(23, 59, 59, 999);

    const kpisMismoMesAnioAnterior = await this.calcularKPIsMes(
      tiendaId,
      mismoMesAnioAnteriorInicio,
      mismoMesAnioAnteriorFin,
    );

    return {
      mesAnterior: kpisMesAnterior,
      mismoMesAnioAnterior: kpisMismoMesAnioAnterior,
      variacionMesAnterior: this.calcularVariaciones(kpisMesAnterior),
      variacionAnioAnterior: this.calcularVariaciones(kpisMismoMesAnioAnterior),
    };
  }

  /**
   * Calcula variaciones porcentuales
   */
  private calcularVariaciones(kpisAnterior: any) {
    return {
      ventasTotales: kpisAnterior.ventasTotales,
      numeroTickets: kpisAnterior.numeroTickets,
      ticketMedio: kpisAnterior.ticketMedio,
      clientesNuevos: kpisAnterior.clientesNuevos,
      clientesActivos: kpisAnterior.clientesActivos,
    };
  }

  /**
   * Obtiene promociones activas durante el mes
   */
  private async obtenerPromocionesDelMes(tiendaId: string, fromDate: Date, toDate: Date) {
    const client = this.supabase.getAdminClient();

    const { data: promociones } = await client
      .from('promociones')
      .select('*')
      .eq('id_tienda', tiendaId)
      .or(`and(fecha_inicio.lte.${toDate.toISOString()},fecha_fin.gte.${fromDate.toISOString()})`);

    return promociones || [];
  }

  /**
   * Obtiene campañas enviadas durante el mes
   */
  private async obtenerCampanasDelMes(tiendaId: string, fromDate: Date, toDate: Date) {
    const client = this.supabase.getAdminClient();

    const { data: campanas } = await client
      .from('campanas_email')
      .select('*')
      .eq('id_tienda', tiendaId)
      .eq('estado', 'enviada')
      .gte('fecha_envio', fromDate.toISOString())
      .lte('fecha_envio', toDate.toISOString());

    return campanas || [];
  }

  /**
   * Genera análisis con IA
   */
  private async generarAnalisisIA(
    tienda: any,
    kpis: any,
    comparativa: any,
    promociones: any[],
    campanas: any[],
    fromDate: Date,
    toDate: Date,
  ) {
    const contexto = tienda.config_ia
      ? `
Tipo de negocio: ${tienda.config_ia.tipo_negocio || 'No especificado'}
Público objetivo: ${JSON.stringify(tienda.config_ia.publico_objetivo || {})}
Valores de marca: ${tienda.config_ia.valores_marca || 'No especificado'}
Productos principales: ${tienda.config_ia.productos_principales || 'No especificado'}
    `.trim()
      : undefined;

    // Análisis básico de KPIs
    const analisisKPIs = await this.aiProvider.generateKpiAnalysis({
      kpis: {
        ventasTotales: kpis.ventasTotales,
        numeroTickets: kpis.numeroTickets,
        ticketMedio: kpis.ticketMedio,
        clientesNuevos: kpis.clientesNuevos,
        clientesRecurrentes: kpis.clientesActivos - kpis.clientesNuevos,
        clientesActivos: kpis.clientesActivos,
        periodoInicio: fromDate.toISOString().split('T')[0],
        periodoFin: toDate.toISOString().split('T')[0],
      },
      sector: tienda.config_ia?.tipo_negocio,
      tiendaNombre: tienda.nombre,
      contexto,
    });

    // Análisis de impacto de promociones y campañas
    const impactoPromociones = await this.analizarImpactoPromociones(promociones, kpis, comparativa);
    const impactoCampanas = await this.analizarImpactoCampanas(campanas, kpis);

    return {
      analisisGeneral: analisisKPIs,
      impactoPromociones,
      impactoCampanas,
    };
  }

  /**
   * Analiza el impacto de las promociones
   */
  private async analizarImpactoPromociones(promociones: any[], kpis: any, comparativa: any) {
    if (promociones.length === 0) {
      return {
        resumen: 'No se ejecutaron promociones durante este período.',
        impacto: 'neutral',
      };
    }

    return await this.aiProvider.analyzePromoImpact(promociones, kpis, comparativa);
  }

  /**
   * Analiza el impacto de las campañas
   */
  private async analizarImpactoCampanas(campanas: any[], kpis: any) {
    if (campanas.length === 0) {
      return {
        resumen: 'No se enviaron campañas de email durante este período.',
        impacto: 'neutral',
      };
    }

    return {
      resumen: `Se enviaron ${campanas.length} campaña(s) de email a ${campanas.reduce((sum, c) => sum + (c.total_destinatarios || 0), 0)} destinatarios.`,
      impacto: 'positivo',
      campanas: campanas.map((c) => ({
        nombre: c.nombre,
        destinatarios: c.total_destinatarios,
        fecha_envio: c.fecha_envio,
      })),
    };
  }

  /**
   * Genera plan de acción para el próximo mes
   */
  private async generarPlanSiguienteMes(
    tienda: any,
    kpis: any,
    analisisIA: any,
    promociones: any[],
    campanas: any[],
  ) {
    return await this.aiProvider.generateNextMonthPlan(tienda, kpis, analisisIA);
  }

  /**
   * Envía informe por email
   */
  async enviarInforme(tiendaId: string, dto: EnviarInformeDto, enviadoPor?: string) {
    const client = this.supabase.getAdminClient();

    // Generar o buscar informe
    const periodo_mes = dto.periodo_mes ?? (new Date().getMonth() || 12);
    const periodo_anio = dto.periodo_anio ?? new Date().getFullYear();

    let { data: informe } = await client
      .from('informes_mensuales')
      .select('*')
      .eq('id_tienda', tiendaId)
      .eq('periodo_mes', periodo_mes)
      .eq('periodo_anio', periodo_anio)
      .single();

    if (!informe) {
      // Generar informe si no existe
      this.logger.log('[INFORME] Informe no existe, generando...');
      const resultado = await this.generarInforme(tiendaId, {
        periodo_mes,
        periodo_anio,
        formato: FormatoInforme.JSON,
      });
      informe = resultado.informe;
    }

    // Obtener datos de la tienda
    const { data: tienda } = await client.from('tiendas').select('nombre').eq('id', tiendaId).single();

    // Generar HTML del email
    const htmlEmail = await this.generarHTMLEmail(informe, tienda);

    // Enviar email
    const resultadoEnvio = await this.emailService.sendEmail({
      to: dto.email_destino,
      subject: `Informe Mensual - ${tienda?.nombre} - ${this.getNombreMes(periodo_mes)} ${periodo_anio}`,
      html: htmlEmail,
    });

    if (!resultadoEnvio.success) {
      throw new Error(`Error al enviar email: ${resultadoEnvio.error}`);
    }

    // Actualizar estado del informe
    await client
      .from('informes_mensuales')
      .update({
        estado: 'enviado',
        fecha_envio: new Date().toISOString(),
        enviado_a: dto.email_destino,
      })
      .eq('id', informe.id);

    // Registrar en historial
    await client.from('historial_envios_informes').insert({
      id_informe: informe.id,
      id_tienda: tiendaId,
      tipo_envio: enviadoPor ? 'manual' : 'automatico',
      enviado_por: enviadoPor,
      email_destino: dto.email_destino,
      emails_cc: dto.emails_cc || [],
      estado: 'enviado',
      mensaje_id: resultadoEnvio.messageId,
    });

    return {
      success: true,
      mensaje: 'Informe enviado correctamente',
      id_informe: informe.id,
    };
  }

  /**
   * Configurar envío automático de informes
   */
  async configurarEnvioAutomatico(tiendaId: string, dto: ConfiguracionInformeDto) {
    const client = this.supabase.getAdminClient();

    const { data, error } = await client
      .from('configuracion_informes')
      .upsert({
        id_tienda: tiendaId,
        ...dto,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error al configurar envío automático: ${error.message}`);
    }

    return {
      success: true,
      mensaje: 'Configuración guardada correctamente',
      configuracion: data,
    };
  }

  /**
   * Obtener configuración de informes
   */
  async obtenerConfiguracion(tiendaId: string) {
    const client = this.supabase.getAdminClient();

    const { data } = await client
      .from('configuracion_informes')
      .select('*')
      .eq('id_tienda', tiendaId)
      .single();

    return data;
  }

  /**
   * Listar informes de una tienda
   */
  async listarInformes(tiendaId: string, limite = 12) {
    const client = this.supabase.getAdminClient();

    const { data } = await client
      .from('informes_mensuales')
      .select('*')
      .eq('id_tienda', tiendaId)
      .order('periodo_anio', { ascending: false })
      .order('periodo_mes', { ascending: false })
      .limit(limite);

    return data || [];
  }

  // ===== UTILIDADES =====

  private getNombreMes(mes: number): string {
    const meses = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    return meses[mes - 1];
  }

  private extractJSON(text: string): string {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? jsonMatch[0] : text;
  }

  private formatearRespuesta(informe: any, formato?: FormatoInforme) {
    if (formato === FormatoInforme.JSON) {
      return { informe };
    }

    return { informe };
  }

  /**
   * Genera HTML profesional para el email del informe
   */
  private async generarHTMLEmail(informe: any, tienda: any): Promise<string> {
    const nombreMes = this.getNombreMes(informe.periodo_mes);

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Informe Mensual - ${tienda?.nombre}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 700px; margin: 40px auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
    .header p { margin: 10px 0 0; opacity: 0.9; font-size: 16px; }
    .content { padding: 40px 30px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 30px 0; }
    .kpi-card { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; }
    .kpi-card h3 { margin: 0 0 8px; font-size: 14px; color: #666; font-weight: 500; }
    .kpi-card .value { font-size: 28px; font-weight: 700; color: #333; margin: 0; }
    .section { margin: 40px 0; }
    .section h2 { font-size: 20px; color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; margin-bottom: 20px; }
    .highlight { background: #e7f3ff; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #2196F3; }
    .recommendation { background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #10b981; }
    .footer { background: #f8f9fa; padding: 30px; text-align: center; color: #666; font-size: 14px; }
    ul { padding-left: 20px; }
    li { margin: 8px 0; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Informe Mensual</h1>
      <p>${tienda?.nombre} - ${nombreMes} ${informe.periodo_anio}</p>
    </div>

    <div class="content">
      <!-- KPIs Principales -->
      <div class="section">
        <h2>📈 Resumen de Resultados</h2>
        <div class="kpi-grid">
          <div class="kpi-card">
            <h3>Ventas Totales</h3>
            <p class="value">€${informe.datos_kpis.ventasTotales.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
          </div>
          <div class="kpi-card">
            <h3>Número de Tickets</h3>
            <p class="value">${informe.datos_kpis.numeroTickets}</p>
          </div>
          <div class="kpi-card">
            <h3>Ticket Medio</h3>
            <p class="value">€${informe.datos_kpis.ticketMedio.toFixed(2)}</p>
          </div>
          <div class="kpi-card">
            <h3>Clientes Nuevos</h3>
            <p class="value">${informe.datos_kpis.clientesNuevos}</p>
          </div>
        </div>
      </div>

      <!-- Análisis IA -->
      <div class="section">
        <h2>🤖 Análisis con IA</h2>
        <p style="line-height: 1.6; color: #444;">${informe.analisis_ia.analisisGeneral.summary}</p>

        ${informe.analisis_ia.analisisGeneral.highlights?.length > 0
        ? `
        <h3 style="margin-top: 25px; font-size: 16px; color: #666;">⭐ Puntos Destacados</h3>
        ${informe.analisis_ia.analisisGeneral.highlights.map((h) => `<div class="highlight">${h}</div>`).join('')}
        `
        : ''
      }

        ${informe.analisis_ia.analisisGeneral.recommendations?.length > 0
        ? `
        <h3 style="margin-top: 25px; font-size: 16px; color: #666;">💡 Recomendaciones</h3>
        ${informe.analisis_ia.analisisGeneral.recommendations.map((r) => `<div class="recommendation">${typeof r === 'string' ? r : r.texto}</div>`).join('')}
        `
        : ''
      }
      </div>

      <div class="footer">
        <p>Informe generado automáticamente por Qronnect AI</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;
  }
}
