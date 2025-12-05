import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { ConfigurarGachaDto } from './dto/configurar-gacha.dto';
import { CrearPremioGachaDto } from './dto/crear-premio-gacha.dto';
import { ActualizarPremioGachaDto } from './dto/actualizar-premio-gacha.dto';
import { CanjearPremioGachaDto } from './dto/canjear-premio-gacha.dto';

@Injectable()
export class GachaService {
  constructor(private readonly supabaseService: SupabaseService) {}

  // ===================================
  // CONFIGURACIÓN
  // ===================================

  async obtenerConfiguracion(idTienda: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('gacha_config')
      .select('*')
      .eq('id_tienda', idTienda)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      throw new BadRequestException('Error al obtener configuración del gacha');
    }

    return data;
  }

  async configurarGacha(idTienda: string, dto: ConfigurarGachaDto) {
    const supabase = this.supabaseService.getAdminClient();

    // Verificar si ya existe configuración
    const { data: existente } = await supabase
      .from('gacha_config')
      .select('id')
      .eq('id_tienda', idTienda)
      .single();

    if (existente) {
      // Actualizar
      const { data, error } = await supabase
        .from('gacha_config')
        .update({
          ...dto,
          actualizado_en: new Date().toISOString(),
        })
        .eq('id_tienda', idTienda)
        .select()
        .single();

      if (error) {
        console.error('Error actualizando configuración gacha:', error);
        throw new BadRequestException('Error al actualizar configuración del gacha');
      }

      return data;
    } else {
      // Crear nueva configuración
      const { data, error } = await supabase
        .from('gacha_config')
        .insert({
          id_tienda: idTienda,
          ...dto,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creando configuración gacha:', error);
        throw new BadRequestException('Error al crear configuración del gacha');
      }

      // Obtener sector de la tienda
      const { data: tienda } = await supabase
        .from('tiendas')
        .select('sector')
        .eq('id', idTienda)
        .single();

      // Insertar premios por defecto según el sector
      await supabase.rpc('insertar_premios_gacha_defecto', {
        p_id_tienda: idTienda,
        p_sector: tienda?.sector || 'general',
      });

      return data;
    }
  }

  // ===================================
  // PREMIOS (ADMIN)
  // ===================================

  async obtenerPremios(idTienda: string, soloActivos: boolean = false) {
    const supabase = this.supabaseService.getAdminClient();

    let query = supabase
      .from('gacha_premios')
      .select('*')
      .eq('id_tienda', idTienda)
      .order('rareza', { ascending: false })
      .order('peso', { ascending: false });

    if (soloActivos) {
      query = query.eq('activo', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error obteniendo premios gacha:', error);
      throw new BadRequestException('Error al obtener premios del gacha');
    }

    return data || [];
  }

  async crearPremio(idTienda: string, dto: CrearPremioGachaDto) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('gacha_premios')
      .insert({
        id_tienda: idTienda,
        ...dto,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creando premio gacha:', error);
      throw new BadRequestException('Error al crear premio del gacha');
    }

    return data;
  }

  async actualizarPremio(idPremio: string, idTienda: string, dto: ActualizarPremioGachaDto) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error} = await supabase
      .from('gacha_premios')
      .update({
        ...dto,
        actualizado_en: new Date().toISOString(),
      })
      .eq('id', idPremio)
      .eq('id_tienda', idTienda)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando premio gacha:', error);
      throw new BadRequestException('Error al actualizar premio del gacha');
    }

    if (!data) {
      throw new NotFoundException('Premio no encontrado');
    }

    return data;
  }

  async eliminarPremio(idPremio: string, idTienda: string) {
    const supabase = this.supabaseService.getAdminClient();

    // Soft delete: marcar como inactivo
    const { error } = await supabase
      .from('gacha_premios')
      .update({ activo: false, actualizado_en: new Date().toISOString() })
      .eq('id', idPremio)
      .eq('id_tienda', idTienda);

    if (error) {
      console.error('Error eliminando premio gacha:', error);
      throw new BadRequestException('Error al eliminar premio del gacha');
    }
  }

  async insertarPremiosPredefinidos(idTienda: string) {
    const supabase = this.supabaseService.getAdminClient();

    // Obtener sector de la tienda
    const { data: tienda } = await supabase
      .from('tiendas')
      .select('sector')
      .eq('id', idTienda)
      .single();

    // Insertar premios predefinidos según el sector
    const { error } = await supabase.rpc('insertar_premios_gacha_defecto', {
      p_id_tienda: idTienda,
      p_sector: tienda?.sector || 'general',
    });

    if (error) {
      console.error('Error insertando premios predefinidos:', error);
      throw new BadRequestException('Error al insertar premios predefinidos');
    }

    // Retornar los premios recién insertados
    return this.obtenerPremios(idTienda);
  }

  // ===================================
  // JUGAR GACHA (CLIENTE)
  // ===================================

  async realizarTirada(idTienda: string, idCliente: string) {
    const supabase = this.supabaseService.getAdminClient();

    try {
      const { data, error } = await supabase.rpc('realizar_tirada_gacha', {
        p_id_tienda: idTienda,
        p_id_cliente: idCliente,
      });

      if (error) {
        console.error('Error realizando tirada gacha:', error);
        throw new BadRequestException(error.message || 'Error al realizar tirada del gacha');
      }

      if (!data || data.length === 0) {
        throw new BadRequestException('No se pudo obtener premio');
      }

      return data[0];
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Excepción realizando tirada gacha:', error);
      throw new BadRequestException(error.message || 'Error al realizar tirada del gacha');
    }
  }

  async obtenerMisPremios(idCliente: string, idTienda: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('gacha_historial')
      .select(`
        id,
        puntos_gastados,
        fecha_tirada,
        estado,
        codigo_canje,
        fecha_expiracion,
        fecha_canjeado,
        gacha_premios!inner (
          nombre,
          descripcion,
          tipo,
          valor,
          rareza,
          color_rareza,
          condiciones,
          imagen_url
        )
      `)
      .eq('id_cliente', idCliente)
      .eq('id_tienda', idTienda)
      .order('fecha_tirada', { ascending: false });

    if (error) {
      console.error('Error obteniendo premios del cliente:', error);
      throw new BadRequestException('Error al obtener tus premios');
    }

    return data || [];
  }

  async verificarPuntosSuficientes(idCliente: string, idTienda: string): Promise<{
    puntos_actuales: number;
    costo_gacha: number;
    puede_jugar: boolean;
  }> {
    const supabase = this.supabaseService.getAdminClient();

    // Obtener puntos del cliente
    const { data: cliente } = await supabase
      .from('clientes')
      .select('puntos_totales')
      .eq('id', idCliente)
      .eq('id_tienda', idTienda)
      .single();

    // Obtener costo del gacha
    const { data: config } = await supabase
      .from('gacha_config')
      .select('costo_puntos')
      .eq('id_tienda', idTienda)
      .single();

    const puntos = cliente?.puntos_totales || 0;
    const costo = config?.costo_puntos || 50;

    return {
      puntos_actuales: puntos,
      costo_gacha: costo,
      puede_jugar: puntos >= costo,
    };
  }

  // ===================================
  // CANJEAR PREMIOS (STAFF)
  // ===================================

  async canjearPremio(idTienda: string, idUsuarioStaff: string | null, dto: CanjearPremioGachaDto) {
    const supabase = this.supabaseService.getAdminClient();

    // Buscar el premio por código
    const { data: premio, error: errorBusqueda } = await supabase
      .from('gacha_historial')
      .select(`
        id,
        id_cliente,
        estado,
        fecha_expiracion,
        gacha_premios!inner (
          nombre,
          descripcion,
          tipo,
          valor
        ),
        clientes!inner (
          nombre,
          email
        )
      `)
      .eq('codigo_canje', dto.codigo_canje.toUpperCase())
      .eq('id_tienda', idTienda)
      .single();

    if (errorBusqueda || !premio) {
      throw new NotFoundException('Código de premio no válido');
    }

    // Verificar estado
    if (premio.estado !== 'pendiente') {
      throw new BadRequestException(`Este premio ya fue ${premio.estado}`);
    }

    // Verificar expiración
    if (premio.fecha_expiracion && new Date(premio.fecha_expiracion) < new Date()) {
      // Marcar como expirado
      await supabase
        .from('gacha_historial')
        .update({ estado: 'expirado' })
        .eq('codigo_canje', dto.codigo_canje.toUpperCase());

      throw new BadRequestException('Este premio ha expirado');
    }

    // Canjear premio
    const { data, error } = await supabase
      .from('gacha_historial')
      .update({
        estado: 'canjeado',
        fecha_canjeado: new Date().toISOString(),
        canjeado_por: idUsuarioStaff,
      })
      .eq('codigo_canje', dto.codigo_canje.toUpperCase())
      .eq('id_tienda', idTienda)
      .select()
      .single();

    if (error) {
      console.error('Error canjeando premio gacha:', error);
      throw new BadRequestException('Error al canjear premio');
    }

    return {
      ...data,
      premio_info: premio.gacha_premios,
      cliente_info: premio.clientes,
    };
  }

  async verificarCodigo(codigo: string, idTienda: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('gacha_historial')
      .select(`
        id,
        estado,
        fecha_expiracion,
        codigo_canje,
        gacha_premios!inner (
          nombre,
          descripcion,
          tipo,
          valor,
          rareza,
          condiciones
        ),
        clientes!inner (
          nombre,
          email,
          telefono
        )
      `)
      .eq('codigo_canje', codigo.toUpperCase())
      .eq('id_tienda', idTienda)
      .single();

    if (error || !data) {
      throw new NotFoundException('Código de premio no válido');
    }

    const estaExpirado = data.fecha_expiracion && new Date(data.fecha_expiracion) < new Date();

    return {
      ...data,
      expirado: estaExpirado,
      puede_canjear: data.estado === 'pendiente' && !estaExpirado,
    };
  }

  // ===================================
  // ESTADÍSTICAS (ADMIN)
  // ===================================

  async obtenerEstadisticas(idTienda: string) {
    const supabase = this.supabaseService.getAdminClient();

    // Total de tiradas
    const { count: totalTiradas } = await supabase
      .from('gacha_historial')
      .select('*', { count: 'exact', head: true })
      .eq('id_tienda', idTienda);

    // Puntos gastados
    const { data: puntosData } = await supabase
      .from('gacha_historial')
      .select('puntos_gastados')
      .eq('id_tienda', idTienda);

    const totalPuntosGastados = puntosData?.reduce((sum, item) => sum + item.puntos_gastados, 0) || 0;

    // Premios canjeados vs pendientes
    const { count: canjeados } = await supabase
      .from('gacha_historial')
      .select('*', { count: 'exact', head: true })
      .eq('id_tienda', idTienda)
      .eq('estado', 'canjeado');

    const { count: pendientes } = await supabase
      .from('gacha_historial')
      .select('*', { count: 'exact', head: true })
      .eq('id_tienda', idTienda)
      .eq('estado', 'pendiente');

    // Premios por rareza
    const { data: porRareza } = await supabase
      .from('gacha_historial')
      .select(`
        id,
        gacha_premios!inner (
          rareza
        )
      `)
      .eq('id_tienda', idTienda);

    const estadisticasRareza = {
      comun: 0,
      raro: 0,
      epico: 0,
      legendario: 0,
    };

    porRareza?.forEach((item: any) => {
      const rareza = item.gacha_premios.rareza;
      if (rareza in estadisticasRareza) {
        estadisticasRareza[rareza]++;
      }
    });

    return {
      total_tiradas: totalTiradas || 0,
      total_puntos_gastados: totalPuntosGastados,
      premios_canjeados: canjeados || 0,
      premios_pendientes: pendientes || 0,
      tasa_canje: totalTiradas ? ((canjeados || 0) / totalTiradas) * 100 : 0,
      por_rareza: estadisticasRareza,
    };
  }
}
