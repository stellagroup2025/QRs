import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

/**
 * Tipos de uso de IA disponibles
 */
export type TipoUsoIA = 'promocion_ia' | 'campana_ia' | 'analisis_kpi';

/**
 * Respuesta de verificación de límite de IA
 */
export interface VerificacionLimiteIA {
  disponible: boolean;
  ilimitado: boolean;
  plan: string;
  tipo_uso: TipoUsoIA;
  limite_semanal: number | null;
  usos_realizados: number | null;
  restantes: number | null;
  semana_inicio: string;
  semana_fin: string;
}

/**
 * Resumen de límites de IA para todos los tipos
 */
export interface ResumenLimitesIA {
  promocion_ia: VerificacionLimiteIA;
  campana_ia: VerificacionLimiteIA;
  analisis_kpi: VerificacionLimiteIA;
}

/**
 * Resultado de registro de uso
 */
export interface ResultadoRegistroUso {
  exito: boolean;
  error?: string;
  tipo_uso?: TipoUsoIA;
  usos_realizados?: number;
  semana_inicio?: string;
  limite?: VerificacionLimiteIA;
}

/**
 * Servicio para gestionar los límites de uso de IA por tienda
 *
 * Controla el uso semanal de funciones de IA según el plan de la tienda:
 * - Plan básico/demo: 1 promoción, 1 campaña, 1 análisis KPI por semana
 * - Plan starter: 3 promociones, 3 campañas, 5 análisis por semana
 * - Plan business: 10 promociones, 10 campañas, 20 análisis por semana
 * - Plan enterprise: Ilimitado
 */
@Injectable()
export class AiUsageService {
  private readonly logger = new Logger(AiUsageService.name);

  constructor(private readonly supabase: SupabaseService) {}

  /**
   * Verifica si una tienda puede usar una función de IA específica
   *
   * @param tiendaId - ID de la tienda
   * @param tipoUso - Tipo de uso de IA
   * @returns Verificación del límite
   */
  async verificarLimite(tiendaId: string, tipoUso: TipoUsoIA): Promise<VerificacionLimiteIA> {
    const client = this.supabase.getAdminClient();

    this.logger.log(`[AI USAGE] Verificando límite para tienda ${tiendaId}, tipo: ${tipoUso}`);

    const { data, error } = await client.rpc('verificar_limite_ia_por_tipo', {
      p_tienda_id: tiendaId,
      p_tipo_uso: tipoUso,
    });

    if (error) {
      this.logger.error('[AI USAGE] Error verificando límite:', error);
      throw new Error(`Error al verificar límite de IA: ${error.message}`);
    }

    this.logger.log(`[AI USAGE] Resultado verificación:`, data);

    return data as VerificacionLimiteIA;
  }

  /**
   * Verifica si hay disponibilidad y lanza excepción si no
   *
   * @param tiendaId - ID de la tienda
   * @param tipoUso - Tipo de uso de IA
   * @throws ForbiddenException si no hay disponibilidad
   */
  async verificarYLanzarSiNoDisponible(tiendaId: string, tipoUso: TipoUsoIA): Promise<VerificacionLimiteIA> {
    const verificacion = await this.verificarLimite(tiendaId, tipoUso);

    if (!verificacion.disponible && !verificacion.ilimitado) {
      const tipoLegible = this.obtenerNombreLegible(tipoUso);
      throw new ForbiddenException({
        message: `Has alcanzado el límite semanal de ${tipoLegible}`,
        code: 'AI_LIMIT_EXCEEDED',
        details: {
          tipo_uso: tipoUso,
          plan: verificacion.plan,
          limite_semanal: verificacion.limite_semanal,
          usos_realizados: verificacion.usos_realizados,
          semana_inicio: verificacion.semana_inicio,
          semana_fin: verificacion.semana_fin,
        },
      });
    }

    return verificacion;
  }

  /**
   * Registra un uso de IA y actualiza el contador semanal
   *
   * @param tiendaId - ID de la tienda
   * @param tipoUso - Tipo de uso de IA
   * @returns Resultado del registro
   */
  async registrarUso(tiendaId: string, tipoUso: TipoUsoIA): Promise<ResultadoRegistroUso> {
    const client = this.supabase.getAdminClient();

    this.logger.log(`[AI USAGE] Registrando uso para tienda ${tiendaId}, tipo: ${tipoUso}`);

    const { data, error } = await client.rpc('registrar_uso_ia_semanal', {
      p_tienda_id: tiendaId,
      p_tipo_uso: tipoUso,
    });

    if (error) {
      this.logger.error('[AI USAGE] Error registrando uso:', error);
      throw new Error(`Error al registrar uso de IA: ${error.message}`);
    }

    this.logger.log(`[AI USAGE] Resultado registro:`, data);

    return data as ResultadoRegistroUso;
  }

  /**
   * Obtiene el resumen completo de límites de IA para una tienda
   *
   * @param tiendaId - ID de la tienda
   * @returns Resumen de límites para todos los tipos
   */
  async obtenerResumenLimites(tiendaId: string): Promise<ResumenLimitesIA> {
    const client = this.supabase.getAdminClient();

    this.logger.log(`[AI USAGE] Obteniendo resumen de límites para tienda ${tiendaId}`);

    const { data, error } = await client.rpc('obtener_resumen_limites_ia', {
      p_tienda_id: tiendaId,
    });

    if (error) {
      this.logger.error('[AI USAGE] Error obteniendo resumen:', error);
      throw new Error(`Error al obtener resumen de límites: ${error.message}`);
    }

    this.logger.log(`[AI USAGE] Resumen obtenido:`, data);

    return data as ResumenLimitesIA;
  }

  /**
   * Obtiene un nombre legible para el tipo de uso
   */
  private obtenerNombreLegible(tipoUso: TipoUsoIA): string {
    const nombres: Record<TipoUsoIA, string> = {
      promocion_ia: 'generaciones de promociones con IA',
      campana_ia: 'generaciones de campañas con IA',
      analisis_kpi: 'análisis de KPIs con IA',
    };
    return nombres[tipoUso] || tipoUso;
  }

  /**
   * Mapea el tipo de endpoint al tipo de uso de IA
   */
  static mapearEndpointATipoUso(endpoint: string): TipoUsoIA | null {
    const mapeo: Record<string, TipoUsoIA> = {
      'promo-ideas': 'promocion_ia',
      'email-campaigns': 'campana_ia',
      'kpi-summary': 'analisis_kpi',
      'plan-accion': 'promocion_ia', // Plan de acción cuenta como promoción
    };
    return mapeo[endpoint] || null;
  }
}
