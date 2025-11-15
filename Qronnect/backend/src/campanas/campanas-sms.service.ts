import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { SmsService } from '../sms/sms.service';
import { GeminiService } from '../ai/gemini.service';
import { CreateCampanaSmsDto } from './dto/create-campana-sms.dto';
import { UpdateCampanaSmsDto } from './dto/update-campana-sms.dto';
import { FiltrosSegmentacionDto } from './dto/filtros-segmentacion.dto';
import { GenerarSmsIaDto } from './dto/generar-sms-ia.dto';

@Injectable()
export class CampanasSmsService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly smsService: SmsService,
    private readonly geminiService: GeminiService,
  ) {}

  /**
   * Crea una nueva campaña SMS
   */
  async create(tiendaId: string, adminUserId: string, createDto: CreateCampanaSmsDto) {
    const client = this.supabase.getClient();

    console.log('[CREATE CAMPAÑA SMS]', {
      tiendaId,
      adminUserId,
      createDto,
    });

    // Validar longitud del mensaje
    if (createDto.mensaje.length > 1600) {
      throw new BadRequestException('El mensaje no puede superar 1600 caracteres (10 SMS)');
    }

    // Validar que si está programada, tenga fecha
    if (createDto.estado === 'programada' && !createDto.fecha_programada) {
      throw new BadRequestException('Las campañas programadas requieren una fecha de envío');
    }

    // Determinar los IDs de destinatarios
    let destinatariosIds: string[] = [];

    if (createDto.destinatarios_ids && createDto.destinatarios_ids.length > 0) {
      destinatariosIds = createDto.destinatarios_ids;
      console.log('[CREATE CAMPAÑA SMS] Usando destinatarios seleccionados:', destinatariosIds.length);
    } else {
      // Aplicar filtros de segmentación
      console.log('[CREATE CAMPAÑA SMS] Aplicando filtros de segmentación');
      const clientesQuery = client
        .from('clientes')
        .select('id')
        .eq('id_tienda', tiendaId)
        .eq('activo', true)
        .not('telefono', 'is', null); // Solo clientes con teléfono

      const queryConFiltros = await this.aplicarFiltrosSegmentacion(
        clientesQuery,
        createDto.filtros_segmentacion || {},
      );

      const { data: clientes, error: clientesError } = await queryConFiltros;

      if (clientesError) {
        console.error('[CREATE CAMPAÑA SMS] Error obteniendo clientes:', clientesError);
        throw new BadRequestException('Error al aplicar filtros de segmentación');
      }

      destinatariosIds = clientes?.map((c) => c.id) || [];
      console.log('[CREATE CAMPAÑA SMS] Destinatarios por filtros:', destinatariosIds.length);
    }

    // Calcular costo estimado
    const costoEstimado = this.calcularCostoEstimado(createDto.mensaje, destinatariosIds.length);

    const insertData = {
      id_tienda: tiendaId,
      nombre: createDto.nombre,
      mensaje: createDto.mensaje,
      filtros_segmentacion: createDto.filtros_segmentacion || {},
      estado: createDto.estado || 'borrador',
      fecha_programada: createDto.fecha_programada,
      creado_por: adminUserId,
      total_destinatarios: destinatariosIds.length,
      tipo: createDto.tipo || 'promocional',
      envio_unico: createDto.envio_unico || false,
      asunto: createDto.asunto,
      remitente_nombre: createDto.remitente_nombre,
      hora_programada: createDto.hora_programada,
      zona_horaria: createDto.zona_horaria || 'Europe/Madrid',
      costo_estimado: costoEstimado,
    };

    console.log('[CREATE CAMPAÑA SMS] Insert data:', insertData);

    // Insertar la campaña
    const { data: campana, error } = await client
      .from('campanas_sms')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('[CREATE CAMPAÑA SMS] Error from Supabase:', error);
      throw new BadRequestException(`Error al crear la campaña: ${error.message}`);
    }

    // Crear registros de destinatarios
    if (destinatariosIds.length > 0) {
      const destinatariosData = destinatariosIds.map((clienteId) => ({
        id_campana: campana.id,
        id_cliente: clienteId,
        estado: 'pendiente',
      }));

      const { error: destinatariosError } = await client
        .from('campanas_sms_destinatarios')
        .insert(destinatariosData);

      if (destinatariosError) {
        console.error('[CREATE CAMPAÑA SMS] Error creando destinatarios:', destinatariosError);
      } else {
        console.log('[CREATE CAMPAÑA SMS] Destinatarios creados:', destinatariosIds.length);
      }
    }

    console.log('[CREATE CAMPAÑA SMS] Success:', campana);
    return campana;
  }

  /**
   * Lista todas las campañas SMS de una tienda
   */
  async findAll(tiendaId: string) {
    const client = this.supabase.getClient();

    const { data, error } = await client
      .from('campanas_sms')
      .select('*')
      .eq('id_tienda', tiendaId)
      .order('creado_en', { ascending: false });

    if (error) {
      console.error('Error listando campañas SMS:', error);
      throw new BadRequestException('Error al listar campañas SMS');
    }

    return data;
  }

  /**
   * Obtiene una campaña SMS específica por ID
   */
  async findOne(tiendaId: string, campanaId: string) {
    const client = this.supabase.getClient();

    const { data, error } = await client
      .from('campanas_sms')
      .select('*')
      .eq('id', campanaId)
      .eq('id_tienda', tiendaId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Campaña SMS no encontrada');
    }

    return data;
  }

  /**
   * Actualiza una campaña SMS existente
   */
  async update(tiendaId: string, campanaId: string, updateDto: UpdateCampanaSmsDto) {
    const client = this.supabase.getClient();

    // Verificar que la campaña existe y pertenece a la tienda
    const campanaAnterior = await this.findOne(tiendaId, campanaId);

    const { data, error } = await client
      .from('campanas_sms')
      .update({
        nombre: updateDto.nombre,
        mensaje: updateDto.mensaje,
        filtros_segmentacion: updateDto.filtros_segmentacion,
        estado: updateDto.estado,
        fecha_programada: updateDto.fecha_programada,
      })
      .eq('id', campanaId)
      .eq('id_tienda', tiendaId)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando campaña SMS:', error);
      throw new BadRequestException('Error al actualizar la campaña SMS');
    }

    // Si cambió el estado a 'enviada', disparar el envío de SMS
    if (updateDto.estado === 'enviada' && campanaAnterior.estado !== 'enviada') {
      console.log('[UPDATE CAMPAÑA SMS] Estado cambió a enviada, iniciando envío de SMS');
      this.enviarCampana(tiendaId, campanaId).catch((err) => {
        console.error('[UPDATE CAMPAÑA SMS] Error enviando SMS:', err);
      });
    }

    return data;
  }

  /**
   * Elimina una campaña SMS
   */
  async remove(tiendaId: string, campanaId: string) {
    const client = this.supabase.getClient();

    // Verificar que existe
    await this.findOne(tiendaId, campanaId);

    const { error } = await client
      .from('campanas_sms')
      .delete()
      .eq('id', campanaId)
      .eq('id_tienda', tiendaId);

    if (error) {
      console.error('Error eliminando campaña SMS:', error);
      throw new BadRequestException('Error al eliminar la campaña SMS');
    }

    return { message: 'Campaña SMS eliminada exitosamente' };
  }

  /**
   * Preview de destinatarios según filtros de segmentación
   */
  async previewDestinatarios(tiendaId: string, filtros: FiltrosSegmentacionDto) {
    const client = this.supabase.getClient();

    console.log('[PREVIEW DESTINATARIOS SMS]', {
      tiendaId,
      filtros,
    });

    // Construir query con los filtros
    let query = client
      .from('clientes')
      .select('id, nombre, telefono, puntos_totales', { count: 'exact' })
      .eq('id_tienda', tiendaId)
      .not('telefono', 'is', null); // Solo clientes con teléfono

    // Aplicar filtros de segmentación
    query = await this.aplicarFiltrosSegmentacion(query, filtros);

    // Limitar a 10 ejemplos
    query = query.limit(10);

    const { data: clientes, error, count } = await query;

    console.log('[PREVIEW SMS RESULT]', {
      count,
      clientesLength: clientes?.length,
      error,
    });

    if (error) {
      console.error('Error en preview de destinatarios SMS:', error);
      throw new BadRequestException('Error al obtener preview de destinatarios');
    }

    return {
      total_destinatarios: count || 0,
      ejemplos: clientes || [],
    };
  }

  /**
   * Envía la campaña SMS a todos los destinatarios
   */
  private async enviarCampana(tiendaId: string, campanaId: string) {
    const client = this.supabase.getClient();

    console.log('[ENVIAR CAMPAÑA SMS] Iniciando envío para campaña:', campanaId);

    // Obtener datos de la campaña
    const campana = await this.findOne(tiendaId, campanaId);

    // Obtener destinatarios de la campaña
    const { data: destinatarios, error: destError } = await client
      .from('campanas_sms_destinatarios')
      .select(
        `
        id,
        id_cliente,
        clientes (
          id,
          nombre,
          telefono
        )
      `,
      )
      .eq('id_campana', campanaId)
      .eq('estado', 'pendiente');

    if (destError) {
      console.error('[ENVIAR CAMPAÑA SMS] Error obteniendo destinatarios:', destError);
      throw new BadRequestException('Error obteniendo destinatarios');
    }

    if (!destinatarios || destinatarios.length === 0) {
      console.log('[ENVIAR CAMPAÑA SMS] No hay destinatarios pendientes');
      return;
    }

    console.log(`[ENVIAR CAMPAÑA SMS] Enviando a ${destinatarios.length} destinatarios`);

    // Cambiar estado a 'enviando'
    await client.from('campanas_sms').update({ estado: 'enviando' }).eq('id', campanaId);

    // Enviar SMS
    let enviados = 0;
    let fallidos = 0;
    let costeTotal = 0;

    for (const dest of destinatarios) {
      const cliente = dest.clientes as any;

      if (!cliente || !cliente.telefono) {
        console.warn(`[ENVIAR CAMPAÑA SMS] Cliente sin teléfono, saltando destinatario ${dest.id}`);
        fallidos++;
        continue;
      }

      // Personalizar mensaje con variables
      let mensajePersonalizado = campana.mensaje;
      mensajePersonalizado = mensajePersonalizado.replace(/\{\{nombre\}\}/g, cliente.nombre || '');

      // Detectar operador
      const operador = this.detectarOperador(cliente.telefono);
      const tiempoInicio = Date.now();

      // Enviar SMS
      const result = await this.smsService.sendSms({
        tiendaId: tiendaId,
        to: cliente.telefono,
        message: mensajePersonalizado,
      });

      const tiempoEntrega = Math.floor((Date.now() - tiempoInicio) / 1000); // segundos

      // Actualizar estado del destinatario
      if (result.success) {
        enviados++;
        costeTotal += result.coste || 0;

        await client
          .from('campanas_sms_destinatarios')
          .update({
            estado: 'enviado',
            fecha_enviado: new Date().toISOString(),
            message_sid: result.messageSid,
            coste: result.coste,
            telefono_destinatario: cliente.telefono,
            operador: operador,
            tiempo_entrega: tiempoEntrega,
            fecha_entregado: new Date().toISOString(),
          })
          .eq('id', dest.id);

        // Registrar en tabla de envíos globales
        await client.from('envios_sms').insert({
          id_campana: campanaId,
          id_cliente: cliente.id,
          id_tienda: tiendaId,
          fecha_envio: new Date().toISOString(),
          estado: 'enviado',
          telefono_destinatario: cliente.telefono,
          mensaje: mensajePersonalizado,
          coste: result.coste,
          modo: result.modo,
        });
      } else {
        fallidos++;
        await client
          .from('campanas_sms_destinatarios')
          .update({
            estado: 'fallido',
            error_mensaje: result.error,
          })
          .eq('id', dest.id);

        // Registrar envío fallido
        await client.from('envios_sms').insert({
          id_campana: campanaId,
          id_cliente: cliente.id,
          id_tienda: tiendaId,
          fecha_envio: new Date().toISOString(),
          estado: 'error',
          telefono_destinatario: cliente.telefono,
          mensaje: mensajePersonalizado,
          metadata: { error: result.error },
        });
      }

      // Pequeña pausa entre SMS (evitar rate limiting)
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Actualizar estadísticas de la campaña
    await client
      .from('campanas_sms')
      .update({
        estado: 'enviada',
        fecha_enviada: new Date().toISOString(),
        enviados: enviados,
        fallidos: fallidos,
        coste_total: costeTotal,
        costo_real: costeTotal, // Guardar también en costo_real
      })
      .eq('id', campanaId);

    // Calcular estadísticas detalladas
    await this.getEstadisticas(tiendaId, campanaId);

    console.log(`[ENVIAR CAMPAÑA SMS] Finalizado: ${enviados} enviados, ${fallidos} fallidos, coste: ${costeTotal.toFixed(2)}€`);
  }

  /**
   * Calcula el costo estimado de una campaña SMS
   */
  private calcularCostoEstimado(mensaje: string, numDestinatarios: number): number {
    const costoPorSms = 0.055; // 5.5 céntimos por SMS
    let numSms: number;

    // Calcular número de SMS necesarios
    const longitudMensaje = mensaje.length;

    if (longitudMensaje <= 160) {
      numSms = 1;
    } else if (longitudMensaje <= 306) {
      numSms = 2;
    } else if (longitudMensaje <= 459) {
      numSms = 3;
    } else {
      numSms = Math.ceil(longitudMensaje / 153);
    }

    return numSms * costoPorSms * numDestinatarios;
  }

  /**
   * Detecta el operador telefónico por prefijo (España)
   */
  private detectarOperador(telefono: string): string {
    const telefonoLimpio = telefono.replace(/[^0-9]/g, '');
    let prefijo: string;

    if (telefonoLimpio.startsWith('34')) {
      prefijo = telefonoLimpio.substring(2, 5);
    } else if (telefonoLimpio.length === 9) {
      prefijo = telefonoLimpio.substring(0, 3);
    } else {
      return 'desconocido';
    }

    // Mapeo de prefijos a operadores (España)
    const prefijoNum = parseInt(prefijo);

    if (prefijoNum >= 600 && prefijoNum <= 609) return 'Movistar';
    if (prefijoNum >= 610 && prefijoNum <= 619) return 'Vodafone';
    if (prefijoNum >= 620 && prefijoNum <= 629) return 'Orange';
    if (prefijoNum >= 630 && prefijoNum <= 639) return 'Yoigo/MásMóvil';

    return 'Otro';
  }

  /**
   * Obtiene estadísticas detalladas de una campaña
   */
  async getEstadisticas(tiendaId: string, campanaId: string) {
    const client = this.supabase.getClient();

    // Verificar que la campaña existe y pertenece a la tienda
    await this.findOne(tiendaId, campanaId);

    // Llamar a la función de PostgreSQL para calcular estadísticas
    const { data, error } = await client.rpc('calcular_estadisticas_campana_sms', {
      p_campana_id: campanaId,
    });

    if (error) {
      console.error('Error calculando estadísticas:', error);
      throw new BadRequestException('Error al calcular estadísticas');
    }

    return data;
  }

  /**
   * Genera un mensaje SMS usando IA (Gemini)
   * Enriquece el contexto con la configuración de IA de la tienda
   */
  async generarSmsConIA(tiendaId: string, dto: GenerarSmsIaDto) {
    try {
      const client = this.supabase.getClient();

      // Cargar configuración de IA de la tienda
      const { data: tienda } = await client
        .from('tiendas')
        .select('nombre, config_ia')
        .eq('id', tiendaId)
        .single();

      const configIA = tienda?.config_ia || {};
      const nombreTienda = tienda?.nombre || 'tu negocio';

      // Construir contexto enriquecido
      let contextoEnriquecido = dto.contextoNegocio || '';

      if (configIA && Object.keys(configIA).length > 0) {
        const partes: string[] = [];

        if (configIA.tipo_negocio) {
          partes.push(`Negocio: ${configIA.tipo_negocio}`);
        }

        if (configIA.tono_comunicacion) {
          partes.push(`Tono: ${configIA.tono_comunicacion}`);
        }

        if (configIA.valores_marca && configIA.valores_marca.length > 0) {
          partes.push(`Valores: ${configIA.valores_marca.join(', ')}`);
        }

        if (configIA.slogan) {
          partes.push(`Slogan: "${configIA.slogan}"`);
        }

        if (configIA.hashtags && configIA.hashtags.length > 0) {
          partes.push(`Hashtags: ${configIA.hashtags.join(' ')}`);
        }

        if (partes.length > 0) {
          contextoEnriquecido = partes.join('. ') + '. ' + contextoEnriquecido;
        }
      }

      // Usar el tono desde config_ia si no se especifica en el dto
      const tonoFinal = dto.tono || configIA.tono_comunicacion || 'profesional';

      return await this.geminiService.generarCampanaSMS({
        contextoNegocio: contextoEnriquecido,
        objetivo: dto.objetivo,
        mensajeClave: dto.mensajeClave,
        tono: tonoFinal,
        urgencia: dto.urgencia,
        incluirCTA: dto.incluirCTA,
        variables: dto.variables,
      });
    } catch (error) {
      console.error('Error generando SMS con IA:', error);
      throw new BadRequestException(`Error al generar SMS con IA: ${error.message}`);
    }
  }

  /**
   * Aplica los filtros de segmentación a un query de clientes
   */
  private async aplicarFiltrosSegmentacion(query: any, filtros: FiltrosSegmentacionDto) {
    // Reutilizar la misma lógica que campañas email
    // Filtro por puntos
    if (filtros.puntos_min !== undefined) {
      query = query.gte('puntos_totales', filtros.puntos_min);
    }
    if (filtros.puntos_max !== undefined) {
      query = query.lte('puntos_totales', filtros.puntos_max);
    }

    // Filtro por género
    if (filtros.genero) {
      query = query.eq('genero', filtros.genero);
    }

    // Filtros de historial de campañas
    const tieneFiltrosCampanas =
      filtros.excluir_campana_id ||
      filtros.excluir_campanas_ultimos_dias !== undefined ||
      filtros.solo_sin_campanas ||
      filtros.dias_desde_ultima_campana_min !== undefined;

    if (tieneFiltrosCampanas) {
      const client = this.supabase.getAdminClient();
      const { data: clientesValidos, error } = await client.rpc('filtrar_clientes_campana', {
        p_tienda_id: query._url.searchParams.get('id_tienda'),
        p_excluir_campana_id: filtros.excluir_campana_id || null,
        p_excluir_ultimos_dias: filtros.excluir_campanas_ultimos_dias || null,
        p_solo_sin_campanas: filtros.solo_sin_campanas || false,
        p_dias_desde_ultima_min: filtros.dias_desde_ultima_campana_min || null,
      });

      if (!error && clientesValidos) {
        const idsValidos = clientesValidos.map((c: any) => c.id_cliente);
        if (idsValidos.length > 0) {
          query = query.in('id', idsValidos);
        } else {
          query = query.eq('id', '00000000-0000-0000-0000-000000000000');
        }
      }
    }

    return query;
  }
}
