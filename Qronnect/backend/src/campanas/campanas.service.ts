import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { EmailService } from '../email/email.service';
import { CreateCampanaDto } from './dto/create-campana.dto';
import { UpdateCampanaDto } from './dto/update-campana.dto';
import { FiltrosSegmentacionDto } from './dto/filtros-segmentacion.dto';
import { PreviewDestinatariosDto } from './dto/preview-destinatarios.dto';

@Injectable()
export class CampanasService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Crea una nueva campaña de email
   */
  async create(tiendaId: string, adminUserId: string, createDto: CreateCampanaDto) {
    const client = this.supabase.getClient();

    console.log('[CREATE CAMPAÑA]', {
      tiendaId,
      adminUserId,
      createDto,
    });

    // Validar que si está programada, tenga fecha
    if (createDto.estado === 'programada' && !createDto.fecha_programada) {
      throw new BadRequestException('Las campañas programadas requieren una fecha de envío');
    }

    // Determinar los IDs de destinatarios
    let destinatariosIds: string[] = [];

    if (createDto.destinatarios_ids && createDto.destinatarios_ids.length > 0) {
      // Si se proporcionan IDs específicos, usarlos directamente
      destinatariosIds = createDto.destinatarios_ids;
      console.log('[CREATE CAMPAÑA] Usando destinatarios seleccionados:', destinatariosIds.length);
    } else {
      // Si no hay IDs, aplicar filtros de segmentación
      console.log('[CREATE CAMPAÑA] Aplicando filtros de segmentación');
      const clientesQuery = client
        .from('clientes')
        .select('id')
        .eq('id_tienda', tiendaId)
        .eq('activo', true);

      // Aplicar filtros
      const queryConFiltros = this.aplicarFiltrosSegmentacion(
        clientesQuery,
        createDto.filtros_segmentacion || {},
      );

      const { data: clientes, error: clientesError } = await queryConFiltros;

      if (clientesError) {
        console.error('[CREATE CAMPAÑA] Error obteniendo clientes:', clientesError);
        throw new BadRequestException('Error al aplicar filtros de segmentación');
      }

      destinatariosIds = clientes?.map(c => c.id) || [];
      console.log('[CREATE CAMPAÑA] Destinatarios por filtros:', destinatariosIds.length);
    }

    const insertData = {
      id_tienda: tiendaId,
      nombre: createDto.nombre,
      asunto: createDto.asunto,
      contenido_html: createDto.contenido_html,
      contenido_texto: createDto.contenido_texto,
      filtros_segmentacion: createDto.filtros_segmentacion || {},
      estado: createDto.estado || 'borrador',
      fecha_programada: createDto.fecha_programada,
      creado_por: adminUserId,
      total_destinatarios: destinatariosIds.length,
    };

    console.log('[CREATE CAMPAÑA] Insert data:', insertData);

    // Insertar la campaña
    const { data: campana, error } = await client
      .from('campanas_email')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('[CREATE CAMPAÑA] Error from Supabase:', error);
      throw new BadRequestException(`Error al crear la campaña: ${error.message}`);
    }

    // Crear registros de destinatarios
    if (destinatariosIds.length > 0) {
      const destinatariosData = destinatariosIds.map(clienteId => ({
        id_campana: campana.id,
        id_cliente: clienteId,
        estado: 'pendiente',
      }));

      const { error: destinatariosError } = await client
        .from('campanas_destinatarios')
        .insert(destinatariosData);

      if (destinatariosError) {
        console.error('[CREATE CAMPAÑA] Error creando destinatarios:', destinatariosError);
        // No fallar la creación de campaña por esto, pero loguearlo
      } else {
        console.log('[CREATE CAMPAÑA] Destinatarios creados:', destinatariosIds.length);
      }
    }

    console.log('[CREATE CAMPAÑA] Success:', campana);
    return campana;
  }

  /**
   * Lista todas las campañas de una tienda
   */
  async findAll(tiendaId: string) {
    const client = this.supabase.getClient();

    const { data, error } = await client
      .from('campanas_email')
      .select('*')
      .eq('id_tienda', tiendaId)
      .order('creado_en', { ascending: false });

    if (error) {
      console.error('Error listando campañas:', error);
      throw new BadRequestException('Error al listar campañas');
    }

    return data;
  }

  /**
   * Obtiene una campaña específica por ID
   */
  async findOne(tiendaId: string, campanaId: string) {
    const client = this.supabase.getClient();

    const { data, error } = await client
      .from('campanas_email')
      .select('*')
      .eq('id', campanaId)
      .eq('id_tienda', tiendaId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Campaña no encontrada');
    }

    return data;
  }

  /**
   * Actualiza una campaña existente
   */
  async update(tiendaId: string, campanaId: string, updateDto: UpdateCampanaDto) {
    const client = this.supabase.getClient();

    // Verificar que la campaña existe y pertenece a la tienda
    const campanaAnterior = await this.findOne(tiendaId, campanaId);

    const { data, error } = await client
      .from('campanas_email')
      .update({
        nombre: updateDto.nombre,
        asunto: updateDto.asunto,
        contenido_html: updateDto.contenido_html,
        contenido_texto: updateDto.contenido_texto,
        filtros_segmentacion: updateDto.filtros_segmentacion,
        estado: updateDto.estado,
        fecha_programada: updateDto.fecha_programada,
      })
      .eq('id', campanaId)
      .eq('id_tienda', tiendaId)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando campaña:', error);
      throw new BadRequestException('Error al actualizar la campaña');
    }

    // Si cambió el estado a 'enviada', disparar el envío de emails
    if (updateDto.estado === 'enviada' && campanaAnterior.estado !== 'enviada') {
      console.log('[UPDATE CAMPAÑA] Estado cambió a enviada, iniciando envío de emails');
      // Ejecutar el envío de forma asíncrona sin bloquear la respuesta
      this.enviarCampana(tiendaId, campanaId).catch(err => {
        console.error('[UPDATE CAMPAÑA] Error enviando emails:', err);
      });
    }

    return data;
  }

  /**
   * Elimina una campaña
   */
  async remove(tiendaId: string, campanaId: string) {
    const client = this.supabase.getClient();

    // Verificar que existe
    await this.findOne(tiendaId, campanaId);

    const { error } = await client
      .from('campanas_email')
      .delete()
      .eq('id', campanaId)
      .eq('id_tienda', tiendaId);

    if (error) {
      console.error('Error eliminando campaña:', error);
      throw new BadRequestException('Error al eliminar la campaña');
    }

    return { message: 'Campaña eliminada exitosamente' };
  }

  /**
   * Preview de destinatarios según filtros de segmentación
   * Devuelve cuántos clientes recibirán el email y muestra ejemplos
   */
  async previewDestinatarios(
    tiendaId: string,
    filtros: FiltrosSegmentacionDto,
  ): Promise<PreviewDestinatariosDto> {
    const client = this.supabase.getClient();

    console.log('[PREVIEW DESTINATARIOS]', {
      tiendaId,
      filtros,
    });

    // Construir query con los filtros
    let query = client
      .from('clientes')
      .select('id, nombre, email, puntos_totales', { count: 'exact' })
      .eq('id_tienda', tiendaId);

    // Aplicar filtros de segmentación
    query = this.aplicarFiltrosSegmentacion(query, filtros);

    // Limitar a 10 ejemplos
    query = query.limit(10);

    const { data: clientes, error, count } = await query;

    console.log('[PREVIEW RESULT]', {
      count,
      clientesLength: clientes?.length,
      error,
    });

    if (error) {
      console.error('Error en preview de destinatarios:', error);
      throw new BadRequestException('Error al obtener preview de destinatarios');
    }

    // Obtener estadísticas adicionales para cada cliente
    const clientesConStats = await Promise.all(
      clientes.map(async (cliente) => {
        const stats = await this.obtenerEstadisticasCliente(cliente.id);
        return {
          id: cliente.id,
          nombre: cliente.nombre,
          email: cliente.email,
          puntos_totales: cliente.puntos_totales,
          num_compras: stats.num_compras,
          ticket_medio: stats.ticket_medio,
          ultima_visita: stats.ultima_visita,
        };
      }),
    );

    return {
      total_destinatarios: count || 0,
      ejemplos: clientesConStats,
    };
  }

  /**
   * Aplica los filtros de segmentación a un query de clientes
   */
  private aplicarFiltrosSegmentacion(query: any, filtros: FiltrosSegmentacionDto) {
    // NOTA: Los filtros de ticket_medio, num_visitas y ultima_visita requieren
    // hacer joins o subconsultas con la tabla de compras.
    // Por ahora aplicamos los filtros simples directamente en la tabla clientes.
    // Los filtros complejos se aplicarán en una mejora posterior con funciones SQL.

    // Filtro por puntos
    if (filtros.puntos_min !== undefined) {
      query = query.gte('puntos_totales', filtros.puntos_min);
    }
    if (filtros.puntos_max !== undefined) {
      query = query.lte('puntos_totales', filtros.puntos_max);
    }

    // Filtro por edad (calculado a partir de fecha_nacimiento)
    if (filtros.edad_min !== undefined || filtros.edad_max !== undefined) {
      // TODO: Implementar filtro por edad usando función SQL
      // Por ahora lo dejamos como placeholder
    }

    // Filtro por género
    if (filtros.genero) {
      query = query.eq('genero', filtros.genero);
    }

    return query;
  }

  /**
   * Obtiene estadísticas de un cliente (num_compras, ticket_medio, ultima_visita)
   */
  private async obtenerEstadisticasCliente(clienteId: string) {
    const client = this.supabase.getClient();

    const { data, error } = await client
      .from('compras')
      .select('importe, fecha')
      .eq('id_cliente', clienteId)
      .order('fecha', { ascending: false });

    if (error || !data || data.length === 0) {
      return {
        num_compras: 0,
        ticket_medio: 0,
        ultima_visita: null,
      };
    }

    const num_compras = data.length;
    const ticket_medio = data.reduce((sum, c) => sum + c.importe, 0) / num_compras;
    const ultima_visita = data[0].fecha;

    return {
      num_compras,
      ticket_medio: Math.round(ticket_medio * 100) / 100, // 2 decimales
      ultima_visita,
    };
  }

  /**
   * Lista todos los templates de email disponibles
   */
  async getTemplates(tiendaId: string) {
    const client = this.supabase.getClient();

    // Obtener templates del sistema (id_tienda = null) y de la tienda
    const { data, error } = await client
      .from('email_templates')
      .select('*')
      .or(`id_tienda.is.null,id_tienda.eq.${tiendaId}`)
      .eq('activo', true)
      .order('es_sistema', { ascending: false }) // Sistema primero
      .order('creado_en', { ascending: false });

    if (error) {
      console.error('Error listando templates:', error);
      throw new BadRequestException('Error al listar templates');
    }

    return data;
  }

  /**
   * Obtiene un template específico
   */
  async getTemplate(tiendaId: string, templateId: string) {
    const client = this.supabase.getClient();

    const { data, error } = await client
      .from('email_templates')
      .select('*')
      .eq('id', templateId)
      .or(`id_tienda.is.null,id_tienda.eq.${tiendaId}`)
      .single();

    if (error || !data) {
      throw new NotFoundException('Template no encontrado');
    }

    return data;
  }

  /**
   * Envía la campaña a todos los destinatarios
   */
  private async enviarCampana(tiendaId: string, campanaId: string) {
    const client = this.supabase.getClient();

    console.log('[ENVIAR CAMPAÑA] Iniciando envío para campaña:', campanaId);

    // Obtener datos de la campaña
    const campana = await this.findOne(tiendaId, campanaId);

    // Obtener destinatarios de la campaña
    const { data: destinatarios, error: destError } = await client
      .from('campanas_destinatarios')
      .select(`
        id,
        id_cliente,
        clientes (
          id,
          nombre,
          email
        )
      `)
      .eq('id_campana', campanaId)
      .eq('estado', 'pendiente');

    if (destError) {
      console.error('[ENVIAR CAMPAÑA] Error obteniendo destinatarios:', destError);
      throw new BadRequestException('Error obteniendo destinatarios');
    }

    if (!destinatarios || destinatarios.length === 0) {
      console.log('[ENVIAR CAMPAÑA] No hay destinatarios pendientes');
      return;
    }

    console.log(`[ENVIAR CAMPAÑA] Enviando a ${destinatarios.length} destinatarios`);

    // Cambiar estado a 'enviando'
    await client
      .from('campanas_email')
      .update({ estado: 'enviando' })
      .eq('id', campanaId);

    // Enviar emails
    let enviados = 0;
    let fallidos = 0;

    for (const dest of destinatarios) {
      const cliente = dest.clientes as any;

      if (!cliente || !cliente.email) {
        console.warn(`[ENVIAR CAMPAÑA] Cliente sin email, saltando destinatario ${dest.id}`);
        fallidos++;
        continue;
      }

      // Personalizar HTML con variables
      let htmlPersonalizado = campana.contenido_html;
      htmlPersonalizado = htmlPersonalizado.replace(/\{\{nombre\}\}/g, cliente.nombre || '');
      htmlPersonalizado = htmlPersonalizado.replace(/\{\{email\}\}/g, cliente.email || '');

      // Enviar email
      const result = await this.emailService.sendEmail({
        to: cliente.email,
        subject: campana.asunto,
        html: htmlPersonalizado,
      });

      // Actualizar estado del destinatario
      if (result.success) {
        enviados++;
        await client
          .from('campanas_destinatarios')
          .update({
            estado: 'enviado',
            fecha_enviado: new Date().toISOString(),
          })
          .eq('id', dest.id);
      } else {
        fallidos++;
        await client
          .from('campanas_destinatarios')
          .update({
            estado: 'fallido',
            error_mensaje: result.error,
          })
          .eq('id', dest.id);
      }

      // Pequeña pausa entre emails
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Actualizar estadísticas de la campaña
    await client
      .from('campanas_email')
      .update({
        estado: 'enviada',
        fecha_enviada: new Date().toISOString(),
        enviados: enviados,
      })
      .eq('id', campanaId);

    console.log(`[ENVIAR CAMPAÑA] Finalizado: ${enviados} enviados, ${fallidos} fallidos`);
  }
}
