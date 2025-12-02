import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { EmailService } from '../email/email.service';

/**
 * Servicio para gestión de regalos concretos y cupones
 */
@Injectable()
export class RegalosService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Obtiene el catálogo de regalos de una tienda
   */
  async getCatalogo(tiendaId: string, soloActivos = true) {
    const client = this.supabase.getAdminClient();

    let query = client
      .from('regalos_catalogo')
      .select('*')
      .eq('id_tienda', tiendaId);

    if (soloActivos) {
      query = query.eq('activo', true);
    }

    const { data, error } = await query.order('nombre', { ascending: true });

    if (error) {
      console.error('Error obteniendo catálogo de regalos:', error);
      throw new BadRequestException('Error al obtener catálogo');
    }

    return data || [];
  }

  /**
   * Crea un nuevo regalo en el catálogo
   */
  async crearRegalo(tiendaId: string, regaloData: {
    nombre: string;
    descripcion?: string;
    tipo: 'producto' | 'descuento' | 'servicio' | 'puntos';
    detalles: any;
    instrucciones_canje?: string;
    icono?: string;
    imagen_url?: string;
    dias_validez?: number;
    requiere_validacion_staff?: boolean;
  }) {
    const client = this.supabase.getAdminClient();

    const { data, error } = await client
      .from('regalos_catalogo')
      .insert({
        id_tienda: tiendaId,
        ...regaloData,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creando regalo:', error);
      throw new BadRequestException('Error al crear regalo');
    }

    console.log(`✅ Regalo creado: ${data.nombre} (${data.tipo})`);
    return data;
  }

  /**
   * Actualiza un regalo del catálogo
   */
  async actualizarRegalo(tiendaId: string, regaloId: string, regaloData: any) {
    const client = this.supabase.getAdminClient();

    // Verificar que el regalo pertenece a la tienda
    const { data: existente, error: checkError } = await client
      .from('regalos_catalogo')
      .select('id')
      .eq('id', regaloId)
      .eq('id_tienda', tiendaId)
      .single();

    if (checkError || !existente) {
      throw new BadRequestException('Regalo no encontrado o no pertenece a esta tienda');
    }

    const { data, error } = await client
      .from('regalos_catalogo')
      .update({
        ...regaloData,
        actualizado_en: new Date().toISOString(),
      })
      .eq('id', regaloId)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando regalo:', error);
      throw new BadRequestException('Error al actualizar regalo');
    }

    console.log(`✅ Regalo actualizado: ${data.nombre}`);
    return data;
  }

  /**
   * Elimina (desactiva) un regalo del catálogo
   */
  async eliminarRegalo(tiendaId: string, regaloId: string) {
    const client = this.supabase.getAdminClient();

    // Verificar que el regalo pertenece a la tienda
    const { data: existente, error: checkError } = await client
      .from('regalos_catalogo')
      .select('id, nombre')
      .eq('id', regaloId)
      .eq('id_tienda', tiendaId)
      .single();

    if (checkError || !existente) {
      throw new BadRequestException('Regalo no encontrado o no pertenece a esta tienda');
    }

    // Soft delete - solo desactivar
    const { error } = await client
      .from('regalos_catalogo')
      .update({ activo: false, actualizado_en: new Date().toISOString() })
      .eq('id', regaloId);

    if (error) {
      console.error('Error eliminando regalo:', error);
      throw new BadRequestException('Error al eliminar regalo');
    }

    console.log(`✅ Regalo eliminado: ${existente.nombre}`);
    return { mensaje: 'Regalo eliminado correctamente' };
  }

  /**
   * Obtiene cupones de un cliente
   */
  async getCuponesCliente(clienteId: string, soloDisponibles = false) {
    const client = this.supabase.getAdminClient();

    let query = client
      .from('vista_cupones_cliente')
      .select('*')
      .eq('id_cliente', clienteId);

    if (soloDisponibles) {
      query = query.eq('estado', 'disponible');
    }

    const { data, error } = await query.order('fecha_otorgado', { ascending: false });

    if (error) {
      console.error('Error obteniendo cupones:', error);
      throw new BadRequestException('Error al obtener cupones');
    }

    return data || [];
  }

  /**
   * Otorga un regalo concreto a un cliente
   */
  async otorgarRegalo(params: {
    clienteId: string;
    regaloId: string;
    origen: 'bienvenida' | 'referido' | 'milestone' | 'promocion' | 'manual';
    origenDetalles?: any;
  }) {
    const client = this.supabase.getAdminClient();

    console.log(`\n🎁 [OTORGAR REGALO]`);
    console.log(`  - Cliente ID: ${params.clienteId}`);
    console.log(`  - Regalo ID: ${params.regaloId}`);
    console.log(`  - Origen: ${params.origen}`);

    // Llamar a función de PostgreSQL
    const { data, error } = await client.rpc('otorgar_regalo_concreto', {
      p_cliente_id: params.clienteId,
      p_regalo_id: params.regaloId,
      p_origen: params.origen,
      p_origen_detalles: params.origenDetalles || null,
    });

    if (error) {
      console.error('  ❌ Error:', error);
      throw new BadRequestException('Error al otorgar regalo');
    }

    console.log(`  ✅ Cupón generado: ID = ${data}`);

    // Obtener detalles del cupón creado
    const { data: cupon } = await client
      .from('vista_cupones_cliente')
      .select('*')
      .eq('id', data)
      .single();

    return cupon;
  }

  /**
   * Marca un cupón como visto por el cliente
   */
  async marcarCuponVisto(cuponId: string) {
    const client = this.supabase.getAdminClient();

    const { error } = await client
      .from('cupones_regalos')
      .update({
        visto_por_cliente: true,
        fecha_visto: new Date().toISOString(),
      })
      .eq('id', cuponId);

    if (error) {
      console.error('Error marcando cupón como visto:', error);
      // No lanzar error - es opcional
    }
  }

  /**
   * Marca un cupón como usado (para staff)
   */
  async marcarCuponUsado(cuponId: string, usuarioStaffId: string) {
    const client = this.supabase.getAdminClient();

    const { data, error } = await client.rpc('marcar_cupon_usado', {
      p_cupon_id: cuponId,
      p_usuario_staff_id: usuarioStaffId,
    });

    if (error || !data?.success) {
      throw new BadRequestException(data?.error || 'Error al marcar cupón como usado');
    }

    return data;
  }

  /**
   * Obtiene milestones de referidos para una tienda
   */
  async getMilestones(tiendaId: string) {
    const client = this.supabase.getAdminClient();

    const { data, error } = await client
      .from('milestones_referidos')
      .select(`
        *,
        regalo:regalos_catalogo(*)
      `)
      .eq('id_tienda', tiendaId)
      .eq('activo', true)
      .order('orden', { ascending: true });

    if (error) {
      console.error('Error obteniendo milestones:', error);
      throw new BadRequestException('Error al obtener milestones');
    }

    return data || [];
  }

  /**
   * Crea un milestone de referidos
   */
  async crearMilestone(tiendaId: string, milestoneData: {
    nombre: string;
    descripcion?: string;
    cantidad_referidos: number;
    tipo_recompensa: 'regalo_concreto' | 'puntos' | 'ambos';
    id_regalo?: string;
    puntos?: number;
    orden?: number;
  }) {
    const client = this.supabase.getAdminClient();

    const { data, error } = await client
      .from('milestones_referidos')
      .insert({
        id_tienda: tiendaId,
        ...milestoneData,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creando milestone:', error);
      throw new BadRequestException('Error al crear milestone');
    }

    console.log(`✅ Milestone creado: ${data.nombre} (${data.cantidad_referidos} referidos)`);
    return data;
  }

  /**
   * Obtiene milestones alcanzados por un cliente
   */
  async getMilestonesAlcanzados(clienteId: string) {
    const client = this.supabase.getAdminClient();

    const { data, error } = await client
      .from('milestones_alcanzados')
      .select(`
        *,
        milestone:milestones_referidos(*),
        cupon:cupones_regalos(*)
      `)
      .eq('id_cliente', clienteId)
      .order('fecha_alcanzado', { ascending: false });

    if (error) {
      console.error('Error obteniendo milestones alcanzados:', error);
      throw new BadRequestException('Error al obtener milestones alcanzados');
    }

    return data || [];
  }

  /**
   * Verifica y otorga milestones al cliente cuando cambia su total de referidos
   * (Se llama automáticamente desde el trigger de BD, pero también se puede llamar manualmente)
   */
  async verificarMilestonesCliente(clienteId: string) {
    const client = this.supabase.getAdminClient();

    console.log(`\n🎯 [VERIFICAR MILESTONES]`);
    console.log(`  - Cliente ID: ${clienteId}`);

    const { data, error } = await client.rpc('verificar_milestones_referidos', {
      p_cliente_id: clienteId,
    });

    if (error) {
      console.error('  ❌ Error:', error);
      throw new BadRequestException('Error al verificar milestones');
    }

    console.log(`  ✅ Milestones alcanzados: ${data.total}`);

    if (data.total > 0) {
      console.log(`  🎉 Nuevos milestones:`, data.milestones_alcanzados);

      // Enviar notificación por email (opcional)
      try {
        await this.notificarMilestonesAlcanzados(clienteId, data.milestones_alcanzados);
      } catch (emailError) {
        console.error('  ⚠️  Error enviando notificación:', emailError.message);
        // No lanzar error - el milestone ya se otorgó
      }
    }

    return data;
  }

  /**
   * Envía email notificando los milestones alcanzados
   */
  private async notificarMilestonesAlcanzados(clienteId: string, milestones: any[]) {
    const client = this.supabase.getAdminClient();

    // Obtener datos del cliente
    const { data: cliente } = await client
      .from('clientes')
      .select('nombre, email, id_tienda')
      .eq('id', clienteId)
      .single();

    if (!cliente || !cliente.email) {
      return;
    }

    // Obtener branding de la tienda
    const { data: tienda } = await client
      .from('tiendas')
      .select('nombre_comercial, nombre, logo_url, color_primario, color_secundario, color_acento')
      .eq('id', cliente.id_tienda)
      .single();

    const colorPrimario = tienda?.color_primario || '#3b82f6';
    const colorSecundario = tienda?.color_secundario || '#6366f1';
    const colorAcento = tienda?.color_acento || '#22c55e';
    const nombreTienda = tienda?.nombre_comercial || tienda?.nombre || 'Tu tienda';
    const logoUrl = tienda?.logo_url;

    // Generar HTML del email
    const milestonesList = milestones.map((m) => `
      <div style="background: #f8f9fa; border-left: 4px solid ${colorAcento}; padding: 15px; margin-bottom: 15px; border-radius: 0 8px 8px 0;">
        <strong style="color: ${colorPrimario}; font-size: 16px;">${m.nombre}</strong>
        <p style="margin: 8px 0 0 0; color: #666; font-size: 14px;">${m.descripcion}</p>
        ${m.puntos ? `<p style="margin: 8px 0 0 0; font-size: 14px; color: ${colorAcento};">🎁 +${m.puntos} puntos</p>` : ''}
        ${m.cupon_id ? `<p style="margin: 8px 0 0 0; font-size: 14px; color: ${colorAcento};">✅ Cupón otorgado</p>` : ''}
      </div>
    `).join('');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <!-- Header con branding -->
        <div style="background: linear-gradient(135deg, ${colorPrimario}, ${colorSecundario}); padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0;">
          ${logoUrl ? `<img src="${logoUrl}" alt="${nombreTienda}" style="max-height: 60px; max-width: 200px; margin-bottom: 10px;" />` : ''}
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${nombreTienda}</h1>
        </div>

        <div style="padding: 30px 20px;">
          <h2 style="color: ${colorPrimario}; margin-top: 0;">🎉 ¡Felicitaciones ${cliente.nombre}!</h2>
          <p style="font-size: 16px; color: #333;">
            Has alcanzado nuevos objetivos en nuestro programa de referidos:
          </p>

          <div style="margin: 25px 0;">
            ${milestonesList}
          </div>

          <div style="background: linear-gradient(135deg, ${colorAcento}15, ${colorPrimario}15); border: 2px solid ${colorAcento}; padding: 20px; border-radius: 12px; text-align: center; margin: 25px 0;">
            <p style="margin: 0; font-size: 16px; color: #333;">
              🚀 ¡Sigue invitando amigos y desbloquea más recompensas!
            </p>
          </div>

          <p style="color: #666; font-size: 14px;">
            Revisa tu perfil para ver tus cupones y recompensas disponibles.
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
          <p style="margin: 0; font-size: 12px; color: #999;">
            Este email fue enviado por ${nombreTienda}
          </p>
        </div>
      </div>
    `;

    await this.emailService.sendEmail({
      to: cliente.email,
      subject: `🎉 ${nombreTienda} - ¡Has desbloqueado nuevas recompensas!`,
      html,
    });

    console.log(`  📧 Email de notificación enviado a ${cliente.email}`);
  }

  /**
   * Envía email con cupón de regalo
   */
  async enviarEmailCupon(cuponId: string) {
    const client = this.supabase.getAdminClient();

    const { data: cupon } = await client
      .from('vista_cupones_cliente')
      .select('*')
      .eq('id', cuponId)
      .single();

    if (!cupon) {
      throw new NotFoundException('Cupón no encontrado');
    }

    // Obtener email del cliente y su tienda
    const { data: cliente } = await client
      .from('clientes')
      .select('nombre, email, id_tienda')
      .eq('id', cupon.id_cliente)
      .single();

    if (!cliente || !cliente.email) {
      throw new BadRequestException('Cliente sin email');
    }

    // Obtener branding de la tienda
    const { data: tienda } = await client
      .from('tiendas')
      .select('nombre_comercial, nombre, logo_url, color_primario, color_secundario, color_acento')
      .eq('id', cliente.id_tienda)
      .single();

    const colorPrimario = tienda?.color_primario || '#3b82f6';
    const colorSecundario = tienda?.color_secundario || '#6366f1';
    const colorAcento = tienda?.color_acento || '#22c55e';
    const nombreTienda = tienda?.nombre_comercial || tienda?.nombre || 'Tu tienda';
    const logoUrl = tienda?.logo_url;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <!-- Header con branding -->
        <div style="background: linear-gradient(135deg, ${colorPrimario}, ${colorSecundario}); padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0;">
          ${logoUrl ? `<img src="${logoUrl}" alt="${nombreTienda}" style="max-height: 60px; max-width: 200px; margin-bottom: 10px;" />` : ''}
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${nombreTienda}</h1>
        </div>

        <div style="padding: 30px 20px;">
          <h2 style="color: ${colorPrimario}; margin-top: 0;">🎁 ¡Tienes un regalo!</h2>
          <p style="font-size: 16px; color: #333;">Hola ${cliente.nombre},</p>
          <p style="font-size: 16px; color: #333;">
            ${cupon.regalo_descripcion || cupon.regalo_nombre}
          </p>

          <!-- Código del cupón -->
          <div style="background: linear-gradient(135deg, ${colorPrimario}15, ${colorSecundario}15); border: 2px solid ${colorPrimario}; padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Tu código de cupón:</p>
            <p style="margin: 0; font-size: 32px; font-weight: bold; color: ${colorPrimario}; letter-spacing: 3px; font-family: monospace;">
              ${cupon.codigo}
            </p>
            ${cupon.fecha_expiracion ? `
              <p style="margin: 15px 0 0 0; font-size: 14px; color: #ef4444;">
                ⏰ Válido hasta: ${new Date(cupon.fecha_expiracion).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            ` : ''}
          </div>

          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #666;">
              <strong>📋 Cómo canjear:</strong><br/>
              ${cupon.instrucciones_canje || 'Presenta este cupón en el establecimiento para canjearlo.'}
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
          <p style="margin: 0; font-size: 12px; color: #999;">
            Este email fue enviado por ${nombreTienda}
          </p>
        </div>
      </div>
    `;

    await this.emailService.sendEmail({
      to: cliente.email,
      subject: `🎁 ${nombreTienda} - ¡Tienes un regalo: ${cupon.regalo_nombre}!`,
      html,
    });

    // Marcar email como enviado
    await client
      .from('cupones_regalos')
      .update({ notificado_email: true })
      .eq('id', cuponId);

    console.log(`📧 Email de cupón enviado a ${cliente.email}`);
  }
}
