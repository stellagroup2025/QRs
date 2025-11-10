import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { QrResponseDto } from './dto/qr-response.dto';
import { nanoid } from 'nanoid';

@Injectable()
export class QrService {
  constructor(private supabaseService: SupabaseService) {}

  /**
   * Obtiene el código QR del cliente para una tienda específica
   * Si no existe, lo genera automáticamente con un código único
   *
   * MULTITENANCY: Un usuario puede tener un QR diferente por cada tienda
   */
  async getOrCreateQr(supabaseUserId: string, tenantId: string): Promise<QrResponseDto> {
    const supabase = this.supabaseService.getAdminClient();

    // Primero obtener el cliente de ESTA TIENDA
    const { data: cliente, error: clienteError } = await supabase
      .from('clientes')
      .select('id')
      .eq('supabase_user_id', supabaseUserId)
      .eq('id_tienda', tenantId) // ← Filtrar por tenant
      .single();

    if (clienteError || !cliente) {
      throw new NotFoundException(
        'Cliente no encontrado en esta tienda. Debe acceder primero a /clientes/me para crear su perfil.',
      );
    }

    // Intentar obtener el QR existente
    const { data: existingQr, error: fetchError } = await supabase
      .from('qr_clientes')
      .select('*')
      .eq('id_cliente', cliente.id)
      .eq('activo', true)
      .single();

    if (existingQr) {
      return {
        id: existingQr.id,
        codigo: existingQr.codigo,
        creado_en: existingQr.creado_en,
      };
    }

    // Si no existe, generar un nuevo código QR único
    const codigoQr = await this.generarCodigoUnico();

    const { data: newQr, error: createError } = await supabase
      .from('qr_clientes')
      .insert({
        id_cliente: cliente.id,
        codigo: codigoQr,
        activo: true,
      })
      .select()
      .single();

    if (createError || !newQr) {
      console.error('Error al crear código QR:', createError);
      throw new Error('No se pudo generar el código QR');
    }

    return {
      id: newQr.id,
      codigo: newQr.codigo,
      creado_en: newQr.creado_en,
    };
  }

  /**
   * Genera un código único para el QR
   * Verifica que no exista en la base de datos antes de devolverlo
   */
  private async generarCodigoUnico(): Promise<string> {
    const supabase = this.supabaseService.getAdminClient();
    let codigo: string;
    let exists = true;

    // Reintentar hasta generar un código único
    while (exists) {
      // Generar código alfanumérico de 16 caracteres
      codigo = nanoid(16);

      // Verificar si ya existe
      const { data } = await supabase
        .from('qr_clientes')
        .select('id')
        .eq('codigo', codigo)
        .single();

      exists = !!data;
    }

    return codigo;
  }

  /**
   * Busca un cliente por su código QR
   * Útil para el panel de admin cuando escanean un QR
   */
  async getClienteByQrCode(codigo: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data: qr, error } = await supabase
      .from('qr_clientes')
      .select(
        `
        id,
        codigo,
        activo,
        clientes (
          id,
          nombre,
          email,
          telefono,
          puntos_totales,
          fecha_registro,
          ultima_visita
        )
      `,
      )
      .eq('codigo', codigo)
      .eq('activo', true)
      .single();

    if (error || !qr) {
      throw new NotFoundException('Código QR no válido o inactivo');
    }

    return qr.clientes;
  }
}
