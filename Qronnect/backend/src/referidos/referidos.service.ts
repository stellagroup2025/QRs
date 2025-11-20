import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import { CrearProgramaReferidosDto } from './dto/crear-programa-referidos.dto';
import { RegistrarReferidoDto } from './dto/registrar-referido.dto';

@Injectable()
export class ReferidosService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Crea un programa de referidos para una tienda
   */
  async crearPrograma(tiendaId: string, dto: CrearProgramaReferidosDto) {
    const client = this.supabase.getAdminClient();

    const { data, error } = await client
      .from('programas_referidos')
      .insert({
        id_tienda: tiendaId,
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        activo: dto.activo !== false,
        puntos_por_referido: dto.puntos_por_referido,
        recompensas: dto.recompensas || [],
        vigencia_desde: dto.vigencia_desde || new Date().toISOString(),
        vigencia_hasta: dto.vigencia_hasta,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creando programa de referidos:', error);
      throw new BadRequestException('Error al crear programa de referidos');
    }

    return data;
  }

  /**
   * Obtiene el programa de referidos activo de una tienda
   */
  async getProgramaActivo(tiendaId: string) {
    const client = this.supabase.getAdminClient();

    const { data, error } = await client
      .from('programas_referidos')
      .select('*')
      .eq('id_tienda', tiendaId)
      .eq('activo', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      console.error('Error obteniendo programa:', error);
      throw new BadRequestException('Error al obtener programa de referidos');
    }

    return data || null;
  }

  /**
   * Actualiza el programa de referidos
   */
  async actualizarPrograma(tiendaId: string, programaId: string, dto: Partial<CrearProgramaReferidosDto>) {
    const client = this.supabase.getAdminClient();

    const { data, error } = await client
      .from('programas_referidos')
      .update({
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        activo: dto.activo,
        puntos_por_referido: dto.puntos_por_referido,
        recompensas: dto.recompensas,
        vigencia_hasta: dto.vigencia_hasta,
      })
      .eq('id', programaId)
      .eq('id_tienda', tiendaId)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando programa:', error);
      throw new BadRequestException('Error al actualizar programa de referidos');
    }

    return data;
  }

  /**
   * Registra un nuevo referido
   */
  async registrarReferido(tiendaId: string, dto: RegistrarReferidoDto) {
    const client = this.supabase.getAdminClient();

    const { data, error } = await client.rpc('registrar_referido', {
      p_codigo_referido: dto.codigo_referido,
      p_nuevo_cliente_id: dto.nuevo_cliente_id,
      p_tienda_id: tiendaId,
    });

    if (error) {
      console.error('Error registrando referido:', error);
      throw new BadRequestException('Error al registrar referido');
    }

    if (!data.success) {
      throw new BadRequestException(data.message || 'No se pudo registrar el referido');
    }

    return data;
  }

  /**
   * Genera un código de referido único
   */
  private generarCodigoReferido(nombre: string): string {
    // Tomar las primeras letras del nombre (sin espacios)
    const nombreLimpio = nombre.toUpperCase().replace(/\s+/g, '');
    const prefijo = nombreLimpio.substring(0, Math.min(4, nombreLimpio.length));

    // Generar sufijo aleatorio
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let sufijo = '';
    for (let i = 0; i < 4; i++) {
      sufijo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }

    return `${prefijo}-${sufijo}`;
  }

  /**
   * Obtiene el código de referido personal de un cliente
   */
  async getCodigoPersonal(tiendaId: string, clienteId: string) {
    const client = this.supabase.getAdminClient();

    console.log('🔍 getCodigoPersonal llamado con:', { tiendaId, clienteId });

    // Obtener datos del cliente Y la tienda
    const { data: clienteData, error: clienteError } = await client
      .from('clientes')
      .select('id, nombre, codigo_referido_personal, total_referidos, id_tienda')
      .eq('id', clienteId)
      .eq('id_tienda', tiendaId)
      .single();

    console.log('📊 Resultado de búsqueda cliente:', { clienteData, clienteError });

    if (clienteError) {
      console.error('❌ Error obteniendo código:', clienteError);
      throw new NotFoundException('Cliente no encontrado');
    }

    // Si no tiene código de referido, generar uno
    let codigoReferido = clienteData.codigo_referido_personal;
    if (!codigoReferido) {
      codigoReferido = this.generarCodigoReferido(clienteData.nombre);

      // Actualizar el cliente con el nuevo código
      const { error: updateError } = await client
        .from('clientes')
        .update({ codigo_referido_personal: codigoReferido })
        .eq('id', clienteId);

      if (updateError) {
        console.error('Error actualizando código:', updateError);
        // Si hay error (ej: código duplicado), intentar con otro
        codigoReferido = this.generarCodigoReferido(clienteData.nombre);
        await client
          .from('clientes')
          .update({ codigo_referido_personal: codigoReferido })
          .eq('id', clienteId);
      }
    }

    // Obtener dominio de la tienda
    const { data: tiendaData, error: tiendaError } = await client
      .from('tiendas')
      .select('dominio, nombre')
      .eq('id', tiendaId)
      .single();

    if (tiendaError) {
      console.error('Error obteniendo tienda:', tiendaError);
      throw new NotFoundException('Tienda no encontrada');
    }

    // Generar URL de referido con subdominio de la tienda
    // Detectar entorno: desarrollo vs producción
    const nodeEnv = this.configService.get('NODE_ENV');
    const isDevelopment = nodeEnv === 'development';

    let url: string;
    if (isDevelopment) {
      // En desarrollo: usar localhost con puerto
      const frontendPort = this.configService.get('FRONTEND_PORT') || '3000';
      url = `http://${tiendaData.dominio}.localhost:${frontendPort}/registro?ref=${codigoReferido}`;
    } else {
      // En producción: usar dominio real
      const baseDomain = this.configService.get('BASE_DOMAIN') || 'qronnect.es';
      url = `https://${tiendaData.dominio}.${baseDomain}/registro?ref=${codigoReferido}`;
    }

    return {
      codigo: codigoReferido,
      url,
      nombre: clienteData.nombre,
      nombre_tienda: tiendaData.nombre,
      total_referidos: clienteData.total_referidos || 0,
    };
  }

  /**
   * Obtiene la lista de referidos de un cliente
   */
  async getMisReferidos(tiendaId: string, clienteId: string) {
    const client = this.supabase.getAdminClient();

    const { data, error } = await client
      .from('vista_referidos_dashboard')
      .select('*')
      .eq('id_tienda', tiendaId)
      .eq('referidor_id', clienteId)
      .order('creado_en', { ascending: false });

    if (error) {
      console.error('Error obteniendo referidos:', error);
      throw new BadRequestException('Error al obtener referidos');
    }

    return data || [];
  }

  /**
   * Obtiene el progreso de referidos de un cliente
   */
  async getProgreso(tiendaId: string, clienteId: string) {
    const client = this.supabase.getAdminClient();

    const { data, error } = await client.rpc('progreso_referidos_cliente', {
      p_cliente_id: clienteId,
      p_tienda_id: tiendaId,
    });

    if (error) {
      console.error('Error obteniendo progreso:', error);
      throw new BadRequestException('Error al obtener progreso');
    }

    return data;
  }

  /**
   * Obtiene estadísticas de referidos para una tienda
   */
  async getEstadisticas(tiendaId: string) {
    const client = this.supabase.getAdminClient();

    const { data, error } = await client.rpc('estadisticas_referidos', {
      p_tienda_id: tiendaId,
    });

    if (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw new BadRequestException('Error al obtener estadísticas');
    }

    return data;
  }

  /**
   * Lista todos los referidos de una tienda
   */
  async listarReferidos(tiendaId: string, limit: number = 50, offset: number = 0) {
    const client = this.supabase.getAdminClient();

    const { data, error, count } = await client
      .from('vista_referidos_dashboard')
      .select('*', { count: 'exact' })
      .eq('id_tienda', tiendaId)
      .order('creado_en', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error listando referidos:', error);
      throw new BadRequestException('Error al listar referidos');
    }

    return {
      referidos: data || [],
      total: count || 0,
      limit,
      offset,
    };
  }
}
