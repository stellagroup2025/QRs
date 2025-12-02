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

    // Obtener el nombre de la tienda para pre-rellenar en el wizard
    const { data: tienda } = await supabase
      .from('tiendas')
      .select('nombre')
      .eq('id', idTienda)
      .single();

    this.logger.log(
      `✅ Progreso obtenido: ${data.porcentaje_completado}% (paso ${data.paso_actual}/5)`,
    );

    // Transformar nombres de columnas de BD a nombres del frontend
    // BD tiene: paso_3_promo, paso_4_regalo, paso_5_qr
    // Frontend espera: paso_3_regalo, paso_4_referidos, paso_5_qr
    return {
      ...data,
      paso_3_regalo: data.paso_4_regalo,     // Mapear paso_4_regalo → paso_3_regalo
      paso_4_referidos: data.paso_3_promo,   // Mapear paso_3_promo → paso_4_referidos
      paso_5_qr: data.paso_5_qr,             // paso_5_qr se mantiene igual
      nombre_tienda: tienda?.nombre || undefined,
    } as ProgresoResponseDto;
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

    // Mapeo de pasos a campos de la BD (5 pasos)
    // Usamos las columnas existentes en la BD
    const camposPaso: Record<number, string> = {
      1: 'paso_1_branding',
      2: 'paso_2_puntos',
      3: 'paso_4_regalo',  // Paso 3 (regalo) usa columna paso_4_regalo
      4: 'paso_3_promo',   // Paso 4 (referidos) usa columna paso_3_promo (reutilizada)
      5: 'paso_5_qr',      // Paso 5 (QR) usa columna paso_5_qr
    };

    const campoPaso = camposPaso[paso];
    if (!campoPaso) {
      throw new Error(`Paso inválido: ${paso}`);
    }

    // Calcular nuevo porcentaje y paso actual (5 pasos)
    // Leemos de las columnas existentes en la BD
    const pasosCompletados = [
      paso === 1 ? true : progresoActual.paso_1_branding,
      paso === 2 ? true : progresoActual.paso_2_puntos,
      paso === 3 ? true : (progresoActual as any).paso_4_regalo,
      paso === 4 ? true : (progresoActual as any).paso_3_promo,
      paso === 5 ? true : (progresoActual as any).paso_5_qr,
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
      `✅ Progreso actualizado: ${progresoActualizado.porcentaje_completado}% (paso ${progresoActualizado.paso_actual}/4)`,
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

    // Paso 3: Regalo de bienvenida
    if (paso === 3) {
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
          // Crear un regalo de tipo descuento en el catálogo para que use el sistema de cupones
          const regaloDescuento = await this.crearRegaloDescuentoBienvenida(
            supabase,
            idTienda,
            data.descuento_porcentaje || 10,
          );

          if (regaloDescuento) {
            updateData.regalo_bienvenida_tipo = 'regalo_concreto';
            updateData.regalo_bienvenida_id_regalo = regaloDescuento.id;
            this.logger.log(`🎁 Configurando descuento ${data.descuento_porcentaje}% como cupón canjeable (ID: ${regaloDescuento.id})`);
          } else {
            // Fallback si falla la creación
            updateData.regalo_bienvenida_tipo = 'cupon';
            updateData.regalo_bienvenida_puntos = data.descuento_porcentaje;
            this.logger.log(`🎁 Configurando descuento: ${data.descuento_porcentaje}% (fallback)`);
          }
        }
      } else {
        updateData.regalo_bienvenida_activo = false;
        this.logger.log(`🎁 Regalo de bienvenida desactivado`);
      }
    }

    // Paso 4: Referidos
    if (paso === 4) {
      if (data.referidos_activo !== undefined) {
        updateData.referidos_activo = data.referidos_activo;
        if (data.referidos_activo) {
          updateData.puntos_referidor = data.puntos_referidor || 100;
          updateData.puntos_referido = data.puntos_referido || 50;
          this.logger.log(`👥 Referidos activados: ${data.puntos_referidor}/${data.puntos_referido} pts`);
        } else {
          this.logger.log(`👥 Referidos desactivados`);
        }

        // IMPORTANTE: También crear/actualizar el programa de referidos en la tabla programas_referidos
        // porque el sistema de referidos usa esa tabla para verificar si está activo
        await this.crearOActualizarProgramaReferidos(
          supabase,
          idTienda,
          data.referidos_activo,
          data.puntos_referidor || 100,
          data.milestones || [],
        );
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
   * Crea un regalo de tipo descuento en el catálogo para usarlo como regalo de bienvenida
   * Si ya existe uno, lo actualiza
   */
  private async crearRegaloDescuentoBienvenida(
    supabase: any,
    idTienda: string,
    porcentaje: number,
  ): Promise<{ id: string } | null> {
    try {
      // Buscar si ya existe un regalo de descuento de bienvenida para esta tienda
      const { data: regaloExistente } = await supabase
        .from('regalos_catalogo')
        .select('id')
        .eq('id_tienda', idTienda)
        .eq('tipo', 'descuento')
        .ilike('nombre', '%bienvenida%')
        .single();

      if (regaloExistente) {
        // Actualizar el porcentaje del regalo existente
        await supabase
          .from('regalos_catalogo')
          .update({
            nombre: `${porcentaje}% de descuento de bienvenida`,
            descripcion: `Cupón de ${porcentaje}% de descuento para tu primera compra. ¡Bienvenido!`,
            detalles: { porcentaje, min_compra: 0 },
            activo: true,
            actualizado_en: new Date().toISOString(),
          })
          .eq('id', regaloExistente.id);

        this.logger.log(`✅ Regalo de descuento actualizado: ${porcentaje}%`);
        return regaloExistente;
      }

      // Crear nuevo regalo de descuento
      const { data: nuevoRegalo, error } = await supabase
        .from('regalos_catalogo')
        .insert({
          id_tienda: idTienda,
          nombre: `${porcentaje}% de descuento de bienvenida`,
          descripcion: `Cupón de ${porcentaje}% de descuento para tu primera compra. ¡Bienvenido!`,
          tipo: 'descuento',
          detalles: { porcentaje, min_compra: 0 },
          instrucciones_canje: 'Muestra este cupón al pagar para aplicar el descuento.',
          icono: 'percent',
          dias_validez: 30, // 30 días de validez
          requiere_validacion_staff: true,
          activo: true,
        })
        .select('id')
        .single();

      if (error) {
        this.logger.error(`❌ Error creando regalo de descuento: ${error.message}`);
        return null;
      }

      this.logger.log(`✅ Regalo de descuento creado: ${porcentaje}% (ID: ${nuevoRegalo.id})`);
      return nuevoRegalo;
    } catch (error) {
      this.logger.error(`❌ Error en crearRegaloDescuentoBienvenida: ${error.message}`);
      return null;
    }
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

  /**
   * Crea o actualiza el programa de referidos en la tabla programas_referidos
   * Esta tabla es la que usa el sistema de referidos para verificar si está activo
   */
  private async crearOActualizarProgramaReferidos(
    supabase: any,
    idTienda: string,
    activo: boolean,
    puntosPorReferido: number,
    milestones: Array<{
      nombre: string;
      cantidad_referidos: number;
      tipo_recompensa: string;
      puntos: number;
      id_regalo?: string;
    }>,
  ): Promise<void> {
    try {
      // Convertir milestones del formato del frontend al formato de la BD
      const recompensas = milestones.map((m) => ({
        objetivo: m.cantidad_referidos,
        tipo: m.tipo_recompensa === 'regalo_concreto' ? 'promocion' : 'puntos',
        valor: m.puntos,
        descripcion: m.nombre,
        id_regalo: m.id_regalo,
      }));

      // Buscar si ya existe un programa de referidos para esta tienda
      const { data: programaExistente } = await supabase
        .from('programas_referidos')
        .select('id')
        .eq('id_tienda', idTienda)
        .single();

      if (programaExistente) {
        // Actualizar el programa existente
        const { error: updateError } = await supabase
          .from('programas_referidos')
          .update({
            activo: activo,
            puntos_por_referido: puntosPorReferido,
            recompensas: recompensas,
            actualizado_en: new Date().toISOString(),
          })
          .eq('id', programaExistente.id);

        if (updateError) {
          this.logger.error(`❌ Error actualizando programa de referidos: ${updateError.message}`);
        } else {
          this.logger.log(`✅ Programa de referidos actualizado (activo: ${activo})`);
        }
      } else {
        // Crear nuevo programa de referidos
        const { error: insertError } = await supabase.from('programas_referidos').insert({
          id_tienda: idTienda,
          nombre: 'Programa de Referidos',
          descripcion: 'Gana puntos por cada amigo que invites a registrarse',
          activo: activo,
          puntos_por_referido: puntosPorReferido,
          recompensas: recompensas,
          vigencia_desde: new Date().toISOString(),
        });

        if (insertError) {
          this.logger.error(`❌ Error creando programa de referidos: ${insertError.message}`);
        } else {
          this.logger.log(`✅ Programa de referidos creado (activo: ${activo})`);
        }
      }
    } catch (error) {
      this.logger.error(`❌ Error en crearOActualizarProgramaReferidos: ${error.message}`);
    }
  }
}
