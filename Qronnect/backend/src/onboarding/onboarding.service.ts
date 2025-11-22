import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { ProgresoResponseDto } from './dto/progreso-response.dto';
import { PlantillaResponseDto } from './dto/plantilla-response.dto';

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Obtiene el progreso del onboarding de una tienda
   */
  async getProgreso(idTienda: string): Promise<ProgresoResponseDto> {
    this.logger.log(`📊 Obteniendo progreso de onboarding para tienda: ${idTienda}`);

    const supabase = this.supabaseService.getClient();

    let { data, error } = await supabase
      .from('onboarding_progress')
      .select('*')
      .eq('id_tienda', idTienda)
      .single();

    // Si no existe, crear automáticamente (tiendas existentes antes de la migración)
    if (error && error.code === 'PGRST116') {
      this.logger.warn(`⚠️ No existe progreso para tienda ${idTienda}, creando...`);

      const { data: newProgress, error: insertError } = await supabase
        .from('onboarding_progress')
        .insert({
          id_tienda: idTienda,
          paso_actual: 1,
          porcentaje_completado: 0,
        })
        .select()
        .single();

      if (insertError) {
        this.logger.error(`❌ Error al crear progreso: ${insertError.message}`);
        throw new Error(`Error al crear progreso: ${insertError.message}`);
      }

      data = newProgress;
      this.logger.log(`✅ Progreso creado automáticamente para tienda ${idTienda}`);
    } else if (error) {
      this.logger.error(`❌ Error al obtener progreso: ${error.message}`);
      throw new NotFoundException(
        `No se encontró progreso de onboarding para la tienda ${idTienda}`,
      );
    }

    this.logger.log(
      `✅ Progreso obtenido: ${data.porcentaje_completado}% (paso ${data.paso_actual}/5)`,
    );

    return data as ProgresoResponseDto;
  }

  /**
   * Actualiza el progreso cuando se completa un paso
   */
  async actualizarProgreso(
    idTienda: string,
    paso: number,
    data: Record<string, any> = {},
  ): Promise<{ paso_actual: number; porcentaje_completado: number; completado: boolean }> {
    this.logger.log(`🔄 Actualizando progreso - Tienda: ${idTienda}, Paso: ${paso}`);
    this.logger.debug(`Datos del paso: ${JSON.stringify(data)}`);

    const supabase = this.supabaseService.getClient();

    // Llamar a la función PostgreSQL actualizar_progreso_onboarding
    const { data: result, error } = await supabase.rpc('actualizar_progreso_onboarding', {
      p_id_tienda: idTienda,
      p_paso: paso,
      p_data: data,
    });

    if (error) {
      this.logger.error(`❌ Error al actualizar progreso: ${error.message}`);
      throw new Error(`Error al actualizar progreso: ${error.message}`);
    }

    // La función retorna una tabla con una fila, extraemos el primer elemento
    const progresoActualizado = Array.isArray(result) ? result[0] : result;

    this.logger.log(
      `✅ Progreso actualizado: ${progresoActualizado.porcentaje_completado}% (paso ${progresoActualizado.paso_actual}/5)`,
    );

    if (progresoActualizado.completado) {
      this.logger.log(`🎉 ¡Onboarding completado para tienda ${idTienda}!`);
      // Aquí podríamos enviar un email de felicitación, registrar analytics, etc.
    }

    return progresoActualizado;
  }

  /**
   * Omite un paso del wizard (tracking para analytics)
   */
  async omitirPaso(idTienda: string, paso: number): Promise<void> {
    this.logger.log(`⏭️ Omitiendo paso ${paso} - Tienda: ${idTienda}`);

    const supabase = this.supabaseService.getClient();

    // Llamar a la función PostgreSQL omitir_paso_onboarding
    const { error } = await supabase.rpc('omitir_paso_onboarding', {
      p_id_tienda: idTienda,
      p_paso: paso,
    });

    if (error) {
      this.logger.error(`❌ Error al omitir paso: ${error.message}`);
      throw new Error(`Error al omitir paso: ${error.message}`);
    }

    this.logger.log(`✅ Paso ${paso} omitido correctamente`);
  }

  /**
   * Obtiene todas las plantillas de promociones
   * Opcionalmente filtra por categoría o tipo de negocio
   */
  async getPlantillas(
    categoria?: string,
    tipoNegocio?: string,
  ): Promise<PlantillaResponseDto[]> {
    this.logger.log(
      `📋 Obteniendo plantillas - Categoría: ${categoria || 'todas'}, Tipo: ${tipoNegocio || 'todos'}`,
    );

    const supabase = this.supabaseService.getClient();

    let query = supabase
      .from('plantillas_promociones')
      .select('*')
      .eq('activa', true)
      .order('orden', { ascending: true });

    if (categoria) {
      query = query.eq('categoria', categoria);
    }

    if (tipoNegocio) {
      query = query.or(`tipo_negocio.eq.${tipoNegocio},tipo_negocio.is.null`);
    }

    const { data, error } = await query;

    if (error) {
      this.logger.error(`❌ Error al obtener plantillas: ${error.message}`);
      throw new Error(`Error al obtener plantillas: ${error.message}`);
    }

    this.logger.log(`✅ Plantillas obtenidas: ${data?.length || 0}`);

    return (data || []) as PlantillaResponseDto[];
  }

  /**
   * Obtiene una plantilla específica por ID
   */
  async getPlantillaById(id: string): Promise<PlantillaResponseDto> {
    this.logger.log(`🔍 Obteniendo plantilla por ID: ${id}`);

    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('plantillas_promociones')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      this.logger.error(`❌ Plantilla no encontrada: ${id}`);
      throw new NotFoundException(`Plantilla con ID ${id} no encontrada`);
    }

    this.logger.log(`✅ Plantilla encontrada: ${data.nombre}`);

    return data as PlantillaResponseDto;
  }

  /**
   * Incrementa el contador de veces usada una plantilla
   */
  async incrementarUsoPlantilla(id: string): Promise<void> {
    this.logger.log(`📈 Incrementando contador de uso para plantilla: ${id}`);

    const supabase = this.supabaseService.getClient();

    const { error } = await supabase.rpc('increment', {
      table_name: 'plantillas_promociones',
      row_id: id,
      column_name: 'veces_usada',
    });

    if (error) {
      // Si la función increment no existe, hacemos un update manual
      const { data: plantilla } = await supabase
        .from('plantillas_promociones')
        .select('veces_usada')
        .eq('id', id)
        .single();

      if (plantilla) {
        await supabase
          .from('plantillas_promociones')
          .update({ veces_usada: (plantilla.veces_usada || 0) + 1 })
          .eq('id', id);
      }
    }

    this.logger.log(`✅ Contador incrementado para plantilla ${id}`);
  }

  /**
   * Obtiene analytics del onboarding
   */
  async getAnalytics() {
    this.logger.log(`📊 Obteniendo analytics de onboarding`);

    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.from('onboarding_analytics').select('*').single();

    if (error) {
      this.logger.error(`❌ Error al obtener analytics: ${error.message}`);
      throw new Error(`Error al obtener analytics: ${error.message}`);
    }

    this.logger.log(`✅ Analytics obtenidos`);

    return data;
  }

  /**
   * Reinicia el progreso de onboarding (útil para testing)
   */
  async reiniciarProgreso(idTienda: string): Promise<void> {
    this.logger.warn(`⚠️ Reiniciando progreso de onboarding para tienda: ${idTienda}`);

    const supabase = this.supabaseService.getClient();

    const { error } = await supabase
      .from('onboarding_progress')
      .update({
        completado: false,
        paso_actual: 1,
        porcentaje_completado: 0,
        paso_1_branding: false,
        paso_2_puntos: false,
        paso_3_promo: false,
        paso_4_regalo: false,
        paso_5_qr: false,
        wizard_data: {},
        fecha_completado: null,
        tiempo_total_segundos: null,
        pasos_omitidos: [],
        fecha_inicio: new Date().toISOString(),
      })
      .eq('id_tienda', idTienda);

    if (error) {
      this.logger.error(`❌ Error al reiniciar progreso: ${error.message}`);
      throw new Error(`Error al reiniciar progreso: ${error.message}`);
    }

    this.logger.log(`✅ Progreso reiniciado correctamente`);
  }
}
