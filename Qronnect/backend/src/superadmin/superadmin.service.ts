import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { SmsService } from '../sms/sms.service';
import { EmailService } from '../email/email.service';
import { CreateTiendaDto } from './dto/create-tienda.dto';
import { UpdateTiendaDto } from './dto/update-tienda.dto';
import { ConfigureSmsDto } from './dto/configure-sms.dto';
import { UpdateSenderIdDto } from './dto/update-sender-id.dto';
import { ConfigureIaDto } from './dto/configure-ia.dto';
import { InformesService } from '../informes/informes.service';
import { FormatoInforme } from '../informes/dto/generar-informe.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SuperAdminService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly smsService: SmsService,
    private readonly emailService: EmailService,
    @Inject(forwardRef(() => InformesService))
    private readonly informesService: InformesService,
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
    console.log('🔐 CÓDIGO OTP DE SUPERADMIN');
    console.log('========================================');
    console.log(`Email: ${email}`);
    console.log(`Código: ${codigo}`);
    console.log(`Expira en: 10 minutos`);
    console.log('========================================\n');

    // Enviar email con el código OTP
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Código de acceso SuperAdmin</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #1a1a1a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #2d2d2d; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">🛡️ SuperAdmin Access</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hola <strong>SuperAdmin</strong>,
              </p>

              <p style="color: #b0b0b0; font-size: 14px; line-height: 1.6; margin: 0 0 30px 0;">
                Has solicitado acceder al panel de <strong>SuperAdmin de Qronnect</strong>. Usa el siguiente código para iniciar sesión:
              </p>

              <!-- Código OTP -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px; background-color: #1a1a1a; border-radius: 8px; border: 2px solid #f59e0b;">
                    <span style="font-size: 40px; font-weight: bold; color: #f59e0b; letter-spacing: 10px; font-family: 'Courier New', monospace;">
                      ${codigo}
                    </span>
                  </td>
                </tr>
              </table>

              <p style="color: #f59e0b; font-size: 13px; line-height: 1.6; margin: 30px 0 0 0; text-align: center; font-weight: bold;">
                ⏱️ Este código expira en <strong>10 minutos</strong>
              </p>

              <div style="margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #404040;">
                <p style="color: #808080; font-size: 12px; line-height: 1.6; margin: 0;">
                  ⚠️ <strong>Advertencia de Seguridad:</strong> Este es un acceso privilegiado al panel de SuperAdmin. Si no solicitaste este código, ignora este mensaje y reporta el incidente inmediatamente.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1a1a1a; padding: 20px; text-align: center; border-top: 1px solid #f59e0b;">
              <p style="color: #808080; font-size: 12px; margin: 0; line-height: 1.6;">
                🔐 <strong>Qronnect SuperAdmin Panel</strong><br>
                © ${new Date().getFullYear()} Qronnect. Todos los derechos reservados.<br>
                Este es un mensaje automático de seguridad, por favor no respondas a este email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Enviar email
    const emailResult = await this.emailService.sendEmail({
      to: email,
      subject: `🔐 Código de acceso SuperAdmin: ${codigo}`,
      html: emailHtml,
    });

    if (!emailResult.success) {
      console.warn('⚠️  No se pudo enviar el email:', emailResult.error);
      console.warn('  - Código disponible en consola para desarrollo');
    } else {
      console.log('✅ Email de SuperAdmin enviado exitosamente');
    }

    return {
      message: `Código de verificación enviado a tu email.`,
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

    // Crear usuario admin con los datos del responsable
    let usuarioAdmin = null;
    let pinGenerado = null;
    let errorUsuario = null;
    let errorEmail = null;

    // Mapeo de rol del formulario a rol de la base de datos
    const rolMapping: Record<string, string> = {
      propietario: 'owner',
      gerente: 'admin',
      administrador: 'admin',
      encargado: 'staff',
    };

    try {
      console.log(`📧 Creando usuario admin para tienda ${tienda.nombre}`);
      console.log(`   - Nombre: ${createDto.admin_nombre}`);
      console.log(`   - Email: ${createDto.admin_email}`);
      console.log(`   - Rol: ${createDto.admin_rol}`);

      // Generar PIN aleatorio de 6 dígitos
      pinGenerado = Math.floor(100000 + Math.random() * 900000).toString();
      const pin_hash = await bcrypt.hash(pinGenerado, 10);

      // Crear usuario admin para la tienda con los datos del responsable
      const { data: usuario, error: userError } = await supabase
        .from('usuarios_tienda')
        .insert({
          id_tienda: tienda.id,
          nombre: createDto.admin_nombre,
          email: createDto.admin_email,
          telefono: createDto.telefono || null,
          pin_hash: pin_hash,
          rol: rolMapping[createDto.admin_rol] || 'owner',
          sms_2fa_activo: false,
          activo: true,
        })
        .select()
        .single();

      if (userError) {
        console.error('❌ Error al crear usuario admin:', userError);
        errorUsuario = userError.message || 'Error desconocido al crear usuario';
      } else {
        console.log(`✅ Usuario admin creado: ${usuario.id}`);
        usuarioAdmin = usuario;

        // Enviar email con credenciales
        try {
          await this.enviarEmailBienvenidaTienda(
            createDto.admin_email,
            createDto.admin_nombre,
            tienda.dominio,
            pinGenerado,
            createDto.admin_rol,
          );
        } catch (emailErr: any) {
          console.error('❌ Error al enviar email de bienvenida:', emailErr);
          errorEmail = emailErr.message || 'Error al enviar email';
        }
      }
    } catch (err: any) {
      console.error('❌ Error general al crear usuario/enviar email:', err);
      errorUsuario = err.message || 'Error general';
    }

    // Registrar en audit log
    await this.registrarAuditLog(superadminId, 'crear_tienda', 'tienda', tienda.id, {
      tienda_nombre: tienda.nombre,
      dominio: tienda.dominio,
      usuario_admin_creado: !!usuarioAdmin,
    });

    return {
      ...tienda,
      usuario_admin_creado: !!usuarioAdmin,
      credenciales_enviadas: !!usuarioAdmin && !!pinGenerado && !errorEmail,
      error_usuario: errorUsuario,
      error_email: errorEmail,
    };
  }

  /**
   * Enviar email de bienvenida con credenciales a nueva tienda
   */
  private async enviarEmailBienvenidaTienda(
    email: string,
    nombreAdmin: string,
    dominio: string,
    pin: string,
    rolAdmin: string = 'propietario',
  ): Promise<void> {
    const urlAcceso = `https://${dominio}.qronnect.es/admin`;

    // Mapeo de roles a texto legible
    const rolTexto: Record<string, string> = {
      propietario: 'Propietario',
      gerente: 'Gerente',
      administrador: 'Administrador',
      encargado: 'Encargado',
    };

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido a Qronnect</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Bienvenido a Qronnect</h1>
              <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Tu programa de fidelización está listo</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hola <strong>${nombreAdmin}</strong>,
              </p>

              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 30px 0;">
                Has sido registrado como <strong>${rolTexto[rolAdmin] || 'Administrador'}</strong> en <strong>Qronnect</strong>. A continuación encontrarás tus credenciales de acceso al panel de administración.
              </p>

              <!-- Credenciales -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 16px;">Tus credenciales de acceso</h3>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Email:</td>
                        <td style="padding: 8px 0; color: #374151; font-size: 14px; font-weight: bold;">${email}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">PIN de acceso:</td>
                        <td style="padding: 8px 0;">
                          <span style="background-color: #8b5cf6; color: #ffffff; padding: 4px 12px; border-radius: 4px; font-family: monospace; font-size: 18px; font-weight: bold; letter-spacing: 2px;">${pin}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">URL de acceso:</td>
                        <td style="padding: 8px 0;">
                          <a href="${urlAcceso}" style="color: #8b5cf6; text-decoration: none; font-size: 14px;">${urlAcceso}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Botón de acceso -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${urlAcceso}" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: bold;">
                      Acceder al Panel de Admin
                    </a>
                  </td>
                </tr>
              </table>

              <div style="margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px; line-height: 1.6; margin: 0;">
                  <strong>Importante:</strong> Te recomendamos cambiar tu PIN desde el panel de configuración una vez que accedas. Guarda estas credenciales en un lugar seguro.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0; line-height: 1.6;">
                <strong>Qronnect</strong> - Sistema de Fidelización con QR<br>
                © ${new Date().getFullYear()} Qronnect. Todos los derechos reservados.<br>
                Este es un mensaje automático, por favor no respondas a este email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    try {
      const resultado = await this.emailService.sendEmail({
        to: email,
        subject: `Bienvenido a Qronnect - Credenciales de acceso para ${nombreTienda}`,
        html: emailHtml,
      });

      if (resultado.success) {
        console.log(`✅ Email de bienvenida enviado a ${email} (ID: ${resultado.messageId})`);
      } else {
        console.error(`❌ Error al enviar email de bienvenida a ${email}: ${resultado.error}`);
        throw new Error(resultado.error || 'Error desconocido al enviar email');
      }
    } catch (error) {
      console.error('Error al enviar email de bienvenida:', error);
      throw error;
    }
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

  // ========================================
  // INFORMES MENSUALES
  // ========================================

  /**
   * Listar informes mensuales de una tienda
   */
  async listarInformesTienda(tiendaId: string, limite: number = 12) {
    return this.informesService.listarInformes(tiendaId, limite);
  }

  /**
   * Generar informe mensual para una tienda
   */
  async generarInformeTienda(
    tiendaId: string,
    params: { periodo_mes?: number; periodo_anio?: number },
  ) {
    return this.informesService.generarInforme(tiendaId, {
      periodo_mes: params.periodo_mes,
      periodo_anio: params.periodo_anio,
      formato: FormatoInforme.JSON,
    });
  }

  /**
   * Enviar informe por email a una tienda (desde superadmin)
   */
  async enviarInformeTienda(
    superadminId: string,
    tiendaId: string,
    params: { email_destino: string; periodo_mes?: number; periodo_anio?: number },
  ) {
    const supabase = this.supabaseService.getAdminClient();

    // Verificar que la tienda existe
    const { data: tienda } = await supabase
      .from('tiendas')
      .select('nombre')
      .eq('id', tiendaId)
      .single();

    if (!tienda) {
      throw new NotFoundException('Tienda no encontrada');
    }

    // Enviar informe
    const resultado = await this.informesService.enviarInforme(
      tiendaId,
      {
        periodo_mes: params.periodo_mes,
        periodo_anio: params.periodo_anio,
        email_destino: params.email_destino,
      },
      superadminId, // Indica que fue enviado manualmente por superadmin
    );

    // Registrar en audit log
    await this.registrarAuditLog(superadminId, 'enviar_informe_manual', 'informe', resultado.id_informe, {
      tienda_id: tiendaId,
      tienda_nombre: tienda.nombre,
      email_destino: params.email_destino,
    });

    return resultado;
  }

  /**
   * Obtener configuración de informes de una tienda
   */
  async obtenerConfiguracionInformes(tiendaId: string) {
    return this.informesService.obtenerConfiguracion(tiendaId);
  }

  /**
   * Configurar envío automático de informes para una tienda
   */
  async configurarInformesTienda(tiendaId: string, configuracion: any) {
    return this.informesService.configurarEnvioAutomatico(tiendaId, {
      ...configuracion,
      id_tienda: tiendaId,
    });
  }
}
