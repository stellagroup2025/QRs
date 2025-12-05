import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import { EmailService } from '../email/email.service';
import { CreateCampanaDto } from './dto/create-campana.dto';
import { UpdateCampanaDto } from './dto/update-campana.dto';
import { FiltrosSegmentacionDto } from './dto/filtros-segmentacion.dto';
import { PreviewDestinatariosDto } from './dto/preview-destinatarios.dto';
import { SugerenciasFiltrosDto } from './dto/sugerencias-filtros.dto';

@Injectable()
export class CampanasService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Crea una nueva campaña de email
   */
  async create(tiendaId: string, adminUserId: string, createDto: CreateCampanaDto) {
    // Usar getAdminClient para evitar problemas de RLS
    const client = this.supabase.getAdminClient();

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
      const queryConFiltros = await this.aplicarFiltrosSegmentacion(
        clientesQuery,
        createDto.filtros_segmentacion || {},
      );

      const { data: clientes, error: clientesError } = await queryConFiltros;

      if (clientesError) {
        console.error('[CREATE CAMPAÑA] Error obteniendo clientes:', clientesError);
        throw new BadRequestException('Error al aplicar filtros de segmentación');
      }

      destinatariosIds = clientes?.map((c) => c.id) || [];
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
      tipo: createDto.tipo || 'promocional',
      envio_unico: createDto.envio_unico || false,
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
      const destinatariosData = destinatariosIds.map((clienteId) => ({
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
    const client = this.supabase.getAdminClient();

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
    // Usar getAdminClient para evitar problemas de RLS
    const client = this.supabase.getAdminClient();

    // Verificar que la campaña existe y pertenece a la tienda
    const campanaAnterior = await this.findOne(tiendaId, campanaId);

    // Si se proporcionan nuevos destinatarios, actualizar la tabla de destinatarios
    if (updateDto.destinatarios_ids && updateDto.destinatarios_ids.length > 0) {
      // Eliminar destinatarios anteriores
      await client.from('campanas_destinatarios').delete().eq('id_campana', campanaId);

      // Crear nuevos destinatarios
      const destinatariosData = updateDto.destinatarios_ids.map((clienteId) => ({
        id_campana: campanaId,
        id_cliente: clienteId,
        estado: 'pendiente',
      }));

      const { error: destinatariosError } = await client
        .from('campanas_destinatarios')
        .insert(destinatariosData);

      if (destinatariosError) {
        console.error('[UPDATE CAMPAÑA] Error actualizando destinatarios:', destinatariosError);
      }
    }

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
        total_destinatarios: updateDto.destinatarios_ids?.length || campanaAnterior.total_destinatarios,
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
      this.enviarCampana(tiendaId, campanaId).catch((err) => {
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
    query = await this.aplicarFiltrosSegmentacion(query, filtros);

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

    // Obtener estadísticas adicionales y historial de campañas para cada cliente
    const clientesConStats = await Promise.all(
      clientes.map(async (cliente) => {
        const stats = await this.obtenerEstadisticasCliente(cliente.id);
        const historialCampanas = await this.obtenerHistorialCampanas(cliente.id);

        return {
          id: cliente.id,
          nombre: cliente.nombre,
          email: cliente.email,
          puntos_totales: cliente.puntos_totales,
          num_compras: stats.num_compras,
          ticket_medio: stats.ticket_medio,
          ultima_visita: stats.ultima_visita,
          historial_campanas: historialCampanas.map((envio) => ({
            campana_nombre: envio.campanas_email?.nombre || 'Campaña eliminada',
            campana_tipo: envio.campanas_email?.tipo || 'desconocido',
            fecha_envio: envio.fecha_envio,
            estado: envio.estado,
          })),
          total_campanas_recibidas: historialCampanas.length,
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
   * NOTA: Los filtros de historial de campañas se aplican mediante función SQL
   */
  private async aplicarFiltrosSegmentacion(query: any, filtros: FiltrosSegmentacionDto) {
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

    // Filtros de historial de campañas - si hay alguno activo, usar función SQL
    const tieneFiltrosCampanas =
      filtros.excluir_campana_id ||
      filtros.excluir_campanas_ultimos_dias !== undefined ||
      filtros.solo_sin_campanas ||
      filtros.dias_desde_ultima_campana_min !== undefined;

    if (tieneFiltrosCampanas) {
      // Obtener IDs de clientes que cumplen los filtros de campañas
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
          // Si no hay clientes válidos, forzar query vacío
          query = query.eq('id', '00000000-0000-0000-0000-000000000000');
        }
      }
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
    const client = this.supabase.getAdminClient();

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
    const client = this.supabase.getAdminClient();

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
    // Usar getAdminClient para evitar problemas de RLS al acceder a destinatarios
    const client = this.supabase.getAdminClient();

    console.log('[ENVIAR CAMPAÑA] Iniciando envío para campaña:', campanaId);

    // Obtener datos de la campaña
    const campana = await this.findOne(tiendaId, campanaId);

    // Obtener información de la tienda para el remitente dinámico
    const { data: tienda } = await client
      .from('tiendas')
      .select('nombre, dominio')
      .eq('id', tiendaId)
      .single();

    const nombreTienda = tienda?.nombre || 'Qronnect';
    const dominioTienda = tienda?.dominio || 'qronnect';

    // Configurar remitente dinámico (igual que en OTP)
    const useWildcard = process.env.RESEND_WILDCARD_ENABLED === 'true';
    const fromEmail = useWildcard
      ? `${nombreTienda} <noreply@${dominioTienda}.qronnect.es>`
      : `${nombreTienda} <noreply@qronnect.es>`;

    console.log('[ENVIAR CAMPAÑA] Email remitente:', fromEmail);

    // Obtener destinatarios de la campaña con todos los datos del cliente
    const { data: destinatarios, error: destError } = await client
      .from('campanas_destinatarios')
      .select(
        `
        id,
        id_cliente,
        clientes (
          id,
          nombre,
          email,
          puntos_totales,
          unsubscribe_token
        )
      `,
      )
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
    await client.from('campanas_email').update({ estado: 'enviando' }).eq('id', campanaId);

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

      // Personalizar HTML con variables (soporta espacios opcionales: {{nombre}} o {{ nombre }})
      let htmlPersonalizado = campana.contenido_html;

      // Log para debug
      console.log(`[ENVIAR CAMPAÑA] Personalizando para: ${cliente.nombre} <${cliente.email}>`);

      // Reemplazar variables con regex que soporta espacios opcionales
      htmlPersonalizado = htmlPersonalizado.replace(/\{\{\s*nombre\s*\}\}/gi, cliente.nombre || '');
      htmlPersonalizado = htmlPersonalizado.replace(/\{\{\s*email\s*\}\}/gi, cliente.email || '');
      htmlPersonalizado = htmlPersonalizado.replace(/\{\{\s*puntos\s*\}\}/gi, String(cliente.puntos_totales || 0));

      // Añadir enlace de baja (unsubscribe) al final del HTML
      const baseUrl = this.configService.get('FRONTEND_URL') || 'https://qronnect.es';
      const unsubscribeUrl = `${baseUrl}/unsubscribe?token=${cliente.unsubscribe_token}`;
      const unsubscribeFooter = `
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="font-size: 12px; color: #6b7280; margin: 0;">
            Si no deseas recibir más emails de marketing, puedes
            <a href="${unsubscribeUrl}" style="color: #3b82f6; text-decoration: underline;">darte de baja aquí</a>
          </p>
        </div>
      `;

      // Si el HTML ya tiene un </body>, insertar antes; si no, añadir al final
      if (htmlPersonalizado.includes('</body>')) {
        htmlPersonalizado = htmlPersonalizado.replace('</body>', `${unsubscribeFooter}</body>`);
      } else {
        htmlPersonalizado += unsubscribeFooter;
      }

      // Enviar email con remitente dinámico
      const result = await this.emailService.sendEmail({
        to: cliente.email,
        subject: campana.asunto,
        html: htmlPersonalizado,
        from: fromEmail,
      });

      // Actualizar estado del destinatario y registrar en envios_campanas
      if (result.success) {
        enviados++;
        await client
          .from('campanas_destinatarios')
          .update({
            estado: 'enviado',
            fecha_enviado: new Date().toISOString(),
          })
          .eq('id', dest.id);

        // Registrar en tabla de envíos de campañas
        await client.from('envios_campanas').insert({
          id_campana: campanaId,
          id_cliente: cliente.id,
          id_tienda: tiendaId,
          fecha_envio: new Date().toISOString(),
          estado: 'enviado',
          email_destinatario: cliente.email,
        });
      } else {
        fallidos++;
        await client
          .from('campanas_destinatarios')
          .update({
            estado: 'fallido',
            error_mensaje: result.error,
          })
          .eq('id', dest.id);

        // Registrar envío fallido
        await client.from('envios_campanas').insert({
          id_campana: campanaId,
          id_cliente: cliente.id,
          id_tienda: tiendaId,
          fecha_envio: new Date().toISOString(),
          estado: 'error',
          email_destinatario: cliente.email,
          metadata: { error: result.error },
        });
      }

      // Pequeña pausa entre emails
      await new Promise((resolve) => setTimeout(resolve, 100));
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

  /**
   * Devuelve sugerencias predefinidas de filtros para ayudar al usuario
   */
  async getSugerenciasFiltros(): Promise<SugerenciasFiltrosDto> {
    return {
      edad: [
        { label: 'Jóvenes (18-30)', min: 18, max: 30, descripcion: 'Clientes entre 18 y 30 años' },
        { label: 'Adultos (31-50)', min: 31, max: 50, descripcion: 'Clientes entre 31 y 50 años' },
        { label: 'Mayores (51-70)', min: 51, max: 70, descripcion: 'Clientes entre 51 y 70 años' },
        { label: 'Todas las edades', min: 18, max: 100, descripcion: 'Sin filtro de edad' },
      ],
      ticket_medio: [
        {
          label: 'Compras pequeñas (<30€)',
          min: 0,
          max: 30,
          descripcion: 'Clientes con ticket medio bajo',
        },
        {
          label: 'Compras medianas (30-100€)',
          min: 30,
          max: 100,
          descripcion: 'Clientes con ticket medio moderado',
        },
        {
          label: 'Compras grandes (>100€)',
          min: 100,
          descripcion: 'Clientes con ticket medio alto',
        },
        { label: 'VIP (>200€)', min: 200, descripcion: 'Clientes premium con compras grandes' },
      ],
      num_visitas: [
        { label: 'Nuevos (1-3 visitas)', min: 1, max: 3, descripcion: 'Clientes nuevos' },
        {
          label: 'Ocasionales (4-10 visitas)',
          min: 4,
          max: 10,
          descripcion: 'Clientes ocasionales',
        },
        { label: 'Regulares (11-25 visitas)', min: 11, max: 25, descripcion: 'Clientes regulares' },
        { label: 'Frecuentes (>25 visitas)', min: 25, descripcion: 'Clientes muy frecuentes' },
      ],
      dias_ultima_visita: [
        {
          label: 'Muy recientes (0-7 días)',
          min: 0,
          max: 7,
          descripcion: 'Visitaron en la última semana',
        },
        {
          label: 'Recientes (8-30 días)',
          min: 8,
          max: 30,
          descripcion: 'Visitaron en el último mes',
        },
        {
          label: 'Inactivos (31-90 días)',
          min: 31,
          max: 90,
          descripcion: 'No visitan desde hace 1-3 meses',
        },
        {
          label: 'Muy inactivos (>90 días)',
          min: 90,
          descripcion: 'No visitan desde hace más de 3 meses',
        },
      ],
      puntos: [
        {
          label: 'Pocos puntos (<100)',
          min: 0,
          max: 100,
          descripcion: 'Clientes con pocos puntos acumulados',
        },
        {
          label: 'Puntos medios (100-500)',
          min: 100,
          max: 500,
          descripcion: 'Clientes con puntos moderados',
        },
        { label: 'Muchos puntos (>500)', min: 500, descripcion: 'Clientes con muchos puntos' },
        {
          label: 'A punto de canjear (cerca del objetivo)',
          descripcion: 'Clientes que pueden canjear pronto',
        },
      ],
      historial_campanas: [
        { label: 'Sin campañas previas', descripcion: 'Clientes que nunca recibieron campañas' },
        { label: 'Hace más de 1 mes', min: 30, descripcion: 'No recibieron campañas en 30+ días' },
        {
          label: 'Hace más de 3 meses',
          min: 90,
          descripcion: 'No recibieron campañas en 90+ días',
        },
        {
          label: 'Hace más de 6 meses',
          min: 180,
          descripcion: 'No recibieron campañas en 180+ días',
        },
      ],
    };
  }

  /**
   * Obtiene el historial de campañas recibidas por un cliente
   * @private
   */
  private async obtenerHistorialCampanas(clienteId: string): Promise<any[]> {
    const client = this.supabase.getAdminClient();

    const { data, error } = await client
      .from('envios_campanas')
      .select(
        `
        id_campana,
        fecha_envio,
        estado,
        campanas_email:id_campana (
          nombre,
          tipo
        )
      `,
      )
      .eq('id_cliente', clienteId)
      .order('fecha_envio', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error al obtener historial de campañas:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Analiza la base de datos de clientes y sugiere segmentos con porcentajes reales
   */
  async getAnalisisSegmentos(tiendaId: string) {
    const client = this.supabase.getAdminClient(); // Usar admin client para bypasear RLS

    // Obtener todos los clientes con sus estadísticas
    const { data: clientes, error } = await client
      .from('clientes')
      .select('*')
      .eq('id_tienda', tiendaId);

    if (error || !clientes || clientes.length === 0) {
      return { segmentos: [], total_clientes: 0 };
    }

    const totalClientes = clientes.length;

    // Calcular edad de cada cliente
    const clientesConEdad = clientes.map((c) => {
      let edad = null;
      if (c.fecha_nacimiento) {
        const hoy = new Date();
        const nacimiento = new Date(c.fecha_nacimiento);
        edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
          edad--;
        }
      }
      return { ...c, edad };
    });

    // Analizar segmentos y calcular porcentajes
    const segmentos = [];

    // Segmentos por edad
    const menores30 = clientesConEdad.filter((c) => c.edad && c.edad < 30).length;
    const entre30y45 = clientesConEdad.filter((c) => c.edad && c.edad >= 30 && c.edad <= 45).length;
    const mayores45 = clientesConEdad.filter((c) => c.edad && c.edad > 45).length;

    if (menores30 > 0) {
      segmentos.push({
        descripcion: `Menores de 30 años (${menores30} clientes - ${Math.round((menores30 / totalClientes) * 100)}%)`,
        porcentaje: Math.round((menores30 / totalClientes) * 100),
        cantidad: menores30,
      });
    }

    if (entre30y45 > 0) {
      segmentos.push({
        descripcion: `Entre 30 y 45 años (${entre30y45} clientes - ${Math.round((entre30y45 / totalClientes) * 100)}%)`,
        porcentaje: Math.round((entre30y45 / totalClientes) * 100),
        cantidad: entre30y45,
      });
    }

    if (mayores45 > 0) {
      segmentos.push({
        descripcion: `Mayores de 45 años (${mayores45} clientes - ${Math.round((mayores45 / totalClientes) * 100)}%)`,
        porcentaje: Math.round((mayores45 / totalClientes) * 100),
        cantidad: mayores45,
      });
    }

    // Segmentos por género
    const masculino = clientes.filter((c) => c.genero === 'masculino').length;
    const femenino = clientes.filter((c) => c.genero === 'femenino').length;
    const otro = clientes.filter((c) => c.genero === 'otro').length;
    const noEspecificado = clientes.filter(
      (c) => !c.genero || c.genero === 'prefiero_no_decir',
    ).length;

    if (masculino > 0) {
      segmentos.push({
        descripcion: `Hombres (${masculino} clientes - ${Math.round((masculino / totalClientes) * 100)}%)`,
        porcentaje: Math.round((masculino / totalClientes) * 100),
        cantidad: masculino,
      });
    }

    if (femenino > 0) {
      segmentos.push({
        descripcion: `Mujeres (${femenino} clientes - ${Math.round((femenino / totalClientes) * 100)}%)`,
        porcentaje: Math.round((femenino / totalClientes) * 100),
        cantidad: femenino,
      });
    }

    if (otro > 0) {
      segmentos.push({
        descripcion: `Otro género (${otro} clientes - ${Math.round((otro / totalClientes) * 100)}%)`,
        porcentaje: Math.round((otro / totalClientes) * 100),
        cantidad: otro,
      });
    }

    if (noEspecificado > 0) {
      segmentos.push({
        descripcion: `Género no especificado (${noEspecificado} clientes - ${Math.round((noEspecificado / totalClientes) * 100)}%)`,
        porcentaje: Math.round((noEspecificado / totalClientes) * 100),
        cantidad: noEspecificado,
      });
    }

    // Segmentos por comportamiento de compra
    const ticketBajo = clientes.filter((c) => (c.ticket_medio || 0) < 30).length;
    const ticketMedio = clientes.filter(
      (c) => (c.ticket_medio || 0) >= 30 && (c.ticket_medio || 0) < 100,
    ).length;
    const ticketAlto = clientes.filter((c) => (c.ticket_medio || 0) >= 100).length;

    if (ticketBajo > 0) {
      segmentos.push({
        descripcion: `Ticket medio bajo (<30€) - ${ticketBajo} clientes (${Math.round((ticketBajo / totalClientes) * 100)}%)`,
        porcentaje: Math.round((ticketBajo / totalClientes) * 100),
        cantidad: ticketBajo,
      });
    }

    if (ticketMedio > 0) {
      segmentos.push({
        descripcion: `Ticket medio (30-100€) - ${ticketMedio} clientes (${Math.round((ticketMedio / totalClientes) * 100)}%)`,
        porcentaje: Math.round((ticketMedio / totalClientes) * 100),
        cantidad: ticketMedio,
      });
    }

    if (ticketAlto > 0) {
      segmentos.push({
        descripcion: `Ticket alto (>100€) - ${ticketAlto} clientes (${Math.round((ticketAlto / totalClientes) * 100)}%)`,
        porcentaje: Math.round((ticketAlto / totalClientes) * 100),
        cantidad: ticketAlto,
      });
    }

    // Segmentos por frecuencia
    const nuevos = clientes.filter((c) => (c.num_compras || 0) <= 3).length;
    const regulares = clientes.filter(
      (c) => (c.num_compras || 0) > 3 && (c.num_compras || 0) <= 10,
    ).length;
    const frecuentes = clientes.filter((c) => (c.num_compras || 0) > 10).length;

    if (nuevos > 0) {
      segmentos.push({
        descripcion: `Clientes nuevos (1-3 visitas) - ${nuevos} clientes (${Math.round((nuevos / totalClientes) * 100)}%)`,
        porcentaje: Math.round((nuevos / totalClientes) * 100),
        cantidad: nuevos,
      });
    }

    if (regulares > 0) {
      segmentos.push({
        descripcion: `Clientes regulares (4-10 visitas) - ${regulares} clientes (${Math.round((regulares / totalClientes) * 100)}%)`,
        porcentaje: Math.round((regulares / totalClientes) * 100),
        cantidad: regulares,
      });
    }

    if (frecuentes > 0) {
      segmentos.push({
        descripcion: `Clientes frecuentes (>10 visitas) - ${frecuentes} clientes (${Math.round((frecuentes / totalClientes) * 100)}%)`,
        porcentaje: Math.round((frecuentes / totalClientes) * 100),
        cantidad: frecuentes,
      });
    }

    // Segmentos por inactividad
    const inactivos = clientes.filter((c) => (c.dias_desde_ultima_visita || 0) > 60).length;
    if (inactivos > 0) {
      segmentos.push({
        descripcion: `Inactivos (>60 días sin venir) - ${inactivos} clientes (${Math.round((inactivos / totalClientes) * 100)}%)`,
        porcentaje: Math.round((inactivos / totalClientes) * 100),
        cantidad: inactivos,
      });
    }

    // Ordenar por porcentaje descendente
    segmentos.sort((a, b) => b.porcentaje - a.porcentaje);

    return {
      segmentos,
      total_clientes: totalClientes,
    };
  }
}
