import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import { EmailService } from '../email/email.service';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { ClienteResponseDto } from './dto/cliente-response.dto';
import { PuntosResponseDto } from './dto/puntos-response.dto';
import { RegisterClienteDto } from './dto/register-cliente.dto';
import { SendCodeClienteDto } from './dto/send-code-cliente.dto';
import { VerifyCodeClienteDto } from './dto/verify-code-cliente.dto';
import { SendValidationCodeDto } from './dto/send-validation-code.dto';
import { VerifyValidationCodeDto } from './dto/verify-validation-code.dto';
import { ReferidosService } from '../referidos/referidos.service';
import { RegalosService } from '../referidos/regalos.service';
import * as crypto from 'crypto';

@Injectable()
export class ClientesService {
  constructor(
    private supabaseService: SupabaseService,
    private configService: ConfigService,
    private emailService: EmailService,
    @Inject(forwardRef(() => ReferidosService))
    private referidosService: ReferidosService,
    private regalosService: RegalosService,
  ) {}

  /**
   * Obtiene el cliente por supabase_user_id para una tienda específica
   * Si no existe, lo crea automáticamente asociándolo a la tienda del tenant actual
   *
   * MULTITENANCY: Ahora requiere el tenantId (determinado por el dominio)
   */
  async getOrCreateCliente(supabaseUserId: string, tenantId: string): Promise<ClienteResponseDto> {
    const supabase = this.supabaseService.getAdminClient();

    // Intentar obtener el cliente existente para ESTA TIENDA
    const { data: existingCliente, error: fetchError } = await supabase
      .from('clientes')
      .select('*')
      .eq('supabase_user_id', supabaseUserId)
      .eq('id_tienda', tenantId) // ← Filtrar por tienda actual
      .single();

    if (existingCliente) {
      return this.mapToResponseDto(existingCliente);
    }

    // Si no existe, crear uno nuevo para esta tienda
    const { data: newCliente, error: createError } = await supabase
      .from('clientes')
      .insert({
        supabase_user_id: supabaseUserId,
        id_tienda: tenantId, // ← Usar la tienda del dominio
        puntos_totales: 0,
        activo: true,
      })
      .select()
      .single();

    if (createError || !newCliente) {
      console.error('Error al crear cliente:', createError);
      throw new Error('No se pudo crear el cliente');
    }

    return this.mapToResponseDto(newCliente);
  }

  /**
   * Actualiza los datos del cliente en una tienda específica
   *
   * MULTITENANCY: Filtra por tenant para evitar actualizaciones cross-tenant
   */
  async updateCliente(
    supabaseUserId: string,
    tenantId: string,
    updateDto: UpdateClienteDto,
  ): Promise<ClienteResponseDto> {
    const supabase = this.supabaseService.getAdminClient();

    // Primero verificar que el cliente existe EN ESTA TIENDA
    const { data: existingCliente } = await supabase
      .from('clientes')
      .select('id')
      .eq('supabase_user_id', supabaseUserId)
      .eq('id_tienda', tenantId) // ← Importante: verificar tenant
      .single();

    if (!existingCliente) {
      throw new NotFoundException('Cliente no encontrado en esta tienda');
    }

    // Actualizar los datos
    const { data: updatedCliente, error } = await supabase
      .from('clientes')
      .update({
        ...(updateDto.telefono && { telefono: updateDto.telefono }),
        ...(updateDto.email && { email: updateDto.email }),
        ...(updateDto.nombre && { nombre: updateDto.nombre }),
        ...(updateDto.genero && { genero: updateDto.genero }),
      })
      .eq('supabase_user_id', supabaseUserId)
      .eq('id_tienda', tenantId) // ← Importante: actualizar solo en este tenant
      .select()
      .single();

    if (error || !updatedCliente) {
      console.error('Error al actualizar cliente:', error);
      throw new Error('No se pudo actualizar el cliente');
    }

    return this.mapToResponseDto(updatedCliente);
  }

  /**
   * Obtiene los puntos totales y las últimas compras del cliente en una tienda específica
   *
   * MULTITENANCY: Solo devuelve compras de la tienda actual
   */
  async getPuntosYCompras(supabaseUserId: string, tenantId: string): Promise<PuntosResponseDto> {
    const supabase = this.supabaseService.getAdminClient();

    // Obtener el cliente EN ESTA TIENDA
    const { data: cliente, error: clienteError } = await supabase
      .from('clientes')
      .select('id, puntos_totales')
      .eq('supabase_user_id', supabaseUserId)
      .eq('id_tienda', tenantId) // ← Filtrar por tenant
      .single();

    if (clienteError || !cliente) {
      throw new NotFoundException('Cliente no encontrado en esta tienda');
    }

    // Obtener las últimas 10 compras DE ESTA TIENDA
    const { data: compras, error: comprasError } = await supabase
      .from('compras')
      .select('id, fecha, importe, puntos_otorgados, notas')
      .eq('id_cliente', cliente.id)
      .eq('id_tienda', tenantId) // ← Asegurar que sean compras de este tenant
      .order('fecha', { ascending: false })
      .limit(10);

    if (comprasError) {
      console.error('Error al obtener compras:', comprasError);
    }

    return {
      puntos_totales: cliente.puntos_totales,
      ultima_compras: (compras || []).map((c) => ({
        id: c.id,
        fecha: c.fecha,
        importe: parseFloat(c.importe),
        puntos_otorgados: c.puntos_otorgados,
        notas: c.notas,
      })),
    };
  }

  /**
   * Registra un nuevo cliente en una tienda específica
   * Genera automáticamente el QR del cliente
   */
  async registerCliente(
    tenantId: string,
    registerDto: RegisterClienteDto,
  ): Promise<{
    cliente: ClienteResponseDto;
    qr_code: string;
    requiere_validacion: boolean;
    mensaje: string;
  }> {
    const supabase = this.supabaseService.getAdminClient();

    console.log('📝 [REGISTER CLIENTE]');
    console.log('  - Email:', registerDto.email);
    console.log('  - Tenant ID:', tenantId);
    console.log('  - Código referido:', registerDto.codigo_referido || 'ninguno');

    // ⚠️ TEMPORAL: Validación deshabilitada para testing
    // Verificar si el cliente ya existe en esta tienda
    // const { data: existingCliente } = await supabase
    //   .from('clientes')
    //   .select('id')
    //   .eq('email', registerDto.email)
    //   .eq('id_tienda', tenantId)
    //   .single();

    // if (existingCliente) {
    //   throw new BadRequestException('Ya estás registrado en esta tienda');
    // }
    console.log('  ⚠️  Validación de usuario duplicado DESHABILITADA para testing');

    // Crear el nuevo cliente
    const { data: newCliente, error } = await supabase
      .from('clientes')
      .insert({
        id_tienda: tenantId,
        nombre: registerDto.nombre,
        email: registerDto.email,
        telefono: registerDto.telefono,
        codigo_postal: registerDto.codigo_postal,
        fecha_nacimiento: registerDto.fecha_nacimiento,
        genero: registerDto.genero,
        puntos_totales: 0,
        activo: true,
      })
      .select()
      .single();

    if (error || !newCliente) {
      console.error('Error al crear cliente:', error);
      throw new Error('No se pudo crear el cliente');
    }

    console.log('  - Cliente creado:', newCliente.id);

    // Procesar código de referido si fue proporcionado
    if (registerDto.codigo_referido) {
      try {
        console.log('  - Procesando código de referido:', registerDto.codigo_referido);

        const resultadoReferido = await this.referidosService.registrarReferido(tenantId, {
          codigo_referido: registerDto.codigo_referido,
          nuevo_cliente_id: newCliente.id,
        });

        if (resultadoReferido.success) {
          console.log('  ✅ Referido registrado exitosamente');
          console.log('  - Puntos para referidor:', resultadoReferido.puntos_otorgados_referidor);
          console.log('  - Puntos para nuevo cliente:', resultadoReferido.puntos_otorgados_referido);
        } else {
          console.warn('  ⚠️  No se pudo registrar el referido:', resultadoReferido.message);
        }
      } catch (referidoError) {
        console.error('  ❌ Error procesando referido:', referidoError);
        // No fallar el registro si el referido falla
      }
    }

    // Enviar enlace de validación de email automáticamente
    try {
      console.log('  - Enviando enlace de validación de email...');

      // Generar token único para validación
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

      console.log('📧 [VALIDACIÓN EMAIL - REGISTRO]');
      console.log('  - Cliente ID:', newCliente.id);
      console.log('  - Destinatario:', newCliente.email);
      console.log('  - Token generado:', token);
      console.log('  - Token expira en:', expiresAt.toISOString());

      // Guardar token en la base de datos ANTES de enviar el email
      const { error: updateError } = await supabase
        .from('clientes')
        .update({
          codigo_validacion: token,
          codigo_validacion_expires_at: expiresAt.toISOString(),
          validacion_enviada_at: new Date().toISOString(),
        })
        .eq('id', newCliente.id);

      if (updateError) {
        console.error('❌ Error al guardar token de validación:', updateError);
        throw new Error('No se pudo guardar el token de validación');
      }

      console.log('✅ Token guardado en base de datos');

      // Obtener información de la tienda
      const { data: tienda, error: tiendaError } = await supabase
        .from('tiendas')
        .select('nombre, nombre_comercial, dominio')
        .eq('id', tenantId)
        .single();

      if (tiendaError || !tienda) {
        console.error('❌ Error obteniendo tienda:', tiendaError);
        throw new Error('No se pudo obtener información de la tienda');
      }

      const nombreTienda = tienda.nombre_comercial || tienda.nombre || 'Nuestra tienda';
      const dominioTienda = tienda.dominio;

      console.log('  - Tienda:', nombreTienda, `(dominio: ${dominioTienda})`);

      // Construir URL de validación
      const nodeEnv = this.configService.get('NODE_ENV');
      const isDevelopment = nodeEnv === 'development';

      let validationUrl: string;
      if (isDevelopment) {
        const frontendPort = this.configService.get('FRONTEND_PORT') || '3000';
        validationUrl = `http://${dominioTienda}.localhost:${frontendPort}/validar-email?token=${token}`;
      } else {
        const baseDomain = this.configService.get('BASE_DOMAIN') || 'qronnect.es';
        validationUrl = `https://${dominioTienda}.${baseDomain}/validar-email?token=${token}`;
      }

      console.log('  - URL de validación:', validationUrl);

      // Construir el email remitente (igual que en sendLoginCode)
      const useWildcard = process.env.RESEND_WILDCARD_ENABLED === 'true';
      const fromEmail = useWildcard
        ? `${nombreTienda} <noreply@${dominioTienda}.qronnect.es>`
        : `${nombreTienda} <noreply@qronnect.es>`;

      console.log('  - From Email:', fromEmail);

      // Enviar email
      const emailResult = await this.emailService.sendEmail({
        to: newCliente.email,
        subject: `Confirma tu email - ${nombreTienda}`,
        from: fromEmail, // ⬅️ CRÍTICO: Especificar el remitente
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirma tu email</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">✉️ Confirma tu Email</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hola <strong>${newCliente.nombre}</strong>,
              </p>
              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0 0 30px 0;">
                Gracias por registrarte en <strong>${nombreTienda}</strong>. Para completar tu registro, necesitamos que confirmes tu dirección de email.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${validationUrl}"
                       style="display: inline-block; padding: 16px 32px; background-color: #667eea; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                      Confirmar mi email
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #666666; font-size: 13px; line-height: 1.6; margin: 30px 0 0 0; text-align: center;">
                ⏱️ Este enlace expira en <strong>24 horas</strong>
              </p>
              <p style="color: #999999; font-size: 12px; line-height: 1.6; margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #eeeeee;">
                Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:<br>
                <a href="${validationUrl}" style="color: #667eea; word-break: break-all;">${validationUrl}</a>
              </p>
              <p style="color: #999999; font-size: 12px; line-height: 1.6; margin: 20px 0 0 0;">
                Si no te registraste en ${nombreTienda}, puedes ignorar este mensaje de forma segura.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px; text-align: center;">
              <p style="color: #999999; font-size: 12px; margin: 0; line-height: 1.6;">
                © ${new Date().getFullYear()} ${nombreTienda}. Todos los derechos reservados.<br>
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
        `,
      });

      console.log('📬 Resultado del envío:', JSON.stringify(emailResult, null, 2));

      if (emailResult.success) {
        console.log('✅ Enlace de validación enviado a:', newCliente.email);
        console.log('  - Message ID:', emailResult.messageId);
      } else {
        console.error('❌ Error al enviar email de validación:', emailResult.error);
      }
    } catch (emailError) {
      console.error('💥 ERROR CRÍTICO enviando enlace de validación:');
      console.error('   Tipo:', emailError?.constructor?.name);
      console.error('   Mensaje:', emailError?.message);
      console.error('   Stack:', emailError?.stack);
      // No fallar el registro si el email falla, solo loguearlo
      // PERO esto significa que el usuario NO recibirá el email automáticamente
    }

    // El QR del cliente es su ID
    const qr_code = newCliente.id;

    // ⚠️ NO GENERAR ACCESS_TOKEN AQUÍ
    // El usuario debe validar su email antes de poder hacer login
    console.log('  - Registro completado. Usuario debe validar email antes de acceder.');

    return {
      cliente: this.mapToResponseDto(newCliente),
      qr_code,
      // NO devolver access_token - el usuario debe validar su email primero
      requiere_validacion: true,
      mensaje: 'Registro exitoso. Por favor revisa tu email para validar tu cuenta.',
    };
  }

  /**
   * Envía un código OTP por email al cliente
   */
  async sendLoginCode(
    tenantId: string,
    sendCodeDto: SendCodeClienteDto,
  ): Promise<{
    message: string;
    codigo_enviado: string; // Solo para desarrollo
  }> {
    const supabase = this.supabaseService.getAdminClient();

    console.log('📧 [SEND LOGIN CODE]');
    console.log('  - Email:', sendCodeDto.email);
    console.log('  - Tenant ID:', tenantId);

    // Verificar que el cliente existe en esta tienda
    const { data: cliente, error } = await supabase
      .from('clientes')
      .select('id, nombre')
      .eq('email', sendCodeDto.email)
      .eq('id_tienda', tenantId)
      .eq('activo', true)
      .single();

    if (error || !cliente) {
      throw new NotFoundException('Cliente no encontrado en esta tienda');
    }

    // Generar código de 6 dígitos
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    // Guardar código en la tabla email_otps (reutilizamos la misma tabla)
    const { error: otpError } = await supabase.from('email_otps').insert({
      email: sendCodeDto.email,
      codigo,
      expira_en: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutos
    });

    if (otpError) {
      console.error('Error al guardar OTP:', otpError);
      throw new Error('No se pudo enviar el código');
    }

    console.log('  - Código generado:', codigo);

    // Obtener nombre y dominio de la tienda
    const { data: tienda } = await supabase
      .from('tiendas')
      .select('nombre, dominio')
      .eq('id', tenantId)
      .single();

    const nombreTienda = tienda?.nombre || 'Qronnect';
    const dominioTienda = tienda?.dominio || 'qronnect';

    // Construir el email remitente
    // Si RESEND_WILDCARD_ENABLED=true en .env, usa subdominios dinámicos
    // Si no, usa el dominio base pero con el nombre de la tienda visible
    const useWildcard = process.env.RESEND_WILDCARD_ENABLED === 'true';
    const fromEmail = useWildcard
      ? `${nombreTienda} <noreply@${dominioTienda}.qronnect.es>`
      : `${nombreTienda} <noreply@qronnect.es>`;

    // Enviar email con el código OTP
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Código de acceso</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">🔐 Código de Acceso</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hola <strong>${cliente.nombre}</strong>,
              </p>

              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0 0 30px 0;">
                Has solicitado acceder a tu cuenta en <strong>${nombreTienda}</strong>. Usa el siguiente código para iniciar sesión:
              </p>

              <!-- Código OTP -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px; background-color: #f8f9fa; border-radius: 8px; border: 2px dashed #667eea;">
                    <span style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                      ${codigo}
                    </span>
                  </td>
                </tr>
              </table>

              <p style="color: #666666; font-size: 13px; line-height: 1.6; margin: 30px 0 0 0; text-align: center;">
                ⏱️ Este código expira en <strong>10 minutos</strong>
              </p>

              <p style="color: #999999; font-size: 12px; line-height: 1.6; margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #eeeeee;">
                Si no solicitaste este código, puedes ignorar este mensaje de forma segura.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px; text-align: center;">
              <p style="color: #999999; font-size: 12px; margin: 0; line-height: 1.6;">
                © ${new Date().getFullYear()} ${nombreTienda}. Todos los derechos reservados.<br>
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

    // Enviar email
    const emailResult = await this.emailService.sendEmail({
      to: sendCodeDto.email,
      subject: `Tu código de acceso: ${codigo}`,
      html: emailHtml,
      from: fromEmail, // Email dinámico basado en el tenant
    });

    if (!emailResult.success) {
      console.warn('⚠️  No se pudo enviar el email:', emailResult.error);
      console.warn('  - Devolviendo código en desarrollo para testing');
    } else {
      console.log('✅ Email enviado exitosamente');
    }

    // En desarrollo, devolver el código para facilitar testing
    const isDevelopment = this.configService.get('NODE_ENV') === 'development';

    return {
      message: 'Código enviado a tu email',
      codigo_enviado: isDevelopment ? codigo : undefined, // Solo en desarrollo
    };
  }

  /**
   * Verifica el código OTP y devuelve un token de acceso
   */
  async verifyLoginCode(
    tenantId: string,
    verifyDto: VerifyCodeClienteDto,
  ): Promise<{
    access_token: string;
    cliente: ClienteResponseDto;
    email_validado: boolean;
    requiere_validacion?: boolean;
  }> {
    const supabase = this.supabaseService.getAdminClient();

    console.log('🔐 [VERIFY LOGIN CODE]');
    console.log('  - Email:', verifyDto.email);
    console.log('  - Código:', verifyDto.codigo);
    console.log('  - Tenant ID:', tenantId);

    // Verificar el código OTP
    const { data: otp, error: otpError } = await supabase
      .from('email_otps')
      .select('*')
      .eq('email', verifyDto.email)
      .eq('codigo', verifyDto.codigo)
      .gte('expira_en', new Date().toISOString())
      .order('creado_en', { ascending: false })
      .limit(1)
      .single();

    if (otpError || !otp) {
      throw new UnauthorizedException('Código inválido o expirado');
    }

    // Obtener el cliente
    const { data: cliente, error: clienteError } = await supabase
      .from('clientes')
      .select('*')
      .eq('email', verifyDto.email)
      .eq('id_tienda', tenantId)
      .eq('activo', true)
      .single();

    if (clienteError || !cliente) {
      throw new NotFoundException('Cliente no encontrado en esta tienda');
    }

    // Marcar el código como usado
    await supabase.from('email_otps').delete().eq('id', otp.id);

    // Verificar si el email está validado
    const emailValidado = cliente.email_validado === true;

    if (!emailValidado) {
      console.log('  ⚠️  Email NO validado para:', cliente.email);
      // NO permitir login completo, pero retornar info para que el frontend sepa qué hacer
      throw new UnauthorizedException(
        'Debes validar tu email antes de poder acceder. Revisa tu bandeja de entrada y haz clic en el enlace de validación.'
      );
    }

    // Actualizar última visita
    await supabase
      .from('clientes')
      .update({ ultima_visita: new Date().toISOString() })
      .eq('id', cliente.id);

    // Generar token sin expiración
    // El token solo se invalida si el cliente es desactivado en BD
    const access_token = Buffer.from(
      JSON.stringify({
        sub: cliente.id,
        tienda_id: cliente.id_tienda,
        email: cliente.email,
        role: 'cliente',
        // Sin campo 'exp' - sesión permanente
      }),
    ).toString('base64');

    console.log('  - Login exitoso - Email validado ✅');

    return {
      access_token,
      cliente: this.mapToResponseDto(cliente),
      email_validado: true,
    };
  }

  /**
   * Obtiene el cliente actual por ID (para cuando ya está autenticado)
   */
  async getClienteById(clienteId: string, tenantId: string): Promise<ClienteResponseDto> {
    const supabase = this.supabaseService.getAdminClient();

    const { data: cliente, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', clienteId)
      .eq('id_tienda', tenantId)
      .eq('activo', true)
      .single();

    if (error || !cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }

    return this.mapToResponseDto(cliente);
  }

  /**
   * Actualiza los datos del cliente por ID
   */
  async updateClienteById(
    clienteId: string,
    tenantId: string,
    updateDto: UpdateClienteDto,
  ): Promise<ClienteResponseDto> {
    const supabase = this.supabaseService.getAdminClient();

    // Actualizar los datos
    const { data: updatedCliente, error } = await supabase
      .from('clientes')
      .update({
        ...(updateDto.telefono && { telefono: updateDto.telefono }),
        ...(updateDto.email && { email: updateDto.email }),
        ...(updateDto.nombre && { nombre: updateDto.nombre }),
        ...(updateDto.genero && { genero: updateDto.genero }),
      })
      .eq('id', clienteId)
      .eq('id_tienda', tenantId)
      .eq('activo', true)
      .select()
      .single();

    if (error || !updatedCliente) {
      console.error('Error al actualizar cliente:', error);
      throw new NotFoundException('Cliente no encontrado o no se pudo actualizar');
    }

    return this.mapToResponseDto(updatedCliente);
  }

  /**
   * Obtiene los puntos y compras del cliente por ID
   */
  async getPuntosYComprasByClienteId(
    clienteId: string,
    tenantId: string,
  ): Promise<PuntosResponseDto> {
    const supabase = this.supabaseService.getAdminClient();

    // Obtener el cliente EN ESTA TIENDA
    const { data: cliente, error: clienteError } = await supabase
      .from('clientes')
      .select('id, puntos_totales')
      .eq('id', clienteId)
      .eq('id_tienda', tenantId)
      .eq('activo', true)
      .single();

    if (clienteError || !cliente) {
      throw new NotFoundException('Cliente no encontrado en esta tienda');
    }

    // Obtener las últimas 10 compras DE ESTA TIENDA
    const { data: compras, error: comprasError } = await supabase
      .from('compras')
      .select('id, fecha, importe, puntos_otorgados, notas')
      .eq('id_cliente', cliente.id)
      .eq('id_tienda', tenantId)
      .order('fecha', { ascending: false })
      .limit(10);

    if (comprasError) {
      console.error('Error al obtener compras:', comprasError);
    }

    return {
      puntos_totales: cliente.puntos_totales,
      ultima_compras: (compras || []).map((c) => ({
        id: c.id,
        fecha: c.fecha,
        importe: parseFloat(c.importe),
        puntos_otorgados: c.puntos_otorgados,
        notas: c.notas,
      })),
    };
  }

  /**
   * =====================================================
   * VALIDACIÓN DE EMAIL
   * =====================================================
   */

  /**
   * Envía un enlace de validación al email del cliente
   * El enlace expira en 24 horas
   */
  async sendValidationCode(
    tenantId: string,
    sendValidationDto: SendValidationCodeDto,
  ): Promise<{ message: string; codigo_enviado?: string }> {
    const supabase = this.supabaseService.getAdminClient();
    const { email } = sendValidationDto;

    // Buscar el cliente por email en la tienda actual
    const { data: cliente, error: fetchError } = await supabase
      .from('clientes')
      .select('*')
      .eq('email', email)
      .eq('id_tienda', tenantId)
      .single();

    if (fetchError || !cliente) {
      throw new NotFoundException('Cliente no encontrado en esta tienda');
    }

    // Si ya está validado, no enviar enlace de nuevo
    if (cliente.email_validado) {
      return {
        message: 'El email ya está validado',
      };
    }

    // Generar token único para validación (más seguro que un código)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Guardar token en la base de datos
    const { error: updateError } = await supabase
      .from('clientes')
      .update({
        codigo_validacion: token, // Reutilizamos este campo para el token
        codigo_validacion_expires_at: expiresAt.toISOString(),
        validacion_enviada_at: new Date().toISOString(),
      })
      .eq('id', cliente.id);

    if (updateError) {
      console.error('Error al guardar token de validación:', updateError);
      throw new BadRequestException('Error al generar enlace de validación');
    }

    // Obtener información de la tienda para el email
    const { data: tienda } = await supabase
      .from('tiendas')
      .select('nombre, nombre_comercial, dominio')
      .eq('id', tenantId)
      .single();

    const nombreTienda = tienda?.nombre_comercial || tienda?.nombre || 'Nuestra tienda';

    // Construir URL de validación
    const nodeEnv = this.configService.get('NODE_ENV');
    const isDevelopment = nodeEnv === 'development';

    let validationUrl: string;
    if (isDevelopment) {
      const frontendPort = this.configService.get('FRONTEND_PORT') || '3000';
      validationUrl = `http://${tienda.dominio}.localhost:${frontendPort}/validar-email?token=${token}`;
    } else {
      const baseDomain = this.configService.get('BASE_DOMAIN') || 'qronnect.es';
      validationUrl = `https://${tienda.dominio}.${baseDomain}/validar-email?token=${token}`;
    }

    // Enviar email con el enlace
    console.log('📧 [VALIDACIÓN EMAIL]');
    console.log('  - Destinatario:', email);
    console.log('  - Token generado:', token.substring(0, 10) + '...');
    console.log('  - URL de validación:', validationUrl);
    console.log('  - Nombre tienda:', nombreTienda);

    try {
      const emailResult = await this.emailService.sendEmail({
        to: email,
        subject: `Confirma tu email - ${nombreTienda}`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirma tu email</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">✉️ Confirma tu Email</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hola <strong>${cliente.nombre}</strong>,
              </p>

              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0 0 30px 0;">
                Gracias por registrarte en <strong>${nombreTienda}</strong>. Para completar tu registro, necesitamos que confirmes tu dirección de email.
              </p>

              <!-- Botón de validación -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${validationUrl}"
                       style="display: inline-block; padding: 16px 32px; background-color: #667eea; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                      Confirmar mi email
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color: #666666; font-size: 13px; line-height: 1.6; margin: 30px 0 0 0; text-align: center;">
                ⏱️ Este enlace expira en <strong>24 horas</strong>
              </p>

              <p style="color: #999999; font-size: 12px; line-height: 1.6; margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #eeeeee;">
                Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:<br>
                <a href="${validationUrl}" style="color: #667eea; word-break: break-all;">${validationUrl}</a>
              </p>

              <p style="color: #999999; font-size: 12px; line-height: 1.6; margin: 20px 0 0 0;">
                Si no te registraste en ${nombreTienda}, puedes ignorar este mensaje de forma segura.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px; text-align: center;">
              <p style="color: #999999; font-size: 12px; margin: 0; line-height: 1.6;">
                © ${new Date().getFullYear()} ${nombreTienda}. Todos los derechos reservados.<br>
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
        `,
      });

      console.log('📬 Resultado del envío:', JSON.stringify(emailResult, null, 2));

      if (emailResult.success) {
        console.log('✅ Enlace de validación enviado a:', email);
        console.log('  - Message ID:', emailResult.messageId);
      } else {
        console.error('❌ Error al enviar email de validación:', emailResult.error);
      }
    } catch (emailError) {
      console.error('💥 Excepción al enviar email de validación:', emailError);
      // No lanzar error para que en desarrollo se pueda usar el token
    }

    // En desarrollo, devolver el enlace completo para testing
    return {
      message: 'Enlace de validación enviado al email',
      ...(isDevelopment && { codigo_enviado: validationUrl }),
    };
  }

  /**
   * Verifica el código de validación y marca el email como validado
   */
  async verifyValidationCode(
    tenantId: string,
    verifyDto: VerifyValidationCodeDto,
  ): Promise<{ message: string; email_validado: boolean }> {
    const supabase = this.supabaseService.getAdminClient();
    const { email, codigo } = verifyDto;

    // Buscar el cliente por email y código
    const { data: cliente, error: fetchError } = await supabase
      .from('clientes')
      .select('*')
      .eq('email', email)
      .eq('id_tienda', tenantId)
      .eq('codigo_validacion', codigo)
      .single();

    if (fetchError || !cliente) {
      throw new UnauthorizedException('Código de validación inválido');
    }

    // Verificar si el código ha expirado
    const now = new Date();
    const expiresAt = new Date(cliente.codigo_validacion_expires_at);

    if (now > expiresAt) {
      throw new UnauthorizedException('El código de validación ha expirado');
    }

    // Marcar el email como validado y limpiar el código
    const { error: updateError } = await supabase
      .from('clientes')
      .update({
        email_validado: true,
        codigo_validacion: null,
        codigo_validacion_expires_at: null,
      })
      .eq('id', cliente.id);

    if (updateError) {
      console.error('Error al validar email:', updateError);
      throw new BadRequestException('Error al validar el email');
    }

    return {
      message: 'Email validado exitosamente',
      email_validado: true,
    };
  }

  /**
   * Valida el email del cliente usando el token del enlace
   */
  async validateEmailLink(
    tenantId: string,
    token: string,
  ): Promise<{ message: string; email_validado: boolean; cliente?: ClienteResponseDto; token_expirado?: boolean; nuevo_enlace_enviado?: boolean; access_token?: string }> {
    const supabase = this.supabaseService.getAdminClient();

    console.log('✅ [VALIDAR EMAIL]');
    console.log('  - Tenant ID:', tenantId);
    console.log('  - Token:', token.substring(0, 16) + '...');

    // Buscar el cliente por token
    const { data: cliente, error: fetchError } = await supabase
      .from('clientes')
      .select('*')
      .eq('id_tienda', tenantId)
      .eq('codigo_validacion', token)
      .single();

    if (fetchError || !cliente) {
      console.error('❌ Error buscando cliente:', fetchError);
      console.log('  - ¿El token es correcto?');
      console.log('  - ¿El tenant ID es correcto?');
      throw new UnauthorizedException('Enlace de validación inválido');
    }

    console.log('  - Cliente encontrado:', cliente.email);

    // Verificar si el token ha expirado
    const now = new Date();
    const expiresAt = new Date(cliente.codigo_validacion_expires_at);

    if (now > expiresAt) {
      console.log('⏰ Token expirado para:', cliente.email);
      console.log('  - Generando nuevo enlace automáticamente...');

      // Generar nuevo token
      const newToken = crypto.randomBytes(32).toString('hex');
      const newExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

      // Actualizar el token en la base de datos
      await supabase
        .from('clientes')
        .update({
          codigo_validacion: newToken,
          codigo_validacion_expires_at: newExpiresAt.toISOString(),
          validacion_enviada_at: new Date().toISOString(),
        })
        .eq('id', cliente.id);

      // Obtener información de la tienda
      const { data: tienda } = await supabase
        .from('tiendas')
        .select('nombre, nombre_comercial, dominio')
        .eq('id', tenantId)
        .single();

      const nombreTienda = tienda?.nombre_comercial || tienda?.nombre || 'Nuestra tienda';

      // Construir nueva URL de validación
      const nodeEnv = this.configService.get('NODE_ENV');
      const isDevelopment = nodeEnv === 'development';

      let validationUrl: string;
      if (isDevelopment) {
        const frontendPort = this.configService.get('FRONTEND_PORT') || '3000';
        validationUrl = `http://${tienda.dominio}.localhost:${frontendPort}/validar-email?token=${newToken}`;
      } else {
        const baseDomain = this.configService.get('BASE_DOMAIN') || 'qronnect.es';
        validationUrl = `https://${tienda.dominio}.${baseDomain}/validar-email?token=${newToken}`;
      }

      // Construir el email remitente
      const useWildcard = process.env.RESEND_WILDCARD_ENABLED === 'true';
      const fromEmail = useWildcard
        ? `${nombreTienda} <noreply@${tienda.dominio}.qronnect.es>`
        : `${nombreTienda} <noreply@qronnect.es>`;

      // Enviar nuevo email
      const emailResult = await this.emailService.sendEmail({
        to: cliente.email,
        subject: `Nuevo enlace de validación - ${nombreTienda}`,
        from: fromEmail,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nuevo enlace de validación</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">🔄 Nuevo Enlace de Validación</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hola <strong>${cliente.nombre}</strong>,
              </p>
              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
                Tu enlace de validación anterior ha <strong>expirado</strong>. No te preocupes, hemos generado uno nuevo para ti.
              </p>
              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0 0 30px 0;">
                Haz clic en el botón de abajo para confirmar tu email en <strong>${nombreTienda}</strong>:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${validationUrl}"
                       style="display: inline-block; padding: 16px 32px; background-color: #f5576c; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                      Confirmar mi email
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #666666; font-size: 13px; line-height: 1.6; margin: 30px 0 0 0; text-align: center;">
                ⏱️ Este nuevo enlace expira en <strong>24 horas</strong>
              </p>
              <p style="color: #999999; font-size: 12px; line-height: 1.6; margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #eeeeee;">
                Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:<br>
                <a href="${validationUrl}" style="color: #f5576c; word-break: break-all;">${validationUrl}</a>
              </p>
              <p style="color: #999999; font-size: 12px; line-height: 1.6; margin: 20px 0 0 0;">
                Si no solicitaste este enlace, puedes ignorar este mensaje de forma segura.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px; text-align: center;">
              <p style="color: #999999; font-size: 12px; margin: 0; line-height: 1.6;">
                © ${new Date().getFullYear()} ${nombreTienda}. Todos los derechos reservados.<br>
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
        `,
      });

      console.log('📧 Nuevo enlace enviado:', emailResult.success ? '✅' : '❌');

      return {
        message: 'El enlace ha expirado. Te hemos enviado un nuevo enlace de validación a tu email.',
        email_validado: false,
        token_expirado: true,
        nuevo_enlace_enviado: emailResult.success,
      };
    }

    // Marcar el email como validado y limpiar el token
    const { error: updateError } = await supabase
      .from('clientes')
      .update({
        email_validado: true,
        codigo_validacion: null,
        codigo_validacion_expires_at: null,
      })
      .eq('id', cliente.id);

    if (updateError) {
      console.error('Error al validar email:', updateError);
      throw new BadRequestException('Error al validar el email');
    }

    console.log('✅ Email validado exitosamente para:', cliente.email);

    // 🎁 OTORGAR REGALO DE BIENVENIDA (si está configurado)
    try {
      console.log('\n🎁 [REGALO DE BIENVENIDA]');

      // Obtener configuración de la tienda
      const { data: tienda } = await supabase
        .from('tiendas')
        .select('regalo_bienvenida_activo, regalo_bienvenida_tipo, regalo_bienvenida_puntos, regalo_bienvenida_id_regalo')
        .eq('id', tenantId)
        .single();

      if (tienda?.regalo_bienvenida_activo) {
        const tipo = tienda.regalo_bienvenida_tipo || 'puntos';
        console.log(`  - Tipo de regalo: ${tipo}`);

        if (tipo === 'regalo_concreto' && tienda.regalo_bienvenida_id_regalo) {
          // NUEVO: Otorgar regalo concreto
          console.log(`  - Otorgando regalo concreto ID: ${tienda.regalo_bienvenida_id_regalo}`);

          const cupon = await this.regalosService.otorgarRegalo({
            clienteId: cliente.id,
            regaloId: tienda.regalo_bienvenida_id_regalo,
            origen: 'bienvenida',
            origenDetalles: { email_validado: true },
          });

          console.log(`  ✅ Regalo concreto otorgado: ${cupon.regalo_nombre}`);
          console.log(`  - Cupón ID: ${cupon.id}`);
          console.log(`  - Código: ${cupon.codigo}`);

          // Enviar email con el cupón
          try {
            await this.regalosService.enviarEmailCupon(cupon.id);
            console.log('  📧 Email de cupón enviado');
          } catch (emailError) {
            console.error('  ⚠️  Error enviando email de cupón:', emailError.message);
            // No fallar - el cupón ya está otorgado
          }

        } else if (tipo === 'puntos' && tienda.regalo_bienvenida_puntos > 0) {
          // ACTUAL: Otorgar puntos de bienvenida
          console.log(`  - Otorgando ${tienda.regalo_bienvenida_puntos} puntos de bienvenida`);

          const { error: puntosError } = await supabase
            .from('clientes')
            .update({
              puntos_totales: cliente.puntos_totales + tienda.regalo_bienvenida_puntos
            })
            .eq('id', cliente.id);

          if (!puntosError) {
            console.log(`  ✅ ${tienda.regalo_bienvenida_puntos} puntos otorgados`);
          } else {
            console.error('  ❌ Error otorgando puntos:', puntosError);
          }
        }
      } else {
        console.log('  - Regalo de bienvenida NO activo');
      }
    } catch (regaloError) {
      console.error('  ❌ Error procesando regalo de bienvenida:', regaloError);
      // No fallar la validación por error en regalo
    }

    // Generar JWT access_token para auto-login
    console.log('🔐 Generando access_token para auto-login...');
    const access_token = Buffer.from(
      JSON.stringify({
        sub: cliente.id,
        tienda_id: cliente.id_tienda,
        email: cliente.email,
        role: 'cliente',
        // Sin campo 'exp' - sesión permanente
      }),
    ).toString('base64');

    console.log('✅ Access token generado para auto-login');

    return {
      message: 'Email validado exitosamente',
      email_validado: true,
      cliente: this.mapToResponseDto(cliente),
      access_token, // Incluir token para auto-login
    };
  }

  /**
   * Reenvía el enlace de validación de email al cliente
   */
  async resendValidationLink(
    tenantId: string,
    sendValidationDto: SendValidationCodeDto,
  ): Promise<{ message: string; enlace_enviado: boolean }> {
    const supabase = this.supabaseService.getAdminClient();

    console.log('🔄 [REENVIAR ENLACE DE VALIDACIÓN]');
    console.log('  - Email:', sendValidationDto.email);

    // Buscar el cliente
    const { data: cliente, error: fetchError } = await supabase
      .from('clientes')
      .select('*')
      .eq('email', sendValidationDto.email)
      .eq('id_tienda', tenantId)
      .single();

    if (fetchError || !cliente) {
      throw new NotFoundException('Cliente no encontrado en esta tienda');
    }

    // Verificar si el email ya está validado
    if (cliente.email_validado) {
      throw new BadRequestException('Tu email ya está validado. Puedes iniciar sesión normalmente.');
    }

    // Generar nuevo token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Actualizar el token en la base de datos
    await supabase
      .from('clientes')
      .update({
        codigo_validacion: token,
        codigo_validacion_expires_at: expiresAt.toISOString(),
        validacion_enviada_at: new Date().toISOString(),
      })
      .eq('id', cliente.id);

    // Obtener información de la tienda
    const { data: tienda } = await supabase
      .from('tiendas')
      .select('nombre, nombre_comercial, dominio')
      .eq('id', tenantId)
      .single();

    const nombreTienda = tienda?.nombre_comercial || tienda?.nombre || 'Nuestra tienda';

    // Construir URL de validación
    const nodeEnv = this.configService.get('NODE_ENV');
    const isDevelopment = nodeEnv === 'development';

    let validationUrl: string;
    if (isDevelopment) {
      const frontendPort = this.configService.get('FRONTEND_PORT') || '3000';
      validationUrl = `http://${tienda.dominio}.localhost:${frontendPort}/validar-email?token=${token}`;
    } else {
      const baseDomain = this.configService.get('BASE_DOMAIN') || 'qronnect.es';
      validationUrl = `https://${tienda.dominio}.${baseDomain}/validar-email?token=${token}`;
    }

    // Construir el email remitente
    const useWildcard = process.env.RESEND_WILDCARD_ENABLED === 'true';
    const fromEmail = useWildcard
      ? `${nombreTienda} <noreply@${tienda.dominio}.qronnect.es>`
      : `${nombreTienda} <noreply@qronnect.es>`;

    console.log('  - From Email:', fromEmail);
    console.log('  - URL de validación:', validationUrl);

    // Enviar email
    const emailResult = await this.emailService.sendEmail({
      to: cliente.email,
      subject: `Confirma tu email - ${nombreTienda}`,
      from: fromEmail,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirma tu email</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">✉️ Confirma tu Email</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hola <strong>${cliente.nombre}</strong>,
              </p>
              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0 0 30px 0;">
                Has solicitado un nuevo enlace de validación para <strong>${nombreTienda}</strong>. Haz clic en el botón de abajo para confirmar tu email:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${validationUrl}"
                       style="display: inline-block; padding: 16px 32px; background-color: #667eea; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                      Confirmar mi email
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #666666; font-size: 13px; line-height: 1.6; margin: 30px 0 0 0; text-align: center;">
                ⏱️ Este enlace expira en <strong>24 horas</strong>
              </p>
              <p style="color: #999999; font-size: 12px; line-height: 1.6; margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #eeeeee;">
                Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:<br>
                <a href="${validationUrl}" style="color: #667eea; word-break: break-all;">${validationUrl}</a>
              </p>
              <p style="color: #999999; font-size: 12px; line-height: 1.6; margin: 20px 0 0 0;">
                Si no solicitaste este enlace, puedes ignorar este mensaje de forma segura.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px; text-align: center;">
              <p style="color: #999999; font-size: 12px; margin: 0; line-height: 1.6;">
                © ${new Date().getFullYear()} ${nombreTienda}. Todos los derechos reservados.<br>
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
      `,
    });

    console.log('📧 Resultado del envío:', emailResult.success ? '✅' : '❌');

    if (!emailResult.success) {
      throw new BadRequestException('No se pudo enviar el email. Inténtalo de nuevo más tarde.');
    }

    return {
      message: 'Nuevo enlace de validación enviado a tu email. Revisa tu bandeja de entrada.',
      enlace_enviado: true,
    };
  }

  /**
   * Verifica si un cliente tiene el email validado
   * Lanza excepción si no está validado
   */
  async requireEmailValidated(clienteId: string, tenantId: string): Promise<void> {
    const supabase = this.supabaseService.getAdminClient();

    const { data: cliente, error } = await supabase
      .from('clientes')
      .select('email_validado, email')
      .eq('id', clienteId)
      .eq('id_tienda', tenantId)
      .single();

    if (error || !cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }

    if (!cliente.email_validado) {
      throw new UnauthorizedException(
        'Debes validar tu email antes de acceder. Revisa tu bandeja de entrada.',
      );
    }
  }

  /**
   * Mapea la entidad de base de datos al DTO de respuesta
   */
  private mapToResponseDto(cliente: any): ClienteResponseDto {
    return {
      id: cliente.id,
      nombre: cliente.nombre,
      email: cliente.email,
      telefono: cliente.telefono,
      puntos_totales: cliente.puntos_totales,
      fecha_registro: cliente.fecha_registro,
      ultima_visita: cliente.ultima_visita,
      genero: cliente.genero,
    };
  }

  /**
   * Dar de baja a un cliente de emails de marketing usando su token de unsubscribe
   * No requiere autenticación - solo el token único
   */
  async unsubscribeFromMarketing(token: string): Promise<{ mensaje: string; nombre: string }> {
    const supabase = this.supabaseService.getAdminClient();

    console.log(`\n🚫 [UNSUBSCRIBE EMAIL]`);
    console.log(`  - Token recibido: ${token.substring(0, 10)}...`);

    // Buscar cliente por token de unsubscribe
    const { data: cliente, error } = await supabase
      .from('clientes')
      .select('id, nombre, email, acepta_marketing_email, id_tienda')
      .eq('unsubscribe_token', token)
      .single();

    if (error || !cliente) {
      console.log(`  ❌ Cliente no encontrado con ese token`);
      throw new NotFoundException('Token de baja inválido o expirado');
    }

    console.log(`  - Cliente encontrado: ${cliente.nombre} (${cliente.email})`);
    console.log(`  - Estado actual marketing: ${cliente.acepta_marketing_email}`);

    // Si ya está dado de baja, devolver mensaje informativo
    if (!cliente.acepta_marketing_email) {
      console.log(`  ℹ️  Ya estaba dado de baja previamente`);
      return {
        mensaje: 'Ya estabas dado de baja de nuestros emails de marketing',
        nombre: cliente.nombre,
      };
    }

    // Actualizar preferencia de marketing
    const { error: updateError } = await supabase
      .from('clientes')
      .update({
        acepta_marketing_email: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', cliente.id);

    if (updateError) {
      console.error(`  ❌ Error al actualizar cliente:`, updateError);
      throw new BadRequestException('Error al procesar tu solicitud de baja');
    }

    console.log(`  ✅ Cliente dado de baja de emails de marketing exitosamente`);

    // Opcional: Enviar email de confirmación de baja
    try {
      const { data: tienda } = await supabase
        .from('tiendas')
        .select('nombre')
        .eq('id', cliente.id_tienda)
        .single();

      await this.emailService.sendEmail(
        cliente.email,
        `Has sido dado de baja - ${tienda?.nombre || 'Nuestro programa'}`,
        `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Baja confirmada</h2>
            <p>Hola ${cliente.nombre},</p>
            <p>Confirmamos que has sido dado de baja de nuestros emails de marketing.</p>
            <p>Ya no recibirás más ofertas y promociones por email.</p>
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              Si cambiaste de opinión, puedes volver a activar las comunicaciones desde tu perfil.
            </p>
            <p style="margin-top: 30px;">
              Saludos,<br>
              ${tienda?.nombre || 'El equipo'}
            </p>
          </div>
        `,
      );
      console.log(`  📧 Email de confirmación de baja enviado`);
    } catch (emailError) {
      console.error(`  ⚠️  Error enviando email de confirmación:`, emailError.message);
      // No lanzar error - la baja ya se procesó correctamente
    }

    return {
      mensaje: 'Te hemos dado de baja exitosamente de nuestros emails de marketing',
      nombre: cliente.nombre,
    };
  }
}
