import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateCampanaDto } from './dto/create-campana.dto';
import { UpdateCampanaDto } from './dto/update-campana.dto';
import { FiltrosSegmentacionDto } from './dto/filtros-segmentacion.dto';
import { PreviewDestinatariosDto } from './dto/preview-destinatarios.dto';

@Injectable()
export class CampanasService {
  constructor(private readonly supabase: SupabaseService) {}

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
    await this.findOne(tiendaId, campanaId);

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
}
