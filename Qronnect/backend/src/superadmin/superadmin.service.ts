import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { SmsService } from '../sms/sms.service';
import { CreateTiendaDto } from './dto/create-tienda.dto';
import { UpdateTiendaDto } from './dto/update-tienda.dto';
import { ConfigureSmsDto } from './dto/configure-sms.dto';
import { UpdateSenderIdDto } from './dto/update-sender-id.dto';
import { ConfigureIaDto } from './dto/configure-ia.dto';

@Injectable()
export class SuperAdminService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly smsService: SmsService,
  ) {}

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
    const { error: insertError } = await supabase.from('dev_otp_codes').insert({
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
  async verificarCodigoEmail(
    email: string,
    codigo: string,
  ): Promise<{
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
    await supabase.from('dev_otp_codes').update({ usado: true }).eq('id', otpRecord.id);

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
    const access_token = Buffer.from(
      JSON.stringify({
        sub: superadmin.supabase_user_id,
        email: superadmin.email,
        role: 'superadmin',
        exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hora
      }),
    ).toString('base64');

    const refresh_token = Buffer.from(
      JSON.stringify({
        sub: superadmin.supabase_user_id,
        email: superadmin.email,
        type: 'refresh',
      }),
    ).toString('base64');

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

    const { data, error } = await supabase.from('vista_superadmin_dashboard').select('*').single();

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
    const { error } = await supabase.from('tiendas').update({ activo: false }).eq('id', tiendaId);

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
      .select(
        `
        *,
        superadmin:superadmin_users(nombre, telefono)
      `,
      )
      .order('fecha', { ascending: false })
      .limit(limit);

    if (error) {
      throw new BadRequestException(`Error al obtener logs: ${error.message}`);
    }

    return data || [];
  }

  // ========================================
  // SMS CONFIGURATION
  // ========================================

  /**
   * Configurar SMS para una tienda (modo global o propio)
   */
  async configurarSms(superadminId: string, tiendaId: string, config: ConfigureSmsDto) {
    const supabase = this.supabaseService.getAdminClient();

    // Verificar que la tienda existe
    const { data: tienda, error: tiendaError } = await supabase
      .from('tiendas')
      .select('id, configuracion')
      .eq('id', tiendaId)
      .single();

    if (tiendaError || !tienda) {
      throw new NotFoundException('Tienda no encontrada');
    }

    // Si modo = "propio", validar credenciales
    if (config.modo === 'propio') {
      if (!config.credenciales) {
        throw new BadRequestException(
          'Las credenciales de Twilio son requeridas para modo "propio"',
        );
      }

      // Validar credenciales
      const validacion = await this.smsService.validarCredenciales(config.credenciales);
      if (!validacion.valid) {
        throw new BadRequestException(`Credenciales inválidas: ${validacion.error}`);
      }
    }

    // Actualizar configuración
    const configuracionActual = tienda.configuracion || {};
    const nuevaConfiguracion = {
      ...configuracionActual,
      sms: {
        activo: config.activo,
        modo: config.modo,
        credenciales: config.credenciales || null,
        limites: config.limites || null,
        creditos_disponibles: config.creditos_disponibles || null,
      },
    };

    const { data: tiendaActualizada, error: updateError } = await supabase
      .from('tiendas')
      .update({
        configuracion: nuevaConfiguracion,
        actualizado_en: new Date().toISOString(),
      })
      .eq('id', tiendaId)
      .select()
      .single();

    if (updateError) {
      throw new BadRequestException(`Error al actualizar configuración: ${updateError.message}`);
    }

    // Registrar en audit log
    // TODO: Implementar registrarAccion si existe el sistema de audit log
    // await this.registrarAccion(superadminId, 'configurar_sms', {
    //   tienda_id: tiendaId,
    //   modo: config.modo,
    // });

    return {
      message: 'Configuración SMS actualizada correctamente',
      configuracion: tiendaActualizada.configuracion.sms,
    };
  }

  /**
   * Obtener configuración SMS de una tienda (sin exponer credenciales completas)
   */
  async getConfiguracionSms(tiendaId: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data: tienda, error } = await supabase
      .from('tiendas')
      .select('configuracion')
      .eq('id', tiendaId)
      .single();

    if (error || !tienda) {
      throw new NotFoundException('Tienda no encontrada');
    }

    const smsConfig = tienda.configuracion?.sms;

    if (!smsConfig) {
      return {
        activo: false,
        modo: null,
        configurado: false,
      };
    }

    // Ofuscar credenciales para seguridad
    const configSegura = {
      activo: smsConfig.activo,
      modo: smsConfig.modo,
      configurado: true,
      limites: smsConfig.limites || null,
      creditos_disponibles: smsConfig.creditos_disponibles || null,
    };

    if (smsConfig.modo === 'propio' && smsConfig.credenciales) {
      configSegura['credenciales_configuradas'] = {
        account_sid: smsConfig.credenciales.account_sid,
        auth_token: '***' + smsConfig.credenciales.auth_token.slice(-4), // Solo últimos 4 chars
        phone_number: smsConfig.credenciales.phone_number,
      };
    }

    return configSegura;
  }

  /**
   * Probar configuración SMS de una tienda
   */
  async probarSms(tiendaId: string, telefonoTest: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data: tienda, error } = await supabase
      .from('tiendas')
      .select('configuracion, nombre')
      .eq('id', tiendaId)
      .single();

    if (error || !tienda) {
      throw new NotFoundException('Tienda no encontrada');
    }

    const smsConfig = tienda.configuracion?.sms;

    if (!smsConfig || !smsConfig.activo) {
      throw new BadRequestException('SMS no está configurado para esta tienda');
    }

    // Enviar SMS de prueba
    const resultado = await this.smsService.sendSms({
      tiendaId: tiendaId,
      to: telefonoTest,
      message: 'Este es un SMS de prueba desde Qronnect. Tu configuración funciona correctamente!',
      tiendaNombre: tienda.nombre,
    });

    if (!resultado.success) {
      throw new BadRequestException(`Error al enviar SMS: ${resultado.error}`);
    }

    return {
      success: true,
      message: 'SMS de prueba enviado correctamente',
      modo: resultado.modo,
      coste: resultado.coste,
      message_sid: resultado.messageSid,
    };
  }

  /**
   * Obtener estadísticas globales de SMS (solo modo global)
   */
  async getEstadisticasGlobalesSms() {
    const supabase = this.supabaseService.getAdminClient();

    const hoy = new Date().toISOString().split('T')[0];
    const primerDiaMes = new Date();
    primerDiaMes.setDate(1);

    // Estadísticas del día
    const { data: datosHoy } = await supabase
      .from('sms_enviados')
      .select('cantidad, coste, id_tienda')
      .eq('modo', 'global')
      .gte('enviado_en', hoy);

    // Estadísticas del mes
    const { data: datosMes } = await supabase
      .from('sms_enviados')
      .select('cantidad, coste, id_tienda')
      .eq('modo', 'global')
      .gte('enviado_en', primerDiaMes.toISOString());

    // Calcular totales
    const totalHoy = datosHoy?.reduce((sum, r) => sum + (r.cantidad || 0), 0) || 0;
    const costeHoy = datosHoy?.reduce((sum, r) => sum + (r.coste || 0), 0) || 0;
    const totalMes = datosMes?.reduce((sum, r) => sum + (r.cantidad || 0), 0) || 0;
    const costeMes = datosMes?.reduce((sum, r) => sum + (r.coste || 0), 0) || 0;

    // Agrupar por tienda para el mes
    const porTienda = {};
    datosMes?.forEach((registro) => {
      if (!porTienda[registro.id_tienda]) {
        porTienda[registro.id_tienda] = { cantidad: 0, coste: 0 };
      }
      porTienda[registro.id_tienda].cantidad += registro.cantidad || 0;
      porTienda[registro.id_tienda].coste += registro.coste || 0;
    });

    // Obtener nombres de tiendas
    const tiendaIds = Object.keys(porTienda);
    const { data: tiendas } = await supabase
      .from('tiendas')
      .select('id, nombre')
      .in('id', tiendaIds);

    const estadisticasPorTienda = tiendaIds.map((id) => {
      const tienda = tiendas?.find((t) => t.id === id);
      return {
        tienda_id: id,
        tienda_nombre: tienda?.nombre || 'Desconocida',
        sms_enviados: porTienda[id].cantidad,
        coste: `${porTienda[id].coste.toFixed(2)}€`,
      };
    });

    return {
      global: {
        hoy: {
          sms_enviados: totalHoy,
          coste_total: `${costeHoy.toFixed(2)}€`,
        },
        mes_actual: {
          sms_enviados: totalMes,
          coste_total: `${costeMes.toFixed(2)}€`,
          coste_promedio: totalMes > 0 ? `${(costeMes / totalMes).toFixed(3)}€` : '0€',
        },
      },
      por_tienda: estadisticasPorTienda.sort((a, b) => b.sms_enviados - a.sms_enviados),
    };
  }

  /**
   * Actualizar solo el Sender ID de una tienda
   */
  async actualizarSenderId(
    superadminId: string,
    tiendaId: string,
    updateDto: UpdateSenderIdDto,
  ) {
    const supabase = this.supabaseService.getAdminClient();

    // Obtener tienda actual
    const { data: tienda, error: tiendaError } = await supabase
      .from('tiendas')
      .select('id, nombre, configuracion')
      .eq('id', tiendaId)
      .single();

    if (tiendaError || !tienda) {
      throw new NotFoundException('Tienda no encontrada');
    }

    // Convertir a mayúsculas automáticamente
    const senderIdFinal = updateDto.sender_id?.toUpperCase();

    // Validación adicional: debe tener al menos 1 letra
    if (senderIdFinal && !/[A-Z]/.test(senderIdFinal)) {
      throw new BadRequestException('El Sender ID debe contener al menos una letra');
    }

    // Actualizar configuración SMS
    const configuracionActual = tienda.configuracion || {};
    const smsConfigActual = configuracionActual.sms || {};

    const nuevaConfiguracion = {
      ...configuracionActual,
      sms: {
        ...smsConfigActual,
        sender_id: senderIdFinal || null,
      },
    };

    const { data: tiendaActualizada, error: updateError } = await supabase
      .from('tiendas')
      .update({
        configuracion: nuevaConfiguracion,
        actualizado_en: new Date().toISOString(),
      })
      .eq('id', tiendaId)
      .select()
      .single();

    if (updateError) {
      throw new BadRequestException(`Error al actualizar Sender ID: ${updateError.message}`);
    }

    return {
      message: 'Sender ID actualizado correctamente',
      tienda: {
        id: tiendaActualizada.id,
        nombre: tiendaActualizada.nombre,
        sender_id: senderIdFinal,
      },
    };
  }

  /**
   * Eliminar el Sender ID de una tienda
   */
  async eliminarSenderId(superadminId: string, tiendaId: string) {
    const supabase = this.supabaseService.getAdminClient();

    // Obtener tienda actual
    const { data: tienda, error: tiendaError } = await supabase
      .from('tiendas')
      .select('id, nombre, configuracion')
      .eq('id', tiendaId)
      .single();

    if (tiendaError || !tienda) {
      throw new NotFoundException('Tienda no encontrada');
    }

    // Eliminar sender_id de la configuración
    const configuracionActual = tienda.configuracion || {};
    const smsConfigActual = configuracionActual.sms || {};

    const nuevaConfiguracion = {
      ...configuracionActual,
      sms: {
        ...smsConfigActual,
        sender_id: null,
      },
    };

    const { data: tiendaActualizada, error: updateError } = await supabase
      .from('tiendas')
      .update({
        configuracion: nuevaConfiguracion,
        actualizado_en: new Date().toISOString(),
      })
      .eq('id', tiendaId)
      .select()
      .single();

    if (updateError) {
      throw new BadRequestException(`Error al eliminar Sender ID: ${updateError.message}`);
    }

    return {
      message: 'Sender ID eliminado correctamente. La tienda usará número de teléfono.',
      tienda: {
        id: tiendaActualizada.id,
        nombre: tiendaActualizada.nombre,
      },
    };
  }

  // ========================================
  // IA CONFIGURATION
  // ========================================

  /**
   * Configurar IA para una tienda (modo global o propio)
   */
  async configurarIa(superadminId: string, tiendaId: string, config: ConfigureIaDto) {
    const supabase = this.supabaseService.getAdminClient();

    // Verificar que la tienda existe
    const { data: tienda, error: tiendaError } = await supabase
      .from('tiendas')
      .select('id, nombre, ia_modo, ia_api_key_propia')
      .eq('id', tiendaId)
      .single();

    if (tiendaError || !tienda) {
      throw new NotFoundException('Tienda no encontrada');
    }

    // Si modo = "propio", validar que se proporciona API key
    if (config.ia_modo === 'propio') {
      if (!config.ia_api_key_propia) {
        throw new BadRequestException(
          'La API key de Gemini es requerida para modo "propio"',
        );
      }

      // Validar formato básico de API key de Gemini
      if (!config.ia_api_key_propia.startsWith('AIzaSy')) {
        throw new BadRequestException(
          'La API key de Gemini debe comenzar con "AIzaSy"',
        );
      }
    }

    // Preparar datos de actualización
    const updateData: any = {
      ia_modo: config.ia_modo,
      actualizado_en: new Date().toISOString(),
    };

    if (config.ia_modo === 'propio') {
      updateData.ia_api_key_propia = config.ia_api_key_propia;
      // En modo propio no hay límite
      updateData.ia_limite_mensual = null;
    } else {
      // Modo global
      updateData.ia_api_key_propia = null;
      updateData.ia_limite_mensual = config.ia_limite_mensual || 50; // Default según plan
    }

    // Actualizar configuración
    const { data: tiendaActualizada, error: updateError } = await supabase
      .from('tiendas')
      .update(updateData)
      .eq('id', tiendaId)
      .select()
      .single();

    if (updateError) {
      throw new BadRequestException(`Error al actualizar configuración: ${updateError.message}`);
    }

    // Registrar en audit log
    await this.registrarAuditLog(superadminId, 'configurar_ia', 'tienda', tiendaId, {
      tienda_nombre: tienda.nombre,
      modo: config.ia_modo,
    });

    return {
      message: 'Configuración de IA actualizada correctamente',
      configuracion: {
        ia_modo: tiendaActualizada.ia_modo,
        ia_limite_mensual: tiendaActualizada.ia_limite_mensual,
        ia_api_key_configurada: config.ia_modo === 'propio',
      },
    };
  }

  /**
   * Obtener configuración IA de una tienda (sin exponer API keys completas)
   */
  async getConfiguracionIa(tiendaId: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data: tienda, error } = await supabase
      .from('tiendas')
      .select('ia_modo, ia_api_key_propia, ia_limite_mensual, ia_consumo_actual, ia_ultimo_reset')
      .eq('id', tiendaId)
      .single();

    if (error || !tienda) {
      throw new NotFoundException('Tienda no encontrada');
    }

    const configSegura: any = {
      ia_modo: tienda.ia_modo || 'global',
      ia_limite_mensual: tienda.ia_limite_mensual,
      ia_consumo_actual: tienda.ia_consumo_actual || 0,
      ia_ultimo_reset: tienda.ia_ultimo_reset,
      ia_api_key_configurada: !!tienda.ia_api_key_propia,
    };

    // Si tiene API key propia, ofuscar
    if (tienda.ia_modo === 'propio' && tienda.ia_api_key_propia) {
      configSegura.ia_api_key_preview =
        tienda.ia_api_key_propia.substring(0, 10) + '...' + tienda.ia_api_key_propia.slice(-4);
    }

    return configSegura;
  }

  /**
   * Obtener estadísticas de uso de IA de una tienda
   */
  async getEstadisticasIa(tiendaId: string) {
    const supabase = this.supabaseService.getAdminClient();

    // Verificar que la tienda existe
    const { data: tienda, error: tiendaError } = await supabase
      .from('tiendas')
      .select('id, nombre')
      .eq('id', tiendaId)
      .single();

    if (tiendaError || !tienda) {
      throw new NotFoundException('Tienda no encontrada');
    }

    // Obtener estadísticas usando la función SQL
    const { data: stats, error: statsError } = await supabase.rpc('estadisticas_uso_ia', {
      p_tienda_id: tiendaId,
    });

    if (statsError) {
      throw new BadRequestException(`Error al obtener estadísticas: ${statsError.message}`);
    }

    // Obtener límites y consumo actual
    const { data: limites } = await supabase
      .from('tiendas')
      .select('ia_modo, ia_limite_mensual, ia_consumo_actual, ia_ultimo_reset')
      .eq('id', tiendaId)
      .single();

    return {
      tienda: {
        id: tienda.id,
        nombre: tienda.nombre,
      },
      modo: limites?.ia_modo || 'global',
      limites: limites?.ia_modo === 'global'
        ? {
            limite_mensual: limites?.ia_limite_mensual || 50,
            consumo_actual: limites?.ia_consumo_actual || 0,
            restantes:
              (limites?.ia_limite_mensual || 50) - (limites?.ia_consumo_actual || 0),
            ultimo_reset: limites?.ia_ultimo_reset,
          }
        : null,
      estadisticas: stats || {},
    };
  }

  /**
   * Eliminar la API key propia de IA de una tienda
   */
  async eliminarApiKeyIa(superadminId: string, tiendaId: string) {
    const supabase = this.supabaseService.getAdminClient();

    // Obtener tienda actual
    const { data: tienda, error: tiendaError } = await supabase
      .from('tiendas')
      .select('id, nombre')
      .eq('id', tiendaId)
      .single();

    if (tiendaError || !tienda) {
      throw new NotFoundException('Tienda no encontrada');
    }

    // Volver a modo global
    const { data: tiendaActualizada, error: updateError } = await supabase
      .from('tiendas')
      .update({
        ia_modo: 'global',
        ia_api_key_propia: null,
        ia_limite_mensual: 50, // Default
        actualizado_en: new Date().toISOString(),
      })
      .eq('id', tiendaId)
      .select()
      .single();

    if (updateError) {
      throw new BadRequestException(`Error al eliminar API key: ${updateError.message}`);
    }

    // Registrar en audit log
    await this.registrarAuditLog(superadminId, 'eliminar_api_key_ia', 'tienda', tiendaId, {
      tienda_nombre: tienda.nombre,
    });

    return {
      message: 'API key eliminada correctamente. La tienda usará modo global.',
      tienda: {
        id: tiendaActualizada.id,
        nombre: tiendaActualizada.nombre,
        ia_modo: tiendaActualizada.ia_modo,
      },
    };
  }

  /**
   * Generar token de admin para que el superadmin acceda a una tienda
   * Permite al superadmin autenticarse como admin en cualquier tienda
   */
  async generarTokenAdminParaTienda(superadminId: string, tiendaId: string) {
    const supabase = this.supabaseService.getAdminClient();

    // Verificar que la tienda existe
    const { data: tienda, error: tiendaError } = await supabase
      .from('tiendas')
      .select('id, nombre, dominio, activo')
      .eq('id', tiendaId)
      .single();

    if (tiendaError || !tienda) {
      throw new NotFoundException('Tienda no encontrada');
    }

    if (!tienda.activo) {
      throw new BadRequestException('La tienda está inactiva');
    }

    // Generar token de admin (similar a admin.service.ts login)
    const access_token = Buffer.from(
      JSON.stringify({
        sub: superadminId, // Usamos el ID del superadmin
        tienda_id: tienda.id,
        email: 'superadmin@access',
        role: 'admin',
        superadmin_access: true, // Flag para identificar que es acceso de superadmin
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 2, // 2 horas
      }),
    ).toString('base64');

    // Registrar en audit log
    await this.registrarAuditLog(superadminId, 'acceso_tienda_como_admin', 'tienda', tiendaId, {
      tienda_nombre: tienda.nombre,
      dominio: tienda.dominio,
    });

    return {
      access_token,
      tienda: {
        id: tienda.id,
        nombre: tienda.nombre,
        dominio: tienda.dominio,
      },
    };
  }
}
