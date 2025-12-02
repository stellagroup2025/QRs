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

    const supabase = this.supabaseService.getAdminClient();

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

    const supabase = this.supabaseService.getAdminClient();

    // Asegurarse de que el registro existe (auto-crear si no existe)
    const progresoActual = await this.getProgreso(idTienda);

    // Mapeo de pasos a campos
    const camposPaso: Record<number, string> = {
      1: 'paso_1_branding',
      2: 'paso_2_puntos',
      3: 'paso_3_promo',
      4: 'paso_4_regalo',
      5: 'paso_5_qr',
    };

    const campoPaso = camposPaso[paso];
    if (!campoPaso) {
      throw new Error(`Paso inválido: ${paso}`);
    }

    // Calcular nuevo porcentaje y paso actual
    const pasosCompletados = [
      paso === 1 ? true : progresoActual.paso_1_branding,
      paso === 2 ? true : progresoActual.paso_2_puntos,
      paso === 3 ? true : progresoActual.paso_3_promo,
      paso === 4 ? true : progresoActual.paso_4_regalo,
      paso === 5 ? true : progresoActual.paso_5_qr,
    ];

    const cantidadCompletados = pasosCompletados.filter(Boolean).length;
    const porcentajeCompletado = Math.round((cantidadCompletados / 5) * 100);
    const completado = cantidadCompletados === 5;
    const nuevoPasoActual = completado ? 5 : Math.min(paso + 1, 5);

    // Merge de wizard_data
    const wizardDataActualizado = {
      ...(progresoActual.wizard_data || {}),
      ...data,
    };

    // Update directo en la tabla
    const { error } = await supabase
      .from('onboarding_progress')
      .update({
        [campoPaso]: true,
        paso_actual: nuevoPasoActual,
        porcentaje_completado: porcentajeCompletado,
        completado: completado,
        wizard_data: wizardDataActualizado,
        fecha_completado: completado ? new Date().toISOString() : null,
      })
      .eq('id_tienda', idTienda);

    if (error) {
      this.logger.error(`❌ Error al actualizar progreso: ${error.message}`);
      throw new Error(`Error al actualizar progreso: ${error.message}`);
    }

    // Aplicar configuración a la tienda según el paso
    await this.aplicarConfiguracionTienda(supabase, idTienda, paso, data);

    const progresoActualizado = {
      paso_actual: nuevoPasoActual,
      porcentaje_completado: porcentajeCompletado,
      completado: completado,
    };

    this.logger.log(
      `✅ Progreso actualizado: ${progresoActualizado.porcentaje_completado}% (paso ${progresoActualizado.paso_actual}/5)`,
    );

    if (progresoActualizado.completado) {
      this.logger.log(`🎉 ¡Onboarding completado para tienda ${idTienda}!`);
    }

    return progresoActualizado;
  }

  /**
   * Aplica la configuración del onboarding a la tabla tiendas
   */
  private async aplicarConfiguracionTienda(
    supabase: any,
    idTienda: string,
    paso: number,
    data: Record<string, any>,
  ): Promise<void> {
    const updateData: Record<string, any> = {};

    // Paso 2: Puntos por euro
    if (paso === 2 && data.puntos_por_euro) {
      updateData.configuracion = { puntos_por_euro: data.puntos_por_euro };
      this.logger.log(`🔧 Aplicando puntos_por_euro: ${data.puntos_por_euro}`);
    }

    // Paso 4: Regalo de bienvenida y referidos
    if (paso === 4) {
      // Regalo de bienvenida
      if (data.tipo_regalo && data.tipo_regalo !== 'ninguno') {
        updateData.regalo_bienvenida_activo = true;

        if (data.tipo_regalo === 'puntos') {
          updateData.regalo_bienvenida_tipo = 'puntos';
          updateData.regalo_bienvenida_puntos = data.cantidad_puntos || 100;
          this.logger.log(`🎁 Configurando regalo: ${data.cantidad_puntos} puntos de bienvenida`);
        } else if (data.tipo_regalo === 'regalo') {
          updateData.regalo_bienvenida_tipo = 'regalo_concreto';
          updateData.regalo_bienvenida_id_regalo = data.id_regalo;
          this.logger.log(`🎁 Configurando regalo concreto: ${data.id_regalo}`);
        } else if (data.tipo_regalo === 'descuento') {
          updateData.regalo_bienvenida_tipo = 'cupon';
          updateData.regalo_bienvenida_puntos = data.descuento_porcentaje; // Usar para guardar el %
          this.logger.log(`🎁 Configurando descuento: ${data.descuento_porcentaje}%`);
        }
      } else {
        updateData.regalo_bienvenida_activo = false;
        this.logger.log(`🎁 Regalo de bienvenida desactivado`);
      }

      // Referidos
      if (data.referidos_activo !== undefined) {
        updateData.referidos_activo = data.referidos_activo;
        if (data.referidos_activo) {
          updateData.puntos_referidor = data.puntos_referidor || 100;
          updateData.puntos_referido = data.puntos_referido || 50;
          this.logger.log(`👥 Referidos activados: ${data.puntos_referidor}/${data.puntos_referido} pts`);
        }
      }
    }

    // Si hay algo que actualizar, hacerlo
    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('tiendas')
        .update(updateData)
        .eq('id', idTienda);

      if (updateError) {
        this.logger.error(`❌ Error aplicando config a tienda: ${updateError.message}`);
      } else {
        this.logger.log(`✅ Configuración aplicada a tienda`);
      }
    }
  }

  /**
   * Omite un paso del wizard (tracking para analytics)
   */
  async omitirPaso(idTienda: string, paso: number): Promise<void> {
    this.logger.log(`⏭️ Omitiendo paso ${paso} - Tienda: ${idTienda}`);

    const supabase = this.supabaseService.getAdminClient();

    // Obtener progreso actual
    const progresoActual = await this.getProgreso(idTienda);

    // Agregar paso a la lista de omitidos
    const pasosOmitidos = progresoActual.pasos_omitidos || [];
    const pasoKey = `paso_${paso}`;
    if (!pasosOmitidos.includes(pasoKey)) {
      pasosOmitidos.push(pasoKey);
    }

    // Actualizar paso actual sin marcar como completado
    const nuevoPasoActual = Math.min(paso + 1, 5);

    const { error } = await supabase
      .from('onboarding_progress')
      .update({
        paso_actual: nuevoPasoActual,
        pasos_omitidos: pasosOmitidos,
      })
      .eq('id_tienda', idTienda);

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

    const supabase = this.supabaseService.getAdminClient();

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

    const supabase = this.supabaseService.getAdminClient();

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

    const supabase = this.supabaseService.getAdminClient();

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

    const supabase = this.supabaseService.getAdminClient();

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

    const supabase = this.supabaseService.getAdminClient();

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
