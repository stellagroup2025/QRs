import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SupabaseService } from '../supabase/supabase.service';
import { InformesService } from './informes.service';
import { FormatoInforme } from './dto/generar-informe.dto';

/**
 * Scheduler de Informes Mensuales
 *
 * Ejecuta tareas programadas para:
 * - Enviar informes automáticos según configuración de cada tienda
 * - Verificar cada hora si hay tiendas que necesitan recibir informe hoy
 */
@Injectable()
export class InformesScheduler {
  private readonly logger = new Logger(InformesScheduler.name);

  constructor(
    private readonly supabase: SupabaseService,
    private readonly informesService: InformesService,
  ) {}

  /**
   * CRON: Cada hora verifica si hay informes para enviar
   * Se ejecuta a los 5 minutos de cada hora (ej: 9:05, 10:05, etc)
   *
   * Esto permite que las tiendas configuren "dia_envio" y "hora_envio"
   */
  @Cron('5 * * * *', {
    name: 'verificar-envio-informes',
    timeZone: 'Europe/Madrid',
  })
  async verificarEnvioInformesAutomaticos() {
    this.logger.log('[SCHEDULER] Verificando envíos automáticos de informes...');

    try {
      const client = this.supabase.getAdminClient();
      const now = new Date();
      const horaActual = now.getHours();
      const diaActual = now.getDate();

      // Obtener configuraciones activas que coincidan con día y hora actual
      const { data: configuraciones, error } = await client
        .from('configuracion_informes')
        .select(
          `
          *,
          tiendas!inner(id, nombre, email, activo)
        `,
        )
        .eq('automatico', true)
        .eq('activo', true)
        .eq('dia_envio', diaActual)
        .eq('hora_envio', horaActual)
        .eq('tiendas.activo', true);

      if (error) {
        this.logger.error('[SCHEDULER] Error obteniendo configuraciones:', error);
        return;
      }

      if (!configuraciones || configuraciones.length === 0) {
        this.logger.log(
          `[SCHEDULER] No hay informes programados para día ${diaActual} a las ${horaActual}:00`,
        );
        return;
      }

      this.logger.log(
        `[SCHEDULER] Encontradas ${configuraciones.length} tienda(s) para enviar informe automático`,
      );

      // Procesar cada tienda
      for (const config of configuraciones) {
        try {
          await this.enviarInformeAutomatico(config);
        } catch (error) {
          this.logger.error(
            `[SCHEDULER] Error enviando informe a tienda ${config.id_tienda}:`,
            error,
          );
          // Continuar con las demás tiendas aunque una falle
        }
      }

      this.logger.log('[SCHEDULER] Verificación completada');
    } catch (error) {
      this.logger.error('[SCHEDULER] Error en verificación de informes:', error);
    }
  }

  /**
   * Envía un informe automático a una tienda
   */
  private async enviarInformeAutomatico(config: any) {
    const tienda = config.tiendas;

    this.logger.log(`[SCHEDULER] Enviando informe automático a ${tienda.nombre} (${config.email_destino})`);

    // Calcular período: mes anterior
    const now = new Date();
    const periodo_mes = now.getMonth() === 0 ? 12 : now.getMonth();
    const periodo_anio = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

    try {
      // 1. Verificar si ya existe informe del mes anterior
      const client = this.supabase.getAdminClient();
      let { data: informe } = await client
        .from('informes_mensuales')
        .select('*')
        .eq('id_tienda', config.id_tienda)
        .eq('periodo_mes', periodo_mes)
        .eq('periodo_anio', periodo_anio)
        .single();

      // 2. Si no existe, generar informe
      if (!informe) {
        this.logger.log(
          `[SCHEDULER] Generando informe de ${periodo_mes}/${periodo_anio} para ${tienda.nombre}`,
        );

        const resultado = await this.informesService.generarInforme(config.id_tienda, {
          periodo_mes,
          periodo_anio,
          formato: FormatoInforme.JSON,
          incluir_comparativa: config.incluir_comparativa,
          incluir_plan_accion: config.incluir_plan_accion,
        });

        informe = resultado.informe;
      }

      // 3. Enviar por email
      await this.informesService.enviarInforme(config.id_tienda, {
        periodo_mes,
        periodo_anio,
        email_destino: config.email_destino,
        emails_cc: config.emails_cc || [],
      });

      this.logger.log(
        `[SCHEDULER] ✅ Informe enviado exitosamente a ${tienda.nombre} (${config.email_destino})`,
      );
    } catch (error) {
      this.logger.error(`[SCHEDULER] ❌ Error enviando informe a ${tienda.nombre}:`, error);

      // Registrar error en la BD
      const client = this.supabase.getAdminClient();
      await client.from('informes_mensuales').insert({
        id_tienda: config.id_tienda,
        periodo_mes,
        periodo_anio,
        datos_kpis: {},
        analisis_ia: {},
        estado: 'error',
        error_mensaje: error.message,
      });

      throw error;
    }
  }

  /**
   * CRON: El primer día de cada mes a las 2:00 AM
   * Genera informes del mes anterior para todas las tiendas activas (sin enviar)
   * Esto asegura que siempre haya informes disponibles incluso si no tienen envío automático
   */
  @Cron('0 2 1 * *', {
    name: 'generar-informes-mensuales',
    timeZone: 'Europe/Madrid',
  })
  async generarInformesMensualesAutomaticos() {
    this.logger.log('[SCHEDULER] Generando informes mensuales del mes anterior para todas las tiendas...');

    try {
      const client = this.supabase.getAdminClient();

      // Obtener todas las tiendas activas
      const { data: tiendas, error } = await client.from('tiendas').select('id, nombre').eq('activo', true);

      if (error || !tiendas) {
        this.logger.error('[SCHEDULER] Error obteniendo tiendas:', error);
        return;
      }

      this.logger.log(`[SCHEDULER] Generando informes para ${tiendas.length} tienda(s)`);

      // Calcular mes anterior
      const now = new Date();
      const periodo_mes = now.getMonth() === 0 ? 12 : now.getMonth();
      const periodo_anio = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

      for (const tienda of tiendas) {
        try {
          // Verificar si ya existe
          const { data: existente } = await client
            .from('informes_mensuales')
            .select('id')
            .eq('id_tienda', tienda.id)
            .eq('periodo_mes', periodo_mes)
            .eq('periodo_anio', periodo_anio)
            .single();

          if (existente) {
            this.logger.log(`[SCHEDULER] Informe ya existe para ${tienda.nombre}, saltando...`);
            continue;
          }

          // Generar informe
          await this.informesService.generarInforme(tienda.id, {
            periodo_mes,
            periodo_anio,
            formato: FormatoInforme.JSON,
          });

          this.logger.log(`[SCHEDULER] ✅ Informe generado para ${tienda.nombre}`);
        } catch (error) {
          this.logger.error(`[SCHEDULER] ❌ Error generando informe para ${tienda.nombre}:`, error);
        }
      }

      this.logger.log('[SCHEDULER] Generación de informes mensuales completada');
    } catch (error) {
      this.logger.error('[SCHEDULER] Error en generación de informes mensuales:', error);
    }
  }
}
