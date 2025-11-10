import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateTiendaDto } from './dto/create-tienda.dto';
import { UpdateTiendaDto } from './dto/update-tienda.dto';

@Injectable()
export class SuperAdminService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Enviar código OTP por email para autenticación (DESARROLLO)
   * En desarrollo, el código se guarda en la base de datos y se muestra en consola
   * En producción, deberías usar un servicio de email real (SendGrid, Mailgun, etc.)
   */
  async enviarCodigoEmail(email: string): Promise<{ message: string; codigo?: string }> {
    const supabase = this.supabaseService.getAdminClient();

    // Verificar que el email pertenece a un superadmin
    const { data: superadmin, error: checkError } = await supabase
      .from('superadmin_users')
      .select('id, activo, supabase_user_id')
      .eq('email', email)
      .single();

    if (checkError || !superadmin) {
      throw new NotFoundException('Email no autorizado');
    }

    if (!superadmin.activo) {
      throw new BadRequestException('Usuario superadmin desactivado');
    }

    // Generar código aleatorio de 6 dígitos
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    // Guardar código en la base de datos
    const { error: insertError } = await supabase
      .from('dev_otp_codes')
      .insert({
        email,
        codigo,
        expira_en: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutos
      });

    if (insertError) {
      console.error('Error al guardar código OTP:', insertError);
      throw new BadRequestException('Error al generar código');
    }

    // En desarrollo, mostrar el código en la consola
    console.log('\n========================================');
    console.log('🔐 CÓDIGO OTP DE DESARROLLO');
    console.log('========================================');
    console.log(`Email: ${email}`);
    console.log(`Código: ${codigo}`);
    console.log(`Expira en: 10 minutos`);
    console.log('========================================\n');

    return {
      message: `Código de verificación generado. Revisa la consola del backend.`,
      // En desarrollo, también devolvemos el código en la respuesta (SOLO PARA DESARROLLO)
      codigo: process.env.NODE_ENV === 'development' ? codigo : undefined,
    };
  }

  /**
   * Verificar código OTP de email y obtener token de sesión (DESARROLLO)
   */
  async verificarCodigoEmail(email: string, codigo: string): Promise<{
    access_token: string;
    refresh_token: string;
    superadmin: any;
  }> {
    const supabase = this.supabaseService.getAdminClient();

    // Buscar el código en la base de datos
    const { data: otpRecord, error: otpError } = await supabase
      .from('dev_otp_codes')
      .select('*')
      .eq('email', email)
      .eq('codigo', codigo)
      .eq('usado', false)
      .gt('expira_en', new Date().toISOString())
      .order('creado_en', { ascending: false })
      .limit(1)
      .single();

    if (otpError || !otpRecord) {
      throw new BadRequestException('Código inválido o expirado');
    }

    // Marcar código como usado
    await supabase
      .from('dev_otp_codes')
      .update({ usado: true })
      .eq('id', otpRecord.id);

    // Obtener datos del superadmin
    const { data: superadmin, error: superadminError } = await supabase
      .from('superadmin_users')
      .select('*')
      .eq('email', email)
      .single();

    if (superadminError || !superadmin) {
      throw new NotFoundException('Usuario no es superadmin');
    }

    // Generar tokens de sesión usando Supabase Auth
    // Esto crea una sesión válida para el usuario
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
    });

    if (sessionError) {
      console.error('Error generando token:', sessionError);
      throw new BadRequestException('Error al generar sesión');
    }

    // Registrar acceso en audit log
    await this.registrarAuditLog(superadmin.id, 'login_superadmin', 'auth', null, {
      email,
      fecha: new Date().toISOString(),
    });

    // Para desarrollo, generamos tokens simples
    // En producción, estos serían JWT firmados con secret
    const access_token = Buffer.from(JSON.stringify({
      sub: superadmin.supabase_user_id,
      email: superadmin.email,
      role: 'superadmin',
      exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hora
    })).toString('base64');

    const refresh_token = Buffer.from(JSON.stringify({
      sub: superadmin.supabase_user_id,
      email: superadmin.email,
      type: 'refresh',
    })).toString('base64');

    return {
      access_token,
      refresh_token,
      superadmin: {
        id: superadmin.id,
        nombre: superadmin.nombre,
        email: superadmin.email,
      },
    };
  }

  /**
   * Obtener dashboard global del sistema
   */
  async getDashboard(): Promise<any> {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('vista_superadmin_dashboard')
      .select('*')
      .single();

    if (error) {
      throw new BadRequestException(`Error al obtener dashboard: ${error.message}`);
    }

    return data;
  }

  /**
   * Listar todas las tiendas
   */
  async listarTiendas(): Promise<any[]> {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('vista_superadmin_tiendas')
      .select('*')
      .order('creado_en', { ascending: false });

    if (error) {
      throw new BadRequestException(`Error al listar tiendas: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Obtener datos completos de una tienda específica
   */
  async getTienda(tiendaId: string): Promise<any> {
    const supabase = this.supabaseService.getAdminClient();

    // Usar la función SQL que obtiene todos los datos
    const { data, error } = await supabase.rpc('superadmin_get_tienda_completa', {
      p_tienda_id: tiendaId,
    });

    if (error) {
      throw new BadRequestException(`Error al obtener tienda: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException('Tienda no encontrada');
    }

    return data;
  }

  /**
   * Crear nueva tienda
   */
  async crearTienda(superadminId: string, createDto: CreateTiendaDto): Promise<any> {
    const supabase = this.supabaseService.getAdminClient();

    // Verificar que el dominio no exista
    const { data: existente } = await supabase
      .from('tiendas')
      .select('id')
      .eq('dominio', createDto.dominio)
      .single();

    if (existente) {
      throw new ConflictException(`El dominio "${createDto.dominio}" ya existe`);
    }

    // Crear la tienda
    const { data: tienda, error } = await supabase
      .from('tiendas')
      .insert({
        nombre: createDto.nombre,
        dominio: createDto.dominio,
        dominio_personalizado: createDto.dominio_personalizado,
        direccion: createDto.direccion,
        telefono: createDto.telefono,
        email: createDto.email,
        logo_url: createDto.logo_url,
        plan: createDto.plan,
        configuracion: createDto.configuracion || { puntos_por_euro: 1 },
        activo: true,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Error al crear tienda: ${error.message}`);
    }

    // Registrar en audit log
    await this.registrarAuditLog(superadminId, 'crear_tienda', 'tienda', tienda.id, {
      tienda_nombre: tienda.nombre,
      dominio: tienda.dominio,
    });

    return tienda;
  }

  /**
   * Actualizar tienda existente
   */
  async actualizarTienda(
    superadminId: string,
    tiendaId: string,
    updateDto: UpdateTiendaDto,
  ): Promise<any> {
    const supabase = this.supabaseService.getAdminClient();

    // Verificar que la tienda existe
    const { data: tiendaExistente } = await supabase
      .from('tiendas')
      .select('id, nombre')
      .eq('id', tiendaId)
      .single();

    if (!tiendaExistente) {
      throw new NotFoundException('Tienda no encontrada');
    }

    // Si se está cambiando el dominio, verificar que no exista
    if (updateDto.dominio) {
      const { data: dominioExistente } = await supabase
        .from('tiendas')
        .select('id')
        .eq('dominio', updateDto.dominio)
        .neq('id', tiendaId)
        .single();

      if (dominioExistente) {
        throw new ConflictException(`El dominio "${updateDto.dominio}" ya existe`);
      }
    }

    // Actualizar la tienda
    const { data: tiendaActualizada, error } = await supabase
      .from('tiendas')
      .update(updateDto)
      .eq('id', tiendaId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Error al actualizar tienda: ${error.message}`);
    }

    // Registrar en audit log
    await this.registrarAuditLog(superadminId, 'actualizar_tienda', 'tienda', tiendaId, {
      campos_actualizados: Object.keys(updateDto),
      tienda_nombre: tiendaExistente.nombre,
    });

    return tiendaActualizada;
  }

  /**
   * Eliminar tienda (soft delete - desactivar)
   */
  async eliminarTienda(superadminId: string, tiendaId: string): Promise<{ message: string }> {
    const supabase = this.supabaseService.getAdminClient();

    // Verificar que la tienda existe
    const { data: tienda } = await supabase
      .from('tiendas')
      .select('id, nombre')
      .eq('id', tiendaId)
      .single();

    if (!tienda) {
      throw new NotFoundException('Tienda no encontrada');
    }

    // Desactivar la tienda (soft delete)
    const { error } = await supabase
      .from('tiendas')
      .update({ activo: false })
      .eq('id', tiendaId);

    if (error) {
      throw new BadRequestException(`Error al eliminar tienda: ${error.message}`);
    }

    // Registrar en audit log
    await this.registrarAuditLog(superadminId, 'eliminar_tienda', 'tienda', tiendaId, {
      tienda_nombre: tienda.nombre,
    });

    return {
      message: `Tienda "${tienda.nombre}" desactivada correctamente`,
    };
  }

  /**
   * Obtener QR de un cliente específico de cualquier tienda
   */
  async getClienteQR(tiendaId: string, clienteId: string): Promise<any> {
    const supabase = this.supabaseService.getAdminClient();

    // Verificar que el cliente existe y pertenece a la tienda
    const { data: cliente, error: clienteError } = await supabase
      .from('clientes')
      .select('id, nombre, email, puntos_totales')
      .eq('id', clienteId)
      .eq('id_tienda', tiendaId)
      .single();

    if (clienteError || !cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }

    // Obtener el QR del cliente
    const { data: qr, error: qrError } = await supabase
      .from('qr_clientes')
      .select('*')
      .eq('id_cliente', clienteId)
      .single();

    if (qrError || !qr) {
      throw new NotFoundException('QR del cliente no encontrado');
    }

    return {
      cliente,
      qr,
    };
  }

  /**
   * Registrar acción en audit log
   */
  private async registrarAuditLog(
    superadminId: string,
    accion: string,
    entidad: string,
    entidadId: string | null,
    detalles: Record<string, any>,
  ): Promise<void> {
    const supabase = this.supabaseService.getAdminClient();

    await supabase.from('audit_log_superadmin').insert({
      superadmin_id: superadminId,
      accion,
      entidad,
      entidad_id: entidadId,
      detalles,
    });
  }

  /**
   * Obtener logs de auditoría
   */
  async getAuditLogs(limit: number = 100): Promise<any[]> {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('audit_log_superadmin')
      .select(`
        *,
        superadmin:superadmin_users(nombre, telefono)
      `)
      .order('fecha', { ascending: false })
      .limit(limit);

    if (error) {
      throw new BadRequestException(`Error al obtener logs: ${error.message}`);
    }

    return data || [];
  }
}
