import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
const twilio = require('twilio');

/**
 * Servicio para envío de SMS con soporte híbrido:
 * - Modo "global": Usa cuenta centralizada de Qronnect
 * - Modo "propio": Usa cuenta Twilio del tenant
 */
@Injectable()
export class SmsService {
  private globalClient: any;
  private globalFromNumber: string;

  constructor(
    private config: ConfigService,
    private supabase: SupabaseService,
  ) {
    // Inicializar cliente global (Opción 2 - centralizado)
    const globalSid = this.config.get('SMS_ACCOUNT_SID');
    const globalToken = this.config.get('SMS_AUTH_TOKEN');

    if (globalSid && globalToken) {
      this.globalClient = twilio(globalSid, globalToken);
      this.globalFromNumber = this.config.get('SMS_FROM_NUMBER');
    }
  }

  /**
   * Envía un SMS según la configuración de la tienda
   * - Si tiene cuenta propia, usa su Twilio
   * - Si no, usa la cuenta global de Qronnect
   */
  async sendSms(params: {
    tiendaId: string;
    to: string;
    message: string;
    tiendaNombre?: string;
  }): Promise<{
    success: boolean;
    messageSid?: string;
    status?: string;
    coste?: number;
    error?: string;
    modo?: 'global' | 'propio';
  }> {
    try {
      // Obtener configuración de la tienda
      const client = this.supabase.getAdminClient();
      const { data: tienda, error } = await client
        .from('tiendas')
        .select('configuracion, nombre, nombre_comercial')
        .eq('id', params.tiendaId)
        .single();

      if (error || !tienda) {
        throw new BadRequestException('Tienda no encontrada');
      }

      const smsConfig = tienda.configuracion?.sms;

      // Verificar si SMS está activo
      if (!smsConfig || smsConfig.activo === false) {
        throw new BadRequestException('SMS no está activado para esta tienda');
      }

      const nombreTienda = params.tiendaNombre || tienda.nombre_comercial || tienda.nombre;

      // MODO PROPIO: Tienda usa su propia cuenta Twilio
      if (smsConfig.modo === 'propio' && smsConfig.credenciales) {
        return await this.sendWithTenantAccount(
          smsConfig.credenciales,
          params.to,
          params.message,
          nombreTienda,
        );
      }

      // MODO GLOBAL: Usar cuenta centralizada de Qronnect
      return await this.sendWithGlobalAccount(
        params.tiendaId,
        params.to,
        params.message,
        nombreTienda,
        smsConfig,
      );
    } catch (error) {
      console.error('[SMS] Error enviando SMS:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Envía SMS usando cuenta propia del tenant (Opción 1)
   */
  private async sendWithTenantAccount(
    credenciales: any,
    to: string,
    message: string,
    tiendaNombre: string,
  ) {
    try {
      // Crear cliente Twilio con credenciales del tenant
      const tenantClient = twilio(
        credenciales.account_sid,
        credenciales.auth_token,
      );

      // Determinar si usar Sender ID alfanumérico o número
      let from: string;
      let mensajeFinal: string;

      if (credenciales.sender_id) {
        // Usar Sender ID alfanumérico (ej: "GYMFITZONE")
        // NO añadir nombre de tienda al mensaje (ya está en el remitente)
        from = credenciales.sender_id;
        mensajeFinal = `${message}\n\nResponde STOP para darte de baja`;
      } else {
        // Usar número de teléfono tradicional
        // Añadir prefijo con nombre de tienda
        from = credenciales.phone_number;
        mensajeFinal = `${tiendaNombre}: ${message}\n\nResponde STOP para darte de baja`;
      }

      const result = await tenantClient.messages.create({
        body: mensajeFinal,
        from: from,
        to: to,
      });

      return {
        success: true,
        messageSid: result.sid,
        status: result.status,
        coste: this.calcularCoste(mensajeFinal),
        modo: 'propio' as const,
      };
    } catch (error) {
      throw new BadRequestException(
        `Error con cuenta Twilio propia: ${error.message}`,
      );
    }
  }

  /**
   * Envía SMS usando cuenta global de Qronnect (Opción 2)
   */
  private async sendWithGlobalAccount(
    tiendaId: string,
    to: string,
    message: string,
    tiendaNombre: string,
    smsConfig: any,
  ) {
    if (!this.globalClient) {
      throw new BadRequestException(
        'Cuenta global de SMS no configurada. Configure SMS_ACCOUNT_SID y SMS_AUTH_TOKEN en .env',
      );
    }

    // Verificar créditos prepagados si están configurados
    if (smsConfig.creditos_disponibles !== undefined) {
      if (smsConfig.creditos_disponibles <= 0) {
        throw new BadRequestException('Créditos SMS agotados. Recarga necesaria.');
      }
    }

    // Verificar límites
    await this.verificarLimites(tiendaId, smsConfig);

    // Determinar si usar Sender ID alfanumérico o número
    let from: string;
    let mensajeFinal: string;

    // IMPORTANTE: Las cuentas trial de Twilio no soportan Sender IDs alfanuméricos
    // Por eso, siempre usamos el número de teléfono en cuentas trial
    // En producción, se puede usar el sender_id si está configurado

    // Por ahora, forzar uso de número de teléfono para evitar errores en cuentas trial
    // TODO: Cuando la cuenta sea de producción, cambiar esta lógica para permitir sender_id
    const usarSenderId = false; // Cambiar a true cuando la cuenta Twilio sea de producción

    if (smsConfig.sender_id && usarSenderId) {
      // Usar Sender ID alfanumérico configurado por tienda (ej: "GYMFITZONE")
      from = smsConfig.sender_id;
      mensajeFinal = `${message}\n\nResponde STOP para darte de baja`;
    } else {
      // Usar número de teléfono global
      // Añadir prefijo con nombre de tienda para identificación
      from = this.globalFromNumber;
      mensajeFinal = `${tiendaNombre}: ${message}\n\nResponde STOP para darte de baja`;
    }

    try {
      const result = await this.globalClient.messages.create({
        body: mensajeFinal,
        from: from,
        to: to,
      });

      // Registrar uso
      await this.registrarUso(tiendaId, 1, this.calcularCoste(mensajeFinal));

      // Descontar crédito si está configurado
      if (smsConfig.creditos_disponibles !== undefined) {
        await this.descontarCredito(tiendaId);
      }

      return {
        success: true,
        messageSid: result.sid,
        status: result.status,
        coste: this.calcularCoste(mensajeFinal),
        modo: 'global' as const,
      };
    } catch (error) {
      throw new BadRequestException(
        `Error con cuenta global: ${error.message}`,
      );
    }
  }

  /**
   * Verifica límites diarios y mensuales
   */
  private async verificarLimites(tiendaId: string, smsConfig: any) {
    if (!smsConfig.limites) return;

    const client = this.supabase.getAdminClient();
    const hoy = new Date().toISOString().split('T')[0];
    const primerDiaMes = new Date();
    primerDiaMes.setDate(1);

    // Verificar límite diario
    if (smsConfig.limites.max_por_dia) {
      const { count: usadoHoy } = await client
        .from('sms_enviados')
        .select('*', { count: 'exact', head: true })
        .eq('id_tienda', tiendaId)
        .gte('enviado_en', hoy);

      if (usadoHoy >= smsConfig.limites.max_por_dia) {
        throw new BadRequestException(
          `Límite diario alcanzado (${smsConfig.limites.max_por_dia} SMS)`,
        );
      }
    }

    // Verificar límite mensual
    if (smsConfig.limites.max_por_mes) {
      const { count: usadoMes } = await client
        .from('sms_enviados')
        .select('*', { count: 'exact', head: true })
        .eq('id_tienda', tiendaId)
        .gte('enviado_en', primerDiaMes.toISOString());

      if (usadoMes >= smsConfig.limites.max_por_mes) {
        throw new BadRequestException(
          `Límite mensual alcanzado (${smsConfig.limites.max_por_mes} SMS)`,
        );
      }
    }
  }

  /**
   * Registra el uso de SMS para estadísticas
   */
  private async registrarUso(tiendaId: string, cantidad: number, coste: number) {
    const client = this.supabase.getAdminClient();

    await client.from('sms_enviados').insert({
      id_tienda: tiendaId,
      cantidad: cantidad,
      coste: coste,
      modo: 'global',
      enviado_en: new Date().toISOString(),
    });
  }

  /**
   * Descuenta un crédito prepagado
   */
  private async descontarCredito(tiendaId: string) {
    const client = this.supabase.getAdminClient();

    // Usar SQL para decrementar atómicamente
    await client.rpc('descontar_credito_sms', {
      p_tienda_id: tiendaId,
    });
  }

  /**
   * Calcula el coste estimado según la longitud del mensaje
   */
  private calcularCoste(mensaje: string): number {
    // SMS estándar: 160 caracteres
    // Caracteres especiales (emojis) cuentan como más
    const segmentos = Math.ceil(mensaje.length / 160);
    const costePorSegmento = 0.075; // Precio España aproximado
    return Number((segmentos * costePorSegmento).toFixed(3));
  }

  /**
   * Obtiene estadísticas de uso de SMS de una tienda
   */
  async getEstadisticas(tiendaId: string) {
    const client = this.supabase.getAdminClient();
    const hoy = new Date().toISOString().split('T')[0];
    const primerDiaMes = new Date();
    primerDiaMes.setDate(1);

    // Uso de hoy
    const { data: usadoHoy } = await client
      .from('sms_enviados')
      .select('cantidad, coste')
      .eq('id_tienda', tiendaId)
      .gte('enviado_en', hoy);

    // Uso del mes
    const { data: usadoMes } = await client
      .from('sms_enviados')
      .select('cantidad, coste')
      .eq('id_tienda', tiendaId)
      .gte('enviado_en', primerDiaMes.toISOString());

    // Obtener configuración
    const { data: tienda } = await client
      .from('tiendas')
      .select('configuracion')
      .eq('id', tiendaId)
      .single();

    const smsConfig = tienda?.configuracion?.sms || {};

    const totalHoy = usadoHoy?.reduce((sum, r) => sum + (r.cantidad || 0), 0) || 0;
    const costeHoy = usadoHoy?.reduce((sum, r) => sum + (r.coste || 0), 0) || 0;
    const totalMes = usadoMes?.reduce((sum, r) => sum + (r.cantidad || 0), 0) || 0;
    const costeMes = usadoMes?.reduce((sum, r) => sum + (r.coste || 0), 0) || 0;

    return {
      modo: smsConfig.modo || 'global',
      hoy: {
        sms_enviados: totalHoy,
        coste_total: `${costeHoy.toFixed(2)}€`,
        restante: smsConfig.limites?.max_por_dia
          ? smsConfig.limites.max_por_dia - totalHoy
          : null,
      },
      mes_actual: {
        sms_enviados: totalMes,
        coste_total: `${costeMes.toFixed(2)}€`,
        coste_promedio: totalMes > 0 ? `${(costeMes / totalMes).toFixed(3)}€` : '0€',
        restante: smsConfig.limites?.max_por_mes
          ? smsConfig.limites.max_por_mes - totalMes
          : null,
      },
      creditos_disponibles: smsConfig.creditos_disponibles || null,
      limites: smsConfig.limites || null,
    };
  }

  /**
   * Valida credenciales de Twilio haciendo una llamada de prueba
   */
  async validarCredenciales(credenciales: {
    account_sid: string;
    auth_token: string;
    phone_number?: string;
    sender_id?: string;
  }): Promise<{ valid: boolean; error?: string }> {
    try {
      const testClient = twilio(credenciales.account_sid, credenciales.auth_token);

      // Si usa número de teléfono, verificar que existe
      if (credenciales.phone_number) {
        await testClient.incomingPhoneNumbers.list({
          phoneNumber: credenciales.phone_number,
          limit: 1,
        });
      }

      // Si usa Sender ID, simplemente verificar que las credenciales funcionan
      // (No hay forma de validar Sender ID sin enviar SMS real)
      if (credenciales.sender_id && !credenciales.phone_number) {
        // Verificar que el Account SID y Auth Token son válidos
        await testClient.api.accounts(credenciales.account_sid).fetch();
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error.message,
      };
    }
  }

  /**
   * Procesa respuestas STOP de SMS (webhook de Twilio)
   * Cuando un cliente responde STOP, se da de baja automáticamente
   */
  async procesarStopSms(params: {
    From: string; // Número del cliente que responde
    Body: string; // Mensaje recibido
    MessageSid?: string;
  }): Promise<{ mensaje: string; procesado: boolean }> {
    console.log(`\n🛑 [SMS STOP] Respuesta recibida`);
    console.log(`  - Desde: ${params.From}`);
    console.log(`  - Mensaje: ${params.Body}`);

    // Normalizar teléfono a formato E.164
    let telefono = params.From;
    if (!telefono.startsWith('+')) {
      telefono = '+' + telefono;
    }

    // Verificar si el mensaje es STOP, UNSUBSCRIBE, CANCEL, END, QUIT
    const mensajeNormalizado = params.Body.trim().toUpperCase();
    const palabrasStop = ['STOP', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT', 'BAJA', 'CANCELAR'];

    if (!palabrasStop.includes(mensajeNormalizado)) {
      console.log(`  ℹ️  No es un mensaje STOP, ignorando`);
      return { mensaje: 'No es un mensaje de baja', procesado: false };
    }

    console.log(`  ✅ Detectado mensaje de baja: ${mensajeNormalizado}`);

    // Buscar cliente por teléfono
    const supabase = this.supabase.getAdminClient();

    const { data: clientes, error } = await supabase
      .from('clientes')
      .select('id, nombre, email, id_tienda, acepta_marketing_sms')
      .eq('telefono', telefono);

    if (error || !clientes || clientes.length === 0) {
      console.log(`  ⚠️  Cliente no encontrado con teléfono ${telefono}`);
      return { mensaje: 'Cliente no encontrado', procesado: false };
    }

    // Si hay múltiples clientes con el mismo teléfono (multi-tenant), dar de baja a todos
    console.log(`  - Encontrados ${clientes.length} cliente(s) con ese teléfono`);

    let procesados = 0;

    for (const cliente of clientes) {
      // Si ya está dado de baja, saltarlo
      if (cliente.acepta_marketing_sms === false) {
        console.log(`  ℹ️  Cliente ${cliente.nombre} ya estaba dado de baja`);
        continue;
      }

      // Actualizar preferencia de SMS
      const { error: updateError } = await supabase
        .from('clientes')
        .update({
          acepta_marketing_sms: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', cliente.id);

      if (updateError) {
        console.error(`  ❌ Error actualizando cliente ${cliente.id}:`, updateError);
        continue;
      }

      // Registrar en log de opt-out
      await supabase.from('sms_opt_out_log').insert({
        id_cliente: cliente.id,
        id_tienda: cliente.id_tienda,
        telefono: telefono,
        mensaje_recibido: params.Body,
        fecha_opt_out: new Date().toISOString(),
      });

      console.log(`  ✅ Cliente dado de baja: ${cliente.nombre} (${cliente.email})`);
      procesados++;

      // Opcional: Enviar SMS de confirmación
      try {
        const { data: tienda } = await supabase
          .from('tiendas')
          .select('nombre')
          .eq('id', cliente.id_tienda)
          .single();

        const mensajeConfirmacion = `Has sido dado de baja de SMS de ${tienda?.nombre || 'nuestro programa'}. Ya no recibirás más mensajes promocionales.`;

        // Enviar confirmación (usando el mismo servicio)
        await this.sendSms({
          tiendaId: cliente.id_tienda,
          to: telefono,
          message: mensajeConfirmacion,
        });

        console.log(`  📱 SMS de confirmación enviado`);
      } catch (smsError) {
        console.error(`  ⚠️  Error enviando SMS de confirmación:`, smsError.message);
        // No lanzar error - la baja ya se procesó
      }
    }

    console.log(`  ✅ Total procesados: ${procesados} cliente(s)`);

    return {
      mensaje: `Se dieron de baja ${procesados} cliente(s) exitosamente`,
      procesado: procesados > 0,
    };
  }
}
